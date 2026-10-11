import fs from 'node:fs';
import path from 'node:path';
import {projects, sources} from '../content/profile.mjs';

const blogDirectory=path.resolve(import.meta.dirname,'../content/blog');
const posts=fs.existsSync(blogDirectory)?fs.readdirSync(blogDirectory).filter(file=>file.endsWith('.json')).map(file=>JSON.parse(fs.readFileSync(path.join(blogDirectory,file),'utf8'))):[];

const root=path.resolve(import.meta.dirname,'..');
const files=['index.html','es/index.html','sources/index.html','es/sources/index.html','about/index.html','flowsight-project/index.html','blog/index.html',...posts.map(post=>`blog/${post.slug}/index.html`)];
const errors=[];
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const ids=new Map(files.map(file=>[file,new Set([...read(file).matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]))]));
for(const file of files){
  const html=read(file);
  if([...html.matchAll(/<h1\b/g)].length!==1)errors.push(`${file}: expected one h1`);
  if(!html.includes('rel="canonical"'))errors.push(`${file}: missing canonical`);
  for(const match of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)){
    try{JSON.parse(match[1]);}catch{errors.push(`${file}: invalid JSON-LD`);}
  }
  for(const match of html.matchAll(/\b(?:href|src)="([^"]+)"/g)){
    const raw=match[1].replaceAll('&amp;','&');
    if(/^(https?:|mailto:)/.test(raw))continue;
    const resolved=new URL(raw,`https://mancasvel.github.io/${file.replace(/index\.html$/,'')}`);
    let target=decodeURIComponent(resolved.pathname).replace(/^\//,'');
    if(!target||target.endsWith('/'))target+='index.html';
    if(!fs.existsSync(path.join(root,target)))errors.push(`${file}: missing ${raw}`);
    else if(resolved.hash&&ids.has(target)&&!ids.get(target).has(resolved.hash.slice(1)))errors.push(`${file}: missing fragment ${raw}`);
  }
  if(!file.startsWith('about/')&&!file.startsWith('flowsight-project/')){
    if(/[—–]/.test(html))errors.push(`${file}: unexpected dash character in page copy`);
    if(!html.includes('hreflang="en"')||!html.includes('hreflang="es"'))errors.push(`${file}: missing language alternates`);
    for(const match of html.matchAll(/<img\b([^>]+)>/g)){
      if(!/\balt="[^"]+"/.test(match[1]))errors.push(`${file}: missing image description`);
      if(!/\bwidth="\d+"/.test(match[1])||!/\bheight="\d+"/.test(match[1]))errors.push(`${file}: image lacks intrinsic dimensions`);
    }
  }
}
for(const file of ['index.html','es/index.html']){
  const html=read(file);
  if([...html.matchAll(/class="archive-item"/g)].length!==projects.length)errors.push(`${file}: incomplete project collection`);
  for(const project of projects)if(!html.includes(project.name))errors.push(`${file}: project ${project.name} missing`);
}
for(const file of ['sources/index.html','es/sources/index.html']){
  if([...read(file).matchAll(/<article id=/g)].length!==sources.length)errors.push(`${file}: incomplete sources`);
}
const verificationFiles=fs.readdirSync(root).filter(file=>/^google[a-f0-9]+\.html$/.test(file));
if(!verificationFiles.includes('googlec7be60eff1b22c5a.html'))errors.push('Missing Google Search Console verification file');
for(const file of verificationFiles){
  if(read(file).trim()!==`google-site-verification: ${file}`)errors.push(`${file}: invalid Google Search Console verification content`);
}
if(errors.length){console.error(errors.join('\n'));process.exit(1);}
console.log(`Checked ${files.length} pages: local assets, routes and anchors, structured data, language alternates, ${projects.length} projects, ${posts.length} blog posts, ${sources.length} sources and ${verificationFiles.length} Google verification file(s).`);

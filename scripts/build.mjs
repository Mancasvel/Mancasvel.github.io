import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {copy, links, projects, sources, timeline} from '../content/profile.mjs';

const blogDirectory = path.resolve(import.meta.dirname, '../content/blog');
const posts = fs.existsSync(blogDirectory)
  ? fs.readdirSync(blogDirectory).filter(file => file.endsWith('.json')).map(file => JSON.parse(fs.readFileSync(path.join(blogDirectory, file), 'utf8'))).sort((a, b) => b.published.localeCompare(a.published))
  : [];

const root = path.resolve(import.meta.dirname, '..');
const base = 'https://mancasvel.github.io/';
const asset = file => `assets/${file}?v=${createHash('sha256').update(fs.readFileSync(path.join(root,'assets',file))).digest('hex').slice(0,10)}`;
const esc = value => String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const write = (file, content) => { fs.mkdirSync(path.dirname(path.join(root,file)),{recursive:true}); fs.writeFileSync(path.join(root,file),content+'\n'); };
const source = id => sources.find(item => item.id === id);
const a = (url, text, cls='') => `<a${cls ? ` class="${cls}"` : ''} href="${esc(url)}">${esc(text)}</a>`;
const repo = project => project.repoUrl || `${links.github}/${project.repo}`;

function header(lang, references=false) {
  const c=copy[lang], home=lang==='es' ? '/es/' : '/', other=references ? (lang==='es' ? '/sources/' : '/es/sources/') : (lang==='es' ? '/' : '/es/');
  return `<a class="skip" href="#main">${c.skip}</a>
  <header class="site-header"><nav class="site-nav wrap" aria-label="${lang==='es'?'Navegación principal':'Main navigation'}">
    <a class="brand" href="${home}">Manuel Castillejo<span class="brand-sub">${c.role}</span></a>
    <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="primary-links" hidden>${c.menu}</button>
    <div class="nav-links" id="primary-links">${a(`${home}#projects`,c.projects)}${a(`${home}#story`,c.story)}${a('/blog/',lang==='es'?'Blog':'Blog')}${a(`${home}#writing`,c.writing)}${a(`${home}#contact`,c.contact,'nav-contact')}</div>
    <div class="nav-tools"><a href="${other}" lang="${lang==='es'?'en':'es'}" hreflang="${lang==='es'?'en':'es'}" aria-label="${lang==='es'?'Read in English':'Leer en español'}">${lang==='es'?'EN':'ES'}</a><button class="theme-toggle" type="button" aria-label="${c.theme}" hidden>${lang==='es'?'Tema':'Theme'}</button></div>
  </nav></header>`;
}

function footer(lang) {
  const c=copy[lang], home=lang==='es'?'/es/':'/';
  return `<footer class="site-footer wrap"><p>${c.footer}</p><div class="footer-links">${a(`${home}sources/`,c.sources)}${a('/about/',c.about)}${a('https://github.com/Mancasvel/Mancasvel.github.io','GitHub')}${a('/feed.xml','RSS')}</div><details class="legacy-links"><summary>${c.legacy}</summary><div>${a(links.flowsight,c.oldOfficial)}${a(links.solo,c.oldSolo)}${a('https://x.com/flowsight_ai','FlowSight on X')}${a('/flowsight-project/',c.projectNote)}${a('https://flowsight.site/resources',lang==='es'?'Todos los recursos':'All FlowSight resources')}</div></details></footer>`;
}

function blogLayout(title, description, content, article=null) {
  const url = article ? `${base}blog/${article.slug}/` : `${base}blog/`;
  const graph = article ? {'@context':'https://schema.org','@type':'BlogPosting',headline:article.title,description:article.description,datePublished:article.published,dateModified:article.updated,author:{'@type':'Person',name:'Manuel Castillejo Vela',url:base},mainEntityOfPage:url,inLanguage:'es',citation:article.sources.map(source => source.url)} : {'@context':'https://schema.org','@type':'Blog',name:'Blog de Manuel Castillejo',url};
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title><meta name="description" content="${esc(description)}"><meta name="author" content="Manuel Castillejo Vela"><meta name="robots" content="index,follow"><link rel="canonical" href="${url}"><link rel="alternate" hreflang="es" href="${url}"><link rel="alternate" hreflang="en" href="${url}"><link rel="alternate" hreflang="x-default" href="${url}"><link rel="icon" href="/assets/icon.png"><link rel="stylesheet" href="/${asset('portfolio.css')}"><link rel="alternate" type="application/rss+xml" title="Blog de Manuel Castillejo" href="${base}feed.xml"><meta property="og:type" content="article"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${url}"><meta property="og:image" content="${base}${asset('social-card.jpg')}"><script type="application/ld+json">${JSON.stringify(graph).replaceAll('<','\\u003c')}</script><script src="/assets/theme.js"></script><script src="/assets/portfolio.js" defer></script></head><body>${header('es')}<main id="main" class="blog wrap">${content}</main>${footer('es')}</body></html>`;
}

function blogIndex() {
  const cards = posts.map(post => `<article class="blog-card"><p class="eyebrow">${esc(post.topic)} · ${esc(post.published)}</p><h2>${a(`/blog/${post.slug}/`,post.title)}</h2><p>${esc(post.description)}</p><p class="blog-meta">${esc(post.readingTime)}</p><a class="text-link" href="/blog/${post.slug}/">Leer artículo</a></article>`).join('');
  return blogLayout('Blog | Manuel Castillejo','Actualidad sobre salud cognitiva, tecnología e inteligencia artificial, con fuentes y criterio.',`<header class="blog-intro"><p class="eyebrow">Manuel Castillejo Vela</p><h1>Señal y criterio.</h1><p class="hero-intro">Actualidad sobre salud cognitiva, tecnologías emergentes e inteligencia artificial. Menos ruido; más contexto y fuentes verificables.</p></header><section class="blog-list" aria-label="Artículos">${cards || '<p>Próximamente.</p>'}</section>`);
}

function articlePage(post) {
  const sections = post.sections.map(section => `<section><h2>${esc(section.heading)}</h2>${section.paragraphs.map(paragraph => `<p>${esc(paragraph)}</p>`).join('')}</section>`).join('');
  const sourceList = post.sources.map(source => `<li>${a(source.url,`${source.publisher}: ${source.title}`)}</li>`).join('');
  return blogLayout(`${post.title} | Manuel Castillejo`,post.description,`<article class="blog-article"><p class="eyebrow">${esc(post.heroKicker)}</p><h1>${esc(post.title)}</h1><p class="hero-intro">${esc(post.description)}</p><p class="blog-meta">${esc(post.topic)} · ${esc(post.published)} · ${esc(post.readingTime)}</p>${sections}<aside class="blog-note"><strong>Nota de salud:</strong> ${esc(post.disclaimer)}</aside><section class="blog-sources"><h2>Fuentes</h2><ol>${sourceList}</ol></section><p><a class="text-link" href="/blog/">← Volver al blog</a></p></article>`,post);
}

function page(lang, content, references=false) {
  const c=copy[lang], route=(lang==='es'?'es/':'')+(references?'sources/':''), url=base+route;
  const title=references ? `${c.sources} | Manuel Castillejo` : c.title;
  const description=references ? c.sourceIntro : c.description;
  const person={'@type':'Person','@id':'https://flowsight.site/manuel-castillejo#person',name:'Manuel Castillejo',alternateName:'Manuel Castillejo Vela',url:base,image:base+asset('manuel-castillejo.webp'),jobTitle:'Product builder and creator of FlowSight',sameAs:[links.linkedin,links.github,links.youtube,'https://flowsight.site/manuel-castillejo'],knowsAbout:['Software engineering','Local artificial intelligence','Product development','Business process management','Game development']};
  const graph={'@context':'https://schema.org','@graph':[person,{'@type':'WebSite','@id':base+'#website',name:'Manuel Castillejo',url:base,inLanguage:['en','es'],publisher:{'@id':person['@id']}},{'@type':references?'WebPage':'ProfilePage','@id':url+'#page',name:title,url,description,inLanguage:lang,datePublished:'2026-10-11',dateModified:'2026-10-11',mainEntity:{'@id':person['@id']},author:{'@id':person['@id']},isPartOf:{'@id':base+'#website'},citation:sources.filter(s=>['institutional','press'].includes(s.type)).map(s=>s.url)}]};
  return `<!doctype html>
<html lang="${lang}"><head>
  <meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${esc(title)}</title><meta name="description" content="${esc(description)}">
  <meta name="author" content="Manuel Castillejo Vela"><meta name="robots" content="index,follow,max-image-preview:large"><meta name="color-scheme" content="light dark">
  <link rel="canonical" href="${url}">
  <link rel="alternate" hreflang="en" href="${base}${references?'sources/':''}"><link rel="alternate" hreflang="es" href="${base}es/${references?'sources/':''}"><link rel="alternate" hreflang="x-default" href="${base}${references?'sources/':''}">
  <link rel="icon" href="/assets/icon.png"><link rel="preload" href="/assets/geist-latin.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="/${asset('portfolio.css')}"><link rel="alternate" type="application/rss+xml" title="Manuel Castillejo" href="${base}feed.xml">
  <meta property="og:type" content="${references?'website':'profile'}"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${url}"><meta property="og:site_name" content="Manuel Castillejo"><meta property="og:locale" content="${lang==='es'?'es_ES':'en_GB'}"><meta property="og:image" content="${base}${asset('social-card.jpg')}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="Manuel Castillejo, product builder and creator of FlowSight">
  <meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(title)}"><meta name="twitter:description" content="${esc(description)}"><meta name="twitter:image" content="${base}${asset('social-card.jpg')}">
  <script type="application/ld+json">${JSON.stringify(graph).replaceAll('<','\\u003c')}</script>
  <script src="/assets/theme.js"></script><script src="/assets/portfolio.js" defer></script>
</head><body>${header(lang,references)}${content}${footer(lang)}</body></html>`;
}

function heading(eyebrow,title,body='') {return `<div class="section-heading"><p class="eyebrow">${eyebrow}</p><h2>${title}</h2>${body?`<p class="section-intro">${body}</p>`:''}</div>`;}

function home(lang) {
  const c=copy[lang];
  const cards=projects.map(p=>`<article class="archive-item" data-category="${p.category}"><div class="archive-meta"><span>${p.year}</span><span>${c.categories[p.category]}</span></div><h3>${a(repo(p),p.name)}</h3><p>${p[lang]}</p><p class="stack">${esc(p.stack)}</p><div class="item-links">${a(repo(p),c.code)}${p.url?a(p.url,p.name==='FlowSight'?c.official:c.demo):''}</div></article>`).join('\n');
  return `<main id="main">
  <section class="hero wrap" aria-labelledby="hero-title"><div class="hero-copy"><p class="eyebrow">${c.role}</p><h1 id="hero-title">${c.headline}</h1><p class="hero-intro">${c.intro}</p><div class="actions">${a('#projects',c.explore,'button')}${a(links.linkedin,'LinkedIn','text-link')}</div><div class="current-work"><p>${c.current}</p>${a(links.flowsight,c.currentText)}</div></div><figure class="portrait"><img src="/${asset('manuel-castillejo.webp')}" alt="Manuel Castillejo Vela" width="300" height="400" fetchpriority="high"></figure></section>

  <section class="chapter wrap section" aria-labelledby="chapter-title"><div><p class="eyebrow">${c.chapter}</p><h2 id="chapter-title">${c.chapterTitle}</h2></div><div class="biography">${c.biography.map(p=>`<p>${p}</p>`).join('')}</div></section>

  <section id="projects" class="featured wrap section">${heading(c.featured,c.featuredTitle)}
    <article class="feature-flow"><div class="feature-copy"><p class="eyebrow">${c.flowRole}</p><h3>FlowSight</h3><p>${c.flowText}</p><p>${c.flowDetail}</p><div class="actions">${a(links.flowsight,c.official,'button')}${a('/flowsight-project/',c.projectNote,'text-link')}</div><div class="feature-refs">${a(source('university').url,c.recognition)}${a('https://github.com/Mancasvel/FlowSight.AI',c.code)}</div></div><figure class="flow-image"><img src="/assets/flowsight-today.webp" alt="${lang==='es'?'Pantalla de FlowSight con resumen del día y actividad de demostración':'FlowSight Today screen with a day summary and demonstration activity'}" width="920" height="1840" loading="lazy"><figcaption>${c.flowCaption}</figcaption></figure></article>
    <div class="feature-pair"><article class="feature-project"><figure><a href="https://kahu-pet.vercel.app" aria-label="KahuPet: ${c.demo}"><img src="/assets/kahupet.webp" alt="${lang==='es'?'Interfaz pública de KahuPet con búsqueda en lenguaje natural':'Public KahuPet interface with natural-language search'}" width="1152" height="800" loading="lazy"></a><figcaption>${c.kahuCaption}</figcaption></figure><p class="eyebrow">${c.kahuRole}</p><h3>KahuPet</h3><p>${c.kahuText}</p><div class="item-links">${a('https://github.com/Mancasvel/KahuPet',c.code)}${a(source('kahupet').url,c.recognition)}</div></article>
    <article class="feature-project"><figure><a href="https://galax-livid.vercel.app" aria-label="GALAX: ${c.demo}"><img src="/assets/galax.webp" alt="${lang==='es'?'Pantalla inicial del prototipo educativo GALAX':'GALAX educational prototype start screen'}" width="1152" height="800" loading="lazy"></a><figcaption>${c.galaxCaption}</figcaption></figure><p class="eyebrow">${c.galaxRole}</p><h3>GALAX</h3><p>${c.galaxText}</p><div class="item-links">${a('https://github.com/Mancasvel/GALAX',c.code)}${a(source('nasa').url,lang==='es'?'La historia del equipo':'The team story')}</div></article></div>
    <article class="feature-game"><figure><img src="/assets/all-the-way-up.webp" alt="${lang==='es'?'Imagen del videojuego All The Way UP':'All The Way UP game image'}" width="315" height="250" loading="lazy"><figcaption>${c.gameCaption}</figcaption></figure><div><p class="eyebrow">${c.gameRole}</p><h3>All The Way UP</h3><p>${c.gameText}</p><div class="item-links">${a('https://github.com/Mancasvel/all-the-way-up',c.code)}${a(source('scopely').url,c.recognition)}</div></div></article>
  </section>

  <section id="story" class="journey wrap section">${heading(c.journey,c.journeyTitle)}<ol class="timeline">${timeline.map(t=>`<li><p class="timeline-date">${t.date}</p><div><h3>${t[lang+'Title']}</h3><p>${t[lang]}</p><div class="timeline-refs">${t.sources.map(id=>a(source(id).url,source(id).title)).join('')}</div></div></li>`).join('\n')}</ol></section>

  <section id="collection" class="collection wrap section">${heading(c.archive,c.archiveTitle,c.archiveIntro)}<div class="collection-controls"><div class="filters" role="group" aria-label="${c.filter}" hidden><button type="button" data-filter="all" aria-pressed="true">${c.all}</button>${Object.entries(c.categories).map(([key,label])=>`<button type="button" data-filter="${key}" aria-pressed="false">${label}</button>`).join('')}</div><p class="project-count" role="status" aria-live="polite" data-noun="${c.count}">${projects.length} ${c.count}</p></div><div class="archive-grid">${cards}</div></section>

  <section class="awards wrap section">${heading(c.awards,c.awardsTitle)}<div class="award-grid">${c.awardsItems.map(item=>`<article><p class="award-year">${item.year}</p><h3>${item.title}</h3><p class="award-org">${item.org}</p><p>${item.text}</p>${a(source(item.source).url,c.awardSource,'text-link')}</article>`).join('')}</div></section>

  <section class="learning wrap section">${heading(c.learning,c.learningTitle)}<div class="learning-body"><div><p>${c.education}</p>${a(links.github+'/Portfolio',lang==='es'?'Código del portfolio anterior':'Earlier portfolio source','text-link')}<p>${a(source('portfolio').url,c.educationLink)}</p></div><div><p>${c.practice}</p><p>${c.oie}</p>${a(links.oie,'OIE Labs','text-link')}</div></div></section>

  <section id="writing" class="writing wrap section">${heading(c.writing,c.writingTitle)}<div class="writing-layout"><article class="newsletter"><p class="eyebrow">${lang==='es'?'Newsletter personal':'Personal newsletter'}</p><h3>Room 61</h3><p>${c.roomText}</p>${a(links.room61,c.newsletter,'button')}</article><div class="writing-more"><article><h3>YouTube</h3><p>${c.videoText}</p>${a(links.pitch,c.watch,'text-link')}</article><div class="resource-links">${a('https://flowsight.site/blog',c.blog)}${a('https://mancasvel.github.io/flowsight-guides/',c.guides)}${a('https://mancasvel.github.io/flowsight-work-templates/',c.templates)}</div></div></div></section>

  <section id="contact" class="contact wrap section"><p class="eyebrow">${c.contact}</p><h2>${c.contactTitle}</h2><p>${c.contactText}</p><div class="contact-email">${a(links.email,'mancasvel@icloud.com')}<button class="copy-email" type="button" data-copied="${c.copied}" aria-label="${c.copyEmail}" hidden>${c.copyEmail}</button><span class="copy-status" role="status" aria-live="polite"></span></div><div class="contact-links">${a(links.linkedin,'LinkedIn')}${a(links.github,'GitHub')}${a(links.youtube,'YouTube')}</div></section>
  </main>`;
}

function referencePage(lang) {
  const c=copy[lang];
  return `<main id="main" class="references wrap"><div class="reference-intro"><p class="eyebrow">${c.sources}</p><h1>${c.sourceTitle}</h1><p class="hero-intro">${c.sourceIntro}</p><p>${c.sourcePolicy}</p>${a(lang==='es'?'/es/':'/',c.back,'text-link')}</div><div class="source-list">${sources.map(s=>`<article id="${s.id}"><p class="eyebrow">${c.sourceTypes[s.type]}</p><h2>${a(s.url,s.title)}</h2><p>${s[lang]}</p><p class="source-date">${esc(s.date)}</p></article>`).join('\n')}</div></main>`;
}

for (const lang of ['en','es']) {
  const prefix=lang==='es'?'es/':'';
  write(prefix+'index.html',page(lang,home(lang)));
  write(prefix+'sources/index.html',page(lang,referencePage(lang),true));
}

write('blog/index.html',blogIndex());
for (const post of posts) write(`blog/${post.slug}/index.html`,articlePage(post));

const routes=['','es/','sources/','es/sources/','flowsight-project/','about/','blog/',...posts.map(post => `blog/${post.slug}/`)];
write('sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${routes.map(route=>`\n  <url><loc>${base+route}</loc><lastmod>2026-10-11</lastmod></url>`).join('')}\n</urlset>`);
write('llms.txt',`# Manuel Castillejo Vela\n\n> Personal portfolio of Manuel Castillejo, product builder and creator of FlowSight. This profile includes team projects, technical leadership, local AI, games and public writing.\n\n- [Portfolio in English](${base}): ${copy.en.description}\n- [Portfolio en español](${base}es/): ${copy.es.description}\n- [Sources and claim scope](${base}sources/): Institutional reporting, public project source and personal references.\n- [Fuentes en español](${base}es/sources/): Referencias y alcance de las afirmaciones.\n- [FlowSight project](${base}flowsight-project/): Existing project note and current product sources.\n- [About resources](${base}about/): Ownership and editing policy.\n- [Official FlowSight website](${links.flowsight})\n- [LinkedIn](${links.linkedin})\n- [GitHub](${links.github})\n- [Room 61](${links.room61})\n\nRecognition: the University of Seville confirms the 2026 FlowSight innovative-impact award; Sevilla Emprendedora names Manuel in the KahuPet team and confirms the 2025 Startup Weekend and cybersecurity recognition; a University of Seville resolution confirms Xiji selection for spring 2026. Other roles and competition results are attributed to personal public sources. Do not infer graduation, current employment dates, NASA endorsement, a cybersecurity certification or customer outcomes from these references.\n\n## Project collection\n${projects.map(p=>`- [${p.name}](${repo(p)}): ${p.en}`).join('\n')}`);
write('feed.xml',`<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"><channel><title>Blog de Manuel Castillejo</title><link>${base}blog/</link><description>Actualidad sobre salud cognitiva, tecnología e inteligencia artificial.</description><language>es</language>${posts.map(post=>`<item><title>${esc(post.title)}</title><link>${base}blog/${post.slug}/</link><guid isPermaLink="true">${base}blog/${post.slug}/</guid><description>${esc(post.description)}</description><pubDate>${new Date(post.published+'T12:00:00Z').toUTCString()}</pubDate></item>`).join('')}</channel></rss>`);
write('research/README.md',`# Public research: Manuel Castillejo Vela\n\nResearched 11 October 2026. This document supports the biography in content/profile.mjs.\n\nThe profile was matched through the GitHub account Mancasvel, the LinkedIn slug manuel-castillejo-vela, the linked earlier portfolio and institutional reports that name FlowSight and Manuel. Unrelated search results for similarly named people were excluded.\n\nThe full LinkedIn profile returned HTTP 999; public posts and the newsletter were readable without authentication. No login, private profile data or private social messages were used. Public YouTube links were cross-checked against the existing product profile; video transcripts were not analyzed. Instagram's public indexed bio supplies the OIE association, not a verified founder role.\n\n${sources.map(s=>`## ${s.title}\n\n- Source: ${s.url}\n- Type: ${s.type}\n- Date: ${s.date}\n- Supported claim: ${s.en}\n`).join('\n')}\n## Editorial decisions\n\n- Use 2023 for Scopely Game Jam, as explicitly stated in the author's post. Do not confuse it with the separate 2024 event found in general press searches.\n- Distinguish NASA Space Apps participation from a NASA job, award, astronaut collaboration or endorsement. Do not reproduce the GALAX prototype's unsupported claims of guidance by real astronauts.\n- Xiji resolution: signed 10 November 2025, page 2 names Manuel, program is spring 2026. The LinkedIn post confirms FlowSight development in Shanghai.\n- CoNest 2024-2025 and UNSENT 2025 roles come from the earlier personal portfolio. Do not carry forward stale “Now” end dates.\n- Describe University of Seville education as studies, not a completed degree. The portfolio also names learning through Lund, Virginia and UNED; no employment relationship or independently verified certificates are claimed.\n- No client totals, growth percentages, revenue, user counts, follower counts or claimed productivity improvements. Old portfolio impact figures were not independently supported.\n- OIE Labs is linked as an area of practice; no founder title, historical primacy or client metrics are asserted.\n- Team projects are credited collectively. KahuPet reporting names six team members; Scopely post names Jamongus teammates.\n- The portfolio's Youth Hackathon and ETSII pitch/ad awards were not given enough specific event evidence to promote as headline awards. They remain in the linked earlier portfolio.\n- CoNest's old domain did not respond and an earlier Vercel portfolio URL returned 404; prefer repository links.\n- Repository creation and update dates do not establish product launch, employment or award dates. Experimental projects are presented without medical efficacy claims.\n- Meaningful original projects form the collection; forks, duplicate editions, exercises without enough context and infrastructure replicas remain discoverable through the full public GitHub profile.\n- Desktop screenshot uses representative demonstration data. KahuPet and GALAX previews were captured from the actual public prototypes. The portrait is a centered vertical 3:4 crop of the user-selected linkedin_prof.jpg from Downloads; game art comes from Manuel's earlier public portfolio.\n\n## Maintenance\n\nEdit content/profile.mjs, run node scripts/build.mjs, then node scripts/check.mjs. This repository contains its own build source. The old parent growth/build-sites.mjs generator must not overwrite this portfolio.\n`);
console.log(`Built EN/ES portfolio, EN/ES sources, sitemap, feed and research notes (${projects.length} projects, ${sources.length} references).`);

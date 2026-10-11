# Manuel Castillejo Vela

Personal portfolio: **https://mancasvel.github.io/**
Versión en español: **https://mancasvel.github.io/es/**

Product, engineering and the human side of work. The site brings together Manuel's trajectory, FlowSight, team projects, local AI experiments, games, professional systems and public writing. Recognition and biographical references link to their sources.

## Content

- Personal introduction and original portrait.
- Selected projects: FlowSight, KahuPet, GALAX and All The Way UP.
- A chronology from software engineering studies and game development to CoNest, AI projects, Xiji Incubator, FlowSight and Room 61.
- A filterable collection of 26 products, experiments and team projects.
- Recognition from the University of Seville, Startup Weekend Sevilla and INCIBE Emprende, plus personally documented competition results.
- Public references in English and Spanish, with claim scope recorded in [research/README.md](research/README.md).
- Existing `/about/` and `/flowsight-project/` resources remain available.

## Edit and preview

The production site is static HTML, CSS and a small amount of JavaScript. GitHub Pages serves the root of `main`. It has no framework, runtime dependencies, analytics or build service requirement. Content and links remain readable with JavaScript disabled; project filtering, theme selection, the mobile menu and email copying progressively enhance the page.

Edit the biography, translated copy, references and project collection in [content/profile.mjs](content/profile.mjs). Then use Node.js 20.11 or newer:

```sh
node scripts/build.mjs
node scripts/check.mjs
python -m http.server 3054 --bind 127.0.0.1
```

Open `http://127.0.0.1:3054/` or `http://127.0.0.1:3054/es/`. Commit the generated HTML, feed, sitemap and `llms.txt` together with the source. The generator is inside this repository; the earlier parent FlowSight growth generator must not overwrite it.

Visual styling lives in [assets/portfolio.css](assets/portfolio.css); the earlier resource pages retain [assets/style.css](assets/style.css). Theme selection follows the system unless the reader saves an explicit preference. Motion respects reduced-motion settings.

The sharing image can be recreated with `python scripts/social-card.py` on Windows with Pillow installed. Asset provenance is documented in [assets/README.md](assets/README.md). Original photos and project art retain their owners' rights; the Geist font has its included SIL Open Font License.

## Corrections

Open an issue identifying the page, claim and supporting public source. Repository dates are not employment dates, personal competition reports are not independently certified results, and studies are not presented as a verified completed degree. The site does not invent customer counts, commercial outcomes or productivity improvements.

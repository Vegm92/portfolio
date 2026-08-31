# Victor Granda — Portfolio

Portfolio of Victor Granda Mancebo — solutions and automation engineer in Barcelona.
Static site, no build step: plain HTML, CSS and ES modules, with project content driven
from `public/config.json`.

**Live:** [vegm92.github.io/portfolio](https://vegm92.github.io/portfolio/)

## Flagship project

**[Mise en Place](https://mise-place.com)** — AI delivery-note intelligence for
restaurants, in private beta. Solo-built and operated: SvelteKit 2 + Svelte 5,
PostgreSQL, Drizzle ORM, Auth.js, Gemini extraction, Stripe billing, pg-boss workers.
~55K lines, 44 tables, 248 test suites, 40 ADRs.
Source: [Vegm92/mise-en-place-sk](https://github.com/Vegm92/mise-en-place-sk).

It gets a dedicated case-study section on the site; everything else lives in the
carousel below it.

## Other projects

| Project | Type | Stack |
|---------|------|-------|
| [BYD Interactive Presentation](https://github.com/Vegm92/byd.git) | Client work | React, Vite, Tailwind, Swiper |
| [Reelforge](https://github.com/Vegm92/infographic-video-generator.git) | Automation | TypeScript, Remotion, Claude SDK |
| [Farmacia Granda](https://github.com/Vegm92/farmacia-granda-web-rework.git) | E-commerce | Next.js, React, Tailwind, Shadcn |
| [AutoAffiliate](https://github.com/Vegm92/AutoAffiliate.git) | Web app | React, TypeScript, Vite, Anthropic |

## Structure

```
index.html              markup — hero, featured case study, carousel, stack, about, contact
css/tokens.css          design tokens (colour, spacing, type, radius)
css/base.css            resets and background layers
css/styles.css          components
css/responsive.css      single 768px breakpoint; entry point that imports the rest
js/main.js              loads config.json; renders the featured project, carousel and stack
js/carousel.js          carousel component (keyboard, touch, looping)
js/agent.js             "Vic" chat widget → Cloudflare Worker
public/config.json      single source of truth for projects and stack
public/vic-context.md   knowledge base the agent worker is grounded on
public/screenshots/     project screenshots
tests/agent.spec.js     Playwright coverage for the agent widget
```

### Adding or changing a project

Edit `public/config.json`. Entries support:

- `_featured` — renders as the full case-study section instead of a carousel card.
  Uses the extra `tagline`, `status`, `role`, `highlights`, `metrics` and `gallery`
  fields; only one project should set it.
- `_hidden` — kept in the file but not rendered anywhere.
- `demo` / `demoLabel` — adds the live-site button.

## Local development

```bash
npm install
npm run dev        # live-server on :3000
npm test           # Playwright — needs a server on :3000
```

## Deployment

Push to `main`; GitHub Pages serves the repository root.

## Contact

- Email: victorgranda1992@gmail.com
- GitHub: [Vegm92](https://github.com/Vegm92)
- LinkedIn: [victor-granda](https://www.linkedin.com/in/victor-granda/)

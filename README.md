# CHAIC 2026 — Caribbean Health AI Congress

Official website for the **Caribbean Health AI Congress 2026** — September 25–26, 2026, at the Centro de Convenciones de Puerto Rico in San Juan, where clinicians, researchers, and AI leaders shape the future of healthcare.

**Live site:** https://l-velazquez.com/CHAIC/

## About this project

I built and maintain this site, in collaboration with the **Advanced Medical Research Center (AMRC)**, the organization behind the congress. I own it end to end: design direction, front-end implementation, content structure, and the ongoing updates that come with running a real event site.

Some of what I designed and shipped here:

- **Multi-page site** — landing page, speakers, tickets, and workshops, all sharing one visual language.
- **Design system** — a documented token set for color, type, spacing, and elevation ([`docs/design-system.md`](docs/design-system.md)) so every new section stays consistent.
- **Interactive agenda** — day tabs that compute session stats (talks, keynotes, hours) from the DOM instead of hardcoded numbers.
- **Live countdown** to the opening day, plus an **early-bird promotion system** that flips pricing, badges, and CTAs sitewide from a single deadline constant — with regular pricing as the safe HTML default.
- **Motion system** — cross-document View Transitions for page navigation and scroll-triggered reveals, both fully gated behind `prefers-reduced-motion`.
- **Responsive & mobile-first** — mobile nav, sticky CTAs, and marquee rails for sponsors and speakers.
- **Performance & SEO** — WebP images through an optimization script ([`scripts/optimize-images.sh`](scripts/optimize-images.sh)), favicon/PWA manifest set, and GTM + GA4 analytics.
- **Privacy & consent** — a written privacy notice plus geo-gated Google Consent Mode v2, so analytics and advertising tags stay blocked for EEA/UK/Swiss visitors until they opt in. The reasoning and the required Tag Manager setup are recorded in [`docs/privacy-and-consent.md`](docs/privacy-and-consent.md).

## Stack

Vanilla HTML, CSS, and JavaScript. No framework, no build step — intentionally, so the site stays fast, easy to deploy on GitHub Pages, and simple for anyone to pick up and edit.

## Running locally

No dependencies. Open `index.html` directly, or serve the folder:

```bash
python3 -m http.server 8000
# → http://localhost:8000
```

## Structure

```
index.html        Landing page (hero, about, agenda, speakers, sponsors, tickets)
speakers.html     Full speaker roster
tickets.html      Pricing and registration
workshops.html    Pre-congress workshops
privacy.html      Privacy notice and cookie inventory
styles.css        All styles, driven by design tokens
script.js         Countdown, agenda tabs, nav, reveals, page transitions
promotion.js      Early-bird promotion state (loads in <head>)
consent.js        Consent Mode v2 defaults + consent banner (loads in <head>)
docs/             Design system and privacy/consent documentation
images/           Logos, speaker photos, videos, icons
scripts/          Image optimization tooling
```

## Credits

Site design and development by [Luis Velázquez](https://github.com/l-velazquez) · Congress organized by the Advanced Medical Research Center (AMRC).

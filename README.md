# CHAIC 2026 website

This repository builds the bilingual CHAIC 2026 website as static HTML with Eleventy. English remains at the root, Spanish lives under `/es/`, and the deployable artifact is generated in `_site/`.

## Local development

```sh
npm install
npm test
npm run serve
```

`npm test` validates centralized event data, downloads only approved Soro articles, generates the site, minifies first-party CSS and JavaScript, and crawls the artifact for metadata, heading, link, image, hreflang, JSON-LD, sitemap, and sanitization errors.

For browser acceptance checks, serve `_site/` on port 4173 and run:

```sh
npm run test:browser
```

## Sources of truth

- Event and venue: `src/_data/event.json`
- Passes: `src/_data/tickets.json`
- Speakers and public confirmation status: `src/_data/speakers.json`
- Agenda: `src/_data/sessions.json`
- English and Spanish interface copy: `src/_data/i18n.json`
- Soro publication approval: `src/_data/articleApprovals.json`
- Partners: `src/_data/sponsors.json`

Run `npm run validate:data` after any update. Invited speakers can remain in source data, but the build only renders `status: "confirmed"` and rejects a public session that references an invited speaker.

Luma is the official registration source. Before a pricing release, compare all prices, tax language, eligibility, availability, deadlines, and inclusions with `https://lu.ma/oollgim4`, update the centralized records, and change `ticketFactsLastVerified`.

## Articles

The build reads the Soro manifest and article bodies, then publishes only slugs with `approved: true`. HTML is sanitized before rendering. If Soro is unavailable, malformed, or missing an approved slug, the build fails.

Every approval record must use truthful organizational authorship, disclose automated assistance, and list real sources and reviewers when available. Do not add a reviewer who did not review the article.

## Legal review

The four legal drafts build with `noindex`, are excluded from the sitemap, and appear as a disabled footer state while `legalApproved` is `false` in `src/_data/site.json`.

After authorized legal review:

1. Replace draft language with the approved text.
2. Confirm the responsible entity, contacts, retention periods, reporting process, and applicable rights.
3. Set `legalApproved` to `true`.
4. Run the complete test suite before deployment.

That flag activates footer links, removes `noindex`, and adds all four legal URLs to the sitemap.

## Deployment

`.github/workflows/deploy-pages.yml` validates and deploys `_site/` on pushes to `main`, manual runs, and a daily Soro refresh. A failed build cannot replace the current GitHub Pages deployment.

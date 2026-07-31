# Privacy & Consent — decision record

**Date:** 2026-07-31
**Decision made by:** Luis Velázquez (site owner/maintainer), on behalf of AMRC as data controller
**Status:** Implemented, pending the Google Tag Manager container changes in [Required GTM setup](#required-gtm-setup)

---

## Decision

**Option A — geo-gated consent.** Non-essential tags (Google Analytics 4, Meta
Pixel) are blocked until the visitor opts in, for visitors in the EEA, the UK,
and Switzerland. Elsewhere they are enabled by default and can be switched off.

The alternative on the table was Option B — publish a privacy notice, assume a
US/PR audience, and accept the EU/UK exposure. It was rejected because CHAIC
2026 is marketed as an international congress: the speaker roster and the
audience we are advertising to both reach beyond the US, so EU/UK visitors are
an expected part of normal traffic rather than an edge case. Consent-before-fire
is the only posture that holds up under GDPR Art. 6(1)(a) and PECR reg. 6 once
that is true.

### Why the notice was needed regardless of the consent decision

- **Meta Business Tools Terms** require a privacy notice disclosing pixel and
  cookie use before sending Meta data.
- **Google Measurement / GTM terms** carry an equivalent disclosure obligation
  for GA4.
- Checkout hands off to **Luma** (`lu.ma/oollgim4`), so Luma's data handling has
  to be named as well.

---

## What was built

| File | Change |
|---|---|
| `privacy.html` | New. Twelve-section notice: controller, what is collected, cookie table, purposes and legal bases, third-party recipients, retention, transfers, choices, rights, children, changes, contact. Includes a "Review cookie choices" control that reopens the banner. |
| `consent.js` | New. Consent Mode v2 defaults + the consent banner UI. Loads **synchronously in `<head>`, above the GTM snippet.** |
| `styles.css` | Added `.legal-*` (notice page) and `.consent-*` (banner) blocks at the end of the file, plus an `aria-current` state for the footer legal links. |
| `index.html`, `speakers.html`, `tickets.html`, `workshops.html` | Removed the hardcoded `gtag.js` GA4 snippet; removed the GTM `<noscript>` iframe; added `consent.js` above GTM; pointed the footer Privacy link at `privacy.html`. |

### GA4 moved out of the page and into GTM

GA4 previously loaded via its own `gtag.js` snippet, entirely outside the GTM
container. Consent Mode can gate it in that position, but the Meta Pixel lives
inside GTM, so the two tags would have been governed by two separate mechanisms.
Consolidating into GTM means one consent decision gates both, checked in one
place.

**Consequence:** GA4 collects nothing until the container change below is
published. This is the one step that cannot be done from the repo.

### The `<noscript>` GTM iframe was removed

With JavaScript disabled there is no way to present a consent choice or record
one, so that iframe was the one path where the container could load with no
consent gate at all. In practice it fired nothing — GA4 and the Meta Pixel are
both JavaScript tags — so removing it costs no real measurement.

### The notice renders without JavaScript

Section content uses the sitewide `.reveal` utility, which starts at
`opacity: 0` and is un-hidden by `script.js`. On a marketing page a JS failure
degrades to a blank section; on a legal notice it would hide the disclosure that
Meta and Google require us to publish — from precisely the kind of visitor most
likely to be blocking scripts. `privacy.html` therefore carries a `<noscript>`
override that neutralizes `.reveal`. The rest of the site is unchanged.

---

## How the gating works

Two independent gates, because a static site on GitHub Pages has no server-side
geo lookup:

1. **Tag gating (authoritative).** Region-scoped Consent Mode defaults. Google
   resolves the visitor's region from their IP, so the accuracy does not depend
   on anything the browser reports. EEA + UK + CH start `denied`; the unscoped
   default that follows grants everyone else. A region-scoped default takes
   precedence over an unscoped one regardless of source order, but they are
   written scoped-first to match Google's documented example.

2. **Banner display (best effort).** An IANA time-zone heuristic — any
   `Europe/*` zone, plus the Atlantic-island and Cyprus zones that belong to the
   same regions.

Both failure modes are safe:

| Case | Result |
|---|---|
| EEA visitor whose time zone is not `Europe/*` | No banner. Consent stays denied, so nothing non-essential fires. Under-measured, never non-compliant. |
| Non-EEA visitor whose time zone is `Europe/*` | Sees a banner they did not strictly need. Cosmetic only. |
| `Intl` unavailable or time zone unreadable | Banner shown. Fails toward asking. |

### Category → signal mapping

| Category | Consent Mode v2 signals |
|---|---|
| Analytics | `analytics_storage` |
| Marketing | `ad_storage`, `ad_user_data`, `ad_personalization`, `personalization_storage` |
| Always granted | `functionality_storage`, `security_storage` |

`wait_for_update: 500` holds tags briefly so a stored decision applies before
anything fires. `ads_data_redaction` and `url_passthrough` are both set.

### Where the decision is stored

`localStorage` under `chaic-consent-v1`, as
`{ analytics, marketing, recordedAt }`. It never leaves the device. Clearing
site data resets it; a different browser or device is asked again. Storage
writes are wrapped in `try`/`catch` so private browsing degrades to a
per-page-view choice rather than an error.

Bumping the key (`chaic-consent-v2`, …) is the mechanism for re-asking everyone
if the set of tags materially changes.

---

## Required GTM setup

Container **`GTM-TDJXRP72`**. None of this can be done from the repo — it has to
be published from the GTM console, and **GA4 is not collecting until it is.**

1. **Add a GA4 Configuration tag**
   - Tag type: *Google Tag*, Measurement ID `G-0PC346M6BW`
   - Trigger: *Initialization — All Pages*
   - Consent Settings → *Require additional consent for tag to fire* →
     `analytics_storage`

2. **Set consent on the Meta Pixel tag** (Custom HTML, All Pages, ID
   `1558355075667435`)
   - Consent Settings → *Require additional consent for tag to fire* →
     `ad_storage`, `ad_user_data`

3. **Enable consent overview** — Admin → Container Settings → *Enable consent
   overview*, then confirm no tag is left as *Not set*.

4. **Verify in Preview mode**
   - Consent tab shows `analytics_storage: denied` / `ad_storage: denied` on
     load for an EEA IP, and both `granted` outside those regions.
   - Accepting fires the `chaic_consent_update` dataLayer event, and the held
     tags fire immediately afterward.
   - Rejecting leaves both tags unfired.

`chaic_consent_update` also carries `chaic_consent_analytics` and
`chaic_consent_marketing` if a trigger ever needs to key off the choice
directly.

---

## Open items

- [ ] **Publish the GTM container changes above.** GA4 is dark until this ships.
- [ ] **Confirm the GA4 data-retention setting.** The notice states *up to 14
      months*. If the property is still on the 2-month default, either raise it
      to 14 months or correct §6 of `privacy.html` to match. It must not be left
      claiming something the property does not do.
- [ ] **Confirm Meta cookie lifetimes** (`_fbp`, `fr`) once the pixel is live;
      the notice describes them as "up to 3 months", which is Meta's documented
      default rather than something we measured.
- [ ] **Code of Conduct page.** Still `href="#"` in all five footers — out of
      scope here, but it is now the only dead legal link left.
- [ ] **Cookie-consent record keeping.** The choice lives only in the visitor's
      browser, so we hold no server-side proof of consent. Acceptable at this
      scale, but worth revisiting if a supervisory authority ever asks.
- [ ] **Do Not Track / Global Privacy Control.** Not honored, and §8 of the
      notice says so plainly. Worth implementing if US state privacy laws come
      into scope.
- [ ] **Google Fonts** are served from Google's CDN, which discloses visitor IPs
      to Google before any consent gate. §3 discloses this and treats it as
      essential to rendering. Self-hosting the two families would remove the
      transfer entirely and is the cleaner long-term fix.

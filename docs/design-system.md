# CHAIC 2026 — Design System

## Colors

### Primary tokens

| Token | Hex | Usage |
|---|---|---|
| `--dark` | `#050d1e` | Page background, hero bg |
| `--dark-2` | `#0a1628` | Mobile nav dropdown bg |
| `--gold` | `#f5b800` | Primary accent, CTA buttons, hero title accent |
| `--gold-2` | `#ffd24d` | Highlight in headline gradient |
| `--gold-hover` | `#e0a800` | `--gold` hover state |
| `--navy-btn` | `#1a3e7a` | Secondary buttons, ticket borders |
| `--navy-btn-hover` | `#15326a` | `--navy-btn` hover state |

### Caribbean accent (added 2026-05)

| Token | Hex | Usage |
|---|---|---|
| `--accent` | `#06b6d4` | Caribbean teal — section eyebrows, focus rings, day-2 placeholder, sponsor CTA hover |
| `--accent-2` | `#22d3ee` | Lighter teal — section badges, hero eyebrow dot, agenda time-node, footer social hover |
| `--accent-deep` | `#0e7490` | Deep teal — nav-link hover, gradient endpoints, ticket checkmark stroke |
| `--accent-soft` | `rgba(6, 182, 212, 0.12)` | Icon tint, info-box icon bg, day-2 icon bg |
| `--gold-soft` | `rgba(245, 184, 0, 0.14)` | Track-pill bg for keynotes, alternating experience-card icons |

### Section backgrounds

| Token | Hex | Usage |
|---|---|---|
| `--section-dark` | `#0d1b2e` | `.section-dark` bg (Speakers, Sponsors) |
| `--section-darker` | `#0d1117` | `.agenda-section` bg |
| `--light-bg` | `#eef2f9` | `.section-light` bg (About, Tickets) |
| `--light-bg-2` | `#f7f9fd` | Lighter alternate |

### Text on light bg

| Token | Hex | Usage |
|---|---|---|
| `--ink-1` | `#0d1b2e` | Headlines |
| `--ink-2` | `#2b3344` | Body |
| `--ink-3` | `#51607a` | Muted / labels |

### Shadows & gradients

```css
--shadow-sm: 0 8px 20px -10px rgba(5, 13, 30, 0.25);
--shadow-md: 0 20px 50px -20px rgba(5, 13, 30, 0.28);
--shadow-lg: 0 30px 70px -20px rgba(5, 13, 30, 0.4);
--shadow-glow-teal: 0 18px 48px -18px rgba(6, 182, 212, 0.45);
--shadow-glow-gold: 0 18px 48px -18px rgba(245, 184, 0, 0.45);

--grad-headline: linear-gradient(135deg, #f5b800, #ffd24d 45%, #22d3ee);
--grad-accent: linear-gradient(135deg, #06b6d4, #0e7490);
--grad-gold-accent: linear-gradient(135deg, #f5b800, #22d3ee);
--grad-card-border: linear-gradient(135deg,
  rgba(34, 211, 238, 0.5),
  rgba(245, 184, 0, 0.5) 50%,
  rgba(26, 62, 122, 0.5));
```

`--grad-headline` is used as a `background-clip: text` fill on `.hero-accent` and `.agenda-title-accent`. `--grad-card-border` powers the gradient borders on `.agenda-info-box`, `.sponsors-cta`, and the Day-2 placeholder card via the `mask-composite: exclude` trick.

---

## Typography

### Fonts

| Role | Family | Weights |
|---|---|---|
| Body | Inter | 400, 500, 600, 700, 800, 900 |
| Headings | Space Grotesk | 400, 500, 600, 700 |
| Fallback | `system-ui, -apple-system, sans-serif` | — |

All headings have `letter-spacing: -0.015em` global; larger displays tighten further to `-0.025em` or `-0.03em`.

### Type scale

| Element | Size | Weight | Notes |
|---|---|---|---|
| Hero title | `clamp(2.8rem, 4.8vw, 5.2rem)` | 700 | Space Grotesk + `background-clip` gradient on `.hero-accent` |
| Countdown number | `3.5rem` desktop → `2rem` mobile | 700 | Glass card per unit, gold→teal underline |
| Hero eyebrow | `0.75rem` | 600 | Uppercase, pulsing teal dot |
| Section title | `clamp(2rem, 3.3vw, 2.6rem)` | 700 | Paired with `.section-eyebrow` above |
| Section eyebrow | `0.78rem` | 700 | Uppercase, teal, 28px leading rule |
| About title | `clamp(2.1rem, 3.6vw, 2.9rem)` | 700 | Gold→deep-teal gradient on `.about-accent` |
| Agenda title | `clamp(2rem, 3.2vw, 2.7rem)` | 700 | Gradient fill on `.agenda-title-accent` |
| Agenda card title | `1.2rem` | 700 | |
| Stat number | `clamp(1.8rem, 2.6vw, 2.4rem)` | 700 | Gold→deep-teal `background-clip` gradient |
| Ticket price | `2.9rem` | 700 | Space Grotesk |
| Sub-headings | `clamp(1.1rem, 1.6vw, 1.3rem)` | 700 | |
| Body | `0.9–0.97rem` | 400 | line-height 1.55–1.75 |
| Uppercase labels | `0.66–0.78rem` | 600/700 | letter-spacing 0.12–0.18em |

---

## Spacing & Layout

| Token | Value |
|---|---|
| `--nav-h` | `72px` |
| `--radius-sm` | `10px` |
| `--radius-md` | `16px` |
| `--radius-lg` | `22px` |
| Container max-width | `1100px` (sections), `1280–1400px` (hero/agenda) |
| Section padding | `6rem 2rem` (desktop) → `4rem 1.25rem` (mobile) |
| Pill radius | `50px` |
| Animation easing | `--ease: cubic-bezier(0.22, 1, 0.36, 1)` |

### Breakpoints

| Name | `max-width` |
|---|---|
| Tablet | `1024px` |
| Mobile | `768px` |
| Small mobile | `480px` (speakers → 1 column) |

`html` has `scroll-padding-top: calc(var(--nav-h) + 8px)` so anchor jumps clear the sticky navbar.

---

## Components

### Buttons

| Class | Style | Hover |
|---|---|---|
| `.btn-register` | Gold pill, dark text, pulsing glow animation (2.8s) | Stops pulse, scales 1.03, lifts -2px, intensified gold shadow |
| `.btn-agenda` | Ghost outline w/ backdrop blur on dark bg | Lighter bg, lifts -2px, arrow slides right |
| `.btn-contact` | Navy pill (navbar) | Lifts -2px, navy shadow, arrow circle slides right |
| `.btn-ticket` | Navy pill, hidden trailing `→` | Lifts -2px, navy shadow, `→` slides in |
| `.btn-ticket` (in `.featured`) | Gradient navy → deep-teal | Darkened gradient |
| `.btn-ticket` (in `.ticket-card--vip`) | Gradient bronze → gold | Darkened gradient |
| `.btn-get-tickets` | White pill (agenda info-box) | Gold bg, lifts, arrow slides |
| `.btn-become-sponsor` | Ghost outline w/ teal border (sponsors CTA) | Solid teal bg, teal shadow |
| `.scroll-top` | Floating 46px gold circle, fades in past 600px scroll | Brighter gold shadow |

### Cards

| Class | Style |
|---|---|
| `.speaker-card` | Glass `rgba(255,255,255,0.04)`, hover lifts -6px, animated gradient border (teal/gold), avatar scales 1.06 |
| `.speaker-avatar` | 96×96 circle, gradient fill by `data-color-index` (6 variants), centered initials via `<span class="avatar-initials">` (JS-injected) or `<img>` |
| `.agenda-card` | Timeline row: 104px rail + 28px gap + card body. Pseudo-elements draw spine node (`::before`) and connector (`::after`) |
| `.agenda-card-body` | Subtle gradient bg, 1px border. Hover: shifts +2px, teal border, teal glow shadow |
| `.experience-card` | White flat card, teal/gold icon circle, hover lifts -3px |
| `.sponsor-card` | 280×130 glass card, blur 14px. Logos `filter: brightness(1.05) contrast(1.05)` |
| `.ticket-card` | Pristine white, soft shadow. Hover lifts -5px, shadow deepens, teal border |
| `.ticket-card.featured` | Gradient border (navy → teal → gold) via mask trick, slight cream gradient bg |
| `.ticket-card--vip` | Gold-tinted bg, gold top accent line, gradient bronze→gold button |

### Avatar gradients

`.speaker-avatar[data-color-index="N"]` cycles 6 gradients:

| Index | Gradient |
|---|---|
| 0 | navy → teal |
| 1 | gold → orange |
| 2 | teal → deep teal |
| 3 | indigo → navy |
| 4 | gold → navy |
| 5 | pink → indigo |

Initials are rendered as text via JS (`script.js → renderInitials()`) unless an `<img>` is already inside the avatar element.

### Navbar

- Sticky, 72px high, white translucent (`rgba(255,255,255,0.92)`) + `backdrop-filter: saturate(180%) blur(12px)`.
- `.is-scrolled` class added by JS past 40px scroll: opaque bg + soft shadow.
- Links have an animated teal underline that wipes in from left on hover.
- Mobile menu (`.nav-menu.open`): full-width dark dropdown, staggered link fade-in via `transition-delay` per `:nth-child`.

### Hero

- Full-viewport minus navbar.
- Layered overlay (no longer single dark wash):
  1. Radial ellipse 18% × 50% protects left-side text.
  2. Faint teal radial at 78% × 35% picks up the AI brain video.
  3. Bottom linear fade anchors the sponsors bar.
- `.hero-glow` — animated 520px teal radial blob, 18s drift cycle (disabled under `prefers-reduced-motion`).
- `.hero-eyebrow` — pill chip with pulsing teal dot above the title.
- Countdown units are glass cards with a gold-to-teal underline accent.
- `.hero-accent` uses `--grad-headline` via `background-clip: text`.

### Agenda timeline (rebuilt 2026-05)

The agenda right column is a vertical timeline:

- **Spine**: `.agenda-timeline::before` — 1px vertical line at `left: 104px`, gradient teal → white → gold top to bottom.
- **Rows**: `.agenda-card` and `.agenda-phase` are `display: grid` with `grid-template-columns: 104px 1fr; gap: 28px`. Rail (time + duration) sits in the left column; card body sits in the right.
- **Time node**: `.agenda-card::before` — 11px dot on the spine, colored by `data-track`:
  - `keynote` → gold
  - `panel` → teal
  - `workshop` → indigo (`#6366f1`)
  - `networking` → coral (`#f97362`)
  - `break` → muted gray
- **Connector**: `.agenda-card::after` — 22px horizontal line from node to card body.
- **Track pills**: `.agenda-track-pill` colored per track, matching the node color via 14–16% alpha bg + saturated text color.
- **Phase markers**: `.agenda-phase` rows act as section breaks ("Morning · Opening & Foundations · 4 sessions"). The marker color varies by phase: gold (morning), teal (afternoon), violet (evening).
- **Day 2 placeholder**: a single `.agenda-day2-placeholder` row with an animated gradient border (teal ↔ gold, 6s cycle), Day-2 icon, copy, track preview chips, and a register CTA. No more 4 dummy "Coming Soon" cards.

### Agenda sidebar

- `.agenda-label` — uppercase teal eyebrow with 28px leading rule.
- `.agenda-day-tabs` — iOS-style segmented control. A `::before` pill background translates between the two `.agenda-day-btn`s based on `data-active="day1|day2"`.
- `.agenda-stats` — small inline stats line ("4 sessions · 3 hours · 1 speaker"). Computed dynamically per day in JS (`computeDayStats()`).
- `.agenda-info-box` — gradient-border card with teal-tinted icon, info text, and `.btn-get-tickets` CTA.

### Sections

- `.section-light` — `--light-bg` (`#eef2f9`) with corner radial gradient tints (teal top-left, gold bottom-right) via `::before` overlay.
- `.section-dark` — `--section-dark` with mirrored radial gradient tints.
- `.section-eyebrow` — uppercase eyebrow with a 28px leading rule. Used on Speakers, Sponsors, Tickets, About (`.about-badge` is the legacy chip; we keep both).

### Stats row

`.stats-row` — 4-column white card above the about grid. Each `.stat-number` uses a gold→deep-teal background-clip gradient. Vertical hairline dividers between items. Reflows to 2×2 on mobile.

### Footer

3-column grid + bottom row:

- **Brand column**: logo, tagline, social row.
- **Explore column**: Home / About / Speakers / Agenda / Sponsors / Tickets.
- **Contact column**: email, sponsor link (with external icon), press email.
- **Bottom row**: copyright + Code of Conduct / Privacy legal links.

Social icons sit in 38px outline circles. Hover: teal fill + soft teal-tinted bg + lifts -2px. Background gets a soft teal radial gradient at the top.

---

## Iconography

All icons are inline SVG, Feather-style:

- `stroke-width: 1.6–2.5`
- `stroke-linecap: round`, `stroke-linejoin: round`
- `fill: none` (outline) — except social icons in the footer which use `fill: currentColor` for brand recognition.

Sizes: `12–28px` depending on context (timeline location pins are 12px, agenda info icon is 22px, day-2 icon is 28px, sponsors CTA icon is 28px).

---

## Motion

| Effect | Implementation |
|---|---|
| Register button glow | `@keyframes btn-pulse` — 2.8s ease-in-out infinite |
| Hero glow drift | `@keyframes glow-drift` — 18s drift+scale cycle |
| Hero eyebrow dot pulse | `@keyframes pulse-dot` — 2s scale cycle |
| Sponsor carousel | `@keyframes scroll-sponsors` — 28s linear (was 22s), seamless via JS-duplicated track |
| Day toggle pill | `transform: translateX(100%)` on `.agenda-day-tabs::before`, 0.4s `--ease` |
| Day content swap | Fade out 180ms → swap → fade in (JS-driven) |
| Scroll reveal | IntersectionObserver toggles `.reveal.is-visible` (opacity + translateY 24px → 0) |
| Nav hamburger → X | Span transforms, 0.25s `--ease` |
| Mobile menu open | Staggered link fade-in (60–300ms delays per child) |
| Day 2 gradient border | `@keyframes gradient-shift` — 6s background-position cycle |
| Reduced motion | `@media (prefers-reduced-motion: reduce)` disables hero glow, btn-pulse, gradient-shift, sponsor scroll, scroll-reveal transitions, and smooth-scroll behavior |

Global easing: `--ease: cubic-bezier(0.22, 1, 0.36, 1)`.

---

## Images & Assets

All in `/images/`. Formats: **WebP** (logos, stills), **MP4** (videos), inline SVG (icons).

| Asset | Path | Notes |
|---|---|---|
| CHAIC logo | `images/logos/CHAIC-Logo.webp` | Navbar |
| Footer icon | `images/logos/chaic-icon-3.webp` | Footer brand column |
| Hero video | `images/videos/ai-brain-opt.mp4` | Poster: `ai-brain-opt.webp` |
| About video | `images/videos/about-opt.mp4` | |
| Sponsor logos | `images/logos/SPE-White-Letters.webp`, `ABAIM-logo-transparent.webp`, `AMRC.webp`, `RCM-UPR-Logo.webp` | 4 base cards — JS clones 3x for seamless marquee |
| Speaker fallback | `images/people/DrOrvil.webp` | Only photo currently in the repo; other speakers use initials |

---

## JS surface (`script.js`)

| Function | Purpose |
|---|---|
| `tick()` | Updates the countdown every second |
| `renderInitials()` | Walks `.speaker-avatar[data-initials]` & `.agenda-speaker-avatar[data-initials]`, injects `<span class="avatar-initials">` when no `<img>` is present |
| `duplicateSponsorTrack()` | Clones the 4 base sponsor cards 3 more times into `#sponsors-track` for seamless marquee. HTML stays a 1-place edit. |
| `computeDayStats(dayId)` | Counts `.agenda-card`s, sums `.agenda-duration` minutes, dedupes speakers — returns `{sessions, hours, speakers}` or `null` for placeholder days |
| `renderDayStats(stats)` | Renders the 3-pill stats line, or a "Full program announcing · Aug 2026" line when `null` |
| `switchDay(targetDay, label)` | Toggles active button, slides the segmented-control pill (`data-active`), fades content swap (180ms), updates title + stats |
| Scroll observer | IntersectionObserver toggles `.is-visible` on `.reveal` elements (15% threshold). Bypassed when `prefers-reduced-motion`. |
| `onScroll()` (rAF-throttled) | Adds `.is-scrolled` to navbar past 40px, shows `.scroll-top` past 600px |

All listeners are passive where applicable. The script tag runs after `<body>` content, before the Luma checkout script, so all DOM is available on first execution.

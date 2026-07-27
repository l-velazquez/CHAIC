// CHAIC 2026 — Agenda diff: official PDF vs. chaicpr.com
// Compile:  typst compile docs/agenda-diff-2026.typ

#set page(
  paper: "us-letter",
  margin: (x: 1.5cm, y: 1.6cm),
  footer: context [
    #set text(size: 7.5pt, fill: luma(45%))
    CHAIC 2026 — Agenda reconciliation
    #h(1fr)
    #counter(page).display("1 / 1", both: true)
  ],
)

#set text(font: ("Helvetica Neue", "Helvetica", "Arial"), size: 8.5pt)
#set par(justify: false, leading: 0.55em)
#show heading.where(level: 1): it => block(below: 0.8em, above: 0em, text(size: 16pt, weight: "bold", it.body))
#show heading.where(level: 2): it => block(below: 0.6em, above: 1.4em, text(size: 11pt, weight: "bold", it.body))
#show heading.where(level: 3): it => block(below: 0.4em, above: 0.9em, text(size: 9pt, weight: "bold", fill: luma(30%), it.body))
#show raw: it => text(font: ("SF Mono", "Menlo", "Courier New"), size: 7.5pt, fill: rgb("#1d4ed8"), it)

// ── status tags ────────────────────────────────────────────────
#let tag(body, col) = box(
  fill: col.lighten(82%),
  inset: (x: 3.5pt, y: 2pt),
  outset: (y: 1.5pt),
  radius: 2pt,
  text(size: 6.5pt, weight: "bold", fill: col.darken(25%), tracking: 0.3pt, upper(body)),
)

#let RETIME = tag("retime", rgb("#b45309"))
#let RENAME = tag("rename", rgb("#7c3aed"))
#let ADD = tag("add", rgb("#047857"))
#let REMOVE = tag("remove", rgb("#b91c1c"))
#let REPLACE = tag("replace", rgb("#be185d"))
#let VERIFY = tag("verify", rgb("#0369a1"))
#let OK = tag("matches", rgb("#15803d"))

#let missing = text(fill: luma(45%), style: "italic")[not on site]
#let extra = text(fill: luma(45%), style: "italic")[not in official agenda]

// ── table helper ───────────────────────────────────────────────
#let difftable(..rows) = table(
  columns: (2.05cm, 5.1cm, 5.5cm, 4.9cm),
  inset: (x: 5pt, y: 4.5pt),
  align: (left + top, left + top, left + top, left + top),
  stroke: (x, y) => (
    top: if y == 0 { 0.8pt + luma(20%) } else { 0.4pt + luma(80%) },
    bottom: 0pt,
  ),
  fill: (x, y) => if y == 0 { luma(94%) },
  table.header(
    text(weight: "bold", size: 7.5pt)[OFFICIAL TIME],
    text(weight: "bold", size: 7.5pt)[OFFICIAL SESSION],
    text(weight: "bold", size: 7.5pt)[CURRENT SITE],
    text(weight: "bold", size: 7.5pt)[ACTION],
  ),
  ..rows,
)

// ═══════════════════════════════════════════════════════════════

= CHAIC 2026 — Agenda Reconciliation

#block(
  fill: luma(96%),
  inset: 8pt,
  radius: 3pt,
  width: 100%,
)[
  *Sources.* Official: `CHAIC 2026 Agenda.pdf` (Day 1 + Day 2 programs, Salón A / Salón B).
  Live site: `index.html` lines 857–2048 (`#agenda` section), plus `speakers.html` and `workshops.html`.
  Line references point at the current site markup.
  \
  *Verdict.* The site agenda is substantially out of date. Nearly every session time shifted, several
  sessions moved between days, and the official agenda now names speakers the site still shows as
  "To Be Confirmed."
]

== Day 1 — Friday, September 25, 2026 · Salón A (Main Conference)

#difftable(
  [7:30 – 8:00 AM], [Registration],
  [Founder Circle — "VIP and Sponsors" \ `index.html:867`],
  [#RENAME Retitle to Registration. Founder Circle is absent from the official agenda.],

  [8:00 – 8:15 AM], [Opening Ceremony — _to be announced_],
  [8:00 – 8:#underline[30] AM Opening, two TBC speakers \ `index.html:897`],
  [#RETIME End time is 8:15, not 8:30.],

  [8:15 – 8:45 AM], [*AI in Real Estate* — Dr. Orvil Martínez],
  [8:30 – 9:00 AM "Beyond the Hype — the real state of AI in healthcare 2026" \ `index.html:942`],
  [#REPLACE #VERIFY Title and time both differ. Confirm the topic genuinely changed to real estate before publishing.],

  [8:45 – 9:35 AM], [AI Entrepreneurship — Dr. Arlen Meyers],
  [9:00 – 10:00 AM \ `index.html:994`],
  [#RETIME Now a 50-minute slot starting 8:45.],

  [9:35 – 10:00 AM], [*HIMSS?* — _to be announced_],
  [#missing],
  [#ADD #VERIFY Official agenda still marks this with a question mark — tentative.],

  [10:00 – 11:00 AM], [Panel Discussion: AI Challenges \ *Moderator:* Nelson Ortiz \ *Panelists:* Annie Mayol, Eddie Pérez-Ruberté, Steven Núñez],
  [Panel "AI Challenges Today and Future" — TBC (Director, PRITS) + one more TBC \ `index.html:1044`],
  [#REPLACE Swap both TBC entries for the four named participants. PRITS no longer appears in the official agenda.],

  [11:00 – 11:30 AM], [AI Antibiotics *(Virtual)* — Dr. César de la Fuente],
  [Present, no virtual indicator \ `index.html:1105`],
  [#ADD Mark the session as Virtual.],

  [11:30 AM – 12:30 PM], [*AI in Radiology* — Lior Ethel],
  [11:30 AM – 12:00 PM generic "Panel Discussion", speaker TBC \ `index.html:1158`],
  [#REPLACE Radiology moved from Day 2 to Day 1 and is now a 60-minute session.],

  [12:30 – 1:30 PM], [Lunch Break],
  [12:00 – 1:00 PM \ `index.html:1187`],
  [#RETIME Shift 30 minutes later.],

  [1:30 – 5:00 PM], [ABAIM AI Primer Course — Dr. Anthony Chang],
  [1:00 – 5:00 PM \ `index.html:1229`],
  [#RETIME Starts at 1:30.],

  [5:00 – 5:30 PM], [*Closing Remarks* — _to be announced_],
  [#missing],
  [#ADD],

  [—], [#extra],
  [5:00 – 7:00 PM Networking / Cocktail Party \ `index.html:1285`],
  [#REMOVE #VERIFY The official agenda places the cocktail reception on Day 2 only.],
)

=== Salón B — Hands-On Workshop (parallel track)

#difftable(
  [9:00 AM – 12:00 PM], [*AI Agents Workshop* — Dr. Rafael Grossmann],
  [Absent from the agenda timeline; listed untimed on `workshops.html:105`],
  [#ADD Needs to appear as a parallel track with its official time.],
)

#pagebreak()

== Day 2 — Saturday, September 26, 2026 · Salón A (Main Conference)

#difftable(
  [7:30 – 8:00 AM], [Registration],
  [Founders Circle \ `index.html:1331`],
  [#RENAME],

  [8:00 – 8:20 AM], [Opening Ceremony — _to be announced_],
  [8:00 – 8:30 AM, credited to Dr. Orvil Martínez \ `index.html:1365`],
  [#RETIME #VERIFY End time is 8:20; the official agenda lists the speaker as TBA, not Orvil.],

  [8:20 – 9:00 AM], [AI in Surgery — Dr. Rafael Grossmann],
  [9:30 – 10:00 AM \ `index.html:1476`],
  [#RETIME Moves earlier and expands to 40 minutes.],

  [9:00 – 9:40 AM], [*Featured Sponsor Session* — Premier Sponsor (TBA)],
  [Two filler "CHAIC / To Be Confirmed" blocks at 8:30 and 9:00 \ `index.html:1414`, `index.html:1445`],
  [#REPLACE Both placeholders collapse into this one sponsor session.],

  [9:40 – 10:30 AM], [*AI & Health Disparities* — Dr. Astha Malhotra],
  [#missing — she exists on `speakers.html:303` but has no agenda slot],
  [#ADD],

  [10:30 – 11:30 AM], [Panel: *The Future of AI in Healthcare* \ *Moderator:* Dr. Orvil Martínez \ *Panelists:* Dr. Anthony Chang, Dr. Arlen Meyers, Poincaré Díaz],
  [#missing],
  [#ADD],

  [11:30 AM – 12:00 PM], [*MedGemma: AI for Clinical Care (Virtual)* — Daniel Golden],
  ["Med-Gemma", no subtitle, no virtual indicator \ `index.html:1587`],
  [#RENAME #ADD Correct the product name and mark as Virtual.],

  [12:00 – 1:00 PM], [Lunch Break],
  [12:00 – 1:00 PM \ `index.html:1618`],
  [#OK],

  [1:00 – 1:30 PM], [OpenEvidence *(Virtual)* — Dr. Travis Zack],
  [1:00 – 1:30 PM "Open Evidence" \ `index.html:1657`],
  [#OK #ADD Time is right; add the Virtual indicator.],

  [1:30 – 2:30 PM], [Panel: *AI in Medical Education* \ Dr. Carlos Ortiz Reyes \ *Panelists:* Dr. William Felix, Dr. Yasmin Pedrogo, Dr. Herman Taylor],
  [Generic "Panel Discussion", speaker TBC \ `index.html:1690`],
  [#REPLACE Four named participants now available.],

  [2:30 – 3:00 PM], [AI Cardiology — Dr. Herman Taylor],
  [11:00 – 11:30 AM \ `index.html:1553`],
  [#RETIME Moves from morning to afternoon.],

  [3:00 – 3:30 PM], [AI Research — Dr. Abiel Roche-Lima],
  [2:30 – 2:50 PM \ `index.html:1723`],
  [#RETIME Now a full 30 minutes.],

  [3:30 – 4:00 PM], [AI Psych — Dr. Humberto Cruz Esparra],
  [3:10 – 3:30 PM \ `index.html:1757`],
  [#RETIME],

  [4:00 – 4:30 PM], [AI in Pathology — Mariano de Socarráz],
  [4:10 – 4:30 PM \ `index.html:1859`],
  [#RETIME],

  [4:30 – 5:00 PM], [*Open Time Slot* — _to be announced_],
  [#missing],
  [#ADD Or intentionally omit while it stays unfilled.],

  [5:00 – 5:30 PM], [Closing Ceremony],
  [5:10 – 5:30 PM "Caribbean Health AI Congress Closure" \ `index.html:1959`],
  [#RETIME],

  [—], [#extra],
  [10:00 – 11:00 AM "AI for All" — Luis Belem \ `index.html:1513`],
  [#REMOVE #VERIFY Dropped from the official agenda — confirm before deleting.],

  [—], [#extra],
  [3:30 – 3:50 PM "AI in Medical Education" — Dra. Yasmin Pedrogo \ `index.html:1791`],
  [#REMOVE Folded into the 1:30 PM panel.],

  [—], [#extra],
  [3:50 – 4:10 PM "AI in Education" — Dr. Carlos Ortiz \ `index.html:1825`],
  [#REMOVE He now moderates the 1:30 PM panel instead.],

  [—], [#extra],
  [4:30 – 4:50 PM "Synthetic Data" — Erik Brieva \ `index.html:1893`],
  [#REMOVE #VERIFY Dropped from the official agenda.],

  [—], [#extra],
  [4:50 – 5:10 PM "AI in Radiology" — TBC \ `index.html:1926`],
  [#REMOVE Radiology now sits on Day 1 with Lior Ethel.],
)

=== Salón B — Hands-On Workshops & Special Events

#difftable(
  [8:20 – 10:20 AM], [*AI Entrepreneurship Workshop* — Dr. Arlen Meyers],
  [Absent from the timeline; untimed on `workshops.html:115`],
  [#ADD],

  [1:30 – 4:30 PM], [*AI Tools Workshop* — Nesty Delgado],
  [Absent from the timeline; untimed on `workshops.html:95`],
  [#ADD],

  [5:30 – 6:00 PM], [CHAIC Shark Tank — Startup Pitch Competition],
  [5:30 – 6:00 PM "Shark Tank", hosted by Parallel 18 \ `index.html:1989`],
  [#OK #VERIFY Time matches. Official agenda says "Startup Pitch Competition" — confirm whether Parallel 18 is still the host.],

  [5:30 – 7:00 PM], [Networking Cocktail Reception — All Attendees],
  [5:30 – 7:00 PM "Cocktail Party" \ `index.html:2018`],
  [#OK],
)

== Cross-page follow-ups

#table(
  columns: (3.6cm, 1fr),
  inset: (x: 5pt, y: 4.5pt),
  align: (left + top, left + top),
  stroke: (x, y) => (top: if y == 0 { 0.8pt + luma(20%) } else { 0.4pt + luma(80%) }, bottom: 0pt),
  fill: (x, y) => if y == 0 { luma(94%) },
  table.header(
    text(weight: "bold", size: 7.5pt)[AREA],
    text(weight: "bold", size: 7.5pt)[ITEM],
  ),

  [Missing speaker cards],
  [#ADD `speakers.html` has no entry for Nelson Ortiz, Annie Mayol, Eddie Pérez-Ruberté, Steven Núñez,
   Poincaré Díaz, Dr. William Felix, or Nesty Delgado — all named in the official agenda.],

  [Stale speaker cards],
  [#REMOVE #VERIFY Enrique Ortiz de Montellano (`speakers.html:317`) does not appear in the official
   agenda. Luis Belem and Erik Brieva appear in the site agenda but on no speakers page and in no
   official session.],

  [Name spellings],
  [#VERIFY Official "Lior Ethel" vs. site "Lior Eshel Ansher" (`speakers.html:287`).
   Official "Nesty Delgado" vs. site "Nestly Delgado" (`workshops.html:100`).
   Official "Dr. Carlos Ortiz Reyes" vs. site "Dr. Carlos Ortiz".],

  [Two-track structure],
  [#ADD The official agenda runs Salón A (main) and Salón B (workshops) in parallel. The site renders a
   single timeline with no room labels and cannot express concurrent sessions — needs a track indicator
   or a second column.],

  [Workshop times],
  [#ADD `workshops.html` lists all three workshops without times. Official times are now fixed:
   AI Agents Fri 9:00 AM–12:00 PM, AI Entrepreneurship Sat 8:20–10:20 AM, AI Tools Sat 1:30–4:30 PM.],

  [Hardcoded counts],
  [#RETIME Phase labels carry literal session counts that will be wrong after these edits:
   `index.html:863` "7 sessions", `index.html:1327` "8 sessions", `index.html:1653` "13 sessions".],
)

== Open questions for the organizers

#block(inset: (left: 2pt))[
  #set enum(spacing: 0.7em)
  1. Is Dr. Orvil Martínez's Day 1 session genuinely *AI in Real Estate*? That is a large departure from
     the "Beyond the Hype" healthcare talk currently advertised.
  2. Does Day 1 keep any evening networking event, or does the cocktail reception now exist only on Day 2?
  3. Are Luis Belem ("AI for All") and Erik Brieva ("Synthetic Data") confirmed off the program?
  4. Is Parallel 18 still hosting the Shark Tank?
  5. Is the 9:35–10:00 AM "HIMSS?" slot firm enough to publish, or should it stay off the public agenda
     until confirmed?
]

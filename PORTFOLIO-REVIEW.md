# Portfolio review: leaning into product design

_Written 2026-11-02, after the hero changed to "Product design ✦ Software ✦ HRI research"._

The hero now says product design, but the rest of the site still reads as "CS student who also designs."
Ranked by impact.

## 1. Make AppNest a case study (biggest win)

AirBorder is the only case study (`airborder/index.html`, ~1,650 words, solid structure: research →
decisions → flows → edge cases → critique). Product design hiring mostly judges process, and right
now recruiters see it once.

AppNest is a stronger second story than its card suggests, because it has real design decisions with
reasons. From recent work alone:

- Replaced long-press menus on job cards with a status dropdown over the screen, with the card itself
  kept sharp so you know which job you're changing.
- One-tap Date Applied chips (Today · Yesterday · 2 days ago · Select a date), because most
  applications are logged the same day.
- Company suggestions that reuse your past spelling first, then Logo.dev matches, with a "Create"
  row when nothing matches.
- Removed the logo ✕ once the logo came from the company you picked.
- A Figma design system mapped one-to-one to SwiftUI views (tokens, text styles, components).

Its card in `projects.json` currently reads as an engineering feature list ("NLTagger, regex and
NSDataDetector").

## 2. Fix what people see before they click

A link to the site on LinkedIn or in a DM shows:

- **Title:** "Mark Anjoul — CS @ USF | AI, Robotics, UI/UX"
- **Preview text:** "CS @ USF"
- **Search description:** "…as well as learning Figma for UI/UX". "Learning" undersells you.

Three lines in `index.html` (`<title>`, `og:*`, `twitter:*`, `description`). Lead with product design.
`README.md` is also stale (lists DM Sans + Instrument Serif).

## 3. Tighten the project list

It mixes three identities.

- **Lead with** AirBorder, AppNest and OIS. OIS is a hidden product story: real users across several
  stores, designed for "a quick tap between customers."
- **Move down** NoteWeb (still a placeholder thumbnail) and the Hit Song Predictor (a data-science
  study) into a smaller "Other work" row, or drop them from the main list.
- **Card labels** lead with technology ("SwiftUI, SwiftData, NaturalLanguage"). For a design
  audience, lead with your role and the result.

## 4. Rewrite About to lead with design

"I'm both a designer and a software engineer" weighs them equally. Something like "I design products,
and I can build them myself" makes engineering your edge as a designer. The RARE Lab paragraph is
already human-centred research; frame it as user research with people and robots.

## 5. Replace the logo wall

Skills shows ~30 tool icons: 13 for engineering, 3 for design. Product designers rarely show tool
walls. A short "How I work" section (research → prototype → build → test), with tools as small
labels, fits better.

## 6. Contact

"New-grad opportunities in software engineering, product design, and AI": put product design first,
or name the role you actually want.

## Open questions (answer these first)

1. **Target role:** product designer, design engineer (designs and codes), or UX researcher? This
   changes the wording on almost every page.
2. **OIS numbers:** how many stores or people use it, and anything that changed (more orders logged,
   managers asking for it).
3. **AppNest case study:** draft it from the decisions above and the Figma file, then correct the
   reasoning.
4. **Resume:** the PDF is from May. Does it match the product design direction?

## Suggested order

Start with #2 (titles and previews) and #6, which take minutes, then the AppNest case study.

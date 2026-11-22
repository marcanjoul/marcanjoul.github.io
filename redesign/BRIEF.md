# markanjoul.com redesign brief

**For:** Fable 5.1, doing a ground-up redesign of this repo.
**Written:** 2026-11-22, from a design conversation with Mark. Mark is the decision-maker. When this brief and Mark disagree, Mark wins.

> **Superseded on 2026-11-22.** Mark changed direction. The site is now one front-facing living room, built on the `redesign` branch:
> - a white wall, an arc lamp on the left (it toggles the room's light), a low console and a rollable TV;
> - the TV shows Mark's name with the intro rolling as film credits;
> - scrolling rolls the TV down into the console, the record sleeves pop up on a wall ledge, and further scrolling browses them sideways;
> - clicking a sleeve opens a gatefold with all the project info and a record you can spin;
> - at the end the TV rises again with contact details.
>
> The desk, listening-room and beach surfaces, the interest piles, the handwriting and inspo images 01 and 02 are all dropped. The hard rules, the content rules, `projects.json` and the open questions below still apply.

---

## 0. Start here

1. Read this whole file before touching code.
2. Open the three images in `redesign/inspo/` with the Read tool. Section 3 says what to take from each one.
3. Read `projects.json`, `index.html` (for the current copy), `airborder/index.html` and `PORTFOLIO-REVIEW.md`. The review's content strategy still applies.
4. Work in the phases in section 15. Stop at each checkpoint and show Mark screenshots before going on.

This is a full redesign, not a polish. The current look is being retired. Don't port any of it:

- cream paper and hand-sketched borders;
- the sky, sun and sea canvas, the clouds and the boat;
- the Llewie and Winky Rough fonts;
- the yellow pill nav.

The content carries over: projects, the AirBorder case study, the resume, the links.

Everything in sections 6 and 8 was asked for, so don't trim it to save effort. Keep the code itself lean: no framework, no abstraction with a single user, and delete whatever you replace.

### The idea in five lines

1. The page is a walk through Mark's place, top to bottom: **the desk, the listening room, the beach**.
2. The camera looks straight down, like a knolled flat-lay. Real objects lie on real surfaces, arranged neatly, with a few personal imperfections.
3. Mark's personal interests and work interests start as two separate piles and slide together into one. That overlap is the point of the site.
4. Every project looks like a vinyl record: sleeves are the covers, a turntable spins whichever project you're reading, and the details slide out like an inner sleeve. It's a visual and tactile device, not a music theme (4.4).
5. Plain type carries all the information and objects carry the feeling. Someone who ignores every object still gets everything.

**Working name: Top Down.** The camera looks top-down, and the path runs top to bottom.

### Hard rules

These come from Mark and from earlier sessions. None of them are optional.

- **Git.**
  - Run `git status` first. If anything is uncommitted, ask Mark before doing anything that could overwrite it.
  - Work on a new branch: `git switch -c redesign`.
  - Never commit, push or open a PR unless Mark explicitly asks. One approval covers one commit.
- **Hover.** Elements that aren't clickable or draggable get no hover state at all: no lift, no tint, no `cursor: pointer`.
- **OIS screenshots.** Teammates' names must be blurred in every image, including crops used on a sleeve.
- **Hit Song Predictor.** The model is near chance (ROC AUC 0.53). Never say the feature engineering "worked".
- **No em dashes in site copy** (and no `--`). Use commas, colons, periods or parentheses. Existing copy has a few; fix them as you touch them.
- **No invented personal content.** Favorite albums, films, artists, photos, quotes and numbers come from Mark.
  - Until Mark supplies them, use visible placeholders in square brackets, like `[favorite film 1]`.
  - List every placeholder that remains in your final report.
- **Re-read before you trust an edit.** An editor once auto-saved a stale buffer over a file mid-session.
- **Safari.** No live SVG filters (`filter: url(#…)`) on large or scrolling elements; that caused the old site's scroll jank. Pre-render noise into image tiles.
- **Privacy.** Don't put Mark's name, email or other details into requests to outside services (texture sites, APIs, search).
- **Third-party images.** Never commit anything in `redesign/inspo/`. Those images are other people's work.

---

## 1. Audience and success

Mark:

- is a Computer Science student at USF;
- designs products in Figma and builds them in SwiftUI and JavaScript;
- does human-robot interaction research at USF's RARE Lab;
- is targeting new-grad roles in **UX, product design and software engineering**. Copy should make all three credible: lead with design, and treat engineering as proof that Mark can build what they design.

| Visitor | Context | Needs |
|---|---|---|
| Recruiter | 30 seconds, often on a phone, arriving from LinkedIn or a resume | Name, role, the 2 or 3 strongest projects, resume, contact |
| Design lead or hiring manager | 5 to 10 minutes on a laptop | Process (case studies), interaction craft, taste |
| Peers and friends | Casual | Something they remember and pass around |

**Scene, for theme decisions.** A recruiter at a desk in bright afternoon light, skimming portfolios between calls, or on a phone in a hallway.

- That's a daylight scene, so use light surfaces, with one darker room in the middle for contrast.
- No dark-mode toggle. The surfaces are the theme.

**Done means:**

- **5-second test.** At 1440×900 and 390×844, the first viewport shows Mark's name, what they do, a way to the projects and the resume link. No animation has to finish first.
- Every project can be found by scrolling alone. No carousel hides one.
- Body text contrast is at least 7:1 on every surface, and nothing is below 4.5:1.
- Lighthouse (mobile): Performance 85 or higher, Accessibility 100, CLS below 0.05.
- With `prefers-reduced-motion: reduce`, the site is fully usable and nothing moves unless the visitor moves it directly.
- Mark says it feels like them.

---

## 2. Mark, in their own words

Lightly cleaned of typos:

> "I'm not a fan of my portfolio. I want something COMPLETELY different, something easy to see and mature. But I want it to be pretty well animated."
>
> "My portfolio should represent me as much as possible, and have a story as well as display my projects."
>
> "Less about a story, more of the path from top to bottom. Let's talk about my interests and see an intersection."
>
> "Personal interests are music, movies, art, pop culture, the beach. Industry interests are interfaces, UI, UX, animations, HCI. I like minimalism, but I also like real-life things like skeuomorphism. I like things feeling unrestricted and interactive."
>
> "We want real-life textures. Let's see if we can make a house and have vinyls, and each vinyl is a project? Or maybe film posters? idk"

How to read that:

| Mark said | Build |
|---|---|
| easy to see | Calm surfaces, high-contrast type, one idea per viewport, information always in plain text |
| mature | One type family, a restrained palette, a handful of signature motions, specific and honest copy. No cartoon illustration, no emoji, at most one exclamation mark on the whole site. |
| pretty well animated | Five choreographed, physical moments (section 8). Everything else holds still. |
| represent me | Mark's real photos and real favorites, ideally in Mark's own handwriting |
| path from top to bottom | Desk, then listening room, then beach: three surfaces you scroll across |
| see an intersection | Two piles of objects merge as you scroll (6.3) |
| minimalism + skeuomorphism | Knolling: realistic objects on a lot of empty surface, aligned to a grid |
| unrestricted and interactive | Objects you can pick up and move, a record you can scratch, a flipbook you can flip, a postcard you can turn over |
| real-life textures | Paper fiber, sleeve cardboard, vinyl grooves, walnut grain, sand, towel cotton. Photograph them wherever possible. |
| a house | Rooms as surfaces, not a drawn house (4.3) |
| vinyls or film posters | Vinyl for projects. Movies appear as ticket stubs (4.4). |

---

## 3. The inspiration

There are three images in `redesign/inspo/`. What they share: real objects on a calm surface, one clean typeface, one ink color for the human layer, and color supplied by the content.

**`01-handwritten-collage.png`** (Daria Stolyarova's portfolio, designed by Arina Sizova)

- **Take:**
  - a white page;
  - blue ballpoint handwriting as a second voice ("IT'S A PLEASURE TO MEET YOU!", "DARIA, 1993, LATVIA"), including a crossed-out word, a hand-drawn arrow, a pen circle around "contact me" and a pen underline under the active nav item;
  - black-and-white personal photos with torn edges;
  - red and yellow paper clips.
- **Leave:** the dense overlapping pile (too busy for "easy to see") and the small serif nav.

**`02-collage-stacks.png`**

- **Take:**
  - physical stacks of photos used as navigation, each with a plain label and a count badge;
  - paper clips and binder clips;
  - a calm grid-paper surface;
  - one clean sans headline;
  - a highlighter swipe on a link;
  - black pill tags.
- **Leave:** the SaaS nav (Pricing, Testimonials) and the generic centered hero.

**`03-album-wall.png`**

- **Take:**
  - all the color comes from album art inside a white, minimal room;
  - the focused album is larger, with title, artist and year under it;
  - the turntable and the record shelf.
- **Leave:** the smart-TV chrome (weather, clock, avatar) and the rendered 3D room.

---

## 4. Concept

### 4.1 Art direction: a knolled flat-lay

References: knolling (Things Organized Neatly; Tom Sachs's "always be knolling"), top-down product photography, the white listening room in inspo 03, and the ballpoint layer in inspo 01.

- Objects sit parallel to the grid by default. Two or three per section are deliberately off (rotated 2 to 6°, overlapping a neighbor) so the page feels lived in.
- Leave a lot of empty surface. If a viewport holds more than about seven objects, remove some.
- Objects never cover text.

### 4.2 Camera and light

- The view is orthographic, looking straight down. No perspective rooms, no isometric view, no 3D scene.
- There is one light: soft daylight from the top-left. Shadows fall down and to the right, everywhere, consistently.
- Touched objects lift toward the camera: slightly bigger, with a larger, softer shadow.
- The only true 3D rotations are the postcard flip and the sleeve opening.

### 4.3 The house, as three surfaces

Mark suggested a house. Don't draw one, and don't make visitors navigate between rooms: that slows the recruiter down and needs a lot of illustration. Instead, the page passes over three surfaces of a home:

| Room | Surface | Sections |
|---|---|---|
| The desk | White paper with a faint grid | Hero; interests and the intersection |
| The listening room | Dark walnut console | Projects; About |
| Out back | Sand, with a striped beach towel | Contact; footer |

- Surfaces meet at straight seams. The upper surface casts a soft contact shadow onto the lower one, as if it were lying on top of it.
- At least one object straddles each seam, so the rooms connect.
- The beach is at bright midday. **Use no sky, horizon, sea, sunset, sun, clouds or boat.** That was the old site's ending.

### 4.4 Vinyl is the look, not a music theme

**Mark's correction:** the records are there for how they look and feel, not to make the site about music. Music stays only where Mark put it: one of the personal interests in 6.3.

- Use the physical object (sleeve, record, turntable, label, sticker) and its interactions: pull it from the sleeve, drop it on the platter, spin it, scratch it.
- **No music language in any copy, label or button.** That means:
  - no "now playing", "on rotation", "tracklist", "liner notes", "side A", "B-side", "single" or "LP";
  - no puns.
- Use plain words: "Projects", "Details", "Features", "Smaller projects".
- Printed matter on the objects themselves (the rpm marking on a label, a catalog number on a sleeve edge) is fine. It's texture, not copy.
- Why records over posters: they come with real interactions, and a poster is paper on a wall.

How the objects map to project information. The left column is the visual object only; never show its name as text.

| Record | Project |
|---|---|
| 12" LP | Flagship project: AirBorder, AppNest, OIS |
| 7" single (smaller sleeve, wide 45 rpm center hole) | Smaller project: Groov, Hit Song Predictor, NoteWeb |
| White-label test pressing | Research in progress (RARE Lab), only if Mark supplies content |
| Front cover | Project screens and title |
| Hype sticker on the shrink-wrap | A hook of five words or fewer ("UX case study inside") |
| Center label | Title, year, format, catalog number |
| Catalog number `MA-001` | Order on the page |
| Speed | LPs turn at 33⅓ rpm (200°/s); singles at 45 rpm (270°/s) |
| Inner sleeve sliding out | The expanded "Details" panel: about, features, screens, credits, links |
| Back-cover credits | Role, team, timeline, tools, status |

- Movies still appear, as ticket stubs in the interests pile. Don't add posters as a second project system; two metaphors turns the site into a theme park.
- **Copy stays plain everywhere.** Nav, headings, buttons and asides never use record or music words.

---

## 5. Page map

```
[nav, fixed]
THE DESK            1. Hero
                    2. Interests → intersection   (sticky stage)
THE LISTENING ROOM  3. Projects                   (sticky turntable + list)
                    4. About (the back cover)
OUT BACK            5. Contact (the postcard)
                    6. Footer
+ airborder/ case study, restyled (the template for future case studies)
```

---

## 6. Sections

Copy marked **DRAFT** needs Mark's approval. Offer the options; don't pick for Mark.

### 6.1 Nav

- **Position.** Fixed at the top. It's transparent at the very top of the page. After 24px of scrolling it becomes a solid paper bar (no blur) with a hairline bottom border.
- **Surface.** It stays paper over walnut and sand, so it's readable everywhere.
- **Left:** the "Mark Anjoul" wordmark (Mona Sans, condensed, 700), linking to `#top`.
- **Right:** Projects, About, Contact, and Resume ↗ (the PDF, in a new tab).
- **Active section.** A ballpoint underline draws itself under the active item (SVG path, 280ms).
- **Resume** gets a pen circle around it, as in inspo 01. Nav items are links, so hover states are allowed.
- **Phones.**
  - The bar holds the wordmark and a "Menu" text button.
  - The button opens a full-screen paper sheet with large links, including Resume.
  - Esc or the button closes the sheet, and focus is trapped while it's open.

### 6.2 Hero (the desk)

```
┌ Mark Anjoul ······························ Projects  About  Contact  (Resume) ┐
│                                                                               │
│  ● Open to new-grad roles, [start date]          hi, nice to meet you  ↘      │
│                                                    ┌─────────────┐  ┌──────┐  │
│  Mark                                              │  Polaroid   │==│ index│  │
│  Anjoul                                            │  of Mark    │  │ card │  │
│                                                    │             │  └──────┘  │
│  I design products, then I build them myself.      │[me, place]  │            │
│  CS at USF. HRI research at the RARE Lab.          └─────────────┘            │
│  ( See my work )  ( Resume )                                                  │
│                                    ▁▁ corners of the next objects peek in ▁▁  │
└───────────────────────────────────────────────────────────────────────────────┘
```

**Columns 1 to 7**

- **Status line:** a small green LED dot (echoing the turntable's power light) and "Open to new-grad roles, [start date]".
- **H1:** "Mark Anjoul" at display size, condensed, on two lines, like a poster.
- **Lede**, max 34ch. DRAFT options:
  - A. "I design interfaces and build them."
  - B. "I design products, then I build them myself."
  - C. "I make software that feels like something you can hold."
- **Second line** (DRAFT): "CS at USF. Human-robot interaction research at the RARE Lab."
- **Buttons:** "See my work" (primary, goes to `#projects`) and "Resume" (secondary).

**Columns 8 to 12**

- A Polaroid of Mark, rotated −3°.
- A red paper clip holding a small index card to the Polaroid. On the card, in ballpoint: "hi, nice to meet you" (DRAFT, after inspo 01), with an arrow to the photo.
- A handwritten caption on the Polaroid's bottom strip: `[me, place, year]`.

**Bottom edge.** The corners of two objects from the next section peek into view, inviting the scroll.

**Phone (390×844)**

- Order: the Polaroid on top (about 220px wide), then the name, lede and status, then both buttons side by side.
- Everything fits on one screen.

**Load choreography:** 8.3 (1).

### 6.3 Interests and the intersection (the desk)

This is the heart of what Mark asked for: interests from both sides, and where they meet. There are two piles, and each object has a ballpoint label naming its interest.

| Off the clock | Object | Content |
|---|---|---|
| music | A cassette with a handwritten J-card | [3 favorite songs or albums] |
| movies | Two ticket stubs (perforated edge, printed type) | [favorite film 1], [favorite film 2] |
| art | A postcard print held on with washi tape | [a favorite artwork: public domain or Mark's own] |
| pop culture | Two or three pins or stickers, drawn by you, no copied logos | [Mark's picks] |
| the beach | A small Polaroid | [photo of the beach Mark goes to] |

| On the clock | Object | Content |
|---|---|---|
| interfaces | A phone showing a real screen | `assets/appnest/screens/01-applications.webp` |
| UI | A sheet of UI-component stickers, whose toggle sticker really toggles | Toggle, slider, chip, button |
| UX | Three sticky notes | Real AirBorder findings: "'Easy' didn't mean they found it", "Show what changed and when", "Same need, different guidance" |
| animation | A flipbook you can flip (8.4) | 12 ink frames of a record dropping onto a platter and starting to spin |
| HCI | [a photo of the RARE Lab robot], or a ballpoint robot sketch on an index card | |

The cassette and the ticket stubs carry Mark's real favorites in print and handwriting without reproducing anyone's album art or posters.

**Structure**

- **H2:** one per section: the thesis line (below). It must be in the DOM and readable before any animation runs.
- **H3s:** each pile has one, "Off the clock" and "On the clock".
- **Object text:** all information on the objects is real HTML text.

```
 apart (scroll progress .10)                     together (progress .70)
 ┌ Off the clock ─┐        ┌ On the clock ──┐     ┌──────────────────────────┐
 │ cassette  tix  │        │ phone  stickers│     │   piles interleaved      │
 │ art  pins      │        │ notes  flipbook│ ──▶ │ "The things I love end   │
 │ beach          │        │ HCI            │     │  up in the things I make"│
 └────────────────┘        └────────────────┘     └──────────────────────────┘
```

**Desktop**

- **Stage:** the section is about 220vh tall, with a 100vh sticky stage inside.
- **Convergence:** the piles start apart, in the left and right thirds. As you scroll they slide together and interleave until they overlap by about a third. The thesis appears in the overlap. Choreography: 8.3 (2).
- **Thesis**, DRAFT options:
  - A. "The things I love end up in the things I make."
  - B. "Interfaces that feel like real things."
  - C. "Music taught me timing. Movies taught me cuts. The beach taught me to slow down." (Use this only if it's true for Mark.)
- **Aside under the thesis** (DRAFT): a ballpoint note pointing down into the next room, "↓ what came out of it".
- **Dragging:** every object can be dragged with a mouse (section 9).
- **Tidy up:** after the first drag, a ballpoint "tidy up ↺" link appears. It returns every moved object to its knolled spot.

**Phones**

- There's no sticky stage.
- Order: the "Off the clock" pile as a loose fan, then the thesis, then the "On the clock" fan.
- As the thesis scrolls into view, the nearest object in each pile drifts about 24px toward it.
- Dragging is off on touch, so the page scrolls normally.

### 6.4 Projects (the listening room)

The surface is walnut. The heading is "Projects". No music aside.

```
┌──────────────────────────────── walnut ────────────────────────────────────┐
│ Projects                                                                   │
│ ┌──────────────────┐            ┌────────┐  UX research · 2026              │
│ │    turntable     │  sticky    │ sleeve │  AirBorder                      │
│ │   ( ◉ record )   │            │  280px │  Shows how much free time…      │
│ │  33 45   ● LED   │            └────────┘  Interview analysis · Team of 3 │
│ └──────────────────┘          ←             (Details) (Case study ↗)       │
│ AirBorder · 2026                                                           │
│                                 ┌────────┐  iOS app · 2025 …                │
└────────────────────────────────────────────────────────────────────────────┘
```

**Desktop (1024px and up).** Two columns.

**Left column (5/12, sticky, top about 12vh): the turntable.** It always plays the active project. Under it, in plain text, the active project's name and year: "AirBorder · 2026". This is not a live region; it would chatter.

**Right column (7/12): the list.** One entry per project, with about 16 to 20vh of space between entries. Each entry contains:

- **Sleeve:** LP sleeves are 280px square. Singles are 7/12 of that, about 163px. Covers follow 7.4.
- **Meta line:** the project type and year, for example "UX research · 2026", small, with tabular numbers. No catalog numbers or formats in text.
- **Title.**
- **One-liner:** the `tagline`.
- **Role line.** Lead with Mark's role and the result, not the tech stack (`PORTFOLIO-REVIEW.md`). Example: "Interview analysis and co-design · Team of 3 · Prototype".
- **Buttons:** "Details" (a toggle), plus "Case study ↗", "Live site ↗" and "GitHub ↗" when those links exist.

**Order**

1. The LPs: AirBorder, AppNest, OIS.
2. A plain divider reading "Smaller projects".
3. The singles: Groov, Hit Song Predictor, NoteWeb.
4. The RARE Lab test pressing, if it exists.

**Active entry**

- The active entry is the one crossing the middle of the viewport (ScrollTrigger `start: "top 60%"`, `end: "bottom 40%"`).
- When it changes, the turntable swaps records: 8.3 (3).
- The active entry gets a small ballpoint arrow pointing at the turntable. No words.

**Tonearm.** While an entry is active, scrolling through it moves the tonearm inward by about 16°, like a record playing.

**Scratch.** The record on the platter can be dragged: 8.3 (3).

**Phones and tablets (below 1024px)**

- There's no turntable column. Each entry stacks its sleeve, then its text. LP sleeves are full width up to 360px; singles are 60% of that.
- When an entry is active, its record slides halfway out of the sleeve to the right and spins at its speed.
- There's no fixed mini-player. A bar that looks tappable but isn't is worse than none.

**Details panel.** This replaces the old case-study modal; there are no project modals. Each entry expands in place.

- **The toggle.** A "Details" button with `aria-expanded` and `aria-controls`.
- **One open at a time.** If opening one entry closes another above it, correct the scroll position so the clicked entry doesn't jump.
- **Content, in order:**
  1. The about paragraph (`about`).
  2. "Features": the `features` as a numbered list with tabular numerals.
  3. Screens: a horizontal scroll-snap row of phone frames from `gallery`.
     - `notes` become ballpoint callouts on the screenshots.
     - Where an item has a `dark` image, add a physical slide switch (`role="switch"`) for Light and Dark.
  4. Credits: a definition list of Role, Team, Timeline, Tools (`stack`) and Status.
  5. Links.
- **Motion:** 8.3 (4).
- **Deep links.** `#<project-id>` (for example `#appnest`) scrolls to that entry and opens its notes. Keep the hash in sync with `history.replaceState`.

### 6.5 About (the back cover)

This is still on walnut. It's one large object: the back of Mark's own record sleeve, in card stock, about 760px square on desktop and full width on phones. Lay it out like a real back cover.

**Top left.** "Mark Anjoul", with "Selected projects, 2024–2026" under it (DRAFT; check the years).

**Top right.** A small black-and-white photo of Mark.

**Left column: the bio.** DRAFT, rewritten per `PORTFOLIO-REVIEW.md` §4 to lead with design:

> I design products and build them myself. I like starting with people (interviews, task tests, rough sketches), prototyping in Figma, then building the real thing in SwiftUI or on the web, down to the small details.
>
> I'm a Computer Science student at the University of South Florida and an undergraduate researcher at USF's RARE Lab, where I study human-robot interaction: social robots, language models, and what makes a machine feel natural to talk to.

**Right column: "Credits".** Plain text, with **no logo wall** (review §5). Mark can trim this list.

- **Design:** Figma, Miro, Notion · UX research, prototyping, design systems, interaction design
- **Build:** Swift, SwiftUI, UIKit, SwiftData, JavaScript, React, HTML and CSS, Python, Flask, Firebase, C/C++, Java
- **Research:** MediaPipe, OpenCV, Raspberry Pi, Ollama, LLMs, RAG, scikit-learn, pandas
- **Recorded at:** University of South Florida, Tampa, FL

**Bottom strip.**

- a decorative barcode (`aria-hidden`);
- "℗ © 2026 Mark Anjoul";
- a small "MA" label mark;
- the link "Full credits: resume (PDF) ↗".

### 6.6 Contact (out back)

The surface is sand, with a striped cotton beach towel across the middle. On the towel, knolled, are the postcard and two or three other objects.

**The postcard** is about 560×380 on desktop and full width on phones. The back faces up by default, so the information is visible straight away.

- **Left half:** a handwritten message. DRAFT:
  > Thanks for stopping by. I'm looking for new-grad roles in UX, product design or software engineering, starting [date]. If you're hiring or building something, or you just want to talk design, code or robots, write me. Mark
- **Right half:** the address lines:
  - the email: a copy button on hover-capable devices, a `mailto:` link on touch;
  - linkedin.com/in/markanjoul;
  - github.com/marcanjoul;
  - Resume (PDF).
- **Stamp:** top right, a tiny drawn record or palm, with a perforated edge made by a mask.
- **Postmark:** over the stamp, "TAMPA FL" with the current month and year, written by JS.
- **"Turn over" button:** flips the card (8.3 (5)). The front is Mark's beach photo, optionally in large-letter "Greetings from [beach]" style.

**Other objects:** two or three at most, such as sunglasses, a shell, or a Walkman with headphones (music plus pop culture). They can be dragged with a mouse.

**Heading:** the H2 is "Say hi". The nav label stays "Contact".

### 6.7 Footer

On the sand, below the towel: "© 2026 Mark Anjoul · Made in Tampa" (DRAFT), plus "Back to top ↑".

### 6.8 Case study pages (`airborder/`)

- **Styles.** `airborder/index.html` currently depends on the shared `styles.css` for about 30 `cs-*` classes.
  - Move those styles into a new `case-study.css`, built on the new tokens, and link it from the page.
  - Keep all of the case study's copy and structure.
- **The look: a printed booklet that came inside a record sleeve.**
  - Paper surface. No walnut: this page is for reading.
  - Mona Sans body at 18px with a 68ch measure, and condensed display H2s.
  - Screenshots in phone frames with ballpoint callouts.
  - The credits block (role, team, timeline, tools, status) set like back-cover credits.
- **Header.** The project's LP sleeve on the left; title, lede and credits on the right.
- **Back link.** "← All projects" goes to `/#airborder`.
- **View Transitions.** Add `@view-transition { navigation: auto; }` to both pages and give the sleeve a shared `view-transition-name`, so the sleeve morphs into the case-study header. This is progressive enhancement: browsers without support just navigate.
- **AppNest.** It has no case study yet. Writing one is separate work, so don't draft it unless Mark asks.

---

## 7. Design system

### 7.1 Color

**Strategy: natural materials plus one ink.**

- The surfaces supply the base color: white paper, walnut, sand.
- The content supplies the saturated color: sleeves and photos.
- Ballpoint blue is the only UI accent. Use it for links, focus, active states and handwriting.
- Not cream. The old site was restrained-on-cream; this one is white, wood and sand.

```css
:root {
  /* surfaces */
  --paper:       oklch(98.6% 0.004 95);
  --paper-2:     oklch(96% 0.006 95);       /* inner sleeves, index cards */
  --grid-line:   oklch(86% 0.012 240 / .35);
  --walnut:      oklch(32% 0.045 50);       /* under the wood texture */
  --walnut-deep: oklch(25% 0.04 45);
  --sand:        oklch(86% 0.045 80);       /* under the sand texture */

  /* type */
  --ink:       oklch(21% 0.012 260);
  --ink-2:     oklch(40% 0.012 260);
  --ink-3:     oklch(52% 0.01 260);         /* small meta only; verify 4.5:1 */
  --on-wood:   oklch(96% 0.01 85);
  --on-wood-2: oklch(82% 0.02 80);

  /* the human layer */
  --ballpoint:   oklch(44% 0.19 266);       /* Bic Cristal blue */
  --highlighter: oklch(92% 0.17 105 / .55); /* at most twice on the whole site */

  /* objects */
  --vinyl:       oklch(17% 0.005 260);
  --clip-red:    oklch(57% 0.2 27);
  --clip-yellow: oklch(84% 0.16 88);
  --led:         oklch(78% 0.2 145);
}
```

- Tune these values by eye against the real textures, then re-check contrast.
- Sleeve and label colors come from each project's own icon or screens:
  - sample them with `magick <img> -resize 1x1 txt:`;
  - convert to OKLCH;
  - keep L between 55% and 75%.

### 7.2 Type

**Mona Sans** (variable: `wdth` 75 to 125, `wght` 200 to 900; OFL; on Google Fonts and at github.com/github/mona-sans).

- Self-host the Latin-subset woff2 in `assets/fonts/`, preload it, and use `font-display: swap`.
- One family does everything, through its width axis:

| Role | Settings | Size |
|---|---|---|
| Display | wdth 75, wght 800, tracking −0.015em, line-height .92 | `clamp(4.5rem, 3rem + 7vw, 10rem)` |
| Section heading | wdth 75, wght 760 | `clamp(2.75rem, 2rem + 3.5vw, 5rem)` |
| Title | wdth 87.5, wght 680 | `clamp(1.6rem, 1.3rem + 1.2vw, 2.25rem)` |
| Lede | wdth 100, wght 450 | `clamp(1.2rem, 1.1rem + .4vw, 1.45rem)` |
| Body | wdth 100, wght 420, line-height 1.6, max 68ch | 17px, rising to 18px at 1280px and up |
| Meta | wdth 100, wght 560, tabular numerals, sentence case | 14px |
| Printed matter on objects | wdth 75 to 87.5; caps allowed | as the object needs |

**Handwriting, in ballpoint blue**

1. **Best: Mark's own handwriting.** Either:
   - Mark fills in a Calligraphr template (free tier, 75 glyphs) and you get a real font; or
   - Mark writes the phrases in section 14 and you cut them out as transparent WebP images.
2. **Fallback:** Reenie Beanie (Google Fonts, OFL).

Rules for handwriting:

- at least 22px rendered;
- at most three notes per viewport;
- never the only place a piece of information appears.

**Don't use**

- Anything on impeccable's reflex list: Inter, DM Sans, Instrument Sans or Serif, Fraunces, Space Grotesk, Space Mono, IBM Plex, Cormorant, Playfair, Outfit, Plus Jakarta.
- The old site's fonts: Llewie, Winky Rough, Roboto. Delete them from `assets/fonts/` once nothing references them.

Share Tech Mono (already in `assets/fonts/`) is allowed only inside ticket stubs, and only if Mona Sans doesn't sell the printed look.

### 7.3 Surfaces and textures

**Where textures come from**, in order of preference:

1. Photographs of Mark's real things (section 14).
2. CC0 photo textures from ambientCG or Poly Haven. Record each source URL in `assets/textures/SOURCES.md`.
3. Procedural: CSS gradients, plus noise tiles rendered once with ImageMagick (installed) and saved as WebP.

**Never use live SVG filters for texture.** There's also **no page-wide grain overlay**; the old site had one.

| Surface or material | Recipe |
|---|---|
| Desk paper | `--paper`; a 24px grid of 1px `--grid-line`; a 256px fiber-noise tile multiplied at about 6% |
| Walnut | A dark walnut texture tile (1024px, WebP, 120 KB or less), with grain contrast low enough that `--on-wood` text stays above 7:1 |
| Sand | A top-down sand texture tile (1024px, 120 KB or less) |
| Towel | Stripes from `repeating-linear-gradient`, a woven-noise tile multiplied over them, a fringe on the short ends |
| Sleeve cardboard | See below |
| Shrink-wrap | A diagonal glossy highlight at low opacity that sweeps across on hover (sleeves are clickable) |

The sleeve cardboard needs four layers:

1. the cover art;
2. a noise tile multiplied over it at 10 to 14%, so the print takes on the board's texture;
3. a faint ring-wear circle (a radial gradient about 4% lighter);
4. 1px lighter edges and a 2px corner radius.

### 7.4 Objects

**Vinyl record.** The realism trick is that the grooves and the label rotate and the sheen doesn't. Reflections stay put relative to the light.

```html
<div class="record" data-format="lp">
  <div class="record-spin"><div class="record-label">…</div></div>
  <div class="record-sheen" aria-hidden="true"></div>
</div>
```

```css
.record { position: relative; aspect-ratio: 1; border-radius: 50%; background: var(--vinyl); }
.record-spin { position: absolute; inset: 0; border-radius: 50%;
  background: repeating-radial-gradient(circle, oklch(15% 0 0) 0 1px, oklch(19% 0 0) 1px 2px); }
.record-label { position: absolute; inset: 33%; border-radius: 50%; background: var(--label, oklch(70% .12 40)); }
.record-sheen { position: absolute; inset: 0; border-radius: 50%; pointer-events: none; mix-blend-mode: screen;
  background: conic-gradient(from 30deg, transparent 0 8%, oklch(100% 0 0 / .14) 12%, transparent 18% 52%,
                                         oklch(100% 0 0 / .1) 62%, transparent 68%); }
```

On top of that recipe, add:

- the lead-in band at the rim;
- a smoother run-out band next to the label;
- the spindle hole;
- for singles, a wide center hole with a "spider" 45 adapter.

The label shows the title, year, format and catalog number, set like printed matter.

**Turntable.** Minimal, in the spirit of Rams-era Braun, with no logos and no copy of a real model:

- an off-white plinth, about 520×430 on desktop;
- an aluminium platter rim (conic gradient) and a black mat;
- a slim silver tonearm with a black headshell and a counterweight (SVG);
- a 33/45 switch that flips to match the record's format;
- a start button and a green power LED (`--led`).

**Sleeve covers.** A house style, like a record label's catalog. There are three layouts; alternate them so neighboring sleeves never match.

- **`phone`:**
  - the sleeve color, with one app screen at about 62% of the sleeve's height, offset right and bleeding off the bottom;
  - the title, small, at top left;
  - the app icon as the label mark at bottom left.
- **`type`:** the title huge in condensed display, filling the sleeve, on a two-tone color split. Use it for projects without a strong screenshot, such as NoteWeb.
- **`crop`:** a tight, full-bleed crop of a UI or chart detail, duotoned into the sleeve color, with a title strip along the bottom.

Every sleeve shares:

- the same title face;
- the same small "MA" mark in the same corner;
- the catalog number on the top edge;
- the hype sticker, round or rounded-rectangle, on the shrink-wrap.

**Other objects**

- **Polaroid:** a 1:1 image, with the frame's bottom strip thicker than the other sides.
- **Index card:** printed ruled lines with a red top rule.
- **Paper clip and binder clip:** SVG with a metal gradient. They sit over the edge of whatever they hold.
- **Washi tape:** semi-transparent, with torn ends made by a jagged `clip-path`.
- **Ticket stub:** a perforated edge made with a `radial-gradient` mask, and printed type.
- **Cassette:** a J-card with handwriting, two reels and the window.
- **Sticky notes:** a slight curl, made with a gradient along the bottom edge.
- **Sticker sheet:** die-cut stickers with white borders.
- **Flipbook:** a stack of page edges, with the frames as SVG.
- **Phone:** a thin, dark, rounded bezel with the real screenshot inside. No notch theatrics.
- **Postcard:** card stock, a dividing line, address lines.
- **Stamp:** a perforated mask.
- **Postmark:** a circle and wavy cancel lines, with uneven ink opacity.
- **Sunglasses, shell, Walkman:** photograph them if possible. Otherwise draw them simply; don't fake photorealism badly.

### 7.5 Light and shadow

Shadows always fall down and to the right. Each has two layers: a tight contact shadow and a soft ambient one.

```css
--shadow-rest: 1px 2px 2px oklch(20% .02 60 / .16), 4px 10px 18px -6px oklch(20% .02 60 / .18);
--shadow-lift: 2px 4px 4px oklch(20% .02 60 / .12), 10px 24px 36px -10px oklch(20% .02 60 / .24);
--shadow-held: 4px 8px 8px oklch(20% .02 60 / .10), 18px 40px 56px -14px oklch(20% .02 60 / .28);
```

- On walnut, raise the opacity about 1.5×. On sand, warm the shadow's hue.
- For performance, don't animate `box-shadow` on many elements. Give each object an `::after` that holds the larger shadow, and animate that layer's opacity.

### 7.6 Layout

- **Grid.** 12 columns, 24px gutters, max content width 1280px, side margins `clamp(20px, 5vw, 80px)`. Objects may break out of the grid; text doesn't.
- **Rhythm.** It varies by section:
  - hero: one full viewport;
  - interests: a 220vh sticky stage;
  - projects: long, with room to breathe between entries;
  - about: compact;
  - beach: one viewport.
- **Alignment.** Left-aligned text, asymmetric compositions. Don't center-stack everything.
- **Breakpoints:**

| Width | Changes |
|---|---|
| 1280px and up | The full layout |
| 1024 to 1279px | A narrower turntable column |
| 768 to 1023px | The phone pattern for projects, with wider margins |
| Below 768px | Phone |

### 7.7 Controls

- **Buttons are pills.**
  - Primary: `--ink` fill with paper text.
  - Secondary: a 1.5px ink outline.
  - On walnut, the same, inverted.
  - They feel physical: on `:active`, `translateY(1px)` and a smaller shadow. On hover (fine pointers only), they lighten slightly.
- **Text links.** Ballpoint blue, with a 1px underline at a 3px offset that thickens to 2px on hover.
- **Focus.** A 2px solid outline at a 3px offset, in ballpoint blue on paper or `--on-wood` on walnut. Always visible on `:focus-visible`.
- **Touch targets.** At least 44×44px.

---

## 8. Motion

### 8.1 Principles

1. **Motion on intent.** Things move because you scrolled to them, touched them, or the page just loaded. Nothing loops forever except a spinning record, and only while it's on screen.
2. **Lift before you move.** The shadow grows first (80 to 120ms), then the object travels.
3. **Land, don't bounce.** Arrive on an exponential ease-out, with the shadow tightening over the last 30%. Never use back, elastic or bounce easing.
4. **Mass sets speed.**
   - Paper: 250 to 400ms.
   - Sleeves: 450 to 600ms.
   - Records: 500 to 700ms.
   - Platter: 900ms to spin up, 1600ms to spin down.
5. **Small rotations.** Objects at rest sit between −6° and +6°. Held objects straighten toward 0°.
6. **Interruptible.** New input retargets the running tween (`overwrite: "auto"`). Never queue one animation behind another.
7. **Transform and opacity only**, except where this brief says otherwise.

### 8.2 Tokens

```css
--ease-out:      cubic-bezier(.16, 1, .3, 1);   /* GSAP "expo.out" */
--ease-out-soft: cubic-bezier(.25, 1, .5, 1);   /* "quart.out" */
--ease-swing:    cubic-bezier(.76, 0, .24, 1);  /* "quart.inOut": arm and card swings */
--dur-press: 120ms; --dur-hover: 220ms; --dur-move: 450ms; --dur-scene: 800ms; --dur-long: 1200ms;
```

### 8.3 The five signature moments

**(1) The Polaroid develops** (page load)

Content is never hidden without JS. With JS, the hero entrance finishes within 800ms; only the Polaroid keeps developing after that.

| Time | What happens |
|---|---|
| 0 to 700ms | The H1 lines rise 16px and fade in (expo.out, 90ms stagger) |
| 150 to 750ms | The lede, status and buttons rise 8px |
| 250 to 1050ms | The Polaroid drops onto the desk, from y −24px, scale 1.06, −7° and `--shadow-held` to rest at −3° with `--shadow-rest` |
| 900 to 1700ms | The clip slides on (10px). The ballpoint note writes in (a left-to-right mask wipe). The arrow draws (stroke-dashoffset). |
| 1000 to 3400ms | The photo develops |

- **How to develop the photo.** Stack two layers: a static, desaturated, milky version underneath, and the real photo on top, fading from 0 to 1 (power1.inOut). Don't animate `filter`.
- **Easter egg (optional, pop culture).** Shaking the Polaroid (dragging it back and forth) speeds up the developing. It's a nod to "shake it like a Polaroid picture".

**(2) Two piles become one** (scroll, desktop)

ScrollTrigger on the 220vh section: `start: "top top"`, `end: "bottom bottom"`, `scrub: 0.8`.

| Progress | What happens |
|---|---|
| 0 to .10 | Hold |
| .10 to .60 | Each object moves from its "apart" position and rotation to its "together" one. Front objects lag about 10%, so it reads as layered. The two H3s drift toward the center and fade out by .50. |
| .40 | Re-interleave the z-index so the piles shuffle into each other |
| .45 to .70 | The thesis wipes in, and a ballpoint underline draws under its key word |
| .70 to 1 | Hold |

- Author both the "apart" and the "together" positions by hand, as percentages of the stage. Don't compute them.
- Each object has an outer wrapper for the scroll transforms and an inner element for the drag transforms, so the two never fight.
- Author at 1440×900, then check at 1280×720 and 1920×1080.

**(3) The record swap and the scratch** (scroll and drag, desktop)

- **Trigger:** the active entry changes.
  - Wait for 120ms of stability before acting.
  - If a swap is already running, let it finish removing the current record, then go straight to the newest one.
- **Sequence** (about 1.5 to 2s):

| Time | What happens |
|---|---|
| 0 to 150ms | The tonearm lifts (scale 1.03, larger shadow) |
| 100 to 500ms | The arm swings to rest (400ms, quart.inOut) |
| 200 to 700ms | The platter slows to 0 (500ms, quart.out) while the record slides out toward the list (quart.in) |
| 650 to 1150ms | The new record slides in from the right and lands (expo.out; the shadow tightens) |
| 1100ms | The 33/45 switch flips, if the format changed |
| 1150 to 2000ms | The platter spins up (power2.in on angular velocity). The arm swings to the lead-in groove, then lowers (120ms). |

- **Spin.**
  - A single `gsap.ticker` callback adds `velocity × dt` to the rotation.
  - Velocity is a tweened number: 200°/s for LPs, 270°/s for singles.
  - Remove the ticker callback while the section is off screen (IntersectionObserver).
- **Scratch.**
  - Use `Draggable.create(".record-spin", { type: "rotation", inertia: true })` on fine pointers.
  - While the record is held, the spin ticker pauses.
  - On release, the record coasts on inertia, then eases back to nominal speed over 800ms.
  - The cursor is `grab`, then `grabbing`.
  - The record is `aria-hidden`; it's a pointer-only toy.
- **Phones.**
  - The active sleeve's record slides 50% out to the right (500ms, expo.out) and spins.
  - There's no scratch on touch.

**(4) Details open** (click)

| Time | What happens |
|---|---|
| 0 to 450ms | The sleeve slides 10% left while the inner sleeve (paper, with a circular cutout showing the label) slides 35% out to the right (expo.out) |
| 100 to 600ms | The panel expands: transition `grid-template-rows` from `0fr` to `1fr` over 500ms. Its blocks rise 8px with a 40ms stagger. |

- **Close:** the reverse, at 0.7× the duration.
- **Focus:** it stays on the toggle button (the disclosure pattern). Esc closes the notes and returns focus to the toggle.

**(5) The postcard turns over** (click)

- `rotateY` from 0 to 180° over 700ms (quart.inOut), with `perspective: 1200px`.
- At the midpoint the card lifts to scale 1.04 with `--shadow-held`, then settles.
- Both faces use `backface-visibility: hidden`.

### 8.4 Small moments

- **Nav.** The ballpoint underline draws under the new active item (280ms) while the old one fades (150ms).
- **Ballpoint notes.** Each one writes itself in once, the first time it enters view: a left-to-right mask, 600 to 900ms per line.
- **Sleeve hover (fine pointers).**
  - `--shadow-lift`, rising 2px.
  - The shrink-wrap glint sweeps across (600ms).
  - On press, the sleeve returns to rest.
- **Draggable objects.**
  - Hover: `cursor: grab` and a lift.
  - Drag: `--shadow-held`; rotation eases toward 0°; `cursor: grabbing`.
  - Drop: an expo.out landing that settles at ±2°.
  - Movement is bounded to the section. Positions aren't persisted.
- **Tidy up.** Every moved object flies back to its knolled spot (600ms expo.out, 30ms stagger).
- **Flipbook.**
  - It's a `<button>` labelled "Flip the flipbook".
  - A click riffles all 12 frames at about 14fps (850ms), with a slight flutter at the page edges.
  - Optionally, dragging the corner scrubs through the frames.
- **UI sticker toggle.** A real `<button role="switch">` whose knob slides over 220ms (quart.out).
- **Copy email.**
  - The click copies the address to the clipboard.
  - A ballpoint "copied!" writes in beside it, then fades after 1.8s.
  - A polite live region announces "Email address copied".
  - If the copy fails, fall back to `mailto:`.
- **Smooth scroll.** Lenis on fine pointers only (`lerp: 0.1`), off on touch and under reduced motion. Wire it to ScrollTrigger:
  - `lenis.on('scroll', ScrollTrigger.update)`;
  - `gsap.ticker.add(t => lenis.raf(t * 1000))`;
  - `gsap.ticker.lagSmoothing(0)`.

### 8.5 Reduced motion

With `prefers-reduced-motion: reduce`:

- no Lenis;
- no sticky stage: the piles render in their "together" layout;
- the Polaroid starts developed;
- records don't spin;
- record swaps, the details panel and the postcard flip become crossfades of 150ms or less;
- ballpoint notes start fully written.

Dragging still works, because it's direct manipulation.

---

## 9. Interaction rules

- **Hover.** Only on things you can click or drag, and only inside `@media (hover: hover) and (pointer: fine)`.
- **Clickable elements.** Everything clickable is a real `<a>` or `<button>` with an accessible name. Never a clickable `<div>`.
- **Draggable objects.**
  - They work with a mouse or pen only; dragging is off on touch.
  - Their default is `touch-action: pan-y`.
  - They contain real text, so they aren't `aria-hidden`. Dragging is an extra, not the way to reach information.
- **Keyboard.**
  - Tab order follows the visual order.
  - Enter and Space activate.
  - Esc closes the details panel and the mobile menu.
  - Arrow keys are never hijacked.
- **Never:** a custom cursor, a cursor follower, magnetic buttons. No sound in v1.

---

## 10. Data: `projects.json`

Keep it as the single source of truth, rendered client-side as it is now. If the fetch fails, show a plain list of project names with their links, never an empty room.

**Keep these fields:** `id`, `title`, `shortTitle`, `type`, `stack`, `tagline`, `about`, `features`, `links`, `gallery`, `notes`, `logo`, `caseStudy`, `screens`.

**Remove these fields:**

- `size`;
- `tags` (the old cloud labels);
- `thumbnail` (replaced by `sleeve`).

Rewrite `_readme` to describe the new fields.

**Add these fields:**

```jsonc
"format": "lp",                           // "lp" | "single" | "test-pressing"
"catalog": "MA-001",
"year": "2026",
"role": "Interview analysis and co-design",
"team": "3 people",
"timeline": "Fall 2026",
"status": "Prototype, not built yet",     // omit once shipped
"sticker": "UX case study inside",        // the hype sticker, 5 words max
"sleeve": { "layout": "phone", "image": "assets/airborder/main-flight.webp", "color": "oklch(…)" },
"label":  { "color": "oklch(…)" },
"intersects": ["music"]                   // personal interests it genuinely touches; omit if none
```

**Starting values.** AirBorder's role, team and timeline come from its case study. Ask Mark for the others.

| id | format | sticker | sleeve layout | intersects |
|---|---|---|---|---|
| airborder | lp | UX case study inside | phone (`main-flight.webp`) | none |
| appnest | lp | Figma to SwiftUI | phone (`01-applications.webp`) | none |
| ois | lp | Live in [N] stores | crop (leaderboard, names blurred) | none |
| groov | single | Letterboxd for albums | phone (`discover.webp`) | music |
| spotify | single | Spoiler: mostly no | crop (`feature-importance.webp`) | music |
| noteweb | single | Runs fully offline | type (no real screenshot yet) | none |

- Never invent an intersection. If a project doesn't touch a personal interest, leave out `intersects`.
- Fix the em dashes in the existing `notes` text (for example, "stored on-device —").

---

## 11. Tech

**Stack.** It stays static: HTML, CSS and JS with no build step, on GitHub Pages (`CNAME` is markanjoul.com).

**Files**

- Rewrite `index.html`, `styles.css` and `app.js` from scratch. ES modules are fine.
- Add `case-study.css`.
- Migrate `projects.json`.
- Add `assets/textures/`, `assets/objects/` and `assets/me/`.
- Delete code and assets the new site doesn't reference. Git history keeps them.

**Libraries.** Pin these. All of these URLs returned 200 on 2026-11-22:

```
https://cdn.jsdelivr.net/npm/gsap@3.15.1/dist/gsap.min.js
https://cdn.jsdelivr.net/npm/gsap@3.15.1/dist/ScrollTrigger.min.js
https://cdn.jsdelivr.net/npm/gsap@3.15.1/dist/Draggable.min.js
https://cdn.jsdelivr.net/npm/gsap@3.15.1/dist/InertiaPlugin.min.js
https://cdn.jsdelivr.net/npm/gsap@3.15.1/dist/Flip.min.js        (only if you use Flip)
https://cdn.jsdelivr.net/npm/lenis@1.3.27/dist/lenis.min.js
https://cdn.jsdelivr.net/npm/lenis@1.3.27/dist/lenis.css
```

- All GSAP plugins have been free since 3.13.
- Drop Splitting.js and the old GSAP 3.12.5 cdnjs tags.
- Add nothing else: no three.js, no WebGL, no framework.

**Rendering**

- Objects are HTML and CSS.
- Line art (the tonearm, the stamp, the flipbook frames, ballpoint arrows and underlines) is inline SVG.
- No canvas is needed.

**No-JS.** A tiny inline script in `<head>` adds `class="js"`. Initial animation states live only under `.js`, so without JS everything is visible and static.

**Meta**

- Rewrite `<title>`, `description`, `og:*` and `twitter:*` to lead with product design (review §2). DRAFT description: "Mark Anjoul designs products and builds them: iOS and web apps, plus human-robot interaction research at USF's RARE Lab."
- `og:image` points at `https://markanjoul.com/og.png`, **which doesn't exist in the repo**, so link previews currently show no image.
  - Make a 1200×630 `og.png`: the desk flat-lay with the name.
  - Screenshot it from a scratch page with playwright-cli.

**Docs**

- **`README.md`:** the "Built with" list is stale. The LinkedIn URL is also wrong; it should be `linkedin.com/in/markanjoul`.
- **`PRODUCT.md`:**
  - It's gitignored, and the impeccable skill reads it.
  - It still describes the old hand-drawn site, so it will pull you back toward that design.
  - Rewrite it from sections 1 to 4 of this brief, with register: brand, before you run any impeccable command.
  - This brief replaces impeccable's `teach` and `shape` steps.
- **`DESIGN.md`:** optionally, run `/impeccable document` at the end to produce it.

---

## 12. Accessibility

- **Structure.**
  - Landmarks: `header`, `nav`, `main`, `footer`.
  - One H1, and one H2 per section, in order.
  - A "Skip to projects" link.
- **Alt text** that sounds like Mark, not like a filename. For example: "AppNest's applications list: twelve jobs grouped by status".
- **Decoration.** Decorative textures go in CSS backgrounds. Purely decorative SVGs are `aria-hidden`.
- **Widgets.** The details panel follows the disclosure pattern. The mobile menu is a dialog with a focus trap.
- **Contrast** is measured against the actual texture pixels under the text, not the token color.
- **Handwriting** is never the only place a piece of information exists.
- **Language and zoom.** `lang="en"`. Text zooms to 200% without breaking the layout.

---

## 13. Performance budget

**Weight**

- First viewport (HTML, CSS, JS, fonts, hero image): 600 KB transferred or less.
- The full page, with all textures and lazy-loaded images: 3 MB or less.
- JS (GSAP, plugins, Lenis and `app.js`): 120 KB gzipped or less.

**Images**

- Textures: 120 KB or less each, WebP or AVIF, tiled.
- Photos:
  - in `<picture>` with AVIF and WebP, with explicit width and height;
  - `loading="lazy"` below the fold;
  - `fetchpriority="high"` on the hero Polaroid.

**Runtime**

- A steady 60fps while scrolling on an M1 MacBook Air and an iPhone 13. That means:
  - transform and opacity only;
  - `will-change` only while something is moving;
  - offscreen loops paused.
- LCP under 2.5s.
- CLS under 0.05; every image and object reserves its box.

---

## 14. What Mark needs to supply

Send this list in Phase 0, and build with placeholders while you wait.

| Item | Format | Used in |
|---|---|---|
| A portrait for the Polaroid | 1600px or larger, natural light, color or B&W | Hero |
| A small B&W photo | Any | About |
| A photo of the beach Mark goes to, and the beach's name | 1600px or larger | Interests, postcard front |
| 2 or 3 candid photos (optional) | Any; say which can't be public | Interests |
| 3 favorite songs or albums | Text | Cassette J-card |
| 2 or 3 favorite films | Text | Ticket stubs |
| 1 or 2 favorite artworks or artists | Text, plus an image if it's public domain or Mark's own | Art postcard |
| 2 or 3 pop-culture loves | Text | Pins and stickers |
| A RARE Lab photo (the robot, the setup), if allowed | Any | HCI object, test pressing |
| Handwriting | A filled-in Calligraphr template, or the phrases below in blue ballpoint on white paper, photographed flat in daylight | All ballpoint notes |
| How many stores or people use OIS | Text | OIS sticker and credits |
| When Mark is available (graduation term) | Text | Status line, postcard |
| A NoteWeb screenshot, or "drop it" | PNG | NoteWeb sleeve |

The handwriting phrases:

- "hi, nice to meet you";
- the caption under the Polaroid;
- the ten interest labels;
- "tidy up", "copied!", "turn over";
- the postcard message, and the signature "Mark".

**Optional, high impact: photograph real objects.** If Mark owns a turntable, records, ticket stubs, sunglasses or similar, real objects beat any drawing.

1. Mark shoots them on a white sheet near a window in indirect daylight:
   - the phone straight overhead (use the camera's level guide);
   - the 1× lens, no flash;
   - all in one session, so the light matches.
2. Mark cuts each one out with iPhone "lift subject" or macOS Preview's Remove Background.
3. You convert them to WebP with alpha, at most 1200px on the long side.

---

## 15. Build plan

### Phase 0: setup (no visual work)

1. `git status`, then `git switch -c redesign`.
2. Read everything listed in section 0.
3. Rewrite `PRODUCT.md`.
4. Send Mark one message containing the open questions (section 16) and the content list (section 14). Keep working while you wait.

### Phase 1: a vertical slice, desktop first, ending at Checkpoint A

**Build:**

- the tokens, fonts, paper and walnut surfaces, and the nav;
- the hero, with the Polaroid developing;
- the turntable and two entries (AirBorder as an LP, Groov as a single), with the swap and the scratch.

**Checkpoint A.** Show Mark:

- three screenshots: the 1440×900 hero; the 1440×900 projects section with a record playing; the 390×844 hero;
- a 10 to 15 second video of the page load and one swap (`playwright-cli video-start`, then `video-stop`).

Ask whether to keep going or what to change. **Don't continue until Mark answers.**

### Phase 2: the whole page, ending at Checkpoint B

**Build:**

- the interests and the intersection;
- all projects from the JSON, with the details panel;
- the About section, the beach and the postcard;
- phone layouts and reduced motion.

**Checkpoint B.** Show full-page screenshots at desktop and phone sizes, and list the placeholders still waiting on Mark.

### Phase 3: case study and meta

- `case-study.css` and the AirBorder restyle.
- View Transitions.
- `og.png`, the meta tags, `README.md`.

### Phase 4: polish and verify

1. Run the checklist below and fix whatever fails.
2. If the impeccable skill is available, run `/impeccable audit`, then `/impeccable polish`.
3. Report to Mark: what's done, what's still a placeholder, and anything you decided without asking. Ask whether to commit.

### Verification checklist

**Code and console**

- [ ] `node --check app.js` passes.
- [ ] The console is clean at load and after scrolling from top to bottom.

**Screenshots and browsers**

- [ ] Every section at 1440×900, 1280×720, 1024×768, 390×844 and 360×740.
- [ ] A WebKit pass (`playwright-cli -s=webkit open --browser=webkit …`): scroll smoothness, the sticky stage, spinning, the postcard flip.
- [ ] No horizontal page scroll at any width.

**Motion and input**

- [ ] Reduced motion, via `playwright-cli run-code "async page => page.emulateMedia({ reducedMotion: 'reduce' })"`: nothing moves on scroll, and everything reads.
- [ ] Keyboard: Tab from top to bottom reaches every control in visual order, focus is always visible, and Esc works.
- [ ] Hover audit: hover over every non-interactive object. Nothing changes and the cursor stays default.

**Content**

- [ ] Contrast measured on the real backgrounds, including walnut.
- [ ] `grep -n "\[" index.html projects.json`: every remaining placeholder is listed in the report.
- [ ] `grep -n "—" index.html projects.json airborder/index.html` finds nothing in copy.
- [ ] OIS names are blurred in every image.

**Finish**

- [ ] Lighthouse mobile, if you can run it.
- [ ] Close the browsers and stop the local server (`python3 -m http.server 8765 --bind 127.0.0.1`).

---

## 16. Open questions for Mark

Ask these in Phase 0, each with the default you'll use if there's no answer.

1. **Target role: answered.** UX, product design and software engineering. Don't ask again.
2. **Records for projects.** Is that OK? Film posters were the alternative. *Default: records.*
3. **Hero lede and thesis.** Which drafts in 6.2 and 6.3 sound like Mark? Mark can rewrite them freely. *Default: lede B, thesis A.*
4. **Favorites, photos and handwriting.** See section 14.
5. **RARE Lab.** Is anything showable? If not, there's no test pressing.
6. **OIS.** How many stores or people use it?
7. **Availability.** When can Mark start?
8. **NoteWeb.** A real screenshot, or take it off the page? It's a placeholder today.

Mark responds best to screenshots and to short questions that come with a default.

---

## 17. Don't

**Concept and scenery**

- Draw a house, make a 3D or isometric room, or build room-by-room navigation. No WebGL or three.js.
- Add film posters as a second project system.
- Bring back anything from the old site:
  - the sky, sun, sea, clouds or boat;
  - the day-to-night progression;
  - the sketchy SVG filter;
  - the page-wide grain;
  - Llewie or Winky Rough;
  - the yellow pill nav.

**Visual effects and motion**

- Glassmorphism or backdrop blur, gradient text, neon glows, side-stripe borders.
- Bounce, elastic or back easing; parallax on text.
- Scrolljacking beyond the one sticky stage, or horizontal pinned scrolling.
- A custom cursor, a cursor follower, magnetic buttons, a preloader, autoplaying sound.

**Layout**

- A tool logo wall, a project modal, or a grid of identical cards.

**Copy and content**

- Em dashes, more than one exclamation mark, "passionate", or "I'm both a designer and a software engineer".
- Reproductions of real album covers, posters or brand logos on objects. Draw generic ones.
- Made-up favorites, numbers or quotes.

**Not in v1** (only if Mark asks later)

- A live "last played" track from Last.fm in the hero.
- A sound toggle with needle-drop and crackle.
- Object positions that persist between visits.

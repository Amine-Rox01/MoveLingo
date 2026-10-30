# MoveLingo · LessonForge

A responsive website for teaching English through physical movement and sport. Its library includes 40 original activities and later additions (82 in total), and its AI planner combines Total Physical Response and task-based learning with teacher-provided English and physical education goals.

## Run locally

Requirements: Node.js 22.13+ and npm. On Windows, install Node from its official distribution if npm is not available.

```sh
npm ci
npm run dev
```

Open the printed localhost URL (normally http://localhost:5173). The app uses the Sites Vinext starter: React 19, Next.js-compatible App Router, Vite and Cloudflare Workers. It retains the required Sites build plugin. Styling uses Tailwind CSS 4 plus a custom token-based stylesheet; GSAP drives scoped task and interface animation; Framer Motion supplies reduced-motion preferences; Recharts renders plan-derived charts.

## Connect real AI

Live AI is **not** simulated and no canned lesson is substituted if the service is unavailable.

1. Copy `.dev.vars.example` to `.dev.vars` for local development.
2. Set `GEMINI_API_KEY` to a valid Gemini key for a project on Google's free tier. The fixed model is `gemini-3.1-flash-lite`; verify eligibility and quota in Google AI Studio.
3. Restart the local server. Use the app's sign-in link if needed; the Sites starter supplies a local mock identity only on loopback. Hosted identity is verified by Sites.
4. For the hosted site, configure `GEMINI_API_KEY` as a secret through Sites, then redeploy the saved version. Do not put credentials in browser JavaScript, the hosting manifest, source control or lesson inputs.

Google's free tier is subject to eligibility, model availability and rate limits. Do not link paid billing if you cannot pay. Google says it may use free-tier content to improve its products; do not send student names or sensitive information. No key is bundled with this project. A configured key only indicates presence, not validity or available quota.

### AI contract

- `lib/prompt.ts`: exact system prompt and strict JSON schema.
- `lib/lesson.ts`: runtime input/output validation, source-quote checking and timing checks.
- `app/api/generate/route.ts`: server-only Gemini API request, same-origin check, authenticated identity check, bounded inputs, timeout and clear errors.
- Every request includes the actual teacher-selected skill, arbitrary topic, theme, objective, CEFR level, duration, class size, age, space, needs, sample and syllabus.
- Topic starters only prefill inputs. Teachers can select a movement activity from the library, and the AI adapts it to their own English topic and objectives. The saved movement example is labelled as an example, not a live result.
- AI revisions return structured content. Unrelated stages are preserved by the server. “Make shorter” reallocates the released minutes to assessment (or the preceding task when assessment is shortened).
- Source quotations are optional per stage. Verified quotations are copied back from the original sample after matching words and typographic formatting. Unverifiable AI quotation metadata is removed with a review notice; imported lessons still reject false quotations. This is a quotation fidelity check, **not** a guarantee of pedagogical or factual correctness. Teachers review generated plans.
- Motion demonstrations are activity-specific illustrated action sequences, not live video generation. Teachers must review activities and safety adaptations for their students and space.

## Feedback after a lesson

Open Feedback to link the open lesson and enter separate English and physical criteria. Rosters support up to 80 stable anonymous learners. The workspace stays mounted across app navigation. Device draft storage is opt-in; saved sessions and exports require explicit actions. A temporary tab-scoped copy preserves work across required local sign-in. AI feedback sends only observed learners in batches of up to 12 plus class counts; class-only feedback is supported without inventing learners. Completed batches remain available after a failure. A local evidence-only summary, charts and observation-based support adaptations work without AI. Feedback is editable and must be reviewed before copying. Follow-up comparisons require matching IDs, class/criteria and chronological dates; they describe support observations and do not establish causal learning gains.

## Teaching workflow

1. Choose Movement activities, browse or search the library, and select “Use this in my lesson”. In Create lesson, enter your English topic and objective, physical education goal, space and equipment. Choose any of eight English skills. Optional TXT/PDF/DOCX upload is extracted locally in the browser, limited to 8 MB and 16,000 extracted characters. PDF files must contain text; there is no OCR. Syllabus extracts are limited to 50 PDF pages and 16,000 characters.
2. Review the summary, timings and success criteria. Each stage includes aim, motion, activity purpose, teacher/student roles, exact instruction script, material contents, timed steps, adaptations, answers and a quick check.
3. Start teaching: stage outline, pauseable demonstration, timer, copy-ready instructions and completion controls. Browser read-aloud is optional and depends on local voice availability.
4. Save to this device, search/filter/duplicate/delete, export a real DOCX, print/save PDF, print a student handout, download JSON backup, or create a compressed share link.

Share links hold a copy in the URL fragment, not a cloud record. Original sample/syllabus/access notes are excluded but generated content may repeat their details. Review before sharing. The receiver must also have access to this private site. Private role cards in handouts must be separated by the teacher.

## Commands

```sh
npm test
npm run typecheck
npm run build
npm start
```

Tests cover the schema, arbitrary skill/topic inputs, source fidelity, duration, metrics, share payloads, authentication/origin checks, provider failures, Word export and stage revision behaviour. API tests use a labelled mock provider; they are not evidence of a successful paid/live API call.

For the optional browser audit, temporarily copy `tests/browser-audit.html` to `public/_qa.html` and `tests/axe.min.js` to `public/_qa-axe.js`. Run the development server, open `/_qa.html`, and use its Run button. Remove both temporary public files before building or deploying. The axe-core licence is `tests/axe-LICENSE.txt`.

## Source map

- `components/Studio.tsx`: navigation, generation, persistence and dialogs.
- `components/Landing.tsx`, `Builder.tsx`, `LessonView.tsx`, `Library.tsx`, `About.tsx`: user screens.
- `components/MovementLibrary.tsx`, `lib/movement-catalog.json`, `lib/movement.ts`: searchable movement activities and planner selection.
- `components/ActivityMotionPlayer.tsx`, `LessonVisual.tsx`, `LessonCharts.tsx`: visual teaching aids.
- `lib/files.ts`, `export.ts`, `storage.ts`: import, Word export, local storage and sharing.
- `lib/examples.ts`: saved movement demonstration and editable starters.
- `public/activity-toolkit.html`: earlier 82-activity toolkit, preserved as a separate resource.
- `app/globals.css`: responsive design tokens, light/dark themes and print layout.

## Deployment and limits

The `.openai/hosting.json` identifies this existing private Site. Reuse its identity; do not register duplicates. Build and deploy with the Sites workflow. Server keys are configured separately. The exported source package has no credentials.

The current generation limit is 10 requests per user per ten minutes **per Worker isolate**, not a distributed quota. Keep this deployment private. A public/multi-user launch needs a durable quota, provider budget limits, abuse monitoring and appropriate data governance. Saved lessons are browser-local, with no account cloud sync. Cross-browser speech, screen-reader operation and low-end devices require further testing. AI content, photo subjects and demo data are not evidence of learning gains. No book or country-specific syllabus is claimed.

References: [Gemini structured outputs](https://ai.google.dev/gemini-api/docs/generate-content/structured-output), [Gemini pricing](https://ai.google.dev/gemini-api/docs/pricing), [CEFR Companion Volume](https://www.coe.int/en/web/common-european-framework-reference-languages/cefr-companion-volume-and-its-language-versions), [British Council task-based approach](https://www.teachingenglish.org.uk/professional-development/teachers/knowing-subject/task-based-approach). See ASSETS.md for image attribution.

## Activity animations

All 82 library activities have a separate AI-generated six-frame illustrated action sequence. They depict successive actions with activity-specific people, equipment and layouts, without embedded titles or instruction paragraphs. These are short storyboard-style loops, not smooth generated videos. Review the procedure alongside the illustration before teaching.

The library and matching lesson stages use the same ActivityMotionPlayer, with play/pause, previous/next frame, replay, speed settings, optional browser narration and a downloadable looping GIF. Reduced-motion preferences disable autoplay. Media lives in public/images/activity-motion, indexed by lib/activity-motion.json. Animated WebP and GIF versions are included for reuse outside the website.

The AI selects a relevant activity ID for each stage. Older saved lessons use conservative name matching; teachers can choose or change the activity from the stage selector. An unmatched stage asks for a selection instead of showing an unrelated animation. The animation demonstrates the activity mechanics; the lesson provides its topic-specific English and adaptations. Arbitrary new activities do not receive new AI-generated videos at runtime.

The earlier user-supplied artwork is preserved in public/images/activities as source material; it is no longer the primary activity demonstration. The new sequences were generated with the built-in image-generation tool and encoded locally. scripts/assemble-activity-motion.py reproduces the encoding when source sheets and metadata are available.

## Performance charts

Feedback now includes optional teacher observations for English use, participation, teamwork and movement skills. Each domain can be marked substantial support, some support or independent, or left not observed. Live class distributions, support-priority bars, individual profiles, a data table and CSV export use only those ratings. Missing observations are excluded from support percentages. This is a single-task snapshot, not a standardized score or progress measure. Charts work locally without Gemini; submitted ratings also inform the AI feedback alongside written notes. Observations are not automatically saved.


## Moroccan middle-school theme collection

The existing four editable starters remain. Explore all themes now also contains 20 original, complete 50-minute lessons, four for each of the five English Spotlight 3 unit themes: summer experiences, clubs, celebrations, inventions and future plans. Unit filters, text search and six homepage highlights open ready plans without a Gemini request. Each opening creates an independent copy; existing save, export and Gemini adaptation controls still apply.

The plans include original model texts, questions and answer guidance, distinct information-gap tasks, teacher and learner roles, controlled movement or desk-token alternatives, peer checks and exit responses. Existing activity illustrations are assigned where their mechanics are applicable; they are not newly generated topic-specific videos. Unmatched tasks retain the manual animation selector and written procedure.

Theme naming was checked against the [English Spotlight 3 unit overview](https://fluentlearners.com/3rd-year-of-middle-school-english-spotlight-3-student-book-pdf/). [MyTeacher’s directory](https://myteacher.ma/textbook-directory/) lists several grade-three textbooks. This collection follows Spotlight 3 themes as inspiration, not a universal Moroccan textbook sequence. It does not reproduce textbook passages or claim ministry approval, full syllabus coverage, or verified CEFR alignment. A2 is an editable starting level; the teacher checks the school edition, progression and class needs.

Source: lib/morocco-theme-data.json and lib/morocco-themes.ts; UI: components/MoroccoThemes.tsx. Tests validate all 20 lesson schemas, timings, movement requirements, media references and independent opening copies.


## Visual coverage and AI reliability update · 29 October 2026

The Spotlight collection is grouped under the five published unit names, each with its own realistic AI-created photo and links to the original ready lesson activities. All 20 lessons and all prior features remain. Each lesson stage now has a contextual photo plus its matching library animation, or a code-native illustrated storyboard with play/pause and step controls. No stage relies on an empty image selector. A survey diagram is shown only for the authored fictional 12-learner teaching example, never as invented class-performance data. Realistic photos are static; motion comes from the existing six-frame activity sequences or the schematic SVG/CSS illustration.

Generation rechecks the server connection before every request and preserves the draft before local sign-in. Transient provider HTTP 500/502/503/504 responses receive at most two retries with backoff inside one shared 110-second deadline. Quota and key errors are not retried or disguised. Thought parts are excluded from the JSON answer; invalid field errors name the affected field without exposing provider credentials or source material. The free-tier model remains unchanged.

For local use, double-click RUN-MOVELINGO.cmd, or run npm run dev in this folder. Keep the console open and use its printed Local URL. Do not use a static HTML file for live AI. Both npm start and npm run dev now launch the local website with the development sign-in gateway. The former raw Worker preview is preserved as npm run preview:build and is intended for build inspection; it does not include the development gateway’s local sign-in flow. Production hosting supplies its own verified identity gateway. The key belongs in this folder’s .dev.vars and is never bundled into the downloadable source archive.

Verification: 33 automated tests pass, including rendering all 120 ready lesson stages and provider retry behavior. A live route test returned a validated five-stage 50-minute directions lesson. A live browser generation from the existing B1 narrative sample returned a five-stage 50-minute AI lesson. These successful calls demonstrate the configuration worked at test time; provider outages or later quota changes may still interrupt generation.


## GSAP animation system

GSAP is bundled locally through npm, with no animation API key or external CDN required. StageStoryboard now uses scoped GSAP timelines for mirrored gestures, information exchange, marker routes, writing, design, report checks and the authored survey chart. Existing activity GIF/WebP sequences and realistic context photos remain; each frame change now receives a short GSAP transition. Procedure play/pause controls govern the storyboard timeline; manual steps seek to an illustrative pose. Illustrations have speed and replay controls. Playback stops when its illustration leaves the viewport or the browser tab is hidden; unmounting reverts and cleans up its GSAP context.

SiteMotion adds short entrances to headings, photos, cards, lesson content and messages; pointer hover lifts cards and clicks give buttons brief feedback. Dialogs and feedback graph updates also use GSAP. Content stays present before enhancement and remains keyboard-operable. Operating-system reduced-motion preferences disable these GSAP effects. Animation is explanatory or navigational: it does not infer student performance, create new videos, or change teaching content.

References: [GSAP context cleanup](https://gsap.com/docs/v3/GSAP/gsap.context()/) and [GSAP media queries](https://gsap.com/docs/v3/GSAP/gsap.matchMedia()/).


## Conference edition · 29 October 2026

All prior starters, 82 library activities, GIF/WebP assets, saved-lesson features, feedback charts and GSAP motion remain. The 20 Spotlight-theme adaptations now have separated private cards, skill-specific rehearsals, individual physical criteria and distinct task-scene data. Three additional showcase packs contain six timed stages, actual guide/listener/observer cards, independent checks, a private-choice task and a matching schematic. Teaching mode hides worked private examples until the teacher reveals them. Student print packs separate private cards and omit teacher/observer keys and listening scripts.

Evidence & demo provides the three packs, curriculum mapping with teacher-supplied page notes, a review/evidence log, a conference script and evaluation templates. No independent review or classroom result is pre-filled. Downloaded HTML teacher packs are self-contained; the complete website and AI generation are not an offline AI system. These original adaptations are not reproduced or fully verified textbook lessons.

Approving a support adaptation first keeps the original lesson in My lessons and creates a new ID, record the source observation, modify support materials/teacher actions and rehearse before the same outcome check. A teacher can instead approve evidence for AI generation; the provider receives constraints and approved support context. Automated quality prompts flag required review areas without claiming certification. Large screens now load on demand, and the server selects the requested initial view instead of flashing Home first.

Run `npm run evaluate:lessons` to validate the 23 authored packs and regenerate three standalone HTML backups plus a technical review report. The evaluation-case CSV is a human-review test matrix; it is not evidence of 8 successful provider trials. Independent English/PE review, actual classroom pilot results, exact textbook-page checks and hosted public-launch configuration remain external work. This private/local version retains per-worker usage controls; public multi-user deployment requires a shared durable quota and institutional review.

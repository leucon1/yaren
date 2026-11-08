# Warm fullscreen hero implementation plan

Spec: user attachment eed1f146-1c92-48e7-838d-c9b61d7da0d8/Yapıştırılan metin.txt.
Baseline ec437cd, preserved in backup/final-cinematic-brand-20261108. Work only on feature/warm-fullscreen-hero; no publication.

Goal: integrate approved warm ritual image in the existing editorial opening, fill one visible viewport including header, replace duplicate cues with one bottom-centred discovery link, and refine cinematic logo scale/position/light.

Architecture: reuse CoffeeJourney, ScenePoster, existing header and native video/pinned engine. CSS min-height with dynamic viewport and matching header height, allowing intrinsic content to grow on short screens. Desktop larger right-hand photo with a wide left mask; portrait stacks readable text and focused photo. Optimized responsive WebP derivatives from the supplied PNG, original untouched. Cinematic logo width ×0.9 and centre moved up, softer separate light. No new runtime dependency or scroll code.

- [x] Add browser tests for full opening/cue/photo geometry at 1920×1080, 3440×1440, 1080×1920, 390×844, 768×1024. Include initial no-video request, wheel entry, keyboard cue, short-screen/zoom natural overflow. Observe expected failures against baseline.
- [x] Generate image derivatives and integrate. Remove only duplicate cues and obsolete opening-photo CSS; preserve typography/content, navigation, products, form and recommender. Keep cinematic text gradient and logo opacity clock unchanged.
- [x] Update existing assertions specific to old image/aspect/centred-logo geometry. Run all browser/unit tests, lint/format/build. Capture hero + cinematic intro at required viewports and before/after comparison against saved previous screenshots. Inspect focal objects and readable text.
- [x] Fresh read-only whole-change review; fix important findings with evidence. Verify original logo/MP4 hashes, preserve source ZIP, report actual tests and local preview. Do not merge/push/deploy.

Review focus: short viewport overflow stays reachable; no cinematic peek or loading on initial screen; header height and hero minimum track breakpoints; photo mask avoids main subjects; portrait display composition; PNG opacity clock and video scrubbing untouched.

## Progress

- Baseline clean and backed up. User's supplied spec determines visual scope; existing React/Vite and scroll engine reused.

- Task 1: six new opening tests failed against baseline. They pass with fullscreen opening and single cue. Existing no-old-asset network assertion also failed before the stale HTML preloads were updated, then passed.
- Task 2: approved input copied unchanged; WebP 960px/90,696 bytes and 1672px/203,550 bytes. Existing editorial type and all copy retained. Photo has focused right crop and left mask. Portrait tall display uses a larger photo maximum to avoid excess blank space. Logo width ×0.9 and lift10svh (20svh short landscape), light softened; opacity clock untouched.
- Task 3: first full run89/91 passed; two old assertions required disjoint photo/copy bounding boxes. Updated these to test that only the transparent left blend may overlap the text column, matching the requested composition. All unrelated tests preserved. Photo preloads now match the responsive img, old image files preserved.

- Final preliminary verification: 93/93 browser and20/20 unit; lint/format/build pass. Independent Astra whole-change review found no actionable issues; independent short viewport probes confirm natural overflow and reachable cue. Subsequent AVIF delivery improvement verified by the same browser suite and production smoke.
- Performance finding: larger hero became mobile LCP; WebP version measured91 mobile/100 desktop. AVIF58 halves the photo to42,687/96,835 bytes while preserving WebP88 fallback and original PNG; measured94/100 with100 accessibility both. Mobile LCP3.16s remains above2.5s; recorded as a limitation rather than changing visual scope or scroll engine to chase a score. Prior small-photo version measured100 mobile/100 desktop, older reference93/99.
- Source PNG copy matches uploaded SHA2568177be8fa3050a9083a636cbbd6a36378f0893a2b99e7415008058ec892354b1. Native media/pin files, exact narrative text, caption gradient, logo PNG, MP4 and recommender unchanged from baseline. No publish/merge/push.

# Cinematic overlays implementation plan

> Execute inline using executing-plans and test-driven-development; one read-only whole-change review at the end.

**Goal:** Replace the brown video/card and text rail with a viewport-sized coffee scene and minimal tracked object callouts.

**Spec:** User attachment `0b6d0ac2-bb44-4854-a7f1-14035bdc9b9b/Yapıştırılan metin.txt` (2026-11-08). Base 5c2e405, backup/approved-gemini-video-20261108; work on feature/cinematic-overlays. No publication.

**Design:** Keep the entire approved 16:9 image visible at its largest contained size. Fill aspect-ratio gaps from a low-resolution canvas of the SAME currently presented frame, softly blurred and feathered into the clear layer. A single video decoder is sufficient. Overlays belong to the full viewport, with only a small radial text scrim. Desktop/tablet-landscape labels use empty areas within the clear scene; portrait labels move into the softly extended scene above the objects. No card, frame, below-video panel, arrows, dots or end markers. A polyline has exactly a horizontal text rule followed by one diagonal segment.

**Alternatives:** Blind cover fills every pixel with sharp video but clips the cups/pot on extreme ratios, explicitly rejected by the spec. Pure contain with dark bars repeats the rejected panel. Contain with a same-frame ambient extension best meets both constraints; its cost is softer imagery outside the full clear frame, especially on portrait phones. No new media/3D/dependency is needed.

**Architecture:** Preserve PinnedScene's scrollProgress, passive rAF loop, travel heights, rotation correction, skip/navigation and VideoScrubber unchanged. Move only caption rendering into CinematicAnnotation. JourneyMedia reports actual presented video time using requestVideoFrameCallback and a seeked/rAF fallback. This frame notification also refreshes the tiny ambient canvas. Object positions are hand-inspected source-pixel landmarks with piecewise-linear interpolation, projected through the contained image rectangle. SVG/text position updates are imperative; React state changes only at four stage boundaries.

## Constraints

- Stage times remain 0 / 3 / 5 / 7.5 / 10 seconds; copy, logo, source/optimized MP4 and opening hero unchanged.
- Preserve all unrelated sections and tests; change only assertions for the explicitly replaced text-rail layout.
- The incoming second cup is outside the original frame at 7.5 s. Keep sharing copy readable, but don't draw an object pointer into empty table space; reveal its line once the cup enters the source image (about7.7s).
- Reduced motion remains the current four unpinned stills. Clean frame callbacks, rAF, observers and animations on teardown.

## Review focus

- Rapid reverse seeks must use displayed frame time, not a later requested currentTime.
- Portrait/ultrawide projection must retain both cups and keep callout geometry on its actual object.
- Resize/font loading must keep the horizontal rule between title and description.
- Video failure must keep the static fallback/skip usable; no stale moving target on a still image.
- Full-screen background must not introduce a second decoder, continuous idle render loop or first-load MP4 request.

## Task 1 — Scene layout and tracked annotations

Files: create src/story/annotation-layout.mjs, CinematicAnnotation.jsx, observe-video-frames.mjs; modify only visual responsibilities in PinnedScene/JourneyMedia/journey.css. Keep video-scrubber.mjs unchanged.

- [x] Add failing browser tests for full-viewport media surface and correctly projected two-segment callout, independent landmark windows, title/rule/description ordering and no object overlap.
- [x] Add unit coverage for contain projection at portrait/ultrawide ratios, interpolation/reverse behavior and off-frame incoming cup.
- [x] Implement source tracks, coordinate projection, clear/ambient scene and actual-frame notification.
- [x] Preserve existing unit and behavioral browser tests. Adapt only former below-video layout assertions.

## Task 2 — Review and delivery

- [x] Capture 4 stages at desktop1440×1000, ultrawide3440×1440, portrait/landscape tablet, phone and short landscape.
- [x] Inspect actual images for line endpoints and text placement, including intermediate camera motion.
- [x] Run lint/format, unit, all browser tests and production build.
- [x] Measure initial Lighthouse and continuous forward/reverse media timing on final production build.
- [x] Get one fresh read-only reviewer; address material findings with failing/passing regression coverage.
- [x] Keep live site unchanged. Commit experimental branch, source ZIP, screenshot gallery and report under outputs/yaren-sinematik-overlay.

## Ledger

- Base working tree clean. Existing source ZIP preserves previous build. Backup branch created before changes.
- Inspected 40 quarter-second frames plus22 full-resolution frames. Beans drift from(153,470) to(500,500); pot's late sideways camera sweep needs denser3.5–5s landmarks; cup starts near(845,450), moves toward(645,480); second cup enters from the top around7.7s and settles near(650,175).
- Frame API source: MDN requestVideoFrameCallback/cancelVideoFrameCallback documentation checked. Use actual mediaTime when available; feature-detect and cancel callbacks. Keep a seeked fallback for older/broken implementations.

- Task1: complete. First full-scene browser test failed against prior panel; new7ratio landmark/geometry cases and reverse/hold test passed.20/20 unit tests passed. MP4, timeline, opening component and actual scrubber have no Git diff.
- Visual refinement: use edge extension instead of a cover-copy background; avoids a duplicate giant cup in portrait. Inspect line screenshots only after220/420ms entrance animations complete. Small labels raised to12px; local scrim added behind the lower hint.
- Full baseline-preserving run:81/81 browser tests passed. Added two explicit fallback/teardown checks, both passed.
- Fresh read-only review: no Critical/Important defects. Minor poster resize projection found. Ruling: fix within requested responsive scene scope rather than leave a known fallback inconsistency; cost one additional low-res paint on poster resize. Regression failed222vs160px canvas height, then passed after adding poster repaint branch. No second review requested; verify complete suite after the fix.
- Review dispositions: waiting to point at the incoming cup is intentional, clear-contain plus edge extension preserves subjects, static poster targets remain on actual poster objects, all cleanup/source-preservation checks accepted. Physical-device results remain unverified.

- Final full run surfaced late initial frame callback vs fallback fractional-clock mismatch (about2.8px line nudge). Fixed both paths to the configured source-frame clock: native timestamp rounded to frame index, fallback seek time floored to displayed frame. Exact reverse/hold regression failed before; five repeated runs passed afterward. VideoScrubber is unchanged.

- Final visual inspection caught a portrait diagonal crossing subtitle glyphs. Added independent DOM Range glyph/segment intersection assertions (failed on390/320px), then routed portrait elbows from the right. Compact320px sharing heading uses25px to keep both copy and diagonal clear of the upper cup. All7ratios passed including exact object endpoints and no text crossing. This is a visual-only correction; source projection and scroll motor unchanged.

- Final delivery verification:20/20unit,84/84browser54.0s, lint0warnings, format and build passed.28scene captures across7viewports inspected; old opening/component/video/logo sources unchanged by Git diff. Production Lighthouse mobile/desktop100/100performance and100accessibility, LCP753/325ms. Native-media clock p95diff24.3/24.8ms, presented-frame timeline diff59.7/60.3ms, ultrawide60.7ms. These are video-clock differences, not physical display latency.
- Final review corrections completed with failing/passing tests; no deferred code findings. Backup and live source preserved. Package this verified commit with git archive; no publish/merge.

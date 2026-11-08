# Yâren final cinematic brand revision

Spec: user attachment dfc24c99-9c7a-4cf3-ac4d-a5df38acdbe7/Yapıştırılan metin.txt.
Baseline: 507d785; backup/cinematic-overlays-20261108; isolated feature/final-cinematic-brand-story.

1. Prove original logo matches supplied PNG. Add failing browser assertions for exact logo, reversible progress-driven opacity, no annotation SVG and retained scrim.
2. Remove line-only geometry and CSS. Keep contained-frame geometry used by the ambient renderer and existing caption placement. Replace all four titles/subtitles verbatim. Separate centered original PNG layer; logo fades over 0–1.1 seconds of video, first caption enters over 1.1–1.7 seconds. No timer or opacity transition on logo. Preserve phase boundaries and native media pipeline.
3. Update obsolete line tests into caption/layout checks; retain forward/reverse/hold, keyboard, reduced-motion, error, navigation, recommender and form coverage. Capture intro + four phases at seven viewport sizes. Check long copy against important scene objects.
4. Run complete tests, lint, format and build. Fresh read-only whole-change review. Preserve source and video hashes; deliver local preview, source archive, screenshots and actual verification results. Do not publish.

Review focus: scroll-driven intro cannot be overridden by phase entrance animation; text at first phase boundary remains visible; original logo unchanged; long copy on compact portrait and short landscape; no removal of shared geometry or native frame observation.

## Progress

- Verified original PNG SHA256 identical to supplied desktop file; baseline tree clean. Backup and isolated branch created.

- Task 1: new logo/no-SVG assertions failed against baseline (2/2), then passed with implementation.
- Task 2: removed line-only SVG, tracking samples, projection and CSS; preserved exact text scrim, containedFrame and native frame clock. Exact approved copy applied. No media re-encoding.
- Task 3: 7 viewport layout tests pass. First complete suite caught original PNG being downloaded on opening hero. Root cause: unconditional img; fixed using existing mediaEnabled boundary. Existing mobile asset test plus logo tests pass (21/21 targeted). No scroll engine changes.
- All 20 unit tests pass; lint/build pass; format check passes after final formatting. Seven viewport intro/four-phase screenshots captured and desktop, ultrawide, tablet, compact portrait, mobile landscape reviewed.

- Task 4: final complete browser suite 85/85; unit 20/20; lint, format and production build pass. Production smoke verifies logo, all phases, reverse, hold, muted/inline, skip/focus, no errors and MP4 range response 206.
- Final fresh-context Astra review: no Critical, Important or Minor findings. No deferred items or disputed rulings.
- Local Lighthouse 13.6.0: mobile 100 performance / 100 accessibility, LCP 753ms, TBT 14ms, CLS 0.00036; desktop 100 / 100, LCP 325ms, TBT 0ms, CLS 0.00029. These opening-load measurements do not measure physical-device video playback.
- Original PNG and both MP4 hashes unchanged; published source remains clean at 21fe304. No deployment, merge or push performed. Existing backup branch and previous source archives preserved.

# Approved Gemini video integration

Base: d3a09cf; preserved by backup/mood-recommender-20261108. Work only on feature/gemini-video-scroll; never publish. Original source MP4 is archived unchanged in source-media/.

1. Inspect actual frames and benchmark source seeking before encoding. Re-encode only for seeking; preserve all 240 frames, camera path, resolution and cadence. Extract first-frame poster and four static reduced-motion stills.
2. Test first: automatic normal-flow entry, actual MP4 forward/reverse/hold/end-frame, lazy loading and direct navigation. Preserve sequence-player tests and all unaffected site/recommender tests. Adapt previous optional-mount assertions to the new explicit natural-scroll requirement.
3. Retain scrollProgress, passive scroll/resize rAF scheduling, sticky structure and seek(progress) media contract. Remove only click-to-mount/FLIP/automatic focus-scroll lifecycle. Opening photo remains separate; explicit photo activation may jump to the story. Add accessible skip-to-coffees control without removing story from flow.
4. Align milestones to inspected video: 0–3.0 beans/setup, 3.0–5.0 pot, 5.0–7.5 cup/rising view, 7.5–10.0 sharing/hand. Full 16:9 frame on every viewport; separate caption rail avoids covering any objects. Use a shorter mobile travel and static unpinned reduced-motion narrative.
5. Validate lint, unit/browser suites, build, real media range responses, screen captures on desktop/tablet/mobile, production Lighthouse and frame-seek timing. Review the complete diff with one fresh reviewer. Package source and results; keep live site untouched.

## Progress

- Source: 1280×720, 24 fps, 240 frames, H.264 High, one keyframe at 0.0. Original SHA256 04c1e25c78272e605d36086e1de6bf0778fa21ab18ee4dc3988f5b6e577a0f03.
- Browser baseline 12 sequential forward/reverse seeks: mean 67.2 ms, max 127.9 ms. Six-frame GOP (0.25 s), no B frames, silent faststart derivative: mean 4.8 ms, max 15.2 ms on this desktop Chromium. Derivative 7.86 MB vs source 5.99 MB; accept the size tradeoff for lower seek latency. Local measurements are not physical-device guarantees.
- Ruling: always-present cinematic section replaces optional mounting because the new request explicitly requires natural entry on downward scroll. Keep the existing scroll engine; skip moves to products and never collapses the document.

- Task 1 complete: source inspected, preserved hash, derivative benchmark and 240-frame metadata checked. Full-frame video and five extracted WebP stills generated without camera edits.
- Task 2 complete: natural-entry test observed fail against old optional mount, then pass. Existing sequence and site tests retained; optional-lifecycle expectations adapted to the new request.
- Task 3 complete: source integration and responsive layout passed 67/67 browser and 17/17 unit tests; product/story/contact isolated comparison 9/9 exact.
- Manual follow-up: milestone caption can remain nearly invisible when scroll stops at an exact boundary. Regression failed at opacity .0029, passed with .75 minimum. Keeps the original gentle fade/translation.
- Final review: fresh read-only reviewer found no Critical/Important/Minor code issues. Explicitly considered rotation position and initial fragments as scope decisions.
- Final: Ruling: preserve story progress on a width/orientation change while pinned — otherwise a phone rotation exits the video into products. Ordinary scroll remains native; a one-time layout correction on width change is the cost. Regression observed fail (.65 became1), then pass.
- Final: Ruling: honor initial URL fragments after React mount — direct shared section/product links should skip the video just as clicked navigation does. Scope is a small initial-navigation correction; no visual change. Four regression cases fail before, pass after.
- Physical-device/hosting/encoding review limits are documented and checked locally where possible: no claim of physical Safari/Android testing; MP4 range response206 confirmed locally; source hash and all240frames verified; actual phase inspection and seek benchmark recorded above.
- No deferred minor code findings. README updated; historical copy preserved.

- Final verification: npm run lint (0 warnings), npm run format:check, npm test (17/17), complete Playwright suite (73/73, 40.0s), and production build passed after follow-up fixes. No dependencies added.
- Final production Lighthouse13.6: mobile performance100/accessibility100, desktop100/100. LCP753ms/204ms, TBT0, CLS.00036/.00029. User-reported earlier93/99 are historical, not a same-environment causal comparison.
- Continuous six-second forward/reverse clock tracking: p95 target/currentTime error24.3ms desktop,24.8ms four-times CPU mobile viewport emulation. These measure the native media clock/event boundary, not physical display latency.
- Fidelity: derivative240frames24fps1280×720; FFmpeg SSIM All0.991627. Original hash unchanged. Production range206, video/mp4, exact1000-byte request confirmed.
- Active production preview is http://127.0.0.1:5182/. Stable published source remains clean and old Blender source HEAD remains3688b3f. No Blender process was running. No publish or merge performed.

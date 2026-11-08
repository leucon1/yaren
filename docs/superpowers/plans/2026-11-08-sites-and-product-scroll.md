# Sites publication and product scroll

Baseline b6ad830, backup/warm-hero-20261108; work on feature/sites-smooth-scroll.
Existing Sites project appgprj_6aef3b0c698c819198d8473d25cbf927, source21fe304, version2. Preserve identity; replace source with latest local application. Current owner-only custom access; user explicitly requests external access, so publish public on same host.

1. Test actual travel and deferred focus/highlight for three drinks on desktop/mobile, reduced-motion instant navigation. Native smooth scroll confined to recommender; cancel pending arrival on user interruption/unmount. Preserve modified-click semantics and existing navigation/pin engine.
2. Close panel before navigation, use scrollIntoView smooth (instant reduced motion), observe bounded arrival without driving scroll frames, focus/highlight after arrival. Reuse card scroll margins and document padding. No global CSS changes.
3. Full tests/lint/build plus fresh review. Open existing Sites repo with native source helper, retain hosting manifest. Copy verified latest source exactly, without mixing old app files. Native helper commits/pushes and builds/packages matching source. Save/deploy existing Site, public access per explicit request.
4. Validate real HTTPS anonymously: assets including MP4, forward/reverse/hold, original logo, all drink destinations, form, desktop/mobile screenshots. Report actual results and access/publication limits. Keep local snapshot and previous Sites version.

## Progress

- Existing Site identity, owner role, old source and custom owner-only access verified. Local approved snapshot backed up. Source helper opened separate hosted checkout before edits.

- Native source opening confirmed remote21fe304 and original hosting manifest. No new Site created.
- Smooth travel tests first failed6/6 against instant baseline. Arrival implementation now passes23/23 recommender tests; full101/101 browser,20/20unit, lint/format/build pass. First implementation placed cancellation in panel-close cleanup; measured unchanged scroll position, moved cancellation to unmount cleanup, then tests passed.
- Fresh Astra review: no Critical/Important findings. Minor deferred: reduced-motion local test checks eventual focus/highlight rather than synchronous timing. Production verification will additionally inspect synchronous reduced-motion position/focus as part of HTTPS QA.

- Saved/deployed existing Site version3 from remote4ced0ee, tree efaa949 matching local0b12770 exactly. Public access revision2 set per user request; anonymous asset hashes match.
- HTTPS QA exposed production-only issue: Sites ignores Range and returns HTTP200/full7,864,496-byte MP4. Native video buffered0–10 but seekable0–0, seeks remained at0. Not treated as success. Reproduced with HTTP200 browser fixture; test failed. Small media adapter fix: configured loadMode buffer fetches unchanged MP4 lazily, creates seekable Blob URL for existing native player, aborts/revokes on teardown. Pin/progress/VideoScrubber/clock/copy/gradients unchanged.16 targeted media tests pass including HTTP200 forward/reverse/hold and buffer cleanup.

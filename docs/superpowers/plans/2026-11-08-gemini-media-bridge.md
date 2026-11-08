# Gemini Media Bridge Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans inline. This is a surgical migration of existing scroll infrastructure.

**Goal:** Replace active Blender imagery with the approved photograph while preserving the existing scroll motor and preparing a replaceable Gemini media layer.
**Architecture:** Retain CoffeeJourney activation/focus, PinnedScene sticky/open animation and scroll scheduling, timeline math, reduced motion and generic SequencePlayer. Extract only media loading into JourneyMedia with the existing seek(progress) interface. Poster is the default; video and sequence are opt-in through one local JSON configuration.
**Tech Stack:** Existing React/Vite/CSS, no new runtime dependencies.
**Spec:** Latest user correction in this chat; latest scope defers coffee recommender.

## Constraints

- Stable project and previous experimental branch remain unchanged.
- No Blender/render production, deletion, publication, fake camera movement or new video.
- Use approved public/images/hero.webp and hero-mobile.webp.
- Reuse existing timeline math and thresholds; update narrative to Çekirdek → Cezve → Fincan → Paylaşım.
- Preserve menu, form, products, logo, palette, keyboard and reduced-motion behavior.

## Review focus

- Configuration/media failure must retain a useful photo, working captions and exit.
- Navigation across active sticky area must jump directly without scrubbing intermediate phases.
- MP4 metadata may arrive after progress changes; newest target wins and autoplay stays off.
- Direction/orientation changes and early close must cancel obsolete media work.
- Static preview must not load archived Blender frames or manufacture movement/hand placement.

## Task 1 — media migration

Files: src/story/JourneyMedia.jsx, video-scrubber.mjs, PinnedScene.jsx, ScenePoster.jsx, timeline.mjs, ReducedStory.jsx, journey.css, public/journey-media.json, index.html.

- [x] Add failing browser test proving approved photo/no archived requests, forward/reverse four captions, useful reduced motion.
- [x] Add failing video adapter tests proving metadata-delayed seek, reverse/newest target, cleanup/failure.
- [x] Extract existing frame loading, preserving SequencePlayer; add small MP4 seek adapter and static default.
- [x] Keep scroll functions and event scheduling; narration follows scroll even without media.
- [x] Restore photo aspect ratio, no digital zoom, and add exact subtitles.

## Task 2 — direct navigation

Files: src/navigation.mjs, src/components/Header.jsx, src/App.jsx, tests/browser/journey.spec.mjs.

- [x] Add failing active-story navigation tests: no intermediate progress, correct hash/section/focus, desktop/mobile.
- [x] Use instant native jumps for explicit section links, preserving href and modifier behavior.
- [x] Verify direct link/deep-link and reverse scroll still work.

## Task 3 — verification and delivery

- [x] Preserve generic sequence tests and archived asset validation; adapt media-specific browser fixtures to approved photo.
- [x] Run unit/browser tests, lint, format, production build.
- [x] Capture desktop/tablet/mobile and compare unchanged product/story/contact blocks.
- [x] Document MP4/sequence configuration and untested final-video limitations.
- [x] Commit isolated branch; create new source ZIP and local preview. No publication.

# Yâren

A premium coffee brand experience built with React and Vite. Yâren brings traditional Turkish coffee culture into a calm, contemporary interface, guided by the brand's signature line: **“Her fincanda ortak bir hikâye.”** — _A shared story in every cup._

**[View the live website](https://yaren-kahve-atelier.erentur1905.chatgpt.site)**

This fictional brand website was created as a recruitment assessment project. The interface and all visitor-facing copy are in Turkish.

## Features

- Responsive, single-page layout with an approved wordmark, warm photography, local fonts, and a restrained cream, brown, and olive palette.
- A full-screen, scroll-controlled cinematic story with four milestones: **Bean → Cezve → Cup → Sharing**.
- Separate approved 16:9 and 9:16 videos, selected by viewport orientation. Square and landscape viewports use the landscape source; portrait viewports use the portrait source.
- Reversible video scrubbing, a frame that holds while scrolling stops, and progress preservation when the viewport changes orientation.
- A usable four-image story while the selected video downloads, followed by a handoff to the current scroll position.
- A reduced-motion experience with static images in normal document flow and no cinematic video download.
- Turkish coffee, espresso, and filter coffee cards with illustrative prices per cup or shot.
- A mood-based coffee recommender with focused product navigation, controlled smooth scrolling, and reduced-motion support.
- Keyboard-accessible navigation, a mobile menu, visible focus states, and contact form validation.

The contact form is a **client-side demonstration**: it validates the fields and displays a success message without sending or storing messages. Product prices are illustrative; the project does not implement checkout or online ordering.

## Technology

- React 19 and JavaScript / JSX
- Vite 7
- Plain CSS with responsive layouts and reduced-motion support
- Native HTML video, browser media APIs, and a small canvas bridge for source changes
- ESLint and Prettier
- Node.js's built-in test runner and Playwright
- Sharp and FFmpeg-based scripts for maintaining media derivatives; Lighthouse tooling for local audits

The application requires no backend or API key. FFmpeg is only needed when explicitly running media preparation scripts; it is not needed for ordinary development or builds.

## Getting started

Use Node.js **20.19+ or 22.12+** with npm. From the repository root:

```sh
npm ci
npm run dev
```

Open the local address printed by Vite. Keep the supplied `package-lock.json` for reproducible dependency installation.

## Production build

```sh
npm run build
npm run preview
```

The build is written to `dist/`. Images, fonts, media configuration, and video files are served from `public/` using root-relative paths. The current configuration expects deployment at the origin root; hosting under a URL subdirectory would require a separate deployment-path review.

The existing ChatGPT Sites release remains at the live URL above. Its hosting configuration is retained in `.openai/hosting.json`; publishing is a separate operation and is outside this GitHub source delivery.

## Checks and tests

```sh
npm run lint
npm run format:check
npm test
npx playwright install chromium webkit
npm run test:e2e
npm run build
```

Playwright starts the development server on `127.0.0.1:5180`. Keep that port free, or ensure any reused server is running this checkout. On supported Linux environments, browser system dependencies may also be required. `PLAYWRIGHT_CHROMIUM_EXECUTABLE` can point to an existing compatible Chromium executable.

The suite covers form validation, navigation and keyboard interaction, responsive layouts, video selection, forward and reverse scrubbing, orientation changes, logo and caption timing, loading fallbacks, reduced motion, and coffee recommendations. Delivery screenshot tests are available through `npm run test:screenshots`.

Windows WebKit may lack the H.264 support needed to decode the approved MP4s. The corresponding test checks the accessible fallback in that environment; it does not establish real iPhone Safari playback compatibility. Physical-device testing remains distinct from browser emulation.

## Project structure

```text
src/
  components/       Header, product cards, contact form, and shared brand UI
  story/            Sticky story, media adapter, scrubbing, and narrative timeline
  recommender/      Coffee recommendation interface and product navigation
  navigation.mjs    Section navigation
  styles.css        Shared site styles
public/
  images/           Approved brand, hero, product, and story images
  video/            Optimized landscape/portrait videos and story stills
  fonts/            Local fonts and their license notices
  story/            Retained sequence fixtures used by automated tests
source-media/       Original approved media masters and encoding notes
scripts/            Media preparation and local audit tools
tests/              Unit and browser tests
scene-source/       Retained validation fixture used by the asset tests
docs/               Implementation notes and clearly historical records
```

## Media and loading

Only the selected cinematic video is downloaded when the story is entered. The current Sites host does not provide the byte-range responses required for reliable native seeking, so the application buffers that file and supplies a seekable Blob URL to the existing video scrubber. Small story images take priority during loading. Previously selected variants are cached within the mounted experience, and obsolete media resources are cleaned up.

The approved videos, original masters, logo, hero, and narrative timings are preserved. Avoid replacing the videos, removing test fixtures, or changing the loading mode without testing seeking and fallbacks on the target host. See `source-media/README.md` for encoding provenance; older implementation notes may describe earlier behavior, while the current orientation rule is defined in `src/story/timeline.mjs`.

## Source provenance

This repository is prepared from the **final v10 source archive**, `yaren-final-v10-github-source.zip`, verified against source commit **`d9c96dc4c5f5a2e27bf039c39546ee3dc7acb9c8`**. The v10 header contains only the approved logo and navigation; the secondary tagline has been removed.

Repository preparation updates documentation, ignore rules, and line-ending configuration only. The approved application source, media, styles, and tests remain identical to that v10 delivery in Git's canonical form. Dependencies, generated builds, local test results, backup archives, and credentials are excluded.

No open-source license is granted by this repository. Keep the supplied third-party font license notices with their assets; brand and media permissions should be reviewed before redistribution.

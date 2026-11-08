# Retained sequence test evidence

`validation.json` is a direct input of the active `tests/scene-assets.test.mjs` test. That test also reads `public/story/manifest.json` and all 360 retained frame files. These files remain to preserve the existing test suite and generic sequence player. The live cinematic configuration uses only the approved MP4 sources; it does not fetch these Blender frames.

The abandoned Blender scene, renderer/build scripts, detailed camera metadata and audits were removed from this working tree after a verified full backup. They remain recoverable from `yaren-full-20261108-201122.zip` in the workspace `backups/` folder and Git history at `backup/pre-cleanup-20261108`. Historical reproduction notes are in the backup's original `scene-source/README.md` and `docs/archive/blender-prototype.md`.

Do not run Blender as part of the current application build or media workflow.

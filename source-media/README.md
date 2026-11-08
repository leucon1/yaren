# Approved source and reproducible web encoding

`yarenvideo-original.mp4` is a byte-for-byte copy of the user's approved final Gemini video. SHA256: `04c1e25c78272e605d36086e1de6bf0778fa21ab18ee4dc3988f5b6e577a0f03`.

The source stays outside `public/` and the production build. Keep it when archiving the project. Do not regenerate or edit its camera movement.

`public/video/yaren-scroll.mp4` preserves 1280×720, all 240 frames and 24 fps. It uses a 6-frame GOP (0.25 seconds), no B frames and a faststart MP4 index for lower native seek latency. Only the web derivative omits audio: scroll owns the clock and the cinematic experience is silent. No frames were inserted, reordered, cropped or retimed.

```powershell
ffmpeg -i source-media/yarenvideo-original.mp4 -map 0:v:0 -an -c:v libx264 -preset slow -crf 18 -profile:v high -pix_fmt yuv420p -g 6 -keyint_min 6 -sc_threshold 0 -bf 0 -movflags +faststart public/video/yaren-scroll.mp4
```

Five WebP stills come from frames 0, 60, 90, 150 and 228. The first is the loading/failure poster; the others illustrate the four reduced-motion stages. They are extracted from the approved video, not new images. The opening hero continues to use the separate approved photograph.

The deployment host serves `.mp4` as `video/mp4`. Sites currently returns HTTP200 without seekable byte ranges, so `loadMode: "buffer"` creates a seekable Blob URL from the selected video. No autoplay or external video service is used.

## Approved portrait variant

`yaren91666-original.mp4` is the untouched 1080×1920 CapCut master supplied by the user. SHA256: `8f7ebd19df9cebfc21d5ea141a96c039e9b224c41623ba3063b203709e313d42`. Its 240 video frames last exactly 10 seconds; the original audio stream ends at 10.008 seconds.

`public/video/yaren-scroll-portrait.mp4` is 6,163,737 bytes, 1080×1920, 24 fps, H.264 High 4.1 / yuv420p, with faststart, no audio, no B frames and a 12-frame (0.5s) GOP. SSIM against the original video: 0.992906. No crop, retiming, new frames or camera changes were applied. `still-portrait.webp` is its first-frame loading poster. The existing horizontal video is unchanged.

```powershell
ffmpeg -i source-media/yaren91666-original.mp4 -map 0:v:0 -an -c:v libx264 -preset slow -crf 21 -profile:v high -level:v 4.1 -refs 3 -bf 0 -pix_fmt yuv420p -r 24 -g 12 -keyint_min 12 -sc_threshold 0 -movflags +faststart public/video/yaren-scroll-portrait.mp4
```

The media adapter selects portrait at viewport aspect ratios <= 4:5; it fetches only the selected MP4 after entering the cinematic section. Previously selected variants are cached (at most two), and each native decoder/Blob URL is disposed on replacement. A frozen canvas preserves the previous frame while its replacement loads and seeks to the same normalized progress. The full portrait frame is contained without blur or duplicate backgrounds, so screens with a different aspect ratio can show solid margins.

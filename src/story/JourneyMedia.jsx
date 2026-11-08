import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import useMediaQuery from './useMediaQuery.js';
import {
  clampProgress,
  milestones,
  milestoneForProgress,
  portraitQuery,
} from './timeline.mjs';
import { observeVideoFrames } from './observe-video-frames.mjs';
import { containedFrame } from './annotation-layout.mjs';

const posterDescription =
  'Yâren’in güneş ışığı alan masasında kahve fincanı, bakır cezve ve çekirdekler.';

// PinnedScene keeps the existing seek(progress) contract. This component alone
// chooses a poster, an MP4 time line, or the existing bounded frame player.
const JourneyMedia = forwardRef(function JourneyMedia(
  { enabled, onStatus, onFrame },
  ref,
) {
  const rootRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const ambientRef = useRef(null);
  const controllerRef = useRef(null);
  const progressRef = useRef(0);
  const configRef = useRef(null);
  const buffersRef = useRef(new Map());
  const fallbackRef = useRef(null);
  const portrait = useMediaQuery(portraitQuery);

  useImperativeHandle(
    ref,
    () => ({
      seek(progress) {
        const value = clampProgress(progress);
        progressRef.current = value;
        rootRef.current.dataset.progress = value.toFixed(5);
        if (rootRef.current.dataset.fallback === 'true') fallbackRef.current?.(value);
        else if (rootRef.current.dataset.kind === 'poster')
          onFrame(value * 10, {
            staticFrame: true,
            portraitVideo: rootRef.current.dataset.format === 'portrait',
          });
        controllerRef.current?.seek(value);
      },
    }),
    [onFrame],
  );

  useEffect(() => {
    if (!enabled) return;
    let disposed = false;
    let bufferedVideoUrl = null;
    let videoPoster = null;
    const abort = new AbortController();
    const root = rootRef.current;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ambient = ambientRef.current;
    const context = ambient.getContext('2d', { alpha: false });
    const paintAmbient = (source) => {
      if (disposed || !context) return;
      // Extend the current frame's edges, rather than duplicating a giant cup
      // behind the clear video. One tiny surface; no second decoder or idle loop.
      const scale = Math.min(320 / root.clientWidth, 320 / root.clientHeight);
      const width = Math.max(1, Math.round(root.clientWidth * scale));
      const height = Math.max(1, Math.round(root.clientHeight * scale));
      if (ambient.width !== width) ambient.width = width;
      if (ambient.height !== height) ambient.height = height;
      const sourceWidth = source.videoWidth || source.naturalWidth || source.width;
      const sourceHeight = source.videoHeight || source.naturalHeight || source.height;
      if (!sourceWidth || !sourceHeight) return;
      const portraitFrame = root.dataset.format === 'portrait';
      const slot = containedFrame(
        width,
        height,
        portraitFrame ? 9 : 16,
        portraitFrame ? 16 : 9,
      );
      // A landscape fallback still is itself contained within the portrait slot.
      // Match that visible image exactly before stretching only its edge strips.
      const frame = containedFrame(slot.width, slot.height, sourceWidth, sourceHeight);
      frame.x += slot.x;
      frame.y += slot.y;
      context.drawImage(
        source,
        0,
        0,
        sourceWidth,
        8,
        frame.x,
        0,
        frame.width,
        frame.y + 1,
      );
      context.drawImage(
        source,
        0,
        sourceHeight - 8,
        sourceWidth,
        8,
        frame.x,
        frame.y + frame.height - 1,
        frame.width,
        height - frame.y - frame.height + 1,
      );
      context.drawImage(source, 0, 0, 8, sourceHeight, 0, 0, frame.x + 1, height);
      context.drawImage(
        source,
        sourceWidth - 8,
        0,
        8,
        sourceHeight,
        frame.x + frame.width - 1,
        0,
        width - frame.x - frame.width + 1,
        height,
      );
      context.drawImage(source, frame.x, frame.y, frame.width, frame.height);
      ambient.dataset.ready = 'true';
    };
    const poster = root.querySelector('.journey-video-poster');
    const paintPoster = () => {
      // A replacement poster may load before the held frame is released.
      // Its edges must not overwrite the edges of the frame actually on screen.
      if (root.dataset.holding === 'true') {
        paintAmbient(canvas);
        return;
      }
      if (
        (root.dataset.kind === 'poster' || root.dataset.fallback === 'true') &&
        poster.complete &&
        poster.naturalWidth
      )
        paintAmbient(poster);
    };
    // Reuse the reduced-motion story images while bytes or a target frame are
    // pending. The scroll clock stays live; the user's motion preference does not change.
    const stills = [];
    const showStill = (value) => {
      if (disposed || root.dataset.fallback !== 'true') return;
      const phase = milestoneForProgress(value);
      const image = stills[phase];
      onFrame(value * 10, {
        staticFrame: true,
        portraitVideo: root.dataset.format === 'portrait',
      });
      if (!image?.complete || !image.naturalWidth) return;
      poster.src = image.getAttribute('src');
      poster.alt = milestones[phase].imageAlt;
      root.dataset.stillReady = 'true';
      paintAmbient(image);
      if (root.dataset.holding === 'true') {
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        canvas.getContext('2d').drawImage(image, 0, 0);
      }
    };
    fallbackRef.current = showStill;
    poster.addEventListener('load', paintPoster);
    const resizeObserver = new ResizeObserver(() => {
      if (root.dataset.holding === 'true') paintAmbient(canvas);
      else if (root.dataset.fallback === 'true') paintPoster();
      else if (root.dataset.kind === 'video' && video.readyState >= 2 && !video.seeking)
        paintAmbient(video);
      else if (
        root.dataset.kind === 'sequence' &&
        canvasRef.current.dataset.ready === 'true'
      )
        paintAmbient(canvasRef.current);
      else paintPoster();
    });
    resizeObserver.observe(root);
    let stopObserving = () => {};
    const ready = () => {
      if (disposed || (root.dataset.kind === 'video' && video.seeking)) return;
      if (root.dataset.kind === 'video') {
        const target = Math.min(
          progressRef.current * video.duration,
          video.duration - 1 / 24,
        );
        if (
          video.readyState < 2 ||
          !Number.isFinite(target) ||
          Math.abs(video.currentTime - target) > 1 / 24
        )
          return;
      }
      root.dataset.ready = 'true';
      if (root.dataset.fallback === 'true' && videoPoster) {
        poster.src = videoPoster;
        poster.alt = posterDescription;
      }
      root.dataset.fallback = 'false';
      root.dataset.holding = 'false';
      onStatus('ready');
    };
    const fail = () => {
      if (disposed) return;
      controllerRef.current?.dispose();
      controllerRef.current = null;
      root.dataset.kind = 'poster';
      root.dataset.ready = 'true';
      showStill(progressRef.current);
      onStatus('error');
      paintPoster();
      onFrame(progressRef.current * 10, {
        staticFrame: true,
        portraitVideo: root.dataset.format === 'portrait',
      });
    };
    if (root.dataset.holding !== 'true') {
      root.dataset.kind = 'poster';
      root.dataset.ready = 'true';
    }
    paintPoster();
    onStatus('loading');

    async function configure() {
      if (!configRef.current) {
        const response = await fetch('/journey-media.json', { signal: abort.signal });
        if (!response.ok) throw new Error('Media configuration unavailable');
        const config = await response.json();
        if (disposed) return;
        configRef.current = config;
      }
      const config = configRef.current;
      if (disposed) return;
      if (config.kind === 'poster') {
        ready();
        return;
      }
      if (config.kind === 'video' && typeof config.src === 'string' && config.src) {
        const portraitVideo = portrait && Boolean(config.portrait?.src);
        const variant = portraitVideo ? config.portrait : config;
        root.dataset.format = portraitVideo ? 'portrait' : 'landscape';
        root.dataset.source = variant.src;
        videoPoster = variant.poster || '/video/still-01.webp';
        poster.src = videoPoster;
        video.poster = poster.src;
        root.dataset.ready = 'false';
        root.dataset.kind = 'video';
        root.dataset.fallback = 'true';
        root.dataset.stillReady = 'false';
        if (root.dataset.holding === 'true') paintAmbient(canvas);
        // These small, existing images are requested before the large MP4.
        for (let index = 0; index < milestones.length; index++) {
          const image = new Image();
          image.fetchPriority = 'high';
          image.onload = () => showStill(progressRef.current);
          stills.push(image);
          image.src = `/video/still-0${index + 2}.webp`;
        }
        showStill(progressRef.current);
        let source = variant.src;
        if (config.loadMode === 'buffer') {
          // Sites serves the MP4 as HTTP200 without a seekable byte range.
          // The same, unchanged MP4 becomes a local seekable native-video source.
          let bytes = buffersRef.current.get(variant.src);
          if (!bytes) {
            // Give the complete small story priority over the multi-megabyte
            // transfer. A missing still must never prevent the video loading.
            await Promise.all(stills.map((image) => image.decode().catch(() => {})));
            if (disposed) return;
            const media = await fetch(variant.src, {
              signal: abort.signal,
              priority: 'low',
            });
            if (!media.ok) throw new Error('Video unavailable');
            bytes = await media.blob();
            if (disposed) return;
            // Only selected variants are fetched; at most the two approved files.
            if (buffersRef.current.size >= 2) buffersRef.current.clear();
            buffersRef.current.set(variant.src, bytes);
          }
          if (disposed) return;
          bufferedVideoUrl = URL.createObjectURL(bytes);
          source = bufferedVideoUrl;
        }
        const { VideoScrubber } = await import('./video-scrubber.mjs');
        if (disposed) return;
        controllerRef.current = new VideoScrubber(video, {
          onError: fail,
          frameRate: config.frameRate,
        });
        stopObserving = observeVideoFrames(
          video,
          (time) => {
            if (disposed || root.dataset.kind !== 'video') return;
            root.dataset.frameTime = time.toFixed(5);
            ready();
            if (root.dataset.fallback === 'true') return;
            paintAmbient(video);
            // Keep the approved narrative timing identical even if the two
            // encodes have slightly different real metadata durations.
            onFrame((time / video.duration) * 10, { portraitVideo });
          },
          config.frameRate,
        );
        video.addEventListener('loadeddata', ready, { once: true });
        video.addEventListener('seeked', ready);
        video.src = source;
        video.load();
      } else if (config.kind === 'sequence' && typeof config.manifest === 'string') {
        root.dataset.format = 'landscape';
        const [{ SequencePlayer }, manifestResponse] = await Promise.all([
          import('./sequence-player.mjs'),
          fetch(config.manifest, { signal: abort.signal }),
        ]);
        if (!manifestResponse.ok) throw new Error('Sequence unavailable');
        const manifest = await manifestResponse.json();
        if (disposed) return;
        controllerRef.current = new SequencePlayer(
          canvasRef.current,
          portrait ? manifest.mobile : manifest.desktop,
          {
            onFrame: (index) => {
              ready();
              const sequence = portrait ? manifest.mobile : manifest.desktop;
              paintAmbient(canvasRef.current);
              onFrame((index / Math.max(1, sequence.count - 1)) * 10);
            },
            onError: fail,
          },
        );
        root.dataset.kind = 'sequence';
      } else {
        throw new Error('Unsupported media configuration');
      }
      controllerRef.current.seek(progressRef.current);
    }
    configure().catch((error) => {
      if (error.name !== 'AbortError') fail();
    });

    return () => {
      // One frozen canvas bridges a source replacement. No second decoder,
      // autoplay or blank frame while the new variant downloads and seeks.
      if (root.dataset.kind === 'video' && video.readyState >= 2) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0);
        root.dataset.holding = 'true';
      }
      disposed = true;
      fallbackRef.current = null;
      for (const image of stills) image.onload = null;
      abort.abort();
      stopObserving();
      resizeObserver.disconnect();
      poster.removeEventListener('load', paintPoster);
      controllerRef.current?.dispose();
      controllerRef.current = null;
      video.removeEventListener('loadeddata', ready);
      video.removeEventListener('seeked', ready);
      video.removeAttribute('src');
      video.load();
      if (bufferedVideoUrl) URL.revokeObjectURL(bufferedVideoUrl);
    };
  }, [enabled, portrait, onStatus, onFrame]);

  return (
    <div
      ref={rootRef}
      className="journey-media"
      data-kind="poster"
      data-progress="0.00000"
      data-ready="true"
    >
      <div className="journey-ambient-poster" aria-hidden="true" />
      <canvas
        ref={ambientRef}
        className="journey-ambient"
        width="320"
        height="180"
        aria-hidden="true"
      />
      <div className="journey-frame">
        <img
          className="journey-video-poster"
          src="/video/still-01.webp"
          width="1280"
          height="720"
          loading="lazy"
          alt={posterDescription}
        />
        <video
          ref={videoRef}
          className="journey-video"
          muted
          playsInline
          preload="auto"
          poster="/video/still-01.webp"
          disablePictureInPicture
          aria-hidden="true"
        />
        <canvas ref={canvasRef} className="journey-canvas" aria-hidden="true" />
      </div>
    </div>
  );
});

export default JourneyMedia;

// Observe presentation, never own playback or scrolling. A paused seek still
// produces a frame callback on supporting browsers. The seeked fallback covers
// older implementations without running an idle animation loop.
export function observeVideoFrames(video, onFrame, frameRate = 24) {
  let disposed = false,
    callbackId = null,
    fallback = 0,
    fallbackAgain = 0;
  let lastTime = -1;
  const report = (time) => {
    // Native metadata is rounded in microseconds; normalize both paths to the
    // same source-frame clock so a late callback cannot nudge a stationary line.
    if (frameRate > 0) time = Math.round(time * frameRate) / frameRate;
    if (disposed || !Number.isFinite(time) || time === lastTime || video.readyState < 2)
      return;
    lastTime = time;
    onFrame(time);
  };
  const presented = (_, metadata) => {
    if (disposed) return;
    report(metadata.mediaTime);
    callbackId = video.requestVideoFrameCallback(presented);
  };
  const scheduleFallback = () => {
    cancelAnimationFrame(fallback);
    cancelAnimationFrame(fallbackAgain);
    fallback = requestAnimationFrame(() => {
      fallbackAgain = requestAnimationFrame(() => {
        // Do not overwrite a presented frame timestamp with the later requested
        // media clock (which may sit between two 24fps source frames).
        const hasPresentedFrame =
          callbackId !== null && Math.abs(video.currentTime - lastTime) < 0.05;
        if (!disposed && !video.seeking && !hasPresentedFrame) {
          const frameTime =
            frameRate > 0
              ? Math.floor(video.currentTime * frameRate + 1e-6) / frameRate
              : video.currentTime;
          report(frameTime);
        }
      });
    });
  };
  if (typeof video.requestVideoFrameCallback === 'function')
    callbackId = video.requestVideoFrameCallback(presented);
  video.addEventListener('loadeddata', scheduleFallback);
  video.addEventListener('seeked', scheduleFallback);
  return () => {
    disposed = true;
    if (callbackId !== null) video.cancelVideoFrameCallback?.(callbackId);
    cancelAnimationFrame(fallback);
    cancelAnimationFrame(fallbackAgain);
    video.removeEventListener('loadeddata', scheduleFallback);
    video.removeEventListener('seeked', scheduleFallback);
  };
}

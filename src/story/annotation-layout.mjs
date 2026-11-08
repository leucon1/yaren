export function containedFrame(width, height, sourceWidth = 1280, sourceHeight = 720) {
  const scale = Math.min(width / sourceWidth, height / sourceHeight);
  return {
    x: (width - sourceWidth * scale) / 2,
    y: (height - sourceHeight * scale) / 2,
    width: sourceWidth * scale,
    height: sourceHeight * scale,
  };
}

export function labelPosition(
  phase,
  width,
  height,
  labelWidth,
  labelHeight,
  portraitVideo = false,
) {
  const frame = containedFrame(width, height);
  const portrait = width / height < 1.05;
  const positions = [
    [0.62, 0.13],
    [0.64, 0.15],
    [0.055, 0.14],
    [0.7, 0.62],
  ];
  const x = portrait
    ? Math.max(24, Math.min(48, width * 0.06))
    : frame.x + positions[phase][0] * frame.width;
  const y = portraitVideo
    ? phase === 1 || phase === 3
      ? height - labelHeight - 74
      : Math.max(96, height * 0.12)
    : portrait
      ? frame.y - labelHeight - 28
      : frame.y + positions[phase][1] * frame.height;
  return {
    x: Math.max(24, Math.min(width - labelWidth - 24, x)),
    y: Math.max(76, Math.min(height - labelHeight - 42, y)),
  };
}

// Seconds are the same presented video time used for all four milestones.
// Disjoint fade windows prevent competing logo and narrative layers.
export function introVisibility(time) {
  const smooth = (value) => {
    const t = Math.max(0, Math.min(1, value));
    return t * t * (3 - 2 * t);
  };
  const safeTime = Number.isFinite(time) ? time : 0;
  return {
    logo: 1 - smooth(safeTime / 1.1),
    caption: smooth((safeTime - 1.1) / 0.6),
  };
}

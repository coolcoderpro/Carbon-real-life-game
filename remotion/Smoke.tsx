import {
  AbsoluteFill,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

/**
 * Turns one still smoke PNG into a living, billowing plume: several copies rise,
 * grow, drift, rotate and fade on a seamless loop. Transparent background so it
 * composites cleanly onto the 3D world as a VideoTexture.
 */
const PUFFS = 8;

export const Smoke: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();
  const loop = frame / durationInFrames; // 0 → 1 over the whole comp

  return (
    <AbsoluteFill style={{ backgroundColor: "transparent" }}>
      {Array.from({ length: PUFFS }).map((_, i) => {
        const phase = i / PUFFS;
        // Per-puff progress; using modulo of the loop makes frame N === frame 0.
        const p = (loop + phase) % 1;

        // Rise from below the frame up past the top.
        const y = interpolate(p, [0, 1], [height * 0.6, -height * 0.3]);
        // Drift sideways with a gentle sine sway, more as it rises.
        const x =
          width * 0.5 + Math.sin((p + phase) * Math.PI * 2) * width * 0.14 * (0.4 + p);
        // Grow as it climbs.
        const scale = interpolate(p, [0, 1], [0.45, 1.6]);
        // Fade in off the base, hold, fade out near the top.
        const opacity = interpolate(p, [0, 0.18, 0.7, 1], [0, 0.9, 0.65, 0]);
        // Slow rotation, alternating direction per puff, for a curling look.
        const rotate = interpolate(p, [0, 1], [-12 + i * 3, 14 - i * 3]);

        const size = width * 0.8;
        return (
          <Img
            key={i}
            src={staticFile("textures/smoke.png")}
            style={{
              position: "absolute",
              width: size,
              height: size,
              left: x - size / 2,
              top: y - size / 2,
              transform: `scale(${scale}) rotate(${rotate}deg)`,
              opacity,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

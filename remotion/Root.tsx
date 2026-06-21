import { Composition } from "remotion";
import { Smoke } from "./Smoke";

/**
 * Renders a seamless, looping smoke plume from the single transparent smoke
 * PNG. Output is a transparent WebM used as a VideoTexture in the 3D world.
 */
export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="Smoke"
      component={Smoke}
      durationInFrames={90}
      fps={30}
      width={768}
      height={1024}
    />
  );
};

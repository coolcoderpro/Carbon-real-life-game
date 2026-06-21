import { Config } from "@remotion/cli/config";

// Transparent WebM output (alpha) for compositing into the 3D world.
Config.setVideoImageFormat("png");
Config.setPixelFormat("yuva420p");
Config.setCodec("vp8");

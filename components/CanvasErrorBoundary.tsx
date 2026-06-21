"use client";

import { Component, type ReactNode } from "react";

/**
 * Catches client-side errors from the WebGL/3D canvas so a failure shows a
 * clear message instead of silently hanging on the loading fallback.
 */
export default class CanvasErrorBoundary extends Component<
  { children: ReactNode },
  { error: Error | null }
> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error) {
    // Surface the real cause in the dev console.
    console.error("3D scene failed to render:", error);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex h-full w-full flex-col items-center justify-center gap-1 px-6 text-center">
          <p className="text-sm font-semibold text-emerald-900/80">
            🌍 The 3D world couldn&apos;t start
          </p>
          <p className="max-w-sm text-xs text-emerald-900/60">
            Your browser may not support WebGL, or it&apos;s disabled. Try a
            different browser or enable hardware acceleration.
          </p>
          <p className="mt-1 max-w-sm break-words text-[10px] text-red-700/70">
            {this.state.error.message}
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

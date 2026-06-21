"use client";

import { AnimatePresence, motion } from "framer-motion";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useGame } from "@/context/GameProvider";
import { worldMood } from "@/lib/garden";
import type { LastAction } from "@/lib/types";
import CanvasErrorBoundary from "./CanvasErrorBoundary";

// The 3D scene touches the DOM/WebGL, so load it client-only.
const GardenScene3D = dynamic(() => import("./GardenScene3D"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center text-sm text-emerald-900/50">
      Growing your world… 🌍
    </div>
  ),
});

export default function Garden({ basic }: { basic?: boolean }) {
  const { state } = useGame();
  const mood = worldMood(state.health);

  // Transient feedback for the most recent action: a flash + a floating badge.
  const [pulse, setPulse] = useState<LastAction | null>(null);
  useEffect(() => {
    if (!state.lastAction) return;
    setPulse(state.lastAction);
    const t = setTimeout(() => setPulse(null), 1500);
    return () => clearTimeout(t);
  }, [state.lastAction]);

  const pulseEmits = (pulse?.co2e ?? 0) > 0;

  return (
    <div className="relative h-80 w-full overflow-hidden rounded-3xl border border-black/5 bg-sky-100 shadow-inner sm:h-[28rem]">
      {/* Reactive 3D world */}
      <CanvasErrorBoundary>
        <GardenScene3D health={state.health} items={state.gardenItems} basic={basic} />
      </CanvasErrorBoundary>

      {/* Good/bad flash on each action — a soft shockwave that scales out */}
      <AnimatePresence>
        {pulse && (
          <motion.div
            key={pulse.uid}
            className="pointer-events-none absolute inset-0"
            style={{
              background: pulseEmits
                ? "radial-gradient(circle at 50% 58%, rgba(220,38,38,0.30), transparent 68%)"
                : "radial-gradient(circle at 50% 58%, rgba(16,185,129,0.32), transparent 68%)",
            }}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: [0, 0.95, 0], scale: 1.12 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.0, ease: "easeOut", times: [0, 0.22, 1] }}
          />
        )}
      </AnimatePresence>

      {/* Mood badge — pops when the world's mood changes */}
      <div className="pointer-events-none absolute left-4 top-4">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={mood.label}
            className="flex items-center gap-2 rounded-full bg-white/55 px-3 py-1 text-sm font-medium text-emerald-900 shadow-sm backdrop-blur-sm"
            initial={{ opacity: 0, scale: 0.7, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.7, y: 6 }}
            transition={{ type: "spring", stiffness: 380, damping: 22 }}
          >
            <motion.span
              className="text-lg"
              initial={{ rotate: -25, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 16, delay: 0.05 }}
            >
              {mood.emoji}
            </motion.span>
            {mood.label}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Floating impact badge: springs up, blurs in, the emoji pops */}
      <AnimatePresence>
        {pulse && (
          <motion.div
            key={`toast-${pulse.uid}`}
            className={`pointer-events-none absolute left-1/2 top-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-bold text-white shadow-lg ring-2 ring-white/25 backdrop-blur-sm ${
              pulseEmits ? "bg-red-600/90" : "bg-emerald-600/90"
            }`}
            initial={{ opacity: 0, y: 14, scale: 0.5, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: -74, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -104, scale: 0.85, filter: "blur(4px)" }}
            transition={{
              y: { type: "spring", stiffness: 110, damping: 15 },
              scale: { type: "spring", stiffness: 340, damping: 15 },
              opacity: { duration: 0.25 },
              filter: { duration: 0.3 },
            }}
          >
            <motion.span
              className="text-base"
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 520, damping: 13, delay: 0.06 }}
            >
              {pulse.emoji}
            </motion.span>
            <span className="tabular-nums">
              {pulseEmits ? "+" : "−"}
              {Math.abs(pulse.co2e)} kg CO₂e
            </span>
            <span>{pulseEmits ? "🥀" : "🌱"}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {state.gardenItems.length === 0 && (
        <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/60 px-4 py-1.5 text-center text-xs text-emerald-900/70 backdrop-blur-sm">
          Log a daily action below and watch your world grow. 🌱
        </div>
      )}
    </div>
  );
}

"use client";

import { motion } from "framer-motion";

/** A few drifting emoji particles that set the mood of the whole scene. */
function Particles({
  emojis,
  count,
  fall,
}: {
  emojis: string[];
  count: number;
  fall: boolean;
}) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const leftPct = (i + 0.5) * (100 / count);
        const delay = (i % count) * 0.7;
        const duration = fall ? 6 + (i % 3) : 9 + (i % 4);
        const emoji = emojis[i % emojis.length];
        return (
          <motion.span
            key={`${emoji}-${i}`}
            className="pointer-events-none absolute text-lg sm:text-xl"
            style={{ left: `${leftPct}%`, top: fall ? "-8%" : "auto" }}
            initial={
              fall
                ? { y: "-10%", x: 0, opacity: 0, rotate: 0 }
                : { y: "85%", x: 0, opacity: 0 }
            }
            animate={
              fall
                ? { y: "115%", x: [0, 14, -10, 0], opacity: [0, 0.8, 0.8, 0], rotate: [0, 120, 240, 360] }
                : { y: "5%", x: [0, 18, -12, 0], opacity: [0, 0.9, 0.9, 0] }
            }
            transition={{ duration, delay, repeat: Infinity, ease: "easeInOut" }}
          >
            {emoji}
          </motion.span>
        );
      })}
    </>
  );
}

export default function GardenAmbient2D({ health }: { health: number }) {
  if (health >= 75) {
    return (
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <Particles emojis={["🦋", "✨", "🐝"]} count={5} fall={false} />
      </div>
    );
  }

  if (health < 40) {
    return (
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(120,89,53,0.18), rgba(80,60,40,0.28))",
          }}
          animate={{ opacity: health < 25 ? 0.9 : 0.55 }}
          transition={{ duration: 0.8 }}
        />
        <Particles emojis={["🍂", "🍁"]} count={6} fall={true} />
      </div>
    );
  }

  return null;
}

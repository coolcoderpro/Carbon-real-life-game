"use client";

import { useGame } from "@/context/GameProvider";
import { CATEGORY_LABELS } from "@/lib/actions";
import { categoryBreakdown, grossEmissions, totalCO2e, totalSavings } from "@/lib/carbon";

export default function StatsPanel() {
  const { state } = useGame();
  const net = totalCO2e(state.log);
  const gross = grossEmissions(state.log);
  const saved = totalSavings(state.log);
  const breakdown = categoryBreakdown(state.log).filter((b) => b.total !== 0);
  const maxAbs = Math.max(1, ...breakdown.map((b) => Math.abs(b.total)));

  return (
    <div className="rounded-2xl bg-white/70 p-4 shadow-sm">
      <h2 className="mb-3 text-sm font-semibold text-emerald-950">Today&apos;s footprint</h2>

      <div className="mb-3 grid grid-cols-3 gap-2 text-center">
        <Stat label="Net" value={net} unit="kg" highlight />
        <Stat label="Emitted" value={gross} unit="kg" />
        <Stat label="Saved" value={saved} unit="kg" />
      </div>

      {breakdown.length === 0 ? (
        <p className="text-xs text-emerald-900/60">No actions logged yet.</p>
      ) : (
        <ul className="space-y-1.5">
          {breakdown.map((b) => (
            <li key={b.category} className="text-xs">
              <div className="mb-0.5 flex justify-between text-emerald-900/80">
                <span>{CATEGORY_LABELS[b.category]}</span>
                <span className="tabular-nums">
                  {b.total > 0 ? "+" : ""}
                  {b.total} kg
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-black/5">
                <div
                  className={`h-full rounded-full ${b.total > 0 ? "bg-red-400" : "bg-green-400"}`}
                  style={{ width: `${(Math.abs(b.total) / maxAbs) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  unit,
  highlight,
}: {
  label: string;
  value: number;
  unit: string;
  highlight?: boolean;
}) {
  return (
    <div className={`rounded-xl px-2 py-2 ${highlight ? "bg-emerald-100" : "bg-black/5"}`}>
      <div className="text-[10px] uppercase tracking-wide text-emerald-900/60">{label}</div>
      <div className="tabular-nums text-base font-bold text-emerald-950">{value}</div>
      <div className="text-[10px] text-emerald-900/50">{unit}</div>
    </div>
  );
}

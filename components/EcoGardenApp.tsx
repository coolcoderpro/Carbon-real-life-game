import ActionBar from "@/components/ActionBar";
import ActionLog from "@/components/ActionLog";
import Garden from "@/components/Garden";
import HealthMeter from "@/components/HealthMeter";
import InsightsPanel from "@/components/InsightsPanel";
import StatsPanel from "@/components/StatsPanel";

/**
 * The full EcoGarden app layout, shared by the 3D scene routes.
 *  - `basic`: render the early "every action grows a tree" world (Scene 1)
 *  - `badge` / `subtitle`: scene labelling for recording
 */
export default function EcoGardenApp({
  basic,
  badge,
  subtitle,
}: {
  basic?: boolean;
  badge?: string;
  subtitle?: string;
}) {
  return (
    <main className="mx-auto max-w-5xl px-4 py-6 sm:py-10">
      <header className="mb-6 text-center">
        <h1 className="text-2xl font-extrabold tracking-tight text-emerald-950 sm:text-3xl">
          🌱 EcoGarden
          {badge && (
            <span className="ml-2 rounded-lg bg-emerald-600 px-2 py-0.5 align-middle text-lg font-extrabold text-white sm:text-xl">
              {badge}
            </span>
          )}
        </h1>
        <p className="mx-auto mt-1 max-w-xl text-sm text-emerald-900/70">
          {subtitle ??
            "Your real-life choices grow a virtual garden. Log what you did today — green habits make it flourish, high-carbon ones make it wither."}
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        {/* Left: the world + how to act on it */}
        <section className="space-y-6">
          <Garden basic={basic} />
          <div>
            <h2 className="mb-2 text-sm font-semibold text-emerald-950">
              What did you do today?
            </h2>
            <ActionBar />
          </div>
        </section>

        {/* Right: feedback + insights */}
        <aside className="space-y-4">
          <HealthMeter />
          <StatsPanel />
          <InsightsPanel />
          <ActionLog />
        </aside>
      </div>

      <footer className="mt-8 text-center text-xs text-emerald-900/40">
        Demo · CO₂e values are approximate, illustrative estimates.
      </footer>
    </main>
  );
}

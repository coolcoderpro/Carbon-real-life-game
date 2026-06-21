import ActionBar from "@/components/ActionBar";
import HealthMeter from "@/components/HealthMeter";
import Garden2D from "@/components/legacy2d/Garden2D";

/**
 * Standalone preservation of the original 2D emoji garden (Phase 1–2), kept
 * for the build-log / YouTube video. The main app at "/" uses the 3D world.
 */
export default function TwoDGardenPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-6 sm:py-10">
      <header className="mb-6 text-center">
        <h1 className="text-2xl font-extrabold tracking-tight text-emerald-950 sm:text-3xl">
          🌱 EcoGarden
          <span className="ml-2 rounded-lg bg-emerald-600 px-2 py-0.5 align-middle text-lg font-extrabold text-white sm:text-xl">
            2D Version
          </span>
        </h1>
        <p className="mx-auto mt-1 max-w-xl text-sm text-emerald-900/70">
          Built in 2D — an emoji garden that grows with your choices. Click actions
          below to watch plants pop in, wilt, and the sky shift.
        </p>
      </header>

      <div className="space-y-6">
        <Garden2D />
        <HealthMeter />
        <div>
          <h2 className="mb-2 text-sm font-semibold text-emerald-950">
            What did you do today?
          </h2>
          <ActionBar />
        </div>
      </div>
    </main>
  );
}

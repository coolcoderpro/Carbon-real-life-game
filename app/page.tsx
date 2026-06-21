import Link from "next/link";

const SCENES = [
  {
    href: "/2d-garden-scene-1",
    badge: "2D · Scene 1",
    title: "🌱 The 2D emoji garden",
    desc: "Where it started — an emoji garden that grows with your choices. Plants pop in, wilt, and the sky shifts.",
  },
  {
    href: "/3d-scene-1",
    badge: "3D · Scene 1",
    title: "🌳 The first 3D world",
    desc: "Every action grows a tree in a living 3D scene. Trees sway, grow, and wilt with the garden's health.",
  },
  {
    href: "/3d-scene-2",
    badge: "3D · Scene 2",
    title: "🔥 Real impact",
    desc: "Each choice shows what it really does: greenery for good habits, smog, scorched earth and trash for the rest.",
  },
];

export default function Home() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:py-16">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-emerald-950 sm:text-4xl">
          🌍 EcoGarden — Build Scenes
        </h1>
        <p className="mx-auto mt-2 max-w-xl text-sm text-emerald-900/70">
          Each scene is a milestone in the build. Open one to record it.
        </p>
      </header>

      <div className="space-y-4">
        {SCENES.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="block rounded-2xl border border-black/5 bg-white/70 p-5 shadow-sm transition-colors hover:bg-white"
          >
            <span className="inline-block rounded-lg bg-emerald-600 px-2 py-0.5 text-xs font-bold text-white">
              {s.badge}
            </span>
            <h2 className="mt-2 text-lg font-bold text-emerald-950">{s.title}</h2>
            <p className="mt-1 text-sm text-emerald-900/70">{s.desc}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}

# 🌍 EcoGarden — Your Personal Carbon Coach

> **Challenge vertical: Sustainability — a Personal Carbon Coach.**
> EcoGarden is a smart, context‑aware sustainability assistant disguised as a
> living world. You tell it what you did today; it scores the carbon impact of
> each choice, coaches you with personalized, rule‑based tips, and reflects the
> *cumulative* consequence of your decisions back to you as a 3D world that
> visibly flourishes or wilts.

**Live idea:** every real‑life choice carries a cost to the planet. Good choices
let your world thrive; harmful ones cloud the sky and scorch the earth. The point
is simple and deliberate — **every single action counts.**

🎥 *YouTube walkthrough coming soon.*

---

## 1. Chosen vertical & persona

| | |
|---|---|
| **Vertical** | Sustainability / climate behaviour change |
| **Persona** | A busy individual who wants to lower their carbon footprint but finds raw numbers abstract and easy to ignore |
| **The assistant's job** | Turn each logged daily action into (a) an honest carbon score, (b) a clear visual consequence, and (c) a concrete, personalized next step |

Carbon literacy is hard to *feel*. A "12 kg CO₂e" figure means nothing to most
people. EcoGarden's bet is that **seeing** the same choice heal or harm a world —
plus a one‑line coaching tip — drives behaviour where a spreadsheet can't.

---

## 2. Approach & logic

The assistant is **deterministic and explainable** — no model calls, no
randomness in the scoring. Every decision is traceable to a pure function, which
makes it fast, private, testable, and reproducible.

**Decision flow for each action the user logs:**

1. **Look up the action** → each preset carries an approximate `co2e` value in
   kg (`lib/actions.ts`). Negative = a saving vs. a typical higher‑carbon
   alternative (e.g. cycling instead of driving).
2. **Score the impact on the world** → `healthDelta(co2e)` moves a 0–100 world‑
   health meter, **clamped to `[-15, +8]`** so no single entry (a flight) can
   instantly zero the world out (`lib/garden.ts`).
3. **Decide what it manifests as** → each action maps to a `WorldKind`
   (`tree`, `sprout`, `smog`, `scorch`, `trash`) representing the *kind* of
   real‑world good or harm it does.
4. **Resolve the conflict** → good and bad don't just pile up. A new plant
   **cleans up** existing pollution; new pollution **razes** existing plants.
   How many it clears scales with the carbon (`clearPower`), and the oldest
   opposing objects go first — so the world reflects your *balance*, not your
   entire history (`lib/gameState.ts`).
5. **Coach** → `generateInsights()` reads the whole day's log and produces a
   short, prioritized list of tips: a net‑day headline, your biggest emitting
   category plus a concrete swap, and acknowledgement of your good choices
   (`lib/insights.ts`).

All of this is reversible: every action stashes what it destroyed, so **Undo**
restores the world exactly.

---

## 3. How the solution works

```
User clicks an action
        │
        ▼
GameProvider.logAction(id)         context/GameProvider.tsx
        │  dispatch LOG_ACTION
        ▼
gameReducer  (pure)                lib/gameState.ts
        │  ├─ score health         lib/garden.ts   (healthDelta, clamp)
        │  ├─ spawn world object    lib/garden.ts   (toGardenItem, pickPosition)
        │  └─ clear opposites       lib/garden.ts   (clearPower, isGreen/Pollution)
        ▼
new GameState  ── derived, no extra state ──►  carbon.ts / insights.ts
        │
        ▼
UI re-renders
  • 3D world      components/GardenScene3D.tsx   (react-three-fiber, useFrame)
  • Footprint     components/StatsPanel.tsx
  • Coaching      components/InsightsPanel.tsx
  • Health meter  components/HealthMeter.tsx
```

**Key design choices**

- **Single source of truth** — one `GameState` in a `useReducer`; every panel,
  stat, and 3D object is *derived* from it. There is no duplicated or
  out‑of‑sync state.
- **Pure logic, separated from UI** — all scoring/decision logic lives in `lib/`
  as side‑effect‑free functions. The React components only render.
- **Smooth, frame‑rate‑independent 3D** — the world interpolates between states
  using exponential damping (`lib/world.ts`), so it never snaps.

### Scenes (build milestones, each its own route)

| Route | Scene |
|---|---|
| `/` | Scene index |
| `/2d-garden-scene-1` | Original 2D emoji garden |
| `/3d-scene-1` | First 3D world — every action grows a tree |
| `/3d-scene-2` | Real impact — greenery vs. smog / scorch / trash |

---

## 4. Project structure

```
app/                 Next.js App Router pages (scene routes + index)
components/           UI + the react-three-fiber 3D world
  legacy2d/          the original 2D emoji garden (used by Scene 1)
context/             GameProvider — React context over the reducer
lib/                 all pure game logic (no React, no side effects)
  actions.ts         the carbon action presets (the "knowledge base")
  carbon.ts          footprint aggregations (net / gross / savings / breakdown)
  gameState.ts       the reducer — the decision engine
  garden.ts          scoring, world-health, conflict-resolution helpers
  insights.ts        the coaching tips
  world.ts           3D math (lerp / damp / grid → world position)
  types.ts           shared domain types
remotion/            Remotion composition that renders the smoke video
public/              static assets (smoke texture + rendered webm)
```

---

## 5. Running locally

**Prerequisites:** Node.js 18+ and npm.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm run lint     # lint
```

Try it: open `/3d-scene-2`, tap **✈️ Short flight** a few times to watch the sky
haze over and a smog column erupt — then **🌳 Plant a tree** to bring it back.

---

## 6. Assumptions made

- **CO₂e values are illustrative**, not precise accounting. They're rounded
  figures from common public footprint sources, chosen to convey *relative*
  impact. They are clearly labelled as estimates in the UI.
- **Negative `co2e`** models a *saving relative to a typical alternative*
  (cycling vs. driving), not literal carbon capture — except planting a tree.
- **One session = "today."** State is intentionally in‑memory and resets on
  reload; there's no backend, account, or persistence by design (keeps it
  private and dependency‑free for the demo).
- **Conflict resolution is intentional, not a bug** — actions clear opposites so
  the world shows your *current balance*. Plant a forest, take a flight, and the
  flight razes part of the forest.
- **WebM‑with‑alpha smoke** plays in Chrome/Edge/Firefox, not Safari (which
  needs HEVC‑alpha). A canvas error boundary degrades gracefully if WebGL or the
  video is unavailable.

---

## 7. Quality notes (mapped to evaluation focus)

- **Code quality** — domain logic is fully separated into pure functions in
  `lib/`; React components are thin and only render derived state. Types are
  centralized in `lib/types.ts`. Functions are small, named, and documented.
- **Security** — no backend, no network calls, no user data collected or stored,
  no `dangerouslySetInnerHTML`, no `eval`. Action ids are validated against the
  preset list before use (`getPreset` returns `undefined` → the reducer ignores
  unknown ids). Nothing leaves the browser.
- **Efficiency** — a single reducer with O(n) updates over a small action log;
  the 3D world uses frame‑rate‑independent damping so animation cost is fixed
  per frame regardless of device speed; deterministic per‑cell jitter avoids
  re‑randomizing on every render.
- **Testing** — the decision logic is built as pure, deterministic functions
  (`healthDelta`, `clampHealth`, `clearPower`, `classifyHealth`, `totalCO2e`,
  `generateInsights`, the reducer), which are directly unit‑testable without a
  DOM or mocks.
- **Accessibility** — semantic landmarks (`main`, `header`, `aside`, `footer`),
  real `<button>` elements with text labels (not icon‑only), and a non‑color
  signal on every choice (the `+/−` value and emoji), so impact isn't conveyed
  by colour alone.

---

## 8. Tech stack

Next.js (App Router) · React · TypeScript · Tailwind CSS · Three.js via
`@react-three/fiber` + `@react-three/drei` · Framer Motion · Remotion (smoke
video).

---

*Built for the Virtual Prompt Wars Hackathon. CO₂e figures are approximate,
illustrative estimates — directional, not exact.*

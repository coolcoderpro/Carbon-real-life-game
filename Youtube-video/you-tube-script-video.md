# 🎬 EcoGarden — YouTube Video Script

> Story-driven narration script for the build vlog. Drop your screen recordings
> under each **[B-ROLL]** cue. **[VO]** = voiceover narration (what you say).
> **[ON-SCREEN]** = text/captions to overlay. **[ACTION]** = what to click on camera.
>
> Companion doc: [`BUILD_LOG.md`](./BUILD_LOG.md) (the technical phase-by-phase log).
> Recording routes (run `npm run dev`):
> - `/` — scene menu
> - `/2d-garden-scene-1` — Scene 1 (2D)
> - `/3d-scene-1` — Scene 2 (3D)
> - `/3d-scene-2` — Scene 3 (3D improved)

---

## 🎯 Runtime & flow at a glance

| Section | Approx. length | Route to record |
|---|---|---|
| 0. Cold open / hook | 0:00 – 0:20 | `/3d-scene-2` (eye candy) |
| 1. Intro — what is this? | 0:20 – 1:00 | `/` menu |
| 2. Why I'm building it | 1:00 – 2:00 | talking head / b-roll |
| 3. How we got started | 2:00 – 3:00 | code editor |
| 4. Scene 1 — 2D garden | 3:00 – 5:00 | `/2d-garden-scene-1` |
| 5. Scene 2 — going 3D | 5:00 – 7:30 | `/3d-scene-1` |
| 6. Scene 3 — 3D improved | 7:30 – 10:30 | `/3d-scene-2` |
| 7. Recap & what's next | 10:30 – 11:30 | `/` menu |
| 8. Outro / CTA | 11:30 – 12:00 | talking head |

---

## 0. 🪝 Cold open (hook)

**[B-ROLL]** Record `/3d-scene-2`. Spam ✈️ Short flight 3–4 times — let the sky
haze over, smog columns erupt, leaves fall. Then click 🌳 Plant a tree a few
times and watch it recover.

**[VO]**
> "What if every choice you made in real life… changed a whole world?
> Eat a steak — and the land scorches. Take a flight — and the sky chokes with
> smog. But cycle to work, plant a tree… and watch it all come back to life.
> I built this from scratch. Let me show you how."

**[ON-SCREEN]** `EcoGarden — building a climate game from scratch`

---

## 1. 👋 Intro — what is this?

**[B-ROLL]** Record `/` (the scene menu). Slowly scroll through the three cards.

**[VO]**
> "This is EcoGarden — a little web app where your real, everyday decisions
> grow or destroy a living world. The idea is simple: you log what you did
> today — what you ate, how you travelled, how you used energy — and the app
> turns your carbon footprint into something you can actually *see*."

**[ON-SCREEN]** `Your daily choices → a living, reacting world`

**[VO]**
> "And instead of just showing you a boring number, it gives you a world that
> reacts. In this video I'll walk you through how it evolved — from a flat 2D
> sketch, to a full real-time 3D world."

---

## 2. 💡 Why I'm building this

**[B-ROLL]** Talking head, or b-roll of climate/everyday-life clips.

**[VO]**
> "Here's the thing that bugged me. We all *know* our choices have a carbon
> cost — but it's invisible. A number like '5 kilograms of CO₂' means nothing
> emotionally. You can't feel it."

**[ON-SCREEN]** `The problem: carbon footprint feels abstract`

**[VO]**
> "So I wanted to make it *felt*. What if your good habits visibly grew a
> garden — and your bad ones visibly wrecked it? That emotional feedback loop
> is the whole point. Make the invisible, visible. That's why I built this."

**[ON-SCREEN]** `The goal: make the invisible, visible`

---

## 3. 🛠️ How we got started

**[B-ROLL]** Code editor — show the project structure: `lib/`, `components/`,
`app/`. Briefly show `lib/actions.ts` (the list of actions and CO₂e values).

**[VO]**
> "I started with the foundation — no graphics yet, just the logic. Every
> action is a preset with a carbon value: positive numbers emit carbon,
> negative numbers save it. Eating beef is plus five. Cycling instead of
> driving is minus one."

**[ON-SCREEN]** `Stack: Next.js · React · TypeScript · Tailwind`

**[VO]**
> "Then a single number ties the whole thing together — a 'world health' score
> from 0 to 100. Good actions push it up, bad actions drag it down. That score
> is the heartbeat of everything you're about to see. With the brain in place,
> it was time to give it a face."

**[ON-SCREEN]** `One number to rule them all: World Health (0–100)`

---

## 4. 🌱 Scene 1 — The 2D garden

**Record at:** `/2d-garden-scene-1`

**[VO]**
> "Version one. A 2D emoji garden. Every action you log drops a little plant
> onto the grid."

**[ACTION]** Click 🌳 Plant a tree, 🥗 Plant-based meal, 🚲 Cycled — watch plants
pop in with a springy bounce.

**[VO]**
> "Good choices come in healthy and green. But log something bad…"

**[ACTION]** Click ✈️ Short flight and 🥩 Ate beef a few times.

**[B-ROLL]** Close-up: plants fading, going grayscale, drooping. Sky tinting brown.
Falling leaves appearing.

**[VO]**
> "…and the whole garden reacts. Watch — the plants fade, they desaturate to
> gray, they droop over. The sky browns. Dead leaves start to fall. And every
> click throws up a little badge telling you exactly how much carbon you just
> added or saved."

**[ON-SCREEN]** `Scene 1 — what we built:`
- Action presets with CO₂e values
- World-health meter
- Emoji plants that wilt with the world
- Color-shifting sky + falling-leaf moods
- Per-click flash + floating impact badge

**[VO]**
> "Honestly? For a first pass, it worked. You could feel the cause and effect.
> But it had one big limit — it was flat. A grid of emoji. It didn't feel like
> a *world* yet. So I asked: what if this was actually 3D?"

**[ON-SCREEN]** `The limitation: it's flat. Let's go 3D. →`

---

## 5. 🌳 Scene 2 — Going 3D

**Record at:** `/3d-scene-1`

**[B-ROLL]** Let the camera auto-orbit the 3D scene for a few seconds before
talking — show off the depth.

**[VO]**
> "Same app. Same logic. But now the garden is a real 3D world, rendered live
> in the browser. I rebuilt the scene with Three.js. And the camera slowly
> orbits, so it feels like a living diorama."

**[ACTION]** Click several actions — trees grow in one by one.

**[VO]**
> "Every action grows a low-poly tree — and these aren't static. They grow in
> from nothing, they sway, and crucially, they react to the world's health in
> real time."

**[ACTION]** Spam a few bad actions (✈️, 🥩) to drop the health.

**[B-ROLL]** Close-up: trees leaning, browning; ground shifting from green to
brown; sky fogging up; the sun dimming.

**[VO]**
> "Drop the health, and watch the whole world turn. The trees lean over and go
> brown. The ground dies. Fog rolls in, the sky smogs over, the sun dims. And
> because it's all driven by one number, everything moves together — smoothly,
> no snapping between states."

**[ON-SCREEN]** `Scene 2 — what we improved:`
- 2D → real-time 3D (Three.js / react-three-fiber)
- Trees that grow, sway, lean & recolor with health
- Living ground, sky, fog & sun
- Falling leaves in 3D + auto-orbit camera

**[VO]**
> "This was a huge leap. But playing with it, I noticed something that bugged
> me… *every* action grew a tree. Even eating beef. Even taking a flight.
> That's backwards — a flight shouldn't plant a tree. It should do damage. So
> for the final pass, I made the world honest."

**[ON-SCREEN]** `The problem: bad actions shouldn't plant trees. →`

---

## 6. 🔥 Scene 3 — 3D, improved (real impact)

**Record at:** `/3d-scene-2`

**[VO]**
> "Final version. Now every choice manifests as what it actually does in the
> real world."

**[ACTION]** Click 🌳 Plant a tree and 🚲 Cycled — show green trees and sprouts.

**[VO]**
> "Good, low-carbon habits still grow greenery — trees and little sprouts."

**[ACTION]** Click 🥩 Ate beef.

**[B-ROLL]** Close-up on the scorched patch: charred ground, a dead blackened
stump, methane haze drifting up.

**[VO]**
> "But eat beef? The land scorches black, a dead stump appears, and methane
> gas drifts up — because that's the real story behind beef: deforestation and
> emissions."

**[ACTION]** Click ✈️ Short flight, then 🚗 Drove, then 🛍️ Fast fashion.

**[B-ROLL]** Smog columns of different sizes; the trash heap appearing on
scorched ground.

**[VO]**
> "Fly, and a giant column of smog erupts into the sky. Drive, and a smaller
> one. Buy fast fashion, and a heap of trash piles up on scorched earth. And
> notice — the size of the damage scales with the carbon. The flight's smog
> dwarfs everything, because its footprint is *ninety* kilograms."

**[ON-SCREEN]** `Scene 3 — what we improved:`
- Each action spawns its *real* impact, not just a tree
- 🌳 trees / 🌿 sprouts → good habits
- 💨 smog plumes → driving, flying, AC, meat
- 🔥 scorched earth + methane → beef
- 🗑️ trash heaps → fast fashion
- Damage scales with CO₂e + scorches the ground

**[B-ROLL]** Tight close-ups of the pollution detail (great cutaway shots):
- Smog: **black smoke billowing and tumbling** from a **glowing orange vent**
- Beef: **flickering flames + rising embers** over the scorched stump
- Trash: **flies buzzing** around the heap + a green stink haze

**[VO]** *(optional, over the close-ups)*
> "And I leaned into the detail — the smoke actually billows and tumbles, the
> beef patch is literally on fire with embers flying off it, and the trash heap?
> Yeah… it's got flies."

### 6c. Weight & escalation — the polish pass

**[ACTION]** Click a bad action and watch the *spawn* in slow-mo if you can.

**[B-ROLL]** Spawn close-ups: the object **bounces in** (overshoots then settles),
the ground **pops dark**, a **dust puff** rings out. Beef: the **stump rises out of
the ground**. Trash: the **boxes drop and bounce**.

**[VO]**
> "I also gave every bad thing *weight*. They don't just appear — they punch in
> with a little bounce, the ground darkens under them, dust kicks up. The beef
> stump literally rises out of the earth. Tiny details… but they're what make it
> feel real."

**[ACTION]** Now spam ✈️ / 🚗 / 🛍️ repeatedly to pile up pollution.

**[B-ROLL]** Wide shot: as pollution accumulates, the **smoke darkens toward
black** and the **trash heaps grow** into mounds.

**[VO]**
> "And it escalates. The more you pollute, the darker the smoke turns — grey,
> then black — and the trash piles swell into little landfills. The world keeps
> score."

**[ON-SCREEN]** `Polish: weighty spawns · richer loops · escalation`

**[VO]**
> "Now the world tells the truth. Plant trees and cycle, and it's lush and full
> of life. Live high-carbon, and you're standing in scorched earth under a
> smog-filled sky. That contrast — that's the whole message of the project, in
> one screen."

### 6b. The tug-of-war — good vs. bad fight for the land

**[VO]**
> "But there was one more thing that bugged me. Watch what happened *before* —
> I'd plant a forest, then take a flight… and the trees just sat there next to
> the smog. Good and bad piled up side by side and never touched. That's not how
> it works in real life."

**[B-ROLL]** *(optional)* Show the old behaviour for contrast: trees and smog
coexisting untouched.

**[ACTION]** Plant several 🌳 trees so the scene is green. Then click ✈️ Short flight.

**[B-ROLL]** Close-up: as the smog column erupts, several trees **vanish** —
the pollution razes the forest.

**[VO]**
> "So now they fight for the land. Take a flight, and the smog *wipes out* the
> trees around it — and the bigger the footprint, the more it destroys. A flight
> razes a whole cluster; a bus, just one."

**[ACTION]** Now spam 🌳 Plant a tree / 🚲 Cycled on the polluted scene.

**[B-ROLL]** Close-up: each new plant makes a smog/scorch/trash object **disappear**
as greenery takes its place.

**[VO]**
> "And it works both ways. Start planting and cycling, and your good choices
> literally clean up the mess — every tree clears out a patch of pollution. The
> world is never just a pile of everything you've ever done… it's a living
> tug-of-war between the good and the bad. Whoever you feed, wins."

**[ON-SCREEN]** `New: good vs. bad fight for the land`
- New pollution **destroys** nearby greenery (scaled by CO₂e)
- New greenery **cleans up** pollution
- Oldest opposing objects clear first
- The world reflects your *balance*, not just your history

**[ACTION]** Reset, then plant several trees + good actions to show the world at
full health (butterflies/clear sky) for a satisfying payoff shot.

---

## 7. 🔁 Recap & what's next

**[B-ROLL]** `/` menu, then quick cuts between all three scenes.

**[VO]**
> "So that's the journey — from a flat grid of emoji, to a 3D world, to a world
> that honestly reflects the cost of every choice. Same core logic the whole
> way; what changed was how *loudly* it spoke to you."

**[ON-SCREEN]** `2D → 3D → 3D with real impact`

**[VO]**
> "Where's it going next? I want pollution to actually *spread* — let smog kill
> the trees around it over time. More detailed objects — a real factory, a car
> with exhaust. And eventually, swapping my code-made shapes for proper 3D art."

**[ON-SCREEN]** `Next: spreading pollution · custom 3D art · more objects`

---

## 8. 🎤 Outro / CTA

**[B-ROLL]** Talking head or a final hero shot of the thriving world.

**[VO]**
> "If you want to see me build those next features — actual 3D models,
> spreading pollution — subscribe, because that's coming. Drop a comment with
> the one habit you'd change first. Thanks for watching — I'll see you in the
> next one."

**[ON-SCREEN]** `👍 Subscribe · 💬 What habit would you change first?`

---

## 🎞️ Editor's cheat-sheet

**Best money shots to capture:**
- ✈️ flight on `/3d-scene-2` → huge smog column + sky hazing (the hook)
- 🥩 beef close-up → scorched earth + methane
- Full recovery: spam 🌳 + good actions → lush world, butterflies, clear sky
- Side-by-side: same action in Scene 1 vs Scene 2 vs Scene 3

**Pacing tips:**
- Keep cold open under 20s — lead with the most dramatic before/after.
- Let the 3D auto-orbit breathe for 2–3s before talking over it.
- Reload the page before each scene take for a clean (empty) world.

**Lower-third labels (match the in-app badges):**
- `2D · Scene 1` · `3D · Scene 1` · `3D · Scene 2`

**Music:** soft/hopeful under intro → tense/darker as the world wilts → uplifting
on recovery.

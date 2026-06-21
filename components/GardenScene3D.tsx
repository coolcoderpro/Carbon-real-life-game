"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Billboard, OrbitControls, useVideoTexture } from "@react-three/drei";
import { Suspense, useMemo, useRef, type ReactNode } from "react";
import * as THREE from "three";
import { isPollutionKind, itemVitality } from "@/lib/garden";
import { cellToWorld, damp, WORLD_COLORS } from "@/lib/world";
import type { GardenItem } from "@/lib/types";

/** Scale factor (0.35–1.6) from an action's carbon magnitude. */
function magnitude(co2e: number): number {
  return Math.min(1.6, Math.max(0.35, Math.abs(co2e) / 6));
}

/**
 * Ease-out-back: rises past 1 and settles back — gives the spawn a bit of
 * physical "weight" (scale 0 → ~1.15 → 1.0). `x` is 0–1 spawn progress.
 */
function easeOutBack(x: number): number {
  const c1 = 2.4;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
}

const SPAWN_DURATION = 0.5; // seconds

/**
 * A soft, wispy smoke texture generated on a canvas — gives particles feathered,
 * volumetric edges instead of hard faceted blobs. Built once and reused.
 *
 * TO USE REAL IMAGES: drop a transparent PNG at `public/textures/smoke.png` and
 * swap this for `useTexture("/textures/smoke.png")` in SmokeColumn.
 */
let _smokeTexture: THREE.Texture | null = null;
function smokeTexture(): THREE.Texture {
  if (_smokeTexture) return _smokeTexture;
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(64, 64, 2, 64, 64, 64);
  g.addColorStop(0, "rgba(255,255,255,0.95)");
  g.addColorStop(0.45, "rgba(255,255,255,0.5)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  // A few irregular wisps so each puff looks unique and cloudy.
  for (let i = 0; i < 7; i++) {
    const x = 64 + (Math.random() - 0.5) * 44;
    const y = 64 + (Math.random() - 0.5) * 44;
    const r = 16 + Math.random() * 26;
    const gg = ctx.createRadialGradient(x, y, 1, x, y, r);
    gg.addColorStop(0, "rgba(255,255,255,0.22)");
    gg.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = gg;
    ctx.fillRect(0, 0, 128, 128);
  }
  _smokeTexture = new THREE.CanvasTexture(c);
  return _smokeTexture;
}

/* ------------------------------------------------------------------ */
/* Green, life-giving objects (good choices)                          */
/* ------------------------------------------------------------------ */

/**
 * A plant whose target vitality (0–1) blends its own carbon with overall
 * world health: it smoothly grows in, recolors green→brown, shrinks and leans
 * as that value changes. `variant` picks a tall conifer or a little sprout.
 *
 * To swap in your own art, replace the meshes here with a GLTF model loaded
 * via useGLTF — the vitality-driven scale/lean/color logic stays the same.
 */
function Plant({
  item,
  vitality,
  variant,
}: {
  item: GardenItem;
  vitality: number;
  variant: "tree" | "sprout";
}) {
  const group = useRef<THREE.Group>(null);
  const foliage = useRef<THREE.Mesh>(null);
  const pos = useMemo(() => cellToWorld(item.x, item.y), [item.x, item.y]);

  const cur = useRef(0);
  const grow = useRef(0);
  const healthy = useMemo(() => new THREE.Color(WORLD_COLORS.foliageHealthy), []);
  const dead = useMemo(() => new THREE.Color(WORLD_COLORS.foliageDead), []);
  const tmp = useMemo(() => new THREE.Color(), []);
  const base = variant === "tree" ? 1 : 0.5;

  useFrame((_, dt) => {
    cur.current = damp(cur.current, vitality, 3, dt);
    grow.current = damp(grow.current, 1, 4, dt);
    const v = cur.current;
    if (group.current) {
      group.current.scale.setScalar(grow.current * base * (0.55 + v * 0.55));
      group.current.rotation.z = (1 - v) * 0.6;
    }
    if (foliage.current) {
      tmp.copy(dead).lerp(healthy, Math.min(1, v * 1.1));
      (foliage.current.material as THREE.MeshStandardMaterial).color.copy(tmp);
      foliage.current.scale.setScalar(0.4 + v * 0.6);
      foliage.current.visible = v > 0.12;
    }
  });

  if (variant === "sprout") {
    return (
      <group ref={group} position={pos}>
        <mesh position={[0, 0.18, 0]} castShadow>
          <cylinderGeometry args={[0.03, 0.04, 0.36, 5]} />
          <meshStandardMaterial color="#3f7a2e" />
        </mesh>
        <mesh ref={foliage} position={[0, 0.42, 0]} castShadow>
          <icosahedronGeometry args={[0.22, 0]} />
          <meshStandardMaterial color={WORLD_COLORS.foliageHealthy} flatShading />
        </mesh>
      </group>
    );
  }

  return (
    <group ref={group} position={pos}>
      <mesh position={[0, 0.35, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.12, 0.7, 6]} />
        <meshStandardMaterial color="#6b4f2a" />
      </mesh>
      <mesh ref={foliage} position={[0, 0.95, 0]} castShadow>
        <coneGeometry args={[0.45, 1.0, 7]} />
        <meshStandardMaterial color={WORLD_COLORS.foliageHealthy} flatShading />
      </mesh>
      <mesh position={[0, 1.35, 0]} castShadow>
        <coneGeometry args={[0.32, 0.7, 7]} />
        <meshStandardMaterial color={WORLD_COLORS.foliageHealthy} flatShading />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Pollution / destruction objects (bad choices)                      */
/* ------------------------------------------------------------------ */

/**
 * A dark scorched decal that pops onto the ground in a quick circular pulse
 * (darker flash, then settle) the moment a bad action lands.
 */
function ScorchDecal({ radius }: { radius: number }) {
  const mesh = useRef<THREE.Mesh>(null);
  const age = useRef(0);
  useFrame((_, dt) => {
    age.current += dt;
    const p = Math.min(1, age.current / 0.45);
    if (mesh.current) {
      mesh.current.scale.setScalar(easeOutBack(p));
      (mesh.current.material as THREE.MeshStandardMaterial).opacity = 0.6 + (1 - p) * 0.35;
    }
  });
  return (
    <mesh
      ref={mesh}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0.02, 0]}
      renderOrder={1}
      scale={0}
    >
      <circleGeometry args={[radius, 24]} />
      <meshStandardMaterial
        color="#241712"
        transparent
        opacity={0.95}
        polygonOffset
        polygonOffsetFactor={-2}
      />
    </mesh>
  );
}

/**
 * A rising column of smoke/gas puffs that billow sideways and tumble as they
 * climb, fading in at the base and out at the top. Reused for smog and methane.
 */
function SmokeColumn({
  color,
  opacity,
  count,
  spread,
  rise,
  baseY,
  puff,
}: {
  color: string;
  opacity: number;
  count: number;
  spread: number;
  rise: number;
  baseY: number;
  puff: number;
}) {
  const group = useRef<THREE.Group>(null);
  const tex = useMemo(() => smokeTexture(), []);
  const seeds = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        x: (Math.random() - 0.5) * spread,
        z: (Math.random() - 0.5) * spread,
        y: Math.random() * rise,
        speed: 0.4 + Math.random() * 0.6,
        scale: 0.6 + Math.random() * 0.7,
        phase: Math.random() * Math.PI * 2,
        sway: 0.18 + Math.random() * 0.3,
        spin: (Math.random() - 0.5) * 1.2,
      })),
    [count, spread, rise],
  );

  useFrame((state, dt) => {
    if (!group.current) return;
    const time = state.clock.elapsedTime;
    group.current.children.forEach((c, i) => {
      const s = seeds[i];
      const sprite = c as THREE.Sprite;
      sprite.position.y += s.speed * dt;
      if (sprite.position.y > rise) sprite.position.y = 0;
      const t = sprite.position.y / rise;
      // Billow outward as the puff rises.
      sprite.position.x = s.x + Math.sin(time * 1.4 + s.phase) * s.sway * t;
      sprite.position.z = s.z + Math.cos(time * 1.1 + s.phase) * s.sway * t;
      // Slowly swirl the sprite (2D rotation) for a curling, cloudy look.
      sprite.material.rotation += s.spin * dt;
      // Occasional thicker bursts swell random puffs; sprites grow as they rise.
      const burst = 1 + Math.max(0, Math.sin(time * 0.5 + s.phase) - 0.6) * 1.8;
      sprite.scale.setScalar(puff * s.scale * burst * (0.9 + t * 1.6));
      // Fade in quickly off the base, fade out toward the top.
      const fade = Math.min(1, t * 5) * Math.min(1, (1 - t) * 1.6);
      sprite.material.opacity = opacity * fade;
    });
  });

  return (
    <group ref={group} position={[0, baseY, 0]}>
      {seeds.map((s, i) => (
        <sprite key={i} position={[s.x, s.y, s.z]} scale={0.001}>
          <spriteMaterial
            map={tex}
            color={color}
            transparent
            opacity={opacity}
            depthWrite={false}
          />
        </sprite>
      ))}
    </group>
  );
}

/** Rising, glowing embers/sparks that fade as they climb (fire). */
function Embers({
  count,
  spread,
  rise,
  baseY,
  size,
  color,
}: {
  count: number;
  spread: number;
  rise: number;
  baseY: number;
  size: number;
  color: string;
}) {
  const group = useRef<THREE.Group>(null);
  const seeds = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        x: (Math.random() - 0.5) * spread,
        z: (Math.random() - 0.5) * spread,
        y: Math.random() * rise,
        speed: 0.7 + Math.random() * 0.9,
        phase: Math.random() * Math.PI * 2,
      })),
    [count, spread, rise],
  );

  useFrame((state, dt) => {
    if (!group.current) return;
    const time = state.clock.elapsedTime;
    group.current.children.forEach((c, i) => {
      const s = seeds[i];
      c.position.y += s.speed * dt;
      if (c.position.y > rise) c.position.y = 0;
      const t = c.position.y / rise;
      c.position.x = s.x + Math.sin(time * 3 + s.phase) * 0.06;
      c.scale.setScalar(size * (1 - t * 0.6));
      const mat = (c as THREE.Mesh).material as THREE.MeshStandardMaterial;
      mat.opacity = 1 - t;
    });
  });

  return (
    <group ref={group} position={[0, baseY, 0]}>
      {seeds.map((s, i) => (
        <mesh key={i} position={[s.x, s.y, s.z]}>
          <sphereGeometry args={[1, 6, 6]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={2.2}
            transparent
            opacity={1}
          />
        </mesh>
      ))}
    </group>
  );
}

/** Flickering flames at the base of a scorched patch. */
function Fire({ m }: { m: number }) {
  const group = useRef<THREE.Group>(null);
  const seeds = useMemo(
    () =>
      Array.from({ length: 4 }, () => ({
        x: (Math.random() - 0.5) * 0.3 * m,
        z: (Math.random() - 0.5) * 0.3 * m,
        phase: Math.random() * Math.PI * 2,
        h: 0.28 + Math.random() * 0.22,
      })),
    [m],
  );

  useFrame((state) => {
    if (!group.current) return;
    const time = state.clock.elapsedTime;
    group.current.children.forEach((c, i) => {
      const s = seeds[i];
      const f = 0.7 + Math.sin(time * 12 + s.phase) * 0.3;
      c.scale.set(1, f * 1.3, 1);
      const mat = (c as THREE.Mesh).material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 1.3 + f;
    });
  });

  return (
    <group ref={group}>
      {seeds.map((s, i) => (
        <mesh key={i} position={[s.x, s.h / 2, s.z]}>
          <coneGeometry args={[0.1 * m, s.h, 6]} />
          <meshStandardMaterial
            color="#ff7517"
            emissive="#ff4400"
            emissiveIntensity={1.6}
            transparent
            opacity={0.9}
          />
        </mesh>
      ))}
    </group>
  );
}

/** Buzzing flies circling a trash heap. */
function Flies({ m }: { m: number }) {
  const group = useRef<THREE.Group>(null);
  const count = Math.round(4 + m * 3);
  const seeds = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        r: 0.28 + Math.random() * 0.4 * m,
        y: 0.18 + Math.random() * 0.4 * m,
        speed: 1 + Math.random() * 2,
        phase: Math.random() * Math.PI * 2,
      })),
    [count, m],
  );

  useFrame((state) => {
    if (!group.current) return;
    const time = state.clock.elapsedTime;
    group.current.children.forEach((c, i) => {
      const s = seeds[i];
      const a = time * s.speed + s.phase;
      // Figure-eight (lissajous) path instead of a perfect circle.
      c.position.set(
        Math.sin(a) * s.r,
        s.y + Math.sin(a * 3) * 0.06,
        Math.sin(a * 2) * s.r * 0.6,
      );
    });
  });

  return (
    <group ref={group}>
      {seeds.map((_, i) => (
        <mesh key={i}>
          <sphereGeometry args={[0.022, 5, 5]} />
          <meshStandardMaterial color="#141414" />
        </mesh>
      ))}
    </group>
  );
}

/**
 * Spawn wrapper: pops the object in with an overshoot/bounce (0 → 1.15 → 1.0)
 * plus a small random tilt, so every new pollution source feels like it lands
 * with physical weight.
 */
function GrowIn({
  pos,
  children,
}: {
  pos: [number, number, number];
  children: ReactNode;
}) {
  const group = useRef<THREE.Group>(null);
  const age = useRef(0);
  const tilt = useMemo(() => ((Math.random() * 6 - 3) * Math.PI) / 180, []);
  useFrame((_, dt) => {
    age.current += dt;
    const p = Math.min(1, age.current / SPAWN_DURATION);
    if (group.current) {
      group.current.scale.setScalar(easeOutBack(p));
      group.current.rotation.z = tilt;
    }
  });
  return (
    <group ref={group} position={pos}>
      {children}
    </group>
  );
}

/** Small black ash flakes that detach from a smoke column and drift away. */
function Ash({ count, spread, rise }: { count: number; spread: number; rise: number }) {
  const group = useRef<THREE.Group>(null);
  const seeds = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        x: (Math.random() - 0.5) * spread,
        z: (Math.random() - 0.5) * spread,
        y: Math.random() * rise,
        speed: 0.25 + Math.random() * 0.4,
        drift: (Math.random() - 0.5) * 0.5,
        phase: Math.random() * Math.PI * 2,
      })),
    [count, spread, rise],
  );
  useFrame((state, dt) => {
    if (!group.current) return;
    const time = state.clock.elapsedTime;
    group.current.children.forEach((c, i) => {
      const s = seeds[i];
      c.position.y += s.speed * dt;
      c.position.x += s.drift * dt;
      if (c.position.y > rise) {
        c.position.y = 0;
        c.position.x = s.x;
      }
      c.rotation.x += dt * 2;
      c.rotation.y += dt * 1.4;
      const mat = (c as THREE.Mesh).material as THREE.MeshStandardMaterial;
      mat.opacity = 0.7 * (1 - c.position.y / rise) * (0.6 + 0.4 * Math.sin(time + s.phase));
    });
  });
  return (
    <group ref={group} position={[0, 0.4, 0]}>
      {seeds.map((s, i) => (
        <mesh key={i} position={[s.x, s.y, s.z]}>
          <boxGeometry args={[0.04, 0.04, 0.01]} />
          <meshStandardMaterial color="#15130f" transparent opacity={0.6} />
        </mesh>
      ))}
    </group>
  );
}

/** Green methane bubbles that swell up from a heap and pop. */
function Bubbles({ m }: { m: number }) {
  const group = useRef<THREE.Group>(null);
  const count = 5;
  const seeds = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        x: (Math.random() - 0.5) * 0.5 * m,
        z: (Math.random() - 0.5) * 0.5 * m,
        speed: 0.4 + Math.random() * 0.5,
        phase: Math.random(),
        size: 0.05 + Math.random() * 0.06,
      })),
    [m],
  );
  useFrame((state) => {
    if (!group.current) return;
    const time = state.clock.elapsedTime;
    group.current.children.forEach((c, i) => {
      const s = seeds[i];
      const cycle = (time * s.speed + s.phase) % 1; // 0→1 grow then pop
      const scale = Math.sin(cycle * Math.PI) * s.size;
      c.scale.setScalar(Math.max(0.0001, scale));
      c.position.y = 0.15 + cycle * 0.25 * m;
      const mat = (c as THREE.Mesh).material as THREE.MeshStandardMaterial;
      mat.opacity = 0.5 * Math.sin(cycle * Math.PI);
    });
  });
  return (
    <group ref={group}>
      {seeds.map((s, i) => (
        <mesh key={i} position={[s.x, 0.15, s.z]}>
          <sphereGeometry args={[1, 8, 8]} />
          <meshStandardMaterial color="#9bbf5a" transparent opacity={0.5} />
        </mesh>
      ))}
    </group>
  );
}

/** Loose plastic scraps that flutter near a trash heap. */
function Scraps({ m }: { m: number }) {
  const group = useRef<THREE.Group>(null);
  const count = 4;
  const seeds = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        x: (Math.random() - 0.5) * 0.8 * m,
        y: 0.15 + Math.random() * 0.3 * m,
        z: (Math.random() - 0.5) * 0.8 * m,
        phase: Math.random() * Math.PI * 2,
        color: ["#cdd2d6", "#d9c7b0", "#bcd3e0"][i % 3],
      })),
    [m],
  );
  useFrame((state) => {
    if (!group.current) return;
    const time = state.clock.elapsedTime;
    group.current.children.forEach((c, i) => {
      const s = seeds[i];
      c.rotation.x = Math.sin(time * 3 + s.phase) * 0.8;
      c.rotation.z = Math.cos(time * 2.4 + s.phase) * 0.6;
      c.position.y = s.y + Math.sin(time * 2 + s.phase) * 0.03;
    });
  });
  return (
    <group ref={group}>
      {seeds.map((s, i) => (
        <mesh key={i} position={[s.x, s.y, s.z]}>
          <planeGeometry args={[0.1, 0.1]} />
          <meshStandardMaterial color={s.color} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}

/** A one-shot dust puff that expands and fades when an object lands. */
function DustPuff({ radius }: { radius: number }) {
  const group = useRef<THREE.Group>(null);
  const age = useRef(0);
  const count = 8;
  const seeds = useMemo(
    () => Array.from({ length: count }, (_, i) => (i / count) * Math.PI * 2),
    [],
  );
  useFrame((_, dt) => {
    age.current += dt;
    const p = Math.min(1, age.current / 0.55);
    if (!group.current) return;
    group.current.visible = p < 1;
    group.current.children.forEach((c, i) => {
      const a = seeds[i];
      const r = radius * (0.2 + p * 1.1);
      c.position.set(Math.cos(a) * r, 0.05 + p * 0.1, Math.sin(a) * r);
      c.scale.setScalar(0.09 * (1 - p) + 0.02);
      const mat = (c as THREE.Mesh).material as THREE.MeshStandardMaterial;
      mat.opacity = 0.5 * (1 - p);
    });
  });
  return (
    <group ref={group}>
      {seeds.map((_, i) => (
        <mesh key={i}>
          <sphereGeometry args={[1, 6, 6]} />
          <meshStandardMaterial color="#b3a892" transparent opacity={0.5} />
        </mesh>
      ))}
    </group>
  );
}

/** A glowing vent mouth: flares bright on spawn, then pulses like a furnace. */
function VentGlow({ m }: { m: number }) {
  const mesh = useRef<THREE.Mesh>(null);
  const age = useRef(0);
  useFrame((state, dt) => {
    age.current += dt;
    const p = Math.min(1, age.current / 0.5);
    const spawnFlare = (1 - p) * 2.5;
    const pulse = 0.3 * Math.sin(state.clock.elapsedTime * 4);
    if (mesh.current) {
      (mesh.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
        1.4 + spawnFlare + pulse;
    }
  });
  return (
    <mesh ref={mesh} position={[0, 0.33, 0]}>
      <cylinderGeometry args={[0.11 * m, 0.11 * m, 0.05, 6]} />
      <meshStandardMaterial color="#ff7a18" emissive="#ff5a00" emissiveIntensity={1.4} />
    </mesh>
  );
}

/** A burnt stump that rises up out of the ground (with a slight tilt) on spawn. */
function RisingStump() {
  const mesh = useRef<THREE.Mesh>(null);
  const age = useRef(0);
  useFrame((_, dt) => {
    age.current += dt;
    const p = Math.min(1, age.current / 0.6);
    if (mesh.current) mesh.current.position.y = -0.4 + (0.58 * easeOutBack(p));
  });
  return (
    <mesh ref={mesh} position={[0, -0.4, 0]} rotation={[0.15, 0, 0.2]} castShadow>
      <cylinderGeometry args={[0.13, 0.18, 0.36, 6]} />
      <meshStandardMaterial color="#2a1d12" />
    </mesh>
  );
}

/** A trash cube that drops in from above with a bounce, after an optional delay. */
function DropCube({
  x,
  y,
  z,
  r,
  s,
  color,
  delay,
}: {
  x: number;
  y: number;
  z: number;
  r: number;
  s: number;
  color: string;
  delay: number;
}) {
  const mesh = useRef<THREE.Mesh>(null);
  const age = useRef(0);
  useFrame((_, dt) => {
    age.current += dt;
    const p = Math.min(1, Math.max(0, (age.current - delay) / 0.45));
    if (mesh.current) {
      mesh.current.visible = age.current > delay;
      mesh.current.position.y = y + 0.8 * (1 - Math.min(1, easeOutBack(p)));
    }
  });
  return (
    <mesh ref={mesh} position={[x, y + 0.8, z]} rotation={[r, r, 0]} castShadow>
      <boxGeometry args={[s, s, s]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

/**
 * Real animated smoke: the looping transparent WebM (rendered in Remotion from
 * the smoke PNG) mapped onto a camera-facing billboard. Falls back gracefully
 * (Suspense) until the video is available.
 */
function VideoSmoke({ m }: { m: number }) {
  const texture = useVideoTexture("/smoke.webm", {
    muted: true,
    loop: true,
    start: true,
    crossOrigin: "anonymous",
  });
  const w = 1.7 * m;
  const h = 2.4 * m;
  return (
    <Billboard position={[0, 0.3 + h * 0.42, 0]}>
      <mesh>
        <planeGeometry args={[w, h]} />
        <meshBasicMaterial map={texture} transparent depthWrite={false} toneMapped={false} />
      </mesh>
    </Billboard>
  );
}

/** Smog plume: a dark vent with a glowing mouth + real animated video smoke. */
function Smog({ item, darkness }: { item: GardenItem; darkness: number }) {
  const pos = useMemo(() => cellToWorld(item.x, item.y), [item.x, item.y]);
  const m = magnitude(item.co2e);
  // Escalation: the plume grows bigger as pollution accumulates.
  const plume = m * (1 + darkness * 0.35);
  return (
    <GrowIn pos={pos}>
      <ScorchDecal radius={0.42 * m} />
      <DustPuff radius={0.42 * m} />
      {/* Dark vent / chimney */}
      <mesh position={[0, 0.15, 0]} castShadow>
        <cylinderGeometry args={[0.13 * m, 0.18 * m, 0.34, 6]} />
        <meshStandardMaterial color="#242424" />
      </mesh>
      {/* Glowing vent mouth: flares on spawn, then furnace-pulses */}
      <VentGlow m={m} />
      {/* Real animated smoke video (Remotion → transparent WebM) + drifting ash */}
      <Suspense fallback={null}>
        <VideoSmoke m={plume} />
      </Suspense>
      <Ash count={Math.round(5 + m * 4)} spread={0.55 * m} rise={2.2 + m} />
    </GrowIn>
  );
}

/** Scorched earth: charred ground, a rising burnt stump, fire, embers + methane (beef). */
function Scorch({ item }: { item: GardenItem }) {
  const pos = useMemo(() => cellToWorld(item.x, item.y), [item.x, item.y]);
  const m = magnitude(item.co2e);
  return (
    <GrowIn pos={pos}>
      <ScorchDecal radius={0.7 * m} />
      <DustPuff radius={0.6 * m} />
      {/* Dead, blackened stump that rises up out of the ground */}
      <RisingStump />
      {/* Flickering flames + rising embers (land cleared by burning) */}
      <Fire m={m} />
      <Embers count={9} spread={0.45 * m} rise={1.3} baseY={0.1} size={0.03} color="#ff7a18" />
      {/* Sickly methane haze drifting up */}
      <SmokeColumn
        color="#7c8a52"
        opacity={0.5}
        count={8}
        spread={0.6 * m}
        rise={1.7}
        baseY={0.4}
        puff={0.65 * m}
      />
    </GrowIn>
  );
}

/** Trash heap: dropping waste cubes, flies, popping methane bubbles + scraps. */
function Trash({ item, pileBoost }: { item: GardenItem; pileBoost: number }) {
  const pos = useMemo(() => cellToWorld(item.x, item.y), [item.x, item.y]);
  const m = magnitude(item.co2e);
  // Escalation: the more trash in the world, the bigger each heap grows.
  const grow = 1 + pileBoost * 0.5;
  const cubes = useMemo(() => {
    const colors = ["#7a7a7a", "#8a5a3a", "#b04a3a", "#4a6a8a", "#9a8a3a"];
    return Array.from({ length: Math.round((5 + m * 4) * grow) }, (_, i) => ({
      x: (Math.random() - 0.5) * 0.6 * m * grow,
      y: 0.06 + Math.random() * 0.4 * m * grow,
      z: (Math.random() - 0.5) * 0.6 * m * grow,
      r: Math.random() * Math.PI,
      s: 0.12 + Math.random() * 0.14,
      c: colors[i % colors.length],
      delay: Math.random() * 0.35,
    }));
  }, [m, grow]);
  return (
    <GrowIn pos={pos}>
      <ScorchDecal radius={0.55 * m * grow} />
      <DustPuff radius={0.55 * m} />
      {/* Waste pieces drop into place with a bounce */}
      {cubes.map((c, i) => (
        <DropCube key={i} x={c.x} y={c.y} z={c.z} r={c.r} s={c.s} color={c.c} delay={c.delay} />
      ))}
      {/* Buzzing flies, popping methane bubbles, fluttering scraps + stink haze */}
      <Flies m={m} />
      <Bubbles m={m} />
      <Scraps m={m} />
      <SmokeColumn
        color="#7faa55"
        opacity={0.3 + pileBoost * 0.15}
        count={5}
        spread={0.5 * m}
        rise={1.3}
        baseY={0.32}
        puff={0.5 * m}
      />
    </GrowIn>
  );
}

/**
 * Render the right 3D object for an item's kind. In `basic` mode (the early
 * Phase-3 version) every action simply grows a tree, regardless of impact.
 */
function WorldObject({
  item,
  health,
  basic,
  darkness,
  pileBoost,
}: {
  item: GardenItem;
  health: number;
  basic?: boolean;
  darkness: number;
  pileBoost: number;
}) {
  if (basic) {
    return <Plant item={item} vitality={itemVitality(item, health)} variant="tree" />;
  }
  switch (item.kind) {
    case "tree":
      return <Plant item={item} vitality={itemVitality(item, health)} variant="tree" />;
    case "sprout":
      return <Plant item={item} vitality={itemVitality(item, health)} variant="sprout" />;
    case "smog":
      return <Smog item={item} darkness={darkness} />;
    case "scorch":
      return <Scorch item={item} />;
    case "trash":
      return <Trash item={item} pileBoost={pileBoost} />;
  }
}

/* ------------------------------------------------------------------ */
/* Environment                                                        */
/* ------------------------------------------------------------------ */

function Ground({ health }: { health: number }) {
  const mesh = useRef<THREE.Mesh>(null);
  const cur = useRef(health);
  const healthy = useMemo(() => new THREE.Color(WORLD_COLORS.groundHealthy), []);
  const dead = useMemo(() => new THREE.Color(WORLD_COLORS.groundDead), []);
  const tmp = useMemo(() => new THREE.Color(), []);

  useFrame((_, dt) => {
    cur.current = damp(cur.current, health, 2.5, dt);
    if (mesh.current) {
      tmp.copy(dead).lerp(healthy, cur.current / 100);
      (mesh.current.material as THREE.MeshStandardMaterial).color.copy(tmp);
    }
  });

  return (
    <mesh ref={mesh} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <circleGeometry args={[7, 48]} />
      <meshStandardMaterial color={WORLD_COLORS.groundHealthy} />
    </mesh>
  );
}

function Leaves({ health }: { health: number }) {
  const group = useRef<THREE.Group>(null);
  const count = 60;
  const seeds = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        x: (Math.random() - 0.5) * 8,
        z: (Math.random() - 0.5) * 6,
        y: Math.random() * 4,
        speed: 0.4 + Math.random() * 0.6,
        sway: Math.random() * Math.PI * 2,
      })),
    [],
  );
  const opacity = useRef(0);

  useFrame((stateF, dt) => {
    const target = health < 40 ? (health < 25 ? 1 : 0.6) : 0;
    opacity.current = damp(opacity.current, target, 2, dt);
    if (!group.current) return;
    group.current.visible = opacity.current > 0.02;
    group.current.children.forEach((child, i) => {
      const s = seeds[i];
      child.position.y -= s.speed * dt;
      child.position.x += Math.sin(stateF.clock.elapsedTime + s.sway) * 0.003;
      child.rotation.z += dt * s.speed;
      if (child.position.y < 0) child.position.y = 4;
      const mat = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
      mat.opacity = opacity.current;
    });
  });

  return (
    <group ref={group}>
      {seeds.map((s, i) => (
        <mesh key={i} position={[s.x, s.y, s.z]}>
          <planeGeometry args={[0.16, 0.16]} />
          <meshStandardMaterial color="#a8642a" transparent opacity={0} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}

function Environment({ health }: { health: number }) {
  const cur = useRef(health);
  const skyHealthy = useMemo(() => new THREE.Color(WORLD_COLORS.skyHealthy), []);
  const skyDead = useMemo(() => new THREE.Color(WORLD_COLORS.skyDead), []);
  const fogHealthy = useMemo(() => new THREE.Color(WORLD_COLORS.fogHealthy), []);
  const fogDead = useMemo(() => new THREE.Color(WORLD_COLORS.fogDead), []);
  const sky = useMemo(() => new THREE.Color(), []);
  const fog = useMemo(() => new THREE.FogExp2("#cfefff", 0.04), []);
  const sun = useRef<THREE.DirectionalLight>(null);

  useFrame((stateF, dt) => {
    cur.current = damp(cur.current, health, 2.5, dt);
    const t = cur.current / 100;
    sky.copy(skyDead).lerp(skyHealthy, t);
    stateF.scene.background = sky;
    fog.color.copy(fogDead).lerp(fogHealthy, t);
    fog.density = 0.02 + (1 - t) * 0.08;
    stateF.scene.fog = fog;
    if (sun.current) sun.current.intensity = 0.6 + t * 1.1;
  });

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight
        ref={sun}
        position={[4, 8, 3]}
        intensity={1.4}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
    </>
  );
}

function SceneContents({
  health,
  items,
  basic,
}: {
  health: number;
  items: GardenItem[];
  basic?: boolean;
}) {
  // Escalation cues that build as pollution accumulates across the whole world.
  const pollutionCount = basic
    ? 0
    : items.filter((i) => isPollutionKind(i.kind)).length;
  const trashCount = basic ? 0 : items.filter((i) => i.kind === "trash").length;
  const darkness = Math.min(1, pollutionCount / 8);
  const pileBoost = Math.min(1, (trashCount - 1) / 4);

  return (
    <>
      <Environment health={health} />
      <Ground health={health} />
      {items.map((item) => (
        <WorldObject
          key={item.uid}
          item={item}
          health={health}
          basic={basic}
          darkness={darkness}
          pileBoost={pileBoost}
        />
      ))}
      <Leaves health={health} />
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        minPolarAngle={Math.PI / 3.2}
        maxPolarAngle={Math.PI / 2.2}
        autoRotate
        autoRotateSpeed={0.4}
      />
    </>
  );
}

export default function GardenScene3D({
  health,
  items,
  basic,
}: {
  health: number;
  items: GardenItem[];
  basic?: boolean;
}) {
  return (
    <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 3.2, 7], fov: 45 }} gl={{ antialias: true }}>
      <SceneContents health={health} items={items} basic={basic} />
    </Canvas>
  );
}

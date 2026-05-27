import * as React from "react";
import { View } from "react-native";
import { useReducedMotion } from "react-native-reanimated";
import * as THREE from "three";

// Canvas + useFrame are re-exported from a platform-specific file. Metro
// picks the `.web.tsx` variant on web (DOM Canvas) and the default
// `.tsx` variant on iOS / Android (GLView Canvas). Critically, both
// Canvas and useFrame come from the SAME package instance on each
// platform — otherwise useFrame loses the store and the loop never ticks.
import { Canvas, useFrame } from "./voice-sphere-canvas";
import { cn } from "../lib/cn";

export interface VoiceSphereProps {
  /** Listening state — speeds rotation, boosts wave amplitude, saturates colors. */
  active?: boolean;
  /**
   * Live amplitude 0..1. When provided, overrides the internal idle/active
   * envelope (feed from a metering source).
   */
  amplitude?: number;
  /** Diameter in px. Default 240. */
  size?: number;
  /** Particle grid density. Default "medium" (~3000 particles). */
  density?: "low" | "medium" | "high";
  /** Override the two gradient endpoints (defaults to theme primary + accent). */
  colors?: { from: string; to: string };
  className?: string;
}

const COLOR = {
  primary: "#7A5BFF",
  accent: "#FF4FB1",
} as const;

const DENSITY: Record<NonNullable<VoiceSphereProps["density"]>, number> = {
  low: 1500,
  medium: 3000,
  high: 6000,
};

/**
 * appCN VoiceSphere — a true-3D particle sphere that breathes when idle and
 * ripples with sound when active. Built on react-three-fiber + three.js;
 * runs in Expo (via expo-gl) and Expo-web (native browser WebGL) from one
 * source.
 *
 * Visuals: ~3000 particles spaced via the Fibonacci spiral on a unit sphere,
 * a custom GLSL displacement (3D simplex noise) ripples the equator band,
 * per-vertex color blend tints primary → accent across the surface, and a
 * depth-aware fragment dims back-facing particles so the silhouette reads
 * as 3D parallax under rotation.
 */
export function VoiceSphere({
  active = false,
  amplitude,
  size = 240,
  density = "medium",
  colors,
  className,
}: VoiceSphereProps) {
  const reduced = useReducedMotion();
  const count = DENSITY[density];
  const colorFrom = colors?.from ?? COLOR.primary;
  const colorTo = colors?.to ?? COLOR.accent;

  // Client-only mount. The web R3F Canvas needs `window` to set up its
  // WebGL context — during static rendering / SSR `window` is undefined,
  // so the Canvas can't mount and the page would hydrate to a blank box.
  // Deferring to a post-mount effect guarantees we render only in the
  // browser. No-op on native (useEffect runs on first frame anyway).
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={active ? "Listening" : "Voice indicator idle"}
      style={{
        width: size,
        height: size,
        position: "relative",
        backgroundColor: "#0A0A14",
        borderRadius: 24,
      }}
      className={cn(className)}
    >
      {mounted ? (
        <Canvas
          style={{ width: "100%", height: "100%" }}
          camera={{ position: [0, 0, 4.2], fov: 45 }}
          frameloop="always"
          gl={{
            antialias: true,
            powerPreference: "high-performance",
          }}
          onCreated={(state: any) => {
            // Opaque dark clear — particles use additive blending, so the
            // background must be dark for them to read as glowing dots.
            state.gl.setClearColor("#0A0A14", 1);
          }}
        >
          <ambientLight intensity={0.4} />
          <Halo
            active={active}
            amplitude={amplitude}
            colorFrom={colorFrom}
            reduced={!!reduced}
          />
          <ParticleSphere
            count={count}
            active={active}
            amplitude={amplitude}
            colorFrom={colorFrom}
            colorTo={colorTo}
            reduced={!!reduced}
          />
        </Canvas>
      ) : null}
    </View>
  );
}

/* ============================================================ */
/* Particle sphere — Fibonacci geometry + GLSL displacement     */
/* ============================================================ */

interface SphereProps {
  count: number;
  active: boolean;
  amplitude?: number;
  colorFrom: string;
  colorTo: string;
  reduced: boolean;
}

function ParticleSphere({
  count,
  active,
  amplitude,
  colorFrom,
  colorTo,
  reduced,
}: SphereProps) {
  const meshRef = React.useRef<THREE.Points>(null!);
  const matRef = React.useRef<THREE.ShaderMaterial>(null!);

  // Initial uniforms passed at material creation time. After mount we mutate
  // `matRef.current.uniforms` directly — that's the object the material
  // actually uploads to the GPU each frame.
  const initialUniforms = React.useMemo(
    () => ({
      uTime: { value: 0 },
      uAmp: { value: 0 },
      uActive: { value: 0 },
    }),
    []
  );

  const geometry = React.useMemo(
    () => buildSphereGeometry(count, colorFrom, colorTo),
    [count, colorFrom, colorTo]
  );

  useFrame((_, delta) => {
    const u = matRef.current?.uniforms as
      | { uTime: { value: number }; uAmp: { value: number }; uActive: { value: number } }
      | undefined;
    if (!u) return;

    if (reduced) {
      u.uTime.value = 0.5;
      u.uAmp.value = 0.05;
      u.uActive.value = active ? 1 : 0;
      return;
    }

    const energy = u.uAmp.value;
    u.uTime.value += delta * (active ? 0.4 + energy * 1.6 : 0.2);

    const targetAmp = amplitude != null ? amplitude : active ? 0.18 : 0.06;
    u.uAmp.value += (targetAmp - u.uAmp.value) * Math.min(1, delta * 12);

    const targetActive = active ? 1 : 0;
    u.uActive.value +=
      (targetActive - u.uActive.value) * Math.min(1, delta * 3);

    if (meshRef.current) {
      const rotSpeed = active ? 0.22 - energy * 0.18 : 0.1;
      meshRef.current.rotation.y += delta * Math.max(0.04, rotSpeed);
      meshRef.current.rotation.x = Math.sin(u.uTime.value * 0.3) * 0.08;
      const scale = 1 + energy * 0.03;
      meshRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <points ref={meshRef} geometry={geometry}>
      <shaderMaterial
        ref={matRef}
        uniforms={initialUniforms}
        vertexShader={SPHERE_VERTEX_SHADER}
        fragmentShader={SPHERE_FRAGMENT_SHADER}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function buildSphereGeometry(
  count: number,
  colorFrom: string,
  colorTo: string
): THREE.BufferGeometry {
  const positions = new Float32Array(count * 3);
  const colorArr = new Float32Array(count * 3);
  const offsets = new Float32Array(count);

  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  const a = new THREE.Color(colorFrom);
  const b = new THREE.Color(colorTo);
  const blended = new THREE.Color();

  for (let i = 0; i < count; i++) {
    const y = 1 - (i / Math.max(1, count - 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const phi = i * goldenAngle;
    const x = Math.cos(phi) * r;
    const z = Math.sin(phi) * r;

    positions[i * 3 + 0] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;

    const t = (x + 1) * 0.5;
    blended.copy(a).lerp(b, t);
    colorArr[i * 3 + 0] = blended.r;
    colorArr[i * 3 + 1] = blended.g;
    colorArr[i * 3 + 2] = blended.b;

    offsets[i] = i * 0.137;
  }

  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  // Named aColor (not "color") because ShaderMaterial doesn't honor the
  // vertexColors flag — declaring our own attribute keeps the binding explicit.
  g.setAttribute("aColor", new THREE.BufferAttribute(colorArr, 3));
  g.setAttribute("aOffset", new THREE.BufferAttribute(offsets, 1));
  return g;
}

/* ============================================================ */
/* Halo — additive radial glow plane behind the sphere          */
/* ============================================================ */

interface HaloProps {
  active: boolean;
  amplitude?: number;
  colorFrom: string;
  reduced: boolean;
}

function Halo({ active, amplitude, colorFrom, reduced }: HaloProps) {
  const matRef = React.useRef<THREE.ShaderMaterial>(null!);

  const initialUniforms = React.useMemo(
    () => ({
      uAmp: { value: 0.2 },
      uColor: { value: new THREE.Color(colorFrom) },
    }),
    [colorFrom]
  );

  useFrame((_, delta) => {
    const u = matRef.current?.uniforms as
      | { uAmp: { value: number } }
      | undefined;
    if (!u) return;
    if (reduced) {
      u.uAmp.value = 0.3;
      return;
    }
    const target = amplitude != null ? amplitude * 1.4 : active ? 0.7 : 0.28;
    u.uAmp.value += (target - u.uAmp.value) * Math.min(1, delta * 2.5);
  });

  return (
    <mesh position={[0, 0, -0.6]}>
      <planeGeometry args={[5, 5]} />
      <shaderMaterial
        ref={matRef}
        uniforms={initialUniforms}
        vertexShader={HALO_VERTEX_SHADER}
        fragmentShader={HALO_FRAGMENT_SHADER}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

/* ============================================================ */
/* Shaders                                                      */
/* ============================================================ */

// 3D simplex noise — Ian McEwan / Stefan Gustavson, MIT.
// Reused by both spheres + halo if ever needed.
const SIMPLEX_NOISE_3D = /* glsl */ `
vec4 permute(vec4 x){ return mod(((x*34.0)+1.0)*x, 289.0); }
vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v){
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);

  vec3 x1 = x0 - i1 + 1.0 * C.xxx;
  vec3 x2 = x0 - i2 + 2.0 * C.xxx;
  vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;

  i = mod(i, 289.0);
  vec4 p = permute( permute( permute(
              i.z + vec4(0.0, i1.z, i2.z, 1.0))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0));

  float n_ = 1.0/7.0;
  vec3 ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);

  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);

  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;

  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}
`;

const SPHERE_VERTEX_SHADER = /* glsl */ `
uniform float uTime;
uniform float uAmp;
uniform float uActive;

attribute float aOffset;
attribute vec3 aColor;

varying vec3 vColor;
varying float vDepth;

${SIMPLEX_NOISE_3D}

void main() {
  vec3 pos = position;

  // Tight gaussian equator band — calm at the poles, hot at the equator.
  float band = exp(-pow(pos.y * 3.5, 2.0));

  // Clean traveling sine around the azimuth (8 peaks moving with time)
  // gives the rippling-band look the reference image has.
  float azimuth = atan(pos.z, pos.x);
  float wave = sin(azimuth * 8.0 - uTime * 2.2);

  // Slower organic noise layer on top so the wave isn't perfectly clean.
  // Clamped because snoise can spike past ±1, and we need a hard ceiling
  // on the total displacement so the sphere never blows past the canvas.
  float n1 = clamp(snoise(pos * 2.8 + vec3(uTime * 0.4, 0.0, aOffset * 0.01)), -1.0, 1.0);

  float pattern = clamp(wave * 0.7 + n1 * 0.3, -1.0, 1.0);

  // Equator displacement — strictly bounded. Peak push at full amp + peak
  // band = 22% radius outward. Combined with the camera-frustum headroom
  // this guarantees the sphere stays inside the canvas at every volume.
  float disp = uAmp * pattern * band * 0.22;
  vec3 displaced = pos * (1.0 + disp);

  vec4 mvPos = modelViewMatrix * vec4(displaced, 1.0);
  gl_Position = projectionMatrix * mvPos;

  // Depth cue: position in world space after model rotation.
  vec3 worldPos = (modelMatrix * vec4(pos, 1.0)).xyz;
  vDepth = (worldPos.z + 1.0) * 0.5; // 0 = back, 1 = front

  // Color: base gradient brightened toward front + when active.
  vColor = aColor * (0.45 + vDepth * 0.85) * (1.0 + uActive * 0.18);

  // Point size in PIXELS. Front particles ~5px, back particles ~2px. Resist
  // the temptation to multiply by 1/depth — for a fixed camera there's no
  // perspective foreshortening to compensate for, and the term inflates the
  // size 100x and saturates the additive blend to pure white.
  float baseSize = 3.0 + uActive * 0.8 + uAmp * 1.6;
  gl_PointSize = baseSize * (0.45 + vDepth * 1.1);
}
`;

const SPHERE_FRAGMENT_SHADER = /* glsl */ `
precision mediump float;

varying vec3 vColor;
varying float vDepth;

void main() {
  vec2 uv = gl_PointCoord - 0.5;
  float dist = length(uv);

  // Soft circular alpha. With sane particle sizes (~5px) and ~3000
  // particles, additive overlap stays in the visible range without blowing
  // out to white.
  float alpha = smoothstep(0.5, 0.0, dist);
  alpha *= alpha;
  alpha *= 0.35 + vDepth * 0.55;

  gl_FragColor = vec4(vColor, alpha);
}
`;

const HALO_VERTEX_SHADER = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const HALO_FRAGMENT_SHADER = /* glsl */ `
precision mediump float;

uniform float uAmp;
uniform vec3 uColor;
varying vec2 vUv;

void main() {
  vec2 center = vUv - 0.5;
  float dist = length(center);
  float glow = smoothstep(0.5, 0.0, dist);
  glow = pow(glow, 2.6);

  float intensity = glow * uAmp * 0.35;
  gl_FragColor = vec4(uColor * intensity, intensity);
}
`;

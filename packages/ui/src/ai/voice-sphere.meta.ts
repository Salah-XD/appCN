import type { ComponentMeta } from "../lib/meta";

export const meta: ComponentMeta = {
  slug: "voice-sphere",
  title: "Voice Sphere",
  category: "ai",
  description:
    "A true-3D particle sphere that breathes when idle and ripples with sound when active. The AI-collection voice indicator.",
  anatomy:
    "A WebGL `<Canvas>` hosts ~3000 particles spaced along a Fibonacci spiral on a unit sphere. A custom GLSL displacement (3D simplex noise) ripples the equator band, a per-vertex color blend tints primary → accent across the surface, and a depth-aware fragment dims back-facing particles so the silhouette reads as real 3D parallax under rotation. A second additive-blended plane behind the sphere supplies the halo pulse. Built on `@react-three/fiber/native` so the same source renders on Expo native (via `expo-gl`) and Expo-web (native browser WebGL).",
  delight:
    "Watch the equator under load — there's an inner wave at one frequency riding on top of a slower swell at another, so the band never repeats itself. Combined with the depth-faded silhouette and the gentle wobble on the X axis, the sphere reads alive even at zero amplitude.",
  props: [
    {
      name: "active",
      type: "boolean",
      default: "false",
      description:
        "Listening state. Speeds rotation, boosts wave amplitude, and saturates the color blend.",
    },
    {
      name: "amplitude",
      type: "number",
      description:
        "Live amplitude 0..1. When provided, drives the wave directly — feed it from a metering source. When omitted, an internal idle/active envelope animates instead.",
    },
    {
      name: "size",
      type: "number",
      default: "240",
      description: "Sphere diameter in px (the Canvas is square).",
    },
    {
      name: "density",
      type: '"low" | "medium" | "high"',
      default: '"medium"',
      description:
        "Particle count bucket — `low` ≈ 1500, `medium` ≈ 3000, `high` ≈ 6000. Drop to `low` on lower-end Android if framerate dips.",
    },
    {
      name: "colors",
      type: "{ from: string; to: string }",
      description:
        "Override the two gradient endpoints. Defaults to the theme primary + accent. Any CSS color string three.js accepts (`#hex`, `rgb()`, `hsl()`, named).",
    },
    {
      name: "className",
      type: "string",
      description: "Extra NativeWind classes merged onto the outer container.",
    },
  ],
  examples: [
    {
      title: "Basic",
      description: "Toggle active to switch between idle breathing and listening.",
      code: `const [active, setActive] = React.useState(false);
return (
  <View className="items-center gap-6">
    <VoiceSphere active={active} />
    <Button onPress={() => setActive((a) => !a)}>
      {active ? "Stop" : "Start listening"}
    </Button>
  </View>
);`,
    },
    {
      title: "Driven by mic amplitude",
      description:
        "Pipe metering from `expo-av` (or any recorder that reports level) into the `amplitude` prop. The sphere skips its internal envelope and follows your signal.",
      code: `// In your recorder setup, normalize the level to 0..1 and store it in state.
const [level, setLevel] = React.useState(0);
return <VoiceSphere active amplitude={level} />;`,
    },
    {
      title: "Custom palette",
      description: "Override the gradient endpoints for a brand-aligned look.",
      code: `<VoiceSphere
  active
  colors={{ from: "#00E5FF", to: "#FF6FA3" }}
/>`,
    },
  ],
  a11y: [
    "Container carries `accessibilityRole=\"image\"` with a label that swaps between \"Listening\" and \"Voice indicator idle\" — screen readers announce the state, not the visual.",
    "The Canvas itself is decorative; the parent View owns the announce.",
    "Honors `useReducedMotion()` — freezes the time uniform, drops amplitude to a static value, and stops auto-rotation. The sphere still reads as a 3D object, just still.",
    "No interactive elements inside — pair with a real Pressable (mic toggle) that owns the focus + hit target.",
  ],
  addedAt: "2026-05-28",
};

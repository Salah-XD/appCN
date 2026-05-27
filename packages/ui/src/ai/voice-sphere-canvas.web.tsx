/**
 * Web (DOM) export of the R3F Canvas + useFrame. Metro auto-selects this
 * file when the platform is `web`. Pairs with `voice-sphere-canvas.tsx`
 * for native. Same exports, different underlying renderer.
 */
export { Canvas, useFrame } from "@react-three/fiber";

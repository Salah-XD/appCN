/**
 * Platform-default (React Native) export of the R3F Canvas + useFrame.
 * Metro picks this file on iOS / Android. The browser variant lives in
 * `voice-sphere-canvas.web.tsx`. Importing both from the SAME module
 * source on each platform avoids the dual-context bug where useFrame
 * (loaded from one package) can't find the store created by Canvas
 * (loaded from another).
 */
export { Canvas, useFrame } from "@react-three/fiber/native";

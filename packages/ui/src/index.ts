export { Button, buttonVariants, buttonTextVariants } from "./components/button";
export type { ButtonProps } from "./components/button";

export { StreamBubble } from "./ai/stream-bubble";
export type { StreamBubbleProps } from "./ai/stream-bubble";

export { PromptInput } from "./ai/prompt-input";
export type { PromptInputProps, PromptAttachment } from "./ai/prompt-input";

export { ReasoningTrace } from "./ai/reasoning-trace";
export type { ReasoningTraceProps } from "./ai/reasoning-trace";

export { VoiceSphere } from "./ai/voice-sphere";
export type { VoiceSphereProps } from "./ai/voice-sphere";

export { cn } from "./lib/cn";
export { duration, easing, spring, PRESS_SCALE } from "./lib/motion";
export { haptic } from "./lib/haptics";

export type { ComponentMeta, PropDoc, ExampleDoc } from "./lib/meta";
export {
  buttonMeta,
  streamBubbleMeta,
  promptInputMeta,
  reasoningTraceMeta,
  voiceSphereMeta,
} from "./lib/meta";

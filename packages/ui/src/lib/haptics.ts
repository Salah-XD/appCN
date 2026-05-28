import { Platform } from "react-native";
import * as Haptics from "expo-haptics";

/**
 * appCN haptics — a tiny, safe wrapper around expo-haptics. Fire-and-forget,
 * no-ops on web, and never throws on unsupported devices. Pair physical motion
 * with a matching tap so interactions feel grounded.
 *
 * Declared as a registry dependency (`@app-cn/haptics`) for copy-paste consumers.
 */

const enabled = Platform.OS !== "web";

function run(fn: () => Promise<unknown>) {
  if (!enabled) return;
  // Some devices/simulators reject; we never want a tap to surface an error.
  fn().catch(() => {});
}

export const haptic = {
  /** Light tap — selection moving, value ticking. */
  light: () => run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)),
  /** Medium tap — a confirmed action (send, toggle on). */
  medium: () =>
    run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)),
  /** Heavy tap — a committed, consequential action. */
  heavy: () => run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)),
  /** The crisp "detent" tick for pickers, segmented controls, sliders. */
  selection: () => run(() => Haptics.selectionAsync()),
  success: () =>
    run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),
  warning: () =>
    run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)),
  error: () =>
    run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)),
};

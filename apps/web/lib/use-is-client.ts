"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

/**
 * Returns `false` during SSR / before hydration, then `true` once the
 * component has mounted on the client. Idiomatic React 19 replacement for
 * `useEffect(() => setMounted(true), [])` — passes the
 * `react-hooks/set-state-in-effect` rule and produces no cascading render.
 */
export function useIsClient(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

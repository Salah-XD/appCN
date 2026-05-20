import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge NativeWind/Tailwind class strings, resolving conflicts.
 * Declared as a registry dependency so copy-paste consumers get it too.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

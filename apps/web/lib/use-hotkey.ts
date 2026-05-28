"use client";

import * as React from "react";

/**
 * Bind a keyboard chord to a callback. Supports `mod+k` (Cmd on macOS, Ctrl
 * elsewhere) and plain keys (e.g. `"escape"`).
 *
 * Skips presses when the user is typing in an input / textarea / contentEditable
 * — so cmd+k inside a search field still inserts a `k` character.
 */
export function useHotkey(combo: string, handler: (e: KeyboardEvent) => void) {
  const handlerRef = React.useRef(handler);
  React.useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  React.useEffect(() => {
    const [maybeMod, maybeKey] = combo.toLowerCase().split("+");
    const needsMod = maybeMod === "mod";
    const key = needsMod ? maybeKey : maybeMod;

    function onKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      if (target) {
        const tag = target.tagName;
        const editable =
          tag === "INPUT" || tag === "TEXTAREA" || target.isContentEditable;
        // Always allow Escape; intercept other combos only outside editables.
        if (editable && e.key.toLowerCase() !== "escape") return;
      }

      if (e.key.toLowerCase() !== key) return;
      if (needsMod && !(e.metaKey || e.ctrlKey)) return;
      if (!needsMod && (e.metaKey || e.ctrlKey || e.altKey)) return;
      e.preventDefault();
      handlerRef.current(e);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [combo]);
}

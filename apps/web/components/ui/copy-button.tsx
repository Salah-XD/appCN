"use client";

import * as React from "react";

export function CopyButton({
  value,
  className,
  label = "Copy",
}: {
  value: string;
  className?: string;
  label?: string;
}) {
  const [copied, setCopied] = React.useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable (e.g. insecure context) — no-op
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className={
        "rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground " +
        (className ?? "")
      }
    >
      {copied ? "Copied!" : label}
    </button>
  );
}

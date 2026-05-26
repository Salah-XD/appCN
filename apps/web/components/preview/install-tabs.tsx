"use client";

import * as React from "react";
import { CopyButton } from "@/components/ui/copy-button";

export interface InstallOption {
  id: string;
  label: string;
  command: string;
  /** Optional inline hint shown under the command. */
  hint?: string;
}

export function InstallTabs({ options }: { options: InstallOption[] }) {
  const [active, setActive] = React.useState(options[0]?.id ?? "");
  const current = options.find((o) => o.id === active) ?? options[0];

  if (!current) return null;

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div role="tablist" className="flex border-b border-border bg-background/40 p-1.5">
        {options.map((o) => {
          const isActive = o.id === current.id;
          return (
            <button
              key={o.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActive(o.id)}
              className={
                "rounded-xl px-3 py-1.5 text-sm font-medium transition-colors " +
                (isActive
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:text-foreground")
              }
            >
              {o.label}
            </button>
          );
        })}
      </div>
      <div className="space-y-2 p-4">
        <div className="flex items-center justify-between gap-3 rounded-xl bg-background px-3 py-2">
          <code className="truncate font-mono text-sm text-foreground">
            {current.command}
          </code>
          <CopyButton value={current.command} />
        </div>
        {current.hint ? (
          <p className="px-1 text-xs text-muted-foreground">{current.hint}</p>
        ) : null}
      </div>
    </div>
  );
}

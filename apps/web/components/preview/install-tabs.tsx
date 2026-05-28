"use client";

import * as React from "react";
import { CopyButton } from "@/components/ui/copy-button";
import {
  BunIcon,
  NpmIcon,
  PnpmIcon,
  YarnIcon,
} from "@/components/brand/pm-icons";
import {
  PACKAGE_MANAGERS,
  type PackageManager,
  type PackageManagerCommands,
} from "@/lib/registry";

export interface InstallOption {
  id: string;
  label: string;
  /** Per-package-manager command strings. All four PMs must be provided. */
  commands: PackageManagerCommands;
  /** Optional inline hint shown under the command. */
  hint?: string;
  /** Optional brand mark shown before the label in the outer tab strip. */
  icon?: React.ReactNode;
}

const PM_LABEL: Record<PackageManager, string> = {
  npm: "npm",
  pnpm: "pnpm",
  yarn: "yarn",
  bun: "bun",
};

const PM_ICONS: Record<PackageManager, React.ComponentType<{ className?: string }>> = {
  npm: NpmIcon,
  pnpm: PnpmIcon,
  yarn: YarnIcon,
  bun: BunIcon,
};

export function InstallTabs({ options }: { options: InstallOption[] }) {
  const [activeId, setActiveId] = React.useState(options[0]?.id ?? "");
  const [pm, setPm] = React.useState<PackageManager>("npm");

  const current = options.find((o) => o.id === activeId) ?? options[0];
  if (!current) return null;

  const command = current.commands[pm];

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      {/* Outer: install-form tabs */}
      <div role="tablist" className="flex border-b border-border bg-background/40 p-1.5">
        {options.map((o) => {
          const isActive = o.id === current.id;
          return (
            <button
              key={o.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveId(o.id)}
              className={
                "inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-medium transition-colors " +
                (isActive
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:text-foreground")
              }
            >
              {o.icon}
              {o.label}
            </button>
          );
        })}
      </div>

      <div className="space-y-3 p-4">
        {/* Inner: package-manager segmented strip */}
        <div
          role="tablist"
          aria-label="Package manager"
          className="inline-flex rounded-lg border border-border/70 bg-background/40 p-0.5"
        >
          {PACKAGE_MANAGERS.map((id) => {
            const isActive = id === pm;
            const Icon = PM_ICONS[id];
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setPm(id)}
                className={
                  "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors " +
                  (isActive
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:text-foreground")
                }
              >
                <Icon className="h-3.5 w-3.5" />
                {PM_LABEL[id]}
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between gap-3 rounded-xl bg-background px-3 py-2">
          <code className="truncate font-mono text-sm text-foreground">
            {command}
          </code>
          <CopyButton value={command} />
        </div>
        {current.hint ? (
          <p className="px-1 text-xs text-muted-foreground">{current.hint}</p>
        ) : null}
      </div>
    </div>
  );
}

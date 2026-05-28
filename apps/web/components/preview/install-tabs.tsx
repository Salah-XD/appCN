"use client";

import * as React from "react";
import { CopyButton } from "@/components/ui/copy-button";
import { CodeBlock } from "@/components/ui/code-block";
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
import type { ManualInstall } from "@/lib/manual-install";

/**
 * Discriminated union — the outer tab strip can mix "single command" tabs
 * (existing behavior) with one or more "manual" tabs that render numbered
 * steps including dependency installs and copy-paste source.
 */
export type InstallOption =
  | {
      kind?: "command";
      id: string;
      label: string;
      commands: PackageManagerCommands;
      hint?: string;
      icon?: React.ReactNode;
    }
  | {
      kind: "manual";
      id: string;
      label: string;
      manual: ManualInstall;
      hint?: string;
      icon?: React.ReactNode;
    };

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

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      {/* Outer: install-form tabs */}
      <div role="tablist" className="flex flex-wrap border-b border-border bg-background/40 p-1.5">
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

      <div className="space-y-4 p-4">
        {/* Package-manager strip is shared across both variants. */}
        <PackageManagerStrip pm={pm} onChange={setPm} />

        {current.kind === "manual" ? (
          <ManualSteps manual={current.manual} pm={pm} />
        ) : (
          <SingleCommand command={current.commands[pm]} />
        )}

        {current.hint ? (
          <p className="px-1 text-xs text-muted-foreground">{current.hint}</p>
        ) : null}
      </div>
    </div>
  );
}

function PackageManagerStrip({
  pm,
  onChange,
}: {
  pm: PackageManager;
  onChange: (pm: PackageManager) => void;
}) {
  return (
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
            onClick={() => onChange(id)}
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
  );
}

function SingleCommand({ command }: { command: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-background px-3 py-2">
      <code className="truncate font-mono text-sm text-foreground">{command}</code>
      <CopyButton value={command} />
    </div>
  );
}

function ManualSteps({ manual, pm }: { manual: ManualInstall; pm: PackageManager }) {
  const depsCommand =
    manual.dependencies.length === 0
      ? null
      : combinedDepsCommand(manual.dependencies, pm);

  let stepIndex = 0;
  const nextStep = () => ++stepIndex;

  return (
    <ol className="space-y-5">
      {depsCommand ? (
        <ManualStep n={nextStep()} title="Install dependencies">
          <SingleCommand command={depsCommand} />
        </ManualStep>
      ) : null}

      {manual.registryDependencies.map((file) => (
        <ManualStep
          key={file.targetPath}
          n={nextStep()}
          title={`Add ${file.targetPath}`}
        >
          <CodeBlock code={file.code} />
        </ManualStep>
      ))}

      <ManualStep
        n={nextStep()}
        title={`Add ${manual.source.targetPath}`}
      >
        <CodeBlock code={manual.source.code} />
      </ManualStep>
    </ol>
  );
}

function ManualStep({
  n,
  title,
  children,
}: {
  n: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <li className="space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-[11px] font-semibold text-secondary-foreground">
          {n}
        </span>
        {title}
      </div>
      {children}
    </li>
  );
}

function combinedDepsCommand(
  deps: ManualInstall["dependencies"],
  pm: PackageManager
): string {
  // Show one PM invocation listing all packages — same UX as the official
  // shadcn docs ("npm i pkg1 pkg2 pkg3").
  const names = deps.map((d) => d.name);
  switch (pm) {
    case "pnpm":
      return `pnpm add ${names.join(" ")}`;
    case "yarn":
      return `yarn add ${names.join(" ")}`;
    case "bun":
      return `bun add ${names.join(" ")}`;
    case "npm":
    default:
      return `npm install ${names.join(" ")}`;
  }
}

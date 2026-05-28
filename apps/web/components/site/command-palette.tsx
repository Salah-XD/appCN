"use client";

import { useRouter } from "next/navigation";
import { FileText, Search, Sparkles, Square, Terminal } from "lucide-react";
import * as React from "react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { components } from "@/lib/registry";
import { useHotkey } from "@/lib/use-hotkey";
import { useIsClient } from "@/lib/use-is-client";

type DocEntry = {
  href: string;
  title: string;
  group: string;
  keywords?: string[];
};

const DOC_ENTRIES: DocEntry[] = [
  { href: "/", title: "Home", group: "Pages" },
  { href: "/components", title: "All components", group: "Pages" },
  {
    href: "/docs/cli",
    title: "CLI — init & add",
    group: "Docs",
    keywords: ["install", "setup", "nativewind"],
  },
];

/** Trigger button rendered in the navbar — also opens via Cmd+K from anywhere. */
export function CommandPaletteTrigger() {
  const [open, setOpen] = React.useState(false);
  const mounted = useIsClient();
  const router = useRouter();

  useHotkey("mod+k", () => setOpen((o) => !o));

  const go = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Search components and docs"
        className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-background/60 px-3 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground sm:w-64 sm:justify-between"
      >
        <span className="inline-flex items-center gap-2">
          <Search className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Search docs…</span>
        </span>
        {/* Render the kbd hint only after mount so the SSR markup is stable. */}
        {mounted ? (
          <kbd className="hidden items-center gap-1 rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground sm:inline-flex">
            <span className="text-xs">{isMac() ? "⌘" : "Ctrl"}</span>K
          </kbd>
        ) : null}
      </button>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Search"
        description="Find components and documentation."
      >
        <CommandInput placeholder="Search components and docs…" />
        <CommandList>
          <CommandEmpty>No results.</CommandEmpty>

          <CommandGroup heading="Docs">
            {DOC_ENTRIES.map((d) => (
              <CommandItem
                key={d.href}
                value={`${d.title} ${d.keywords?.join(" ") ?? ""}`}
                onSelect={() => go(d.href)}
              >
                {iconForDoc(d.href)}
                <span>{d.title}</span>
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandGroup heading="Base components">
            {components
              .filter((c) => c.category === "base")
              .map((c) => (
                <CommandItem
                  key={c.slug}
                  value={`${c.title} ${c.slug} ${c.description}`}
                  onSelect={() => go(`/components/${c.slug}`)}
                >
                  <Square className="h-4 w-4" />
                  <span>{c.title}</span>
                  <span className="ml-auto truncate text-xs text-muted-foreground">
                    {c.description}
                  </span>
                </CommandItem>
              ))}
          </CommandGroup>

          <CommandGroup heading="AI-native">
            {components
              .filter((c) => c.category === "ai")
              .map((c) => (
                <CommandItem
                  key={c.slug}
                  value={`${c.title} ${c.slug} ${c.description}`}
                  onSelect={() => go(`/components/${c.slug}`)}
                >
                  <Sparkles className="h-4 w-4" />
                  <span>{c.title}</span>
                  <span className="ml-auto truncate text-xs text-muted-foreground">
                    {c.description}
                  </span>
                </CommandItem>
              ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}

function isMac(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Mac|iPhone|iPad|iPod/i.test(navigator.platform);
}

function iconForDoc(href: string) {
  if (href.startsWith("/docs/cli")) return <Terminal className="h-4 w-4" />;
  return <FileText className="h-4 w-4" />;
}

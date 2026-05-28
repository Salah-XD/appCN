"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export type TocItem = { id: string; label: string };

/**
 * "On this page" rail. Renders a sticky aside on `xl+` screens, hidden below.
 * Highlights the currently-visible section via IntersectionObserver. Anchor
 * clicks navigate to `#id` — Lenis (when active) smooth-scrolls them.
 */
export function TableOfContents({ items }: { items: TocItem[] }) {
  const [activeId, setActiveId] = React.useState<string | null>(
    items[0]?.id ?? null
  );

  React.useEffect(() => {
    if (items.length === 0) return;

    const elements = items
      .map((i) => document.getElementById(i.id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Pick the *first* intersecting section (top-down). If none are
        // intersecting (between sections), keep the last active.
        const intersecting = entries
          .filter((e) => e.isIntersecting)
          .sort(
            (a, b) =>
              (a.target as HTMLElement).offsetTop -
              (b.target as HTMLElement).offsetTop
          );
        if (intersecting[0]) {
          setActiveId(intersecting[0].target.id);
        }
      },
      {
        // Trigger when a section enters the top quarter of the viewport.
        rootMargin: "-20% 0px -65% 0px",
        threshold: 0,
      }
    );

    for (const el of elements) observer.observe(el);
    return () => observer.disconnect();
  }, [items]);

  if (items.length === 0) return null;

  return (
    <aside className="hidden xl:sticky xl:top-20 xl:block xl:h-[calc(100vh-5rem)] xl:w-56 xl:shrink-0 xl:pl-10">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        On this page
      </p>
      <ul className="space-y-1.5 text-sm">
        {items.map((item) => {
          const isActive = item.id === activeId;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className={cn(
                  "block border-l-2 py-0.5 pl-3 transition-colors",
                  isActive
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                {item.label}
              </a>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}

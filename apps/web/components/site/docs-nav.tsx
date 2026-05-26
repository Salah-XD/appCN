"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import type { ComponentEntry } from "@/lib/registry";

/**
 * Left sidebar nav for /components/*. Layouts in Next 16 are cached and do not
 * re-render on navigation, so active-state must live in a client component
 * reading `usePathname()` — see next/dist/docs/.../layout.md "Active Nav Links".
 */
export function DocsNav({ components }: { components: ComponentEntry[] }) {
  const pathname = usePathname();

  const base = components.filter((c) => c.category === "base");
  const ai = components.filter((c) => c.category === "ai");

  return (
    <nav aria-label="Components" className="space-y-8">
      <NavSection
        title="Base"
        items={base}
        pathname={pathname}
        accent={false}
      />
      <NavSection title="AI-native" items={ai} pathname={pathname} accent />
    </nav>
  );
}

function NavSection({
  title,
  items,
  pathname,
  accent,
}: {
  title: string;
  items: ComponentEntry[];
  pathname: string | null;
  accent: boolean;
}) {
  if (items.length === 0) return null;

  return (
    <div>
      <h3
        className={
          "px-2 text-[11px] font-semibold uppercase tracking-wider " +
          (accent ? "text-primary" : "text-muted-foreground")
        }
      >
        {title}
      </h3>
      <ul className="mt-2 space-y-0.5">
        {items.map((c) => {
          const href = `/components/${c.slug}`;
          const isActive = pathname === href;
          return (
            <li key={c.slug}>
              <Link
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={
                  "block rounded-lg px-2 py-1.5 text-sm transition-colors " +
                  (isActive
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground")
                }
              >
                {c.title}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

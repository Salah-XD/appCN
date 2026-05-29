"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plug,
  Smartphone,
  Sparkles,
  Square,
  Terminal,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ComponentBadge } from "@/lib/badges";

const STORAGE_KEY = "appcn:sidebar:collapsed";

function subscribeStorage(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", cb);
  return () => window.removeEventListener("storage", cb);
}

function getCollapsedSnapshot(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function getCollapsedServerSnapshot(): boolean {
  return false;
}

export type SidebarIconName =
  | "terminal"
  | "square"
  | "sparkles"
  | "smartphone"
  | "plug";

const ICON_MAP: Record<SidebarIconName, LucideIcon> = {
  terminal: Terminal,
  square: Square,
  sparkles: Sparkles,
  smartphone: Smartphone,
  plug: Plug,
};

export type SidebarLink = {
  href: string;
  label: string;
  /**
   * Lucide icon name — resolved to a component inside this client module.
   * Stored as a string so the data can cross the RSC server/client boundary.
   */
  iconName?: SidebarIconName;
  badge?: ComponentBadge;
};

export type SidebarGroup = {
  title: string;
  links: SidebarLink[];
};

/**
 * Left sidebar for every docs route. Collapsible (icon-only on toggle), state
 * persists across reloads via localStorage. Sticky under the site header.
 *
 * `mobile` mode is rendered inside the `SiteHeader` sheet — always expanded,
 * no collapse toggle, no sticky positioning (the sheet handles scrolling).
 */
export function DocsSidebar({
  groups,
  mobile = false,
}: {
  groups: SidebarGroup[];
  mobile?: boolean;
}) {
  // `useSyncExternalStore` is the idiomatic React 19 read for a value that
  // lives outside React (localStorage) — server snapshot is `false`, client
  // snapshot reads the actual stored flag. The pre-paint script in
  // (docs)/layout.tsx sets a `data-sidebar` attribute before hydration so the
  // first paint width matches the stored state without flash.
  const collapsed = React.useSyncExternalStore(
    subscribeStorage,
    getCollapsedSnapshot,
    getCollapsedServerSnapshot
  );

  const toggle = () => {
    const next = !collapsed;
    try {
      window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      document.documentElement.setAttribute(
        "data-sidebar",
        next ? "collapsed" : "expanded"
      );
      // Notify the same-window store subscribers; the `storage` event only
      // fires across windows, not within the same document.
      window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEY }));
    } catch {
      // ignore
    }
  };

  if (mobile) {
    return (
      <nav aria-label="Docs" className="px-1 py-2">
        {groups.map((group) => (
          <SidebarSection key={group.title} group={group} collapsed={false} />
        ))}
      </nav>
    );
  }

  return (
    <aside
      data-collapsed={collapsed ? "true" : "false"}
      className={cn(
        "hidden shrink-0 border-r border-border lg:block",
        "transition-[width] duration-200 ease-out",
        collapsed ? "w-14" : "w-60"
      )}
    >
      <div className="sticky top-16 flex h-[calc(100vh-4rem)] flex-col">
        <div className="flex items-center justify-end px-2 py-3">
          <button
            type="button"
            onClick={toggle}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>

        <ScrollArea className="flex-1 px-2 pb-6">
          <nav aria-label="Docs">
            {groups.map((group) => (
              <SidebarSection
                key={group.title}
                group={group}
                collapsed={collapsed}
              />
            ))}
          </nav>
        </ScrollArea>
      </div>
    </aside>
  );
}

function SidebarSection({
  group,
  collapsed,
}: {
  group: SidebarGroup;
  collapsed: boolean;
}) {
  return (
    <div className="mb-6 last:mb-0">
      {!collapsed && (
        <h3 className="mb-1 px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {group.title}
        </h3>
      )}
      <ul className="space-y-0.5">
        {group.links.map((link) => (
          <li key={link.href}>
            <SidebarLinkItem link={link} collapsed={collapsed} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function SidebarLinkItem({
  link,
  collapsed,
}: {
  link: SidebarLink;
  collapsed: boolean;
}) {
  const pathname = usePathname();
  const isActive = pathname === link.href;
  const Icon = link.iconName ? ICON_MAP[link.iconName] : undefined;

  const inner = (
    <Link
      href={link.href}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
        collapsed ? "justify-center" : "justify-start",
        isActive
          ? "bg-accent text-foreground"
          : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
      )}
    >
      {Icon ? <Icon className="h-4 w-4 shrink-0" /> : null}
      {!collapsed && (
        <>
          <span className="flex-1 truncate">{link.label}</span>
          {link.badge ? <SidebarBadge badge={link.badge} /> : null}
        </>
      )}
    </Link>
  );

  if (!collapsed) return inner;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{inner}</TooltipTrigger>
      <TooltipContent side="right" sideOffset={8}>
        <div className="flex items-center gap-2">
          <span>{link.label}</span>
          {link.badge ? <SidebarBadge badge={link.badge} /> : null}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

function SidebarBadge({ badge }: { badge: ComponentBadge }) {
  return (
    <Badge
      variant={badge === "new" ? "default" : "secondary"}
      className={cn(
        "h-4 shrink-0 px-1.5 text-[9px] font-semibold uppercase tracking-wider",
        badge === "new" && "bg-primary/15 text-primary hover:bg-primary/20"
      )}
    >
      {badge}
    </Badge>
  );
}

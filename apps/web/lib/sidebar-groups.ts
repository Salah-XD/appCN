import { components, type ComponentEntry } from "@/lib/registry";
import { getBadge } from "@/lib/badges";
import type {
  SidebarGroup,
  SidebarIconName,
  SidebarLink,
} from "@/components/site/docs-sidebar";

const COMPONENT_ICONS: Partial<Record<ComponentEntry["category"], SidebarIconName>> = {
  base: "square",
  ai: "sparkles",
};

function toSidebarLink(entry: ComponentEntry): SidebarLink {
  return {
    href: `/components/${entry.slug}`,
    label: entry.title,
    iconName: COMPONENT_ICONS[entry.category],
    badge: getBadge(entry.meta) ?? undefined,
  };
}

/**
 * Source of truth for the docs sidebar groups. Imported by both the desktop
 * sidebar (rendered by `(docs)/layout.tsx`) and the mobile sheet (rendered by
 * `SiteHeader`).
 */
export function getSidebarGroups(): SidebarGroup[] {
  return [
    {
      title: "Getting Started",
      links: [{ href: "/docs/cli", label: "CLI", iconName: "terminal" }],
    },
    {
      title: "Base",
      links: components
        .filter((c) => c.category === "base")
        .map(toSidebarLink),
    },
    {
      title: "AI-native",
      links: components
        .filter((c) => c.category === "ai")
        .map(toSidebarLink),
    },
  ];
}

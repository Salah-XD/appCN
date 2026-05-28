import Link from "next/link";

import { siteConfig } from "@/lib/config";
import { LogoWordmark } from "@/components/brand/logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-background">
      <div className="mx-auto max-w-7xl px-5 py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="inline-flex items-center gap-2">
              <LogoWordmark size="default" />
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Copy-paste mobile components for React Native. Motion-first, dark
              by default, AI-native flagship.
            </p>
          </div>

          <FooterColumn
            title="Docs"
            links={[
              { label: "Components", href: "/components" },
              { label: "AI collection", href: "/components/stream-bubble" },
              { label: "Design philosophy", href: "/components" },
            ]}
          />

          <FooterColumn
            title="Distribution"
            links={[
              {
                label: "shadcn CLI",
                href: `${siteConfig.registryBaseUrl}/button.json`,
                external: true,
              },
              {
                label: "npm",
                href: "https://www.npmjs.com/package/@app-cn/ui",
                external: true,
              },
              { label: "Expo Go preview", href: "/docs/mobile-app" },
              { label: "Releases", href: `${siteConfig.github}/releases`, external: true },
            ]}
          />

          <FooterColumn
            title="Project"
            links={[
              { label: "GitHub", href: siteConfig.github, external: true },
              { label: "Issues", href: `${siteConfig.github}/issues`, external: true },
              { label: "License (MIT)", href: `${siteConfig.github}/blob/main/LICENSE`, external: true },
            ]}
          />
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-3 border-t border-border/60 pt-8 text-sm text-muted-foreground sm:flex-row sm:items-center">
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span>© {new Date().getFullYear()} appCN — you own the code.</span>
            <span className="hidden sm:inline" aria-hidden>
              ·
            </span>
            <span>
              Powered by{" "}
              <a
                href="https://www.shineup.digital"
                target="_blank"
                rel="noreferrer"
                className="font-medium text-foreground/90 underline-offset-4 transition-colors hover:text-foreground hover:underline"
              >
                Shineup
              </a>
            </span>
          </p>
          <p className="font-mono text-xs uppercase tracking-wider">
            Built with Expo · NativeWind · Reanimated
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string; external?: boolean }[];
}) {
  return (
    <div>
      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h4>
      <ul className="mt-3 space-y-2 text-sm">
        {links.map((l) => (
          <li key={l.label}>
            {l.external ? (
              <a
                href={l.href}
                target="_blank"
                rel="noreferrer"
                className="text-foreground/80 transition-colors hover:text-foreground"
              >
                {l.label}
              </a>
            ) : (
              <Link
                href={l.href}
                className="text-foreground/80 transition-colors hover:text-foreground"
              >
                {l.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

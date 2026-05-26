"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";
import { LogoWordmark } from "@/components/brand/logo";

const NAV = [
  { href: "/components", label: "Components" },
  { href: "/components/stream-bubble", label: "AI", match: "/components/" },
  { href: "https://github.com/your-org/appcn", label: "GitHub", external: true },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-border/60 bg-background/80 backdrop-blur-xl"
          : "border-b border-transparent bg-background/30 backdrop-blur"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5">
        <Link
          href="/"
          className="group inline-flex items-center gap-2 transition-opacity hover:opacity-80"
          aria-label="appCN home"
        >
          <LogoWordmark size="default" className="text-foreground" />
          <span className="hidden rounded-full border border-border/60 bg-card/40 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground sm:inline-block">
            v0.1
          </span>
        </Link>

        <nav className="flex items-center gap-1 text-sm">
          {NAV.map((item) => {
            const active = item.match
              ? pathname.startsWith(item.match)
              : pathname === item.href;
            if (item.external) {
              return (
                <a
                  key={item.href}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full px-3.5 py-1.5 text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
                >
                  {item.label}
                </a>
              );
            }
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-full px-3.5 py-1.5 transition-colors",
                  active
                    ? "bg-card text-foreground"
                    : "text-muted-foreground hover:bg-card hover:text-foreground"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

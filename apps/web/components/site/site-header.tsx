"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Github, Menu } from "lucide-react";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";
import { LogoWordmark } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { CommandPaletteTrigger } from "@/components/site/command-palette";
import { DocsSidebar } from "@/components/site/docs-sidebar";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { getSidebarGroups } from "@/lib/sidebar-groups";

export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Show the docs hamburger on `(docs)` group routes only.
  const onDocs =
    pathname === "/components" ||
    pathname.startsWith("/components/") ||
    pathname.startsWith("/docs/");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile sheet whenever the route changes. This is an
  // intentional sync-to-route side effect; the alternative (intercepting
  // every Link click inside DocsSidebar) leaks navigation concerns into the
  // sidebar component.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMobileOpen(false);
  }, [pathname]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-border/60 bg-background/80 backdrop-blur-xl"
          : "border-b border-transparent bg-background/30 backdrop-blur"
      )}
    >
      <div className="mx-auto flex h-16 max-w-screen-2xl items-center gap-2 px-4 lg:px-6">
        {onDocs ? (
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Open navigation"
                className="lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-72 border-r border-border bg-background p-0"
            >
              <SheetTitle className="sr-only">Docs navigation</SheetTitle>
              <SheetDescription className="sr-only">
                Browse the appCN component library and documentation.
              </SheetDescription>
              <div className="flex h-16 items-center border-b border-border px-4">
                <LogoWordmark size="sm" />
              </div>
              <div className="p-2">
                <DocsSidebar groups={getSidebarGroups()} mobile />
              </div>
            </SheetContent>
          </Sheet>
        ) : null}

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

        <div className="flex-1" />

        <CommandPaletteTrigger />
        <ThemeToggle />
        <Button
          asChild
          variant="ghost"
          size="icon"
          aria-label="appCN on GitHub"
          className="h-9 w-9"
        >
          <a
            href="https://github.com/Salah-XD/appCN"
            target="_blank"
            rel="noreferrer"
          >
            <Github className="h-4 w-4" />
          </a>
        </Button>
      </div>
    </header>
  );
}

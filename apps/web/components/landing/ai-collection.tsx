import Link from "next/link";

import { components } from "@/lib/registry";
import { siteConfig } from "@/lib/config";
import { Reveal } from "./reveal";
import { cn } from "@/lib/utils";

/**
 * AI Collection — portrait card grid showcasing the AI-native flagship.
 * Each card holds a phone-aspect iframe live preview.
 */
export function AICollection() {
  const ai = components.filter((c) => c.category === "ai");

  return (
    <section className="relative border-y border-border/40 bg-background py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-5">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <Reveal className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
              <span className="h-1 w-1 rounded-full bg-primary" />
              Featured collection
            </span>
            <h2 className="mt-4 font-sans text-[clamp(1.75rem,4vw,2.75rem)] font-bold leading-[1.05] tracking-[-0.02em]">
              AI-native,{" "}
              <span className="font-serif italic font-normal text-primary">
                on mobile.
              </span>
            </h2>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-muted-foreground">
              Streaming bubbles, thinking traces, prompt composers, voice
              visualizers — the four AI components nobody else ships well.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <Link
              href="/components"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card/40 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-card"
            >
              See all
              <ArrowRight />
            </Link>
          </Reveal>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {ai.map((c, i) => (
            <Reveal key={c.slug} delay={i * 0.06}>
              <AICard component={c} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function AICard({ component }: { component: (typeof components)[number] }) {
  return (
    <Link
      href={`/components/${component.slug}`}
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-card/40 transition-all",
        "hover:border-primary/40 hover:bg-card/70"
      )}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(360px circle at 50% 0%, hsl(var(--primary) / 0.14), transparent 60%)",
        }}
      />

      {/* Portrait phone-aspect iframe (9:19 — true phone ratio). */}
      <div className="relative aspect-[9/19] overflow-hidden bg-background">
        <AIBadge />
        <iframe
          src={`${siteConfig.showcaseWebUrl}/c/${component.slug}`}
          title={`${component.title} live preview`}
          loading="lazy"
          className="h-full w-full border-0 transition-transform duration-700 group-hover:scale-[1.02]"
        />
      </div>

      <div className="relative flex flex-1 items-start justify-between gap-3 border-t border-border/40 p-5">
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold tracking-tight text-foreground">
            {component.title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {component.meta.delight}
          </p>
        </div>
        <span className="mt-0.5 shrink-0 rounded-full border border-border bg-background/60 p-1.5 text-foreground/80 transition-all group-hover:border-primary/40 group-hover:bg-primary/10 group-hover:text-primary">
          <Arrow />
        </span>
      </div>
    </Link>
  );
}

/**
 * AI badge — a small gradient pill that sits over the iframe top-left.
 * Reads clearly without competing with the live preview.
 */
function AIBadge() {
  return (
    <span className="absolute left-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-background/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-foreground/90 backdrop-blur">
      <span
        aria-hidden
        className="h-1 w-1 rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary))]"
      />
      AI
    </span>
  );
}

function Arrow() {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
      <path
        d="M3 11L11 3M11 3H4.5M11 3V9.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path
        d="M3 7h8m0 0L7.5 3.5M11 7l-3.5 3.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

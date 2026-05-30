import Link from "next/link";
import { components } from "@/lib/registry";
import { Reveal } from "./reveal";
import { cn } from "@/lib/utils";

export function CatalogGrid() {
  return (
    <section className="border-b border-border/40 bg-background py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-5">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <Reveal className="max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              The catalog
            </span>
            <h2 className="mt-4 font-sans text-[clamp(2rem,5vw,3.6rem)] font-bold leading-[1.05] tracking-[-0.02em]">
              Every{" "}
              <span className="font-serif italic font-normal">component.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <Link
              href="/components"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card/40 px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-card"
            >
              Open catalog
              <ArrowRight />
            </Link>
          </Reveal>
        </div>

        <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {components.map((c, i) => (
            <Reveal key={c.slug} delay={(i % 3) * 0.06}>
              <Link
                href={`/components/${c.slug}`}
                className={cn(
                  "group relative block h-full overflow-hidden rounded-2xl border border-border/60 bg-card/40 p-6 transition-all",
                  "hover:border-primary/40 hover:bg-card/70"
                )}
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  style={{
                    background:
                      "radial-gradient(360px circle at 50% 0%, hsl(var(--primary) / 0.10), transparent 60%)",
                  }}
                />
                <div className="relative">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold tracking-tight text-foreground">
                      {c.title}
                    </h3>
                    <CategoryBadge category={c.category} kind={c.meta.kind} />
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {c.description}
                  </p>
                  <p className="mt-4 inline-flex items-center gap-2 border-t border-border/50 pt-3 text-xs italic text-primary/80">
                    <span className="h-px w-3 bg-primary/40" />
                    {c.meta.delight}
                  </p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function CategoryBadge({ category, kind }: { category: "base" | "ai"; kind?: "primitive" | "block" }) {
  if (kind === "block") {
    return (
      <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
        Block
      </span>
    );
  }
  if (category === "ai") {
    return (
      <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
        AI
      </span>
    );
  }
  return (
    <span className="rounded-full border border-border bg-secondary/40 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-secondary-foreground">
      Base
    </span>
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

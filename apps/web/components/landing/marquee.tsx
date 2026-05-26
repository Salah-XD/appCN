import { components } from "@/lib/registry";

/**
 * Marquee — endless scrolling strip of component names + delight lines.
 * Two rows running opposite directions. Server-rendered, CSS-driven.
 */
export function Marquee() {
  const items = components;
  // Duplicate for seamless loop.
  const row = [...items, ...items];

  return (
    <section
      aria-hidden
      className="relative border-y border-border/40 bg-background/40 py-6"
    >
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-32 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-32 bg-gradient-to-l from-background to-transparent" />

        <div className="flex w-max animate-marquee-x gap-12 py-2">
          {row.map((c, i) => (
            <div
              key={`a-${c.slug}-${i}`}
              className="flex items-center gap-3 whitespace-nowrap text-2xl tracking-tight"
            >
              <span className="font-serif italic text-foreground/80">
                {c.title}
              </span>
              <Dot />
              <span className="text-sm text-muted-foreground">
                {c.meta.delight}
              </span>
              <Dot />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Dot() {
  return (
    <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary/60" />
  );
}

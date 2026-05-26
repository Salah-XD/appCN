import { Reveal } from "./reveal";

const REASONS = [
  {
    title: "Real-phone previews.",
    body: "Every component runs live on your physical device through Expo Go. No emulator, no setup, real native gestures.",
    glyph: "qr",
  },
  {
    title: "AI-native flagship.",
    body: "Streaming bubbles, reasoning traces, voice waveforms, prompt composers. The collection nobody else ships well — yet.",
    glyph: "stream",
  },
  {
    title: "Dual distribution.",
    body: "Copy the source with the shadcn CLI for ownership, or install the whole library from npm for ergonomics. Same primitives, your choice.",
    glyph: "dual",
  },
  {
    title: "Motion-first defaults.",
    body: "Reanimated + gesture handler, shared motion tokens, and one delight detail per component. Premium feel, on by default.",
    glyph: "spring",
  },
] as const;

export function WhyAppCN() {
  return (
    <section className="border-b border-border/40 bg-background py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-5">
        <Reveal className="max-w-2xl">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Why appCN
          </span>
          <h2 className="mt-4 font-sans text-[clamp(2rem,5vw,3.6rem)] font-bold leading-[1.05] tracking-[-0.02em]">
            Built for{" "}
            <span className="font-serif italic font-normal text-muted-foreground">
              the way mobile actually feels.
            </span>
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-4 sm:grid-cols-2">
          {REASONS.map((r, i) => (
            <Reveal key={r.title} delay={i * 0.06}>
              <article className="group relative h-full overflow-hidden rounded-3xl border border-border/60 bg-card/40 p-8 transition-colors hover:border-primary/40">
                <span
                  aria-hidden
                  className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  style={{
                    background:
                      "radial-gradient(500px circle at 30% 0%, hsl(var(--primary) / 0.10), transparent 60%)",
                  }}
                />
                <div className="relative flex items-start gap-5">
                  <ReasonGlyph kind={r.glyph} />
                  <div>
                    <h3 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                      {r.title}
                    </h3>
                    <p className="mt-2 text-base leading-relaxed text-muted-foreground">
                      {r.body}
                    </p>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function ReasonGlyph({
  kind,
}: {
  kind: "qr" | "stream" | "dual" | "spring";
}) {
  return (
    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-border bg-background/60 text-primary">
      {kind === "qr" ? (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <rect
            x="2"
            y="2"
            width="7"
            height="7"
            rx="1.5"
            stroke="currentColor"
            strokeWidth="1.4"
          />
          <rect
            x="13"
            y="2"
            width="7"
            height="7"
            rx="1.5"
            stroke="currentColor"
            strokeWidth="1.4"
          />
          <rect
            x="2"
            y="13"
            width="7"
            height="7"
            rx="1.5"
            stroke="currentColor"
            strokeWidth="1.4"
          />
          <rect x="14" y="14" width="2" height="2" rx="0.5" fill="currentColor" />
          <rect x="17" y="14" width="2" height="2" rx="0.5" fill="currentColor" />
          <rect x="14" y="17" width="5" height="2" rx="0.5" fill="currentColor" />
        </svg>
      ) : null}
      {kind === "stream" ? (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <path
            d="M3 7c4 0 4-3 8-3s4 3 8 3"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
          <path
            d="M3 12c4 0 4-3 8-3s4 3 8 3"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            opacity="0.7"
          />
          <path
            d="M3 17c4 0 4-3 8-3s4 3 8 3"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            opacity="0.4"
          />
        </svg>
      ) : null}
      {kind === "dual" ? (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <rect
            x="2.5"
            y="6"
            width="9"
            height="10"
            rx="1.5"
            stroke="currentColor"
            strokeWidth="1.4"
          />
          <rect
            x="10.5"
            y="6"
            width="9"
            height="10"
            rx="1.5"
            stroke="currentColor"
            strokeWidth="1.4"
            opacity="0.6"
          />
        </svg>
      ) : null}
      {kind === "spring" ? (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <path
            d="M3 18C7 18 7 4 11 4S15 18 19 18"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
          <circle cx="19" cy="18" r="1.6" fill="currentColor" />
        </svg>
      ) : null}
    </div>
  );
}

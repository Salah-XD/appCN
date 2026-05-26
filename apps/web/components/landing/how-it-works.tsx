"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

const STEPS = [
  {
    n: "01",
    title: "Find what you need",
    body: "Browse a focused catalog. Base primitives, the AI-native collection. Live preview every one in the browser or on your phone.",
    accent: "from-primary via-violet-400 to-fuchsia-400",
  },
  {
    n: "02",
    title: "Preview on your phone",
    body: "Scan a QR with Expo Go and the component runs live with real native gestures. No emulator, no setup. Same code path as your prod app.",
    accent: "from-sky-400 via-primary to-fuchsia-400",
  },
  {
    n: "03",
    title: "Install your way",
    body: "Copy-paste with the shadcn CLI for ownership. Or pull the whole library from npm. Same primitives, your call.",
    accent: "from-emerald-400 via-primary to-violet-400",
  },
];

export function HowItWorks() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!root.current) return;
      const panels = root.current.querySelectorAll<HTMLDivElement>(".panel");
      panels.forEach((panel, i) => {
        gsap.from(panel.querySelector(".panel-content"), {
          y: 60,
          opacity: 0,
          duration: 1,
          ease: "expo.out",
          scrollTrigger: {
            trigger: panel,
            start: "top 70%",
            end: "center center",
            scrub: false,
            once: true,
          },
        });

        // Index badge — rotate slightly as panel approaches center.
        gsap.fromTo(
          panel.querySelector(".panel-numeral"),
          { rotate: -5 },
          {
            rotate: 0,
            scrollTrigger: {
              trigger: panel,
              start: "top 80%",
              end: "top 20%",
              scrub: 1,
            },
          }
        );
      });
    },
    { scope: root }
  );

  return (
    <section
      id="how"
      ref={root}
      className="relative border-b border-border/40 bg-background"
    >
      <div className="mx-auto max-w-7xl px-5 pt-24 sm:pt-32">
        <div className="max-w-2xl">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            How it works
          </span>
          <h2 className="mt-4 font-sans text-[clamp(2rem,5vw,3.6rem)] font-bold leading-[1.05] tracking-[-0.02em]">
            From catalog to your app{" "}
            <span className="font-serif italic font-normal text-muted-foreground">
              in three steps.
            </span>
          </h2>
        </div>

        <div className="mt-16 grid gap-3 lg:gap-4">
          {STEPS.map((step, i) => (
            <div
              key={step.n}
              className={cn(
                "panel relative overflow-hidden rounded-3xl border border-border/60 bg-card/40 px-6 py-12 sm:px-12 sm:py-16",
                "transition-colors hover:border-primary/40 hover:bg-card/60"
              )}
            >
              {/* Gradient stripe */}
              <span
                aria-hidden
                className={cn(
                  "absolute inset-x-0 top-0 h-px bg-gradient-to-r",
                  step.accent
                )}
              />
              <div className="panel-content grid items-start gap-8 lg:grid-cols-[auto_1fr_auto] lg:gap-14">
                <span
                  className={cn(
                    "panel-numeral inline-block bg-gradient-to-br bg-clip-text font-serif text-7xl italic leading-none text-transparent lg:text-[9rem]",
                    step.accent
                  )}
                >
                  {step.n}
                </span>
                <div className="lg:pt-2">
                  <h3 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                    {step.title}
                  </h3>
                  <p className="mt-3 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                    {step.body}
                  </p>
                </div>
                <div className="hidden self-end text-right text-xs text-muted-foreground lg:block">
                  step {i + 1} / {STEPS.length}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="h-24" />
    </section>
  );
}

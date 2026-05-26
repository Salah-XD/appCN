"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type Stat = {
  value: number;
  suffix?: string;
  label: string;
  prefix?: string;
};

const STATS: Stat[] = [
  { value: 5, label: "Components shipped" },
  { value: 0, label: "Lock-in", suffix: "%" },
  { value: 100, label: "Open source", suffix: "% MIT" },
  { value: 2, label: "Distribution channels" },
];

/** Counters that ease from 0 → value as you scroll the section into view. */
export function KineticNumbers() {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!ref.current) return;
      const els = ref.current.querySelectorAll<HTMLSpanElement>(".count");
      els.forEach((el) => {
        const target = Number(el.dataset.value ?? "0");
        const obj = { v: 0 };
        gsap.to(obj, {
          v: target,
          duration: 1.8,
          ease: "expo.out",
          scrollTrigger: { trigger: el, start: "top 85%", once: true },
          onUpdate: () => {
            el.textContent = Math.round(obj.v).toString();
          },
        });
      });
    },
    { scope: ref }
  );

  return (
    <section className="border-b border-border/40 bg-background py-20">
      <div
        ref={ref}
        className="mx-auto grid max-w-7xl grid-cols-2 gap-px overflow-hidden rounded-3xl border border-border/40 bg-border/40 px-5 sm:grid-cols-4 sm:px-0"
      >
        {STATS.map((s) => (
          <div
            key={s.label}
            className="flex flex-col items-start gap-2 bg-background p-8 sm:p-10"
          >
            <p className="font-sans text-[clamp(2.6rem,5vw,4.4rem)] font-bold leading-none tracking-tight text-foreground">
              {s.prefix}
              <span className="count" data-value={s.value}>
                0
              </span>
              {s.suffix ? (
                <span className="text-primary">{s.suffix}</span>
              ) : null}
            </p>
            <p className="text-sm text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

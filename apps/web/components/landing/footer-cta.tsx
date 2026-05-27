"use client";

import { useRef } from "react";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { LogoMark } from "@/components/brand/logo";

gsap.registerPlugin(ScrollTrigger);

/**
 * Closing CTA — giant kinetic wordmark that scales/reveals on scroll.
 * Sits above the site footer.
 */
export function FooterCTA() {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!ref.current) return;
      const word = ref.current.querySelector(".giga");
      if (!word) return;
      gsap.fromTo(
        word,
        { scale: 0.6, opacity: 0.4, letterSpacing: "-0.02em" },
        {
          scale: 1,
          opacity: 1,
          letterSpacing: "-0.05em",
          scrollTrigger: {
            trigger: ref.current,
            start: "top 80%",
            end: "bottom bottom",
            scrub: 1.2,
          },
        }
      );
      gsap.from(".cta-meta > *", {
        y: 20,
        opacity: 0,
        stagger: 0.08,
        duration: 0.9,
        ease: "expo.out",
        scrollTrigger: { trigger: ref.current, start: "top 70%", once: true },
      });
    },
    { scope: ref }
  );

  return (
    <section
      ref={ref}
      className="relative overflow-hidden border-b border-border/40 bg-background"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[700px] w-[1100px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/15 blur-[160px]"
      />
      <div className="relative mx-auto max-w-7xl px-5 py-32 lg:py-44">
        <div className="cta-meta mb-12 flex flex-wrap items-center justify-center gap-3 text-sm text-muted-foreground">
          <LogoMark className="h-4 w-4 text-primary" />
          <span>Ready when you are.</span>
        </div>

        <div className="cta-meta flex items-center justify-center">
          <h2 className="giga origin-center bg-gradient-to-b from-foreground via-foreground to-foreground/40 bg-clip-text text-center font-sans text-[clamp(4.5rem,18vw,15rem)] font-bold leading-[0.85] tracking-[-0.05em] text-transparent">
            build beautiful.
          </h2>
        </div>

        <div className="cta-meta mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/components"
            className="rounded-full bg-foreground px-8 py-3.5 text-sm font-semibold text-background transition-transform hover:scale-[1.03]"
          >
            Open the catalog
          </Link>
          <a
            href="https://github.com/Salah-XD/appCN"
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-border bg-card/40 px-8 py-3.5 text-sm font-semibold text-foreground/90 transition-colors hover:bg-card"
          >
            Star on GitHub
          </a>
        </div>
      </div>
    </section>
  );
}

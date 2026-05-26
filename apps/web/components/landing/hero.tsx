"use client";

import Link from "next/link";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";

import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/config";
import { InstallTabs } from "@/components/preview/install-tabs";
import { LivePreview } from "@/components/preview/live-preview";
import { MagneticButton } from "./magnetic";
import { LogoMark } from "@/components/brand/logo";
import {
  installCommand,
  namespacedInstallCommand,
  npmInstallCommand,
} from "@/lib/registry";

const heroSlug = "prompt-input";

export function Hero() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({
        defaults: { ease: "expo.out", duration: 1.15 },
      });

      tl.from(".hero-pill", { y: 16, opacity: 0, duration: 0.6 })
        .from(
          ".hero-line",
          {
            y: 60,
            opacity: 0,
            stagger: 0.08,
            duration: 1.05,
          },
          "-=0.3"
        )
        .from(".hero-sub", { y: 16, opacity: 0, duration: 0.8 }, "-=0.6")
        .from(".hero-cta", { y: 16, opacity: 0, duration: 0.6 }, "-=0.55")
        .from(".hero-install", { y: 16, opacity: 0, duration: 0.6 }, "-=0.45")
        .from(
          ".hero-phone",
          { y: 80, opacity: 0, scale: 0.92, duration: 1.2 },
          "-=1.2"
        );

      // Idle floating loop on the phone.
      gsap.to(".hero-phone", {
        y: -10,
        duration: 3.6,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        delay: 1.2,
      });

      // Subtle parallax on hero gradient blobs as user moves.
      const onMove = (e: MouseEvent) => {
        const x = (e.clientX / window.innerWidth - 0.5) * 30;
        const y = (e.clientY / window.innerHeight - 0.5) * 20;
        gsap.to(".hero-blob-a", { x, y, duration: 1.2, ease: "power2.out" });
        gsap.to(".hero-blob-b", {
          x: -x * 0.7,
          y: -y * 0.7,
          duration: 1.4,
          ease: "power2.out",
        });
      };
      window.addEventListener("mousemove", onMove);
      return () => window.removeEventListener("mousemove", onMove);
    },
    { scope: root }
  );

  return (
    <section
      ref={root}
      className="relative isolate overflow-hidden border-b border-border/40 pt-8 lg:pt-12"
    >
      {/* Background gradient blobs */}
      <div
        aria-hidden
        className="hero-blob-a pointer-events-none absolute left-1/2 top-[-30%] h-[680px] w-[1100px] -translate-x-1/2 rounded-full bg-primary/25 blur-[160px]"
      />
      <div
        aria-hidden
        className="hero-blob-b pointer-events-none absolute right-[-10%] top-[20%] h-[460px] w-[700px] rounded-full bg-fuchsia-500/15 blur-[140px]"
      />

      {/* Grain overlay for that print-feel texture */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.025] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
          backgroundSize: "200px 200px",
        }}
      />

      <div className="relative mx-auto grid max-w-7xl gap-12 px-5 pb-24 pt-20 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-16 lg:pb-32 lg:pt-28">
        <div>
          <div className="hero-pill inline-flex items-center gap-2 rounded-full border border-border/80 bg-card/70 px-3 py-1.5 text-xs backdrop-blur">
            <LogoMark className="h-3.5 w-3.5 text-primary" />
            <span className="text-muted-foreground">
              v0.1 early access · React Native + Expo
            </span>
          </div>

          <h1 className="mt-7 font-sans text-[clamp(2.6rem,7vw,5.4rem)] font-bold leading-[0.95] tracking-[-0.03em]">
            <span className="hero-line block">Mobile components</span>
            <span className="hero-line block">
              you actually{" "}
              <span className="relative inline-block font-serif italic">
                <span className="relative z-10 bg-gradient-to-r from-primary via-violet-300 to-fuchsia-300 bg-clip-text font-normal text-transparent">
                  own
                </span>
                {/* Underline brushstroke */}
                <span
                  aria-hidden
                  className="absolute -bottom-1 left-0 h-[6px] w-full rounded-full bg-primary/30 blur-[6px]"
                />
              </span>
              .
            </span>
          </h1>

          <p className="hero-sub mt-7 max-w-xl text-balance text-lg leading-relaxed text-muted-foreground">
            A shadcn-philosophy library for React Native — copy-paste ownership,
            motion-first defaults, and a featured AI-native collection. Preview
            everything live on your phone in seconds.
          </p>

          <div className="hero-cta mt-9 flex flex-wrap items-center gap-3">
            <MagneticButton
              href="/components"
              className="rounded-full bg-foreground px-6 py-3.5 text-sm font-semibold text-background shadow-lg shadow-foreground/10 transition-colors hover:bg-foreground/90"
            >
              <span className="inline-flex items-center gap-2">
                Browse components
                <ArrowRight />
              </span>
            </MagneticButton>
            <Link
              href="#how"
              className="rounded-full border border-border bg-card/40 px-6 py-3.5 text-sm font-semibold text-foreground/90 backdrop-blur transition-colors hover:bg-card"
            >
              How it works
            </Link>
          </div>

          <div className="hero-install mt-10 max-w-md">
            <InstallTabs
              options={[
                {
                  id: "shadcn",
                  label: "shadcn",
                  command: installCommand(heroSlug, siteConfig.registryBaseUrl),
                  hint: "Copies the source straight into your project. No lock-in.",
                },
                {
                  id: "ns",
                  label: "namespaced",
                  command: namespacedInstallCommand(heroSlug),
                  hint: 'Once `"@appcn"` is registered in your components.json.',
                },
                {
                  id: "npm",
                  label: "npm",
                  command: npmInstallCommand(),
                  hint: "Whole library, managed dep.",
                },
              ]}
            />
          </div>
        </div>

        <div className="hero-phone relative">
          <div
            aria-hidden
            className="absolute -inset-10 rounded-[3rem] bg-gradient-to-br from-primary/30 via-transparent to-fuchsia-500/20 blur-2xl"
          />
          <PhoneFrame>
            <LivePreview
              bare
              slug={heroSlug}
              showcaseWebUrl={siteConfig.showcaseWebUrl}
              title="appCN PromptInput running live"
            />
          </PhoneFrame>
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/70" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </span>
            Running live · same code path as your phone
          </div>
        </div>
      </div>
    </section>
  );
}

function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative mx-auto w-full max-w-[340px]">
      <div className="rounded-[2.5rem] border border-border/60 bg-card/60 p-2 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6)] backdrop-blur">
        <div className="overflow-hidden rounded-[2rem] border-[8px] border-zinc-900 bg-background">
          {children}
        </div>
      </div>
    </div>
  );
}

function ArrowRight() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      className="transition-transform group-hover:translate-x-0.5"
    >
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

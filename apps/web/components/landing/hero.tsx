"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";

import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/config";
import { LivePreview } from "@/components/preview/live-preview";
import { MagneticButton } from "./magnetic";
import { LogoMark } from "@/components/brand/logo";
import { CopyButton } from "@/components/ui/copy-button";
import { cliAddCommands } from "@/lib/registry";

const heroSlug = "voice-sphere";

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
      className="relative isolate overflow-hidden border-b border-border/40"
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

      <div className="relative mx-auto grid max-w-7xl gap-12 px-5 pb-24 pt-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-16 lg:pb-32 lg:pt-16">
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

          <HeroInstallPill slug={heroSlug} />
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
              query="fake=1"
              title="appCN VoiceSphere running live"
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

/**
 * Single-command install pill for the hero. Intentionally NOT the full
 * 4-tab InstallTabs from per-component pages: on first-impression surface,
 * decision fatigue is the enemy. One recommended command, big copy button,
 * deep-link to the full menu on the component page.
 */
function HeroInstallPill({ slug }: { slug: string }) {
  const command = cliAddCommands(slug).npm;
  return (
    <div className="hero-install mt-10 max-w-md">
      <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3">
        <LogoMark className="h-4 w-4 shrink-0 text-foreground" />
        <code className="flex-1 truncate font-mono text-sm text-foreground">
          {command}
        </code>
        <CopyButton value={command} />
      </div>
      <p className="mt-2 px-1 text-xs text-muted-foreground">
        Recommended — configures NativeWind + Reanimated.{" "}
        <Link
          href={`/components/${slug}`}
          className="text-foreground/80 underline-offset-4 hover:text-foreground hover:underline"
        >
          Other install methods →
        </Link>
      </p>
    </div>
  );
}

function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative mx-auto w-full max-w-[280px]">
      {/* Ambient glow behind the device */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-8 -z-10 rounded-[4rem] bg-gradient-to-br from-primary/30 via-transparent to-fuchsia-500/25 blur-3xl"
      />

      {/* Phone body — solid black with a defined gray border. The body
          itself is the visible frame; the 8px inset on the screen creates
          the bezel. */}
      <div
        className="relative w-full rounded-[40px] border-2 border-zinc-700 bg-black"
        style={{
          aspectRatio: "9 / 18",
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.12), 0 30px 80px -15px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.04), 8px 14px 50px -12px rgba(160,110,255,0.28)",
        }}
      >
        {/* Side buttons */}
        <span
          aria-hidden
          className="pointer-events-none absolute -left-[3px] top-[14%] z-30 h-6 w-[3px] rounded-l-md bg-zinc-700"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute -left-[4px] top-[22%] z-30 h-12 w-[4px] rounded-l-md bg-zinc-700"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute -left-[4px] top-[31%] z-30 h-12 w-[4px] rounded-l-md bg-zinc-700"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute -right-[4px] top-[26%] z-30 h-16 w-[4px] rounded-r-md bg-zinc-700"
        />

        {/* Screen */}
        <div
          className="absolute inset-2 overflow-hidden rounded-[32px]"
          style={{ backgroundColor: "#0A0A14" }}
        >
          {/* Status bar — modeled after iOS 17. Time and icon cluster flank
              the dynamic island, vertically centered with it. Padding is
              symmetric and tight so the icon cluster doesn't crowd the
              island. */}
          <div
            className="pointer-events-none absolute inset-x-0 top-0 z-10 flex h-[40px] items-center justify-between px-5 text-white"
            style={{
              fontFamily:
                "ui-rounded, -apple-system, BlinkMacSystemFont, 'SF Pro Rounded', 'SF Pro', sans-serif",
              letterSpacing: "-0.01em",
            }}
          >
            <span className="text-[14px] font-semibold tabular-nums">
              <Clock />
            </span>
            <span className="inline-flex items-center gap-[6px]">
              {/* WiFi — 3 solid arcs + dot, fully connected look */}
              <svg
                width="16"
                height="12"
                viewBox="0 0 16 12"
                fill="currentColor"
                aria-hidden
              >
                <path d="M8 0C5.13 0 2.55 1.13.7 2.97L0 2.27C2.04.23 4.85-1 8-1s5.96 1.23 8 3.27l-.7.7C13.45 1.13 10.87 0 8 0z" transform="translate(0,1.5)" />
                <path d="M8 3.5c-1.93 0-3.68.78-4.95 2.05L2.34 4.85C3.81 3.38 5.81 2.5 8 2.5s4.19.88 5.66 2.35l-.71.7C11.68 4.28 9.93 3.5 8 3.5z" transform="translate(0,1.5)" />
                <path d="M8 6.5c-.97 0-1.85.39-2.49 1.03l-.71-.71C5.62 6 6.76 5.5 8 5.5s2.38.5 3.2 1.32l-.71.71C9.85 6.89 8.97 6.5 8 6.5z" transform="translate(0,1.5)" />
                <circle cx="8" cy="10.5" r="1.1" />
              </svg>
              {/* Battery */}
              <span className="inline-flex items-center" aria-hidden>
                <span
                  className="relative inline-flex h-[12px] w-[25px] items-center rounded-[3.5px] px-[1.5px]"
                  style={{ boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.85)" }}
                >
                  <span className="block h-[7px] w-[18px] rounded-[1.5px] bg-white" />
                </span>
                <span className="ml-[1px] block h-[5px] w-[1.5px] rounded-r-sm bg-white/85" />
              </span>
            </span>
          </div>

          {/* Dynamic Island */}
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-[10px] z-20 h-[28px] w-[100px] -translate-x-1/2 rounded-full bg-black"
            style={{
              boxShadow:
                "inset 0 0 0 1px rgba(255,255,255,0.06), 0 1px 2px rgba(0,0,0,0.5)",
            }}
          >
            <span
              aria-hidden
              className="absolute right-2.5 top-1/2 h-[6px] w-[6px] -translate-y-1/2 rounded-full bg-zinc-800 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.15)]"
            />
          </div>

          {/* The actual screen content */}
          {children}

          {/* Subtle glass sheen */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-30"
            style={{
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0) 30%, rgba(255,255,255,0) 70%, rgba(255,255,255,0.03) 100%)",
            }}
          />

          {/* Home indicator */}
          <div
            aria-hidden
            className="pointer-events-none absolute bottom-2 left-1/2 z-20 h-[5px] w-[110px] -translate-x-1/2 rounded-full bg-white/85"
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Live clock for the phone-frame status bar. Renders empty on the server to
 * avoid hydration mismatch, then mounts the current time client-side and
 * updates every 20s. Mirrors the iOS status bar format (e.g. "9:41").
 */
function Clock() {
  const [time, setTime] = useState<string>("");

  useEffect(() => {
    const update = () => {
      const raw = new Date().toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      });
      setTime(raw.replace(/\s?(AM|PM)/i, "").trim());
    };
    update();
    const id = setInterval(update, 20_000);
    return () => clearInterval(id);
  }, []);

  // Reserve the slot during SSR with non-breaking spaces so the layout
  // doesn't jump on hydration.
  return <span suppressHydrationWarning>{time || "   "}</span>;
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

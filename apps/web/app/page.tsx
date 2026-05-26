import Link from "next/link";

import {
  components,
  installCommand,
  namespacedInstallCommand,
  npmInstallCommand,
  type ComponentEntry,
} from "@/lib/registry";
import { siteConfig } from "@/lib/config";
import { InstallTabs } from "@/components/preview/install-tabs";
import { LivePreview } from "@/components/preview/live-preview";

export default function Home() {
  const ai = components.filter((c) => c.category === "ai");
  const heroSlug = "prompt-input";

  return (
    <main className="flex-1">
      <Hero heroSlug={heroSlug} />
      <TrustStrip />
      <AICollection ai={ai} />
      <HowItWorks />
      <WhyAppcn />
      <AllComponents />
    </main>
  );
}

function Hero({ heroSlug }: { heroSlug: string }) {
  return (
    <section className="relative overflow-hidden border-b border-border/60">
      {/* Gradient blur */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[-30%] h-[640px] w-[1000px] -translate-x-1/2 rounded-full bg-primary/20 blur-[160px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-[-10%] top-[20%] h-[420px] w-[640px] rounded-full bg-violet-500/10 blur-[120px]"
      />

      <div className="relative mx-auto grid max-w-6xl gap-12 px-5 py-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-28">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            v0.1 · early access · React Native + Expo
          </span>
          <h1 className="mt-6 text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
            Mobile components
            <br />
            you actually{" "}
            <span className="bg-gradient-to-r from-primary via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
              own
            </span>
            .
          </h1>
          <p className="mt-5 max-w-xl text-lg text-muted-foreground">
            A shadcn-philosophy component library for React Native — copy-paste
            ownership, NativeWind styling, motion-first defaults, and a featured
            AI collection. Preview every component live on your phone in seconds.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/components"
              className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02]"
            >
              Browse components
            </Link>
            <a
              href="#how-it-works"
              className="rounded-xl border border-border bg-card/50 px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-card"
            >
              How it works
            </a>
          </div>

          <div className="mt-8 max-w-md">
            <InstallTabs
              options={[
                {
                  id: "shadcn",
                  label: "shadcn CLI",
                  command: installCommand(heroSlug, siteConfig.registryBaseUrl),
                  hint: "Copies the source straight into your project. No lock-in.",
                },
                {
                  id: "shadcn-ns",
                  label: "shadcn (namespaced)",
                  command: namespacedInstallCommand(heroSlug),
                  hint: 'Once `"@appcn"` is registered in your components.json.',
                },
                {
                  id: "npm",
                  label: "npm",
                  command: npmInstallCommand(),
                  hint: "Whole library, managed dep. Available in 0.1.0+.",
                },
              ]}
            />
          </div>
        </div>

        <div className="relative">
          <div
            aria-hidden
            className="absolute -inset-6 rounded-[3rem] bg-gradient-to-br from-primary/30 via-transparent to-violet-500/20 blur-2xl"
          />
          <div className="relative">
            <LivePreview
              slug={heroSlug}
              showcaseWebUrl={siteConfig.showcaseWebUrl}
              title="appCN PromptInput running live"
            />
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Live preview · same code path as your phone
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function TrustStrip() {
  const items = [
    { label: "Components", value: `${components.length}` },
    { label: "Categories", value: "Base + AI" },
    { label: "License", value: "MIT" },
    { label: "Stack", value: "Expo · NativeWind · Reanimated" },
  ];
  return (
    <section className="border-b border-border/60 bg-card/30">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 px-5 py-6 sm:grid-cols-4">
        {items.map((i) => (
          <div key={i.label} className="text-center sm:text-left">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {i.label}
            </p>
            <p className="mt-1 font-mono text-sm text-foreground">{i.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function AICollection({ ai }: { ai: ComponentEntry[] }) {
  return (
    <section className="mx-auto max-w-6xl px-5 py-20">
      <div className="overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-b from-primary/10 to-transparent">
        <div className="grid gap-10 p-8 lg:grid-cols-[0.95fr_1.05fr] lg:p-10">
          <div className="flex flex-col justify-center">
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-primary/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary">
              Featured collection
            </span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              AI-native, on mobile.
            </h2>
            <p className="mt-3 max-w-md text-muted-foreground">
              Streaming bubbles, thinking traces, prompt composers, voice
              visualizers — the components that AI apps actually need, designed
              for touch from the ground up.
            </p>
            <ul className="mt-6 space-y-2.5 text-sm text-muted-foreground">
              {ai.map((c) => (
                <li key={c.slug} className="flex gap-2">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
                  <span>
                    <Link
                      href={`/components/${c.slug}`}
                      className="font-medium text-foreground transition-colors hover:text-primary"
                    >
                      {c.title}
                    </Link>{" "}
                    — {c.meta.delight}
                  </span>
                </li>
              ))}
            </ul>
            <Link
              href="/components"
              className="mt-8 inline-flex w-fit items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
            >
              See the collection
              <span aria-hidden>→</span>
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {ai.slice(0, 4).map((c) => (
              <Link
                key={c.slug}
                href={`/components/${c.slug}`}
                className="group block rounded-2xl border border-border bg-background/40 p-3 transition-colors hover:border-primary/50"
              >
                <div className="aspect-[9/19] overflow-hidden rounded-xl border-[6px] border-zinc-800 bg-background">
                  <iframe
                    src={`${siteConfig.showcaseWebUrl}/c/${c.slug}`}
                    title={`${c.title} live preview`}
                    loading="lazy"
                    className="h-full w-full border-0"
                  />
                </div>
                <p className="mt-3 px-1 text-sm font-semibold text-card-foreground group-hover:text-primary">
                  {c.title}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      n: "01",
      title: "Find a component",
      body: "Browse the catalog — Base for primitives, AI for the streaming collection.",
    },
    {
      n: "02",
      title: "Preview on your phone",
      body: "Scan a QR with Expo Go and the component runs live with real native motion.",
    },
    {
      n: "03",
      title: "Install your way",
      body: "Copy-paste with the shadcn CLI, or pull the whole library from npm — your call.",
    },
  ];
  return (
    <section id="how-it-works" className="border-y border-border/60 bg-card/30">
      <div className="mx-auto max-w-6xl px-5 py-20">
        <div className="max-w-2xl">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            How it works
          </span>
          <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            From catalog to your app in three steps.
          </h2>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {steps.map((s) => (
            <div
              key={s.n}
              className="rounded-2xl border border-border bg-background/60 p-6"
            >
              <span className="font-mono text-xs text-primary">{s.n}</span>
              <h3 className="mt-3 text-lg font-semibold text-foreground">
                {s.title}
              </h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhyAppcn() {
  const reasons = [
    {
      title: "Real-phone previews",
      body: "Every component has a QR you can scan with Expo Go. No emulator, no setup — real native gestures.",
    },
    {
      title: "AI-native flagship",
      body: "Streaming bubbles, reasoning traces, voice waveforms, prompt composers. The collection nobody else ships well.",
    },
    {
      title: "Dual distribution",
      body: "Copy-paste the source with the shadcn CLI, or install the whole library from npm. Same primitives, your choice.",
    },
    {
      title: "Motion-first defaults",
      body: "Reanimated + gesture handler, shared motion tokens, and one delight detail per component. Premium feel, on by default.",
    },
  ];
  return (
    <section className="mx-auto max-w-6xl px-5 py-20">
      <div className="max-w-2xl">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Why appCN
        </span>
        <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          Built for the way mobile actually feels.
        </h2>
      </div>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {reasons.map((r) => (
          <div
            key={r.title}
            className="rounded-2xl border border-border bg-card/60 p-5 transition-colors hover:border-primary/40"
          >
            <h3 className="font-semibold text-card-foreground">{r.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{r.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function AllComponents() {
  return (
    <section className="border-t border-border/60">
      <div className="mx-auto max-w-6xl px-5 py-20">
        <div className="flex items-end justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              The catalog
            </span>
            <h2 className="mt-2 text-3xl font-bold tracking-tight">
              All components
            </h2>
          </div>
          <Link
            href="/components"
            className="text-sm font-medium text-primary hover:underline"
          >
            Open catalog →
          </Link>
        </div>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {components.map((c) => (
            <Link
              key={c.slug}
              href={`/components/${c.slug}`}
              className="group rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/50"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-card-foreground group-hover:text-foreground">
                  {c.title}
                </h3>
                <span
                  className={
                    c.category === "ai"
                      ? "rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground"
                      : "rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold text-secondary-foreground"
                  }
                >
                  {c.category === "ai" ? "AI" : "Base"}
                </span>
              </div>
              <p className="mt-1.5 text-sm text-muted-foreground">
                {c.description}
              </p>
              <p className="mt-3 text-xs italic text-primary/80">
                {c.meta.delight}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

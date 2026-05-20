import Link from "next/link";

import { components, installCommand } from "@/lib/registry";
import { siteConfig } from "@/lib/config";
import { CopyButton } from "@/components/ui/copy-button";

export default function Home() {
  const featured = components.filter((c) => c.category === "ai");
  const install = installCommand("button", siteConfig.registryBaseUrl);

  return (
    <main className="flex-1">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-[-10%] h-[480px] w-[820px] -translate-x-1/2 rounded-full bg-primary/20 blur-[140px]"
        />
        <div className="relative mx-auto max-w-3xl px-5 py-24 text-center sm:py-32">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Early access · React Native + Expo
          </span>
          <h1 className="mt-6 text-5xl font-bold tracking-tight sm:text-6xl">
            Mobile components
            <br />
            you actually{" "}
            <span className="bg-gradient-to-r from-primary to-violet-400 bg-clip-text text-transparent">
              own
            </span>
            .
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground">
            {siteConfig.description} Preview any component live on your phone in
            seconds.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/components"
              className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02]"
            >
              Browse components
            </Link>
            <div className="flex items-center gap-1 rounded-xl border border-border bg-card px-3 py-2 font-mono text-sm">
              <span className="text-muted-foreground">$</span>
              <span className="text-foreground">{install}</span>
              <CopyButton value={install} />
            </div>
          </div>
        </div>
      </section>

      {/* Three ways to preview */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              title: "Live on your phone",
              body: "Scan a QR with Expo Go and the component runs on your real device — true native motion and gestures.",
            },
            {
              title: "Interactive on the web",
              body: "The same component, rendered via react-native-web right in the docs. No setup.",
            },
            {
              title: "Video, always",
              body: "A recorded clip for every component, so previews never break and look great in social embeds.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-border bg-card p-5"
            >
              <h3 className="font-semibold text-card-foreground">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured AI collection */}
      <section className="mx-auto max-w-6xl px-5 py-12">
        <div className="rounded-3xl border border-primary/30 bg-gradient-to-b from-primary/10 to-transparent p-8">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">
            Featured
          </span>
          <h2 className="mt-2 text-2xl font-bold tracking-tight">
            The AI-native collection
          </h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Components built for AI apps — streaming bubbles, thinking states,
            and more. The pieces nobody else ships well.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {featured.map((c) => (
              <ComponentCard
                key={c.slug}
                slug={c.slug}
                title={c.title}
                description={c.description}
                category={c.category}
              />
            ))}
          </div>
        </div>
      </section>

      {/* All components */}
      <section className="mx-auto max-w-6xl px-5 py-12">
        <h2 className="text-2xl font-bold tracking-tight">All components</h2>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {components.map((c) => (
            <ComponentCard
              key={c.slug}
              slug={c.slug}
              title={c.title}
              description={c.description}
              category={c.category}
            />
          ))}
        </div>
      </section>
    </main>
  );
}

function ComponentCard({
  slug,
  title,
  description,
  category,
}: {
  slug: string;
  title: string;
  description: string;
  category: "base" | "ai";
}) {
  return (
    <Link
      href={`/components/${slug}`}
      className="group rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/50"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-card-foreground group-hover:text-foreground">
          {title}
        </h3>
        <span
          className={
            category === "ai"
              ? "rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground"
              : "rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold text-secondary-foreground"
          }
        >
          {category === "ai" ? "AI" : "Base"}
        </span>
      </div>
      <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
    </Link>
  );
}

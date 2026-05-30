import Link from "next/link";

import { components, isBlock, type ComponentEntry } from "@/lib/registry";

export const metadata = {
  title: "Components — appCN",
  description:
    "Browse appCN's mobile component library — base primitives and the AI-native collection.",
};

export default function ComponentsIndex() {
  const base = components.filter((c) => c.category === "base" && !isBlock(c));
  const ai = components.filter((c) => c.category === "ai" && !isBlock(c));
  const blockItems = components.filter(isBlock);

  return (
    <main className="space-y-12">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Components</h1>
        <p className="max-w-2xl text-muted-foreground">
          Copy-paste into your Expo app. Preview each on the web, on your real
          phone via QR, or as video.
        </p>
      </header>

      <Section title="Blocks" items={blockItems} accent />
      <Section title="Base" items={base} />
      <Section title="AI-native" items={ai} accent />
    </main>
  );
}

function Section({
  title,
  items,
  accent,
}: {
  title: string;
  items: ComponentEntry[];
  accent?: boolean;
}) {
  if (items.length === 0) return null;
  return (
    <section className="space-y-4">
      <h2
        className={
          "text-xs font-semibold uppercase tracking-wider " +
          (accent ? "text-primary" : "text-muted-foreground")
        }
      >
        {title}
      </h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((c) => (
          <Link
            key={c.slug}
            href={`/components/${c.slug}`}
            className="group rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/50"
          >
            <div className="flex items-baseline justify-between gap-3">
              <h3 className="font-semibold text-card-foreground">{c.title}</h3>
              <span className="font-mono text-[11px] text-muted-foreground/70">
                {c.slug}
              </span>
            </div>
            <p className="mt-1.5 text-sm text-muted-foreground">{c.description}</p>
            <p className="mt-3 text-xs italic text-primary/80">
              {c.meta.delight}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}

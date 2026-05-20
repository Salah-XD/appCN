import Link from "next/link";

import { components } from "@/lib/registry";

export const metadata = {
  title: "Components — appCN",
};

export default function ComponentsIndex() {
  const base = components.filter((c) => c.category === "base");
  const ai = components.filter((c) => c.category === "ai");

  return (
    <main className="mx-auto max-w-6xl flex-1 px-5 py-16">
      <h1 className="text-3xl font-bold tracking-tight">Components</h1>
      <p className="mt-2 text-muted-foreground">
        Copy-paste into your Expo app. Preview each on web, on your phone, or as
        video.
      </p>

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
  items: typeof components;
  accent?: boolean;
}) {
  if (items.length === 0) return null;
  return (
    <section className="mt-12">
      <h2
        className={
          "text-sm font-semibold uppercase tracking-wider " +
          (accent ? "text-primary" : "text-muted-foreground")
        }
      >
        {title}
      </h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((c) => (
          <Link
            key={c.slug}
            href={`/components/${c.slug}`}
            className="group rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/50"
          >
            <h3 className="font-semibold text-card-foreground">{c.title}</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {c.description}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}

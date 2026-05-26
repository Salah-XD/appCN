import Link from "next/link";
import { notFound } from "next/navigation";

import {
  components,
  componentMap,
  installCommand,
  namespacedInstallCommand,
  npmInstallCommand,
} from "@/lib/registry";
import { siteConfig } from "@/lib/config";
import { readComponentSource } from "@/lib/source";
import { ComponentPreview } from "@/components/preview/component-preview";
import { InstallTabs } from "@/components/preview/install-tabs";
import { CodeBlock } from "@/components/ui/code-block";
import type { ComponentMeta, PropDoc } from "@appcn/ui/lib/meta";

export function generateStaticParams() {
  return components.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const meta = componentMap[slug];
  if (!meta) return { title: "Not found — appCN" };
  return {
    title: `${meta.title} — appCN`,
    description: meta.description,
  };
}

export default async function ComponentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = componentMap[slug];
  if (!entry) notFound();

  const source = readComponentSource(entry.sourcePath);
  const { meta } = entry;

  return (
    <main className="space-y-12">
      <Header meta={meta} />
      <Section title="Install">
        <InstallTabs
          options={[
            {
              id: "shadcn-url",
              label: "shadcn (URL)",
              command: installCommand(entry.registryItem, siteConfig.registryBaseUrl),
              hint: "Works without setup. Copies the source into your project.",
            },
            {
              id: "shadcn-ns",
              label: "shadcn (namespaced)",
              command: namespacedInstallCommand(entry.registryItem),
              hint: 'Requires "@appcn" registered in your project\'s components.json.',
            },
            {
              id: "npm",
              label: "npm",
              command: npmInstallCommand(),
              hint: "Imports from @appcn/ui. Available in 0.1.0+.",
            },
          ]}
        />
      </Section>
      <Section title="Preview">
        <ComponentPreview
          slug={entry.slug}
          source={source}
          installCommand={installCommand(entry.registryItem, siteConfig.registryBaseUrl)}
          showcaseWebUrl={siteConfig.showcaseWebUrl}
          expoUrl={siteConfig.expoUrl}
        />
      </Section>
      <Anatomy meta={meta} />
      <Delight meta={meta} />
      <Section title="Props">
        <PropsTable props={meta.props} />
      </Section>
      <Section title="Examples">
        <div className="space-y-6">
          {meta.examples.map((ex) => (
            <article key={ex.title} className="space-y-2">
              <h3 className="text-base font-semibold text-foreground">{ex.title}</h3>
              {ex.description ? (
                <p className="text-sm text-muted-foreground">{ex.description}</p>
              ) : null}
              <CodeBlock code={ex.code} />
            </article>
          ))}
        </div>
      </Section>
      <Section title="Accessibility">
        <ul className="space-y-2 text-sm text-muted-foreground">
          {meta.a11y.map((line, i) => (
            <li key={i} className="flex gap-2">
              <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary" />
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </Section>
    </main>
  );
}

function Header({ meta }: { meta: ComponentMeta }) {
  return (
    <header className="space-y-3">
      <Link
        href="/components"
        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        ← All components
      </Link>
      <div className="flex items-center gap-3">
        <h1 className="text-3xl font-bold tracking-tight">{meta.title}</h1>
        <CategoryBadge category={meta.category} />
      </div>
      <p className="max-w-2xl text-muted-foreground">{meta.description}</p>
    </header>
  );
}

function CategoryBadge({ category }: { category: ComponentMeta["category"] }) {
  return (
    <span
      className={
        category === "ai"
          ? "rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground"
          : "rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold text-secondary-foreground"
      }
    >
      {category === "ai" ? "AI" : "Base"}
    </span>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-bold tracking-tight">{title}</h2>
      {children}
    </section>
  );
}

function Anatomy({ meta }: { meta: ComponentMeta }) {
  return (
    <Section title="Anatomy">
      <div className="rounded-2xl border border-border bg-card p-5">
        <p className="text-[15px] leading-7 text-card-foreground">{meta.anatomy}</p>
      </div>
    </Section>
  );
}

function Delight({ meta }: { meta: ComponentMeta }) {
  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-primary/40 bg-primary/5 p-5">
        <span className="inline-block rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
          The delight detail
        </span>
        <p className="mt-3 text-[15px] leading-7 text-foreground">{meta.delight}</p>
      </div>
    </section>
  );
}

function PropsTable({ props }: { props: PropDoc[] }) {
  if (props.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">This component takes no props.</p>
    );
  }
  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-card">
      <table className="w-full min-w-[640px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-border bg-background/40 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Type</th>
            <th className="px-4 py-3">Default</th>
            <th className="px-4 py-3">Description</th>
          </tr>
        </thead>
        <tbody>
          {props.map((p, i) => (
            <tr
              key={p.name}
              className={i === props.length - 1 ? "" : "border-b border-border/60"}
            >
              <td className="px-4 py-3 align-top">
                <code className="font-mono text-[13px] text-foreground">
                  {p.name}
                  {p.required ? (
                    <span className="ml-0.5 text-primary" title="Required">
                      *
                    </span>
                  ) : null}
                </code>
              </td>
              <td className="px-4 py-3 align-top">
                <code className="break-words font-mono text-[12px] text-muted-foreground">
                  {p.type}
                </code>
              </td>
              <td className="px-4 py-3 align-top">
                {p.default ? (
                  <code className="font-mono text-[12px] text-muted-foreground">
                    {p.default}
                  </code>
                ) : (
                  <span className="text-xs text-muted-foreground/60">—</span>
                )}
              </td>
              <td className="px-4 py-3 align-top text-sm text-muted-foreground">
                {p.description}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { Wrench } from "lucide-react";

import {
  components,
  componentMap,
  cliAddCommands,
  installCommands,
  namespacedInstallCommands,
  npmInstallCommands,
} from "@/lib/registry";
import { siteConfig } from "@/lib/config";
import { readComponentSource } from "@/lib/source";
import { ComponentPreview } from "@/components/preview/component-preview";
import { InstallTabs } from "@/components/preview/install-tabs";
import { LogoMark } from "@/components/brand/logo";
import { NpmIcon, ShadcnIcon } from "@/components/brand/pm-icons";
import { CodeBlock } from "@/components/ui/code-block";
import { Badge } from "@/components/ui/badge";
import { TableOfContents } from "@/components/site/table-of-contents";
import { buildManualInstall } from "@/lib/manual-install";
import { getBadge } from "@/lib/badges";
import type { ComponentMeta, PropDoc } from "@app-cn/ui/lib/meta";

const TOC_ITEMS = [
  { id: "preview", label: "Preview" },
  { id: "install", label: "Install" },
  { id: "anatomy", label: "Anatomy" },
  { id: "delight", label: "Delight" },
  { id: "props", label: "Props" },
  { id: "examples", label: "Examples" },
  { id: "a11y", label: "Accessibility" },
];

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
  const manual = await buildManualInstall(entry.registryItem);

  const installOptions = [
    {
      id: "cli" as const,
      label: "appcn CLI",
      icon: <LogoMark className="h-3.5 w-3.5" />,
      commands: cliAddCommands(entry.slug),
      hint:
        "Recommended. Configures NativeWind + Reanimated and registers @app-cn on first run.",
    },
    {
      id: "shadcn-ns" as const,
      label: "shadcn (namespaced)",
      icon: <ShadcnIcon className="h-3.5 w-3.5" />,
      commands: namespacedInstallCommands(entry.registryItem),
      hint:
        "Use after `appcn init` adds the @app-cn registry to your components.json.",
    },
    {
      id: "shadcn-url" as const,
      label: "shadcn (URL)",
      icon: <ShadcnIcon className="h-3.5 w-3.5" />,
      commands: installCommands(entry.registryItem, siteConfig.registryBaseUrl),
      hint: "No setup required. Best for one-off copies.",
    },
    {
      id: "library" as const,
      label: "npm package",
      icon: <NpmIcon className="h-3.5 w-3.5" />,
      commands: npmInstallCommands(),
      hint:
        "Managed dep. Requires NativeWind + tailwind-preset configured in the consumer app.",
    },
  ];

  // Append a Manual tab when we have the source available (always, post-registry-build).
  const optionsWithManual = manual
    ? [
        ...installOptions,
        {
          kind: "manual" as const,
          id: "manual",
          label: "Manual",
          icon: <Wrench className="h-3.5 w-3.5" />,
          manual,
          hint: "Copy each file by hand if you'd rather not run a CLI.",
        },
      ]
    : installOptions;

  return (
    <div className="flex gap-10">
      <main className="min-w-0 flex-1 space-y-12">
        <Header meta={meta} />

        <Section id="preview" title="Preview">
          <ComponentPreview
            slug={entry.slug}
            source={source}
            installCommand={cliAddCommands(entry.slug).npm}
            showcaseWebUrl={siteConfig.showcaseWebUrl}
            expoUrl={siteConfig.expoUrl}
          />
        </Section>

        <Section id="install" title="Install">
          <InstallTabs options={optionsWithManual} />
        </Section>

        <Anatomy meta={meta} />
        <Delight meta={meta} />

        <Section id="props" title="Props">
          <PropsTable props={meta.props} />
        </Section>

        <Section id="examples" title="Examples">
          <div className="space-y-6">
            {meta.examples.map((ex) => (
              <article key={ex.title} className="space-y-2">
                <h3 className="text-base font-semibold text-foreground">
                  {ex.title}
                </h3>
                {ex.description ? (
                  <p className="text-sm text-muted-foreground">{ex.description}</p>
                ) : null}
                <CodeBlock code={ex.code} />
              </article>
            ))}
          </div>
        </Section>

        <Section id="a11y" title="Accessibility">
          <ul className="space-y-2 text-sm text-muted-foreground">
            {meta.a11y.map((line, i) => (
              <li key={i} className="flex gap-2">
                <span
                  aria-hidden
                  className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary"
                />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </Section>
      </main>

      <TableOfContents items={TOC_ITEMS} />
    </div>
  );
}

function Header({ meta }: { meta: ComponentMeta }) {
  const badge = getBadge(meta);
  return (
    <header className="space-y-3">
      <Link
        href="/components"
        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        ← All components
      </Link>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-3xl font-bold tracking-tight">{meta.title}</h1>
        <CategoryBadge meta={meta} />
        {badge ? (
          <Badge
            variant={badge === "new" ? "default" : "secondary"}
            className="h-5 px-2 text-[10px] font-semibold uppercase tracking-wider"
          >
            {badge}
          </Badge>
        ) : null}
      </div>
      <p className="max-w-2xl text-muted-foreground">{meta.description}</p>
    </header>
  );
}

function CategoryBadge({ meta }: { meta: ComponentMeta }) {
  if (meta.kind === "block") {
    return (
      <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
        Block
      </span>
    );
  }
  return (
    <span
      className={
        meta.category === "ai"
          ? "rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground"
          : "rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold text-secondary-foreground"
      }
    >
      {meta.category === "ai" ? "AI" : "Base"}
    </span>
  );
}

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-20 space-y-4">
      <h2 className="text-xl font-bold tracking-tight">{title}</h2>
      {children}
    </section>
  );
}

function Anatomy({ meta }: { meta: ComponentMeta }) {
  return (
    <Section id="anatomy" title="Anatomy">
      <div className="rounded-2xl border border-border bg-card p-5">
        <p className="text-[15px] leading-7 text-card-foreground">
          {meta.anatomy}
        </p>
      </div>
    </Section>
  );
}

function Delight({ meta }: { meta: ComponentMeta }) {
  return (
    <section id="delight" className="scroll-mt-20 space-y-4">
      <div className="rounded-2xl border border-primary/40 bg-primary/5 p-5">
        <span className="inline-block rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
          The delight detail
        </span>
        <p className="mt-3 text-[15px] leading-7 text-foreground">
          {meta.delight}
        </p>
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

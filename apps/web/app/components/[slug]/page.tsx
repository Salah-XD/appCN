import Link from "next/link";
import { notFound } from "next/navigation";

import { components, componentMap, installCommand } from "@/lib/registry";
import { siteConfig } from "@/lib/config";
import { readComponentSource } from "@/lib/source";
import { ComponentPreview } from "@/components/preview/component-preview";

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
  const meta = componentMap[slug];
  if (!meta) notFound();

  const source = readComponentSource(meta.sourcePath);
  const install = installCommand(meta.registryItem, siteConfig.registryBaseUrl);

  return (
    <main className="mx-auto max-w-3xl flex-1 px-5 py-12">
      <Link
        href="/components"
        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        ← All components
      </Link>

      <div className="mt-4 flex items-center gap-3">
        <h1 className="text-3xl font-bold tracking-tight">{meta.title}</h1>
        <span
          className={
            meta.category === "ai"
              ? "rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground"
              : "rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold text-secondary-foreground"
          }
        >
          {meta.category === "ai" ? "AI" : "Base"}
        </span>
      </div>
      <p className="mt-2 text-muted-foreground">{meta.description}</p>

      <div className="mt-8">
        <ComponentPreview
          slug={meta.slug}
          source={source}
          installCommand={install}
          showcaseWebUrl={siteConfig.showcaseWebUrl}
          expoUrl={siteConfig.expoUrl}
        />
      </div>
    </main>
  );
}

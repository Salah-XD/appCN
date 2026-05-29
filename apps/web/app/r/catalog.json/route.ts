import { siteConfig } from "@/lib/config";
import { components } from "@/lib/registry";
import { designGuide } from "@/lib/design-guide";

/**
 * The appCN catalog — the rich superset of the shadcn registry that
 * `@app-cn/mcp` reads. Per-item `/r/<name>.json` files (emitted by `shadcn
 * build`) carry source + dependencies; this carries the docs meta (anatomy,
 * delight, props, examples, a11y) plus the design guide that the generic
 * registry JSON can't express.
 *
 * Prerendered at build time and served at `/r/catalog.json`. It does not
 * collide with the generated `public/r/*.json` items — that path isn't one of
 * them.
 */
export const dynamic = "force-static";

export function GET() {
  return Response.json({
    name: "appcn",
    homepage: siteConfig.docsOrigin,
    registryBaseUrl: siteConfig.registryBaseUrl,
    components: components.map((c) => ({
      slug: c.slug,
      title: c.meta.title,
      category: c.meta.category,
      description: c.meta.description,
      anatomy: c.meta.anatomy,
      delight: c.meta.delight,
      props: c.meta.props,
      examples: c.meta.examples,
      a11y: c.meta.a11y,
      registryItem: c.registryItem,
      addedAt: c.meta.addedAt,
      updatedAt: c.meta.updatedAt,
    })),
    designGuide,
  });
}

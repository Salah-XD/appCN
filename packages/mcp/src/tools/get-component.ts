import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { findComponent, getCatalog, getRegistryItem } from "../lib/catalog";
import { buildInstallCommands } from "../lib/commands";
import { errorResult, json } from "../lib/result";

export function registerGetComponent(server: McpServer) {
  server.registerTool(
    "get_component",
    {
      title: "Get an appCN component",
      description:
        "Everything an agent needs to add and correctly use one appCN component: its docs (anatomy, delight detail, props, usage examples, accessibility notes), the actual source file contents, the npm packages and registry helpers it depends on, and the install command. Prefer installing via the install command rather than pasting `files` by hand — that resolves dependencies for you.",
      inputSchema: {
        slug: z
          .string()
          .min(1)
          .describe("Component slug, e.g. 'button', 'stream-bubble', 'voice-sphere'."),
      },
    },
    async ({ slug }) => {
      try {
        const catalog = await getCatalog();
        const meta = await findComponent(slug);
        if (!meta) {
          const known = catalog.components.map((c) => c.slug).join(", ");
          return errorResult(
            `Unknown component "${slug}". Known components: ${known}. Use list_components or search_components.`,
          );
        }

        const item = await getRegistryItem(meta.registryItem);
        const install = buildInstallCommands({
          slug: meta.slug,
          registryItem: meta.registryItem,
          registryBaseUrl: catalog.registryBaseUrl,
          manager: "npm",
        });

        return json({
          slug: meta.slug,
          title: meta.title,
          category: meta.category,
          description: meta.description,
          anatomy: meta.anatomy,
          delight: meta.delight,
          props: meta.props,
          examples: meta.examples,
          a11y: meta.a11y,
          dependencies: item.dependencies ?? [],
          registryDependencies: item.registryDependencies ?? [],
          install,
          files: (item.files ?? []).map((f) => ({
            target: f.target,
            content: f.content,
          })),
        });
      } catch (err) {
        return errorResult(
          `Could not load component "${slug}": ${(err as Error).message}`,
        );
      }
    },
  );
}

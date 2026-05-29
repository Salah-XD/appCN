import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { findComponent, getCatalog } from "../lib/catalog";
import { buildAllInstallCommands, buildInstallCommands } from "../lib/commands";
import { errorResult, json } from "../lib/result";

export function registerGetInstallCommand(server: McpServer) {
  server.registerTool(
    "get_install_command",
    {
      title: "Get an appCN install command",
      description:
        "The exact command to add an appCN component to a project. Returns three install methods — the appCN CLI (recommended; handles NativeWind + Reanimated setup), shadcn namespaced, and shadcn by URL (zero setup) — for the requested package manager (or all of them).",
      inputSchema: {
        slug: z
          .string()
          .min(1)
          .describe("Component slug, e.g. 'button' or 'voice-sphere'."),
        manager: z
          .enum(["npm", "pnpm", "yarn", "bun"])
          .optional()
          .describe(
            "Package manager: npm, pnpm, yarn, or bun. Omit to get commands for all four.",
          ),
      },
    },
    async ({ slug, manager }) => {
      try {
        const catalog = await getCatalog();
        const meta = await findComponent(slug);
        if (!meta) {
          const known = catalog.components.map((c) => c.slug).join(", ");
          return errorResult(
            `Unknown component "${slug}". Known components: ${known}.`,
          );
        }

        const shared = {
          slug: meta.slug,
          registryItem: meta.registryItem,
          registryBaseUrl: catalog.registryBaseUrl,
        };

        if (manager) {
          return json({
            slug: meta.slug,
            manager,
            commands: buildInstallCommands({ ...shared, manager }),
          });
        }
        return json({
          slug: meta.slug,
          commandsByManager: buildAllInstallCommands(shared),
        });
      } catch (err) {
        return errorResult(
          `Could not build install command for "${slug}": ${(err as Error).message}`,
        );
      }
    },
  );
}

import Link from "next/link";

import { CodeBlock } from "@/components/ui/code-block";

export const metadata = {
  title: "MCP server — appCN",
  description:
    "Give your AI coding agent first-class access to appCN. The @app-cn/mcp Model Context Protocol server lets Claude Code, Cursor, Windsurf, and Codex discover, install, and correctly use appCN components.",
};

const CLAUDE_CODE = `claude mcp add appcn -- npx -y @app-cn/mcp`;

const CURSOR = `{
  "mcpServers": {
    "appcn": {
      "command": "npx",
      "args": ["-y", "@app-cn/mcp"]
    }
  }
}`;

const VSCODE = `{
  "servers": {
    "appcn": {
      "command": "npx",
      "args": ["-y", "@app-cn/mcp"]
    }
  }
}`;

const TOOLS: Array<{ name: string; desc: string }> = [
  {
    name: "list_components",
    desc: "List every appCN component (optionally filtered to base or ai), each with its one-line delight detail.",
  },
  {
    name: "search_components",
    desc: "Find components by intent — “chat input”, “voice indicator”, “streaming message”.",
  },
  {
    name: "get_component",
    desc: "The full payload for one component: docs, source files, npm + registry dependencies, and the install command.",
  },
  {
    name: "get_install_command",
    desc: "The exact command to add a component — appCN CLI, shadcn URL, or namespaced — per package manager.",
  },
  {
    name: "get_design_guide",
    desc: "appCN’s motion/haptic tokens and house rules, so the code your agent writes feels like appCN.",
  },
];

export default function McpDocsPage() {
  return (
    <main className="mx-auto w-full max-w-3xl space-y-12 px-5 py-10">
      <Header />

      <Section
        title="Add it to your agent"
        intro="The server runs on demand via npx — nothing to install globally. It reads from the live appCN registry, so it always reflects the latest published components."
      >
        <h3 className="text-sm font-semibold text-foreground">Claude Code</h3>
        <CodeBlock code={CLAUDE_CODE} />
        <h3 className="text-sm font-semibold text-foreground">
          Cursor / Windsurf <span className="font-normal text-muted-foreground">(mcp.json)</span>
        </h3>
        <CodeBlock code={CURSOR} />
        <h3 className="text-sm font-semibold text-foreground">
          VS Code <span className="font-normal text-muted-foreground">(.vscode/mcp.json)</span>
        </h3>
        <CodeBlock code={VSCODE} />
      </Section>

      <Section
        title="Tools"
        intro="Five tools take an agent from “what’s available?” to a correctly-installed, on-brand component."
      >
        <div className="overflow-hidden rounded-2xl border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/40 text-muted-foreground">
              <tr>
                <th className="px-4 py-2 font-medium">Tool</th>
                <th className="px-4 py-2 font-medium">What it does</th>
              </tr>
            </thead>
            <tbody>
              {TOOLS.map((t) => (
                <tr key={t.name} className="border-t border-border align-top">
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-foreground">
                    {t.name}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{t.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section
        title="Environment"
        intro="Point the server at a different registry for local development or a self-hosted fork."
      >
        <CodeBlock code={`# pass via your MCP client's env config\nAPPCN_REGISTRY_URL=http://localhost:3100/r`} />
        <p className="text-sm text-muted-foreground">
          Defaults to{" "}
          <code className="font-mono">https://appcn.vercel.app/r</code> — the same
          registry the CLI and the install commands on every component page point
          at.
        </p>
      </Section>

      <Section
        title="How it relates to shadcn’s MCP"
        intro="appCN is a standard shadcn-compatible registry, so shadcn’s own MCP can install appCN components too."
      >
        <p className="text-sm text-muted-foreground">
          Register{" "}
          <code className="font-mono">&quot;@app-cn&quot;</code> in your{" "}
          <code className="font-mono">components.json</code> and shadcn&apos;s MCP
          can browse and install appCN by name. What{" "}
          <code className="font-mono">@app-cn/mcp</code> adds on top is the
          appCN-specific knowledge the generic registry JSON doesn&apos;t carry:
          the delight detail, usage examples, accessibility notes, and the
          motion/haptic design guide — the things that make agent-authored code
          actually feel like appCN.
        </p>
      </Section>

      <footer className="pt-4 text-sm text-muted-foreground">
        Found a bug?{" "}
        <Link
          href="https://github.com/Salah-XD/appCN/issues"
          className="text-primary underline-offset-4 hover:underline"
        >
          Open an issue
        </Link>
        .
      </footer>
    </main>
  );
}

function Header() {
  return (
    <header className="space-y-3">
      <Link
        href="/components"
        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        ← Components
      </Link>
      <h1 className="text-3xl font-bold tracking-tight">appCN MCP server</h1>
      <p className="max-w-2xl text-muted-foreground">
        <code className="font-mono">@app-cn/mcp</code> gives your AI coding agent
        — Claude Code, Cursor, Windsurf, Codex — first-class access to appCN.
        Agents can discover components, read their full docs, get the exact
        install command, and learn appCN&apos;s design tokens, so the code they
        write matches the system instead of guessing.
      </p>
    </header>
  );
}

function Section({
  title,
  intro,
  children,
}: {
  title: string;
  intro: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div className="space-y-1.5">
        <h2 className="text-xl font-bold tracking-tight">{title}</h2>
        <p className="text-sm text-muted-foreground">{intro}</p>
      </div>
      {children}
    </section>
  );
}

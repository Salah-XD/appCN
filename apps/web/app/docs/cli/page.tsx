import Link from "next/link";

import { CodeBlock } from "@/components/ui/code-block";
import { InstallTabs } from "@/components/preview/install-tabs";
import { LogoMark } from "@/components/brand/logo";
import type { PackageManagerCommands } from "@/lib/registry";

export const metadata = {
  title: "CLI — appCN",
  description:
    "The @app-cn/cli init + add commands. RN-aware shadcn registry helper for Expo and bare React Native projects.",
};

function cliInvocation(args: string): PackageManagerCommands {
  const pkg = "@app-cn/cli@latest";
  return {
    npm: `npx ${pkg} ${args}`,
    pnpm: `pnpm dlx ${pkg} ${args}`,
    yarn: `yarn dlx ${pkg} ${args}`,
    bun: `bunx --bun ${pkg} ${args}`,
  };
}

export default function CliDocsPage() {
  return (
    <main className="mx-auto w-full max-w-3xl space-y-12 px-5 py-10">
      <Header />
      <Section
        title="init"
        intro="One-shot setup for a fresh Expo or bare React Native app. Detects your package manager, installs NativeWind + Reanimated + gesture-handler, patches tailwind/babel/metro/global.css, and registers the @app-cn shadcn registry in components.json."
      >
        <InstallTabs
          options={[
            {
              id: "init",
              label: "Run init",
              icon: <LogoMark className="h-3.5 w-3.5" />,
              commands: cliInvocation("init"),
              hint: "Detects Expo vs bare RN and your package manager. Safe to re-run.",
            },
            {
              id: "init-lib",
              label: "init --lib",
              icon: <LogoMark className="h-3.5 w-3.5" />,
              commands: cliInvocation("init --lib"),
              hint: "Same as init, plus installs @app-cn/ui as a managed dep (skip if you only plan to copy components).",
            },
          ]}
        />
        <Callout title="Idempotency contract">
          Re-running <code className="font-mono">init</code> on an
          already-configured project produces zero diffs. If a file already
          contains the appCN setup, the CLI leaves it alone. If a file exists
          but conflicts (e.g. a hand-rolled <code>metro.config.js</code> that
          does not wrap with <code>withNativeWind</code>), the CLI prints the
          required diff and aborts — it never silently mutates Metro or app
          entry files.
        </Callout>
      </Section>

      <Section
        title="add"
        intro="Install a single appCN component into the current project. Delegates to shadcn after preflighting the registry and ensuring components.json knows about @app-cn."
      >
        <InstallTabs
          options={[
            {
              id: "add",
              label: "Add a component",
              icon: <LogoMark className="h-3.5 w-3.5" />,
              commands: cliInvocation("add button"),
              hint: "Replace `button` with any slug from the components index.",
            },
            {
              id: "add-yes",
              label: "Non-interactive",
              icon: <LogoMark className="h-3.5 w-3.5" />,
              commands: cliInvocation("add button --yes"),
              hint: "Skips the components.json registry-entry prompt. Useful in scripts and CI.",
            },
          ]}
        />
        <p className="text-sm text-muted-foreground">
          Under the hood, <code className="font-mono">appcn add &lt;slug&gt;</code>{" "}
          spawns <code className="font-mono">&lt;pm&gt; dlx shadcn@latest add @app-cn/&lt;slug&gt;</code>
          {" "}so the resulting file writes are identical to running shadcn
          directly. The CLI adds RN-specific preflight: registry HEAD check,
          components.json patch, and clearer error messages.
        </p>
      </Section>

      <Section
        title="Environment"
        intro="Override the registry base URL for local development or self-hosted forks."
      >
        <CodeBlock code={`# .env\nAPPCN_REGISTRY_URL=http://localhost:3000/r`} />
        <p className="text-sm text-muted-foreground">
          Defaults to <code className="font-mono">https://appcn.vercel.app/r</code>.
          The CLI uses this for the HEAD check; the URL written into{" "}
          <code className="font-mono">components.json</code> uses the same value
          so consumers point at the registry they actually fetched from.
        </p>
      </Section>

      <Section
        title="What init writes"
        intro="The exact diff init produces on a fresh `npx create-expo-app` project."
      >
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>
            <code className="font-mono text-foreground">tailwind.config.js</code>
            {" "}— adds <code>presets: [require(&quot;@app-cn/ui/tailwind-preset&quot;)]</code>{" "}
            and content globs covering <code>./app</code>, <code>./components</code>.
          </li>
          <li>
            <code className="font-mono text-foreground">babel.config.js</code>
            {" "}— adds the <code>nativewind/babel</code> preset and ensures
            {" "}<code>react-native-worklets/plugin</code> (Reanimated 4) or
            {" "}<code>react-native-reanimated/plugin</code> (Reanimated 3) is{" "}
            <em>last</em> in the plugin list.
          </li>
          <li>
            <code className="font-mono text-foreground">metro.config.js</code>
            {" "}— wraps <code>getDefaultConfig</code> with{" "}
            <code>withNativeWind(..., {"{ input: \"./global.css\" }"})</code>.
            Aborts if an existing file does not match the expected shape.
          </li>
          <li>
            <code className="font-mono text-foreground">global.css</code>
            {" "}— Tailwind directives and the appCN CSS variables. Prints the
            one-line import to add to your app entry; never auto-edits{" "}
            <code>_layout.tsx</code>.
          </li>
          <li>
            <code className="font-mono text-foreground">components.json</code>
            {" "}— deep-merges{" "}
            <code>{`registries["@app-cn"]: "https://appcn.vercel.app/r/{name}.json"`}</code>{" "}
            and default <code>aliases</code>. Prompts on conflict; never
            overwrites existing keys without confirmation.
          </li>
          <li>
            <code className="font-mono text-foreground">tsconfig.json</code>
            {" "}— ensures <code>{`paths["@/*"]`}</code> resolves to{" "}
            <code>./*</code> for shadcn-style imports.
          </li>
        </ul>
      </Section>

      <Section
        title="Why a custom CLI?"
        intro="Couldn't you just point people at shadcn directly?"
      >
        <p className="text-sm text-muted-foreground">
          You can — that&apos;s the <em>shadcn (URL)</em> tab on every
          component page. The CLI exists for one job:{" "}
          <strong className="text-foreground">init</strong>. React Native + Expo
          have a non-trivial setup surface (NativeWind babel + metro + global
          CSS + Reanimated plugin ordering) that shadcn cannot do for you
          because it is React Native-agnostic. After init, the difference
          between <code className="font-mono">appcn add</code> and{" "}
          <code className="font-mono">shadcn add @app-cn/...</code> is just
          which tool runs the HEAD check.
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
      <h1 className="text-3xl font-bold tracking-tight">appCN CLI</h1>
      <p className="max-w-2xl text-muted-foreground">
        <code className="font-mono">@app-cn/cli</code> is a thin, RN-aware
        wrapper around the shadcn CLI. Two commands:{" "}
        <code className="font-mono">init</code> (one-shot project setup) and{" "}
        <code className="font-mono">add</code> (install a component).
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

function Callout({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4 text-sm text-foreground">
      <div className="mb-1.5 inline-block rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
        {title}
      </div>
      <p className="leading-7 text-muted-foreground">{children}</p>
    </div>
  );
}

import { promises as fs } from "node:fs";
import path from "node:path";

import { cancel, confirm, intro, isCancel, log, outro, spinner } from "@clack/prompts";
import { execa } from "execa";
import pc from "picocolors";

import { ensureRegistryEntry } from "../lib/components-json";
import { detectPackageManager, dlxCommand } from "../lib/pm";
import { REGISTRY_BASE_URL, headCheckRegistryItem } from "../lib/registry";

interface AddOptions {
  yes?: boolean;
}

export async function runAddCommand(slug: string, opts: AddOptions) {
  intro(`${pc.bold(pc.bgMagenta(" appcn "))} ${pc.dim("add")}`);

  const cwd = process.cwd();

  const lookup = spinner();
  lookup.start(`Looking up ${pc.cyan(slug)} on ${REGISTRY_BASE_URL}`);
  const exists = await headCheckRegistryItem(slug);
  if (!exists) {
    lookup.stop(pc.red(`Unknown component: ${slug}`));
    log.message(`Browse the catalog: ${pc.cyan("https://appcn.vercel.app/components")}`);
    cancel("Aborted");
    process.exit(1);
  }
  lookup.stop(`Found ${pc.green(slug)}`);

  const componentsJsonPath = path.join(cwd, "components.json");
  try {
    await fs.access(componentsJsonPath);
  } catch {
    log.warn("No components.json found in this project.");
    log.message(`Run ${pc.cyan("appcn init")} first to set up NativeWind + components.json.`);
    cancel("Aborted");
    process.exit(1);
  }

  const state = await ensureRegistryEntry(componentsJsonPath, opts.yes ?? false);
  if (state === "needs-prompt") {
    const ok = await confirm({
      message: `Add the ${pc.cyan('"@app-cn"')} registry entry to components.json?`,
      initialValue: true,
    });
    if (isCancel(ok) || ok === false) {
      cancel("Aborted — you can add the entry manually or run `appcn init`.");
      process.exit(1);
    }
    await ensureRegistryEntry(componentsJsonPath, true);
    log.success("Patched components.json");
  } else if (state === "patched") {
    log.success("Patched components.json");
  }

  const pm = await detectPackageManager(cwd);
  const dlx = dlxCommand(pm, "shadcn@latest");
  const args = [...dlx.slice(1), "add", `@app-cn/${slug}`];
  const cmd = dlx[0];
  if (!cmd) {
    cancel("Could not resolve a package manager command.");
    process.exit(1);
  }

  log.step(`${pc.dim("Running:")} ${pc.cyan(`${cmd} ${args.join(" ")}`)}`);

  try {
    await execa(cmd, args, { stdio: "inherit", cwd });
  } catch (err) {
    log.error(`shadcn add failed: ${(err as Error).message}`);
    process.exit(1);
  }

  outro(`${pc.green("✓")} Added ${pc.bold(slug)}`);
}

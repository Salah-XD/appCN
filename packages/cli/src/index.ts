import { Command } from "commander";

import { runAddCommand } from "./commands/add";
import { runInitCommand } from "./commands/init";

const program = new Command();

program
  .name("appcn")
  .description(
    "CLI for the appCN React Native component registry. Configures NativeWind + Reanimated and installs components through the shadcn add pipeline."
  )
  .version("0.1.0");

program
  .command("init")
  .description("Initialize the current Expo / React Native project for appCN.")
  .option("--lib", "Also add @app-cn/ui as a managed dependency.")
  .action((opts: { lib?: boolean }) => runInitCommand(opts));

program
  .command("add")
  .description("Install an appCN component into the current project.")
  .argument("<slug>", "Component slug, e.g. button or stream-bubble.")
  .option(
    "-y, --yes",
    "Skip confirmation prompts (auto-patch components.json)."
  )
  .action((slug: string, opts: { yes?: boolean }) => runAddCommand(slug, opts));

program.parseAsync(process.argv).catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});

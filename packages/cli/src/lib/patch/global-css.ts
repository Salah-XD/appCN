import { promises as fs } from "node:fs";
import path from "node:path";

export type GlobalCssResult =
  | { kind: "created"; filePath: string }
  | { kind: "ok"; filePath: string }
  | { kind: "needs-edit"; filePath: string; required: string[] };

const TEMPLATE = `@tailwind base;
@tailwind components;
@tailwind utilities;

/* appCN design tokens. Edit to match your brand. */
:root {
  --background: 0 0% 100%;
  --foreground: 240 10% 4%;
  --card: 0 0% 100%;
  --card-foreground: 240 10% 4%;
  --primary: 250 84% 60%;
  --primary-foreground: 0 0% 100%;
  --secondary: 240 5% 96%;
  --secondary-foreground: 240 6% 10%;
  --muted: 240 5% 96%;
  --muted-foreground: 240 4% 46%;
  --accent: 250 84% 60%;
  --accent-foreground: 0 0% 100%;
  --destructive: 0 72% 51%;
  --destructive-foreground: 0 0% 100%;
  --border: 240 6% 90%;
  --input: 240 6% 90%;
  --ring: 250 84% 60%;
}

.dark {
  --background: 240 10% 4%;
  --foreground: 0 0% 98%;
  --card: 240 8% 8%;
  --card-foreground: 0 0% 98%;
  --primary: 250 90% 66%;
  --primary-foreground: 240 10% 4%;
  --secondary: 240 6% 14%;
  --secondary-foreground: 0 0% 98%;
  --muted: 240 6% 14%;
  --muted-foreground: 240 5% 65%;
  --accent: 250 90% 66%;
  --accent-foreground: 240 10% 4%;
  --destructive: 0 72% 51%;
  --destructive-foreground: 0 0% 98%;
  --border: 240 6% 16%;
  --input: 240 6% 16%;
  --ring: 250 90% 66%;
}
`;

/**
 * Ensure global.css exists at the project root with the appCN token set.
 *
 * Never overwrites an existing global.css — only checks for the Tailwind
 * directives and the appCN variable signature. If they are missing, the
 * required additions are reported (additive — `:root` blocks may be merged
 * by the user without conflict).
 */
export async function ensureGlobalCss(cwd: string): Promise<GlobalCssResult> {
  const filePath = path.join(cwd, "global.css");
  try {
    await fs.access(filePath);
  } catch {
    await fs.writeFile(filePath, TEMPLATE, "utf8");
    return { kind: "created", filePath };
  }

  const source = await fs.readFile(filePath, "utf8");
  const required: string[] = [];
  if (!/@tailwind\s+base/.test(source)) {
    required.push("Add `@tailwind base; @tailwind components; @tailwind utilities;` at the top.");
  }
  if (!source.includes("--primary")) {
    required.push("Add the appCN CSS variables (--background, --foreground, --primary, …).");
  }
  if (required.length === 0) {
    return { kind: "ok", filePath };
  }
  return { kind: "needs-edit", filePath, required };
}

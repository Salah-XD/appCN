import { promises as fs } from "node:fs";
import path from "node:path";

import { applyEdits, modify, parse, type ParseError } from "jsonc-parser";

export type TsconfigResult =
  | { kind: "created"; filePath: string }
  | { kind: "ok"; filePath: string }
  | { kind: "patched"; filePath: string; added: string[] };

interface TsconfigShape {
  compilerOptions?: {
    baseUrl?: string;
    paths?: Record<string, string[]>;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

const TEMPLATE = `{
  "compilerOptions": {
    "strict": true,
    "moduleResolution": "node",
    "esModuleInterop": true,
    "jsx": "react-jsx",
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  }
}
`;

/**
 * Ensure tsconfig.json has the shadcn-style `@/*` path alias. shadcn writes
 * component imports as `@/lib/cn` (etc.); if the consumer's tsconfig lacks
 * the alias, those imports fail typecheck.
 *
 * The patch is conservative: it only touches `compilerOptions.baseUrl` and
 * `compilerOptions.paths["@/*"]`. Existing keys are left untouched, and
 * `jsonc-parser` preserves comments + trailing commas around the edit.
 */
export async function ensureTsconfigPaths(cwd: string): Promise<TsconfigResult> {
  const filePath = path.join(cwd, "tsconfig.json");
  let text: string;
  try {
    text = await fs.readFile(filePath, "utf8");
  } catch {
    await fs.writeFile(filePath, TEMPLATE, "utf8");
    return { kind: "created", filePath };
  }

  const errors: ParseError[] = [];
  const data = parse(text, errors, { allowTrailingComma: true }) as
    | TsconfigShape
    | undefined;
  if (errors.length > 0) {
    throw new Error(`Could not parse tsconfig.json (offset ${errors[0]!.offset})`);
  }

  const added: string[] = [];
  let next = text;
  const formattingOptions = { tabSize: 2, insertSpaces: true };

  if (!data?.compilerOptions?.baseUrl) {
    next = applyEdits(
      next,
      modify(next, ["compilerOptions", "baseUrl"], ".", { formattingOptions })
    );
    added.push('compilerOptions.baseUrl = "."');
  }

  const currentPaths = data?.compilerOptions?.paths ?? {};
  if (!currentPaths["@/*"]) {
    next = applyEdits(
      next,
      modify(next, ["compilerOptions", "paths", "@/*"], ["./*"], {
        formattingOptions,
      })
    );
    added.push('compilerOptions.paths["@/*"] = ["./*"]');
  }

  if (next === text) {
    return { kind: "ok", filePath };
  }
  await fs.writeFile(filePath, next, "utf8");
  return { kind: "patched", filePath, added };
}

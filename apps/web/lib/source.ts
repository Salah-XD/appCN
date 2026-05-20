import "server-only";
import fs from "node:fs";
import path from "node:path";

/** Read a component's source from packages/ui at build time (for the Code tab). */
export function readComponentSource(sourcePath: string): string {
  try {
    return fs.readFileSync(path.resolve(process.cwd(), sourcePath), "utf8");
  } catch {
    return "// source unavailable at build time";
  }
}

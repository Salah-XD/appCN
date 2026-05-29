// Keep packages/mcp/server.json in lockstep with the @app-cn/mcp npm version.
//
// The official MCP Registry requires server.json's `version` (and the npm
// package entry's `version`) to equal the published npm version. Changesets
// only bumps package.json, so this script mirrors that bump into server.json.
//
// Wired into the root `version-packages` script (runs inside the Changesets
// "Version Packages" PR, so the bump is committed) and re-run defensively in
// release.yml before the registry publish.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pkgPath = join(root, "packages", "mcp", "package.json");
const serverPath = join(root, "packages", "mcp", "server.json");

const { version } = JSON.parse(readFileSync(pkgPath, "utf8"));
const server = JSON.parse(readFileSync(serverPath, "utf8"));

let changed = false;
if (server.version !== version) {
  server.version = version;
  changed = true;
}
for (const pkg of server.packages ?? []) {
  if (pkg.identifier === "@app-cn/mcp" && pkg.version !== version) {
    pkg.version = version;
    changed = true;
  }
}

if (changed) {
  writeFileSync(serverPath, `${JSON.stringify(server, null, 2)}\n`);
  console.log(`synced packages/mcp/server.json -> ${version}`);
} else {
  console.log(`packages/mcp/server.json already at ${version}`);
}

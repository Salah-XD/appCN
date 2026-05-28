import { promises as fs } from "node:fs";
import path from "node:path";

export type ProjectKind = "expo" | "bare-rn" | "unknown";

export interface ProjectInfo {
  cwd: string;
  pkgPath: string;
  pkg: ProjectPackageJson;
  kind: ProjectKind;
  reanimatedMajor: 3 | 4 | null;
  hasExpoHaptics: boolean;
}

interface DepRecord {
  [name: string]: string;
}

export interface ProjectPackageJson {
  name?: string;
  dependencies?: DepRecord;
  devDependencies?: DepRecord;
  peerDependencies?: DepRecord;
  [key: string]: unknown;
}

export async function readProjectInfo(cwd: string): Promise<ProjectInfo> {
  const pkgPath = path.join(cwd, "package.json");
  let raw: string;
  try {
    raw = await fs.readFile(pkgPath, "utf8");
  } catch {
    throw new Error(
      `No package.json in ${cwd}. Run \`appcn init\` from the root of an Expo or React Native project.`
    );
  }
  const pkg = JSON.parse(raw) as ProjectPackageJson;
  const kind = detectKind(pkg);
  const reanimatedMajor = detectReanimatedMajor(pkg);
  return {
    cwd,
    pkgPath,
    pkg,
    kind,
    reanimatedMajor,
    hasExpoHaptics: hasDep(pkg, "expo-haptics"),
  };
}

function detectKind(pkg: ProjectPackageJson): ProjectKind {
  if (hasDep(pkg, "expo")) return "expo";
  if (hasDep(pkg, "react-native")) return "bare-rn";
  return "unknown";
}

export function hasDep(pkg: ProjectPackageJson, name: string): boolean {
  return Boolean(
    pkg.dependencies?.[name] ??
      pkg.devDependencies?.[name] ??
      pkg.peerDependencies?.[name]
  );
}

export function depRange(pkg: ProjectPackageJson, name: string): string | null {
  return (
    pkg.dependencies?.[name] ??
    pkg.devDependencies?.[name] ??
    pkg.peerDependencies?.[name] ??
    null
  );
}

/**
 * Returns the major version of react-native-reanimated declared in package.json.
 * v4 requires `react-native-worklets/plugin`; v3 uses `react-native-reanimated/plugin`.
 * Returns null if reanimated is not declared.
 */
function detectReanimatedMajor(pkg: ProjectPackageJson): 3 | 4 | null {
  const range = depRange(pkg, "react-native-reanimated");
  if (!range) return null;
  // Strip leading ^ ~ >= = etc. Match the first integer.
  const match = range.match(/(\d+)/);
  if (!match) return null;
  const major = Number(match[1]);
  if (major === 4) return 4;
  if (major === 3) return 3;
  return null;
}

/**
 * Data access for the appCN MCP server.
 *
 * The server is a thin, live-fetch layer over the published appCN registry —
 * exactly like @app-cn/cli. It holds no bundled component data, so newly
 * published components show up the moment the docs site redeploys. Two
 * endpoints back it:
 *
 *   - `/r/catalog.json`  — the appCN-specific superset: every component's rich
 *     meta (anatomy, delight, props, examples, a11y) plus the design guide.
 *     Produced by `apps/web/app/r/catalog.json/route.ts`. Keep the `Catalog`
 *     shape below in sync with that route.
 *   - `/r/<item>.json`   — the standard shadcn registry item: source file
 *     contents + npm `dependencies` + `registryDependencies`. Fetched on demand
 *     by `get_component`.
 */

/**
 * Base URL of the appCN registry. Defaults to the deployed Vercel URL; override
 * with APPCN_REGISTRY_URL when working against a local docs build. Mirrors the
 * env var @app-cn/cli reads, so both tools point at the same place.
 */
export const REGISTRY_BASE_URL = (
  process.env.APPCN_REGISTRY_URL ?? "https://appcn.vercel.app/r"
).replace(/\/+$/, "");

const FETCH_TIMEOUT_MS = 10_000;

// ── Catalog shape (mirror of /r/catalog.json) ────────────────────────────────

export interface PropDoc {
  name: string;
  type: string;
  default?: string;
  required?: boolean;
  description: string;
}

export interface ExampleDoc {
  title: string;
  description?: string;
  code: string;
}

export interface CatalogComponent {
  slug: string;
  title: string;
  category: "base" | "ai";
  description: string;
  anatomy: string;
  delight: string;
  props: PropDoc[];
  examples: ExampleDoc[];
  a11y: string[];
  /** Registry item name — served at `/r/<registryItem>.json`. Usually === slug. */
  registryItem: string;
  addedAt?: string;
  updatedAt?: string;
}

export interface DesignGuide {
  philosophy: string[];
  motion: {
    durations: Record<string, number>;
    easings: string[];
    springs: string[];
    pressScale: number;
    rules: string[];
  };
  haptics: string;
  variants: string[];
  accessibility: string[];
  doNot: string[];
}

export interface Catalog {
  name: string;
  homepage: string;
  registryBaseUrl: string;
  components: CatalogComponent[];
  designGuide: DesignGuide;
}

// ── Registry item shape (shadcn build output) ─────────────────────────────────

export interface RegistryFile {
  path?: string;
  type?: string;
  target?: string;
  content?: string;
}

export interface RegistryItem {
  name: string;
  type: string;
  title?: string;
  description?: string;
  dependencies?: string[];
  registryDependencies?: string[];
  files?: RegistryFile[];
}

// ── Fetching (cached per process) ─────────────────────────────────────────────

async function fetchJson<T>(url: string): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText} for ${url}`);
    }
    return (await res.json()) as T;
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error(`Request to ${url} timed out after ${FETCH_TIMEOUT_MS}ms`);
    }
    throw new Error(
      `Failed to fetch ${url}: ${err instanceof Error ? err.message : String(err)}`,
    );
  } finally {
    clearTimeout(timer);
  }
}

let catalogPromise: Promise<Catalog> | undefined;
const itemCache = new Map<string, Promise<RegistryItem>>();

/** Fetch (and memoize) the full appCN catalog. */
export function getCatalog(): Promise<Catalog> {
  if (!catalogPromise) {
    catalogPromise = fetchJson<Catalog>(`${REGISTRY_BASE_URL}/catalog.json`).catch(
      (err) => {
        // Reset so a transient failure doesn't poison the cache for the session.
        catalogPromise = undefined;
        throw err;
      },
    );
  }
  return catalogPromise;
}

/** Fetch (and memoize) one shadcn registry item, including file contents. */
export function getRegistryItem(name: string): Promise<RegistryItem> {
  let cached = itemCache.get(name);
  if (!cached) {
    cached = fetchJson<RegistryItem>(`${REGISTRY_BASE_URL}/${name}.json`).catch(
      (err) => {
        itemCache.delete(name);
        throw err;
      },
    );
    itemCache.set(name, cached);
  }
  return cached;
}

/** Look up a single component's meta by slug. */
export async function findComponent(
  slug: string,
): Promise<CatalogComponent | undefined> {
  const catalog = await getCatalog();
  return catalog.components.find((c) => c.slug === slug);
}

/**
 * Base URL of the appCN registry. Defaults to the deployed Vercel URL; can be
 * overridden with APPCN_REGISTRY_URL when working against a local docs build.
 */
export const REGISTRY_BASE_URL =
  process.env.APPCN_REGISTRY_URL ?? "https://appcn.vercel.app/r";

/** HEAD-check a registry slug. Returns true if the JSON exists. */
export async function headCheckRegistryItem(slug: string): Promise<boolean> {
  const url = `${REGISTRY_BASE_URL}/${slug}.json`;
  try {
    const res = await fetch(url, { method: "HEAD" });
    return res.ok;
  } catch {
    return false;
  }
}

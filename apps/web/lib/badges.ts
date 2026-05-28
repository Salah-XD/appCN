import type { ComponentMeta } from "@app-cn/ui/lib/meta";

const DAY_MS = 86_400_000;
const NEW_WINDOW_DAYS = 30;
const UPDATED_WINDOW_DAYS = 14;

export type ComponentBadge = "new" | "updated";

/**
 * Compute which freshness badge to show beside a component, if any.
 *
 * - `addedAt` within 30 days → "new"
 * - `updatedAt` newer than `addedAt` and within 14 days → "updated"
 *
 * Dates are read as ISO strings (yyyy-mm-dd) from `ComponentMeta`. Pass `now`
 * to make tests deterministic; defaults to `Date.now()`.
 */
export function getBadge(
  meta: Pick<ComponentMeta, "addedAt" | "updatedAt">,
  now: number = Date.now()
): ComponentBadge | null {
  const added = meta.addedAt ? Date.parse(meta.addedAt) : null;
  const updated = meta.updatedAt ? Date.parse(meta.updatedAt) : null;

  if (added !== null && now - added < NEW_WINDOW_DAYS * DAY_MS) {
    return "new";
  }
  if (
    updated !== null &&
    now - updated < UPDATED_WINDOW_DAYS * DAY_MS &&
    (added === null || updated > added)
  ) {
    return "updated";
  }
  return null;
}

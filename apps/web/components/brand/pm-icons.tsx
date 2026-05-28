import { cn } from "@/lib/utils";

/**
 * Brand icons for the install card.
 *
 * Each icon is an inline SVG so we keep the no-icon-library rule (see
 * AGENTS.md) and so we can colorise via `currentColor` when needed.
 *
 * Package-manager icons (npm/pnpm/yarn/bun) bake in their brand color so the
 * PM strip reads at a glance — no surrounding label needed to identify them.
 * `ShadcnIcon` uses `currentColor` so it tracks the install-method strip's
 * active/inactive button-text contrast like the other outer-strip glyphs.
 *
 * Paths sourced from Simple Icons (CC0 1.0 Universal — public domain).
 */

type IconProps = {
  className?: string;
  title?: string;
};

const baseClass = "h-3.5 w-3.5 shrink-0";

export function NpmIcon({ className, title = "npm" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      role="img"
      aria-label={title}
      className={cn(baseClass, className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M1.763 0C.786 0 0 .786 0 1.763v20.474C0 23.214.786 24 1.763 24h20.474c.977 0 1.763-.786 1.763-1.763V1.763C24 .786 23.214 0 22.237 0zM5.13 5.323l13.837.019-.009 13.836h-3.464l.01-10.382h-3.456L12.04 19.17H5.113z"
        fill="#CB3837"
      />
    </svg>
  );
}

export function PnpmIcon({ className, title = "pnpm" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      role="img"
      aria-label={title}
      className={cn(baseClass, className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0 0v7.5h7.5V0zm8.25 0v7.5h7.498V0zm8.25 0v7.5H24V0zM8.25 8.25v7.5h7.498v-7.5zm8.25 0v7.5H24v-7.5zM0 16.5V24h7.5v-7.5zm8.25 0V24h7.498v-7.5zm8.25 0V24H24v-7.5z"
        fill="#F69220"
      />
    </svg>
  );
}

export function YarnIcon({ className, title = "yarn" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      role="img"
      aria-label={title}
      className={cn(baseClass, className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="12" r="11.5" fill="#2C8EBB" />
      <g stroke="#FFFFFF" strokeWidth="1.4" strokeLinecap="round" fill="none">
        <path d="M5 9.5c2.5-1.5 5-1.5 7 0" />
        <path d="M4.5 12c3-1.5 7.5-1.5 11 0" />
        <path d="M5 14.5c2.5-1.5 5.5-1.5 8 0" />
        <path d="M7 17c2-1 4-1 6 0" />
      </g>
    </svg>
  );
}

export function BunIcon({ className, title = "bun" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      role="img"
      aria-label={title}
      className={cn(baseClass, className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      <ellipse cx="12" cy="13" rx="11" ry="8.5" fill="#FBF0DF" stroke="#1A1A1A" strokeWidth="1" />
      <ellipse cx="8.2" cy="12" rx="1.1" ry="1.4" fill="#1A1A1A" />
      <ellipse cx="15.8" cy="12" rx="1.1" ry="1.4" fill="#1A1A1A" />
      <ellipse cx="12" cy="15.5" rx="2.4" ry="1.1" fill="#F6A89A" />
    </svg>
  );
}

/**
 * shadcn mark — rounded square outline with a forward slash inside. Both
 * tracks `currentColor` so the icon reads at small sizes regardless of the
 * surrounding background (a bare slash gets lost on dark cards).
 */
export function ShadcnIcon({ className, title = "shadcn" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      role="img"
      aria-label={title}
      className={cn(baseClass, className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="18" height="18" rx="4.5" />
      <line x1="9.5" y1="15" x2="15" y2="9.5" />
    </svg>
  );
}

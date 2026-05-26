import { cn } from "@/lib/utils";

/**
 * appCN brand mark — stylized phone silhouette with motion lines streaming
 * out the right. Recreated from the brand sheet as inline SVG so it scales
 * cleanly and can be animated/recolored via currentColor.
 */
export function LogoMark({
  className,
  title = "appCN",
}: {
  className?: string;
  title?: string;
}) {
  return (
    <svg
      viewBox="0 0 64 64"
      role="img"
      aria-label={title}
      className={cn("text-foreground", className)}
      fill="none"
    >
      {/* Phone body — tilted slightly forward */}
      <g transform="translate(8 6)">
        <rect
          x="2"
          y="2"
          width="24"
          height="44"
          rx="6"
          stroke="currentColor"
          strokeWidth="3"
          fill="none"
        />
        {/* Notch / speaker hint */}
        <rect
          x="10"
          y="6"
          width="8"
          height="1.5"
          rx="0.75"
          fill="currentColor"
          opacity="0.5"
        />
        {/* Screen highlight */}
        <rect
          x="6"
          y="11"
          width="16"
          height="22"
          rx="2"
          fill="currentColor"
          opacity="0.08"
        />
      </g>

      {/* Motion lines emanating right */}
      <g stroke="currentColor" strokeLinecap="round" strokeWidth="3">
        <line x1="40" y1="20" x2="56" y2="20" />
        <line x1="44" y1="32" x2="58" y2="32" opacity="0.75" />
        <line x1="42" y1="44" x2="54" y2="44" opacity="0.5" />
      </g>
    </svg>
  );
}

/**
 * appCN full logo — mark + wordmark. Uses currentColor for the mark,
 * keeps the "CN" emphasised. Use this in the header and large hero contexts.
 */
export function LogoWordmark({
  className,
  size = "default",
}: {
  className?: string;
  size?: "default" | "sm" | "lg";
}) {
  const dims = {
    sm: { mark: "h-5 w-5", text: "text-base" },
    default: { mark: "h-7 w-7", text: "text-xl" },
    lg: { mark: "h-10 w-10", text: "text-3xl" },
  }[size];

  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark className={dims.mark} />
      <span className={cn("font-semibold tracking-tight", dims.text)}>
        app<span className="font-bold">CN</span>
      </span>
    </span>
  );
}

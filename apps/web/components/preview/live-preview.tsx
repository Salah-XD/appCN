import { cn } from "@/lib/utils";

/**
 * A small phone-frame holding a live iframe into the Expo showcase web build.
 * Used on the landing — same rendering path as the docs Preview tab, so what
 * you see here is what runs on the phone.
 *
 * Pass `bare` to render only the iframe (when an outer frame is already provided).
 */
export function LivePreview({
  slug,
  showcaseWebUrl,
  className,
  title,
  bare = false,
}: {
  slug: string;
  showcaseWebUrl: string;
  className?: string;
  /** Accessible iframe title (defaults to the slug). */
  title?: string;
  /** Skip the bezel — useful when wrapped by a larger phone frame. */
  bare?: boolean;
}) {
  const src = `${showcaseWebUrl}/c/${slug}`;
  if (bare) {
    return (
      <iframe
        src={src}
        title={title ?? `${slug} live preview`}
        loading="lazy"
        className={cn("aspect-[9/19] w-full border-0", className)}
      />
    );
  }
  return (
    <div className={cn("mx-auto w-full max-w-[320px]", className)}>
      <div className="relative aspect-[9/19] overflow-hidden rounded-[2.25rem] border-[10px] border-zinc-800 bg-background shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6)]">
        <iframe
          src={src}
          title={title ?? `${slug} live preview`}
          loading="lazy"
          className="h-full w-full border-0"
        />
      </div>
    </div>
  );
}

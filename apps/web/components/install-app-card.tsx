import { QRCodeSVG } from "qrcode.react";

import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/config";

type Variant = "wide" | "compact";

export function InstallAppCard({
  variant = "wide",
  className,
}: {
  variant?: Variant;
  className?: string;
}) {
  const { expoGoQrUrl } = siteConfig;

  return (
    <div
      className={cn(
        "rounded-3xl border border-border bg-card",
        variant === "wide"
          ? "grid gap-6 p-6 md:grid-cols-[1.1fr_0.9fr] md:items-center md:gap-10 md:p-8"
          : "p-5",
        className,
      )}
    >
      <div className="space-y-3">
        <p className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          <SmartphoneIcon className="h-3 w-3 text-primary" />
          Mobile preview app
        </p>
        <h3 className="text-xl font-bold tracking-tight md:text-2xl">
          Run every component on your phone.
        </h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Scan the QR with <strong className="text-foreground">Expo Go</strong>{" "}
          and the entire appCN gallery loads on Android or iPhone in seconds —
          real gestures, real motion, identical to what ships in your project.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <a
            href={expoGoQrUrl || "https://expo.dev/go"}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-3 rounded-2xl bg-foreground px-4 py-2.5 text-sm font-semibold text-background transition-colors hover:bg-foreground/90"
          >
            <span className="h-5 w-5">
              <ExpoIcon />
            </span>
            <span className="flex flex-col items-start leading-tight">
              <span className="text-[10px] font-medium uppercase tracking-wider opacity-70">
                Open in
              </span>
              <span className="text-sm">Expo Go</span>
            </span>
          </a>

          <span
            aria-label="Play Store release coming soon"
            className="inline-flex items-center gap-3 rounded-2xl border border-dashed border-border bg-background/40 px-4 py-2.5 text-sm font-semibold text-muted-foreground"
          >
            <span className="h-5 w-5 opacity-60">
              <PlayStoreIcon />
            </span>
            <span className="flex flex-col items-start leading-tight">
              <span className="text-[10px] font-medium uppercase tracking-wider opacity-70">
                Google Play
              </span>
              <span className="text-sm">Coming soon</span>
            </span>
          </span>
        </div>

        <p className="pt-2 text-xs text-muted-foreground/80">
          Don&apos;t have Expo Go? Grab it free from the{" "}
          <a
            href="https://apps.apple.com/app/expo-go/id982107779"
            target="_blank"
            rel="noreferrer"
            className="underline-offset-4 hover:text-foreground hover:underline"
          >
            App Store
          </a>{" "}
          or{" "}
          <a
            href="https://play.google.com/store/apps/details?id=host.exp.exponent"
            target="_blank"
            rel="noreferrer"
            className="underline-offset-4 hover:text-foreground hover:underline"
          >
            Play Store
          </a>
          .
        </p>
      </div>

      {variant === "wide" ? (
        <div className="flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-border/60 bg-background/50 p-5">
            <div
              className={cn(
                "rounded-xl bg-white p-3",
                !expoGoQrUrl && "opacity-50",
              )}
            >
              <QRCodeSVG
                value={expoGoQrUrl || "https://appcn.vercel.app/docs/mobile-app"}
                size={140}
              />
            </div>
            <p className="max-w-[180px] text-center text-xs text-muted-foreground">
              {expoGoQrUrl
                ? "Scan with Expo Go on Android or iPhone"
                : "QR live as soon as the Expo channel publishes"}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function SmartphoneIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
      <path d="M12 18h.01" />
    </svg>
  );
}

function PlayStoreIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M3 2.5v19l8.5-9.5L3 2.5zm9.6 9.5L4.7 3.6l11.4 6.6-3.5 1.8zM4.7 20.4l7.9-8.4 3.5 1.8-11.4 6.6zm12.6-7.1 3.4-2c.6-.4.6-1.2 0-1.6l-3.4-2-3.8 2.2 3.8 2.4z" />
    </svg>
  );
}

function ExpoIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M11.3 5.4c.2-.3.5-.4.7-.4h.1c.3 0 .5.1.7.4l9 14.5c.4.6-.1 1.4-.9 1.4H3.1c-.8 0-1.3-.8-.9-1.4l9.1-14.5zM12 8 4.8 19.3h14.4L12 8z" />
    </svg>
  );
}

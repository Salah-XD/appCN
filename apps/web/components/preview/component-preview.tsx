"use client";

import * as React from "react";
import { QRCodeSVG } from "qrcode.react";

import { CopyButton } from "@/components/ui/copy-button";
import { siteConfig } from "@/lib/config";

type Tab = "phone" | "web" | "video" | "code";

const TABS: { id: Tab; label: string }[] = [
  { id: "phone", label: "Phone (QR)" },
  { id: "web", label: "Web" },
  { id: "video", label: "Video" },
  { id: "code", label: "Code" },
];

export function ComponentPreview({
  slug,
  source,
  installCommand,
  showcaseWebUrl,
  expoUrl,
}: {
  slug: string;
  source: string;
  installCommand: string;
  showcaseWebUrl: string;
  expoUrl: string;
}) {
  const [tab, setTab] = React.useState<Tab>("phone");

  const webSrc = `${showcaseWebUrl}/c/${slug}`;
  const universalLink = `${siteConfig.docsOrigin}/components/${slug}`;
  // Priority order — what the QR encodes:
  //   1. expoUrl (LAN dev, e.g. exp://192.168.x.x:8081) → deep-links into Expo Go
  //   2. expoGoQrUrl (production Expo Go channel) → loads the published project
  //   3. universalLink → graceful fallback (today: this docs page; later when
  //      the Play Store build ships, an Android App Link into the installed app)
  const phoneLink = expoUrl
    ? `${expoUrl}/--/components/${slug}`
    : siteConfig.expoGoQrUrl || universalLink;

  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-card">
      {/* Tab bar */}
      <div className="flex items-center gap-1 border-b border-border bg-background/40 p-1.5">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={
              "rounded-xl px-3 py-1.5 text-sm font-medium transition-colors " +
              (tab === t.id
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:text-foreground")
            }
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="p-6">
        {tab === "phone" && (
          <PhoneTab phoneLink={phoneLink} hasExpoUrl={!!expoUrl} />
        )}
        {tab === "web" && <WebTab webSrc={webSrc} />}
        {tab === "video" && <VideoTab slug={slug} />}
        {tab === "code" && (
          <CodeTab source={source} installCommand={installCommand} />
        )}
      </div>
    </div>
  );
}

/** A tall device frame for the web iframe + video. */
function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[360px]">
      <div className="relative aspect-[9/19] overflow-hidden rounded-[2.5rem] border-[10px] border-zinc-800 bg-background shadow-2xl">
        {children}
      </div>
    </div>
  );
}

function PhoneTab({
  phoneLink,
  hasExpoUrl,
}: {
  phoneLink: string;
  hasExpoUrl: boolean;
}) {
  const { expoGoQrUrl } = siteConfig;
  return (
    <div className="flex flex-col items-center gap-5 py-4 text-center">
      <div className="rounded-2xl bg-white p-4">
        <QRCodeSVG value={phoneLink} size={180} />
      </div>
      <div className="max-w-sm space-y-1">
        <p className="font-medium text-foreground">
          Scan with Expo Go to run it live
        </p>
        <p className="text-sm text-muted-foreground">
          Install <strong className="text-foreground">Expo Go</strong> on
          Android or iPhone, scan, and the entire appCN gallery loads — real
          native motion &amp; gestures, not a web shim.
        </p>
        {hasExpoUrl && (
          <p className="pt-2 text-xs text-muted-foreground/80">
            Dev mode: <code className="text-primary">NEXT_PUBLIC_EXPO_URL</code>{" "}
            is set — the QR points at your LAN Expo server.
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
        <a
          href={expoGoQrUrl || "/docs/mobile-app"}
          target={expoGoQrUrl ? "_blank" : undefined}
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-foreground px-3.5 py-2 text-xs font-semibold text-background transition-colors hover:bg-foreground/90"
        >
          <ExpoBadgeIcon /> Open in Expo Go
        </a>
        <span className="inline-flex items-center gap-2 rounded-full border border-dashed border-border bg-background/40 px-3.5 py-2 text-xs font-semibold text-muted-foreground">
          <PlayBadgeIcon /> Play Store — coming soon
        </span>
      </div>

      <code className="break-all rounded-lg bg-background px-3 py-2 text-xs text-muted-foreground">
        {phoneLink}
      </code>
    </div>
  );
}

function PlayBadgeIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M3 2.5v19l8.5-9.5L3 2.5zm9.6 9.5L4.7 3.6l11.4 6.6-3.5 1.8zM4.7 20.4l7.9-8.4 3.5 1.8-11.4 6.6zm12.6-7.1 3.4-2c.6-.4.6-1.2 0-1.6l-3.4-2-3.8 2.2 3.8 2.4z" />
    </svg>
  );
}

function ExpoBadgeIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M11.3 5.4c.2-.3.5-.4.7-.4h.1c.3 0 .5.1.7.4l9 14.5c.4.6-.1 1.4-.9 1.4H3.1c-.8 0-1.3-.8-.9-1.4l9.1-14.5zM12 8 4.8 19.3h14.4L12 8z" />
    </svg>
  );
}

function WebTab({ webSrc }: { webSrc: string }) {
  return (
    <div className="space-y-3">
      <PhoneFrame>
        <iframe
          src={webSrc}
          title="Component preview"
          className="h-full w-full border-0"
        />
      </PhoneFrame>
      <p className="text-center text-xs text-muted-foreground">
        Rendered by the Expo showcase via react-native-web. Run{" "}
        <code className="text-primary">pnpm --filter showcase web</code> if this
        is blank.
      </p>
    </div>
  );
}

function VideoTab({ slug }: { slug: string }) {
  const [failed, setFailed] = React.useState(false);
  return (
    <PhoneFrame>
      {failed ? (
        <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center">
          <p className="text-sm font-medium text-foreground">No video yet</p>
          <p className="text-xs text-muted-foreground">
            Drop a screen recording at{" "}
            <code className="text-primary">public/videos/{slug}.mp4</code>.
          </p>
        </div>
      ) : (
        <video
          className="h-full w-full object-cover"
          controls
          playsInline
          muted
          loop
          onError={() => setFailed(true)}
          src={`/videos/${slug}.mp4`}
        />
      )}
    </PhoneFrame>
  );
}

function CodeTab({
  source,
  installCommand,
}: {
  source: string;
  installCommand: string;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-xl border border-border bg-background px-3 py-2">
        <code className="truncate text-sm text-foreground">
          {installCommand}
        </code>
        <CopyButton value={installCommand} />
      </div>
      <div className="relative rounded-xl border border-border bg-background">
        <div className="absolute right-2 top-2">
          <CopyButton value={source} />
        </div>
        <pre className="max-h-[480px] overflow-auto p-4 text-[13px] leading-relaxed">
          <code className="font-mono text-foreground">{source}</code>
        </pre>
      </div>
    </div>
  );
}

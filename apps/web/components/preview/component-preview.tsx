"use client";

import * as React from "react";
import { QRCodeSVG } from "qrcode.react";

import { CopyButton } from "@/components/ui/copy-button";

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
  const phoneLink = expoUrl ? `${expoUrl}/--/c/${slug}` : webSrc;

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
  return (
    <div className="flex flex-col items-center gap-5 py-4 text-center">
      <div className="rounded-2xl bg-white p-4">
        <QRCodeSVG value={phoneLink} size={180} />
      </div>
      <div className="max-w-sm space-y-1">
        <p className="font-medium text-foreground">
          Scan to run it on your real phone
        </p>
        <p className="text-sm text-muted-foreground">
          Open the Camera or Expo Go app and scan — the component runs live on
          your device with real native motion &amp; gestures.
        </p>
        {!hasExpoUrl && (
          <p className="pt-2 text-xs text-muted-foreground/80">
            Tip: set <code className="text-primary">NEXT_PUBLIC_EXPO_URL</code>{" "}
            (e.g. <code>exp://192.168.x.x:8081</code>) to deep-link straight into
            Expo Go.
          </p>
        )}
      </div>
      <code className="break-all rounded-lg bg-background px-3 py-2 text-xs text-muted-foreground">
        {phoneLink}
      </code>
    </div>
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

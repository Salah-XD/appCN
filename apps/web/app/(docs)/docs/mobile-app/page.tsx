import Link from "next/link";

import { siteConfig } from "@/lib/config";
import { InstallAppCard } from "@/components/install-app-card";

export const metadata = {
  title: "Mobile app — appCN",
  description:
    "Run every appCN component on your phone via Expo Go (Android + iOS). Play Store standalone release coming soon.",
};

export default function MobileAppPage() {
  return (
    <main className="mx-auto w-full max-w-3xl space-y-12 px-5 py-10">
      <header className="space-y-3">
        <Link
          href="/components"
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          ← Components
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">
          The appCN mobile app
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          Live now in <strong className="text-foreground">Expo Go</strong> on
          Android &amp; iPhone. A standalone Play Store APK is in review — link
          goes live here the moment it ships.
        </p>
      </header>

      <InstallAppCard />

      <Section
        title="Get started — 30 seconds"
        intro="One install, one scan, one tap. No emulator, no developer account."
      >
        <ol className="list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
          <li>
            Install <strong className="text-foreground">Expo Go</strong> from
            the{" "}
            <a
              href="https://play.google.com/store/apps/details?id=host.exp.exponent"
              target="_blank"
              rel="noreferrer"
              className="text-primary underline-offset-4 hover:underline"
            >
              Play Store
            </a>{" "}
            (Android) or{" "}
            <a
              href="https://apps.apple.com/app/expo-go/id982107779"
              target="_blank"
              rel="noreferrer"
              className="text-primary underline-offset-4 hover:underline"
            >
              App Store
            </a>{" "}
            (iPhone). Free.
          </li>
          <li>
            Scan the QR above with Expo Go&apos;s scanner. The appCN gallery
            loads.
          </li>
          <li>
            Tap any component — Button, VoiceSphere, StreamBubble — and feel
            the real motion and gestures running natively.
          </li>
        </ol>
        <p className="text-sm text-muted-foreground">
          Same code path that ships in your project. What you feel in Expo Go
          is exactly what your users will feel.
        </p>
      </Section>

      <Section
        title="Why Expo Go first"
        intro="Store distribution takes time. Previews shouldn't."
      >
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>
            <strong className="text-foreground">Both platforms, today.</strong>{" "}
            Expo Go runs the same project on Android and iOS — no app review,
            no waiting on TestFlight.
          </li>
          <li>
            <strong className="text-foreground">Always current.</strong> Every
            change to <code className="font-mono">apps/showcase</code> or{" "}
            <code className="font-mono">packages/ui</code> ships an OTA update
            via{" "}
            <a
              href="https://docs.expo.dev/eas-update/introduction/"
              target="_blank"
              rel="noreferrer"
              className="text-primary underline-offset-4 hover:underline"
            >
              EAS Update
            </a>
            . Open Expo Go after a change and you see the new bundle.
          </li>
          <li>
            <strong className="text-foreground">Identical code path.</strong>{" "}
            Expo Go runs the actual <code className="font-mono">@app-cn/ui</code>{" "}
            primitives — same Reanimated, same gesture-handler, same NativeWind.
            The Play Store build will be the same JS shipped as a standalone
            binary.
          </li>
        </ul>
      </Section>

      <Section
        title="Coming soon — Play Store"
        intro={`A signed Android binary (package id: ${
          "digital.shineup.appcn"
        }).`}
      >
        <p className="text-sm text-muted-foreground">
          The standalone Android app is currently in Play Console review. When
          it lands, the{" "}
          <strong className="text-foreground">Get on Google Play</strong>{" "}
          button replaces the &quot;coming soon&quot; pill across the site,
          and tapping a component URL like{" "}
          <code className="font-mono">
            {siteConfig.docsOrigin}/components/voice-sphere
          </code>{" "}
          deep-links straight into the installed app — no Expo Go required.
        </p>
        <p className="text-sm text-muted-foreground">
          iOS App Store distribution requires an Apple Developer Account and
          is on a longer horizon. Expo Go on iPhone is the recommended path
          for the foreseeable future.
        </p>
      </Section>

      <footer className="pt-4 text-sm text-muted-foreground">
        Found a bug?{" "}
        <Link
          href={`${siteConfig.github}/issues`}
          className="text-primary underline-offset-4 hover:underline"
        >
          Open an issue
        </Link>
        .
      </footer>
    </main>
  );
}

function Section({
  title,
  intro,
  children,
}: {
  title: string;
  intro: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div className="space-y-1.5">
        <h2 className="text-xl font-bold tracking-tight">{title}</h2>
        <p className="text-sm text-muted-foreground">{intro}</p>
      </div>
      {children}
    </section>
  );
}

const isDev = process.env.NODE_ENV === "development";

export const siteConfig = {
  name: "appCN",
  tagline: "Copy-paste mobile components for React Native.",
  description:
    "Beautiful, motion-first React Native components you own — NativeWind-styled, installed via the shadcn CLI, with a featured AI-native collection.",
  github: "https://github.com/Salah-XD/appCN",
  /**
   * Expo showcase web build. In local dev defaults to the Metro web server on
   * :8081; in production defaults to the deployed showcase. Override either
   * with NEXT_PUBLIC_SHOWCASE_WEB_URL.
   */
  showcaseWebUrl:
    process.env.NEXT_PUBLIC_SHOWCASE_WEB_URL ??
    (isDev ? "http://localhost:8081" : "https://appcn-showcase.vercel.app"),
  /**
   * Expo Go deep-link base for QR previews, e.g. "exp://192.168.1.20:8081".
   * Empty in dev until you point it at your machine / an EAS Update channel.
   */
  expoUrl: process.env.NEXT_PUBLIC_EXPO_URL ?? "",
  /**
   * Where the built registry JSON is served from. Always the public URL —
   * install commands in the docs need to be copy-pasteable into any project,
   * not just one running on the local dev server. Override via
   * NEXT_PUBLIC_REGISTRY_URL when working against a local registry.
   */
  registryBaseUrl:
    process.env.NEXT_PUBLIC_REGISTRY_URL ?? "https://appcn.vercel.app/r",
  /**
   * Google Play listing for the appCN mobile preview app
   * (digital.shineup.appcn). Set via NEXT_PUBLIC_PLAY_STORE_URL after first
   * Play Console publish.
   */
  playStoreUrl:
    process.env.NEXT_PUBLIC_PLAY_STORE_URL ??
    "https://play.google.com/store/apps/details?id=digital.shineup.appcn",
  /**
   * EAS-generated qr.expo.dev short link for the production update channel.
   * iPhone users scan this with Expo Go to load appCN. Empty until first
   * `eas update --branch production` run produces a sharable link from the
   * EAS dashboard — set NEXT_PUBLIC_EXPO_GO_URL in Vercel after that.
   */
  expoGoQrUrl: process.env.NEXT_PUBLIC_EXPO_GO_URL ?? "",
  /** Origin used to build Universal/App Link QR codes for the docs site. */
  docsOrigin:
    process.env.NEXT_PUBLIC_DOCS_ORIGIN ?? "https://appcn.vercel.app",
};

export const siteConfig = {
  name: "appCN",
  tagline: "Copy-paste mobile components for React Native.",
  description:
    "Beautiful, motion-first React Native components you own — NativeWind-styled, installed via the shadcn CLI, with a featured AI-native collection.",
  github: "https://github.com/Salah-XD/appCN",
  /** Expo showcase web build (expo start --web defaults to :8081). */
  showcaseWebUrl:
    process.env.NEXT_PUBLIC_SHOWCASE_WEB_URL ?? "http://localhost:8081",
  /**
   * Expo Go deep-link base for QR previews, e.g. "exp://192.168.1.20:8081".
   * Empty in dev until you point it at your machine / an EAS Update channel.
   */
  expoUrl: process.env.NEXT_PUBLIC_EXPO_URL ?? "",
  /** Where the built registry JSON is served from. */
  registryBaseUrl:
    process.env.NEXT_PUBLIC_REGISTRY_URL ?? "https://appcn.dev/r",
};

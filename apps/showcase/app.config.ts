import type { ExpoConfig } from "expo/config";

// ────────────────────────────────────────────────────────────────────────
// EAS project id — paste here after running `npx eas-cli init` from this
// directory. EAS CLI cannot auto-write a TypeScript config; the init flow
// will print a UUID, replace the empty string below with it, save, done.
//
// Until then, leave this empty. The `updates` + `extra.eas` blocks are
// omitted so `eas init` can run cleanly without tripping over a stale or
// invalid projectId.
//
// CI / overrides can also set process.env.EAS_PROJECT_ID — useful for
// branch-specific channels later.
// ────────────────────────────────────────────────────────────────────────
const EAS_PROJECT_ID = process.env.EAS_PROJECT_ID ?? "a2d02caa-be26-436a-acd6-f3007862ba0a";

const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
  EAS_PROJECT_ID,
);

const config: ExpoConfig = {
  name: "appCN",
  slug: "appcn",
  scheme: "appcn",
  version: "1.0.0",
  orientation: "portrait",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  icon: "./assets/images/icon.png",
  ios: {
    bundleIdentifier: "digital.shineup.appcn",
    buildNumber: "1",
    supportsTablet: true,
    associatedDomains: ["applinks:appcn.vercel.app"],
  },
  android: {
    package: "digital.shineup.appcn",
    versionCode: 1,
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
    adaptiveIcon: {
      backgroundColor: "#E6F4FE",
      foregroundImage: "./assets/images/android-icon-foreground.png",
      backgroundImage: "./assets/images/android-icon-background.png",
      monochromeImage: "./assets/images/android-icon-monochrome.png",
    },
    intentFilters: [
      {
        action: "VIEW",
        autoVerify: true,
        data: [
          {
            scheme: "https",
            host: "appcn.vercel.app",
            pathPrefix: "/components",
          },
        ],
        category: ["BROWSABLE", "DEFAULT"],
      },
    ],
  },
  web: {
    output: "static",
    favicon: "./assets/images/favicon.png",
  },
  plugins: [
    "expo-router",
    [
      "expo-splash-screen",
      {
        image: "./assets/images/splash-icon.png",
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: "#ffffff",
        dark: { backgroundColor: "#000000" },
      },
    ],
    "expo-updates",
  ],
  experiments: { typedRoutes: true, reactCompiler: true },
  runtimeVersion: { policy: "appVersion" },
  // EAS-bound fields only appear once a valid project UUID is known —
  // keeps `eas init` from misreading a placeholder.
  ...(isUuid && {
    updates: { url: `https://u.expo.dev/${EAS_PROJECT_ID}` },
    extra: { eas: { projectId: EAS_PROJECT_ID } },
  }),
};

export default config;

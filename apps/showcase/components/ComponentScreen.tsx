import * as React from "react";
import { Text, View } from "react-native";

import { demoMap } from "../lib/demos";

/**
 * Per-component preview screen body. Used by both `/c/<slug>` (docs iframe
 * path, kept stable for backwards compatibility) and `/components/<slug>`
 * (Universal/App Link path — same as the docs URL so installed apps catch
 * `https://appcn.vercel.app/components/<slug>` taps directly).
 */
export function ComponentScreen({
  slug,
  fake,
}: {
  slug?: string;
  fake?: string;
}) {
  const demo = slug ? demoMap[slug] : undefined;
  const isFake = fake === "1";

  return (
    <View
      className={
        isFake
          ? "flex-1"
          : "flex-1 items-center justify-center bg-background px-6 py-8"
      }
      style={isFake ? { backgroundColor: "#0A0A14" } : undefined}
    >
      {demo ? (
        demo.render()
      ) : (
        <Text className="text-center text-muted-foreground">
          No component named “{slug}”.
        </Text>
      )}
    </View>
  );
}

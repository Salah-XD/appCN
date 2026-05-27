import * as React from "react";
import { useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";

import { demoMap } from "../../lib/demos";

/**
 * Per-component preview screen — deep-linked at /c/<slug>.
 *
 * Intentionally chromeless: no header, no back button. This route is iframed
 * by the docs site for the Web preview tab, where chrome would be redundant
 * and visually noisy. The standalone gallery handles navigation.
 */
export default function ComponentPreview() {
  const { slug, fake } = useLocalSearchParams<{
    slug: string;
    fake?: string;
  }>();
  const demo = slug ? demoMap[slug] : undefined;
  const isFake = fake === "1";

  // In fake/embed mode, drop the padding + center wrapping so the demo can
  // own the whole iframe area (no visible boundary between page bg and
  // component bg).
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

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
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const demo = slug ? demoMap[slug] : undefined;

  return (
    <View className="flex-1 items-center justify-center bg-background px-6 py-8">
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

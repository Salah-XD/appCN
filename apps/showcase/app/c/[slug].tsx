import * as React from "react";
import { Link, useLocalSearchParams } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { demoMap } from "../../lib/demos";

export default function ComponentPreview() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const demo = slug ? demoMap[slug] : undefined;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center gap-3 px-4 pb-3 pt-2">
        <Link href="/" asChild>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back"
            className="h-10 w-10 items-center justify-center rounded-full bg-secondary active:opacity-70"
          >
            <Text className="text-lg text-secondary-foreground">‹</Text>
          </Pressable>
        </Link>
        <Text className="text-xl font-semibold text-foreground">
          {demo?.title ?? "Not found"}
        </Text>
      </View>

      {/* Stage */}
      <View className="flex-1 items-center justify-center px-6">
        {demo ? (
          demo.render()
        ) : (
          <Text className="text-center text-muted-foreground">
            No component named “{slug}”.
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
}

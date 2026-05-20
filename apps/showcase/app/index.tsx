import * as React from "react";
import { Link } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { demos } from "../lib/demos";

export default function Gallery() {
  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <View className="px-5 pb-4 pt-2">
        <Text className="text-4xl font-bold tracking-tight text-foreground">
          appCN
        </Text>
        <Text className="mt-1 text-base text-muted-foreground">
          Mobile components, copy-paste. Tap any to preview.
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40, gap: 12 }}>
        {demos.map((demo) => (
          <Link key={demo.slug} href={`/c/${demo.slug}`} asChild>
            <Pressable className="rounded-3xl border border-border bg-card p-4 active:opacity-80">
              <View className="flex-row items-center justify-between">
                <Text className="text-lg font-semibold text-card-foreground">
                  {demo.title}
                </Text>
                <View
                  className={
                    demo.category === "ai"
                      ? "rounded-full bg-primary px-2.5 py-1"
                      : "rounded-full bg-secondary px-2.5 py-1"
                  }
                >
                  <Text
                    className={
                      demo.category === "ai"
                        ? "text-xs font-semibold text-primary-foreground"
                        : "text-xs font-semibold text-secondary-foreground"
                    }
                  >
                    {demo.category === "ai" ? "AI" : "Base"}
                  </Text>
                </View>
              </View>
              <Text className="mt-1 text-sm text-muted-foreground">
                {demo.description}
              </Text>
            </Pressable>
          </Link>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

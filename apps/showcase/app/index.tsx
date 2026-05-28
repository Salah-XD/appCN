import * as React from "react";
import { Link } from "expo-router";
import Constants from "expo-constants";
import * as Linking from "expo-linking";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { demos, type Demo, type DemoCategory } from "../lib/demos";

const DOCS_URL = "https://appcn.vercel.app";

const PRESS_SPRING = { mass: 0.5, damping: 18, stiffness: 320 };

export default function Gallery() {
  const base = demos.filter((d) => d.category === "base");
  const ai = demos.filter((d) => d.category === "ai");

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6 pb-6 pt-4">
          <View className="flex-row items-center gap-2">
            <BrandMark />
            <Text className="text-3xl font-bold tracking-tight text-foreground">
              app<Text className="text-primary">CN</Text>
            </Text>
          </View>
          <Text className="mt-2 text-base text-muted-foreground">
            Mobile components for modern apps. Tap any to preview.
          </Text>
        </View>

        <Section title="AI Collection" subtitle="The flagship.">
          {ai.map((d, i) => (
            <DemoCard key={d.slug} demo={d} index={i} />
          ))}
        </Section>

        <Section title="Base" subtitle="Building blocks.">
          {base.map((d, i) => (
            <DemoCard key={d.slug} demo={d} index={ai.length + i} />
          ))}
        </Section>

        <Footer />
      </ScrollView>
    </SafeAreaView>
  );
}

function Footer() {
  const version = Constants.expoConfig?.version ?? "0.0.0";
  return (
    <View className="mt-10 items-center gap-2 px-6">
      <Pressable
        accessibilityRole="link"
        accessibilityLabel="Open appCN documentation"
        onPress={() => Linking.openURL(DOCS_URL)}
        className="rounded-full border border-border bg-card/60 px-4 py-2"
      >
        <Text className="text-xs font-medium text-foreground">
          About appCN  →  appcn.vercel.app
        </Text>
      </Pressable>
      <Text className="text-[10px] uppercase tracking-[2px] text-muted-foreground/70">
        v{version}
      </Text>
    </View>
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <View className="px-6 pt-6">
      <View className="flex-row items-baseline justify-between">
        <Text className="text-xs font-semibold uppercase tracking-[2px] text-muted-foreground">
          {title}
        </Text>
        <Text className="text-xs text-muted-foreground/70">{subtitle}</Text>
      </View>
      <View className="mt-3 gap-2.5">{children}</View>
    </View>
  );
}

function DemoCard({ demo, index }: { demo: Demo; index: number }) {
  const pressed = useSharedValue(0);
  const style = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(pressed.value ? 0.97 : 1, PRESS_SPRING) }],
  }));

  return (
    <Animated.View entering={FadeInDown.duration(360).delay(index * 50)} style={style}>
      <Link href={`/c/${demo.slug}`} asChild>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Preview ${demo.title}`}
          onPressIn={() => {
            pressed.value = 1;
          }}
          onPressOut={() => {
            pressed.value = 0;
          }}
          className="overflow-hidden rounded-2xl border border-border bg-card/80 p-4"
        >
          <View className="flex-row items-center justify-between">
            <Text className="text-lg font-semibold text-card-foreground">
              {demo.title}
            </Text>
            <CategoryPill category={demo.category} />
          </View>
          <Text className="mt-1.5 text-sm leading-5 text-muted-foreground">
            {demo.description}
          </Text>
        </Pressable>
      </Link>
    </Animated.View>
  );
}

function CategoryPill({ category }: { category: DemoCategory }) {
  if (category === "ai") {
    return (
      <View className="rounded-full bg-primary px-2.5 py-1">
        <Text className="text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
          AI
        </Text>
      </View>
    );
  }
  return (
    <View className="rounded-full border border-border bg-secondary/50 px-2.5 py-1">
      <Text className="text-[10px] font-bold uppercase tracking-wider text-secondary-foreground">
        Base
      </Text>
    </View>
  );
}

/** Tiny appCN mark — a stylized phone with motion. */
function BrandMark() {
  return (
    <View className="h-9 w-9 items-center justify-center rounded-xl bg-primary">
      <View className="h-5 w-3.5 rounded-[3px] border-[1.5px] border-primary-foreground">
        <View className="absolute -right-1 top-1 h-[1.5px] w-2 bg-primary-foreground" />
        <View className="absolute -right-1.5 top-[10px] h-[1.5px] w-2.5 bg-primary-foreground/70" />
      </View>
    </View>
  );
}

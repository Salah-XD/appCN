import "../global.css";
import "react-native-reanimated";

import * as React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useColorScheme } from "nativewind";

export default function RootLayout() {
  const { colorScheme, setColorScheme } = useColorScheme();

  // appCN is dark-mode-first — default the showcase to dark.
  React.useEffect(() => {
    setColorScheme("dark");
  }, [setColorScheme]);

  const isDark = colorScheme !== "light";

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: {
              backgroundColor: isDark ? "#0a0a0b" : "#ffffff",
            },
          }}
        />
        <StatusBar style={isDark ? "light" : "dark"} />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

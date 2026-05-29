import "../global.css";
import "react-native-reanimated";

import * as React from "react";
import { Platform } from "react-native";
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

  React.useEffect(() => {
    if (Platform.OS !== "web") {
      return;
    }

    const gtagScript = document.createElement("script");
    gtagScript.async = true;
    gtagScript.src = "https://www.googletagmanager.com/gtag/js?id=G-6T2RTMTCTF";
    document.head.appendChild(gtagScript);

    const initScript = document.createElement("script");
    initScript.innerHTML = `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}

gtag('js', new Date());

gtag('config', 'G-6T2RTMTCTF');`;
    document.head.appendChild(initScript);

    return () => {
      document.head.removeChild(gtagScript);
      document.head.removeChild(initScript);
    };
  }, []);

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

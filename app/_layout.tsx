import { Stack, useSegments } from "expo-router";
import { ClerkProvider, useUser } from "@clerk/expo";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import * as SecureStore from "expo-secure-store";
import { useEffect } from "react";
import { PostHogProvider, usePostHog } from "posthog-react-native";
import "../global.css";

const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

void SplashScreen.preventAutoHideAsync();

function PostHogTracker() {
  const posthog = usePostHog();
  const segments = useSegments();

  useEffect(() => {
    posthog.startSessionRecording();
  }, [posthog]);

  useEffect(() => {
    const screenName = segments.join('/');
    posthog.screen(screenName);
  }, [segments, posthog]);

  return null;
}

function UserIdentifier() {
  const { user } = useUser();
  const posthog = usePostHog();

  useEffect(() => {
    if (user) {
      posthog.identify(user.id, {
        email: user.primaryEmailAddress?.emailAddress,
        name: user.fullName,
      });
    }
  }, [user, posthog]);

  return null;
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    "sans-light": require("../assets/fonts/PlusJakartaSans-Light.ttf"),
    "sans-regular": require("../assets/fonts/PlusJakartaSans-Regular.ttf"),
    "sans-medium": require("../assets/fonts/PlusJakartaSans-Medium.ttf"),
    "sans-semibold": require("../assets/fonts/PlusJakartaSans-SemiBold.ttf"),
    "sans-bold": require("../assets/fonts/PlusJakartaSans-Bold.ttf"),
    "sans-extrabold": require("../assets/fonts/PlusJakartaSans-ExtraBold.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded) {
      void SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ClerkProvider
      publishableKey={CLERK_PUBLISHABLE_KEY ?? ""}
      tokenCache={{
        getToken: async (key: string) => {
          return await SecureStore.getItemAsync(key);
        },
        saveToken: async (key: string, token: string) => {
          await SecureStore.setItemAsync(key, token);
        },
        clearToken: (key: string) => {
          void SecureStore.deleteItemAsync(key);
        },
      }}
    >
      <PostHogProvider
        apiKey={process.env.EXPO_PUBLIC_POSTHOG_API_KEY ?? ""}
        options={{ host: process.env.EXPO_PUBLIC_POSTHOG_HOST }}
      >
        <UserIdentifier />
        <PostHogTracker />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="add-subscription" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="profile" />
        </Stack>
      </PostHogProvider>
    </ClerkProvider>
  );
}

import { Stack } from "expo-router";
import { ClerkProvider } from "@clerk/expo";
import * as SecureStore from "expo-secure-store";

export default function RootLayout() {
  return (
    <ClerkProvider
      publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY}
      tokenCache={{
        getToken: async (key) => {
          return await SecureStore.getItemAsync(key);
        },
        saveToken: async (key, token) => {
          await SecureStore.setItemAsync(key, token);
        },
        removeToken: async (key) => {
          await SecureStore.deleteItemAsync(key);
        },
      }}
    >
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="add-subscription" />
        <Stack.Screen name="(auth)" />
      </Stack>
    </ClerkProvider>
  );
}
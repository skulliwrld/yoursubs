import { useAuth } from "@clerk/expo";
import { useOAuth } from "@clerk/expo";
import { Redirect } from "expo-router";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import * as WebBrowser from "expo-web-browser";

WebBrowser.maybeCompleteAuthSession();

export default function SignInScreen() {
  const { isSignedIn, setActive } = useAuth();
  const googleAuth = useOAuth({ strategy: "oauth_google" });
  const appleAuth = useOAuth({ strategy: "oauth_apple" });

  const handleOAuth = async (strategy: "oauth_google" | "oauth_apple") => {
    try {
      const auth = strategy === "oauth_google" ? googleAuth : appleAuth;
      const { createdSessionId } = await auth.startOAuthFlow();
      if (createdSessionId && setActive) {
        await setActive({ sessionId: createdSessionId });
      }
    } catch (err) {
      console.error("OAuth error:", err);
    }
  };

  if (isSignedIn) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back</Text>
      <Text style={styles.subtitle}>Sign in to continue</Text>
      
      <TouchableOpacity style={styles.button} onPress={() => handleOAuth("oauth_google")}>
        <Text style={styles.buttonText}>Continue with Google</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.buttonSecondary]} onPress={() => handleOAuth("oauth_apple")}>
        <Text style={styles.buttonTextSecondary}>Continue with Apple</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff9e3",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#081126",
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 32,
    color: "#666",
  },
  button: {
    backgroundColor: "#ea7a53",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: "100%",
    marginBottom: 12,
  },
  buttonSecondary: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#ea7a53",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  buttonTextSecondary: {
    color: "#ea7a53",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});
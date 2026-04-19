import { useSSO } from "@clerk/expo";
import { useSignIn } from "@clerk/expo/legacy";
import { router } from "expo-router";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { startTransition, useState } from "react";
import { Platform, Text, TouchableOpacity, View } from "react-native";
import {
  AuthAlert,
  AuthButton,
  AuthCard,
  AuthDivider,
  AuthField,
  AuthShell,
  AuthTextLink,
  FullScreenLoader,
} from "@/components/auth/auth-ui";
import { useWarmUpBrowser } from "@/hooks/useWarmUpBrowser";
import {
  getAuthErrorMessage,
  normalizeEmail,
  validateEmail,
  validateSignInPassword,
} from "@/lib/auth";

WebBrowser.maybeCompleteAuthSession();

type SignInErrors = {
  email: string;
  password: string;
};

export default function SignInScreen() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const { startSSOFlow } = useSSO();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<SignInErrors>({ email: "", password: "" });
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<"oauth_google" | "oauth_apple" | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  useWarmUpBrowser();

  function updateFieldError(field: keyof SignInErrors, value: string) {
    setErrors((current) => ({ ...current, [field]: value }));
  }

  function validateForm() {
    const nextErrors = {
      email: validateEmail(email),
      password: validateSignInPassword(password),
    };

    setErrors(nextErrors);

    return !nextErrors.email && !nextErrors.password;
  }

  async function completeSignIn(sessionId?: string | null) {
    if (!sessionId) {
      setSubmitError("We couldn't finish signing you in. Please try again.");
      return;
    }

    if (!setActive) {
      setSubmitError("Your session was created, but we couldn't activate it on this device.");
      return;
    }

    await setActive({ session: sessionId });
    startTransition(() => router.replace("/(tabs)"));
  }

  async function handleSignIn() {
    if (!isLoaded || loading) {
      return;
    }

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setSubmitError("");

    try {
      const result = await signIn.create({
        identifier: normalizeEmail(email),
        password,
      });

      if (result.status === "complete") {
        await completeSignIn(result.createdSessionId);
        return;
      }

      if (result.status === "needs_second_factor") {
        setSubmitError("Two-step verification is enabled for this account. Complete that step to continue.");
        return;
      }

      setSubmitError("We couldn't finish signing you in yet. Please try again.");
    } catch (error) {
      setSubmitError(
        getAuthErrorMessage(error, "Unable to sign in right now.", {
          form_identifier_not_found: "No account matched that email. Create one to get started.",
        })
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSSO(strategy: "oauth_google" | "oauth_apple") {
    if (socialLoading) {
      return;
    }

    setSubmitError("");
    setSocialLoading(strategy);

    try {
      const result = await startSSOFlow({
        strategy,
        redirectUrl: Linking.createURL("/"),
      });

      if (result.createdSessionId) {
        await result.setActive?.({ session: result.createdSessionId });
        startTransition(() => router.replace("/(tabs)"));
        return;
      }

      setSubmitError("We couldn't finish that sign-in attempt. Please try again.");
    } catch (error) {
      setSubmitError(getAuthErrorMessage(error, "That sign-in option is unavailable right now."));
    } finally {
      setSocialLoading(null);
    }
  }

  if (!isLoaded) {
    return <FullScreenLoader />;
  }

  return (
    <AuthShell
      eyebrow="Sign In"
      title="Welcome back"
      subtitle="Pick up where you left off and keep every renewal in one place."
      supportingCopy="Your reminders, upcoming charges, and subscription overview stay in sync as soon as you're signed in."
      highlights={["Private by design", "Real-time renewal view", "Fast account access"]}
      footer={
        <View className="auth-link-row">
          <Text className="auth-link-copy">New here?</Text>
          <AuthTextLink label="Create your account" onPress={() => router.push("/(auth)/sign-up")} />
        </View>
      }
    >
      <AuthCard>
        <View className="auth-form">
          <AuthField
            label="Email"
            placeholder="you@example.com"
            value={email}
            onChangeText={(value) => {
              setEmail(value);
              if (errors.email) {
                updateFieldError("email", validateEmail(value));
              }
            }}
            onBlur={() => updateFieldError("email", validateEmail(email))}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            textContentType="emailAddress"
            autoComplete="email"
            error={errors.email}
            editable={!loading && !socialLoading}
          />

          <AuthField
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={(value) => {
              setPassword(value);
              if (errors.password) {
                updateFieldError("password", validateSignInPassword(value));
              }
            }}
            onBlur={() => updateFieldError("password", validateSignInPassword(password))}
            secureTextEntry={!showPassword}
            textContentType="password"
            autoComplete="password"
            error={errors.password}
            editable={!loading && !socialLoading}
            accessory={
              <TouchableOpacity
                className="auth-input-accessory"
                onPress={() => setShowPassword((current) => !current)}
                activeOpacity={0.8}
              >
                <Text className="auth-inline-link">{showPassword ? "Hide" : "Show"}</Text>
              </TouchableOpacity>
            }
          />

          <View className="items-end">
            <AuthTextLink
              label="Forgot password?"
              onPress={() => router.push("/(auth)/forgot-password" as any)}
              disabled={loading || !!socialLoading}
            />
          </View>

          <AuthAlert message={submitError} />

          <AuthButton
            label="Sign in"
            onPress={handleSignIn}
            loading={loading}
            disabled={!!socialLoading}
          />
        </View>
      </AuthCard>

      <AuthDivider />

      <View className="gap-3">
        <AuthButton
          label="Continue with Google"
          onPress={() => handleSSO("oauth_google")}
          loading={socialLoading === "oauth_google"}
          disabled={loading}
          variant="secondary"
        />

        {Platform.OS !== "android" ? (
          <AuthButton
            label="Continue with Apple"
            onPress={() => handleSSO("oauth_apple")}
            loading={socialLoading === "oauth_apple"}
            disabled={loading}
            variant="secondary"
          />
        ) : null}
      </View>
    </AuthShell>
  );
}

import { useSSO } from "@clerk/expo";
import { useSignUp } from "@clerk/expo/legacy";
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
  buildNameParts,
  getAuthErrorMessage,
  getPasswordChecks,
  normalizeEmail,
  validateDisplayName,
  validateEmail,
  validatePasswordConfirmation,
  validateStrongPassword,
  validateVerificationCode,
} from "@/lib/auth";

WebBrowser.maybeCompleteAuthSession();

type SignUpErrors = {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  code: string;
};

type FeedbackState = {
  message: string;
  tone: "danger" | "success";
};

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const { startSSOFlow } = useSSO();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<"oauth_google" | "oauth_apple" | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState>({ message: "", tone: "danger" });
  const [errors, setErrors] = useState<SignUpErrors>({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    code: "",
  });

  useWarmUpBrowser();

  const passwordChecks = getPasswordChecks(password);

  function updateFieldError(field: keyof SignUpErrors, value: string) {
    setErrors((current) => ({ ...current, [field]: value }));
  }

  function validateSignUpForm() {
    const nextErrors = {
      fullName: validateDisplayName(fullName),
      email: validateEmail(email),
      password: validateStrongPassword(password),
      confirmPassword: validatePasswordConfirmation(password, confirmPassword),
      code: "",
    };

    setErrors((current) => ({ ...current, ...nextErrors }));

    return !nextErrors.fullName && !nextErrors.email && !nextErrors.password && !nextErrors.confirmPassword;
  }

  async function completeRegistration(sessionId?: string | null) {
    if (!sessionId) {
      setFeedback({
        message: "We verified your email, but couldn't finish the sign-in. Please try again.",
        tone: "danger",
      });
      return;
    }

    if (!setActive) {
      setFeedback({
        message: "Your account is ready, but we couldn't activate the session on this device.",
        tone: "danger",
      });
      return;
    }

    await setActive({ session: sessionId });
    startTransition(() => router.replace("/(tabs)"));
  }

  async function handleCreateAccount() {
    if (!isLoaded || loading) {
      return;
    }

    if (!validateSignUpForm()) {
      return;
    }

    setLoading(true);
    setFeedback({ message: "", tone: "danger" });

    try {
      const { firstName, lastName } = buildNameParts(fullName);

      await signUp.create({
        firstName,
        lastName,
        emailAddress: normalizeEmail(email),
        password,
      });

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

      setPendingVerification(true);
      setFeedback({
        message: "Check your inbox for the 6-digit verification code.",
        tone: "success",
      });
    } catch (error) {
      setFeedback({
        message: getAuthErrorMessage(error, "We couldn't create your account right now."),
        tone: "danger",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyEmail() {
    const codeError = validateVerificationCode(verificationCode);

    updateFieldError("code", codeError);

    if (codeError || !isLoaded || verificationLoading) {
      return;
    }

    setVerificationLoading(true);
    setFeedback({ message: "", tone: "danger" });

    try {
      const result = await signUp.attemptEmailAddressVerification({
        code: verificationCode.trim(),
      });

      if (result.status === "complete") {
        await completeRegistration(result.createdSessionId);
        return;
      }

      setFeedback({
        message: "Your email still needs one more step. Please try the code again.",
        tone: "danger",
      });
    } catch (error) {
      setFeedback({
        message: getAuthErrorMessage(error, "We couldn't verify that code."),
        tone: "danger",
      });
    } finally {
      setVerificationLoading(false);
    }
  }

  async function handleResendCode() {
    if (!isLoaded || resendLoading) {
      return;
    }

    setResendLoading(true);
    setFeedback({ message: "", tone: "danger" });

    try {
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setFeedback({
        message: "A fresh verification code is on the way.",
        tone: "success",
      });
    } catch (error) {
      setFeedback({
        message: getAuthErrorMessage(error, "We couldn't resend the code."),
        tone: "danger",
      });
    } finally {
      setResendLoading(false);
    }
  }

  async function handleSSO(strategy: "oauth_google" | "oauth_apple") {
    if (socialLoading) {
      return;
    }

    setFeedback({ message: "", tone: "danger" });
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

      setFeedback({
        message: "We couldn't finish that sign-up attempt. Please try again.",
        tone: "danger",
      });
    } catch (error) {
      setFeedback({
        message: getAuthErrorMessage(error, "That sign-up option is unavailable right now."),
        tone: "danger",
      });
    } finally {
      setSocialLoading(null);
    }
  }

  if (!isLoaded) {
    return <FullScreenLoader />;
  }

  if (pendingVerification) {
    return (
      <AuthShell
        eyebrow="Verify Email"
        title="Confirm your email"
        subtitle="Enter the code we sent so your account is ready the moment you land in the app."
        supportingCopy={`We sent a security code to ${normalizeEmail(email)}.`}
        highlights={["Secure email check", "One-time verification", "Instant access after approval"]}
        footer={
          <View className="auth-link-row">
            <Text className="auth-link-copy">Used the wrong email?</Text>
            <AuthTextLink
              label="Go back"
              onPress={() => {
                setPendingVerification(false);
                setVerificationCode("");
                setFeedback({ message: "", tone: "danger" });
              }}
            />
          </View>
        }
      >
        <AuthCard>
          <View className="auth-form">
            <AuthField
              label="Verification code"
              placeholder="123456"
              value={verificationCode}
              onChangeText={(value) => {
                setVerificationCode(value.replace(/[^\d]/g, ""));
                if (errors.code) {
                  updateFieldError("code", validateVerificationCode(value));
                }
              }}
              onBlur={() => updateFieldError("code", validateVerificationCode(verificationCode))}
              keyboardType="number-pad"
              textContentType="oneTimeCode"
              maxLength={6}
              error={errors.code}
              editable={!verificationLoading && !resendLoading}
            />

            <AuthAlert message={feedback.message} tone={feedback.tone} />

            <AuthButton
              label="Verify email"
              onPress={handleVerifyEmail}
              loading={verificationLoading}
              disabled={resendLoading}
            />

            <AuthButton
              label="Resend code"
              onPress={handleResendCode}
              loading={resendLoading}
              disabled={verificationLoading}
              variant="secondary"
            />
          </View>
        </AuthCard>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      eyebrow="Create Account"
      title="Start tracking smarter"
      subtitle="Create your account to stay ahead of renewals, spend, and surprise charges."
      supportingCopy="Set up your secure workspace in under a minute, then keep every subscription organized with confidence."
      highlights={["Clear renewal reminders", "Secure sign-in", "Personalized dashboard"]}
      footer={
        <View className="auth-link-row">
          <Text className="auth-link-copy">Already have an account?</Text>
          <AuthTextLink label="Sign in" onPress={() => router.push("/(auth)/sign-in")} />
        </View>
      }
    >
      <AuthCard>
        <View className="auth-form">
          <AuthField
            label="Full name"
            placeholder="Alex Johnson"
            value={fullName}
            onChangeText={(value) => {
              setFullName(value);
              if (errors.fullName) {
                updateFieldError("fullName", validateDisplayName(value));
              }
            }}
            onBlur={() => updateFieldError("fullName", validateDisplayName(fullName))}
            autoCapitalize="words"
            textContentType="name"
            autoComplete="name"
            error={errors.fullName}
            editable={!loading && !socialLoading}
          />

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
            placeholder="Create a secure password"
            value={password}
            onChangeText={(value) => {
              setPassword(value);
              if (errors.password) {
                updateFieldError("password", validateStrongPassword(value));
              }
              if (errors.confirmPassword && confirmPassword) {
                updateFieldError("confirmPassword", validatePasswordConfirmation(value, confirmPassword));
              }
            }}
            onBlur={() => updateFieldError("password", validateStrongPassword(password))}
            secureTextEntry={!showPassword}
            textContentType="newPassword"
            autoComplete="password-new"
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

          <View className="auth-password-checklist">
            {passwordChecks.map((check) => (
              <View key={check.key} className="auth-password-check">
                <View
                  className={`auth-password-check-dot ${check.met ? "auth-password-check-dot-active" : ""}`.trim()}
                />
                <Text
                  className={`auth-password-check-text ${check.met ? "auth-password-check-text-active" : ""}`.trim()}
                >
                  {check.label}
                </Text>
              </View>
            ))}
          </View>

          <AuthField
            label="Confirm password"
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChangeText={(value) => {
              setConfirmPassword(value);
              if (errors.confirmPassword) {
                updateFieldError("confirmPassword", validatePasswordConfirmation(password, value));
              }
            }}
            onBlur={() => updateFieldError("confirmPassword", validatePasswordConfirmation(password, confirmPassword))}
            secureTextEntry={!showConfirmPassword}
            textContentType="password"
            autoComplete="password-new"
            error={errors.confirmPassword}
            editable={!loading && !socialLoading}
            accessory={
              <TouchableOpacity
                className="auth-input-accessory"
                onPress={() => setShowConfirmPassword((current) => !current)}
                activeOpacity={0.8}
              >
                <Text className="auth-inline-link">{showConfirmPassword ? "Hide" : "Show"}</Text>
              </TouchableOpacity>
            }
          />

          <AuthAlert message={feedback.message} tone={feedback.tone} />

          <AuthButton
            label="Create account"
            onPress={handleCreateAccount}
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

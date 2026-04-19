import { useSignIn } from "@clerk/expo/legacy";
import { router } from "expo-router";
import { startTransition, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import {
  AuthAlert,
  AuthButton,
  AuthCard,
  AuthField,
  AuthShell,
  AuthTextLink,
  FullScreenLoader,
} from "@/components/auth/auth-ui";
import {
  getAuthErrorMessage,
  normalizeEmail,
  validateEmail,
  validatePasswordConfirmation,
  validateStrongPassword,
  validateVerificationCode,
} from "@/lib/auth";

type ResetErrors = {
  email: string;
  code: string;
  password: string;
  confirmPassword: string;
};

export default function ForgotPasswordScreen() {
  const { isLoaded, signIn, setActive } = useSignIn();

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; tone: "danger" | "success" }>({
    message: "",
    tone: "danger",
  });
  const [errors, setErrors] = useState<ResetErrors>({
    email: "",
    code: "",
    password: "",
    confirmPassword: "",
  });

  function updateFieldError(field: keyof ResetErrors, value: string) {
    setErrors((current) => ({ ...current, [field]: value }));
  }

  async function handleRequestReset() {
    const emailError = validateEmail(email);

    updateFieldError("email", emailError);

    if (emailError || !isLoaded || loading) {
      return;
    }

    setLoading(true);
    setFeedback({ message: "", tone: "danger" });

    try {
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: normalizeEmail(email),
      });

      setRequestSent(true);
      setFeedback({
        message: "We sent a reset code to your email.",
        tone: "success",
      });
    } catch (error) {
      setFeedback({
        message: getAuthErrorMessage(error, "We couldn't send a reset code right now."),
        tone: "danger",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword() {
    const nextErrors = {
      email: "",
      code: validateVerificationCode(code),
      password: validateStrongPassword(password),
      confirmPassword: validatePasswordConfirmation(password, confirmPassword),
    };

    setErrors((current) => ({ ...current, ...nextErrors }));

    if (nextErrors.code || nextErrors.password || nextErrors.confirmPassword || !isLoaded || loading) {
      return;
    }

    setLoading(true);
    setFeedback({ message: "", tone: "danger" });

    try {
      const result = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code: code.trim(),
        password,
      });

      if (result.status === "complete" && result.createdSessionId) {
        await setActive({ session: result.createdSessionId });
        startTransition(() => router.replace("/(tabs)"));
        return;
      }

      setFeedback({
        message: "Your password was updated, but another sign-in step is still required.",
        tone: "danger",
      });
    } catch (error) {
      setFeedback({
        message: getAuthErrorMessage(error, "We couldn't reset your password."),
        tone: "danger",
      });
    } finally {
      setLoading(false);
    }
  }

  if (!isLoaded) {
    return <FullScreenLoader />;
  }

  return (
    <AuthShell
      eyebrow="Reset Password"
      title="Get back into your account"
      subtitle="Reset your password securely and return to your subscriptions without losing momentum."
      supportingCopy="We'll send a one-time code to the email linked to your account."
      highlights={["Secure recovery", "6-digit email code", "New password in minutes"]}
      footer={
        <View className="auth-link-row">
          <Text className="auth-link-copy">Remembered it?</Text>
          <AuthTextLink label="Back to sign in" onPress={() => router.replace("/(auth)/sign-in")} />
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
            editable={!loading && !requestSent}
          />

          {requestSent ? (
            <>
              <AuthField
                label="Verification code"
                placeholder="123456"
                value={code}
                onChangeText={(value) => {
                  setCode(value.replace(/[^\d]/g, ""));
                  if (errors.code) {
                    updateFieldError("code", validateVerificationCode(value));
                  }
                }}
                onBlur={() => updateFieldError("code", validateVerificationCode(code))}
                keyboardType="number-pad"
                textContentType="oneTimeCode"
                maxLength={6}
                error={errors.code}
                editable={!loading}
              />

              <AuthField
                label="New password"
                placeholder="Create a new password"
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
                editable={!loading}
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
                editable={!loading}
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
            </>
          ) : null}

          <AuthAlert message={feedback.message} tone={feedback.tone} />

          <AuthButton
            label={requestSent ? "Reset password" : "Send reset code"}
            onPress={requestSent ? handleResetPassword : handleRequestReset}
            loading={loading}
          />

          {requestSent ? (
            <AuthButton
              label="Send a new code"
              onPress={handleRequestReset}
              disabled={loading}
              variant="secondary"
            />
          ) : null}
        </View>
      </AuthCard>
    </AuthShell>
  );
}

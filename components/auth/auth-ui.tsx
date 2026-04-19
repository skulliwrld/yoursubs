import type { ComponentProps, ReactNode } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { colors } from "@/constants/themes";

type AuthShellProps = {
  eyebrow?: string;
  title: string;
  subtitle: string;
  supportingCopy?: string;
  highlights?: string[];
  children: ReactNode;
  footer?: ReactNode;
};

type AuthFieldProps = ComponentProps<typeof TextInput> & {
  label: string;
  error?: string;
  hint?: string;
  accessory?: ReactNode;
  containerClassName?: string;
  inputClassName?: string;
};

type AuthButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: "primary" | "secondary";
};

type AuthAlertProps = {
  message: string;
  tone?: "danger" | "success";
};

export function FullScreenLoader() {
  return (
    <View className="auth-screen items-center justify-center">
      <ActivityIndicator color={colors.accent} size="large" />
    </View>
  );
}

export function AuthShell({
  eyebrow,
  title,
  subtitle,
  supportingCopy,
  highlights,
  children,
  footer,
}: AuthShellProps) {
  return (
    <KeyboardAvoidingView
      className="auth-screen"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        className="auth-scroll"
        contentContainerClassName="auth-content"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="auth-brand-block">
          <View className="auth-logo-wrap">
            <View className="auth-logo-mark">
              <Text className="auth-logo-mark-text">A</Text>
            </View>
          </View>
          <Text className="auth-wordmark">Allsub</Text>
          <Text className="auth-wordmark-sub">Subscription Tracker</Text>
        </View>

        <View className="auth-hero-card">
          {eyebrow ? <Text className="auth-eyebrow">{eyebrow}</Text> : null}
          <Text className="auth-title">{title}</Text>
          <Text className="auth-subtitle max-w-none text-left">{subtitle}</Text>
          {supportingCopy ? (
            <Text className="auth-supporting-copy">{supportingCopy}</Text>
          ) : null}
          {highlights?.length ? (
            <View className="auth-trust-list">
              {highlights.map((highlight) => (
                <View key={highlight} className="auth-trust-chip">
                  <Text className="auth-trust-chip-text">{highlight}</Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>

        {children}

        {footer ? <View className="mt-6">{footer}</View> : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export function AuthCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <View className={`auth-card ${className}`.trim()}>{children}</View>;
}

export function AuthField({
  label,
  error,
  hint,
  accessory,
  containerClassName = "",
  inputClassName = "",
  placeholderTextColor = colors.mutedForeground,
  ...props
}: AuthFieldProps) {
  return (
    <View className={`auth-field ${containerClassName}`.trim()}>
      <Text className="auth-label">{label}</Text>
      <View className={`auth-input-shell ${error ? "auth-input-shell-error" : ""}`.trim()}>
        <TextInput
          className={`auth-input-control ${inputClassName}`.trim()}
          placeholderTextColor={placeholderTextColor}
          {...props}
        />
        {accessory}
      </View>
      {error ? <Text className="auth-error">{error}</Text> : null}
      {!error && hint ? <Text className="auth-helper">{hint}</Text> : null}
    </View>
  );
}

export function AuthButton({
  label,
  onPress,
  disabled,
  loading,
  variant = "primary",
}: AuthButtonProps) {
  const buttonClassName =
    variant === "secondary"
      ? "auth-secondary-button"
      : `auth-button ${disabled || loading ? "auth-button-disabled" : ""}`.trim();
  const textClassName =
    variant === "secondary" ? "auth-secondary-button-text" : "auth-button-text";

  return (
    <TouchableOpacity
      className={buttonClassName}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
    >
      {loading ? (
        <ActivityIndicator color={variant === "secondary" ? colors.accent : colors.primary} />
      ) : (
        <Text className={textClassName}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

export function AuthAlert({ message, tone = "danger" }: AuthAlertProps) {
  if (!message) {
    return null;
  }

  return (
    <View className={`auth-banner ${tone === "success" ? "auth-banner-success" : ""}`.trim()}>
      <Text className={`auth-banner-text ${tone === "success" ? "auth-banner-text-success" : ""}`.trim()}>
        {message}
      </Text>
    </View>
  );
}

export function AuthDivider({ label = "or" }: { label?: string }) {
  return (
    <View className="auth-divider-row">
      <View className="auth-divider-line" />
      <Text className="auth-divider-text">{label}</Text>
      <View className="auth-divider-line" />
    </View>
  );
}

export function AuthTextLink({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <TouchableOpacity onPress={onPress} disabled={disabled} activeOpacity={0.8}>
      <Text className={`auth-inline-link ${disabled ? "opacity-50" : ""}`.trim()}>{label}</Text>
    </TouchableOpacity>
  );
}

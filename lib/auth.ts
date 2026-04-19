export type PasswordCheck = {
  key: "length" | "uppercase" | "lowercase" | "number";
  label: string;
  met: boolean;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const PASSWORD_CHECKS = [
  {
    key: "length" as const,
    label: "8+ characters",
    test: (value: string) => value.length >= 8,
  },
  {
    key: "uppercase" as const,
    label: "Uppercase letter",
    test: (value: string) => /[A-Z]/.test(value),
  },
  {
    key: "lowercase" as const,
    label: "Lowercase letter",
    test: (value: string) => /[a-z]/.test(value),
  },
  {
    key: "number" as const,
    label: "Number",
    test: (value: string) => /\d/.test(value),
  },
];

export function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function validateEmail(value: string) {
  if (!value.trim()) {
    return "Email is required.";
  }

  if (!EMAIL_REGEX.test(value.trim())) {
    return "Enter a valid email address.";
  }

  return "";
}

export function validateDisplayName(value: string) {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return "Your name is required.";
  }

  if (trimmedValue.length < 2) {
    return "Use at least 2 characters for your name.";
  }

  return "";
}

export function validateSignInPassword(value: string) {
  if (!value) {
    return "Password is required.";
  }

  return "";
}

export function getPasswordChecks(value: string): PasswordCheck[] {
  return PASSWORD_CHECKS.map((check) => ({
    key: check.key,
    label: check.label,
    met: check.test(value),
  }));
}

export function validateStrongPassword(value: string) {
  if (!value) {
    return "Password is required.";
  }

  const unmetChecks = getPasswordChecks(value).filter((check) => !check.met);

  if (!unmetChecks.length) {
    return "";
  }

  return `Use a stronger password: ${unmetChecks
    .map((check) => check.label.toLowerCase())
    .join(", ")}.`;
}

export function validatePasswordConfirmation(password: string, confirmation: string) {
  if (!confirmation) {
    return "Please confirm your password.";
  }

  if (password !== confirmation) {
    return "Passwords do not match.";
  }

  return "";
}

export function validateVerificationCode(value: string) {
  if (!value.trim()) {
    return "Enter the verification code.";
  }

  if (!/^\d{6}$/.test(value.trim())) {
    return "Enter the 6-digit verification code.";
  }

  return "";
}

export function buildNameParts(fullName: string) {
  const [firstName, ...rest] = fullName.trim().split(/\s+/);

  return {
    firstName,
    lastName: rest.join(" ") || undefined,
  };
}

export function getAuthErrorMessage(
  error: any,
  fallbackMessage: string,
  overrides: Record<string, string> = {}
) {
  const firstError = error?.errors?.[0];
  const errorCode = firstError?.code || error?.code;

  if (errorCode && overrides[errorCode]) {
    return overrides[errorCode];
  }

  switch (errorCode) {
    case "form_identifier_not_found":
      return "We couldn't find an account with that email.";
    case "form_password_incorrect":
      return "That password doesn't match our records.";
    case "form_identifier_exists":
    case "user_already_exists":
      return "An account with this email already exists. Try signing in instead.";
    case "form_param_format_invalid":
      return "Double-check the email format and try again.";
    case "form_code_incorrect":
      return "That verification code is incorrect.";
    case "verification_expired":
      return "That code has expired. Request a new one and try again.";
    case "verification_failed":
      return "We couldn't verify that request. Please try again.";
    case "form_password_pwned":
    case "form_password_validation_failed":
      return "Choose a stronger password to protect your account.";
    case "form_too_many_attempts":
    case "form_too_manyAttempts":
    case "too_many_requests":
      return "Too many attempts. Please wait a moment and try again.";
    case "session_exists":
      return "You're already signed in on this device.";
    case "strategy_for_user_invalid":
      return "This account needs a different sign-in method.";
    default:
      return firstError?.longMessage || firstError?.message || fallbackMessage;
  }
}

import { useAuth } from "@/hooks/useAuth";
import { useThemeColor } from "@/hooks/useThemeColor";
import {
  COMMON_FONT_SIZES,
  COMMON_SPACING,
  responsiveDimensions,
  useResponsiveValue,
} from "@/utils/responsive";
import { router } from "expo-router";
import React, { useCallback, useState } from "react";
import { Alert, Platform, StyleSheet, View } from "react-native";
import { ThemedText } from "../ThemedText";
import { AuthLayout } from "./AuthLayout";
import { FormButton } from "./FormButton";
import { FormError } from "./FormError";
import { FormInput } from "./FormInput";

/**
 * Signup form validation interface
 * Interface Segregation Principle - focused on signup-specific validation
 */
interface SignupFormData {
  email: string;
  password: string;
  confirmPassword: string;
}

interface SignupFormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

/**
 * Password strength levels for validation feedback
 * Strategy Pattern: Different validation strategies for password strength
 */
type PasswordStrength = "weak" | "fair" | "good" | "strong";

interface PasswordValidation {
  strength: PasswordStrength;
  score: number;
  feedback: string[];
}

/**
 * Signup Screen Component
 *
 * Design Patterns Used:
 * - MVC Pattern: Separates presentation from business logic
 * - Observer Pattern: Reacts to auth state changes
 * - Strategy Pattern: Different validation strategies for different fields
 * - Command Pattern: Encapsulates signup and validation operations
 * - State Pattern: Manages complex form state with validation feedback
 */
export const SignupScreen: React.FC = () => {
  // Form state management
  const [formData, setFormData] = useState<SignupFormData>({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<SignupFormErrors>({});
  const [passwordValidation, setPasswordValidation] =
    useState<PasswordValidation | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auth hook
  const { signup, signupLoading, signupError } = useAuth();

  // Theme colors
  const textColor = useThemeColor({}, "text");
  const subtitleColor = useThemeColor(
    { light: "#6c757d", dark: "#8e8e93" },
    "text",
  );
  const successColor = useThemeColor(
    { light: "#28a745", dark: "#30d158" },
    "text",
  );
  const warningColor = useThemeColor(
    { light: "#ffc107", dark: "#ff9f0a" },
    "text",
  );
  const linkColor = useThemeColor(
    { light: "#007AFF", dark: "#0a84ff" },
    "tint",
  );
  const backgroundColor = useThemeColor(
    { light: "#e9ecef", dark: "#3a3a3c" },
    "background",
  );

  // Responsive values
  const titleSize = useResponsiveValue(
    COMMON_FONT_SIZES.xxl,
    COMMON_FONT_SIZES.title,
    COMMON_FONT_SIZES.title,
  );
  const logoSize = useResponsiveValue(60, 80, 100);

  /**
   * Password strength validator using Strategy Pattern
   * Implements different validation strategies based on security requirements
   */
  const validatePasswordStrength = useCallback(
    (password: string): PasswordValidation => {
      let score = 0;
      const feedback: string[] = [];

      // Length check
      if (password.length >= 8) {
        score += 1;
      } else {
        feedback.push("Use at least 8 characters");
      }

      // Lowercase check
      if (/[a-z]/.test(password)) {
        score += 1;
      } else {
        feedback.push("Include lowercase letters");
      }

      // Uppercase check
      if (/[A-Z]/.test(password)) {
        score += 1;
      } else {
        feedback.push("Include uppercase letters");
      }

      // Number check
      if (/\d/.test(password)) {
        score += 1;
      } else {
        feedback.push("Include numbers");
      }

      // Special character check
      if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        score += 1;
      } else {
        feedback.push("Include special characters");
      }

      // Determine strength based on score
      let strength: PasswordStrength;
      if (score <= 1) strength = "weak";
      else if (score <= 2) strength = "fair";
      else if (score <= 3) strength = "good";
      else strength = "strong";

      return { strength, score, feedback };
    },
    [],
  );

  /**
   * Form validation using Strategy Pattern
   */
  const validateForm = useCallback((): boolean => {
    const newErrors: SignupFormErrors = {};

    // Email validation strategy
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation strategy
    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    } else {
      const validation = validatePasswordStrength(formData.password);
      if (validation.score < 2) {
        newErrors.password =
          "Password is too weak. " + validation.feedback.join(", ");
      }
    }

    // Confirm password validation strategy
    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, validatePasswordStrength]);

  /**
   * Handle form field changes with real-time validation
   * Command Pattern: Encapsulates field update operations
   */
  const handleFieldChange = useCallback(
    (field: keyof SignupFormData, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));

      // Real-time password strength validation
      if (field === "password" && value.trim()) {
        setPasswordValidation(validatePasswordStrength(value));
      } else if (field === "password" && !value.trim()) {
        setPasswordValidation(null);
      }

      // Clear field-specific error when user starts typing
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    },
    [errors, validatePasswordStrength],
  );

  /**
   * Handle signup submission
   * Command Pattern: Encapsulates the signup operation
   */
  const handleSignup = useCallback(async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      signup({
        email: formData.email.trim(),
        password: formData.password,
      });

      // Show success message and navigate to login
      Alert.alert(
        "Account Created",
        "Your account has been created successfully. Please sign in.",
        [
          {
            text: "OK",
            onPress: () => router.replace("/auth/login"),
          },
        ],
      );
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Signup failed. Please try again.";

      setErrors({ general: errorMessage });

      if (__DEV__) {
        console.error("Signup error:", error);
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateForm, signup]);

  /**
   * Handle Google signup (Frontend placeholder)
   */
  const handleGoogleSignup = useCallback(async () => {
    Alert.alert(
      "Google Signup",
      "Google signup will be implemented when backend integration is ready.",
      [{ text: "OK" }],
    );
  }, []);

  /**
   * Navigate to login screen
   */
  const handleLoginNavigation = useCallback(() => {
    router.push("/auth/login");
  }, []);

  /**
   * Get password strength color
   * Factory Pattern: Creates appropriate color based on strength
   */
  const getPasswordStrengthColor = (strength: PasswordStrength): string => {
    switch (strength) {
      case "weak":
        return "#dc3545";
      case "fair":
        return warningColor;
      case "good":
        return "#fd7e14";
      case "strong":
        return successColor;
      default:
        return subtitleColor;
    }
  };

  /**
   * Render password strength indicator
   */
  const renderPasswordStrength = () => {
    if (!passwordValidation) return null;

    const strengthColor = getPasswordStrengthColor(passwordValidation.strength);

    return (
      <View style={styles.passwordStrengthContainer}>
        <View style={styles.strengthBarContainer}>
          {[1, 2, 3, 4, 5].map((index) => (
            <View
              key={index}
              style={[
                styles.strengthBar,
                {
                  backgroundColor:
                    index <= passwordValidation.score
                      ? strengthColor
                      : backgroundColor,
                },
              ]}
            />
          ))}
        </View>
        <ThemedText style={[styles.strengthText, { color: strengthColor }]}>
          {passwordValidation.strength.charAt(0).toUpperCase() +
            passwordValidation.strength.slice(1)}
        </ThemedText>
      </View>
    );
  };

  /**
   * Render header content
   */
  const renderHeader = () => (
    <View style={styles.header}>
      <View
        style={[styles.logoContainer, { width: logoSize, height: logoSize }]}
      >
        <ThemedText style={[styles.logoText, { fontSize: logoSize * 0.6 }]}>
          AI
        </ThemedText>
      </View>

      <ThemedText
        style={[styles.title, { fontSize: titleSize, color: textColor }]}
      >
        Create Account
      </ThemedText>
      <ThemedText style={[styles.subtitle, { color: subtitleColor }]}>
        Join us to get started with your AI assistant
      </ThemedText>
    </View>
  );

  /**
   * Render footer content
   */
  const renderFooter = () => (
    <View style={styles.footer}>
      <ThemedText style={[styles.footerText, { color: subtitleColor }]}>
        Already have an account?{" "}
        <ThemedText
          style={[styles.linkText, { color: linkColor }]}
          onPress={handleLoginNavigation}
        >
          Sign in
        </ThemedText>
      </ThemedText>
    </View>
  );

  return (
    <AuthLayout headerContent={renderHeader()} footerContent={renderFooter()}>
      <View style={styles.form}>
        {/* General Error Display */}
        <FormError message={errors.general || ""} visible={!!errors.general} />

        {/* Email Input */}
        <FormInput
          label="Email"
          placeholder="Enter your email"
          value={formData.email}
          onChangeText={(text) => handleFieldChange("email", text)}
          error={errors.email}
          leftIcon="mail-outline"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
        />

        {/* Password Input */}
        <FormInput
          label="Password"
          placeholder="Create a password"
          value={formData.password}
          onChangeText={(text) => handleFieldChange("password", text)}
          error={errors.password}
          leftIcon="lock-closed-outline"
          isPassword
          autoComplete="new-password"
          textContentType="newPassword"
        />

        {/* Password Strength Indicator */}
        {renderPasswordStrength()}

        {/* Confirm Password Input */}
        <FormInput
          label="Confirm Password"
          placeholder="Confirm your password"
          value={formData.confirmPassword}
          onChangeText={(text) => handleFieldChange("confirmPassword", text)}
          error={errors.confirmPassword}
          leftIcon="lock-closed-outline"
          isPassword
          autoComplete="new-password"
          textContentType="newPassword"
        />

        {/* Signup Button */}
        <FormButton
          title="Create Account"
          onPress={handleSignup}
          loading={isSubmitting || signupLoading}
          disabled={isSubmitting || signupLoading}
          variant="primary"
          containerStyle={styles.signupButton}
        />

        {/* Divider */}
        <View style={styles.dividerContainer}>
          <View
            style={[styles.dividerLine, { backgroundColor: subtitleColor }]}
          />
          <ThemedText style={[styles.dividerText, { color: subtitleColor }]}>
            or
          </ThemedText>
          <View
            style={[styles.dividerLine, { backgroundColor: subtitleColor }]}
          />
        </View>

        {/* Google Signup Button */}
        <FormButton
          title="Continue with Google"
          onPress={handleGoogleSignup}
          variant="google"
          leftIcon="logo-google"
          containerStyle={styles.googleButton}
        />
      </View>
    </AuthLayout>
  );
};

/**
 * Responsive styles
 */
const styles = StyleSheet.create({
  header: {
    alignItems: "center",
  },
  logoContainer: {
    borderRadius: 20,
    backgroundColor: "#007AFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: COMMON_SPACING.lg,
    ...Platform.select({
      ios: {
        shadowColor: "#007AFF",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: "0 4px 12px rgba(0, 122, 255, 0.3)",
      },
    }),
  },
  logoText: {
    color: "#fff",
    fontWeight: "bold",
  },
  title: {
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: COMMON_SPACING.sm,
  },
  subtitle: {
    textAlign: "center",
    fontSize: COMMON_FONT_SIZES.md,
    lineHeight: responsiveDimensions.fontSize(22),
  },
  form: {
    width: "100%",
  },
  passwordStrengthContainer: {
    marginTop: -COMMON_SPACING.sm,
    marginBottom: COMMON_SPACING.md,
  },
  strengthBarContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: COMMON_SPACING.xs,
  },
  strengthBar: {
    flex: 1,
    height: 3,
    marginHorizontal: 1,
    borderRadius: 2,
  },
  strengthText: {
    fontSize: COMMON_FONT_SIZES.xs,
    fontWeight: "500",
  },
  signupButton: {
    marginTop: COMMON_SPACING.md,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: COMMON_SPACING.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    opacity: 0.3,
  },
  dividerText: {
    marginHorizontal: COMMON_SPACING.md,
    fontSize: COMMON_FONT_SIZES.sm,
  },
  googleButton: {
    marginBottom: COMMON_SPACING.md,
  },
  footer: {
    alignItems: "center",
  },
  footerText: {
    fontSize: COMMON_FONT_SIZES.md,
    textAlign: "center",
  },
  linkText: {
    fontWeight: "600",
  },
});

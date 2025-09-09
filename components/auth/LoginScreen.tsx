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
 * Form validation interface
 * Interface Segregation Principle - focused on validation concerns
 */
interface LoginFormData {
  email: string;
  password: string;
}

interface LoginFormErrors {
  email?: string;
  password?: string;
  general?: string;
}

/**
 * Login Screen Component
 *
 * Design Patterns Used:
 * - MVC Pattern: Separates presentation (View) from business logic (Controller)
 * - Observer Pattern: Reacts to auth state changes via useAuth hook
 * - Strategy Pattern: Different validation strategies for different fields
 * - Command Pattern: Encapsulates login and Google login actions
 * - State Pattern: Manages form state, validation state, and loading states
 */
export const LoginScreen: React.FC = () => {
  // Form state management using State Pattern
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<LoginFormErrors>({});

  // Auth hook using Observer Pattern
  const { login, loginLoading, loginError } = useAuth();

  // Theme colors
  const textColor = useThemeColor({}, "text");
  const subtitleColor = useThemeColor(
    { light: "#6c757d", dark: "#8e8e93" },
    "text",
  );
  const linkColor = useThemeColor(
    { light: "#007AFF", dark: "#0a84ff" },
    "tint",
  );
  // Responsive values
  const titleSize = useResponsiveValue(
    COMMON_FONT_SIZES.xxl,
    COMMON_FONT_SIZES.title,
    COMMON_FONT_SIZES.title,
  );
  const logoSize = useResponsiveValue(60, 80, 100);

  /**
   * Form validation using Strategy Pattern
   * Different validation strategies for different field types
   */
  const validateForm = useCallback((): boolean => {
    const newErrors: LoginFormErrors = {};

    // Email validation strategy
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation strategy
    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  /**
   * Handle form field changes
   * Command Pattern: Encapsulates field update operations
   */
  const handleFieldChange = useCallback(
    (field: keyof LoginFormData, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));

      // Clear field-specific error when user starts typing
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    },
    [errors],
  );

  /**
   * Handle email/password login
   * Command Pattern: Encapsulates the login operation
   */
  const handleLogin = useCallback(async () => {
    if (!validateForm()) {
      return;
    }

    setErrors({}); // Clear any previous errors

    login({
      email: formData.email.trim(),
      password: formData.password,
    });

    // Navigation will be handled by auth state change
    // This follows the Observer Pattern - UI reacts to auth state changes
  }, [formData, validateForm, login]);

  /**
   * Handle Google login (Frontend only for now)
   * Command Pattern: Encapsulates Google login operation
   *
   * Note: This is a placeholder implementation
   * Will be integrated with actual Google OAuth when backend is ready
   */
  const handleGoogleLogin = useCallback(async () => {
    try {
      // Placeholder alert for now
      Alert.alert(
        "Google Login",
        "Google login will be implemented when backend integration is ready.",
        [{ text: "OK" }],
      );

      // TODO: Implement actual Google OAuth flow
      // This would typically involve:
      // 1. Google OAuth SDK initialization
      // 2. User authentication with Google
      // 3. Sending Google token to backend
      // 4. Receiving JWT token from backend
      // 5. Setting auth state
    } catch (error: any) {
      setErrors({ general: "Google login failed. Please try again." });
      console.error("Google login error:", error);
    }
  }, []);

  /**
   * Navigate to signup screen
   */
  const handleSignupNavigation = useCallback(() => {
    router.push("/auth/signup");
  }, []);

  /**
   * Render header content using Template Method Pattern
   */
  const renderHeader = () => (
    <View style={styles.header}>
      {/* App Logo/Icon */}
      <View
        style={[styles.logoContainer, { width: logoSize, height: logoSize }]}
      >
        <ThemedText style={[styles.logoText, { fontSize: logoSize * 0.6 }]}>
          AI
        </ThemedText>
      </View>

      {/* Welcome Text */}
      <ThemedText
        style={[styles.title, { fontSize: titleSize, color: textColor }]}
      >
        Welcome Back
      </ThemedText>
      <ThemedText style={[styles.subtitle, { color: subtitleColor }]}>
        Sign in to your account to continue
      </ThemedText>
    </View>
  );

  /**
   * Render footer content with signup link
   */
  const renderFooter = () => (
    <View style={styles.footer}>
      <ThemedText style={[styles.footerText, { color: subtitleColor }]}>
        Don&apos;t have an account?{" "}
        <ThemedText
          style={[styles.linkText, { color: linkColor }]}
          onPress={handleSignupNavigation}
        >
          Sign up
        </ThemedText>
      </ThemedText>
    </View>
  );

  return (
    <AuthLayout headerContent={renderHeader()} footerContent={renderFooter()}>
      <View style={styles.form}>
        {/* General Error Display */}
        <FormError
          message={errors.general || loginError || ""}
          visible={!!errors.general || !!loginError}
        />

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
          placeholder="Enter your password"
          value={formData.password}
          onChangeText={(text) => handleFieldChange("password", text)}
          error={errors.password}
          leftIcon="lock-closed-outline"
          isPassword
          autoComplete="current-password"
          textContentType="password"
        />

        {/* Login Button */}
        <FormButton
          title="Sign In"
          onPress={handleLogin}
          loading={loginLoading}
          disabled={loginLoading}
          variant="primary"
          containerStyle={styles.loginButton}
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

        {/* Google Login Button */}
        <FormButton
          title="Continue with Google"
          onPress={handleGoogleLogin}
          variant="google"
          leftIcon="logo-google"
          containerStyle={styles.googleButton}
        />
      </View>
    </AuthLayout>
  );
};

/**
 * Responsive styles using Factory Pattern
 * Creates optimized styles for different screen sizes and platforms
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
    // Platform-specific shadows
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
  loginButton: {
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

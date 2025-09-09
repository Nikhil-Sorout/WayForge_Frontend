import { useThemeColor } from "@/hooks/useThemeColor";
import { authSelectors, useAuthStore } from "@/store/authStore";
import { COMMON_FONT_SIZES, COMMON_SPACING } from "@/utils/responsive";
import { router } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { ThemedText } from "../ThemedText";
import { ThemedView } from "../ThemedView";

/**
 * AuthGuard Props Interface
 */
interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

/**
 * Authentication Guard Component
 *
 * Design Patterns Used:
 * - Guard Pattern: Controls access to protected routes based on auth state
 * - Observer Pattern: Reacts to authentication state changes
 * - Strategy Pattern: Different behaviors for authenticated vs unauthenticated users
 * - Template Method Pattern: Defines the authentication check algorithm
 */
export const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  fallback,
  redirectTo = "/auth/login",
}) => {
  // Auth state using selectors for optimized subscriptions
  const isAuthenticated = useAuthStore(authSelectors.isAuthenticated);
  const isLoading = useAuthStore(authSelectors.isLoading);
  const token = useAuthStore(authSelectors.token);

  // Theme colors
  const textColor = useThemeColor({}, "text");
  const primaryColor = useThemeColor(
    { light: "#007AFF", dark: "#0a84ff" },
    "tint",
  );

  /**
   * Handle authentication state changes
   * Observer Pattern: Responds to auth state updates
   */
  useEffect(() => {
    // Skip redirect during initial loading
    if (isLoading) return;

    // Redirect to auth if not authenticated
    if (!isAuthenticated || !token) {
      router.replace(redirectTo as any);
    }
  }, [isAuthenticated, isLoading, token, redirectTo]);

  /**
   * Render loading state during authentication check
   */
  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={primaryColor} />
          <ThemedText style={[styles.loadingText, { color: textColor }]}>
            Loading...
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  /**
   * Render fallback or redirect if not authenticated
   */
  if (!isAuthenticated || !token) {
    if (fallback) {
      return <>{fallback}</>;
    }

    // Return null while redirecting
    return null;
  }

  /**
   * Render protected content if authenticated
   */
  return <>{children}</>;
};

/**
 * Styles for the auth guard loading state
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: COMMON_SPACING.md,
    fontSize: COMMON_FONT_SIZES.md,
  },
});

import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Stack } from "expo-router";

/**
 * Authentication Stack Layout
 *
 * Design Patterns Used:
 * - Template Method Pattern: Defines the navigation structure for auth screens
 * - Strategy Pattern: Different navigation strategies for different platforms
 * - Observer Pattern: Reacts to color scheme changes
 */
export default function AuthLayout() {
  const colorScheme = useColorScheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        // Platform-specific presentation styles
        presentation: "card",
        animation: "slide_from_right",
        // Theme-aware colors
        contentStyle: {
          backgroundColor: Colors[colorScheme ?? "light"].background,
        },
      }}
    >
      {/* Login Screen */}
      <Stack.Screen
        name="login"
        options={{
          title: "Sign In",
        }}
      />

      {/* Signup Screen */}
      <Stack.Screen
        name="signup"
        options={{
          title: "Create Account",
        }}
      />
    </Stack>
  );
}

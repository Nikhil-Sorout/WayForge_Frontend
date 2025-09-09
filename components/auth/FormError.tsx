import { useThemeColor } from "@/hooks/useThemeColor";
import {
  COMMON_BORDER_RADIUS,
  COMMON_FONT_SIZES,
  COMMON_SPACING,
  responsiveDimensions,
} from "@/utils/responsive";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, View } from "react-native";
import { ThemedText } from "../ThemedText";

/**
 * FormError Props Interface
 * Single Responsibility Principle - focused only on error display
 */
export interface FormErrorProps {
  message: string;
  visible?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  containerStyle?: any;
}

/**
 * Reusable Form Error Component
 *
 * Design Patterns Used:
 * - Null Object Pattern: Handles empty/invisible states gracefully
 * - Composition Pattern: Combines icon and text elements
 * - Strategy Pattern: Different error display strategies (with/without icon)
 */
export const FormError: React.FC<FormErrorProps> = ({
  message,
  visible = true,
  icon = "alert-circle",
  containerStyle,
}) => {
  // Theme colors using Dependency Inversion Principle
  const errorColor = useThemeColor(
    { light: "#dc3545", dark: "#ff453a" },
    "text",
  );
  const errorBackgroundColor = useThemeColor(
    { light: "#f8d7da", dark: "#2d1b1e" },
    "background",
  );

  // Null Object Pattern - return null if not visible
  if (!visible || !message) {
    return null;
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: errorBackgroundColor },
        containerStyle,
      ]}
    >
      {/* Error icon */}
      {icon && (
        <Ionicons
          name={icon}
          size={responsiveDimensions.fontSize(16)}
          color={errorColor}
          style={styles.icon}
        />
      )}

      {/* Error message */}
      <ThemedText
        style={[
          styles.errorText,
          {
            color: errorColor,
            fontSize: COMMON_FONT_SIZES.sm,
          },
        ]}
      >
        {message}
      </ThemedText>
    </View>
  );
};

/**
 * Responsive styles optimized for error display
 */
const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: COMMON_SPACING.md,
    paddingVertical: COMMON_SPACING.sm,
    borderRadius: COMMON_BORDER_RADIUS.sm,
    marginVertical: COMMON_SPACING.xs,
  },
  icon: {
    marginRight: COMMON_SPACING.sm,
  },
  errorText: {
    flex: 1,
    lineHeight: responsiveDimensions.fontSize(20),
  },
});

import { useThemeColor } from "@/hooks/useThemeColor";
import {
  COMMON_BORDER_RADIUS,
  COMMON_FONT_SIZES,
  COMMON_SPACING,
  responsiveDimensions,
} from "@/utils/responsive";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  TextStyle,
  TouchableOpacity,
  ViewStyle,
} from "react-native";
import { ThemedText } from "../ThemedText";

/**
 * Button variant types for different use cases
 * Strategy Pattern: Different visual strategies for different button purposes
 */
export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "google";

/**
 * Button size options for responsive design
 */
export type ButtonSize = "small" | "medium" | "large";

/**
 * FormButton Props Interface
 * Interface Segregation Principle - focused on button-specific functionality
 */
export interface FormButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  containerStyle?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

/**
 * Reusable Form Button Component
 *
 * Design Patterns Used:
 * - Strategy Pattern: Different button variants with unique styling strategies
 * - State Pattern: Manages disabled, loading, and pressed states
 * - Factory Pattern: Creates appropriate styles based on variant and size
 * - Template Method Pattern: Defines button structure while allowing customization
 */
export const FormButton: React.FC<FormButtonProps> = ({
  title,
  onPress,
  variant = "primary",
  size = "medium",
  disabled = false,
  loading = false,
  leftIcon,
  rightIcon,
  containerStyle,
  textStyle,
  fullWidth = true,
}) => {
  // Theme colors using Dependency Inversion Principle
  const primaryColor = useThemeColor(
    { light: "#007AFF", dark: "#0a84ff" },
    "tint",
  );
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const background = useThemeColor(
    { light: "#f8f9fa", dark: "#2c2c2e" },
    "background",
  );
  const border = useThemeColor({ light: "#e1e5e9", dark: "#3a3a3c" }, "text");

  /**
   * Button style factory based on variant
   * Factory Pattern: Creates appropriate styles for each button type
   */
  const getButtonStyles = (): ViewStyle => {
    const baseStyle = {
      ...styles.button,
      ...getSizeStyles(size),
      ...(fullWidth && { width: "100%" as `${number}%` }),
      ...(disabled && { opacity: 0.6 }),
    };

    switch (variant) {
      case "primary":
        return {
          ...baseStyle,
          backgroundColor: primaryColor,
        };

      case "secondary":
        return {
          ...baseStyle,
          backgroundColor: background,
          borderWidth: 1,
          borderColor: border,
        };

      case "outline":
        return {
          ...baseStyle,
          backgroundColor: "transparent",
          borderWidth: 1,
          borderColor: primaryColor,
        };

      case "ghost":
        return {
          ...baseStyle,
          backgroundColor: "transparent",
        };

      case "google":
        return {
          ...baseStyle,
          backgroundColor: "#fff",
          borderWidth: 1,
          borderColor: "#dadce0",
          // Google-specific shadow
          ...Platform.select({
            ios: {
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
            },
            android: {
              elevation: 2,
            },
            web: {
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
            },
          }),
        };

      default:
        return baseStyle;
    }
  };

  /**
   * Text style factory based on variant
   * Factory Pattern: Creates appropriate text styles for each button type
   */
  const getTextStyles = (): TextStyle => {
    const baseTextStyle = {
      ...styles.buttonText,
      fontSize: getFontSize(size),
    };

    switch (variant) {
      case "primary":
        return {
          ...baseTextStyle,
          color: "#fff",
        };

      case "secondary":
      case "ghost":
        return {
          ...baseTextStyle,
          color: textColor,
        };

      case "outline":
        return {
          ...baseTextStyle,
          color: primaryColor,
        };

      case "google":
        return {
          ...baseTextStyle,
          color: "#3c4043",
        };

      default:
        return baseTextStyle;
    }
  };

  /**
   * Size-based style factory
   * Template Method Pattern: Defines size calculation algorithm
   */
  const getSizeStyles = (buttonSize: ButtonSize): ViewStyle => {
    switch (buttonSize) {
      case "small":
        return {
          paddingHorizontal: COMMON_SPACING.md,
          paddingVertical: COMMON_SPACING.sm,
          minHeight: responsiveDimensions.spacing(36),
        };

      case "medium":
        return {
          paddingHorizontal: COMMON_SPACING.lg,
          paddingVertical: COMMON_SPACING.md,
          minHeight: responsiveDimensions.spacing(48),
        };

      case "large":
        return {
          paddingHorizontal: COMMON_SPACING.xl,
          paddingVertical: COMMON_SPACING.lg,
          minHeight: responsiveDimensions.spacing(56),
        };

      default:
        return {};
    }
  };

  /**
   * Font size factory based on button size
   */
  const getFontSize = (buttonSize: ButtonSize): number => {
    switch (buttonSize) {
      case "small":
        return COMMON_FONT_SIZES.sm;
      case "medium":
        return COMMON_FONT_SIZES.md;
      case "large":
        return COMMON_FONT_SIZES.lg;
      default:
        return COMMON_FONT_SIZES.md;
    }
  };

  /**
   * Loading indicator color based on variant
   */
  const getLoadingColor = (): string => {
    switch (variant) {
      case "primary":
        return "#fff";
      case "google":
        return "#3c4043";
      case "outline":
        return primaryColor;
      default:
        return textColor;
    }
  };

  return (
    <TouchableOpacity
      style={[getButtonStyles(), containerStyle]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      // Web-specific accessibility
      {...Platform.select({
        web: {
          accessibilityRole: "button",
        },
      })}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={getLoadingColor()}
          style={styles.loadingIndicator}
        />
      ) : (
        <>
          {/* Left icon */}
          {leftIcon && (
            <Ionicons
              name={leftIcon}
              size={responsiveDimensions.fontSize(18)}
              color={getTextStyles().color}
              style={styles.leftIcon}
            />
          )}

          {/* Button text */}
          <ThemedText style={[getTextStyles(), textStyle]}>{title}</ThemedText>

          {/* Right icon */}
          {rightIcon && (
            <Ionicons
              name={rightIcon}
              size={responsiveDimensions.fontSize(18)}
              color={getTextStyles().color}
              style={styles.rightIcon}
            />
          )}
        </>
      )}
    </TouchableOpacity>
  );
};

/**
 * Responsive styles using Factory Pattern
 * Creates platform-optimized styles based on device capabilities
 */
const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: COMMON_BORDER_RADIUS.md,
    // Platform-specific optimizations
    ...Platform.select({
      web: {
        cursor: "pointer",
        userSelect: "none",
        transition: "all 0.2s ease",
      },
    }),
  },
  buttonText: {
    fontWeight: "600",
    textAlign: "center",
  },
  loadingIndicator: {
    // Ensure loading indicator takes up same space as text
  },
  leftIcon: {
    marginRight: COMMON_SPACING.sm,
  },
  rightIcon: {
    marginLeft: COMMON_SPACING.sm,
  },
});

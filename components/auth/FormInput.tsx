import { useThemeColor } from "@/hooks/useThemeColor";
import {
  COMMON_BORDER_RADIUS,
  COMMON_FONT_SIZES,
  COMMON_SPACING,
  responsiveDimensions,
} from "@/utils/responsive";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Platform,
  StyleSheet,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from "react-native";
import { ThemedText } from "../ThemedText";

/**
 * FormInput Props Interface
 * Interface Segregation Principle - only includes necessary input-related props
 */
export interface FormInputProps extends Omit<TextInputProps, "style"> {
  label?: string;
  error?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  containerStyle?: any;
  inputStyle?: any;
  isPassword?: boolean;
}

/**
 * Reusable Form Input Component
 *
 * Design Patterns Used:
 * - Composition Pattern: Combines multiple UI elements (label, input, icon, error)
 * - Strategy Pattern: Different validation strategies based on input type
 * - State Pattern: Manages focus, error, and password visibility states
 */
export const FormInput: React.FC<FormInputProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  inputStyle,
  isPassword = false,
  ...textInputProps
}) => {
  // State management for component behavior
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  // Theme colors using Dependency Inversion Principle
  const textColor = useThemeColor({}, "text");
  const backgroundColor = useThemeColor(
    { light: "#f8f9fa", dark: "#2c2c2e" },
    "background",
  );
  const borderColor = useThemeColor(
    {
      light: error ? "#dc3545" : isFocused ? "#007AFF" : "#e1e5e9",
      dark: error ? "#ff453a" : isFocused ? "#0a84ff" : "#3a3a3c",
    },
    "text",
  );
  const placeholderColor = useThemeColor(
    { light: "#6c757d", dark: "#8e8e93" },
    "text",
  );
  const errorColor = useThemeColor(
    { light: "#dc3545", dark: "#ff453a" },
    "text",
  );

  /**
   * Password visibility toggle handler
   * Command Pattern: Encapsulates the toggle action
   */
  const handlePasswordToggle = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  // Determine the actual right icon to show
  const actualRightIcon = isPassword
    ? isPasswordVisible
      ? "eye-off"
      : "eye"
    : rightIcon;

  const actualOnRightIconPress = isPassword
    ? handlePasswordToggle
    : onRightIconPress;

  return (
    <View style={[styles.container, containerStyle]}>
      {/* Label with responsive typography */}
      {label && <ThemedText style={styles.label}>{label}</ThemedText>}

      {/* Input container with responsive layout */}
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor,
            borderColor,
            borderWidth: isFocused ? 2 : 1,
          },
        ]}
      >
        {/* Left icon */}
        {leftIcon && (
          <Ionicons
            name={leftIcon}
            size={responsiveDimensions.fontSize(20)}
            color={placeholderColor}
            style={styles.leftIcon}
          />
        )}

        {/* Text input with responsive styling */}
        <TextInput
          {...textInputProps}
          style={[
            styles.input,
            {
              color: textColor,
              fontSize: COMMON_FONT_SIZES.md,
            },
            inputStyle,
          ]}
          placeholderTextColor={placeholderColor}
          secureTextEntry={isPassword && !isPasswordVisible}
          onFocus={(e) => {
            setIsFocused(true);
            textInputProps.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            textInputProps.onBlur?.(e);
          }}
          // Web-specific optimizations
          {...(Platform.OS === "web" && {
            autoComplete: isPassword
              ? "current-password"
              : textInputProps.autoComplete,
          })}
        />

        {/* Right icon with touch handling */}
        {actualRightIcon && (
          <TouchableOpacity
            onPress={actualOnRightIconPress}
            style={styles.rightIconContainer}
            activeOpacity={0.7}
          >
            <Ionicons
              name={actualRightIcon}
              size={responsiveDimensions.fontSize(20)}
              color={placeholderColor}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Error message with responsive typography */}
      {error && (
        <ThemedText
          style={[
            styles.errorText,
            { color: errorColor, fontSize: COMMON_FONT_SIZES.sm },
          ]}
        >
          {error}
        </ThemedText>
      )}
    </View>
  );
};

/**
 * Responsive styles using Factory Pattern
 * Creates platform-optimized styles based on device type
 */
const styles = StyleSheet.create({
  container: {
    marginBottom: COMMON_SPACING.md,
  },
  label: {
    fontSize: COMMON_FONT_SIZES.sm,
    fontWeight: "600",
    marginBottom: COMMON_SPACING.xs,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: COMMON_BORDER_RADIUS.md,
    paddingHorizontal: COMMON_SPACING.md,
    minHeight: responsiveDimensions.spacing(48),
    // Platform-specific shadows
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
  },
  input: {
    flex: 1,
    paddingVertical: COMMON_SPACING.sm,
    // Web-specific styles
    ...Platform.select({
      web: {
        outline: "none",
      },
    }),
  },
  leftIcon: {
    marginRight: COMMON_SPACING.sm,
  },
  rightIconContainer: {
    padding: COMMON_SPACING.xs,
    marginLeft: COMMON_SPACING.sm,
  },
  errorText: {
    marginTop: COMMON_SPACING.xs,
    marginLeft: COMMON_SPACING.xs,
  },
});

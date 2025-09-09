import { useThemeColor } from "@/hooks/useThemeColor";
import {
  COMMON_SPACING,
  layoutHelpers,
  platformResponsive,
  responsive,
  useResponsiveValue,
} from "@/utils/responsive";
import { StatusBar } from "expo-status-bar";
import React, { ReactNode } from "react";
import {
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedView } from "../ThemedView";

/**
 * AuthLayout Props Interface
 * Interface Segregation Principle - focused on layout-specific props
 */
export interface AuthLayoutProps {
  children: ReactNode;
  showBackButton?: boolean;
  onBackPress?: () => void;
  headerContent?: ReactNode;
  footerContent?: ReactNode;
  scrollable?: boolean;
}

/**
 * Authentication Layout Component
 *
 * Design Patterns Used:
 * - Template Method Pattern: Defines the overall auth screen structure
 * - Composite Pattern: Combines multiple layout elements (header, content, footer)
 * - Strategy Pattern: Different layout strategies for mobile vs desktop
 * - Adapter Pattern: Adapts to different platform requirements (iOS, Android, Web)
 */
export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  showBackButton = false,
  onBackPress,
  headerContent,
  footerContent,
  scrollable = true,
}) => {
  // Theme colors
  const backgroundColor = useThemeColor({}, "background");

  // Responsive values using Strategy Pattern
  const containerMaxWidth = layoutHelpers.getContainerMaxWidth() as any;
  const containerPadding = layoutHelpers.getContainerPadding();

  // Device-specific layout adjustments
  const isDesktop = responsive.isDevice("desktop");
  const contentAlignment = useResponsiveValue(
    "center",
    "center",
    "center",
  ) as "center";

  // Header sections styles
  const headerSectionStyle = [
    styles.headerSection,
    {
      marginTop: useResponsiveValue(
        COMMON_SPACING.lg,
        COMMON_SPACING.xl,
        COMMON_SPACING.xxl,
      ),
    },
  ];

  /**
   * Render content with appropriate scrolling behavior
   * Strategy Pattern: Different content rendering strategies
   */
  const renderContent = () => {
    const contentStyle = [
      styles.content,
      {
        paddingHorizontal: containerPadding,
        maxWidth: containerMaxWidth,
        alignSelf: contentAlignment,
      },
    ];

    if (scrollable) {
      return (
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingHorizontal: containerPadding },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          // Web-specific optimizations
          {...platformResponsive.select({
            web: {
              contentContainerStyle: {
                minHeight: "100%",
                justifyContent: isDesktop ? "center" : "flex-start",
              },
            },
            default: {},
          })}
        >
          <View
            style={[
              {
                maxWidth: containerMaxWidth as `${number}%`,
                alignSelf: contentAlignment,
              },
            ]}
          >
            {headerContent && (
              <View style={headerSectionStyle}>{headerContent}</View>
            )}

            <View style={styles.mainContent}>{children}</View>

            {footerContent && (
              <View style={styles.footerSection}>{footerContent}</View>
            )}
          </View>
        </ScrollView>
      );
    }

    return (
      <View style={contentStyle}>
        {headerContent && (
          <View style={headerSectionStyle}>{headerContent}</View>
        )}

        <View style={styles.mainContent}>{children}</View>

        {footerContent && (
          <View style={styles.footerSection}>{footerContent}</View>
        )}
      </View>
    );
  };

  /**
   * Main layout structure using Template Method Pattern
   * Defines the skeleton of the auth layout algorithm
   */
  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
      <StatusBar style="auto" />

      {/* KeyboardAvoidingView for mobile platforms */}
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={platformResponsive.select({
          ios: "padding",
          android: "height",
          default: undefined,
        })}
        keyboardVerticalOffset={platformResponsive.select({
          ios: 0,
          android: 20,
          default: 0,
        })}
      >
        <ThemedView style={styles.container}>{renderContent()}</ThemedView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

/**
 * Responsive styles using Composite Pattern
 * Combines multiple style concerns into a cohesive layout
 */
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    // Desktop-specific centering
    ...platformResponsive.select({
      web: {
        minHeight: "100vh",
      } as any,
      default: {},
    }),
  },
  content: {
    flex: 1,
    width: "100%",
  },
  headerSection: {
    marginBottom: COMMON_SPACING.xl,
  },
  mainContent: {
    flex: 1,
  },
  footerSection: {
    marginTop: COMMON_SPACING.xl,
    paddingBottom: COMMON_SPACING.lg,
  },
});

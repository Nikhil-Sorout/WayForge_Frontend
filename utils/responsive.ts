import { Dimensions, PixelRatio, Platform } from "react-native";

// Get device dimensions
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

/**
 * Breakpoint system for responsive design
 * Following Material Design and common web breakpoints
 */
export const BREAKPOINTS = {
  xs: 0, // Extra small devices (phones)
  sm: 576, // Small devices (large phones)
  md: 768, // Medium devices (tablets)
  lg: 992, // Large devices (desktops)
  xl: 1200, // Extra large devices (large desktops)
  xxl: 1400, // Extra extra large devices
} as const;

/**
 * Device type classification based on screen width
 */
export type DeviceType = "mobile" | "tablet" | "desktop";

/**
 * Responsive utility class implementing Singleton pattern
 * Provides consistent responsive behavior across platforms
 */
class ResponsiveManager {
  private static instance: ResponsiveManager;
  private dimensions = { width: SCREEN_WIDTH, height: SCREEN_HEIGHT };

  private constructor() {
    // Listen for dimension changes
    const subscription = Dimensions.addEventListener("change", ({ window }) => {
      this.dimensions = { width: window.width, height: window.height };
    });
  }

  /**
   * Singleton pattern implementation
   */
  public static getInstance(): ResponsiveManager {
    if (!ResponsiveManager.instance) {
      ResponsiveManager.instance = new ResponsiveManager();
    }
    return ResponsiveManager.instance;
  }

  /**
   * Get current device type based on screen width
   * Strategy Pattern: Different strategies for different device types
   */
  public getDeviceType(): DeviceType {
    const { width } = this.dimensions;

    if (width < BREAKPOINTS.md) return "mobile";
    if (width < BREAKPOINTS.lg) return "tablet";
    return "desktop";
  }

  /**
   * Check if current device matches a specific type
   */
  public isDevice(type: DeviceType): boolean {
    return this.getDeviceType() === type;
  }

  /**
   * Get current screen dimensions
   */
  public getDimensions() {
    return this.dimensions;
  }

  /**
   * Check if screen width is at least the specified breakpoint
   */
  public isBreakpoint(breakpoint: keyof typeof BREAKPOINTS): boolean {
    return this.dimensions.width >= BREAKPOINTS[breakpoint];
  }
}

// Export singleton instance
export const responsive = ResponsiveManager.getInstance();

/**
 * Responsive dimension helpers
 * Factory Pattern: Creates different types of responsive values
 */
export const responsiveDimensions = {
  /**
   * Get responsive width based on percentage of screen width
   */
  width: (percentage: number): number => {
    return (SCREEN_WIDTH * percentage) / 100;
  },

  /**
   * Get responsive height based on percentage of screen height
   */
  height: (percentage: number): number => {
    return (SCREEN_HEIGHT * percentage) / 100;
  },

  /**
   * Get responsive font size based on device type
   * Template Method Pattern: Algorithm structure with customizable steps
   */
  fontSize: (base: number): number => {
    const deviceType = responsive.getDeviceType();
    const scaleFactor = PixelRatio.getFontScale();

    let multiplier: number;
    switch (deviceType) {
      case "mobile":
        multiplier = 1;
        break;
      case "tablet":
        multiplier = 1.2;
        break;
      case "desktop":
        multiplier = 1.1;
        break;
      default:
        multiplier = 1;
    }

    return Math.round(base * multiplier * scaleFactor);
  },

  /**
   * Get responsive spacing based on device type
   */
  spacing: (base: number): number => {
    const deviceType = responsive.getDeviceType();

    switch (deviceType) {
      case "mobile":
        return base;
      case "tablet":
        return Math.round(base * 1.3);
      case "desktop":
        return Math.round(base * 1.5);
      default:
        return base;
    }
  },

  /**
   * Get responsive border radius
   */
  borderRadius: (base: number): number => {
    const deviceType = responsive.getDeviceType();

    switch (deviceType) {
      case "mobile":
        return base;
      case "tablet":
      case "desktop":
        return Math.round(base * 1.2);
      default:
        return base;
    }
  },
};

/**
 * Platform-specific responsive values
 * Strategy Pattern: Different behavior for different platforms
 */
export const platformResponsive = {
  /**
   * Get platform-specific value
   */
  select: <T>(values: { ios?: T; android?: T; web?: T; default: T }): T => {
    if (Platform.OS === "ios" && values.ios !== undefined) {
      return values.ios;
    }
    if (Platform.OS === "android" && values.android !== undefined) {
      return values.android;
    }
    if (Platform.OS === "web" && values.web !== undefined) {
      return values.web;
    }
    return values.default;
  },

  /**
   * Get web-specific responsive behavior
   */
  webOnly: <T>(webValue: T, fallback: T): T => {
    return Platform.OS === "web" ? webValue : fallback;
  },
};

/**
 * Responsive layout helpers
 */
export const layoutHelpers = {
  /**
   * Get container max width based on device type
   * Ensures optimal reading width on larger screens
   */
  getContainerMaxWidth: (): number | string => {
    const deviceType = responsive.getDeviceType();

    switch (deviceType) {
      case "mobile":
        return "100%";
      case "tablet":
        return responsiveDimensions.width(80);
      case "desktop":
        return 480; // Fixed max width for forms on desktop
      default:
        return "100%";
    }
  },

  /**
   * Get responsive padding for containers
   */
  getContainerPadding: () => {
    const deviceType = responsive.getDeviceType();

    switch (deviceType) {
      case "mobile":
        return responsiveDimensions.spacing(16);
      case "tablet":
        return responsiveDimensions.spacing(24);
      case "desktop":
        return responsiveDimensions.spacing(32);
      default:
        return 16;
    }
  },

  /**
   * Get responsive margin between elements
   */
  getElementSpacing: () => {
    return responsiveDimensions.spacing(16);
  },
};

/**
 * Responsive style object creator
 * Builder Pattern: Constructs complex responsive styles step by step
 */
export class ResponsiveStyleBuilder {
  private styles: any = {};

  public addWidth(
    mobile: number | string,
    tablet?: number | string,
    desktop?: number | string,
  ) {
    const deviceType = responsive.getDeviceType();

    switch (deviceType) {
      case "mobile":
        this.styles.width = mobile;
        break;
      case "tablet":
        this.styles.width = tablet || mobile;
        break;
      case "desktop":
        this.styles.width = desktop || tablet || mobile;
        break;
    }

    return this;
  }

  public addPadding(mobile: number, tablet?: number, desktop?: number) {
    const deviceType = responsive.getDeviceType();

    switch (deviceType) {
      case "mobile":
        this.styles.padding = mobile;
        break;
      case "tablet":
        this.styles.padding = tablet || mobile;
        break;
      case "desktop":
        this.styles.padding = desktop || tablet || mobile;
        break;
    }

    return this;
  }

  public addMargin(mobile: number, tablet?: number, desktop?: number) {
    const deviceType = responsive.getDeviceType();

    switch (deviceType) {
      case "mobile":
        this.styles.margin = mobile;
        break;
      case "tablet":
        this.styles.margin = tablet || mobile;
        break;
      case "desktop":
        this.styles.margin = desktop || tablet || mobile;
        break;
    }

    return this;
  }

  public build() {
    return this.styles;
  }
}

/**
 * Hook-like function for responsive values in functional components
 * Observer Pattern: Automatically updates when dimensions change
 */
export const useResponsiveValue = <T>(
  mobileValue: T,
  tabletValue?: T,
  desktopValue?: T,
): T => {
  const deviceType = responsive.getDeviceType();

  switch (deviceType) {
    case "mobile":
      return mobileValue;
    case "tablet":
      return tabletValue || mobileValue;
    case "desktop":
      return desktopValue || tabletValue || mobileValue;
    default:
      return mobileValue;
  }
};

/**
 * Animation duration helpers for responsive animations
 */
export const animationHelpers = {
  /**
   * Get responsive animation duration
   * Faster animations on mobile for better UX
   */
  getDuration: (base: number): number => {
    const deviceType = responsive.getDeviceType();

    switch (deviceType) {
      case "mobile":
        return base;
      case "tablet":
        return Math.round(base * 1.1);
      case "desktop":
        return Math.round(base * 1.2);
      default:
        return base;
    }
  },
};

// Export commonly used values
export const COMMON_SPACING = {
  xs: responsiveDimensions.spacing(4),
  sm: responsiveDimensions.spacing(8),
  md: responsiveDimensions.spacing(16),
  lg: responsiveDimensions.spacing(24),
  xl: responsiveDimensions.spacing(32),
  xxl: responsiveDimensions.spacing(48),
};

export const COMMON_FONT_SIZES = {
  xs: responsiveDimensions.fontSize(12),
  sm: responsiveDimensions.fontSize(14),
  md: responsiveDimensions.fontSize(16),
  lg: responsiveDimensions.fontSize(18),
  xl: responsiveDimensions.fontSize(20),
  xxl: responsiveDimensions.fontSize(24),
  title: responsiveDimensions.fontSize(32),
};

export const COMMON_BORDER_RADIUS = {
  sm: responsiveDimensions.borderRadius(4),
  md: responsiveDimensions.borderRadius(8),
  lg: responsiveDimensions.borderRadius(12),
  xl: responsiveDimensions.borderRadius(16),
};

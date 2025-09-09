/**
 * Simple Frontend Logger
 *
 * A lightweight logging utility for frontend debugging.
 * Uses console methods with structured formatting for better development experience.
 *
 * Design Patterns Used:
 * - Singleton Pattern: Single logger instance across the app
 * - Strategy Pattern: Different logging strategies for different log levels
 * - Factory Pattern: Creates formatted log messages
 */

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogContext {
  [key: string]: any;
}

class SimpleLogger {
  private isDevelopment = __DEV__;

  /**
   * Format log message with timestamp and context
   * Factory Pattern: Creates consistent log message format
   */
  private formatMessage(
    level: LogLevel,
    message: string,
    context?: LogContext,
  ): string {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

    if (context && Object.keys(context).length > 0) {
      return `${prefix} ${message} | Context: ${JSON.stringify(context)}`;
    }

    return `${prefix} ${message}`;
  }

  /**
   * Debug level logging (only in development)
   */
  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.debug(this.formatMessage("debug", message, context));
    }
  }

  /**
   * Info level logging
   */
  info(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.info(this.formatMessage("info", message, context));
    }
  }

  /**
   * Warning level logging
   */
  warn(message: string, context?: LogContext): void {
    console.warn(this.formatMessage("warn", message, context));
  }

  /**
   * Error level logging (always shown)
   */
  error(message: string, context?: LogContext): void {
    console.error(this.formatMessage("error", message, context));
  }

  /**
   * Group related logs together
   */
  group(label: string): void {
    if (this.isDevelopment) {
      console.group(label);
    }
  }

  /**
   * End log group
   */
  groupEnd(): void {
    if (this.isDevelopment) {
      console.groupEnd();
    }
  }

  /**
   * Log with custom styling (web only)
   */
  styled(
    message: string,
    styles: string = "color: #007AFF; font-weight: bold",
  ): void {
    if (this.isDevelopment && typeof window !== "undefined") {
      console.log(`%c${message}`, styles);
    } else if (this.isDevelopment) {
      console.log(message);
    }
  }
}

// Export singleton instance
export const logger = new SimpleLogger();

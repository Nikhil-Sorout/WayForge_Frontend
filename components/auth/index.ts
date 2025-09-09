/**
 * Authentication Components Barrel Export
 *
 * This file follows the Barrel Pattern to provide a clean, centralized
 * export interface for all authentication-related components.
 *
 * Benefits:
 * - Single import source for auth components
 * - Cleaner import statements in consuming files
 * - Better organization and discoverability
 * - Easier refactoring and maintenance
 */

// Form Components
export { FormButton } from "./FormButton";
export { FormError } from "./FormError";
export { FormInput } from "./FormInput";

// Layout Components
export { AuthLayout } from "./AuthLayout";

// Screen Components
export { LoginScreen } from "./LoginScreen";
export { SignupScreen } from "./SignupScreen";

// Guard Components
export { AuthGuard } from "./AuthGuard";

// Type Exports
export type { AuthLayoutProps } from "./AuthLayout";
export type { ButtonSize, ButtonVariant, FormButtonProps } from "./FormButton";
export type { FormErrorProps } from "./FormError";
export type { FormInputProps } from "./FormInput";

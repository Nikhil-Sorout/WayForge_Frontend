import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { logger } from "../utils/logger";

/**
 * User interface representing authenticated user data
 * Following Interface Segregation Principle - only necessary auth data
 */
export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  role?: string;
}

/**
 * Authentication state interface
 * Single Responsibility Principle - manages only auth-related state
 */
type AuthState = {
  // State properties
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions - Command Pattern implementation
  setToken: (token: string) => void;
  setUser: (user: User) => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  clearAuth: () => void;

  // Computed getters
  getAuthHeader: () => string | null;
};

/**
 * Enhanced authentication store with persistence
 * Observer Pattern: Zustand provides reactive state management
 * Persistence Pattern: Automatically saves/loads auth state
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      token: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      setToken: (token: string) => {
        logger.info("Setting authentication token");
        set({
          token,
          isAuthenticated: true,
          error: null,
        });
      },

      setUser: (user: User) => {
        logger.info("Setting user data", {
          userId: user.id,
          email: user.email,
        });
        set({ user });
      },

      setError: (error: string | null) => {
        logger.info("Setting auth error", { error });
        set({ error, isLoading: false });
      },

      setLoading: (isLoading: boolean) => {
        set({ isLoading });
      },

      /**
       * Clear all authentication data
       * Command Pattern: Encapsulates the clearing operation
       */
      clearAuth: () => {
        logger.info("Clearing authentication data");
        set({
          token: null,
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      },

      /**
       * Get formatted authorization header
       * Factory Method Pattern: Creates authorization header format
       */
      getAuthHeader: () => {
        const { token } = get();
        return token ? `Bearer ${token}` : null;
      },
    }),
    {
      name: "auth-storage", // Storage key
      storage: createJSONStorage(() => AsyncStorage),

      /**
       * Partial persistence - only persist essential data
       * Security consideration: Don't persist sensitive temporary data
       */
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),

      /**
       * Handle rehydration - restore state from storage
       * Template Method Pattern: Defines steps for state restoration
       */
      onRehydrateStorage: () => (state) => {
        if (state) {
          logger.info("Auth state rehydrated from storage");
          // Validate token on rehydration if needed
          if (state.token && !state.isAuthenticated) {
            state.isAuthenticated = true;
          }
        }
      },
    },
  ),
);

/**
 * Auth store selectors for optimized component subscriptions
 * Selector Pattern: Provides specific slices of state to prevent unnecessary re-renders
 */
export const authSelectors = {
  // Authentication status selectors
  isAuthenticated: (state: AuthState) => state.isAuthenticated,
  isLoading: (state: AuthState) => state.isLoading,
  hasError: (state: AuthState) => !!state.error,

  // Data selectors
  token: (state: AuthState) => state.token,
  user: (state: AuthState) => state.user,
  error: (state: AuthState) => state.error,

  // Computed selectors
  userDisplayName: (state: AuthState) =>
    state.user?.name || state.user?.email?.split("@")[0] || "User",

  authHeader: (state: AuthState) => state.getAuthHeader(),
};

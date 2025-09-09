import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi } from "../api/authApi";
import { useAuthStore } from "../store/authStore";
import { logger } from "../utils/logger";

export const useAuth = () => {
  const queryClient = useQueryClient();
  const { token, setToken, clearAuth, setError, setLoading } = useAuthStore();
  const authError = useAuthStore((state) => state.error);

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      setToken(data.token);
      setError(null); // Clear any previous errors on successful login
    },
    onError: (error: any) => {
      logger.info("Login failed: ", error);

      // Set user-friendly error message based on status code
      let errorMessage = "Login failed. Please try again.";

      if (error?.status === 401 || error?.response?.status === 401) {
        errorMessage =
          "Invalid email or password. Please check your credentials and try again.";
      } else if (error?.status === 400 || error?.response?.status === 400) {
        errorMessage = "Please check your email and password format.";
      } else if (error?.status === 500 || error?.response?.status === 500) {
        errorMessage = "Server error. Please try again later.";
      } else if (error?.code === "ERR_NETWORK") {
        errorMessage =
          "Network error. Please check your connection and try again.";
      }

      setError(errorMessage);
    },
  });

  const signupMutation = useMutation({
    mutationFn: authApi.signup,
    onSuccess: (data) => {
      // Handle navigation
    },
    onError: (error) => {
      logger.info("Signup failed: ", error);
    },
  });

  const logout = () => {
    clearAuth();
    queryClient.clear(); // Clear all React Query cache on logout
  };

  /**
   * Google login handler (Frontend preparation)
   * This will be integrated with actual Google OAuth when backend is ready
   */
  const googleLoginMutation = useMutation({
    mutationFn: async (googleToken: string) => {
      // TODO: Send Google token to backend for verification
      // For now, this is a placeholder that will throw an error
      throw new Error("Google login not yet implemented on backend");
    },
    onSuccess: (data: any) => {
      // When backend is ready, this will receive JWT token
      if (data.token) {
        setToken(data.token);
      }
    },
    onError: (error) => {
      logger.info("Google login failed: ", error);
      setError(error.message || "Google login failed");
    },
  });

  return {
    token,
    login: loginMutation.mutate,
    signup: signupMutation.mutate,
    googleLogin: googleLoginMutation.mutate,
    logout,
    // Separate states for better UI handling
    loginLoading: loginMutation.isPending,
    signupLoading: signupMutation.isPending,
    googleLoginLoading: googleLoginMutation.isPending,
    loginError: authError || loginMutation.error, // Use auth store error first, then React Query error
    signupError: signupMutation.error,
    googleLoginError: googleLoginMutation.error,
  };
};

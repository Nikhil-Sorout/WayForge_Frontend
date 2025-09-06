import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi } from "../api/authApi";
import { useAuthStore } from "../store/authStore";
import { logger } from "../utils/logger";

export const useAuth = () => {
  const queryClient = useQueryClient();
  const { token, setToken, clearToken } = useAuthStore();

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      setToken(data.token);
    },
    onError: (error) => {
      logger.info("Login failed: ", error);
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
    clearToken();
    queryClient.clear(); // Clear all React Query cache on logout
  };

  return {
    token,
    login: loginMutation.mutate,
    signup: signupMutation.mutate,
    logout,
    // Separate states for better UI handling
    loginLoading: loginMutation.isPending,
    signupLoading: signupMutation.isPending,
    loginError: loginMutation.error,
    signupError: signupMutation.error,
  };
};

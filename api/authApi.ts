import { z } from "zod";
import api from "./axios";

// Define schemas for validation
const loginResponseSchema = z.object({
  token: z.string(),
});

const loginPayloadSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signupPayloadSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const googleLoginPayloadSchema = z.object({
  token: z.string().min(1, "Google token is required"),
});

export const authApi = {
  signup: async (credentials: { email: string; password: string }) => {
    const validatedData = signupPayloadSchema.parse(credentials);
    const response = await api.post(`/auth/auth/signup`, validatedData);
    return response.data;
  },
  login: async (credentials: { email: string; password: string }) => {
    const validatedData = loginPayloadSchema.parse(credentials);
    const response = await api.post(`/auth/auth/login`, validatedData);
    return loginResponseSchema.parse(response.data);
  },

  /**
   * Google OAuth login (Prepared for backend integration)
   * This will be activated when backend Google OAuth is implemented
   */
  googleLogin: async (googleToken: string) => {
    const validatedData = googleLoginPayloadSchema.parse({
      token: googleToken,
    });
    const response = await api.post(`/auth/google`, validatedData);
    return loginResponseSchema.parse(response.data);
  },
};

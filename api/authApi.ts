import api from "./axios";
import { z } from "zod";

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

export const authApi = {
  signup: async (credentials: { email: string; password: string }) => {
    const validatedData = signupPayloadSchema.parse(credentials);
    const response = await api.post(`/auth/signup`, validatedData);
    return response.data;
  },
  login: async (credentials: { email: string; password: string }) => {
    const validatedData = loginPayloadSchema.parse(credentials);
    const response = await api.post(`/auth/login`, validatedData);
    return loginResponseSchema.parse(response.data);
  },
};

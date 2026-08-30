import { z } from "zod";

const email = z
  .string()
  .trim()
  .min(1, "Email is required.")
  .pipe(z.email("Please enter a valid email address."));

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Password is required."),
});

export const registerSchema = z
  .object({
    name: z.string().trim().min(1, "Full name is required."),
    email,
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string().min(1, "Please confirm your password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

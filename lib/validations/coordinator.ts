import { z } from "zod";

export const createClientSchema = z.object({
  name: z.string().trim().min(1, "Client name is required."),
  email: z
    .string()
    .trim()
    .min(1, "Email is required.")
    .email("Please enter a valid email address."),
});

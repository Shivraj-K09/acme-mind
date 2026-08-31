import { z } from "zod";

export const updateProfileSchema = z.object({
  fullName: z.string().trim().min(1, "Name is required."),
  phone: z.string().trim().max(20, "Phone number is too long."),
  bio: z.string().trim().max(1000, "Bio is too long."),
  specialization: z.string().trim().max(120, "Specialization is too long."),
  experienceYears: z.coerce
    .number()
    .int("Use whole years.")
    .min(0, "Cannot be negative.")
    .max(60, "Experience looks too high."),
});

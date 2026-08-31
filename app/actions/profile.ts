"use server";

import { createClient } from "@/lib/supabase/server";
import { updateProfileSchema } from "@/lib/validations/profile";
import { z } from "zod";

/**
 * Updates the signed-in user's profile. For therapists it also keeps their
 * practice details (bio, specialization, experience) in sync. Column and row
 * permissions are enforced by RLS.
 */
export async function updateProfile(input: unknown): Promise<{
  error?: string;
}> {
  const parsed = updateProfileSchema.safeParse(input);

  if (!parsed.success) {
    const first = Object.values(
      z.flattenError(parsed.error).fieldErrors,
    )[0]?.[0];
    return { error: first ?? "Please check the fields and try again." };
  }

  const supabase = await createClient();

  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    return { error: "Not signed in." };
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.data.fullName,
      phone: parsed.data.phone || null,
    })
    .eq("id", userData.user.id);

  if (profileError) {
    return { error: "Could not update your profile. Please try again." };
  }

  const { data: therapist } = await supabase
    .from("therapists")
    .select("id")
    .eq("profile_id", userData.user.id)
    .maybeSingle();

  if (therapist) {
    const { error: therapistError } = await supabase
      .from("therapists")
      .update({
        bio: parsed.data.bio,
        specialization: parsed.data.specialization || "General therapy",
        experience_years: parsed.data.experienceYears,
      })
      .eq("id", therapist.id);

    if (therapistError) {
      return {
        error: "Could not update your practice details. Please try again.",
      };
    }
  }

  return {};
}

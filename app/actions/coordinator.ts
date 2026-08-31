"use server";

import { z } from "zod";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const recommendTherapistSchema = z.object({
  clientId: z.string().uuid(),
  therapistId: z.string().uuid(),
});

export async function recommendTherapist(input: {
  clientId: string;
  therapistId: string;
}): Promise<{ error?: string }> {
  const parsed = recommendTherapistSchema.safeParse(input);

  if (!parsed.success) {
    return { error: "Invalid client or therapist." };
  }

  const supabase = await createClient();

  const { error } = await supabase.from("therapist_recommendations").insert({
    client_id: parsed.data.clientId,
    therapist_id: parsed.data.therapistId,
    status: "PENDING",
  });

  if (error) {
    if (error.code === "23505") {
      return {
        error: "This therapist is already recommended for this client.",
      };
    }

    return { error: "Could not save the recommendation. Please try again." };
  }

  return {};
}

const inviteClientSchema = z.object({
  name: z.string().trim().min(1, "Client name is required."),
  email: z
    .string()
    .trim()
    .min(1, "Email is required.")
    .email("Please enter a valid email address."),
});

/**
 * Creates a pending CLIENT account and emails the user an invite link.
 * The client sets their own password through the link - the coordinator
 * never handles passwords.
 */
export async function inviteClient(input: {
  name: string;
  email: string;
}): Promise<{ error?: string; userId?: string }> {
  const parsed = inviteClientSchema.safeParse(input);

  if (!parsed.success) {
    return { error: "Please enter a valid name and email address." };
  }

  const supabase = createAdminClient();

  if (!supabase) {
    return { error: "Could not send the invite. Please try again." };
  }

  const { data, error } = await supabase.auth.admin.inviteUserByEmail(
    parsed.data.email,
    {
      data: { full_name: parsed.data.name },
    },
  );

  if (error) {
    if (error.code === "user_already_exists") {
      return {
        error:
          "An account with this email already exists. Please search for the client instead.",
      };
    }

    return {
      error:
        "Could not send the invite. Please check the email address and try again.",
    };
  }

  return { userId: data.user?.id };
}

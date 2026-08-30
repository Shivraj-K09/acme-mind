"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

async function requireAdminClient() {
  const supabase = await createClient();

  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userData.user.id)
    .maybeSingle();

  if (profile?.role !== "ADMIN") {
    return null;
  }

  return supabase;
}

/**
 * Admin-only: marks a booking as COMPLETED or NO_SHOW. The DB trigger logs
 * the corresponding event automatically.
 */
export async function markBooking(
  bookingId: string,
  status: "COMPLETED" | "NO_SHOW"
): Promise<void> {
  const supabase = await requireAdminClient();

  if (!supabase) {
    redirect(
      `/dashboard/bookings?error=${encodeURIComponent(
        "Only admins can perform this action."
      )}`
    );
  }

  const { error } = await supabase
    .from("bookings")
    .update({ status })
    .eq("id", bookingId);

  if (error) {
    redirect(
      `/dashboard/bookings?error=${encodeURIComponent(error.message)}`
    );
  }

  revalidatePath("/dashboard/bookings");
}

"use server";

import { redirect } from "next/navigation";
import { createClient as createSupabaseAdminClient } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";

/**
 * Creates a PENDING booking for the selected slot. Slot availability, the
 * accepted match, and double-booking protection are enforced by the database
 * (triggers + partial unique index from the migrations).
 */
export async function createBooking(
  slotId: string
): Promise<{ error?: string }> {
  const supabase = await createClient();

  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    return { error: "Please sign in first." };
  }

  const { data: client } = await supabase
    .from("clients")
    .select("id")
    .eq("profile_id", userData.user.id)
    .maybeSingle();

  if (!client) {
    return { error: "Client profile not found." };
  }

  const { data: slot } = await supabase
    .from("availability_slots")
    .select("therapist_id, start_time, end_time, status")
    .eq("id", slotId)
    .maybeSingle();

  if (!slot || slot.status !== "AVAILABLE") {
    return { error: "This slot is no longer available." };
  }

  const { error } = await supabase.from("bookings").insert({
    client_id: client.id,
    therapist_id: slot.therapist_id,
    availability_slot_id: slotId,
    status: "PENDING",
    scheduled_start: slot.start_time,
    scheduled_end: slot.end_time,
  });

  if (error) {
    return { error: "Could not create the booking. Please try again." };
  }

  return {};
}

export const SESSION_PRICE = 50;

/**
 * Mock payment: records a PAID payment row (service role, since payment
 * writes are reserved for the system) and confirms the booking.
 */
export async function payBooking(
  bookingId: string
): Promise<{ error?: string }> {
  const supabase = await createClient();

  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    return { error: "Please sign in first." };
  }

  const { data: booking } = await supabase
    .from("bookings")
    .select("id, status, client_id")
    .eq("id", bookingId)
    .maybeSingle();

  if (!booking) {
    return { error: "Booking not found." };
  }

  const { data: client } = await supabase
    .from("clients")
    .select("id")
    .eq("id", booking.client_id)
    .eq("profile_id", userData.user.id)
    .maybeSingle();

  if (!client) {
    return { error: "This booking does not belong to you." };
  }

  if (booking.status !== "PENDING") {
    return { error: "Only pending bookings can be paid." };
  }

  const admin = createSupabaseAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  const { error: paymentError } = await admin.from("payments").insert({
    booking_id: booking.id,
    amount: SESSION_PRICE,
    currency: "USD",
    status: "PAID",
    provider: "mock",
  });

  if (paymentError) {
    return { error: "Payment could not be recorded. Please try again." };
  }

  const { error: confirmError } = await supabase
    .from("bookings")
    .update({ status: "CONFIRMED" })
    .eq("id", booking.id);

  if (confirmError) {
    return {
      error: "Payment recorded but the booking could not be confirmed.",
    };
  }

  redirect("/dashboard/bookings?paid=1");
}

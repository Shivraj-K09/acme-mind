"use server";

import { z } from "zod";
import { createClient as createSupabaseAdminClient } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";
import { SESSION_PRICE } from "@/constants";

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

  if (new Date(slot.start_time).getTime() <= Date.now()) {
    return { error: "This session time has already passed." };
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

  return {};
}

/**
 * Cancels a booking the caller participates in (client or therapist).
 * The DB trigger frees the slot and logs the CANCELLED event.
 */
export async function cancelBooking(input: {
  bookingId: string;
  reason: string;
}): Promise<{ error?: string }> {
  const parsed = z
    .object({
      bookingId: z.string().uuid(),
      reason: z.string().trim().min(1, "Cancellation reason is required."),
    })
    .safeParse(input);

  if (!parsed.success) {
    return { error: "Please provide a cancellation reason." };
  }

  const supabase = await createClient();

  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    return { error: "Please sign in first." };
  }

  const { data: booking } = await supabase
    .from("bookings")
    .select("id, status, scheduled_start, client_id, therapist_id")
    .eq("id", parsed.data.bookingId)
    .maybeSingle();

  if (!booking) {
    return { error: "Booking not found." };
  }

  const { data: asClient } = await supabase
    .from("clients")
    .select("id")
    .eq("id", booking.client_id)
    .eq("profile_id", userData.user.id)
    .maybeSingle();

  const { data: asTherapist } = await supabase
    .from("therapists")
    .select("id")
    .eq("id", booking.therapist_id)
    .eq("profile_id", userData.user.id)
    .maybeSingle();

  if (!asClient && !asTherapist) {
    return { error: "This booking does not belong to you." };
  }

  if (booking.status !== "PENDING" && booking.status !== "CONFIRMED") {
    return { error: "This booking can no longer be cancelled." };
  }

  const cancelledBy = asClient ? "CLIENT" : "THERAPIST";

  const { error: updateError } = await supabase
    .from("bookings")
    .update({
      status: "CANCELLED",
      cancelled_by: cancelledBy,
      cancellation_reason: parsed.data.reason,
    })
    .eq("id", booking.id);

  if (updateError) {
    return { error: "Could not cancel the booking. Please try again." };
  }

  // 24+ hours before the session: full mock refund
  const hoursUntil = (new Date(booking.scheduled_start).getTime() - Date.now()) / 3600000;

  if (hoursUntil >= 24) {
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

    const { data: payment } = await admin
      .from("payments")
      .select("id, amount")
      .eq("booking_id", booking.id)
      .eq("status", "PAID")
      .maybeSingle();

    if (payment) {
      await admin
        .from("payments")
        .update({
          status: "REFUNDED",
          refund_amount: payment.amount,
          refunded_at: new Date().toISOString(),
        })
        .eq("id", payment.id);
    }
  }

  return {};
}

/**
 * Moves a booking to a new AVAILABLE slot of the same therapist. The DB
 * trigger validates the new slot, copies the times, sets RESCHEDULED,
 * swaps the slot statuses, and logs the event.
 */
export async function rescheduleBooking(input: {
  bookingId: string;
  newSlotId: string;
}): Promise<{ error?: string }> {
  const parsed = z
    .object({
      bookingId: z.string().uuid(),
      newSlotId: z.string().uuid(),
    })
    .safeParse(input);

  if (!parsed.success) {
    return { error: "Please choose a new slot." };
  }

  const supabase = await createClient();

  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    return { error: "Please sign in first." };
  }

  const { data: booking } = await supabase
    .from("bookings")
    .select("id, status, client_id, therapist_id")
    .eq("id", parsed.data.bookingId)
    .maybeSingle();

  if (!booking) {
    return { error: "Booking not found." };
  }

  const { data: asClient } = await supabase
    .from("clients")
    .select("id")
    .eq("id", booking.client_id)
    .eq("profile_id", userData.user.id)
    .maybeSingle();

  const { data: asTherapist } = await supabase
    .from("therapists")
    .select("id")
    .eq("id", booking.therapist_id)
    .eq("profile_id", userData.user.id)
    .maybeSingle();

  if (!asClient && !asTherapist) {
    return { error: "This booking does not belong to you." };
  }

  const { error: updateError } = await supabase
    .from("bookings")
    .update({ availability_slot_id: parsed.data.newSlotId })
    .eq("id", booking.id);

  if (updateError) {
    return { error: "Could not reschedule. Please try again." };
  }

  return {};
}

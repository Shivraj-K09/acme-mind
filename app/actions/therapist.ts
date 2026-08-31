"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const availabilitySlotSchema = z.object({
  date: z.string().min(1, "Date is required."),
  startTime: z.string().min(1, "Start time is required."),
  endTime: z.string().min(1, "End time is required."),
});

/**
 * Adds an AVAILABLE slot for the signed-in therapist. Validates the times
 * and rejects slots that overlap the therapist's existing ones.
 */
export async function addAvailabilitySlot(input: {
  date: string;
  startTime: string;
  endTime: string;
}): Promise<{ error?: string }> {
  const parsed = availabilitySlotSchema.safeParse(input);

  if (!parsed.success) {
    const first = Object.values(
      z.flattenError(parsed.error).fieldErrors,
    )[0]?.[0];
    return { error: first ?? "Please fill in all fields." };
  }

  const start = new Date(`${parsed.data.date}T${parsed.data.startTime}`);
  const end = new Date(`${parsed.data.date}T${parsed.data.endTime}`);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return { error: "Invalid date or time." };
  }

  if (end <= start) {
    return { error: "End time must be after the start time." };
  }

  if (start.getTime() < Date.now()) {
    return { error: "Slots must be in the future." };
  }

  const supabase = await createClient();

  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    return { error: "Not signed in." };
  }

  const { data: therapist } = await supabase
    .from("therapists")
    .select("id")
    .eq("profile_id", userData.user.id)
    .maybeSingle();

  if (!therapist) {
    return { error: "Therapist profile not found." };
  }

  const startIso = start.toISOString();
  const endIso = end.toISOString();

  const { data: overlapping } = await supabase
    .from("availability_slots")
    .select("id")
    .eq("therapist_id", therapist.id)
    .lt("start_time", endIso)
    .gt("end_time", startIso)
    .limit(1);

  if (overlapping && overlapping.length > 0) {
    return { error: "This time overlaps another slot you already added." };
  }

  const { error } = await supabase.from("availability_slots").insert({
    therapist_id: therapist.id,
    start_time: startIso,
    end_time: endIso,
    status: "AVAILABLE",
  });

  if (error) {
    return { error: "Could not save the slot. Please try again." };
  }

  return {};
}

"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { cancelBooking, rescheduleBooking } from "@/app/actions/bookings";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import type { SlotOption } from "@/types";

function formatSlot(start: string, end: string) {
  return `${new Date(start).toLocaleString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  })} - ${new Date(end).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })}`;
}

export function BookingActions({
  bookingId,
  therapistId,
  cancellable = true,
  reschedulable = true,
}: {
  bookingId: string;
  therapistId: string;
  cancellable?: boolean;
  reschedulable?: boolean;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [open, setOpen] = React.useState<"cancel" | "reschedule" | null>(null);
  const [pending, setPending] = React.useState(false);
  const [slots, setSlots] = React.useState<SlotOption[]>([]);
  const [slotsLoaded, setSlotsLoaded] = React.useState(false);

  async function loadSlots() {
    const { data } = await supabase
      .from("availability_slots")
      .select("id, start_time, end_time")
      .eq("therapist_id", therapistId)
      .eq("status", "AVAILABLE")
      .gte("end_time", new Date().toISOString())
      .order("start_time", { ascending: true });

    setSlots(
      (
        (data ?? []) as unknown as {
          id: string;
          start_time: string;
          end_time: string;
        }[]
      ).map((slot) => ({
        id: slot.id,
        label: formatSlot(slot.start_time, slot.end_time),
      })),
    );
    setSlotsLoaded(true);
  }

  async function handleCancel(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const reason = String(
      new FormData(event.currentTarget).get("reason") ?? "",
    ).trim();

    if (!reason) {
      toast.add({
        type: "error",
        title: "Reason required",
        description: "Please enter a cancellation reason.",
      });
      return;
    }

    setPending(true);

    const result = await cancelBooking({ bookingId, reason });

    setPending(false);

    if (result.error) {
      toast.add({
        type: "error",
        title: "Could not cancel",
        description: result.error,
      });
      return;
    }

    toast.add({
      type: "success",
      title: "Booking cancelled",
      description: "The time slot is available again.",
    });

    setOpen(null);
    router.refresh();
  }

  async function handleReschedule(slotId: string) {
    setPending(true);

    const result = await rescheduleBooking({ bookingId, newSlotId: slotId });

    setPending(false);

    if (result.error) {
      toast.add({
        type: "error",
        title: "Could not reschedule",
        description: result.error,
      });
      return;
    }

    toast.add({
      type: "success",
      title: "Booking rescheduled",
      description: "Your session was moved to the new time.",
    });

    setOpen(null);
    router.refresh();
  }

  function openReschedule() {
    setOpen("reschedule");
    void loadSlots();
  }

  return (
    <div className="flex shrink-0 gap-2">
      {reschedulable ? (
        <Dialog
          open={open === "reschedule"}
          onOpenChange={(value) => setOpen(value ? "reschedule" : null)}
        >
          <DialogTrigger
            render={
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-lg"
                onClick={openReschedule}
              >
                Reschedule
              </Button>
            }
          />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reschedule session</DialogTitle>
              <DialogDescription>
                Pick a new available slot with this therapist.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-2">
              {slots.length > 0 ? (
                slots.map((slot) => (
                  <div
                    key={slot.id}
                    className="flex items-center justify-between rounded-xl border px-4 py-2.5"
                  >
                    <p className="text-sm">{slot.label}</p>
                    <Button
                      size="sm"
                      className="rounded-lg"
                      disabled={pending}
                      onClick={() => handleReschedule(slot.id)}
                    >
                      Move here
                    </Button>
                  </div>
                ))
              ) : slotsLoaded ? (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  No available slots right now.
                </p>
              ) : (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  Loading...
                </p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      ) : null}

      {cancellable ? (
        <Dialog
          open={open === "cancel"}
          onOpenChange={(value) => setOpen(value ? "cancel" : null)}
        >
          <DialogTrigger
            render={
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-lg"
                onClick={() => {
                  setOpen("cancel");
                  void loadSlots();
                }}
              />
            }
          >
            Cancel
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cancel session</DialogTitle>
              <DialogDescription>
                Please tell us why you are cancelling. If the session is more
                than 24 hours away you receive a full refund.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCancel} className="flex flex-col gap-4">
              <Textarea
                name="reason"
                rows={3}
                required
                placeholder="Reason for cancelling..."
                className="rounded-xl bg-muted/50"
              />
              <Button type="submit" variant="destructive" disabled={pending}>
                {pending ? "Cancelling..." : "Cancel booking"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      ) : null}
    </div>
  );
}

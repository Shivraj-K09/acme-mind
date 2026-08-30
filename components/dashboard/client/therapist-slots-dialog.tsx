"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CalendarCheck } from "lucide-react";

import { createBooking } from "@/app/actions/bookings";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/toast";

type SlotOption = {
  id: string;
  label: string;
};

export function TherapistSlotsDialog({
  therapistName,
  specialization,
  experienceYears,
  bio,
  slots: initialSlots,
}: {
  therapistName: string;
  specialization: string;
  experienceYears: number;
  bio: string;
  slots: SlotOption[];
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [slots, setSlots] = React.useState(initialSlots);
  const [pendingId, setPendingId] = React.useState<string | null>(null);

  async function book(slot: SlotOption) {
    setPendingId(slot.id);

    const result = await createBooking(slot.id);

    setPendingId(null);

    if (result.error) {
      toast.add({
        type: "error",
        title: "Could not book this slot",
        description: result.error,
      });
      return;
    }

    toast.add({
      type: "success",
      title: "Session booked",
      description: `${slot.label} — complete the payment to confirm.`,
    });

    setSlots((current) => current.filter((s) => s.id !== slot.id));
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button className="w-full rounded-xl h-10!">
            <CalendarCheck data-icon="inline-start" /> View profile & slots
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            {therapistName}
          </DialogTitle>
          <DialogDescription>
            {specialization} · {experienceYears} yrs experience
          </DialogDescription>
        </DialogHeader>
        {bio ? (
          <p className="text-sm leading-relaxed text-muted-foreground">{bio}</p>
        ) : null}

        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">Available slots</span>
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
                  disabled={pendingId !== null}
                  onClick={() => book(slot)}
                >
                  {pendingId === slot.id ? "Booking…" : "Book"}
                </Button>
              </div>
            ))
          ) : (
            <p className="py-4 text-center text-sm text-muted-foreground">
              No available slots right now.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

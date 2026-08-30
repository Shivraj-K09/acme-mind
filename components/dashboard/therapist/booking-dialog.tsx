"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { createBooking } from "@/app/actions/bookings";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function BookingDialog({
  slotId,
  slotLabel,
}: {
  slotId: string;
  slotLabel: string;
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [pending, setPending] = React.useState(false);

  async function handleConfirm() {
    setPending(true);

    const result = await createBooking(slotId);

    setPending(false);

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
      description: "Complete the payment to confirm your session.",
    });

    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={<Button size="sm" className="rounded-lg">Select</Button>}
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm your session</DialogTitle>
          <DialogDescription>
            {slotLabel}
            {" "}- you will complete the payment after booking.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            size="lg"
            className="h-11 flex-1 rounded-xl"
            onClick={handleConfirm}
            disabled={pending}
          >
            {pending ? "Booking..." : "Confirm booking"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

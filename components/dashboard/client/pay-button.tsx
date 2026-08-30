"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { payBooking, SESSION_PRICE } from "@/app/actions/bookings";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";

export function PayButton({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();

  return (
    <Button
      size="sm"
      className="shrink-0 rounded-lg"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const result = await payBooking(bookingId);

          if (result?.error) {
            toast.add({
              type: "error",
              title: "Payment failed",
              description: result.error,
            });
            return;
          }

          toast.add({
            type: "success",
            title: "Payment received",
            description: "Your session is confirmed.",
          });

          router.refresh();
        })
      }
    >
      {pending ? "Paying…" : `Pay now · $${SESSION_PRICE}`}
    </Button>
  );
}

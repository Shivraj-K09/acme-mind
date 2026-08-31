"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  CalendarCheck,
  Clock,
  Award,
  CheckCircle2,
  HeartHandshake,
  Calendar,
} from "lucide-react";

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
import { getTherapistInitials } from "@/components/dashboard/therapist/therapist-card";
import type { SlotOption } from "@/types";

export function TherapistSlotsDialog({
  therapistName,
  specialization = "General Clinical Therapy",
  experienceYears = 0,
  bio = "",
  slots: initialSlots,
}: {
  therapistName: string;
  specialization?: string | null;
  experienceYears?: number | null;
  bio?: string | null;
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
      description: `${slot.label} - complete the payment to confirm.`,
    });

    setSlots((current) => current.filter((s) => s.id !== slot.id));
    setOpen(false);
    router.refresh();
  }

  const initials = getTherapistInitials(therapistName);
  const specText = specialization || "General Clinical Therapy";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button className="w-full h-10 rounded-xl font-medium shadow-xs">
            <CalendarCheck className="size-4 mr-1.5" /> View Profile & Book Slot
          </Button>
        }
      />
      <DialogContent className="sm:max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        {/* Doctor Header Banner */}
        <div className="flex items-start gap-4 border-b border-border/70 pb-5">
          <div className="relative shrink-0">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-linear-to-br from-primary/20 via-primary/10 to-primary/5 text-base font-bold text-primary ring-2 ring-primary/25 shadow-xs">
              {initials}
            </div>
            <div
              className="absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xs ring-2 ring-background"
              title="Verified Specialist"
            >
              <CheckCircle2 className="size-3.5" />
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <DialogHeader className="p-0 text-left">
              <div className="flex items-center gap-2">
                <DialogTitle className="text-lg font-bold tracking-tight text-foreground">
                  {therapistName}
                </DialogTitle>
              </div>
              <DialogDescription className="mt-1 flex flex-wrap items-center gap-1.5 text-xs">
                <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 font-semibold text-primary">
                  <HeartHandshake className="size-3" />
                  {specText}
                </span>
                <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 font-medium text-muted-foreground">
                  <Award className="size-3 text-primary" />
                  {experienceYears} yrs experience
                </span>
              </DialogDescription>
            </DialogHeader>
          </div>
        </div>

        {/* Doctor Bio Section */}
        {bio ? (
          <div className="rounded-xl border border-border/60 bg-muted/30 p-3.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              About Specialist
            </h4>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {bio}
            </p>
          </div>
        ) : null}

        {/* Available Slots Section */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Clock className="size-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">
                Available Booking Slots
              </span>
            </div>
            <span className="text-xs text-muted-foreground">
              {slots.length} available
            </span>
          </div>

          {slots.length > 0 ? (
            <div className="flex flex-col gap-2">
              {slots.map((slot) => (
                <div
                  key={slot.id}
                  className="group flex items-center justify-between rounded-xl border border-border/80 bg-card p-3.5 shadow-2xs transition-all hover:border-primary/50 hover:bg-primary/5"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Calendar className="size-4" />
                    </div>
                    <p className="text-xs font-medium text-foreground truncate">
                      {slot.label}
                    </p>
                  </div>

                  <Button
                    size="sm"
                    className="shrink-0 rounded-lg px-3.5 h-8 font-medium"
                    disabled={pendingId !== null}
                    onClick={() => book(slot)}
                  >
                    {pendingId === slot.id ? "Booking..." : "Book Slot"}
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-8 text-center bg-muted/10">
              <div className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground mb-2">
                <CalendarCheck className="size-5" />
              </div>
              <p className="text-sm font-medium text-foreground">
                No available slots right now
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Check back soon or contact your coordinator to request a new session time.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}


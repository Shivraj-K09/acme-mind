"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { addAvailabilitySlot } from "@/app/actions/therapist";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/toast";

const TIME_OPTIONS = Array.from({ length: 25 }, (_, index) => {
  const minutes = 8 * 60 + index * 30;
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;

  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
});

function formatTimeLabel(time: string) {
  return new Date(`2000-01-01T${time}`).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function AddAvailabilityForm() {
  const router = useRouter();
  const now = new Date();
  const [date, setDate] = React.useState<Date | undefined>();
  const [startTime, setStartTime] = React.useState("");
  const [endTime, setEndTime] = React.useState("");
  const [calendarOpen, setCalendarOpen] = React.useState(false);
  const [pending, setPending] = React.useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!date || !startTime || !endTime) {
      toast.add({
        type: "error",
        title: "Missing details",
        description: "Please choose a date and both times.",
      });
      return;
    }

    setPending(true);

    const result = await addAvailabilitySlot({
      date: format(date, "yyyy-MM-dd"),
      startTime,
      endTime,
    });

    setPending(false);

    if (result.error) {
      toast.add({
        type: "error",
        title: "Could not add slot",
        description: result.error,
      });
      return;
    }

    toast.add({
      type: "success",
      title: "Slot added",
      description: "Matched clients can now book this time.",
    });

    setDate(undefined);
    setStartTime("");
    setEndTime("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
          <PopoverTrigger
            render={
              <Button
                type="button"
                variant="outline"
                className={cn(
                  "h-9! flex-1 justify-start rounded-xl bg-muted/50 px-3 font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="size-4" />
                {date ? (
                  format(date, "MMM d, yyyy")
                ) : (
                  <span>Pick a date...</span>
                )}
              </Button>
            }
          />
          <PopoverContent align="start" className="w-auto p-2">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(selected) => {
                setDate(selected);
                setCalendarOpen(false);
              }}
              disabled={{ before: now }}
              startMonth={new Date(now.getFullYear(), now.getMonth(), 1)}
              endMonth={new Date(now.getFullYear() + 2, 11, 31)}
              captionLayout="dropdown"
            />
          </PopoverContent>
        </Popover>

        <Select
          value={startTime}
          onValueChange={(value) => setStartTime((value as string) ?? "")}
        >
          <SelectTrigger className="h-9! flex-1 rounded-xl bg-muted/50 py-0 text-muted-foreground sm:w-auto sm:flex-none">
            {startTime ? (
              formatTimeLabel(startTime)
            ) : (
              <span>Start time...</span>
            )}
          </SelectTrigger>
          <SelectContent className="min-w-0 max-h-72 w-(--anchor-width) [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {TIME_OPTIONS.map((time) => (
              <SelectItem key={time} value={time}>
                {formatTimeLabel(time)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={endTime}
          onValueChange={(value) => setEndTime((value as string) ?? "")}
        >
          <SelectTrigger className="h-9! flex-1 rounded-xl bg-muted/50 py-0 text-muted-foreground sm:w-auto sm:flex-none">
            {endTime ? formatTimeLabel(endTime) : <span>End time...</span>}
          </SelectTrigger>
          <SelectContent className="min-w-0 max-h-72 w-(--anchor-width) [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {TIME_OPTIONS.map((time) => (
              <SelectItem key={time} value={time}>
                {formatTimeLabel(time)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          type="submit"
          size="lg"
          className="h-9! rounded-xl"
          disabled={pending}
        >
          {pending ? "Adding..." : "Add slot"}
        </Button>
      </div>
    </form>
  );
}

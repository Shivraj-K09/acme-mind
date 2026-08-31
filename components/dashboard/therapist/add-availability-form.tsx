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

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function AddAvailabilityForm() {
  const router = useRouter();
  const [date, setDate] = React.useState<Date | undefined>();
  const [pickedNow, setPickedNow] = React.useState<number | null>(null);
  const [startTime, setStartTime] = React.useState("");
  const [endTime, setEndTime] = React.useState("");
  const [calendarOpen, setCalendarOpen] = React.useState(false);
  const [pending, setPending] = React.useState(false);

  const isToday =
    date && pickedNow !== null ? isSameDay(date, new Date(pickedNow)) : false;

  const startOptions = TIME_OPTIONS.filter((time) => {
    if (!isToday || !date || pickedNow === null) return true;

    const [hours, minutes] = time.split(":").map(Number);
    const option = new Date(date);
    option.setHours(hours, minutes, 0, 0);

    return option.getTime() > pickedNow;
  });

  const endOptions = startTime
    ? TIME_OPTIONS.filter((time) => time > startTime)
    : [];

  function handleSelect(selected: Date | undefined) {
    setDate(selected);
    setPickedNow(Date.now());
    setStartTime("");
    setEndTime("");
    setCalendarOpen(false);
  }

  function handleStartChange(value: string | null) {
    const next = value ?? "";

    setStartTime(next);

    if (endTime && next && endTime <= next) {
      setEndTime("");
    }
  }

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
    setPickedNow(null);
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
                  !date && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="size-4" />
                {date ? format(date, "MMM d, yyyy") : <span>Pick a date…</span>}
              </Button>
            }
          />
          <PopoverContent align="start" className="w-auto p-2">
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleSelect}
              disabled={{ before: new Date() }}
              startMonth={
                new Date(new Date().getFullYear(), new Date().getMonth(), 1)
              }
              endMonth={new Date(new Date().getFullYear() + 2, 11, 31)}
              captionLayout="dropdown"
            />
          </PopoverContent>
        </Popover>

        <Select
          value={startTime}
          onValueChange={handleStartChange}
          disabled={!date}
        >
          <SelectTrigger className="h-9! flex-1 rounded-xl bg-muted/50 py-0 text-muted-foreground sm:w-auto sm:flex-none">
            {startTime ? formatTimeLabel(startTime) : <span>Start time…</span>}
          </SelectTrigger>
          <SelectContent className="min-w-0 max-h-72 w-(--anchor-width) [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {startOptions.map((time) => (
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
            {endTime ? formatTimeLabel(endTime) : <span>End time…</span>}
          </SelectTrigger>
          <SelectContent className="min-w-0 max-h-72 w-(--anchor-width) [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {endOptions.map((time) => (
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
          disabled={pending || !startTime || !endTime}
        >
          {pending ? "Adding…" : "Add slot"}
        </Button>
      </div>
    </form>
  );
}

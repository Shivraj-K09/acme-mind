import { createClient } from "@/lib/supabase/server";
import { AddAvailabilityForm } from "@/components/dashboard/therapist/add-availability-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type SlotStatus = "AVAILABLE" | "BOOKED";

type SlotRow = {
  id: string;
  start_time: string;
  end_time: string;
  status: SlotStatus;
};

type BookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "RESCHEDULED"
  | "CANCELLED"
  | "COMPLETED"
  | "NO_SHOW";

type BookingRow = {
  id: string;
  status: BookingStatus;
  scheduled_start: string;
  clients: {
    profiles: {
      full_name: string | null;
    } | null;
  } | null;
};

const SLOT_BADGES: Record<SlotStatus, string> = {
  AVAILABLE:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  BOOKED: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
};

const BOOKING_BADGES: Record<BookingStatus, string> = {
  PENDING: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  CONFIRMED:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  RESCHEDULED:
    "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300",
  CANCELLED: "bg-muted text-muted-foreground",
  COMPLETED:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  NO_SHOW: "bg-destructive/10 text-destructive",
};

export async function TherapistDashboard({ name }: { name: string }) {
  const supabase = await createClient();

  const { data: userData } = await supabase.auth.getUser();

  let slots: SlotRow[] = [];
  let bookings: BookingRow[] = [];

  if (userData.user) {
    const { data: therapist } = await supabase
      .from("therapists")
      .select("id")
      .eq("profile_id", userData.user.id)
      .maybeSingle();

    if (therapist) {
      const { data: slotData } = await supabase
        .from("availability_slots")
        .select("id, start_time, end_time, status")
        .eq("therapist_id", therapist.id)
        .gte("end_time", new Date().toISOString())
        .order("start_time", { ascending: true });

      slots = (slotData ?? []) as unknown as SlotRow[];

      const { data: bookingData } = await supabase
        .from("bookings")
        .select("id, status, scheduled_start, clients(profiles(full_name))")
        .eq("therapist_id", therapist.id)
        .order("scheduled_start", { ascending: false })
        .limit(10);

      bookings = (bookingData ?? []) as unknown as BookingRow[];
    }
  }

  return (
    <div className="flex w-full max-w-2xl flex-col gap-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Welcome{name ? `, ${name.split(" ")[0]}` : ""}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your availability and sessions.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add availability</CardTitle>
          <CardDescription>
            Add a time slot so matched clients can book a session with you.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AddAvailabilityForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Your upcoming slots</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {slots.length > 0 ? (
            slots.map((slot) => (
              <div
                key={slot.id}
                className="flex items-center justify-between rounded-xl border px-4 py-3"
              >
                <p className="text-sm">
                  {new Date(slot.start_time).toLocaleString("en-US", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                    hour: "numeric",
                    minute: "2-digit",
                  })}{" "}
                  –{" "}
                  {new Date(slot.end_time).toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </p>
                <Badge className={`shrink-0 ${SLOT_BADGES[slot.status]}`}>
                  {slot.status}
                </Badge>
              </div>
            ))
          ) : (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No upcoming slots. Add your availability above.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Your bookings</CardTitle>
          <CardDescription>
            Sessions clients have booked with you.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {bookings.length > 0 ? (
            bookings.map((booking) => (
              <div
                key={booking.id}
                className="flex items-center justify-between rounded-xl border px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium">
                    {booking.clients?.profiles?.full_name ?? "Client"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(booking.scheduled_start).toLocaleString("en-US", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <Badge className={`shrink-0 ${BOOKING_BADGES[booking.status]}`}>
                  {booking.status}
                </Badge>
              </div>
            ))
          ) : (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No bookings yet.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

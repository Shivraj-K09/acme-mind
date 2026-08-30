import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
      full_name: string;
    };
  };
  therapists: {
    profiles: {
      full_name: string;
    };
  };
};

export default async function BookingsPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("bookings")
    .select(
      "id, status, scheduled_start, clients(profiles(full_name)), therapists(profiles(full_name))"
    )
    .order("scheduled_start", { ascending: false });

  const bookings = (data ?? []) as unknown as BookingRow[];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bookings</CardTitle>
        <CardDescription>
          All sessions across the platform, newest first.
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
                  {booking.clients.profiles.full_name} →{" "}
                  {booking.therapists.profiles.full_name}
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
              <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
                {booking.status}
              </span>
            </div>
          ))
        ) : (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No bookings yet. Bookings appear once clients start booking
            sessions.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

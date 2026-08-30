import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/supabase/profile";
import { markBooking } from "@/app/actions/admin";
import { STATUS_BADGES } from "@/lib/status-badges";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

export default async function BookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { profile } = await getProfile();

  const isAdmin = profile.role === "ADMIN";

  const { error } = await searchParams;

  const supabase = await createClient();

  const { data } = await supabase
    .from("bookings")
    .select(
      "id, status, scheduled_start, clients(profiles(full_name)), therapists(profiles(full_name))"
    )
    .order("scheduled_start", { ascending: false });

  const bookings = (data ?? []) as unknown as BookingRow[];

  return (
    <div className="flex flex-col gap-6">
      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Could not update the booking</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Bookings</CardTitle>
          <CardDescription>
            All sessions across the platform, newest first.
            {isAdmin
              ? " As admin you can mark sessions COMPLETED or NO_SHOW."
              : ""}
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
                    {booking.clients?.profiles?.full_name ?? "Unknown client"}{" "}
                    {"->"}
                    {booking.therapists?.profiles?.full_name ??
                      "Unknown therapist"}
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
                <div className="flex items-center gap-2">
                  {isAdmin &&
                  (booking.status === "CONFIRMED" ||
                    booking.status === "RESCHEDULED") ? (
                    <>
                      <form
                        action={markBooking.bind(
                          null,
                          booking.id,
                          "COMPLETED"
                        )}
                      >
                        <Button
                          type="submit"
                          size="sm"
                          variant="outline"
                          className="rounded-lg"
                        >
                          Completed
                        </Button>
                      </form>
                      <form action={markBooking.bind(null, booking.id, "NO_SHOW")}>
                        <Button
                          type="submit"
                          size="sm"
                          variant="outline"
                          className="rounded-lg"
                        >
                          No-show
                        </Button>
                      </form>
                    </>
                  ) : null}
                  <Badge
                    className={`shrink-0 ${STATUS_BADGES[booking.status] ?? ""}`}
                  >
                    {booking.status}
                  </Badge>
                </div>
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
    </div>
  );
}

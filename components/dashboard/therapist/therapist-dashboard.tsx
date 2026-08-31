import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { AddAvailabilityForm } from "@/components/dashboard/therapist/add-availability-form";
import { BookingActions } from "@/components/dashboard/booking-actions";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { SlotRow, BookingRow } from "@/types";
import { SLOT_BADGES, BOOKING_BADGES } from "@/constants";

export async function TherapistDashboard({ name }: { name: string }) {
  const supabase = await createClient();

  const { data: userData } = await supabase.auth.getUser();

  let slots: SlotRow[] = [];
  let bookings: BookingRow[] = [];
  let therapistId: string | null = null;
  const profilesMap = new Map<
    string,
    { full_name: string | null; email: string | null }
  >();

  if (userData.user) {
    const { data: therapist } = await supabase
      .from("therapists")
      .select("id")
      .eq("profile_id", userData.user.id)
      .maybeSingle();

    if (therapist) {
      therapistId = therapist.id;
      const { data: slotData } = await supabase
        .from("availability_slots")
        .select("id, start_time, end_time, status")
        .eq("therapist_id", therapist.id)
        .gte("end_time", new Date().toISOString())
        .order("start_time", { ascending: true });

      slots = (slotData ?? []) as unknown as SlotRow[];

      const { data: bookingData } = await supabase
        .from("bookings")
        .select(
          "id, client_id, therapist_id, status, scheduled_start, clients(id, profile_id, profiles(full_name, email))",
        )
        .eq("therapist_id", therapist.id)
        .order("scheduled_start", { ascending: false })
        .limit(10);

      const rawBookings = (bookingData ?? []) as unknown as BookingRow[];
      const clientIds = Array.from(
        new Set(
          rawBookings
            .map((b) => b.client_id)
            .filter((id): id is string => Boolean(id)),
        ),
      );

      const admin = createAdminClient();
      const clientToUse = admin ?? supabase;

      if (clientIds.length > 0) {
        const { data: clientRows } = await clientToUse
          .from("clients")
          .select("id, profile_id, profiles(full_name, email)")
          .in("id", clientIds);

        clientRows?.forEach(
          (c: {
            id: string;
            profile_id?: string;
            profiles?:
              | { full_name: string | null; email: string | null }
              | { full_name: string | null; email: string | null }[]
              | null;
          }) => {
            const prof = Array.isArray(c.profiles) ? c.profiles[0] : c.profiles;
            if (prof) {
              profilesMap.set(c.id, prof);
              if (c.profile_id) profilesMap.set(c.profile_id, prof);
            }
          },
        );
      }

      bookings = rawBookings.map((booking) => {
        const clientProfile =
          booking.clients?.profiles ||
          (booking.client_id ? profilesMap.get(booking.client_id) : null) ||
          (booking.clients?.profile_id
            ? profilesMap.get(booking.clients.profile_id)
            : null);

        const clientName =
          clientProfile?.full_name?.trim() ||
          (clientProfile?.email
            ? clientProfile.email.split("@")[0].charAt(0).toUpperCase() +
              clientProfile.email.split("@")[0].slice(1)
            : null) ||
          "Client";

        return {
          ...booking,
          clientName,
        };
      });
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
                  -{" "}
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
          <CardTitle>Bookings</CardTitle>
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
                  <p className="text-sm font-medium">{booking.clientName}</p>
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
                <div className="flex flex-col items-end gap-2">
                  <Badge
                    className={`shrink-0 ${BOOKING_BADGES[booking.status]}`}
                  >
                    {booking.status}
                  </Badge>
                  {booking.status === "PENDING" ||
                  booking.status === "CONFIRMED" ? (
                    <BookingActions
                      bookingId={booking.id}
                      therapistId={therapistId ?? ""}
                    />
                  ) : null}
                </div>
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

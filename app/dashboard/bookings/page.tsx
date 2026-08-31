import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getProfile } from "@/lib/supabase/profile";
import { markBooking } from "@/app/actions/admin";
import { STATUS_BADGES } from "@/constants";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar, ArrowRight, Clock, ShieldAlert } from "lucide-react";
import type { BookingRow } from "@/types";

function getPersonName(
  profile?: { full_name?: string | null; email?: string | null } | null,
  fallback = "Member",
): string {
  if (profile?.full_name && profile.full_name.trim().length > 0) {
    return profile.full_name.trim();
  }
  if (profile?.email && profile.email.trim().length > 0) {
    const username = profile.email.split("@")[0];
    return username.charAt(0).toUpperCase() + username.slice(1);
  }
  return fallback;
}

export default async function BookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { profile } = await getProfile();
  const isAdmin = profile.role === "ADMIN";
  const { error } = await searchParams;
  const supabase = await createClient();

  const { data: bookingsData } = await supabase
    .from("bookings")
    .select(
      "id, status, scheduled_start, client_id, therapist_id, clients(id, profile_id, profiles(full_name, email)), therapists(id, profile_id, profiles(full_name, email))",
    )
    .order("scheduled_start", { ascending: false });

  const rawBookings = (bookingsData ?? []) as unknown as BookingRow[];

  const clientIds = Array.from(
    new Set(rawBookings.map((b) => b.client_id).filter(Boolean)),
  );
  const therapistIds = Array.from(
    new Set(rawBookings.map((b) => b.therapist_id).filter(Boolean)),
  );

  const profilesMap = new Map<
    string,
    { full_name: string | null; email: string | null }
  >();

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

  if (therapistIds.length > 0) {
    const { data: therapistRows } = await clientToUse
      .from("therapists")
      .select("id, profile_id, profiles(full_name, email)")
      .in("id", therapistIds);

    therapistRows?.forEach(
      (t: {
        id: string;
        profile_id?: string;
        profiles?:
          | { full_name: string | null; email: string | null }
          | { full_name: string | null; email: string | null }[]
          | null;
      }) => {
        const prof = Array.isArray(t.profiles) ? t.profiles[0] : t.profiles;
        if (prof) {
          profilesMap.set(t.id, prof);
          if (t.profile_id) profilesMap.set(t.profile_id, prof);
        }
      },
    );
  }

  const bookings = rawBookings.map((booking) => {
    const clientProfile =
      booking.clients?.profiles ||
      (booking.client_id ? profilesMap.get(booking.client_id) : null) ||
      (booking.clients?.profile_id
        ? profilesMap.get(booking.clients.profile_id)
        : null);
    const therapistProfile =
      booking.therapists?.profiles ||
      (booking.therapist_id ? profilesMap.get(booking.therapist_id) : null) ||
      (booking.therapists?.profile_id
        ? profilesMap.get(booking.therapists.profile_id)
        : null);

    return {
      ...booking,
      clientName: getPersonName(clientProfile, "Client"),
      therapistName: getPersonName(therapistProfile, "Therapist"),
    };
  });

  return (
    <div className="flex flex-col gap-6">
      {error ? (
        <Alert variant="destructive">
          <ShieldAlert className="size-4" />
          <AlertTitle>Could not update the booking</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Bookings & Sessions
            </h1>
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
              {bookings.length} {bookings.length === 1 ? "Session" : "Sessions"}
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            All therapy sessions across the platform, newest appointments first.
            {isAdmin
              ? " As admin you can mark sessions COMPLETED or NO_SHOW."
              : ""}
          </p>
        </div>
      </div>

      <Card className="shadow-xs border-border/80">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">
            Session Overview
          </CardTitle>
          <CardDescription>
            Live view of matched client and therapist appointments.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {bookings.length > 0 ? (
            bookings.map((booking) => (
              <div
                key={booking.id}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-xl border border-border/80 bg-card p-4 transition-all hover:border-primary/40 hover:bg-muted/20"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 min-w-0">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Calendar className="size-5" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5 font-semibold text-sm text-foreground">
                        <span className="rounded-md bg-muted px-2 py-0.5 text-xs text-foreground font-medium">
                          Client
                        </span>
                        <span className="truncate">{booking.clientName}</span>
                      </div>

                      <ArrowRight className="size-3.5 text-muted-foreground shrink-0" />

                      <div className="flex items-center gap-1.5 font-semibold text-sm text-foreground">
                        <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs text-primary font-medium">
                          Therapist
                        </span>
                        <span className="truncate">
                          {booking.therapistName}
                        </span>
                      </div>
                    </div>

                    <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="size-3.5 text-primary shrink-0" />
                      <span>
                        {new Date(booking.scheduled_start).toLocaleString(
                          "en-US",
                          {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          },
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 md:self-center">
                  <Badge
                    className={`shrink-0 ${STATUS_BADGES[booking.status] ?? ""}`}
                  >
                    {booking.status}
                  </Badge>

                  {isAdmin &&
                    (booking.status === "CONFIRMED" ||
                      booking.status === "RESCHEDULED") && (
                      <div className="flex items-center gap-2">
                        <form
                          action={markBooking.bind(
                            null,
                            booking.id,
                            "COMPLETED",
                          )}
                        >
                          <Button
                            type="submit"
                            size="sm"
                            variant="outline"
                            className="rounded-lg h-8 text-xs font-medium hover:bg-emerald-500/10 hover:text-emerald-700 hover:border-emerald-500/30"
                          >
                            Mark Completed
                          </Button>
                        </form>
                        <form
                          action={markBooking.bind(null, booking.id, "NO_SHOW")}
                        >
                          <Button
                            type="submit"
                            size="sm"
                            variant="outline"
                            className="rounded-lg h-8 text-xs font-medium hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                          >
                            No-show
                          </Button>
                        </form>
                      </div>
                    )}
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground mx-auto mb-3">
                <Calendar className="size-6" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">
                No bookings found
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Bookings will appear here once clients book appointments with
                therapists.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

import { LifeBuoy } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { BookingActions } from "@/components/dashboard/booking-actions";
import { PayButton } from "@/components/dashboard/client/pay-button";
import { RespondButtons } from "@/components/dashboard/client/respond-buttons";
import { TherapistSlotsDialog } from "@/components/dashboard/client/therapist-slots-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type RecommendationStatus = "PENDING" | "ACCEPTED" | "REJECTED";

type RecommendationRow = {
  id: string;
  therapist_id: string;
  status: RecommendationStatus;
  therapists: {
    bio: string;
    specialization: string;
    experience_years: number;
    profiles: {
      full_name: string | null;
    } | null;
  };
};

type SlotOption = {
  id: string;
  label: string;
};

type BookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "RESCHEDULED"
  | "CANCELLED"
  | "COMPLETED"
  | "NO_SHOW";

type ClientBookingRow = {
  id: string;
  status: BookingStatus;
  scheduled_start: string;
  therapist_id: string;
  therapists: {
    profiles: {
      full_name: string;
    } | null;
  } | null;
};

function therapistInitials(name: string | null) {
  if (!name) return "T";

  return (
    name
      .split(" ")
      .map((part) => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "T"
  );
}

function formatSlotLabel(start: string, end: string) {
  return `${new Date(start).toLocaleString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  })} - ${new Date(end).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })}`;
}

const STATUS_BADGES: Record<RecommendationStatus | BookingStatus, string> = {
  PENDING: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  ACCEPTED:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  REJECTED: "bg-muted text-muted-foreground",
  CONFIRMED:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  RESCHEDULED: "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300",
  COMPLETED:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  NO_SHOW: "bg-destructive/10 text-destructive",
  CANCELLED: "bg-muted text-muted-foreground",
};

export async function ClientDashboard({ name }: { name: string }) {
  const supabase = await createClient();

  const { data: userData } = await supabase.auth.getUser();

  let recommendations: RecommendationRow[] = [];
  let bookings: ClientBookingRow[] = [];

  if (userData.user) {
    const { data } = await supabase
      .from("clients")
      .select(
        "therapist_recommendations(id, therapist_id, status, therapists(bio, specialization, experience_years, profiles(full_name)))"
      )
      .eq("profile_id", userData.user.id)
      .maybeSingle();

    recommendations = (data?.therapist_recommendations ??
      []) as unknown as RecommendationRow[];

    const { data: bookingData } = await supabase
      .from("bookings")
      .select(
        "id, status, scheduled_start, therapist_id, therapists(profiles(full_name))"
      )
      .order("scheduled_start", { ascending: true });

    bookings = (bookingData ?? []) as unknown as ClientBookingRow[];
  }

  const accepted = recommendations.filter(
    (recommendation) => recommendation.status === "ACCEPTED"
  );

  const slotsByTherapist = new Map<string, SlotOption[]>();

  await Promise.all(
    accepted.map(async (recommendation) => {
      const { data } = await supabase
        .from("availability_slots")
        .select("id, start_time, end_time")
        .eq("therapist_id", recommendation.therapist_id)
        .eq("status", "AVAILABLE")
        .gte("end_time", new Date().toISOString())
        .order("start_time", { ascending: true });

      slotsByTherapist.set(
        recommendation.therapist_id,
        (
          (data ?? []) as unknown as {
            id: string;
            start_time: string;
            end_time: string;
          }[]
        ).map((slot) => ({
          id: slot.id,
          label: formatSlotLabel(slot.start_time, slot.end_time),
        }))
      );
    })
  );

  return (
    <>
      <div className="flex w-full max-w-xl flex-col gap-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Welcome{name ? `, ${name.split(" ")[0]}` : ""}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Here are the therapists matched for you.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
              Your recommended therapists
            </h2>
            {recommendations.length > 0 ? (
              <span className="text-sm text-muted-foreground">
                {recommendations.length} match
                {recommendations.length === 1 ? "" : "es"}
              </span>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-4">
            {recommendations.map((recommendation) => {
              const therapistName =
                recommendation.therapists.profiles?.full_name ?? "Therapist";

              return (
                <div
                  key={recommendation.id}
                  className="relative flex w-full max-w-[320px] flex-col rounded-2xl border bg-card p-4 shadow-xs"
                >
                  <Badge
                    className={`absolute right-3 top-3 ${STATUS_BADGES[recommendation.status]}`}
                  >
                    {recommendation.status}
                  </Badge>
                  <div className="flex items-center gap-3 pr-20">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                      {therapistInitials(therapistName)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">
                        {therapistName}
                      </p>
                      <p className="truncate text-sm text-muted-foreground">
                        {recommendation.therapists.specialization ||
                          "General therapy"}
                      </p>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {recommendation.therapists.experience_years} yrs experience
                  </p>

                  {recommendation.therapists.bio ? (
                    <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
                      {recommendation.therapists.bio}
                    </p>
                  ) : null}

                  {recommendation.status === "PENDING" ? (
                    <div className="mt-4 flex justify-end border-t pt-4">
                      <RespondButtons recommendationId={recommendation.id} />
                    </div>
                  ) : null}

                  {recommendation.status === "ACCEPTED" ? (
                    <div className="mt-4 border-t pt-4">
                      <TherapistSlotsDialog
                        therapistName={therapistName}
                        bio={recommendation.therapists.bio}
                        specialization={
                          recommendation.therapists.specialization ||
                          "General therapy"
                        }
                        experienceYears={
                          recommendation.therapists.experience_years
                        }
                        slots={
                          slotsByTherapist.get(recommendation.therapist_id) ??
                          []
                        }
                      />
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>

          {recommendations.length === 0 ? (
            <div className="w-full rounded-2xl border border-dashed p-8 text-center">
              <p className="text-sm text-muted-foreground">
                No recommendations yet. Connect with our care coordinator to
                get matched with the right therapist.
              </p>
            </div>
          ) : null}
        </div>

        {bookings.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Your sessions</CardTitle>
              <CardDescription>
                Complete the payment to confirm a pending session.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between rounded-xl border px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {booking.therapists?.profiles?.full_name ??
                        "Unknown therapist"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(booking.scheduled_start).toLocaleString(
                        "en-US",
                        {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        }
                      )}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge
                      className={`shrink-0 ${STATUS_BADGES[booking.status] ?? ""}`}
                    >
                      {booking.status}
                    </Badge>
                    {booking.status === "PENDING" ? (
                      <PayButton bookingId={booking.id} />
                    ) : null}
                    {booking.status === "PENDING" ||
                    booking.status === "CONFIRMED" ? (
                      <BookingActions
                        bookingId={booking.id}
                        therapistId={booking.therapist_id}
                      />
                    ) : null}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ) : null}

        <Card>
          <CardHeader>
            <CardDescription>Looking for the right therapist?</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="text-sm leading-relaxed text-muted-foreground">
              Our care coordinator understands your needs and matches you with
              the therapist that fits you best.
            </p>
            <Button size="lg" className="h-11 w-full rounded-xl">
              <LifeBuoy data-icon="inline-start" /> Contact Coordinator
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

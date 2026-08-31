import { LifeBuoy, Sparkles, Calendar, HeartHandshake } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { BookingActions } from "@/components/dashboard/booking-actions";
import { PayButton } from "@/components/dashboard/client/pay-button";
import { RespondButtons } from "@/components/dashboard/client/respond-buttons";
import { TherapistSlotsDialog } from "@/components/dashboard/client/therapist-slots-dialog";
import { TherapistCard } from "@/components/dashboard/therapist/therapist-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import type {
  RecommendationRow,
  SlotOption,
  ClientBookingRow,
} from "@/types";

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

import { STATUS_BADGES } from "@/constants";

export async function ClientDashboard({ name }: { name: string }) {
  const supabase = await createClient();

  const { data: userData } = await supabase.auth.getUser();

  let recommendations: RecommendationRow[] = [];
  let bookings: ClientBookingRow[] = [];
  const therapistProfilesMap = new Map<string, { full_name: string | null; email: string | null }>();

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
        "id, status, scheduled_start, therapist_id, therapists(id, profile_id, profiles(full_name, email))"
      )
      .order("scheduled_start", { ascending: true });

    const rawBookings = (bookingData ?? []) as unknown as (ClientBookingRow & {
      therapists?: { id?: string; profile_id?: string; profiles?: { full_name: string | null; email: string | null } | null } | null;
    })[];

    const therapistIds = Array.from(
      new Set(rawBookings.map((b) => b.therapist_id).filter(Boolean))
    );

    const admin = createAdminClient();
    const clientToUse = admin ?? supabase;

    if (therapistIds.length > 0) {
      const { data: therapistRows } = await clientToUse
        .from("therapists")
        .select("id, profile_id, profiles(full_name, email)")
        .in("id", therapistIds);

      therapistRows?.forEach((t: { id: string; profile_id?: string; profiles?: { full_name: string | null; email: string | null } | { full_name: string | null; email: string | null }[] | null }) => {
        const prof = Array.isArray(t.profiles) ? t.profiles[0] : t.profiles;
        if (prof) {
          therapistProfilesMap.set(t.id, prof);
          if (t.profile_id) therapistProfilesMap.set(t.profile_id, prof);
        }
      });
    }

    bookings = rawBookings.map((booking) => {
      const therapistProfile =
        booking.therapists?.profiles ||
        (booking.therapist_id
          ? therapistProfilesMap.get(booking.therapist_id)
          : null);

      const therapistName =
        therapistProfile?.full_name?.trim() ||
        (therapistProfile?.email
          ? "Dr. " +
            therapistProfile.email.split("@")[0].charAt(0).toUpperCase() +
            therapistProfile.email.split("@")[0].slice(1)
          : null) ||
        "Licensed Specialist";

      return {
        ...booking,
        therapistName,
      };
    });
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

  const displayName = name ? name.split(" ")[0] : "there";

  const formattedRecommendations = recommendations.map((recommendation) => {
    const therapistName =
      recommendation.therapists?.profiles?.full_name ?? "Licensed Therapist";
    const availableSlots =
      slotsByTherapist.get(recommendation.therapist_id) ?? [];

    return {
      ...recommendation,
      therapistName,
      availableSlots,
    };
  });

  return (
    <div className="flex w-full flex-col gap-10">
      {/* Welcome Hero Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Welcome, {displayName}
            </h1>
          </div>
          <p className="mt-1.5 text-sm text-muted-foreground max-w-xl">
            Here are your matched therapists and care journey overview. Select a specialist to book sessions or connect with your coordinator.
          </p>
        </div>

        {/* Quick summary chips */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="flex items-center gap-2 rounded-xl border bg-card/80 px-3.5 py-2 shadow-2xs">
            <Sparkles className="size-4 text-primary" />
            <div className="text-left text-xs">
              <span className="font-bold text-foreground">{recommendations.length}</span>
              <span className="ml-1 text-muted-foreground">Matched {recommendations.length === 1 ? "Specialist" : "Specialists"}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-xl border bg-card/80 px-3.5 py-2 shadow-2xs">
            <Calendar className="size-4 text-primary" />
            <div className="text-left text-xs">
              <span className="font-bold text-foreground">{bookings.length}</span>
              <span className="ml-1 text-muted-foreground">{bookings.length === 1 ? "Session" : "Sessions"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Therapists Section */}
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-foreground">
              Your Recommended Therapists
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Carefully matched by our clinical team based on your wellness goals.
            </p>
          </div>
          {recommendations.length > 0 && (
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
              {recommendations.length} {recommendations.length === 1 ? "Match" : "Matches"}
            </span>
          )}
        </div>

        {formattedRecommendations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {formattedRecommendations.map((recommendation) => (
              <TherapistCard
                key={recommendation.id}
                id={recommendation.id}
                name={recommendation.therapistName}
                specialization={recommendation.therapists?.specialization}
                experienceYears={recommendation.therapists?.experience_years}
                bio={recommendation.therapists?.bio}
                availableSlotsCount={recommendation.availableSlots.length}
                statusBadge={
                  <Badge
                    className={`shrink-0 ${STATUS_BADGES[recommendation.status]}`}
                  >
                    {recommendation.status}
                  </Badge>
                }
                actions={
                  recommendation.status === "PENDING" ? (
                    <RespondButtons recommendationId={recommendation.id} />
                  ) : recommendation.status === "ACCEPTED" ? (
                    <TherapistSlotsDialog
                      therapistName={recommendation.therapistName}
                      bio={recommendation.therapists?.bio}
                      specialization={
                        recommendation.therapists?.specialization ||
                        "General Clinical Therapy"
                      }
                      experienceYears={
                        recommendation.therapists?.experience_years
                      }
                      slots={recommendation.availableSlots}
                    />
                  ) : null
                }
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 p-12 text-center bg-card/40">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-3">
              <HeartHandshake className="size-6" />
            </div>
            <h3 className="text-base font-semibold text-foreground">
              No recommendations yet
            </h3>
            <p className="mt-1 max-w-md text-sm text-muted-foreground">
              Our care coordinator is reviewing your profile to match you with the right licensed therapist.
            </p>
          </div>
        )}
      </div>

      {/* Your Sessions Section */}
      {bookings.length > 0 && (
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-bold tracking-tight text-foreground">
            Your Scheduled Sessions
          </h2>
          <Card className="shadow-xs border-border/80">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Upcoming Appointments</CardTitle>
              <CardDescription>
                Complete payment to confirm pending appointments or manage existing sessions.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-border/80 bg-muted/20 p-4 transition-colors hover:bg-muted/40"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Calendar className="size-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {booking.therapistName}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(booking.scheduled_start).toLocaleString("en-US", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 sm:self-center">
                    <Badge
                      className={`shrink-0 ${STATUS_BADGES[booking.status] ?? ""}`}
                    >
                      {booking.status}
                    </Badge>
                    {booking.status === "PENDING" && (
                      <PayButton bookingId={booking.id} />
                    )}
                    {(booking.status === "PENDING" ||
                      booking.status === "CONFIRMED") && (
                      <BookingActions
                        bookingId={booking.id}
                        therapistId={booking.therapist_id}
                      />
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Support & Coordinator Card */}
      <Card className="shadow-xs border-border/80 overflow-hidden bg-linear-to-r from-primary/5 via-card to-card">
        <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 p-6">
          <div className="flex items-start gap-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <LifeBuoy className="size-5.5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground">
                Looking for a different therapist or custom schedule?
              </h3>
              <p className="mt-1 text-sm text-muted-foreground max-w-xl">
                Our care coordinators work with you directly to understand your schedule, preferences, and clinical needs.
              </p>
            </div>
          </div>
          <Button
            size="lg"
            nativeButton={false}
            render={
              <a href="mailto:coordinator@thoughtpudding.com?subject=Care%20Coordinator%20Matching%20Assistance" />
            }
            className="shrink-0 rounded-xl h-11 px-6 font-medium shadow-xs"
          >
            <LifeBuoy className="size-4 mr-2" /> Contact Coordinator
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}


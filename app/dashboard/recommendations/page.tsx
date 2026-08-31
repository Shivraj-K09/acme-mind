import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ArrowRight, Calendar } from "lucide-react";
import type { RecommendationRow } from "@/types";
import { STATUS_BADGES } from "@/constants";

function getPersonName(
  profile?: { full_name?: string | null; email?: string | null } | null,
  fallback = "Member"
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

export default async function RecommendationsPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("therapist_recommendations")
    .select(
      "id, client_id, therapist_id, status, created_at, clients(id, profile_id, profiles(full_name, email)), therapists(id, profile_id, profiles(full_name, email))"
    )
    .order("created_at", { ascending: false });

  const rawRecommendations = (data ?? []) as unknown as RecommendationRow[];

  const clientIds = Array.from(
    new Set(rawRecommendations.map((r) => r.client_id).filter((id): id is string => Boolean(id)))
  );
  const therapistIds = Array.from(
    new Set(rawRecommendations.map((r) => r.therapist_id).filter((id): id is string => Boolean(id)))
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

    clientRows?.forEach((c: { id: string; profile_id?: string; profiles?: { full_name: string | null; email: string | null } | { full_name: string | null; email: string | null }[] | null }) => {
      const prof = Array.isArray(c.profiles) ? c.profiles[0] : c.profiles;
      if (prof) {
        profilesMap.set(c.id, prof);
        if (c.profile_id) profilesMap.set(c.profile_id, prof);
      }
    });
  }

  if (therapistIds.length > 0) {
    const { data: therapistRows } = await clientToUse
      .from("therapists")
      .select("id, profile_id, profiles(full_name, email)")
      .in("id", therapistIds);

    therapistRows?.forEach((t: { id: string; profile_id?: string; profiles?: { full_name: string | null; email: string | null } | { full_name: string | null; email: string | null }[] | null }) => {
      const prof = Array.isArray(t.profiles) ? t.profiles[0] : t.profiles;
      if (prof) {
        profilesMap.set(t.id, prof);
        if (t.profile_id) profilesMap.set(t.profile_id, prof);
      }
    });
  }

  const recommendations = rawRecommendations.map((recommendation) => {
    const clientProfile =
      recommendation.clients?.profiles ||
      (recommendation.client_id
        ? profilesMap.get(recommendation.client_id)
        : null) ||
      (recommendation.clients?.profile_id
        ? profilesMap.get(recommendation.clients.profile_id)
        : null);
    const therapistProfile =
      recommendation.therapists?.profiles ||
      (recommendation.therapist_id
        ? profilesMap.get(recommendation.therapist_id)
        : null) ||
      (recommendation.therapists?.profile_id
        ? profilesMap.get(recommendation.therapists.profile_id)
        : null);

    return {
      ...recommendation,
      clientName: getPersonName(clientProfile, "Client"),
      therapistName: getPersonName(therapistProfile, "Therapist"),
    };
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Recommendations
            </h1>
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
              {recommendations.length} {recommendations.length === 1 ? "Match" : "Matches"}
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Every client-therapist match made so far across the network.
          </p>
        </div>
      </div>

      <Card className="shadow-xs border-border/80">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Match Feed</CardTitle>
          <CardDescription>
            Therapist recommendations created by coordinators.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {recommendations.length > 0 ? (
            recommendations.map((recommendation) => (
              <div
                key={recommendation.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-border/80 bg-card p-4 transition-all hover:border-primary/40 hover:bg-muted/20"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Sparkles className="size-5" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm text-foreground">
                        {recommendation.clientName}
                      </span>
                      <ArrowRight className="size-3 text-muted-foreground" />
                      <span className="font-semibold text-sm text-primary">
                        {recommendation.therapistName}
                      </span>
                    </div>

                      <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Calendar className="size-3 text-muted-foreground" />
                        <span>
                          {new Date(recommendation.created_at).toLocaleDateString(
                            "en-US",
                            { day: "numeric", month: "short", year: "numeric" }
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Badge
                    className={`shrink-0 ${STATUS_BADGES[recommendation.status] ?? ""}`}
                  >
                    {recommendation.status}
                  </Badge>
                </div>
              ))
          ) : (
            <div className="py-12 text-center">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground mx-auto mb-3">
                <Sparkles className="size-6" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">No recommendations yet</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Recommend a therapist from a client&apos;s profile page.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

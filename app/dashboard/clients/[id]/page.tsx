import Link from "next/link";
import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { RecommendTherapistForm } from "@/components/dashboard/coordinator/recommend-therapist-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ChevronLeft } from "lucide-react";
import type { ClientRow, RecommendationRow, TherapistRow } from "@/types";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();

  const { data: clientData } = await supabase
    .from("clients")
    .select("id, created_at, profiles!inner(full_name, email, phone)")
    .eq("profile_id", id)
    .maybeSingle();

  if (!clientData) {
    notFound();
  }

  const client = clientData as unknown as ClientRow;

  const { data: recommendationData } = await supabase
    .from("therapist_recommendations")
    .select(
      "id, therapist_id, status, therapists(specialization, experience_years, profiles(full_name))"
    )
    .eq("client_id", client.id)
    .order("created_at", { ascending: false });

  const recommendations = (recommendationData ??
    []) as unknown as RecommendationRow[];

  const { data: therapistData } = await supabase
    .from("therapists")
    .select("id, specialization, profiles(full_name)")
    .order("created_at", { ascending: true });

  const therapistOptions = ((therapistData ?? []) as unknown as TherapistRow[])
    .filter(
      (therapist) =>
        !recommendations.some(
          (recommendation) =>
            recommendation.therapist_id === therapist.id
        )
    )
    .map((therapist) => ({
      id: therapist.id,
      label: `${therapist.profiles?.full_name ?? "Therapist"} - ${
        therapist.specialization || "General therapy"
      }`,
    }));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Button
          variant="ghost"
          size="sm"
          nativeButton={false}
          render={<Link href="/dashboard/clients" />}
          className="gap-1 text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-4 shrink-0" />
          <span>Back to clients</span>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            {client.profiles?.full_name ?? "Unnamed client"}
          </CardTitle>
          <CardDescription>
            Client since{" "}
            {new Date(client.created_at).toLocaleDateString("en-US", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-1 text-sm">
          <p>
            <span className="text-muted-foreground">Email: </span>
            {client.profiles?.email ?? "-"}
          </p>
          <p>
            <span className="text-muted-foreground">Phone: </span>
            {client.profiles?.phone ?? "-"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recommend a therapist</CardTitle>
          <CardDescription>
            The client will see their recommended therapists on their dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RecommendTherapistForm
            clientId={client.id}
            therapists={therapistOptions}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recommended therapists</CardTitle>
          <CardDescription>
            Therapists matched to this client by the coordinator.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {recommendations.length > 0 ? (
            recommendations.map((recommendation) => (
              <div
                key={recommendation.id}
                className="flex items-center justify-between rounded-xl border px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium">
                    {recommendation.therapists?.profiles?.full_name ??
                      "Unknown therapist"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {recommendation.therapists?.specialization ?? "General therapy"} -{" "}
                    {recommendation.therapists?.experience_years ?? 0} yrs experience
                  </p>
                </div>
                <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
                  {recommendation.status}
                </span>
              </div>
            ))
          ) : (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No recommendations yet.
            </p>
          )}
          <Separator className="my-2" />
          <p className="text-sm text-muted-foreground">
            Clients accept or reject a recommendation from their dashboard.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

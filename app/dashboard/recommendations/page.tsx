import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type RecommendationStatus = "PENDING" | "ACCEPTED" | "REJECTED";

type RecommendationRow = {
  id: string;
  status: RecommendationStatus;
  created_at: string;
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

export default async function RecommendationsPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("therapist_recommendations")
    .select(
      "id, status, created_at, clients(profiles(full_name)), therapists(profiles(full_name))"
    )
    .order("created_at", { ascending: false });

  const recommendations = (data ?? []) as unknown as RecommendationRow[];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recommendations</CardTitle>
        <CardDescription>
          Every client-therapist match made so far, with its status.
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
                  {recommendation.clients?.profiles?.full_name ?? "Unknown client"}{" "}
                  {"->"} {recommendation.therapists?.profiles?.full_name ?? "Unknown therapist"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {new Date(recommendation.created_at).toLocaleDateString(
                    "en-US",
                    { day: "numeric", month: "short", year: "numeric" }
                  )}
                </p>
              </div>
              <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
                {recommendation.status}
              </span>
            </div>
          ))
        ) : (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No recommendations yet. Recommend a therapist from a client&apos;s
            page.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { CoordinatorRow } from "@/types";

export default async function CoordinatorsPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("profiles")
    .select("id, email, full_name, phone")
    .eq("role", "COORDINATOR")
    .order("created_at", { ascending: true });

  const coordinators = (data ?? []) as unknown as CoordinatorRow[];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Coordinators</CardTitle>
        <CardDescription>
          The team matching clients with the right therapists.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {coordinators.length > 0 ? (
          coordinators.map((coordinator) => (
            <div
              key={coordinator.id}
              className="flex items-center justify-between rounded-xl border px-4 py-3"
            >
              <div>
                <p className="text-sm font-medium">
                  {coordinator.full_name || "Unnamed coordinator"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {coordinator.email}
                </p>
              </div>
              {coordinator.phone ? (
                <p className="text-sm text-muted-foreground">
                  {coordinator.phone}
                </p>
              ) : null}
            </div>
          ))
        ) : (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No coordinators yet. Promote a user to COORDINATOR to add them
            here.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type TherapistRow = {
  id: string;
  specialization: string;
  experience_years: number;
  profiles: {
    full_name: string;
    email: string;
  };
};

export default async function TherapistsPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("therapists")
    .select("id, specialization, experience_years, profiles!inner(full_name, email)")
    .order("created_at", { ascending: true });

  const therapists = (data ?? []) as unknown as TherapistRow[];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Therapists</CardTitle>
        <CardDescription>
          The therapist network available for matching with clients.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {therapists.length > 0 ? (
          therapists.map((therapist) => (
            <div
              key={therapist.id}
              className="flex items-center justify-between rounded-xl border px-4 py-3"
            >
              <div>
                <p className="text-sm font-medium">
                  {therapist.profiles.full_name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {therapist.profiles.email}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">
                  {therapist.specialization || "General therapy"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {therapist.experience_years} yrs experience
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No therapists yet. Promote a user to THERAPIST to add them here.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

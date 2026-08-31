import { createClient } from "@/lib/supabase/server";
import { TherapistCard } from "@/components/dashboard/therapist/therapist-card";
import { Stethoscope } from "lucide-react";
import type { TherapistRow } from "@/types";

export default async function TherapistsPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("therapists")
    .select(
      "id, bio, specialization, experience_years, profiles!inner(full_name, email, phone)"
    )
    .order("created_at", { ascending: true });

  const therapists = (data ?? []) as unknown as TherapistRow[];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Therapist Directory
            </h1>
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
              {therapists.length} {therapists.length === 1 ? "Specialist" : "Specialists"}
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            The licensed therapist network available for client matching and mental health care.
          </p>
        </div>
      </div>

      {/* Doctor Card Grid */}
      {therapists.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {therapists.map((therapist) => (
            <TherapistCard
              key={therapist.id}
              id={therapist.id}
              name={therapist.profiles?.full_name ?? "Licensed Therapist"}
              specialization={therapist.specialization}
              experienceYears={therapist.experience_years}
              bio={therapist.bio}
              email={therapist.profiles?.email}
              phone={therapist.profiles?.phone}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed p-12 text-center bg-card/50">
          <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-3">
            <Stethoscope className="size-6" />
          </div>
          <h3 className="text-base font-semibold text-foreground">No therapists registered yet</h3>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Promote a user to THERAPIST role to add them to the specialist network directory.
          </p>
        </div>
      )}
    </div>
  );
}

import type { Metadata } from "next";

import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/supabase/profile";
import { ProfileForm } from "@/components/dashboard/profile/profile-form";
import { TherapistCard } from "@/components/dashboard/therapist/therapist-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Profile",
};

export default async function ProfilePage() {
  const { user, profile } = await getProfile();

  const supabase = await createClient();

  const { data: therapist } = await supabase
    .from("therapists")
    .select("id, bio, specialization, experience_years")
    .eq("profile_id", user.id)
    .maybeSingle();

  return (
    <div className="flex flex-col gap-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Specialist Profile
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your clinical credentials, bio, and patient-facing doctor card.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Profile Settings Form */}
        <div className="lg:col-span-7">
          <Card className="shadow-xs border-border/80">
            <CardHeader>
              <CardTitle>Profile Details</CardTitle>
              <CardDescription>
                Update how you appear to clients and care coordinators.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProfileForm
                defaults={{
                  fullName: profile.full_name,
                  phone: profile.phone ?? "",
                  bio: therapist?.bio ?? "",
                  specialization: therapist?.specialization ?? "",
                  experienceYears: therapist?.experience_years ?? 0,
                }}
              />
            </CardContent>
          </Card>
        </div>

        {/* Live Doctor Card Preview */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          <div className="flex items-center gap-1.5 px-1">
            <Sparkles className="size-4 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Live Doctor Card Preview
            </span>
          </div>

          <TherapistCard
            id={therapist?.id ?? "preview"}
            name={profile.full_name || "Dr. Therapist"}
            specialization={therapist?.specialization || "General Clinical Therapy"}
            experienceYears={therapist?.experience_years ?? 0}
            bio={therapist?.bio || "Your clinical approach and background will appear here for clients."}
            email={user.email}
            phone={profile.phone}
          />
        </div>
      </div>
    </div>
  );
}

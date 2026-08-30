import type { Metadata } from "next";

import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/supabase/profile";
import { ProfileForm } from "@/components/dashboard/profile/profile-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Profile",
};

export default async function ProfilePage() {
  const { user, profile } = await getProfile();

  const supabase = await createClient();

  const { data: therapist } = await supabase
    .from("therapists")
    .select("bio, specialization, experience_years")
    .eq("profile_id", user.id)
    .maybeSingle();

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>
          Update how you appear to clients and coordinators.
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
  );
}

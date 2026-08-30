import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/sign-out-button";
import { AdminDashboard } from "@/components/dashboard/admin/admin-dashboard";
import { ClientDashboard } from "@/components/dashboard/client/client-dashboard";
import { CoordinatorDashboard } from "@/components/dashboard/coordinator/coordinator-dashboard";
import { TherapistDashboard } from "@/components/dashboard/therapist/therapist-dashboard";

export const metadata: Metadata = {
  title: "Dashboard",
};

const ROLES = ["CLIENT", "THERAPIST", "COORDINATOR", "ADMIN"] as const;

type Role = (typeof ROLES)[number];

const ROLE_DASHBOARDS: Record<Role, React.ComponentType<{ name: string }>> = {
  CLIENT: ClientDashboard,
  THERAPIST: TherapistDashboard,
  COORDINATOR: CoordinatorDashboard,
  ADMIN: AdminDashboard,
};

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", data.user.id)
    .maybeSingle();

  if (!profile) {
    redirect("/login");
  }

  const role: Role = ROLES.includes(profile.role as Role)
    ? (profile.role as Role)
    : "CLIENT";

  const Dashboard = ROLE_DASHBOARDS[role];

  return (
    <div className="flex min-h-svh flex-col">
      <header className="flex items-center justify-between border-b px-6 py-4">
        <span className="text-lg font-semibold tracking-tight">Acme Mind</span>
        <SignOutButton />
      </header>
      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <Dashboard name={profile.full_name} />
      </main>
    </div>
  );
}

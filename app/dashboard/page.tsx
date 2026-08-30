import { getProfile } from "@/lib/supabase/profile";
import { AdminDashboard } from "@/components/dashboard/admin/admin-dashboard";
import { ClientDashboard } from "@/components/dashboard/client/client-dashboard";
import { CoordinatorDashboard } from "@/components/dashboard/coordinator/coordinator-dashboard";
import { TherapistDashboard } from "@/components/dashboard/therapist/therapist-dashboard";

type DashboardComponent = (props: {
  name: string;
}) => Promise<React.ReactNode> | React.ReactNode;

const ROLE_DASHBOARDS: Record<
  "CLIENT" | "THERAPIST" | "COORDINATOR" | "ADMIN",
  DashboardComponent
> = {
  CLIENT: ClientDashboard,
  THERAPIST: TherapistDashboard,
  COORDINATOR: CoordinatorDashboard,
  ADMIN: AdminDashboard,
};

export default async function DashboardPage() {
  const { profile } = await getProfile();

  const Dashboard =
    ROLE_DASHBOARDS[profile.role as keyof typeof ROLE_DASHBOARDS] ??
    ClientDashboard;

  return <Dashboard name={profile.full_name} />;
}

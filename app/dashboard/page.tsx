import { getProfile } from "@/lib/supabase/profile";
import { ClientDashboard } from "@/components/dashboard/client/client-dashboard";
import { ROLE_DASHBOARDS } from "@/constants/roles";

export default async function DashboardPage() {
  const { user, profile } = await getProfile();

  const displayName =
    profile.full_name?.trim() ||
    (user?.email ? user.email.split("@")[0] : "") ||
    "Member";

  const Dashboard =
    ROLE_DASHBOARDS[profile.role as keyof typeof ROLE_DASHBOARDS] ??
    ClientDashboard;

  return <Dashboard name={displayName} />;
}

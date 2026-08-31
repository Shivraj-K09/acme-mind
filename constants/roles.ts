import { AdminDashboard } from "@/components/dashboard/admin/admin-dashboard";
import { ClientDashboard } from "@/components/dashboard/client/client-dashboard";
import { CoordinatorDashboard } from "@/components/dashboard/coordinator/coordinator-dashboard";
import { TherapistDashboard } from "@/components/dashboard/therapist/therapist-dashboard";
import type { DashboardComponent, UserRole } from "@/types";

export const ROLE_DASHBOARDS: Record<UserRole, DashboardComponent> = {
  CLIENT: ClientDashboard,
  THERAPIST: TherapistDashboard,
  COORDINATOR: CoordinatorDashboard,
  ADMIN: AdminDashboard,
};

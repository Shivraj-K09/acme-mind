import type { ReactNode } from "react";

export type UserRole = "CLIENT" | "THERAPIST" | "COORDINATOR" | "ADMIN";

export interface UserProfile {
  id?: string;
  name?: string | null;
  full_name?: string | null;
  email?: string | null;
  role?: UserRole | string | null;
  phone?: string | null;
}

export type ProfileFormDefaults = {
  fullName: string;
  phone: string;
  bio?: string;
  specialization?: string;
  experienceYears?: number;
};

export type DashboardComponent = (props: {
  name: string;
}) => Promise<ReactNode> | ReactNode;

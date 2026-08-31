import type { ReactNode } from "react";

export type TherapistRow = {
  id: string;
  bio: string;
  specialization: string;
  experience_years: number;
  profiles: {
    full_name: string | null;
    email: string | null;
    phone?: string | null;
  } | null;
};

export type TherapistOption = {
  id: string;
  label: string;
};

export interface TherapistCardProps {
  id: string;
  name: string;
  specialization?: string | null;
  experienceYears?: number | null;
  bio?: string | null;
  email?: string | null;
  phone?: string | null;
  availableSlotsCount?: number;
  statusBadge?: ReactNode;
  actions?: ReactNode;
  className?: string;
  compact?: boolean;
}

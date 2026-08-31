import type { ElementType } from "react";
import {
  LayoutDashboard,
  Users,
  HeartHandshake,
  ShieldCheck,
  Sparkles,
  Calendar,
  CreditCard,
  User,
} from "lucide-react";
import type { NavItem } from "@/types";

export const NAV_BY_ROLE: Record<
  "COORDINATOR" | "THERAPIST" | "ADMIN",
  NavItem[]
> = {
  COORDINATOR: [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/dashboard/clients", label: "Clients" },
    { href: "/dashboard/therapists", label: "Therapists" },
    { href: "/dashboard/recommendations", label: "Recommendations" },
    { href: "/dashboard/bookings", label: "Bookings" },
  ],
  THERAPIST: [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/dashboard/bookings", label: "Bookings" },
    { href: "/dashboard/profile", label: "Profile" },
  ],
  ADMIN: [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/dashboard/clients", label: "Clients" },
    { href: "/dashboard/therapists", label: "Therapists" },
    { href: "/dashboard/coordinators", label: "Coordinators" },
    { href: "/dashboard/recommendations", label: "Recommendations" },
    { href: "/dashboard/bookings", label: "Bookings" },
    { href: "/dashboard/payments", label: "Payments" },
  ],
};

export const ROUTE_ICONS: Record<string, ElementType> = {
  "/dashboard": LayoutDashboard,
  "/dashboard/clients": Users,
  "/dashboard/therapists": HeartHandshake,
  "/dashboard/coordinators": ShieldCheck,
  "/dashboard/recommendations": Sparkles,
  "/dashboard/bookings": Calendar,
  "/dashboard/payments": CreditCard,
  "/dashboard/profile": User,
};

import type { Metadata } from "next";

import { getProfile } from "@/lib/supabase/profile";
import { Shell } from "@/components/dashboard/shell";
import type { NavItem } from "@/components/dashboard/shell-nav";
import { SignOutButton } from "@/components/sign-out-button";

export const metadata: Metadata = {
  title: "Dashboard",
};

const COORDINATOR_NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/clients", label: "Clients" },
  { href: "/dashboard/therapists", label: "Therapists" },
  { href: "/dashboard/recommendations", label: "Recommendations" },
  { href: "/dashboard/bookings", label: "Bookings" },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await getProfile();

  const role = profile.role as "CLIENT" | "COORDINATOR" | "THERAPIST" | "ADMIN";

  if (role === "CLIENT") {
    return (
      <div className="flex min-h-svh flex-col">
        <header className="flex items-center justify-between border-b px-6 py-4">
          <span className="text-lg font-semibold tracking-tight">Acme Mind</span>
          <SignOutButton />
        </header>
        <main className="flex flex-1 items-center justify-center px-6 py-12">
          {children}
        </main>
      </div>
    );
  }

  return (
    <Shell nav={COORDINATOR_NAV}>{children}</Shell>
  );
}

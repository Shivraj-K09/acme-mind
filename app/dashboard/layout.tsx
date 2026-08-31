import type { Metadata } from "next";
import { Sparkles } from "lucide-react";

import { getProfile } from "@/lib/supabase/profile";
import { Shell } from "@/components/dashboard/shell";
import { SignOutButton } from "@/components/sign-out-button";
import { NAV_BY_ROLE } from "@/constants";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile } = await getProfile();

  const role = profile.role as "CLIENT" | "COORDINATOR" | "THERAPIST" | "ADMIN";

  if (role === "CLIENT") {
    const initials = profile.full_name?.trim()
      ? profile.full_name
          .trim()
          .split(" ")
          .map((n: string) => n[0])
          .slice(0, 2)
          .join("")
          .toUpperCase()
      : user?.email
        ? user.email.slice(0, 2).toUpperCase()
        : "CL";

    const clientDisplayName =
      profile.full_name?.trim() ||
      (user?.email ? user.email.split("@")[0] : "Client");

    return (
      <div className="flex min-h-svh flex-col bg-background">
        <header className="sticky top-0 z-20 border-b bg-card/80 backdrop-blur-md shadow-xs">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8 py-3.5">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs ring-1 ring-primary/30">
                <Sparkles className="size-4.5" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold tracking-tight text-foreground">
                  Acme Mind
                </span>
                <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                  Client Portal
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2.5 rounded-xl border bg-muted/30 px-3 py-1.5">
                <div className="flex size-7 items-center justify-center rounded-lg bg-primary/15 text-xs font-bold text-primary">
                  {initials}
                </div>
                <div className="text-left text-xs">
                  <p className="font-semibold text-foreground leading-none">
                    {clientDisplayName}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {user?.email}
                  </p>
                </div>
              </div>
              <SignOutButton variant="ghost" size="sm" />
            </div>
          </div>
        </header>
        <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
          {children}
        </main>
      </div>
    );
  }

  return (
    <Shell
      nav={NAV_BY_ROLE[role]}
      user={{
        name: profile.full_name,
        role: profile.role,
        email: user?.email,
      }}
    >
      {children}
    </Shell>
  );
}

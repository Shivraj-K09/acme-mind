import Link from "next/link";
import {
  Users,
  HeartHandshake,
  ShieldCheck,
  Sparkles,
  Calendar,
  CreditCard,
  ArrowRight,
  Shield,
  CalendarRange,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export async function AdminDashboard({ name }: { name: string }) {
  const supabase = await createClient();
  const admin = createAdminClient();
  const clientToUse = admin ?? supabase;

  // Pre-fetch metric counts for admin overview
  const [
    { count: clientsCount },
    { count: therapistsCount },
    { count: coordinatorsCount },
    { count: bookingsCount },
    { count: recommendationsCount },
    { count: paymentsCount },
  ] = await Promise.all([
    clientToUse.from("clients").select("*", { count: "exact", head: true }),
    clientToUse.from("therapists").select("*", { count: "exact", head: true }),
    clientToUse
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "COORDINATOR"),
    clientToUse.from("bookings").select("*", { count: "exact", head: true }),
    clientToUse
      .from("therapist_recommendations")
      .select("*", { count: "exact", head: true }),
    clientToUse.from("payments").select("*", { count: "exact", head: true }),
  ]);

  const adminSections = [
    {
      title: "Client Directory",
      description: "Manage registered clients, profiles, and care pathways.",
      count: clientsCount ?? 0,
      label: "Registered Clients",
      href: "/dashboard/clients",
      icon: Users,
      actionText: "Manage Clients",
    },
    {
      title: "Therapists Network",
      description: "Oversee clinicians, credentials, specialties, and schedules.",
      count: therapistsCount ?? 0,
      label: "Active Therapists",
      href: "/dashboard/therapists",
      icon: HeartHandshake,
      actionText: "View Therapists",
    },
    {
      title: "Care Coordinators",
      description: "Clinical coordinators managing discovery calls and matches.",
      count: coordinatorsCount ?? 0,
      label: "Staff Coordinators",
      href: "/dashboard/coordinators",
      icon: ShieldCheck,
      actionText: "View Coordinators",
    },
    {
      title: "Care Recommendations",
      description: "Live feed of client-therapist recommendations and match statuses.",
      count: recommendationsCount ?? 0,
      label: "Total Matches",
      href: "/dashboard/recommendations",
      icon: Sparkles,
      actionText: "Review Recommendations",
    },
    {
      title: "Session Bookings",
      description: "Complete session ledger, reschedule logs, and attendance audit.",
      count: bookingsCount ?? 0,
      label: "Booked Sessions",
      href: "/dashboard/bookings",
      icon: Calendar,
      actionText: "View All Bookings",
    },
    {
      title: "Financial Ledger",
      description: "Platform payments, mock transactions, and refund tracking.",
      count: paymentsCount ?? 0,
      label: "Logged Transactions",
      href: "/dashboard/payments",
      icon: CreditCard,
      actionText: "Audit Payments",
    },
  ];

  return (
    <div className="flex w-full flex-col gap-8">
      {/* Welcome Hero Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Welcome{name ? `, ${name}` : ""}
            </h1>
            <Badge className="bg-primary/10 text-primary border-primary/20 text-xs font-semibold px-2.5 py-0.5">
              <Shield className="size-3 mr-1" /> Administrator
            </Badge>
          </div>
          <p className="mt-1.5 text-sm text-muted-foreground max-w-xl">
            System overview and platform governance. Monitor clients, clinicians, care coordination, session bookings, and payments.
          </p>
        </div>

        {/* Primary Action Buttons with Real Navigation */}
        <div className="flex flex-wrap items-center gap-3">
          <Button
            size="lg"
            nativeButton={false}
            render={<Link href="/dashboard/clients" />}
            className="rounded-xl h-10! px-4.5 font-medium shadow-xs"
          >
            <Users className="size-4 mr-1.5" /> Manage Clients
          </Button>
          <Button
            size="lg"
            variant="outline"
            nativeButton={false}
            render={<Link href="/dashboard/bookings" />}
            className="rounded-xl h-10! px-4.5 font-medium"
          >
            <CalendarRange className="size-4 mr-1.5" /> View All Bookings
          </Button>
        </div>
      </div>

      {/* Grid of Platform Management Domains */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {adminSections.map((section) => {
          const Icon = section.icon;
          return (
            <Card
              key={section.href}
              className="flex flex-col justify-between border-border/80 transition-all duration-200 hover:border-primary/40 hover:shadow-xs"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold tracking-tight text-foreground">
                      {section.count}
                    </span>
                    <p className="text-[11px] font-medium text-muted-foreground">
                      {section.label}
                    </p>
                  </div>
                </div>
                <CardTitle className="text-base font-semibold mt-3 text-foreground">
                  {section.title}
                </CardTitle>
                <CardDescription className="text-xs leading-relaxed text-muted-foreground min-h-10">
                  {section.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button
                  variant="outline"
                  nativeButton={false}
                  render={<Link href={section.href} />}
                  className="w-full justify-between rounded-xl h-10! px-4 font-medium text-sm text-foreground group"
                >
                  <span>{section.actionText}</span>
                  <ArrowRight className="size-4 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5" />
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

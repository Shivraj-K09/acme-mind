import Link from "next/link";
import {
  Users,
  HeartHandshake,
  Sparkles,
  Calendar,
  ArrowRight,
  ShieldCheck,
  UserSearch,
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

export async function CoordinatorDashboard({ name }: { name: string }) {
  const supabase = await createClient();
  const admin = createAdminClient();
  const clientToUse = admin ?? supabase;

  // Pre-fetch metric counts for coordinator workflow
  const [
    { count: clientsCount },
    { count: therapistsCount },
    { count: recommendationsCount },
    { count: bookingsCount },
  ] = await Promise.all([
    clientToUse.from("clients").select("*", { count: "exact", head: true }),
    clientToUse.from("therapists").select("*", { count: "exact", head: true }),
    clientToUse
      .from("therapist_recommendations")
      .select("*", { count: "exact", head: true }),
    clientToUse.from("bookings").select("*", { count: "exact", head: true }),
  ]);

  const coordinatorSections = [
    {
      title: "Client Roster",
      description:
        "Search clients, review history, and register new intake profiles.",
      count: clientsCount ?? 0,
      label: "Total Clients",
      href: "/dashboard/clients",
      icon: Users,
      actionText: "Manage Clients",
    },
    {
      title: "Clinical Specialists",
      description:
        "Explore therapists, review clinical focus areas, and view bios.",
      count: therapistsCount ?? 0,
      label: "Available Therapists",
      href: "/dashboard/therapists",
      icon: HeartHandshake,
      actionText: "Browse Therapists",
    },
    {
      title: "Match Feed",
      description:
        "Monitor client responses, acceptances, and matching pipeline.",
      count: recommendationsCount ?? 0,
      label: "Total Matches",
      href: "/dashboard/recommendations",
      icon: Sparkles,
      actionText: "View Match Pipeline",
    },
    {
      title: "Scheduled Sessions",
      description:
        "Keep track of active client bookings, dates, and session statuses.",
      count: bookingsCount ?? 0,
      label: "Booked Sessions",
      href: "/dashboard/bookings",
      icon: Calendar,
      actionText: "View Bookings",
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
              <ShieldCheck className="size-3 mr-1" /> Care Coordinator
            </Badge>
          </div>
          <p className="mt-1.5 text-sm text-muted-foreground max-w-xl">
            Intake coordination and therapist matching center. Search clients,
            understand care requirements, and recommend suitable therapists.
          </p>
        </div>

        {/* Primary Action Buttons with Real Navigation */}
        <div className="flex flex-wrap items-center gap-3">
          <Button
            size="lg"
            nativeButton={false}
            render={<Link href="/dashboard/clients" />}
            className="rounded-xl h-10 px-4.5 font-medium shadow-xs"
          >
            <UserSearch className="size-4 mr-1.5" /> Find / Add Client
          </Button>
          <Button
            size="lg"
            variant="outline"
            nativeButton={false}
            render={<Link href="/dashboard/recommendations" />}
            className="rounded-xl h-10 px-4.5 font-medium"
          >
            <Sparkles className="size-4 mr-1.5" /> View Matches
          </Button>
        </div>
      </div>

      {/* Grid of Coordinator Workflow Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {coordinatorSections.map((section) => {
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
                <CardDescription className="text-xs leading-relaxed text-muted-foreground">
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

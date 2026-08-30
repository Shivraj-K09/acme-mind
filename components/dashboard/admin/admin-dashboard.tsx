import { ShieldCheck, CalendarRange } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function AdminDashboard({ name }: { name: string }) {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">Welcome{name ? `, ${name}` : ""}</CardTitle>
        <CardDescription>System overview</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <p className="text-sm leading-relaxed text-muted-foreground">
          Full visibility across clients, therapists, coordinators, bookings,
          and payments — manage the platform from here.
        </p>
        <div className="flex flex-col gap-3">
          <Button size="lg" className="h-11 w-full rounded-xl">
            <ShieldCheck data-icon="inline-start" /> Manage Users
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-11 w-full rounded-xl"
          >
            <CalendarRange data-icon="inline-start" /> View All Bookings
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

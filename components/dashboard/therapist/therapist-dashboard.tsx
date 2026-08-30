import { CalendarPlus, CalendarCheck } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function TherapistDashboard({ name }: { name: string }) {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">Welcome{name ? `, ${name}` : ""}</CardTitle>
        <CardDescription>Manage your practice</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <p className="text-sm leading-relaxed text-muted-foreground">
          Add your availability so clients can book sessions with you, and keep
          track of your upcoming sessions.
        </p>
        <div className="flex flex-col gap-3">
          <Button size="lg" className="h-11 w-full rounded-xl">
            <CalendarPlus data-icon="inline-start" /> Add Availability
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-11 w-full rounded-xl"
          >
            <CalendarCheck data-icon="inline-start" /> View Bookings
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

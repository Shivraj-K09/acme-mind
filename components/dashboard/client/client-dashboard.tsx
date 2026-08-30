import { LifeBuoy } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function ClientDashboard({ name }: { name: string }) {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">Welcome{name ? `, ${name}` : ""}</CardTitle>
        <CardDescription>Looking for the right therapist?</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <p className="text-sm leading-relaxed text-muted-foreground">
          Connect with our care coordinator to discuss your needs and get
          matched with the therapist that fits you best.
        </p>
        <Button size="lg" className="h-11 w-full rounded-xl">
          <LifeBuoy data-icon="inline-start" /> Contact Coordinator
        </Button>
      </CardContent>
    </Card>
  )
}

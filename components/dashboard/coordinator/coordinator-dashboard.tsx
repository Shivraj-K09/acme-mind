import { UserSearch, HeartHandshake } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function CoordinatorDashboard({ name }: { name: string }) {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">Welcome{name ? `, ${name}` : ""}</CardTitle>
        <CardDescription>Coordinator hub</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <p className="text-sm leading-relaxed text-muted-foreground">
          Find clients, understand their needs, and match them with the right
          therapist from your network.
        </p>
        <div className="flex flex-col gap-3">
          <Button size="lg" className="h-11 w-full rounded-xl">
            <UserSearch data-icon="inline-start" /> Find a Client
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-11 w-full rounded-xl"
          >
            <HeartHandshake data-icon="inline-start" /> Recommend Therapist
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

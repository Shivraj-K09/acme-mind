import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { LifeBuoy } from "lucide-react"

import { createClient } from "@/lib/supabase/server"
import { SignOutButton } from "@/components/sign-out-button"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Dashboard",
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data } = await supabase.auth.getUser()

  if (!data.user) {
    redirect("/login")
  }

  const fullName = data.user.user_metadata.full_name as string | undefined

  return (
    <div className="flex min-h-svh flex-col">
      <header className="flex items-center justify-between border-b px-6 py-4">
        <span className="text-lg font-semibold tracking-tight">Acme Mind</span>
        <SignOutButton />
      </header>
      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">
              Welcome{fullName ? `, ${fullName}` : ""}
            </CardTitle>
            <CardDescription>
              Looking for the right therapist?
            </CardDescription>
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
      </main>
    </div>
  )
}

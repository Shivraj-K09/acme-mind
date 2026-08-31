import { cache } from "react"
import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"

export const getProfile = cache(async () => {
  const supabase = await createClient()

  const { data } = await supabase.auth.getUser()

  if (!data.user) {
    redirect("/login")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role, phone")
    .eq("id", data.user.id)
    .maybeSingle()

  if (!profile) {
    redirect("/login")
  }

  return { user: data.user, profile }
})

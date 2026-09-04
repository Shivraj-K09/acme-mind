import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { cache } from "react";

export const getProfile = cache(async () => {
  // cache used to make sure the query only runs once per page load
  const supabase = await createClient();

  const { data } = await supabase.auth.getUser(); // contacts the supabase auth to confirm the user is real and not banned.

  if (!data.user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role, phone")
    .eq("id", data.user.id)
    .maybeSingle();

  if (!profile) {
    redirect("/login");
  }

  return { user: data.user, profile };
});

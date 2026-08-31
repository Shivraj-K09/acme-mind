"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Supabase returns the same "invalid credentials" error for unknown emails
 * and wrong passwords (to prevent account enumeration). This lets the login
 * form tell the user which one is actually wrong.
 */
export async function checkEmailExists(email: string): Promise<boolean> {
  const supabase = createAdminClient();

  if (!supabase) {
    throw new Error("Could not verify the account. Please try again.");
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", email.trim().toLowerCase())
    .maybeSingle();

  if (error) {
    throw new Error("Could not verify the account. Please try again.");
  }

  return Boolean(data);
}

/**
 * Signs the user out on the server (clearing auth cookies) and redirects to
 * the login page in one atomic step.
 */
export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

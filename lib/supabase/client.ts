import { createBrowserClient } from "@supabase/ssr";

/**
 * remember = false keeps the session cookie alive for one day only, so the
 * user is signed out sooner. remember = true (default) uses the standard
 * persistent session.
 */
export function createClient(remember = true) {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: {
        maxAge: remember ? undefined : 86400,
      },
    },
  );
}

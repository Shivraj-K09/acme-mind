import Link from "next/link";

import { createClient } from "@/lib/supabase/server";
import { CreateClientDialog } from "@/components/dashboard/coordinator/create-client-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { ClientRow } from "@/types";

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;
  const searchTerm = email?.trim() ?? "";

  const supabase = await createClient();

  let query = supabase
    .from("clients")
    .select("id, profile_id, created_at, profiles!inner(full_name, email)")
    .eq("profiles.role", "CLIENT")
    .order("created_at", { ascending: false });

  if (searchTerm) {
    query = query.ilike("profiles.email", `%${searchTerm}%`);
  }

  const { data } = await query;
  const clients = (data ?? []) as unknown as ClientRow[];

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between space-y-0">
          <div className="flex flex-col gap-1.5">
            <CardTitle>Clients</CardTitle>
            <CardDescription>
              Search clients by email and open their profile.
            </CardDescription>
          </div>
          <CreateClientDialog />
        </CardHeader>
        <CardContent>
          <form action="/dashboard/clients" className="flex gap-3">
            <Input
              name="email"
              type="email"
              placeholder="Search by email..."
              defaultValue={searchTerm}
              className="h-11 rounded-xl bg-muted/50"
            />
            <Button type="submit" size="lg" className="h-11 rounded-xl">
              Search
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {searchTerm ? `Results for "${searchTerm}"` : "All clients"}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {clients && clients.length > 0 ? (
            clients.map((client: ClientRow) => (
              <div
                key={client.id}
                className="flex items-center justify-between rounded-xl border px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {client.profiles?.full_name ?? "Unnamed client"}
                  </p>
                  <p className="truncate text-sm text-muted-foreground">
                    {client.profiles?.email ?? "-"}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-4">
                  <span className="hidden text-sm text-muted-foreground sm:block">
                    Joined{" "}
                    {new Date(client.created_at).toLocaleDateString("en-US", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    nativeButton={false}
                    render={
                      <Link href={`/dashboard/clients/${client.profile_id}`} />
                    }
                  >
                    Open
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <p className="py-6 text-center text-sm text-muted-foreground">
              {searchTerm
                ? "No clients found with that email."
                : "No clients yet. Created clients will appear here."}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

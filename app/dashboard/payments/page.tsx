import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, ArrowRight } from "lucide-react";
import type { PaymentStatus, PaymentRow } from "@/types";

const PAYMENT_BADGES: Record<PaymentStatus, string> = {
  PENDING: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  PAID: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  REFUNDED: "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300",
  FAILED: "bg-destructive/10 text-destructive",
};

function getPersonName(
  profile?: { full_name?: string | null; email?: string | null } | null,
  fallback = "Member"
): string {
  if (profile?.full_name && profile.full_name.trim().length > 0) {
    return profile.full_name.trim();
  }
  if (profile?.email && profile.email.trim().length > 0) {
    const username = profile.email.split("@")[0];
    return username.charAt(0).toUpperCase() + username.slice(1);
  }
  return fallback;
}

export default async function PaymentsPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("payments")
    .select(
      "id, amount, currency, status, provider, refunded_at, bookings(client_id, therapist_id, clients(id, profile_id, profiles(full_name, email)), therapists(id, profile_id, profiles(full_name, email)))"
    )
    .order("created_at", { ascending: false });

  const rawPayments = (data ?? []) as unknown as PaymentRow[];

  const clientIds = Array.from(
    new Set(rawPayments.map((p) => p.bookings?.client_id).filter((id): id is string => Boolean(id)))
  );
  const therapistIds = Array.from(
    new Set(rawPayments.map((p) => p.bookings?.therapist_id).filter((id): id is string => Boolean(id)))
  );

  const profilesMap = new Map<
    string,
    { full_name: string | null; email: string | null }
  >();

  const admin = createAdminClient();
  const clientToUse = admin ?? supabase;

  if (clientIds.length > 0) {
    const { data: clientRows } = await clientToUse
      .from("clients")
      .select("id, profile_id, profiles(full_name, email)")
      .in("id", clientIds);

    clientRows?.forEach((c: { id: string; profile_id?: string; profiles?: { full_name: string | null; email: string | null } | { full_name: string | null; email: string | null }[] | null }) => {
      const prof = Array.isArray(c.profiles) ? c.profiles[0] : c.profiles;
      if (prof) {
        profilesMap.set(c.id, prof);
        if (c.profile_id) profilesMap.set(c.profile_id, prof);
      }
    });
  }

  if (therapistIds.length > 0) {
    const { data: therapistRows } = await clientToUse
      .from("therapists")
      .select("id, profile_id, profiles(full_name, email)")
      .in("id", therapistIds);

    therapistRows?.forEach((t: { id: string; profile_id?: string; profiles?: { full_name: string | null; email: string | null } | { full_name: string | null; email: string | null }[] | null }) => {
      const prof = Array.isArray(t.profiles) ? t.profiles[0] : t.profiles;
      if (prof) {
        profilesMap.set(t.id, prof);
        if (t.profile_id) profilesMap.set(t.profile_id, prof);
      }
    });
  }

  const payments = rawPayments.map((payment) => {
    const clientProfile =
      payment.bookings?.clients?.profiles ||
      (payment.bookings?.client_id
        ? profilesMap.get(payment.bookings.client_id)
        : null) ||
      (payment.bookings?.clients?.profile_id
        ? profilesMap.get(payment.bookings.clients.profile_id)
        : null);
    const therapistProfile =
      payment.bookings?.therapists?.profiles ||
      (payment.bookings?.therapist_id
        ? profilesMap.get(payment.bookings.therapist_id)
        : null) ||
      (payment.bookings?.therapists?.profile_id
        ? profilesMap.get(payment.bookings.therapists.profile_id)
        : null);

    return {
      ...payment,
      clientName: getPersonName(clientProfile, "Client"),
      therapistName: getPersonName(therapistProfile, "Therapist"),
    };
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Payments
            </h1>
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
              {payments.length} Transactions
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            All session payments and transaction logs across the platform.
          </p>
        </div>
      </div>

      <Card className="shadow-xs border-border/80">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Transaction History</CardTitle>
          <CardDescription>
            Live view of processed, pending, and refunded session charges.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {payments.length > 0 ? (
            payments.map((payment) => (
              <div
                key={payment.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-border/80 bg-card p-4 transition-all hover:border-primary/40 hover:bg-muted/20"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <CreditCard className="size-5" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm text-foreground">
                        {payment.clientName}
                      </span>
                      <ArrowRight className="size-3 text-muted-foreground" />
                      <span className="font-semibold text-sm text-primary">
                        {payment.therapistName}
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground mt-0.5">
                      {payment.provider}
                      {payment.refunded_at
                        ? ` • Refunded ${new Date(payment.refunded_at).toLocaleDateString("en-US", { day: "numeric", month: "short" })}`
                        : ""}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:self-center">
                  <span className="text-base font-bold text-foreground">
                    {payment.amount.toFixed(2)} {payment.currency}
                  </span>
                  <Badge
                    className={`shrink-0 ${PAYMENT_BADGES[payment.status] ?? ""}`}
                  >
                    {payment.status}
                  </Badge>
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground mx-auto mb-3">
                <CreditCard className="size-6" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">No payments yet</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Completed transactions will appear here once clients pay for bookings.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

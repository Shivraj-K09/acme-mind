import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type PaymentStatus = "PENDING" | "PAID" | "REFUNDED" | "FAILED";

type PaymentRow = {
  id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  provider: string;
  refunded_at: string | null;
  bookings: {
    clients: {
      profiles: {
        full_name: string;
      } | null;
    } | null;
    therapists: {
      profiles: {
        full_name: string;
      } | null;
    } | null;
  } | null;
};

const PAYMENT_BADGES: Record<PaymentStatus, string> = {
  PENDING: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  PAID: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  REFUNDED: "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300",
  FAILED: "bg-destructive/10 text-destructive",
};

export default async function PaymentsPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("payments")
    .select(
      "id, amount, currency, status, provider, refunded_at, bookings(clients(profiles(full_name)), therapists(profiles(full_name)))"
    )
    .order("created_at", { ascending: false });

  const payments = (data ?? []) as unknown as PaymentRow[];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payments</CardTitle>
        <CardDescription>
          All session payments across the platform.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {payments.length > 0 ? (
          payments.map((payment) => (
            <div
              key={payment.id}
              className="flex items-center justify-between rounded-xl border px-4 py-3"
            >
              <div>
                <p className="text-sm font-medium">
                  {payment.bookings?.clients?.profiles?.full_name ??
                    "Unknown client"}{" "}
                    {"->"}
                  {payment.bookings?.therapists?.profiles?.full_name ??
                    "Unknown therapist"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {payment.provider}
                  {payment.refunded_at
                    ? ` - refunded ${new Date(payment.refunded_at).toLocaleDateString("en-US", { day: "numeric", month: "short" })}`
                    : ""}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold">
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
          <p className="py-6 text-center text-sm text-muted-foreground">
            No payments yet.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

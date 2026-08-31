export type PaymentStatus = "PENDING" | "PAID" | "REFUNDED" | "FAILED";

export type PaymentRow = {
  id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  provider: string;
  refunded_at: string | null;
  clientName?: string;
  therapistName?: string;
  bookings: {
    client_id?: string;
    therapist_id?: string;
    clients?: {
      id?: string;
      profile_id?: string;
      profiles?: {
        full_name: string | null;
        email: string | null;
      } | null;
    } | null;
    therapists?: {
      id?: string;
      profile_id?: string;
      profiles?: {
        full_name: string | null;
        email: string | null;
      } | null;
    } | null;
  } | null;
};

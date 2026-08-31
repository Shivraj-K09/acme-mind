export type BookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "RESCHEDULED"
  | "CANCELLED"
  | "COMPLETED"
  | "NO_SHOW";

export type BookingRow = {
  id: string;
  status: BookingStatus;
  scheduled_start: string;
  client_id?: string;
  therapist_id: string;
  clientName?: string;
  therapistName?: string;
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
};

export type ClientBookingRow = {
  id: string;
  status: BookingStatus;
  scheduled_start: string;
  therapist_id: string;
  therapistName?: string;
  therapists?: {
    id?: string;
    profile_id?: string;
    profiles?: {
      full_name: string | null;
      email: string | null;
    } | null;
  } | null;
};

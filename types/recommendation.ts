export type RecommendationStatus = "PENDING" | "ACCEPTED" | "REJECTED";

export type RecommendationRow = {
  id: string;
  client_id?: string;
  therapist_id: string;
  status: RecommendationStatus;
  created_at: string;
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
    bio?: string;
    specialization?: string;
    experience_years?: number;
    profiles?: {
      full_name: string | null;
      email?: string | null;
    } | null;
  } | null;
};

export type FormattedRecommendation = RecommendationRow & {
  therapistName: string;
  availableSlots: Array<{ id: string; label: string }>;
};

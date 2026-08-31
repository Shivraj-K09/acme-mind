export type ClientRow = {
  id: string;
  profile_id: string;
  created_at: string;
  profiles: {
    full_name: string | null;
    email: string | null;
    phone?: string | null;
  } | null;
};

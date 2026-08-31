# Acme Mind

Therapy session booking platform — clients are matched with therapists by a
care coordinator, book sessions from therapist availability, and pay online.

Built with Next.js (App Router), TypeScript, Tailwind CSS v4, shadcn/ui
(base-nova), and Supabase (Auth + Postgres + RLS).

## Roles

| Role        | What they do                                                             |
| ----------- | ------------------------------------------------------------------------ |
| CLIENT      | Sees recommended therapists, accepts a match, books slots, pays          |
| THERAPIST   | Manages profile + availability, sees their bookings                      |
| COORDINATOR | Searches/creates clients, recommends therapists, follows bookings        |
| ADMIN       | System-wide management: coordinators, payments, mark COMPLETED / NO_SHOW |

## Environment

Create a `.env` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Database

The database schema is managed privately and is not part of this repository.
The app expects a Supabase project with the following tables, all with Row
Level Security enabled:

- `profiles` — every user (CLIENT / THERAPIST / COORDINATOR / ADMIN)
- `clients` — client records
- `therapists` — therapist profiles (bio, specialization, experience)
- `therapist_recommendations` — coordinator matching (PENDING / ACCEPTED / REJECTED)
- `availability_slots` — therapist bookable time slots
- `bookings` — sessions (PENDING → CONFIRMED → COMPLETED, with cancellation tracking)
- `booking_events` — booking audit history
- `payments` — session payments and refunds

New signups automatically receive a CLIENT profile. Roles are promoted from
the Supabase dashboard (`profiles.role`).

## Setup

1. `bun install`
2. Create the tables and Row Level Security policies in your Supabase project
   (see the Database section above).
3. Under **Authentication → Emails**, set up SMTP (e.g. a Gmail app password)
   so invite emails can be sent, and update the **Invite user** template link
   to:

```
{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=invite&next=/set-password
```

## Run

```bash
bun run dev
```

Open http://localhost:3000 — you will be redirected to `/login`.

## Flow

1. The **coordinator** creates client accounts (an invite email is sent — the
   client sets their own password) and recommends therapist(s) for each
   client.
2. The **client** logs in, sees their recommended therapists, and accepts a
   match.
3. The **therapist** adds availability slots from their dashboard.
4. The **client** opens the accepted therapist's slots, selects a time, and
   books the session.
5. The client pays **$50** (mock payment — recorded in the `payments` table
   and ready to swap for a real gateway like Stripe) and the booking becomes
   **CONFIRMED**.
6. Sessions can be rescheduled or cancelled with a reason — cancellations 24+
   hours before the session receive a full refund.
7. The **admin** oversees everything from the dashboard and can mark sessions
   COMPLETED or NO_SHOW.

## Notes

- Time-slot safety (no double-booking) is enforced at the database level:
  partial unique index + row-locking triggers.
- The therapist recommendation acceptance is RLS-enforced: clients can only
  change the status of their own recommendations.
- The client can only book with therapists ACCEPTED for them — enforced by
  database triggers.

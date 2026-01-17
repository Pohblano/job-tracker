# Shop Visibility Board (SVB)

A TV-first, real-time visibility dashboard for shop-floor production status.

> **SVB is a visibility layer — not an ERP, not a scheduler.**  
> It answers: *What is the shop working on, and how far along is each job?*

---

## Docs (Start Here)

- **PRD**: `PRD.md`
- **TV UI Guidelines**: `docs/tv-ui-guidelines.md`
- **Admin UI Flow**: `docs/admin-ui-flow.md`
- **Wireframes**: `docs/wireframes.md`
- **User Journeys**: `docs/user-journeys.md`

---

## Tech Stack

- Next.js (App Router)
- Tailwind CSS
- shadcn/ui
- Supabase (Postgres, Auth, Realtime)
- Vercel (hosting)

---

## Core Routes

- `/tv` → public, read-only TV display
- `/admin` → authenticated admin interface (create/update jobs)

---

## Data Model (Jobs)

Each job tracks:
- Part number
- Job number (V-number)
- Total pieces
- Pieces completed
- Status: RECEIVED → QUOTED → IN_PROGRESS → COMPLETED
- ETA text
- Date received

---

## Supabase Setup

### 1) Create schema
Run:

- `supabase/schema.sql`

### 2) Enable RLS + policies
Run:

- `supabase/rls-policies.sql`

### 3) Realtime
Enable Realtime replication for `public.jobs` in Supabase dashboard.

---

## Environment Variables

Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
# Optional for server-side auth/admin actions:
SUPABASE_SERVICE_ROLE_KEY=...
```

---

## Development

```bash
npm install
npm run dev
```

Open:
- http://localhost:3000/tv
- http://localhost:3000/admin

---

## Design Rules (TV)

- Large type
- High contrast
- No modals/buttons/tooltips
- No auth UI
- No hover-only behavior

See: `docs/tv-ui-guidelines.md`

---

## License

TBD

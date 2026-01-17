# Next.js Folder & Routing Structure
## Shop Visibility Board (SVB)

Target stack: Next.js (App Router), Tailwind, shadcn/ui, Supabase.

---

## Recommended Structure

```txt
repo-root/
├── PRD.md
├── README.md
├── docs/
│   ├── tv-ui-guidelines.md
│   ├── admin-ui-flow.md
│   ├── wireframes.md
│   └── user-journeys.md
├── supabase/
│   ├── schema.sql
│   └── rls-policies.sql
├── app/
│   ├── layout.tsx
│   ├── globals.css
│   ├── page.tsx                 # optional redirect → /tv
│   ├── tv/
│   │   └── page.tsx             # public, read-only TV display
│   ├── admin/
│   │   ├── layout.tsx           # admin shell (nav, auth gate)
│   │   ├── page.tsx             # admin job list
│   │   └── jobs/
│   │       └── [id]/
│   │           └── page.tsx     # edit job screen (or modal route)
│   ├── api/
│   │   └── health/
│   │       └── route.ts         # uptime/health for TV monitoring
│   └── auth/
│       └── callback/
│           └── route.ts         # if using OAuth; otherwise omit
├── components/
│   ├── tv/
│   │   ├── JobsTable.tsx
│   │   ├── JobRow.tsx
│   │   ├── StatusPill.tsx
│   │   ├── ProgressBar.tsx
│   │   └── LastUpdated.tsx
│   ├── admin/
│   │   ├── JobsAdminTable.tsx
│   │   ├── JobForm.tsx
│   │   ├── UpdateProgressInline.tsx
│   │   └── ConfirmDialog.tsx
│   └── ui/                      # shadcn generated components
├── lib/
│   ├── supabase/
│   │   ├── client.ts            # browser client
│   │   └── server.ts            # server client (cookies)
│   ├── jobs/
│   │   ├── queries.ts           # select queries
│   │   ├── mutations.ts         # create/update
│   │   └── validators.ts        # zod schemas
│   └── utils.ts
└── middleware.ts                # optional: protect /admin routes
```

---

## Routing Rules

### `/tv` (Public)
- No auth
- Read-only jobs feed
- Big typography, no scroll if possible
- Realtime subscription (Supabase) or polling fallback

### `/admin` (Protected)
- Requires authenticated session
- CRUD-lite: create job, update status, update progress, edit timeline
- Minimal UI, fast updates (<30 sec)

---

## Data Fetching Strategy

- TV view: server fetch initial data + client realtime subscription
- Admin view: server fetch + server actions (or client mutations) for updates
- Ensure optimistic UI for “pieces completed” updates

---

## Reliability Hooks

- `LastUpdated` timestamp visible on TV
- `/api/health` returns `{ ok: true, time: ... }` for simple monitoring

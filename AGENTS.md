# agents.md
## Codex Engineering Guide — Shop Visibility Board (SVB)

This document defines **how Codex (and humans)** should build the Shop Visibility Board.
It is a **behavioral contract** for code quality, structure, and decision-making.

Codex must treat this file as authoritative.

---

## 1. Core Principles

### 1.1 Visibility > Complexity
- Favor clarity over cleverness
- Avoid over-engineering
- Prefer readable, explicit code over abstractions

### 1.2 TV-First Mentality
- The `/tv` route is the primary product
- Performance, stability, and readability take priority over features
- Assume the app runs **unattended for weeks**

### 1.3 Deterministic Behavior
- No hidden state
- No magic side effects
- Every UI state should map directly to backend data

---

## 2. Technology Rules (Non-Negotiable)

### Frontend
- **Next.js (App Router only)**
- **Tailwind CSS** for styling
- **shadcn/ui** as the primary component library
- React Server Components where appropriate
- Client components only when required (realtime, forms)

### Backend / Data
- **Supabase Postgres** as system of record
- Supabase Realtime for live updates
- RLS enforced for access control

### Styling Rules
- No inline styles
- No CSS modules unless unavoidable
- Tailwind utility classes preferred
- shadcn components may be extended with Tailwind classes

---

## 3. Directory Structure Rules

Codex must respect and extend this structure:

```txt
app/
├── tv/              # public, read-only display
├── admin/           # authenticated admin UI
components/
├── tv/              # TV-specific components
├── admin/           # Admin-only components
├── ui/              # shadcn-generated components
lib/
├── supabase/        # client + server helpers
├── jobs/            # queries, mutations, validators
```

Rules:
- No mixing TV and Admin components
- Shared logic lives in `lib/`
- UI components never query Supabase directly

---

## 4. Naming Conventions

### Files
- kebab-case for directories
- PascalCase for React components
- `.tsx` for components, `.ts` for logic

### Components
- `JobsTable.tsx`
- `JobRow.tsx`
- `ProgressBar.tsx`
- `StatusPill.tsx`

### Functions
- Verbs first: `fetchJobs`, `updateJobStatus`
- No ambiguous names (`handleThing`, `doStuff`)

### Database
- snake_case column names
- enum values in SCREAMING_SNAKE_CASE

---

## 5. Commenting Standards

### Required Comments
- Every file must have a header comment explaining purpose
- Complex logic must include inline comments
- Business rules must be commented (why, not just what)

Example:

```ts
// We sort In Progress jobs first to ensure the TV
// always highlights active production work.
```

### Prohibited Comments
- Restating obvious code
- TODOs without context

---

## 6. Data Flow Rules

### TV View
- Server-render initial job list
- Client subscribes to Supabase Realtime
- UI updates must be idempotent
- Always show last-updated timestamp

### Admin View
- Mutations go through validated functions
- Optimistic UI updates preferred
- Errors must surface clearly

---

## 7. Validation & Safety

- Use Zod for input validation
- Never trust client input
- Enforce constraints at:
  - UI level
  - API / server action level
  - Database level

Example rules:
- `pieces_completed <= total_pieces`
- Status transitions must be linear

---

## 8. Animations & Motion

### Philosophy
- Motion is used to **communicate state change**, not decorate

### Allowed Animations
- Progress bar fill transitions
- Row highlight on update
- Subtle fade-in for new jobs

### Implementation
- Prefer CSS transitions for simple effects.
- Use `framer-motion` for non-scroll UI animations when coordinating enter/exit states or when animation logic is complex.
- Use `gsap` only for scroll-linked animations (e.g., scroll-triggered reveals) and keep timelines minimal; avoid scroll hijacking.
- Do not mix `framer-motion` and `gsap` for the same effect; pick one per interaction.
- Animations must never block rendering.

---

## 9. Performance Rules

- No polling faster than 30s unless realtime is unavailable
- Avoid unnecessary re-renders
- Memoize rows where helpful
- Keep TV view bundle minimal

---

## 10. Error Handling

### TV View
- Never show raw errors
- Display last known good state
- Show small status indicator if realtime disconnects

### Admin View
- Inline error messages
- Toasts for success/failure
- No silent failures

---

## 11. Accessibility (Baseline)

- Sufficient color contrast
- Status always includes text (not color-only)
- Keyboard navigation for admin UI

---

## 12. What Codex Must NOT Do

- Introduce Redux or global state libraries
- Add unnecessary dependencies
- Build features outside the PRD
- Alter TV UI rules
- Mix admin logic into TV components

---

## 13. Definition of “Done”

A feature is complete when:
- It matches the PRD
- It respects TV UI guidelines
- Code is readable and commented
- Edge cases are handled
- No unused code remains

---

## 14. Final Instruction to Codex

If a decision is unclear:
1. Re-read `PRD.md`
2. Re-read `docs/tv-ui-guidelines.md`
3. Choose the **simplest** correct solution

If still unclear, **stop and ask** instead of guessing.


---

## 15. Supporting Documents (Mandatory Reading for Codex)

Codex must consult the following files when implementing features:

- `supabase/seed.sql` — canonical development seed data
- `docs/realtime-strategy.md` — required realtime subscription patterns
- `docs/animation-guidelines.md` — motion and animation constraints
- `docs/design/` — primary design references for all TV/admin UI work; align implementations with:
  - `docs/design/Quick_Reference_Guide.md` — at-a-glance design decisions, typography, palette
  - `docs/design/TV_Display_Mockups.md` — TV layouts, sizing, and readability requirements
  - `docs/design/Admin_UI_Mockups.md` — admin workflows, layout, and interaction patterns
  - `docs/design/Component_Specifications.md` — canonical component variants and dimensions
  - `docs/design/Edge_Cases_and_Responsive_Behavior.md` — edge-case handling and responsive rules
  - `docs/design/SVB_Visual_Mockups.md` — consolidated mockups across TV and admin surfaces

These documents are extensions of this contract.

---

## 16. Commits & Pull Requests

- Commits must be small, cohesive, and in the imperative mood (`Add TV status indicator`), with clear context on why the change matters.
- Never amend or reorder user commits; only add new commits that reflect your changes.
- Include evidence of validation in commit messages when relevant (e.g., `Tests: pnpm test`, `Verified on /tv route`).
- Pull requests must summarize the problem, the solution, and risk areas; list testing performed; and call out TV-impacting behavior explicitly.
- Keep PR diffs scoped to the task—no drive-by refactors or dependency bumps without prior need.
- If screenshots or recordings clarify TV/admin changes, include them in the PR description.

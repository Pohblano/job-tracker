# Realtime Strategy
## Shop Visibility Board (SVB)

This document defines how realtime updates must be implemented safely and predictably.

---

## Goals

- TV display reflects updates within seconds
- No flicker, no full re-renders
- Graceful degradation if realtime disconnects

---

## Primary Strategy (Preferred)

### Supabase Realtime Subscriptions

- Subscribe to `public.jobs`
- Listen for:
  - INSERT
  - UPDATE
  - DELETE (optional; completed jobs may be hidden instead)

Example (conceptual):

```ts
supabase
  .channel('jobs-realtime')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'jobs' },
    handleJobChange
  )
  .subscribe()
```

---

## Data Handling Rules

- Server renders initial state
- Client applies incremental updates
- Never refetch entire table on each event
- Updates must be idempotent

---

## Sorting Discipline

After any realtime update:
1. Re-apply deterministic sort:
   - IN_PROGRESS
   - QUOTED
   - RECEIVED
   - COMPLETED
2. Preserve row order stability where possible

---

## Failure Handling

If realtime disconnects:
- Display last known data
- Show subtle status indicator: “Live updates paused”
- Fall back to polling every 60 seconds

---

## What Not To Do

- Do not open multiple channels
- Do not poll faster than 30 seconds
- Do not block UI on subscription status

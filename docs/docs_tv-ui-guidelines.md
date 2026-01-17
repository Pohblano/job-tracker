# TV UI Guidelines
## Shop Visibility Board (SVB)

This document defines strict UI rules for the **TV-facing dashboard** displayed on the shop floor.

---

## Design Principles

- Visibility over density
- Passive, glanceable consumption
- Zero interaction required
- High contrast, large typography

---

## Screen Layout (1080p Baseline)

```
┌──────────────────────────────────────────────┐
│ SHOP VISIBILITY BOARD            [Time/Date] │
├──────────────────────────────────────────────┤
│ Job # | Part # | Status | Progress | Timeline│
├──────────────────────────────────────────────┤
│ V-001 | P-7782 | IN PROG| ███████░ | 3 days   │
│ V-002 | P-5521 | QUOTED | ░░░░░░░░ | 1 week   │
│ V-003 | P-8839 | RECEIV | ░░░░░░░░ | —        │
└──────────────────────────────────────────────┘
```

---

## Typography

- Font: Sans-serif (Inter recommended)
- Header: 40–48px
- Column labels: 22–26px
- Row text: 26–32px
- Status text: Uppercase + bold

---

## Status Colors

| Status | Color |
|------|------|
| Received | Grey |
| Quoted | Blue |
| In Progress | Green |
| Completed | Muted |

---

## Progress Bar

- Height: 16–20px
- Rounded corners
- Always visible
- Logic: pieces_completed / total_pieces

---

## Refresh Strategy

- Supabase Realtime preferred
- Fallback: auto-refresh every 30–60 seconds
- Show last updated timestamp on failure

---

## Prohibited Elements

- Buttons
- Forms
- Modals
- Tooltips
- Authentication UI

This screen is strictly read-only.

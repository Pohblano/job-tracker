# Admin UI Flow
## Shop Visibility Board (SVB)

This document defines the **admin-only workflow** for managing jobs.

---

## Access

- Authenticated users only
- Roles enforced via Supabase RLS
- Editors: David, Joe (initial MVP)

---

## Primary Screens

### 1. Job List (Admin View)

- Table of all jobs
- Status filter (optional)
- Quick edit access

Actions:
- Create Job
- Edit Job
- Update Progress

---

### 2. Create Job Flow

Form Fields:
- Job Number (V-number)
- Part Number
- Total Pieces
- Date Received
- Initial Status = Received

Submit creates job immediately.

---

### 3. Update Job Flow

Editable fields:
- Status
- Pieces Completed
- Estimated Timeline
- Notes

Rules:
- Pieces Completed ≤ Total Pieces
- Status progression is linear

---

## UX Constraints

- < 30 seconds per update
- Keyboard-friendly
- No multi-step wizards

---

## Error Handling

- Inline validation
- Prevent invalid progress updates
- No destructive actions without confirmation

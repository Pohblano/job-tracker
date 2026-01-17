# Component Map (shadcn/ui)
## Shop Visibility Board (SVB)

This doc maps your UI needs to shadcn/ui primitives and custom components.

---

## TV View Components

### Layout
- `Card` (optional) for header container
- `Separator` for header/table separation

### Data Display
- **Table**: `Table`, `TableHeader`, `TableRow`, `TableCell`
- **Status pill**: `Badge` (custom variants)
- **Progress**: `Progress` (shadcn) OR custom `<div>` bar for thicker TV sizing
- **Timestamp**: simple text component (custom `LastUpdated`)

### Suggested Custom Components
- `components/tv/JobsTable.tsx`
- `components/tv/JobRow.tsx`
- `components/tv/StatusPill.tsx`
- `components/tv/ProgressBar.tsx`
- `components/tv/LastUpdated.tsx`

---

## Admin View Components

### Forms
- `Form` (react-hook-form integration if you choose), or simple controlled inputs
- `Input`
- `Textarea`
- `Select` (status dropdown)
- `Label`

### Actions
- `Button`
- `Dialog` (Create Job modal)
- `AlertDialog` (Confirm destructive actions)
- `Toast` (feedback: saved, error)

### Data Display
- `Table` for job list
- Inline edit component for pieces completed

### Suggested Custom Components
- `components/admin/JobsAdminTable.tsx`
- `components/admin/JobForm.tsx`
- `components/admin/UpdateProgressInline.tsx`
- `components/admin/ConfirmDialog.tsx`

---

## Required shadcn/ui Additions (Likely)

- button
- table
- badge
- progress
- dialog
- alert-dialog
- input
- textarea
- select
- toast
- separator

---

## Styling Notes (TV First)

- Avoid small paddings; TV rows should be tall.
- Prefer `text-2xl`+ for row content on TV.
- Ensure status is both color + text (never color-only).

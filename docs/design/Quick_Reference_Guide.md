# Shop Visibility Board - Quick Reference Guide

## Document Purpose

This quick reference provides an at-a-glance summary of all key design decisions, specifications, and implementation guidelines for the Shop Visibility Board.

---

## Core Design Philosophy

| Principle | Description |
|-----------|-------------|
| **TV-First** | Primary surface is the read-only TV display |
| **Visibility Over Management** | Not an ERP, just a visibility layer |
| **Clarity Over Density** | Readable from 10-20 feet away |
| **Speed Over Features** | Admin updates in <30 seconds |
| **Graceful Degradation** | Always show something useful |

---

## Typography Scale

### TV Display

| Element | Size | Weight | Transform |
|---------|------|--------|-----------|
| Header Title | 48px | Bold | Uppercase |
| Date/Time | 32px | Regular | None |
| Column Headers | 24px | Bold | Uppercase |
| Job/Part Numbers | 32px | Semibold | None |
| Status Labels | 28px | Bold | Uppercase |
| Progress Text | 24px | Regular | None |
| ETA | 28px | Semibold | None |

### Admin UI

| Element | Size | Weight |
|---------|------|--------|
| Page Title | 28px | Bold |
| Table Headers | 14px | Bold |
| Table Cell Text | 14px | Regular |
| Form Labels | 14px | Medium |
| Form Inputs | 16px | Regular |
| Buttons | 16px | Medium |

---

## Color Palette

### Light Mode (TV & Admin Default)

**Base Colors:**
- Background: `#FFFFFF`
- Text: `#1a1a1a`
- Borders: `#e5e7eb`
- Muted Text: `#6b7280`

**Status Colors:**

| Status | Background | Text | Tailwind |
|--------|------------|------|----------|
| RECEIVED | `#e5e7eb` | `#374151` | `bg-gray-200 text-gray-800` |
| QUOTED | `#dbeafe` | `#1e40af` | `bg-blue-100 text-blue-800` |
| IN PROGRESS | `#d1fae5` | `#065f46` | `bg-green-100 text-green-800` |
| COMPLETED | `#f3f4f6` | `#6b7280` | `bg-gray-100 text-gray-500` |

### Dark Mode (TV Optional)

**Base Colors:**
- Background: `#0f172a`
- Text: `#ffffff`
- Borders: `#475569`

**Status Colors:**

| Status | Background | Text |
|--------|------------|------|
| RECEIVED | `#334155` | `#cbd5e1` |
| QUOTED | `#1e3a8a` | `#67e8f9` |
| IN PROGRESS | `#14532d` | `#86efac` |
| COMPLETED | `#27272a` | `#a1a1aa` |

---

## Component Sizes

### Progress Bar

| Variant | Height | Border Radius |
|---------|--------|---------------|
| Admin (sm) | 8px | 4px |
| TV (lg) | 20px | 8px |

### Status Pill

| Variant | Padding | Font Size |
|---------|---------|-----------|
| Admin (sm) | 6px 12px | 14px |
| TV (lg) | 10px 20px | 28px |

### Buttons

| Size | Height | Padding | Font Size |
|------|--------|---------|-----------|
| Small | 32px | 8px 12px | 14px |
| Default | 40px | 12px 16px | 16px |
| Large | 48px | 16px 24px | 18px |

---

## Layout Specifications

### TV Display Layouts

**Clean Baseline:**
- Jobs visible: 4-5
- Row height: 80-100px
- Best for: Standard viewing

**Dense:**
- Jobs visible: 6-8
- Row height: 60-70px
- Best for: High job volume

**Dark Mode:**
- Jobs visible: 4-5
- Row height: 80-100px
- Best for: Bright environments

### Admin UI

**Job List:**
- Table row height: 48px
- Page size: 20 jobs
- Alternating row colors

**Dialogs:**
- Max width: 500px (Create Job)
- Max width: 600px (Edit Job)
- Centered on screen

---

## Animation Guidelines

### Allowed Animations

| Animation | Duration | Easing | Use Case |
|-----------|----------|--------|----------|
| Progress bar fill | 300ms | ease-out | Progress update |
| Row highlight | 1500ms | ease-out | Realtime update |
| Fade in | 300ms | ease-in | New job appears |
| Background fade | 1500ms | ease-out | Update confirmation |

### Prohibited Animations

❌ Infinite animations  
❌ Pulsing elements  
❌ Bounce effects  
❌ Spinners on TV  
❌ Slide-in effects  

---

## Realtime Behavior

### Connection States

| State | Indicator | Behavior |
|-------|-----------|----------|
| Connected | None (normal) | Live updates flowing |
| Disconnected | ⚠️ "Live updates paused" | Show last data + warning |
| Reconnecting | "Reconnecting..." | Attempting reconnect |
| Reconnected | ✓ "Connected" (2s) | Resume live updates |

### Update Animation Sequence

```
1. Update received (0ms)
   → Background: light green (#d1fae5)

2. Progress animates (0-300ms)
   → Width transition: smooth

3. Highlight fades (300-1800ms)
   → Background → normal
```

---

## Data Sorting

### TV Display Order

**Priority (highest to lowest):**
1. IN_PROGRESS
2. QUOTED
3. RECEIVED
4. COMPLETED

**Within each status:**
- Sort by `updated_at DESC` (most recent first)

### Admin Display Order

**Default:**
- Same as TV

**With filters:**
- Filter first, then sort

---

## Form Validation Rules

### Job Number
- Format: `V-XXX`
- Required: Yes
- Unique: Yes
- Pattern: `/^V-\d+$/`

### Part Number
- Format: `P-XXX`
- Required: Yes
- Unique: No
- Pattern: `/^P-.+$/`

### Total Pieces
- Type: Integer
- Min: 1
- Max: None
- Required: Yes

### Pieces Completed
- Type: Integer
- Min: 0
- Max: `total_pieces`
- Constraint: `pieces_completed <= total_pieces`

### Status
- Type: Enum
- Values: RECEIVED, QUOTED, IN_PROGRESS, COMPLETED
- Default: RECEIVED
- Progression: Forward only (in most cases)

### ETA
- Type: Text
- Format: Free-form (e.g., "2 days", "1 week")
- Required: No
- Max length: 50 chars

---

## Keyboard Shortcuts

### Admin UI

| Key | Action |
|-----|--------|
| `n` | New Job |
| `Tab` | Next field |
| `Shift+Tab` | Previous field |
| `Enter` | Submit form / Save |
| `Escape` | Cancel / Close modal |
| `Arrow ↑/↓` | Navigate table rows |
| `/` | Focus search (if implemented) |

### Form Shortcuts

| Context | Key | Action |
|---------|-----|--------|
| Modal | `Escape` | Close without saving |
| Modal | `Enter` | Save (if valid) |
| Inline edit | `Enter` | Save |
| Inline edit | `Escape` | Cancel |

---

## Component File Locations

### TV Components
```
components/tv/
├── JobsTable.tsx       # Main table container
├── JobRow.tsx          # Single job row
├── StatusPill.tsx      # Status badge
├── ProgressBar.tsx     # Progress visualization
└── LastUpdated.tsx     # Timestamp display
```

### Admin Components
```
components/admin/
├── JobsAdminTable.tsx         # Admin job list
├── JobForm.tsx                # Create/Edit form
├── InlineProgressUpdate.tsx   # Inline editor
└── ConfirmDialog.tsx          # Confirmation modals
```

### Shared UI Components
```
components/ui/
├── badge.tsx           # shadcn Badge
├── button.tsx          # shadcn Button
├── dialog.tsx          # shadcn Dialog
├── input.tsx           # shadcn Input
├── select.tsx          # shadcn Select
├── table.tsx           # shadcn Table
├── textarea.tsx        # shadcn Textarea
└── progress.tsx        # shadcn Progress
```

---

## Edge Case Quick Reference

| Scenario | Solution |
|----------|----------|
| 15+ jobs | Auto-rotating carousel (TV) / Pagination (Admin) |
| Long part numbers | Truncate with ellipsis, tooltip on hover |
| Completed jobs | Muted display + auto-hide after 7 days |
| Realtime disconnect | Show warning + fallback to polling |
| Zero jobs | Friendly empty state |
| Progress > 100% | Cap at 100%, show warning |
| Missing ETA | Show em dash (—) |
| Concurrent edits | Last write wins, toast notification |
| Slow network | Loading states + optimistic UI |

---

## Technical Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14+ (App Router) |
| Styling | Tailwind CSS |
| Components | shadcn/ui |
| Database | Supabase (Postgres) |
| Realtime | Supabase Realtime |
| Validation | Zod |
| Forms | React Hook Form |
| Hosting | Vercel |

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Admin update time | <30 seconds |
| TV update latency | <5 seconds |
| TV display uptime | >99% |
| Manual status checks | ↓ 50% |

---

## Design Constraints (Non-Negotiable)

### TV Display
- ✅ Read-only, no interaction
- ✅ Large typography (28px+ for critical data)
- ✅ Status never color-only
- ✅ No buttons, forms, or modals
- ✅ Auto-refresh or realtime only

### Admin UI
- ✅ Fast (<30 second updates)
- ✅ Keyboard-friendly
- ✅ Minimal visual decoration
- ✅ Inline editing where possible

### Animations
- ✅ Subtle and purpose-driven
- ✅ CSS transitions preferred
- ✅ Never blocking render
- ✅ No infinite loops

---

## File Creation Checklist

When implementing, create these files in order:

**1. Database Setup**
- [ ] `supabase/schema.sql`
- [ ] `supabase/rls-policies.sql`
- [ ] `supabase/seed.sql`

**2. Core Library**
- [ ] `lib/supabase/client.ts`
- [ ] `lib/supabase/server.ts`
- [ ] `lib/jobs/types.ts`
- [ ] `lib/jobs/queries.ts`
- [ ] `lib/jobs/mutations.ts`
- [ ] `lib/jobs/validators.ts`

**3. Shared UI Components**
- [ ] All shadcn/ui components (button, table, dialog, etc.)
- [ ] Custom StatusPill
- [ ] Custom ProgressBar

**4. TV Display**
- [ ] `app/tv/page.tsx`
- [ ] `components/tv/JobsTable.tsx`
- [ ] `components/tv/JobRow.tsx`
- [ ] `components/tv/LastUpdated.tsx`

**5. Admin UI**
- [ ] `app/admin/layout.tsx`
- [ ] `app/admin/page.tsx`
- [ ] `components/admin/JobsAdminTable.tsx`
- [ ] `components/admin/JobForm.tsx`
- [ ] `components/admin/InlineProgressUpdate.tsx`

**6. Authentication (if needed)**
- [ ] `middleware.ts`
- [ ] `app/auth/callback/route.ts`

---

## Common Pitfalls to Avoid

❌ **Don't:**
- Use color alone to convey status
- Add features not in the PRD
- Create multi-step wizards in admin
- Use hover-only interactions on TV
- Animate elements without purpose
- Poll faster than 30 seconds
- Block UI on animation completion

✅ **Do:**
- Always include text with color
- Stick to the defined scope
- Keep admin flows single-page
- Design for distance viewing
- Animate state changes only
- Use realtime when possible
- Use CSS transitions

---

## Reference Mockup Locations

All mockups are available in:
- `SVB_Visual_Mockups.md` (comprehensive)
- `TV_Display_Mockups.md` (TV-specific)
- `Admin_UI_Mockups.md` (admin-specific)
- `Component_Specifications.md` (component details)
- `Edge_Cases_and_Responsive_Behavior.md` (edge cases)

---

**This quick reference summarizes all key design decisions. For detailed specifications, refer to the individual mockup documents.**

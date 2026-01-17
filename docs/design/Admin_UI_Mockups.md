# Shop Visibility Board - Admin UI Mockups

## Overview

This document contains detailed mockups for the admin interface. The admin UI is optimized for **speed and efficiency** - updates should take less than 30 seconds.

**Core Principles:**
- Fast data entry (<30 seconds per update)
- Keyboard-first navigation
- Minimal visual decoration
- Inline editing where possible

---

## Admin Mockup 1: Job List Page

### Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Jobs                                                      [+ New Job]       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ Filter:  [All] [In Progress] [Quoted] [Received]                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                               │
│  Job #    Part #    Status        Progress      ETA         Actions         │
│  ───────────────────────────────────────────────────────────────────────    │
│  V-101    P-9911    IN PROGRESS   42 / 100      2 days      [Edit] [✓]     │
│  V-102    P-2211    QUOTED        0 / 50        5 days      [Edit] [✓]     │
│  V-103    P-8823    RECEIVED      0 / 25        —           [Edit] [✓]     │
│  V-104    P-7641    IN PROGRESS   78 / 85       1 day       [Edit] [✓]     │
│  V-105    P-5532    IN PROGRESS   15 / 60       4 days      [Edit] [✓]     │
│                                                                               │
│                                                    Showing 5 of 5 jobs       │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Component Specifications

#### Header
- **Title:** "Jobs" - 28px, Bold, #1a1a1a
- **New Job Button:** shadcn Button component
  - Variant: default (primary)
  - Size: default
  - Text: 16px, Medium
  - Icon: Plus icon from lucide-react
  - Click: Opens Create Job Dialog

#### Filter Tabs
- **Component:** shadcn Tabs
- **Layout:** Horizontal, auto-width
- **States:**
  - Default: #f3f4f6 background, #6b7280 text
  - Active: #ffffff background, #1a1a1a text, bottom border
  - Hover: #e5e7eb background
- **Keyboard:** Arrow keys to navigate
- **Options:**
  - All (default)
  - In Progress
  - Quoted
  - Received

#### Table
- **Component:** shadcn Table
- **Row height:** 48px (compact)
- **Row backgrounds:** Alternating #ffffff / #fafafa
- **Hover state:** #f3f4f6
- **Border:** 1px solid #e5e7eb between rows

**Columns:**

| Column | Width | Alignment | Content |
|--------|-------|-----------|---------|
| Job # | 100px | Left | Monospace, 14px, Semibold |
| Part # | 120px | Left | Monospace, 14px, Semibold |
| Status | 140px | Left | Status pill (small) |
| Progress | 140px | Center | Text fraction, clickable |
| ETA | 100px | Left | Text, 14px |
| Actions | 120px | Right | Buttons |

#### Actions Column
- **Edit Button:**
  - shadcn Button (ghost variant)
  - Size: sm
  - Text: "Edit"
  - Click: Opens Edit Job Modal
- **Complete Checkmark:**
  - Icon button
  - Only visible if job is completable
  - Click: Marks job as completed

#### Progress Display
- **Format:** "42 / 100"
- **Font:** 14px, Regular, Monospace
- **Click behavior:** Enters inline edit mode
- **No visual progress bar** (saves space)

### Keyboard Navigation

| Key | Action |
|-----|--------|
| Tab | Move to next interactive element |
| Shift+Tab | Move to previous element |
| Enter | Activate focused button/row |
| Arrow Up/Down | Navigate table rows |
| n | Open New Job dialog |
| / | Focus search (if implemented) |

### Strengths

✅ Fast scanning of all jobs  
✅ One-click access to edit  
✅ Inline progress updates  
✅ Keyboard optimized  

### Limitations

❌ No bulk actions (out of MVP scope)  
❌ No advanced sorting (can add later)  
❌ Limited columns shown  

---

## Admin Mockup 2: Create Job Dialog

### Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Create New Job                              [✕]   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  Job Number *                                                                │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ V-                                                                    │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                               │
│  Part Number *                                                               │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ P-                                                                    │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                               │
│  Total Pieces *                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                               │
│  Date Received                                                               │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ 01/16/2026                                                            │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                               │
│  Status                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ Received                                                        ▼     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                               │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ ℹ️ Job will appear on TV display immediately after creation          │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                               │
│                                     [Cancel]  [Create Job]                   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Field Specifications

| Field Name | Type | Component | Default | Validation | Required |
|------------|------|-----------|---------|------------|----------|
| Job Number | Text | Input | "V-" | Unique, non-empty | Yes |
| Part Number | Text | Input | "P-" | Non-empty | Yes |
| Total Pieces | Number | Input | — | Integer > 0 | Yes |
| Date Received | Date | Input | Today | Valid date | No (auto) |
| Status | Enum | Select | "Received" | One of enum values | No (auto) |

### Component Details

#### Dialog
- **Component:** shadcn Dialog
- **Max width:** 500px
- **Position:** Centered on screen
- **Backdrop:** Semi-transparent (#000000 @ 50%)
- **Close behavior:** Escape key, X button, or Cancel

#### Form Fields
- **Label:** 14px, Medium, #374151, 8px bottom margin
- **Input:** 16px, 48px height, #f9fafb background
- **Focus state:** Blue ring (2px, #3b82f6)
- **Error state:** Red border (#ef4444), red text below
- **Required indicator:** Red asterisk after label

#### Job Number & Part Number
- Pre-filled with prefixes ("V-", "P-")
- User completes the number portion
- Validation on blur: must be unique (Job Number only)

#### Total Pieces
- Type: number
- Min: 1
- Validation: Must be integer > 0
- Error message: "Must be at least 1"

#### Date Received
- Type: date
- Default: Current date
- Format: MM/DD/YYYY
- Can be changed if job was received earlier

#### Status
- Component: shadcn Select
- Options: Received, Quoted, In Progress, Completed
- Default: Received
- Most jobs start as "Received"

#### Info Alert
- Component: shadcn Alert
- Variant: default (blue)
- Icon: Info icon
- Text: "Job will appear on TV display immediately after creation"
- Purpose: Set user expectations

#### Action Buttons
- **Cancel:**
  - Variant: outline
  - Text: "Cancel"
  - Shortcut: Escape
  - Action: Close dialog without saving
- **Create Job:**
  - Variant: default (primary)
  - Text: "Create Job"
  - Shortcut: Enter (if form is valid)
  - Disabled: Until all required fields are valid
  - Action: Submit form, close dialog, show success toast

### Validation Rules

**Client-side (immediate):**
- Job Number: Not empty, matches V-XXX pattern
- Part Number: Not empty
- Total Pieces: Integer > 0

**Server-side (on submit):**
- Job Number: Unique in database
- All fields: Type-safe (Zod schema)

### Form Flow

```
1. User clicks "+ New Job"
2. Dialog opens, focus on Job Number field
3. User tabs through fields
4. Real-time validation on blur
5. Submit button enables when valid
6. User presses Enter or clicks "Create Job"
7. Loading state (button disabled, spinner)
8. Success: Dialog closes, toast shown, table updates
9. Error: Error message shown, form stays open
```

### Typical Completion Time

**Target: <30 seconds**

Sample flow:
1. Click + New Job (1 sec)
2. Type job number "101" (2 sec)
3. Tab to Part Number (0.5 sec)
4. Type part number "9911" (2 sec)
5. Tab to Total Pieces (0.5 sec)
6. Type "100" (1 sec)
7. Tab/Enter through defaults (1 sec)
8. Click Create Job (1 sec)

**Total: ~9 seconds** (well under 30-second target)

### Strengths

✅ Fast data entry  
✅ Smart defaults reduce typing  
✅ Inline validation prevents errors  
✅ Clear feedback  

### Limitations

❌ No optional fields shown (by design)  
❌ No batch creation  

---

## Admin Mockup 3: Edit Job Flow

### Option A: Inline Progress Update (Recommended for Quick Updates)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Jobs                                                      [+ New Job]       │
├─────────────────────────────────────────────────────────────────────────────┤
│  Job #    Part #    Status        Progress      ETA         Actions         │
│  ───────────────────────────────────────────────────────────────────────    │
│  V-101    P-9911    IN PROGRESS   ┌──────┐      2 days      [Save] [✕]     │
│                                    │  42  │ / 100                            │
│                                    └──────┘                                  │
│                                    ^focused input                            │
│  V-102    P-2211    QUOTED        0 / 50        5 days      [Edit] [✓]     │
│  V-103    P-8823    RECEIVED      0 / 25        —           [Edit] [✓]     │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Interaction Flow

**Default State:**
```
42 / 100
```

**Click on Progress:**
```
┌──────┐
│  42  │ / 100     [Save] [✕]
└──────┘
```

**Saving State:**
```
Saving...
```

**Success State:**
```
45 / 100  ✓
^green checkmark, fades after 1 second
```

**Error State:**
```
┌──────┐
│  42  │ / 100     [Save] [✕]
└──────┘
❌ Must be between 0 and 100
```

#### Component Specifications

- **Input:**
  - Type: number
  - Width: 60px
  - Height: 32px
  - Font: 14px, Monospace
  - Auto-select text on focus
- **Validation:**
  - Min: 0
  - Max: total_pieces
  - Must be integer
- **Buttons:**
  - Save: Small primary button
  - Cancel: Small ghost button
- **Keyboard:**
  - Enter: Save
  - Escape: Cancel

#### Strengths

✅ **Fastest possible update:** 5 seconds  
✅ **Zero context switch:** Stay in table  
✅ **Optimistic UI:** Instant feedback  

#### Limitations

❌ Only updates one field  
❌ Can't change status or other fields  

---

### Option B: Full Edit Modal (Recommended for Comprehensive Changes)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Edit Job: V-101                             [✕]   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  Job Number: V-101                          Part Number: P-9911              │
│                                                                               │
│  Status *                                                                    │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ In Progress                                                     ▼     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                               │
│  Pieces Completed *                     Total Pieces: 100                    │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ 42                                                                    │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│  Progress: 42%                                                               │
│                                                                               │
│  Estimated Timeline                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ 2 days                                                                │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                               │
│  Notes                                                                       │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ Primary production run                                                │   │
│  │                                                                       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                               │
│                                     [Cancel]  [Save Changes]                 │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Field Specifications

| Field Name | Editable | Component | Notes |
|------------|----------|-----------|-------|
| Job Number | No | Display only | Cannot be changed |
| Part Number | No | Display only | Cannot be changed |
| Status | Yes | Select | Can progress forward |
| Pieces Completed | Yes | Input (number) | 0 ≤ x ≤ total_pieces |
| Total Pieces | No | Display only | Shown for reference |
| Estimated Timeline | Yes | Input (text) | Free text: "2 days", "1 week" |
| Notes | Yes | Textarea | Optional, max 500 chars |

#### Read-Only Fields
- Job Number and Part Number shown at top
- Total Pieces shown next to Pieces Completed
- Displayed in lighter, muted color

#### Editable Fields

**Status:**
- shadcn Select component
- Options: All enum values
- Validation: Cannot go backwards (e.g., In Progress → Received)

**Pieces Completed:**
- Number input
- Real-time progress % shown below
- Updates as user types
- Example: "42" → "Progress: 42%"

**Estimated Timeline:**
- Text input
- Free-form: "2 days", "3 weeks", "1 month"
- No strict validation

**Notes:**
- Textarea, 4 rows
- Max length: 500 characters
- Character count shown: "42 / 500"

#### Progress Percentage Display
- Updates in real-time as Pieces Completed changes
- Formula: (pieces_completed / total_pieces) × 100
- Rounded to nearest integer
- Displayed below input: "Progress: 42%"

#### Action Buttons
- **Cancel:** Discards all changes, closes modal
- **Save Changes:** Commits to database, shows toast

#### Strengths

✅ All fields in one place  
✅ Live progress % feedback  
✅ Can update status and notes  
✅ Non-destructive (Cancel always available)  

#### Limitations

❌ Slower than inline edit (~15 seconds)  
❌ Modal context switch  

---

## Recommended Usage Pattern

**For quick progress updates:**
→ Use inline editing (Option A)

**For status changes, timeline updates, or notes:**
→ Use full edit modal (Option B)

**For multiple field changes:**
→ Use full edit modal (Option B)

This gives users the best of both worlds: speed when possible, comprehensiveness when needed.

---

## Success & Error States

### Success Toast
```
┌─────────────────────────────────┐
│ ✓  Job updated successfully     │
└─────────────────────────────────┘
```
- Position: Top-right
- Duration: 3 seconds
- Auto-dismiss

### Error Toast
```
┌─────────────────────────────────┐
│ ✕  Failed to update job         │
│    Please try again              │
└─────────────────────────────────┘
```
- Position: Top-right
- Duration: 5 seconds
- Manual dismiss available

### Inline Error
```
┌──────────────────────────────────────┐
│ Pieces Completed *                   │
│ ┌──────────────────────────────────┐ │
│ │ 150                              │ │ ← Red border
│ └──────────────────────────────────┘ │
│ ❌ Cannot exceed total pieces (100)  │ ← Red text
└──────────────────────────────────────┘
```

---

**This document contains the complete Admin UI mockup specifications. All designs prioritize speed and efficiency while maintaining clarity.**

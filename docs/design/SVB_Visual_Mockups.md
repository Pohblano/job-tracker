# Shop Visibility Board (SVB)
## Visual Mockups & UI Specifications
### Version 1.0

---

## Table of Contents

- [A) TV Display Mockups](#a-tv-display-mockups)
  - [TV Mockup 1: Clean Baseline Layout](#tv-mockup-1-clean-baseline-layout)
  - [TV Mockup 2: Dense Layout](#tv-mockup-2-dense-layout-maximum-visibility)
  - [TV Mockup 3: High-Contrast Dark Mode](#tv-mockup-3-high-contrast-dark-mode)
- [B) Admin UI Mockups](#b-admin-ui-mockups)
  - [Admin Mockup 1: Job List Page](#admin-mockup-1-job-list-page)
  - [Admin Mockup 2: Create Job Dialog](#admin-mockup-2-create-job-dialog)
  - [Admin Mockup 3: Edit Job Flow](#admin-mockup-3-edit-job-flow-inline--modal)
- [C) Component-Level Mockups](#c-component-level-mockups)
  - [Component 1: Status Pill](#component-1-status-pill)
  - [Component 2: Progress Bar](#component-2-progress-bar)
  - [Component 3: Job Row (TV)](#component-3-job-row-tv)
  - [Component 4: Admin Job Form](#component-4-admin-job-form)
  - [Component 5: Inline Progress Updater](#component-5-inline-progress-updater)
- [D) Responsive & Edge Cases](#d-responsive--edge-cases)
  - [Edge Case 1: Large Number of Jobs](#edge-case-1-large-number-of-jobs-15)
  - [Edge Case 2: Very Long Part Numbers](#edge-case-2-very-long-part-numbers)
  - [Edge Case 3: Completed Jobs](#edge-case-3-completed-jobs)
  - [Edge Case 4: Realtime Update Mid-View](#edge-case-4-realtime-update-mid-view)
  - [Edge Case 5: TV Refresh/Reconnect State](#edge-case-5-tv-refreshreconnect-state)
  - [Edge Case 6: Zero Jobs in System](#edge-case-6-zero-jobs-in-system)
- [Summary of Design Decisions](#summary-of-design-decisions)

---

## A) TV Display Mockups

### TV Mockup 1: Clean Baseline Layout

**Target:** 1080p display (1920×1080), optimized for ~10 feet viewing distance

#### Layout Structure

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  SHOP VISIBILITY BOARD                                    Fri, Jan 16  2:43 PM│
│                                                                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  JOB #     PART #      STATUS          PROGRESS              ETA            │
│                                                                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  V-101     P-9911      IN PROGRESS      ████████████░░░░     2 days         │
│                                         42 / 100 pieces                      │
│                                                                               │
│  V-102     P-2211      QUOTED           ░░░░░░░░░░░░░░░░     5 days         │
│                                         0 / 50 pieces                        │
│                                                                               │
│  V-103     P-8823      RECEIVED         ░░░░░░░░░░░░░░░░     —              │
│                                         0 / 25 pieces                        │
│                                                                               │
│  V-104     P-7641      IN PROGRESS      ███████████████░     1 day          │
│                                         78 / 85 pieces                       │
│                                                                               │
│                                                                               │
│                                           Last updated: 2:43 PM              │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Typography Specifications

| Element | Specification |
|---------|---------------|
| Header Title | 48px, Bold, Uppercase |
| Date/Time | 32px, Regular |
| Column Headers | 24px, Bold, Uppercase, Letter-spacing: 0.05em |
| Job Numbers | 32px, Semibold, Monospace |
| Part Numbers | 32px, Semibold, Monospace |
| Status Labels | 28px, Bold, Uppercase |
| Progress Text | 24px, Regular |
| ETA | 28px, Semibold |
| Last Updated | 20px, Muted |

#### Color Palette

| Element | Color |
|---------|-------|
| Background | Clean white (#FFFFFF) |
| Text | Near-black (#1a1a1a) |
| Header Border | Medium gray (#d4d4d4) |
| Row Separators | Light gray (#f5f5f5) |

**Status Colors (with text label always present):**

| Status | Background | Text Color |
|--------|------------|------------|
| RECEIVED | Gray (#e5e7eb) | Dark gray (#374151) |
| QUOTED | Blue (#dbeafe) | Blue (#1e40af) |
| IN PROGRESS | Green (#d1fae5) | Green (#065f46) |
| COMPLETED | Muted gray (#f3f4f6) | Muted (#6b7280) |

**Progress Bar:**
- Height: 20px
- Filled: Solid color matching status (green for in progress)
- Unfilled: Light gray (#e5e7eb)
- Border radius: 8px
- Piece count displayed below bar

#### Why This Works

- **Passive glanceability:** No visual noise, clear hierarchy
- **Distance readability:** 32px+ for all critical data
- **Status redundancy:** Color + text label ensures accessibility
- **Generous spacing:** Each row has 80-100px vertical padding
- **Progress context:** Both visual bar and numeric fraction visible

#### Tradeoffs

- Displays only 4-5 jobs comfortably
- Requires scrolling or pagination for larger job lists
- Prioritizes clarity over density

---

### TV Mockup 2: Dense Layout (Maximum Visibility)

**Target:** Show 6-8 jobs without scrolling, sacrifice some whitespace

#### Layout Structure

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  SHOP VISIBILITY BOARD                           Fri, Jan 16  2:43 PM       │
├─────────────────────────────────────────────────────────────────────────────┤
│  JOB #   PART #    STATUS        PROGRESS           ETA      MACHINE        │
├─────────────────────────────────────────────────────────────────────────────┤
│  V-101   P-9911    IN PROG       ████████░░░░ 42/100  2 days   Haas VF-2   │
│  V-102   P-2211    QUOTED        ░░░░░░░░░░░░ 0/50    5 days   Manual      │
│  V-103   P-8823    RECEIVED      ░░░░░░░░░░░░ 0/25    —        Assembly    │
│  V-104   P-7641    IN PROG       ███████████░ 78/85   1 day    Haas VF-2   │
│  V-105   P-5532    IN PROG       █████░░░░░░░ 15/60   4 days   Lathe 3     │
│  V-106   P-9823    QUOTED        ░░░░░░░░░░░░ 0/200   1 week   CNC         │
│  V-107   P-4421    RECEIVED      ░░░░░░░░░░░░ 0/10    —        Manual      │
│  V-108   P-7712    IN PROG       ██████████░░ 89/100  6 hours  Mill 5      │
│                                                                              │
│                                              Last updated: 2:43 PM          │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Typography Specifications

| Element | Specification |
|---------|---------------|
| Header Title | 40px, Bold, Uppercase |
| Column Headers | 22px, Bold, Uppercase |
| Job/Part Numbers | 28px, Semibold, Monospace |
| Status Labels | 24px, Bold, Uppercase (abbreviated if needed) |
| Progress | 22px combined with bar |
| ETA | 24px, Semibold |
| Machine | 22px, Regular |

#### Spacing

- Row height: 60-70px (reduced from baseline)
- Horizontal padding: 24px between columns
- Vertical padding: 16px per row

#### Color Scheme

- Same as Baseline, but with subtle row alternation
- Even rows: Pure white
- Odd rows: Very light gray (#fafafa)

#### Why This Works

- **Maximum jobs visible:** 8 jobs fit on screen
- **Added context:** Machine column helps shop personnel
- **Still readable:** 28px minimum for critical data
- **Efficient use of space:** Tighter leading without cramping

#### Tradeoffs

- Less whitespace = slightly harder to parse at extreme distances
- Progress bar is narrower (16px instead of 20px)
- Must be more disciplined about long part numbers

---

### TV Mockup 3: High-Contrast Dark Mode

**Target:** Bright/reflective shop environments, or preference for dark displays

#### Layout Structure

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  SHOP VISIBILITY BOARD                                    Fri, Jan 16  2:43 PM│
│                                                                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  JOB #     PART #      STATUS          PROGRESS              ETA            │
│                                                                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  V-101     P-9911      IN PROGRESS      ████████████▓▓▓▓     2 days         │
│                                         42 / 100 pieces                      │
│                                                                               │
│  V-102     P-2211      QUOTED           ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓     5 days         │
│                                         0 / 50 pieces                        │
│                                                                               │
│  V-103     P-8823      RECEIVED         ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓     —              │
│                                         0 / 25 pieces                        │
│                                                                               │
│  V-104     P-7641      IN PROGRESS      ███████████████▓     1 day          │
│                                         78 / 85 pieces                       │
│                                                                               │
│                                                                               │
│                                           Last updated: 2:43 PM              │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Color Palette

| Element | Color |
|---------|-------|
| Background | Dark slate (#0f172a) |
| Text | Pure white (#ffffff) |
| Header Border | Medium gray (#475569) |
| Row Separators | Subtle dark gray (#1e293b) |

**Status Colors (high contrast):**

| Status | Background | Text Color |
|--------|------------|------------|
| RECEIVED | Dark gray (#334155) | Light gray (#cbd5e1) |
| QUOTED | Dark blue (#1e3a8a) | Bright cyan (#67e8f9) |
| IN PROGRESS | Dark green (#14532d) | Bright green (#86efac) |
| COMPLETED | Very muted (#27272a) | Light gray (#a1a1aa) |

**Progress Bar:**
- Height: 20px
- Filled: Bright color (e.g., #22c55e for in progress)
- Unfilled: Dark gray (#334155)
- Border radius: 8px
- Strong visual contrast ratio

#### Typography

- Same sizes as Clean Baseline
- All text is white or very light
- Status labels have dark colored backgrounds for legibility

#### Why This Works

- **Reduced eye strain:** Better for extended viewing in dim shops
- **High contrast:** Easier to read with glare or ambient light
- **Professional appearance:** Modern, tech-forward aesthetic
- **Energy efficient:** OLED displays consume less power

#### Tradeoffs

- Some shops prefer traditional light backgrounds
- Requires careful color calibration for status pills
- Bright progress bars may feel more "aggressive"

---

## B) Admin UI Mockups

### Admin Mockup 1: Job List Page

#### Layout Structure

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
│                                                                               │
│                                                    Showing 4 of 4 jobs       │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Component Details

**Header:**
- Title: 28px, Bold
- New Job button: shadcn Button (primary variant), 16px text

**Filter Tabs:**
- shadcn Tabs component
- Horizontal layout
- Active state clearly indicated
- Keyboard navigable

**Table:**
- shadcn Table component
- Compact row height: 48px
- Alternating row backgrounds (#fafafa / white)
- Hover state: subtle highlight

**Actions Column:**
- [Edit] button: shadcn Button (ghost variant), small
- [✓] icon: Quick-complete toggle (if pieces_completed = total_pieces)
- Both keyboard accessible

**Progress Display:**
- Simple text fraction (42 / 100)
- No progress bar (admin doesn't need visual bar)
- Inline editable on click/tap

#### Why This Works

- **Fast scanning:** Compact table shows many jobs
- **Quick actions:** Edit is one click away
- **Keyboard optimized:** Tab through rows, Enter to edit
- **Minimal chrome:** No unnecessary decoration

#### Tradeoffs

- No bulk actions (out of scope for MVP)
- Limited sorting (can add later)

---

### Admin Mockup 2: Create Job Dialog

#### Layout Structure

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
│                                                                               │
│                                     [Cancel]  [Create Job]                   │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Component Details

**Dialog:**
- shadcn Dialog component
- Max width: 500px
- Centered on screen
- Escape key closes

**Form Fields:**
- shadcn Input components
- Label: 14px, Medium, above input
- Input: 16px, 48px height
- Focus states: blue ring
- All required fields marked with *

**Form Field Details:**

| Field | Type | Default | Validation |
|-------|------|---------|------------|
| Job Number | Text | V- | Required, unique |
| Part Number | Text | P- | Required |
| Total Pieces | Number | — | Required, > 0 |
| Date Received | Date | Today | Auto-populated |
| Status | Select | Received | Enum value |

**Actions:**
- Cancel: ghost button
- Create Job: primary button
- Create is disabled until form is valid

#### Why This Works

- **Fast entry:** < 30 seconds to complete
- **Smart defaults:** Status = Received, Date = Today
- **Inline validation:** Errors appear immediately
- **Keyboard flow:** Tab through, Enter to submit

#### Tradeoffs

- No optional fields shown (notes, machine, etc.) — keeps it minimal
- Can add "Advanced" toggle later if needed

---

### Admin Mockup 3: Edit Job Flow (Inline + Modal)

#### Option A: Inline Progress Update

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

**How It Works:**
- Click on progress fraction (42 / 100)
- Input field appears inline
- Type new number
- [Save] commits, [✕] cancels
- Validation: value must be 0 ≤ x ≤ 100

**Why This Works:**
- **Ultra-fast:** Update progress in 5 seconds
- **No context switch:** Stay in table view
- **Optimistic UI:** Updates immediately on save

---

#### Option B: Full Edit Modal

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

**Component Details:**

**Read-Only Fields:**
- Job Number and Part Number displayed but not editable
- Total Pieces shown for reference

**Editable Fields:**
- Status: shadcn Select
- Pieces Completed: shadcn Input (number)
- Estimated Timeline: shadcn Input (text, e.g., "2 days", "1 week")
- Notes: shadcn Textarea

**Validation:**
- Pieces Completed ≤ Total Pieces
- Real-time progress percentage calculation
- Status progression logic enforced

**Actions:**
- Cancel: discards changes
- Save Changes: primary button, commits to DB

#### Why This Works

- **Comprehensive editing:** All fields in one place
- **Clear validation:** Live feedback on progress percentage
- **Non-destructive:** Cancel is always available

#### Tradeoffs

- Slower than inline edit for quick updates
- Modal may feel heavy for single-field changes

**Recommendation:** Use inline edit for progress, modal for status/notes/timeline changes.

---

## C) Component-Level Mockups

### Component 1: Status Pill

#### Visual Design

```
┌─────────────────────┐
│   IN PROGRESS       │  ← Green background, dark green text
└─────────────────────┘

┌─────────────────────┐
│   QUOTED            │  ← Blue background, dark blue text
└─────────────────────┘

┌─────────────────────┐
│   RECEIVED          │  ← Gray background, dark gray text
└─────────────────────┘

┌─────────────────────┐
│   COMPLETED         │  ← Light gray background, muted text
└─────────────────────┘
```

#### Specifications

| Property | Admin | TV |
|----------|-------|-----|
| Font size | 14px | 28px |
| Font weight | Bold | Bold |
| Text transform | Uppercase | Uppercase |
| Letter spacing | 0.05em | 0.05em |
| Padding | 6px 12px | 10px 20px |
| Border radius | 6px | 6px |

**Color Mapping:**

| Status | Background | Text |
|--------|------------|------|
| RECEIVED | bg-gray-200 | text-gray-800 |
| QUOTED | bg-blue-100 | text-blue-800 |
| IN PROGRESS | bg-green-100 | text-green-800 |
| COMPLETED | bg-gray-100 | text-gray-500 |

**Implementation:**
- shadcn Badge component with custom variants
- Props: `status` (enum), `size` ("sm" | "lg")

#### Why This Works

- **Redundant encoding:** Color + text ensures accessibility
- **High contrast:** Readable on any background
- **Consistent sizing:** Scales appropriately for TV vs admin
- **Clear semantics:** Status is always obvious

---

### Component 2: Progress Bar

#### Visual Design

**Admin Version (Compact):**
```
42 / 100 pieces
████████████░░░░░░░░  42%
```

**TV Version (Large):**
```
████████████████████░░░░░░░░░░░░
42 / 100 pieces
```

#### Specifications

| Property | Admin | TV |
|----------|-------|-----|
| Height | 8px | 20px |
| Width | 100% or 200px | 100% or 400-500px |
| Border radius | 4px | 8px |
| Filled color | Status-dependent | Bright, status-matching |
| Unfilled color | bg-gray-200 | bg-gray-300 |
| Animation | width 300ms ease-out | width 300ms ease-out |

**Logic:**
- Fill percentage = (pieces_completed / total_pieces) × 100
- Always show fraction below bar for precision
- Bar fills left-to-right

**Animation:**
- CSS transition: width 300ms ease-out
- Smooth fill on realtime update

**Implementation:**
- shadcn Progress component OR custom div
- Props: `completed`, `total`, `size` ("sm" | "lg")

#### Why This Works

- **Dual representation:** Visual + numeric
- **Accessible:** Fraction text is machine-readable
- **Smooth updates:** Transition communicates change
- **Status-aware:** Color matches current job status

---

### Component 3: Job Row (TV)

#### Visual Design

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  V-101     P-9911      IN PROGRESS      ████████████░░░░     2 days         │
│                                         42 / 100 pieces                      │
│                                                                               │
│  ^ slight highlight on update, fades after 1-2 seconds                       │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Specifications

**Layout:**
- Display: grid (5 columns)
- Column widths: 120px / 140px / 200px / 300px / 140px
- Row height: 80-100px
- Padding: 20px 24px
- Border-bottom: 1px solid gray-200

**Columns:**
1. Job Number (monospace, 32px, semibold)
2. Part Number (monospace, 32px, semibold)
3. Status Pill (large variant)
4. Progress Bar + text (centered)
5. ETA (28px, semibold)

**Realtime Update Animation:**
- On update, background changes to bg-green-50
- Fade out transition over 1.5 seconds
- Returns to normal state

**State Management:**
- Receives job object as prop
- Reacts to realtime updates
- Memoized to prevent unnecessary re-renders

#### Why This Works

- **Self-contained:** Each row is independent
- **Visual feedback:** Update highlight communicates change
- **Readable:** Large text, generous spacing
- **Performant:** Memoization prevents cascade re-renders

---

### Component 4: Admin Job Form

#### Visual Design

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Job Number *          Part Number *          Total Pieces *                │
│  ┌──────────────┐     ┌──────────────┐       ┌──────────────┐             │
│  │ V-105        │     │ P-5532       │       │ 60           │             │
│  └──────────────┘     └──────────────┘       └──────────────┘             │
│                                                                               │
│  Status                Date Received          Priority                       │
│  ┌──────────────┐     ┌──────────────┐       ┌──────────────┐             │
│  │ Received  ▼  │     │ 01/16/2026   │       │ Medium    ▼  │             │
│  └──────────────┘     └──────────────┘       └──────────────┘             │
│                                                                               │
│  Estimated Timeline                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ 4 days                                                                │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                               │
│  Notes (optional)                                                            │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                       │   │
│  │                                                                       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                               │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ ℹ️ Job will appear on TV display immediately after creation          │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Specifications

**Layout:**
- Responsive grid: 3 columns on desktop, stacks on mobile
- Field groups logically organized
- Required fields marked with *

**Fields:**
- All shadcn Input/Select/Textarea components
- Label: 14px, medium weight, above input
- Input: 16px, 48px height
- Error states: red border + red text below

**Validation:**
- Client-side: Zod schema
- Real-time validation on blur
- Submit blocked until valid

**Helper Text:**
- Info box at bottom (shadcn Alert component)
- Explains immediate TV visibility

**Implementation:**
- React Hook Form + Zod
- Reusable for both Create and Edit flows
- Props: `defaultValues`, `onSubmit`, `mode` ("create" | "edit")

#### Why This Works

- **Logical grouping:** Related fields side-by-side
- **Clear requirements:** * for required, optional labeled
- **Inline validation:** Errors appear as user types
- **Context-aware:** Helper text explains consequences

---

### Component 5: Inline Progress Updater

#### Visual Design

**Default State:**
```
42 / 100
```

**Edit State:**
```
┌────────┐
│  42    │ / 100     [Save] [Cancel]
└────────┘
 ^focused
```

**Saving State:**
```
Saving...
```

**Success State:**
```
45 / 100  ✓
^brief checkmark, fades after 1 second
```

#### Specifications

**Default:**
- Display: fraction as plain text
- Click to activate

**Edit:**
- Input: number type, 60px width
- Validation: 0 ≤ value ≤ total_pieces
- Buttons: small ghost buttons
- Keyboard: Enter = save, Escape = cancel

**Saving:**
- Input disabled
- "Saving..." text replaces buttons

**Success:**
- Green checkmark appears
- Fades after 1 second
- Returns to default state

**Error:**
- Red "X" icon
- Error message below
- Returns to edit state

**Implementation:**
- Local state management
- Optimistic update
- shadcn Input + Button components

#### Why This Works

- **Zero context switch:** Edit right in table
- **Instant feedback:** Optimistic UI + confirmation
- **Error recovery:** Clear error states
- **Keyboard friendly:** Enter/Escape shortcuts

---

## D) Responsive & Edge Cases

### Edge Case 1: Large Number of Jobs (15+)

#### Problem

- TV display can only show 4-8 jobs at once
- Admin table becomes unwieldy

#### TV Solution: Option A - Carousel with Auto-Rotation

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  SHOP VISIBILITY BOARD                           Page 1 of 3  [●○○]  2:43 PM│
├─────────────────────────────────────────────────────────────────────────────┤
│  [Shows first 6 jobs]                                                        │
│                                                                               │
│  Rotates to page 2 after 20 seconds                                          │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### TV Solution: Option B - Scrolling Ticker (Bottom)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  SHOP VISIBILITY BOARD                                           2:43 PM    │
├─────────────────────────────────────────────────────────────────────────────┤
│  [Top 6 jobs displayed as table]                                            │
│                                                                               │
├─────────────────────────────────────────────────────────────────────────────┤
│  ← V-109: QUOTED | V-110: IN PROG 23/50 | V-111: RECEIVED →                │
│     [Slow horizontal scroll for remaining jobs]                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Recommendation:** Option A (carousel) with deterministic sorting ensures most important jobs (IN_PROGRESS) are always on page 1.

#### Admin Solution

- Standard pagination: 20 jobs per page
- Search/filter by job number or part number
- Status filter tabs reduce visible set

---

### Edge Case 2: Very Long Part Numbers

#### Problem

- Part numbers like "P-998877-REV-A-SUBASSY" overflow columns

#### Solution

**TV Display:**
```
V-101     P-998877-REV...     IN PROG     ████     2 days
          ^truncate with ellipsis
```

**Admin Display:**
- Truncate in table view with tooltip on hover
- Full text visible in edit modal

**Implementation:**
- CSS: `overflow: hidden; text-overflow: ellipsis; white-space: nowrap;`
- Max-width constraints per column

---

### Edge Case 3: Completed Jobs

#### Problem

- Do completed jobs stay visible forever?

#### Solution

**TV Display:**
- Completed jobs shown with muted styling
- Auto-hide after 7 days (configurable)
- Sorting ensures completed jobs appear last

**Admin Display:**
- Default filter: "Active" (excludes completed)
- "All" filter shows completed jobs
- Optional "Archive" action for manual removal

**Visual Treatment (TV):**
```
V-105     P-4421      COMPLETED       ████████████████     —
                      ^muted gray background, low contrast
```

---

### Edge Case 4: Realtime Update Mid-View

#### Scenario

- User is viewing TV display
- Job V-101 progress updates from 42/100 to 45/100

#### Behavior

**Without Animation:**
- Row content updates instantly
- No visual indicator
- User might miss change

**With Animation (Recommended):**

```
Step 1: Update received
  → Row background becomes light green (#d1fae5)

Step 2: Progress bar animates
  → Width transition from 42% to 45% over 300ms

Step 3: Highlight fades
  → Background fades to normal over 1.5 seconds
```

**Implementation:**
- Supabase realtime subscription
- React state update triggers CSS transition
- Temporary class added, removed after animation

---

### Edge Case 5: TV Refresh/Reconnect State

#### Problem

- Realtime connection drops
- User doesn't know if data is stale

#### Solution: Visual Indicator

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  SHOP VISIBILITY BOARD                                           2:43 PM    │
│                                                    ⚠️ Live updates paused   │
├─────────────────────────────────────────────────────────────────────────────┤
│  [Last known good data displayed]                                           │
│                                                                               │
│                                    Last updated: 2:41 PM (2 min ago)        │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Fallback Behavior

- Display last known state
- Show warning icon + "Live updates paused"
- Automatically attempt reconnect every 10 seconds
- Fall back to polling every 60 seconds if reconnect fails

#### Auto-Recovery

- Once connection restored:
  - Warning disappears
  - Data refreshes silently
  - Brief "Connected" message (fades after 2 seconds)

---

### Edge Case 6: Zero Jobs in System

#### TV Display

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  SHOP VISIBILITY BOARD                                           2:43 PM    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│                                                                               │
│                         No active jobs at this time                          │
│                                                                               │
│                                                                               │
│                                           Last updated: 2:43 PM              │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Admin Display

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Jobs                                                      [+ New Job]       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│                         No jobs yet                                          │
│                         Click "+ New Job" to get started                     │
│                                                                               │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Why This Works:**
- Clear messaging, not an error state
- CTA visible (admin only)
- Professional appearance

---

## Summary of Design Decisions

### TV Display Philosophy

- **Clarity over density:** Readable from 10-20 feet
- **Passive consumption:** No interaction required
- **Realtime feedback:** Visual cues for updates
- **Failsafe design:** Graceful degradation

### Admin UI Philosophy

- **Speed over features:** <30 seconds per update
- **Keyboard-first:** Tab navigation, Enter shortcuts
- **Minimal chrome:** No unnecessary decoration
- **Inline actions:** Edit where you see

### Component Strategy

- **shadcn/ui foundation:** Professional, accessible
- **Tailwind styling:** Consistent spacing/colors
- **Contextual sizing:** sm/lg variants for admin/TV
- **State-driven animation:** Purpose, not decoration

### Edge Case Handling

- **Deterministic sorting:** IN_PROGRESS always first
- **Graceful overflow:** Pagination, truncation, carousel
- **Connection resilience:** Fallback to polling
- **Empty states:** Clear messaging, actionable CTAs

---

**All mockups adhere strictly to the PRD and provided documentation. No new features or workflows have been introduced.**

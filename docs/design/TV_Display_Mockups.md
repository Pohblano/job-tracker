# Shop Visibility Board - TV Display Mockups

## Overview

This document contains detailed mockups for the TV-facing display. The TV display is the **primary product surface** and is optimized for passive consumption from 10-20 feet away.

**Core Principles:**
- Read-only, no interaction
- High contrast, large typography
- Realtime updates with visual feedback
- Graceful degradation on failure

---

## Mockup 1: Clean Baseline Layout

**Best for:** Standard viewing conditions, 4-5 active jobs

### Layout

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

### Typography

| Element | Size | Weight | Transform | Notes |
|---------|------|--------|-----------|-------|
| Header Title | 48px | Bold | Uppercase | Left-aligned |
| Date/Time | 32px | Regular | None | Right-aligned |
| Column Headers | 24px | Bold | Uppercase | Letter-spacing: 0.05em |
| Job Numbers | 32px | Semibold | None | Monospace font |
| Part Numbers | 32px | Semibold | None | Monospace font |
| Status Labels | 28px | Bold | Uppercase | Inside colored pill |
| Progress Text | 24px | Regular | None | Below progress bar |
| ETA | 28px | Semibold | None | Right-aligned in column |
| Last Updated | 20px | Regular | None | Muted color |

### Colors

**Base Colors:**
- Background: `#FFFFFF` (white)
- Primary Text: `#1a1a1a` (near-black)
- Header Border: `#d4d4d4` (medium gray)
- Row Separators: `#f5f5f5` (light gray)

**Status Colors:**

| Status | Background | Text | Hex Values |
|--------|------------|------|------------|
| RECEIVED | Light gray | Dark gray | BG: `#e5e7eb`, Text: `#374151` |
| QUOTED | Light blue | Dark blue | BG: `#dbeafe`, Text: `#1e40af` |
| IN PROGRESS | Light green | Dark green | BG: `#d1fae5`, Text: `#065f46` |
| COMPLETED | Very light gray | Muted gray | BG: `#f3f4f6`, Text: `#6b7280` |

**Progress Bar:**
- Height: 20px
- Border radius: 8px
- Filled: Status color (green for in progress)
- Unfilled: `#e5e7eb`

### Spacing

- Row height: 80-100px
- Row padding: 20px 24px
- Column gaps: 32px
- Header bottom margin: 40px
- Footer top margin: 40px

### Strengths

✅ Maximum clarity and readability  
✅ Comfortable for extended viewing  
✅ Status is always obvious (color + text)  
✅ Progress is both visual and precise  

### Limitations

❌ Only shows 4-5 jobs comfortably  
❌ Requires pagination for >6 jobs  
❌ Uses more vertical space  

---

## Mockup 2: Dense Layout

**Best for:** Busy shops with 6-8 concurrent jobs

### Layout

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

### Typography

| Element | Size | Weight | Notes |
|---------|------|--------|-------|
| Header Title | 40px | Bold | Slightly smaller |
| Column Headers | 22px | Bold | Tighter spacing |
| Job/Part Numbers | 28px | Semibold | Still readable |
| Status Labels | 24px | Bold | Abbreviated if needed |
| Progress | 22px | Regular | Combined with bar |
| ETA | 24px | Semibold | — |
| Machine | 22px | Regular | New column |

### Spacing

- Row height: 60-70px (reduced)
- Row padding: 12px 24px
- Column gaps: 24px
- Tighter vertical spacing

### Additional Column: Machine

Adds context about which equipment is being used. Helpful for:
- Resource allocation awareness
- Machine-specific bottlenecks
- Shop floor coordination

### Strengths

✅ Shows 8 jobs on one screen  
✅ Adds machine context  
✅ Still readable from 10+ feet  
✅ Efficient use of space  

### Limitations

❌ Less comfortable for extended viewing  
❌ Narrower progress bar (16px vs 20px)  
❌ Less whitespace  

---

## Mockup 3: High-Contrast Dark Mode

**Best for:** Bright shops, ambient light, or personal preference

### Layout

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
└─────────────────────────────────────────────────────────────────────────────┘
```

### Colors

**Base Colors:**
- Background: `#0f172a` (dark slate)
- Primary Text: `#ffffff` (white)
- Header Border: `#475569` (medium gray)
- Row Separators: `#1e293b` (subtle dark gray)

**Status Colors:**

| Status | Background | Text | Hex Values |
|--------|------------|------|------------|
| RECEIVED | Dark gray | Light gray | BG: `#334155`, Text: `#cbd5e1` |
| QUOTED | Dark blue | Bright cyan | BG: `#1e3a8a`, Text: `#67e8f9` |
| IN PROGRESS | Dark green | Bright green | BG: `#14532d`, Text: `#86efac` |
| COMPLETED | Very dark | Light gray | BG: `#27272a`, Text: `#a1a1aa` |

**Progress Bar:**
- Filled: Bright colors (`#22c55e` for in progress)
- Unfilled: `#334155`
- Strong contrast ratio (>7:1)

### Strengths

✅ Reduces eye strain in dim environments  
✅ High contrast with ambient light  
✅ Modern, professional aesthetic  
✅ Energy efficient on OLED displays  

### Limitations

❌ May not suit all shop preferences  
❌ Requires careful color calibration  
❌ Status pills need precise contrast  

---

## Realtime Update Animation

**When job progress updates:**

```
Step 1: Update received (0ms)
  → Row background: #d1fae5 (light green)

Step 2: Progress bar animates (0-300ms)
  → Width transitions smoothly
  → CSS: transition: width 300ms ease-out

Step 3: Highlight fades (300ms-1800ms)
  → Background fades to normal
  → CSS: transition: background-color 1500ms ease-out
```

**Visual Example:**

```
Before:
V-101  P-9911  IN PROGRESS  ████████░░░░ 42/100  2 days

Update received:
V-101  P-9911  IN PROGRESS  ████████░░░░ 42/100  2 days
                            ^subtle green background

After animation:
V-101  P-9911  IN PROGRESS  █████████░░░ 45/100  2 days
                            ^background faded to normal
```

---

## Comparison Matrix

| Feature | Clean Baseline | Dense | Dark Mode |
|---------|----------------|-------|-----------|
| Jobs visible | 4-5 | 6-8 | 4-5 |
| Row height | 80-100px | 60-70px | 80-100px |
| Progress bar | 20px | 16px | 20px |
| Machine column | No | Yes | No |
| Best for | Standard use | High volume | Bright shops |
| Eye strain | Low | Medium | Very low |
| Space efficiency | Low | High | Low |

---

## Implementation Notes

### File: `app/tv/page.tsx`

```tsx
export default async function TVPage() {
  const jobs = await fetchJobs(); // Server-side initial load
  
  return (
    <main className="min-h-screen bg-white">
      <TVHeader />
      <JobsTable jobs={jobs} /> {/* Client component with realtime */}
      <LastUpdated />
    </main>
  );
}
```

### File: `components/tv/JobsTable.tsx`

```tsx
'use client';

export function JobsTable({ jobs: initialJobs }) {
  const [jobs, setJobs] = useState(initialJobs);
  
  useEffect(() => {
    // Supabase realtime subscription
    const channel = supabase
      .channel('jobs-realtime')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'jobs' },
        handleJobChange
      )
      .subscribe();
      
    return () => channel.unsubscribe();
  }, []);
  
  return (
    <div className="grid gap-8 p-12">
      {sortedJobs.map(job => (
        <JobRow key={job.id} job={job} />
      ))}
    </div>
  );
}
```

### Sorting Priority

Jobs must be sorted in this order:
1. IN_PROGRESS (most important)
2. QUOTED
3. RECEIVED
4. COMPLETED (least important)

Within each status group, sort by `updated_at DESC`.

---

**This document contains the complete TV display mockup specifications. All designs adhere to the PRD and project documentation.**

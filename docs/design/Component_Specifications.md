# Shop Visibility Board - Component Specifications

## Overview

This document defines the detailed specifications for all reusable UI components. Components are designed with **TV-first** sizing but include **admin variants** for compact views.

**Component Library:** shadcn/ui (extended with custom variants)  
**Styling:** Tailwind CSS utility classes  
**Animation:** CSS transitions preferred, framer-motion only when necessary

---

## Component 1: Status Pill

### Purpose
Displays the current status of a job with color + text redundancy for accessibility.

### Visual Examples

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

### Specifications

#### Sizing

| Property | Admin (Small) | TV (Large) |
|----------|---------------|------------|
| Font size | 14px | 28px |
| Font weight | 700 (Bold) | 700 (Bold) |
| Text transform | UPPERCASE | UPPERCASE |
| Letter spacing | 0.05em | 0.05em |
| Padding (vertical) | 6px | 10px |
| Padding (horizontal) | 12px | 20px |
| Border radius | 6px | 6px |
| Display | inline-flex | inline-flex |
| Align items | center | center |

#### Color Mapping

| Status | Tailwind BG | Tailwind Text | Hex BG | Hex Text |
|--------|-------------|---------------|---------|----------|
| RECEIVED | bg-gray-200 | text-gray-800 | #e5e7eb | #1f2937 |
| QUOTED | bg-blue-100 | text-blue-800 | #dbeafe | #1e40af |
| IN_PROGRESS | bg-green-100 | text-green-800 | #d1fae5 | #065f46 |
| COMPLETED | bg-gray-100 | text-gray-500 | #f3f4f6 | #6b7280 |

**Dark Mode Variants:**

| Status | Tailwind BG | Tailwind Text | Hex BG | Hex Text |
|--------|-------------|---------------|---------|----------|
| RECEIVED | bg-gray-700 | text-gray-100 | #334155 | #cbd5e1 |
| QUOTED | bg-blue-900 | text-cyan-300 | #1e3a8a | #67e8f9 |
| IN_PROGRESS | bg-green-900 | text-green-300 | #14532d | #86efac |
| COMPLETED | bg-gray-800 | text-gray-400 | #27272a | #a1a1aa |

### Implementation

**Base Component:** shadcn Badge with custom variants

**File:** `components/ui/status-pill.tsx`

```tsx
import { Badge } from "@/components/ui/badge"
import { type JobStatus } from "@/lib/types"

interface StatusPillProps {
  status: JobStatus
  size?: "sm" | "lg"
}

export function StatusPill({ status, size = "sm" }: StatusPillProps) {
  return (
    <Badge 
      variant={status.toLowerCase()} 
      className={size === "lg" ? "text-2xl px-5 py-2" : ""}
    >
      {status.replace("_", " ")}
    </Badge>
  )
}
```

**Badge Variants (Tailwind config):**

```tsx
const statusVariants = {
  received: "bg-gray-200 text-gray-800",
  quoted: "bg-blue-100 text-blue-800",
  in_progress: "bg-green-100 text-green-800",
  completed: "bg-gray-100 text-gray-500",
}
```

### Usage Examples

```tsx
// Admin view
<StatusPill status="IN_PROGRESS" size="sm" />

// TV view
<StatusPill status="IN_PROGRESS" size="lg" />
```

### Accessibility
- Text content always present (never color-only)
- Minimum contrast ratio: 4.5:1 (meets WCAG AA)
- Screen readers read status text

---

## Component 2: Progress Bar

### Purpose
Visual and numeric representation of job completion progress.

### Visual Examples

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

### Specifications

#### Sizing

| Property | Admin (Small) | TV (Large) |
|----------|---------------|------------|
| Bar height | 8px | 20px |
| Bar width | 100% or 200px | 100% or 400-500px |
| Border radius | 4px | 8px |
| Text size (fraction) | 12px | 24px |
| Text size (percentage) | 12px | — (omitted) |
| Margin below bar | 4px | 8px |

#### Colors

| State | Property | Color | Tailwind |
|-------|----------|-------|----------|
| Filled | background | Status-dependent | bg-green-500 (in progress) |
| Unfilled | background | Light gray | bg-gray-200 |
| Text | color | Medium gray | text-gray-600 |

**Status-Dependent Fill Colors:**

| Status | Fill Color | Tailwind |
|--------|------------|----------|
| RECEIVED | Gray | bg-gray-400 |
| QUOTED | Blue | bg-blue-500 |
| IN_PROGRESS | Green | bg-green-500 |
| COMPLETED | Gray | bg-gray-300 |

#### Animation

```css
.progress-bar-fill {
  transition: width 300ms ease-out;
}
```

**When value changes:**
- Fill width animates smoothly from old to new percentage
- Duration: 300ms
- Easing: ease-out
- No other properties animate

### Implementation

**Option A:** shadcn Progress component

```tsx
import { Progress } from "@/components/ui/progress"

export function JobProgress({ completed, total, size = "sm" }) {
  const percentage = (completed / total) * 100
  
  return (
    <div>
      <Progress 
        value={percentage} 
        className={size === "lg" ? "h-5" : "h-2"}
      />
      <div className={size === "lg" ? "text-2xl" : "text-xs"}>
        {completed} / {total} pieces
      </div>
    </div>
  )
}
```

**Option B:** Custom implementation (more control)

```tsx
export function JobProgress({ completed, total, status, size = "sm" }) {
  const percentage = (completed / total) * 100
  const height = size === "lg" ? "20px" : "8px"
  
  return (
    <div>
      <div className="relative w-full bg-gray-200 rounded overflow-hidden"
           style={{ height }}>
        <div 
          className={`absolute top-0 left-0 h-full transition-all duration-300 
                     ${getStatusColor(status)}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className={size === "lg" ? "text-2xl mt-2" : "text-xs mt-1"}>
        {completed} / {total} pieces
      </div>
    </div>
  )
}
```

### Usage Examples

```tsx
// Admin view
<JobProgress completed={42} total={100} status="IN_PROGRESS" size="sm" />

// TV view
<JobProgress completed={42} total={100} status="IN_PROGRESS" size="lg" />
```

### Logic

**Percentage calculation:**
```ts
const percentage = Math.round((completed / total) * 100)
```

**Edge cases:**
- If total = 0: Show "— / 0" and 0% fill
- If completed > total: Cap at 100%
- Always round percentage to integer

---

## Component 3: Job Row (TV)

### Purpose
Display a single job's information in the TV table view with realtime update animation.

### Visual Example

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  V-101     P-9911      IN PROGRESS      ████████████░░░░     2 days         │
│                                         42 / 100 pieces                      │
│                                                                               │
│  [On realtime update: subtle green background highlight, fades after 1.5s]  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Specifications

#### Layout

**Display:** CSS Grid with 5 columns

```css
.job-row {
  display: grid;
  grid-template-columns: 120px 140px 200px 300px 140px;
  gap: 32px;
  padding: 20px 24px;
  border-bottom: 1px solid #f5f5f5;
  min-height: 80px;
}
```

**Column assignments:**
1. Job Number (120px)
2. Part Number (140px)
3. Status Pill (200px)
4. Progress Bar + Text (300px)
5. ETA (140px)

#### Typography

| Column | Font | Size | Weight | Color |
|--------|------|------|--------|-------|
| Job # | Monospace | 32px | 600 (Semibold) | #1a1a1a |
| Part # | Monospace | 32px | 600 (Semibold) | #1a1a1a |
| Status | — | 28px | 700 (Bold) | Status-dependent |
| Progress | Sans-serif | 24px | 400 (Regular) | #6b7280 |
| ETA | Sans-serif | 28px | 600 (Semibold) | #1a1a1a |

#### Update Animation

**Trigger:** Realtime database change

**Animation sequence:**
1. Background changes to `#d1fae5` (light green)
2. Hold for 200ms
3. Fade to original background over 1500ms

**CSS:**
```css
.job-row {
  transition: background-color 1500ms ease-out;
}

.job-row.updated {
  background-color: #d1fae5;
}
```

**JavaScript:**
```ts
function handleJobUpdate(job: Job) {
  const row = document.getElementById(`job-${job.id}`)
  row.classList.add('updated')
  setTimeout(() => row.classList.remove('updated'), 1700)
}
```

### Implementation

**File:** `components/tv/JobRow.tsx`

```tsx
'use client'

import { useState, useEffect } from 'react'
import { StatusPill } from '@/components/ui/status-pill'
import { JobProgress } from '@/components/ui/job-progress'

interface JobRowProps {
  job: Job
}

export function JobRow({ job }: JobRowProps) {
  const [highlight, setHighlight] = useState(false)
  
  // Trigger highlight on job update
  useEffect(() => {
    setHighlight(true)
    const timer = setTimeout(() => setHighlight(false), 1700)
    return () => clearTimeout(timer)
  }, [job.updated_at])
  
  return (
    <div 
      className={`job-row ${highlight ? 'bg-green-50' : ''} 
                  transition-colors duration-1500`}
    >
      <div className="font-mono text-3xl font-semibold">{job.job_number}</div>
      <div className="font-mono text-3xl font-semibold">{job.part_number}</div>
      <StatusPill status={job.status} size="lg" />
      <JobProgress 
        completed={job.pieces_completed} 
        total={job.total_pieces}
        status={job.status}
        size="lg"
      />
      <div className="text-3xl font-semibold">{job.eta_text || '—'}</div>
    </div>
  )
}
```

### Memoization

**Prevent unnecessary re-renders:**

```tsx
import { memo } from 'react'

export const JobRow = memo(function JobRow({ job }: JobRowProps) {
  // ... component code
}, (prev, next) => {
  return prev.job.id === next.job.id 
      && prev.job.updated_at === next.job.updated_at
})
```

---

## Component 4: Admin Job Form

### Purpose
Reusable form for creating and editing jobs in the admin interface.

### Visual Example

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
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Specifications

#### Layout
- **Grid:** 3 columns on desktop, stacks to 1 column on mobile
- **Gap:** 24px between fields
- **Max width:** 800px

#### Field Components
- **Input:** shadcn Input
- **Select:** shadcn Select
- **Textarea:** shadcn Textarea
- **Label:** shadcn Label

#### Field Styling

| Property | Value |
|----------|-------|
| Label size | 14px |
| Label weight | 500 (Medium) |
| Label color | #374151 |
| Label margin | 0 0 8px 0 |
| Input height | 48px |
| Input font size | 16px |
| Input background | #f9fafb |
| Input border | 1px solid #e5e7eb |
| Input focus ring | 2px #3b82f6 |
| Error border | 1px solid #ef4444 |
| Error text | 14px, #ef4444 |

### Implementation

**File:** `components/admin/JobForm.tsx`

```tsx
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { jobSchema } from '@/lib/jobs/validators'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

interface JobFormProps {
  mode: 'create' | 'edit'
  defaultValues?: Partial<Job>
  onSubmit: (data: JobFormData) => Promise<void>
}

export function JobForm({ mode, defaultValues, onSubmit }: JobFormProps) {
  const form = useForm({
    resolver: zodResolver(jobSchema),
    defaultValues: defaultValues || {
      job_number: 'V-',
      part_number: 'P-',
      status: 'RECEIVED',
      date_received: new Date().toISOString().split('T')[0],
    }
  })
  
  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-3 gap-6">
      {/* Job Number */}
      <div>
        <Label htmlFor="job_number">Job Number *</Label>
        <Input 
          id="job_number"
          {...form.register('job_number')}
          className={form.formState.errors.job_number ? 'border-red-500' : ''}
        />
        {form.formState.errors.job_number && (
          <p className="text-sm text-red-500 mt-1">
            {form.formState.errors.job_number.message}
          </p>
        )}
      </div>
      
      {/* Additional fields... */}
    </form>
  )
}
```

### Validation Schema (Zod)

```ts
import { z } from 'zod'

export const jobSchema = z.object({
  job_number: z.string()
    .min(1, 'Job number is required')
    .regex(/^V-\d+$/, 'Must be in format V-XXX'),
  part_number: z.string()
    .min(1, 'Part number is required'),
  total_pieces: z.number()
    .int()
    .min(1, 'Must be at least 1'),
  status: z.enum(['RECEIVED', 'QUOTED', 'IN_PROGRESS', 'COMPLETED']),
  date_received: z.string().optional(),
  eta_text: z.string().optional(),
  notes: z.string().max(500, 'Maximum 500 characters').optional(),
})
```

---

## Component 5: Inline Progress Updater

### Purpose
Quick inline editing of pieces completed without opening a modal.

### Visual States

**Default:**
```
42 / 100
```

**Edit:**
```
┌────────┐
│  42    │ / 100     [Save] [✕]
└────────┘
 ^focused
```

**Saving:**
```
Saving...
```

**Success:**
```
45 / 100  ✓
```

**Error:**
```
┌────────┐
│  42    │ / 100     [Save] [✕]
└────────┘
❌ Must be ≤ 100
```

### Specifications

#### Input
- **Type:** number
- **Width:** 60px
- **Height:** 32px
- **Font:** 14px, Monospace
- **Auto-select:** Text selected on focus

#### Buttons
- **Save:** Small primary button
- **Cancel:** Small ghost button (X icon)
- **Size:** 28px height

#### Keyboard Shortcuts
- **Enter:** Save
- **Escape:** Cancel
- **Tab:** Move to next field

### Implementation

**File:** `components/admin/InlineProgressUpdate.tsx`

```tsx
'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface InlineProgressUpdateProps {
  jobId: string
  completed: number
  total: number
  onUpdate: (value: number) => Promise<void>
}

export function InlineProgressUpdate({ 
  jobId, completed, total, onUpdate 
}: InlineProgressUpdateProps) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(completed)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  async function handleSave() {
    if (value < 0 || value > total) {
      setError(`Must be between 0 and ${total}`)
      return
    }
    
    setSaving(true)
    try {
      await onUpdate(value)
      setEditing(false)
      // Show checkmark briefly
      setTimeout(() => setSuccess(false), 1000)
    } catch (err) {
      setError('Failed to save')
    } finally {
      setSaving(false)
    }
  }
  
  if (!editing) {
    return (
      <button 
        onClick={() => setEditing(true)}
        className="font-mono text-sm hover:underline"
      >
        {completed} / {total}
      </button>
    )
  }
  
  return (
    <div className="flex items-center gap-2">
      <Input
        type="number"
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleSave()
          if (e.key === 'Escape') setEditing(false)
        }}
        className="w-16 h-8 text-sm font-mono"
        autoFocus
        onFocus={(e) => e.target.select()}
      />
      <span className="text-sm">/ {total}</span>
      {!saving && (
        <>
          <Button size="sm" onClick={handleSave}>Save</Button>
          <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
            ✕
          </Button>
        </>
      )}
      {saving && <span className="text-sm">Saving...</span>}
      {error && <span className="text-sm text-red-500">{error}</span>}
    </div>
  )
}
```

---

## Summary: Component Design Principles

### Consistency
- All components use shadcn/ui as base
- Tailwind classes for styling
- Monospace fonts for numbers
- Sans-serif for text

### Accessibility
- Color never conveys meaning alone
- Minimum contrast ratios met (WCAG AA)
- Keyboard navigation supported
- Screen reader friendly

### Performance
- Components memoized where beneficial
- CSS transitions preferred over JS
- Minimal re-renders via React.memo

### Flexibility
- Size variants (sm/lg) for admin vs TV
- Dark mode support (where applicable)
- Customizable via props

---

**All component specifications follow the project's design principles and technical requirements.**

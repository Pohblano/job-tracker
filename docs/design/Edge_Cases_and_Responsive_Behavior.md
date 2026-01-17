# Shop Visibility Board - Edge Cases & Responsive Behavior

## Overview

This document defines how the system handles edge cases, error states, and unusual scenarios. Every edge case has a defined, predictable behavior.

**Philosophy:** Graceful degradation over failure. The system should always show something useful, even in degraded states.

---

## Edge Case 1: Large Number of Jobs (15+)

### Problem Statement

- TV display optimally shows 4-8 jobs
- Admin table becomes difficult to scan with 20+ rows
- Jobs may exceed screen capacity

### TV Solution: Auto-Rotation Carousel

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  SHOP VISIBILITY BOARD                           Page 1 of 3  [●○○]  2:43 PM│
├─────────────────────────────────────────────────────────────────────────────┤
│  JOB #   PART #    STATUS        PROGRESS           ETA      MACHINE        │
├─────────────────────────────────────────────────────────────────────────────┤
│  V-101   P-9911    IN PROG       ████████░░░░ 42/100  2 days   Haas VF-2   │
│  V-102   P-2211    QUOTED        ░░░░░░░░░░░░ 0/50    5 days   Manual      │
│  V-103   P-8823    RECEIVED      ░░░░░░░░░░░░ 0/25    —        Assembly    │
│  V-104   P-7641    IN PROG       ███████████░ 78/85   1 day    Haas VF-2   │
│  V-105   P-5532    IN PROG       █████░░░░░░░ 15/60   4 days   Lathe 3     │
│  V-106   P-9823    QUOTED        ░░░░░░░░░░░░ 0/200   1 week   CNC         │
│                                                                              │
│  [Automatically rotates to page 2 after 20 seconds]                         │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Behavior

**Pagination:**
- Page size: 6 jobs (dense layout) or 4 jobs (clean layout)
- Auto-rotate: Every 20 seconds
- Page indicator: Dots or "Page X of Y"
- Pause rotation: On realtime update (resume after 5 seconds)

**Sorting Priority:**
Jobs sorted by:
1. Status (IN_PROGRESS → QUOTED → RECEIVED → COMPLETED)
2. Updated timestamp (most recent first)

This ensures the most active jobs are always on page 1.

**Edge case within edge case:**
If >50 jobs exist, only show first 50. Recommend admin cleanup.

#### Implementation

```tsx
function TVJobsDisplay({ jobs }) {
  const [currentPage, setCurrentPage] = useState(0)
  const pageSize = 6
  const totalPages = Math.ceil(jobs.length / pageSize)
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPage((prev) => (prev + 1) % totalPages)
    }, 20000) // 20 seconds
    
    return () => clearInterval(interval)
  }, [totalPages])
  
  const visibleJobs = jobs.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  )
  
  return <JobsTable jobs={visibleJobs} page={currentPage} total={totalPages} />
}
```

### Admin Solution: Pagination + Filters

**Pagination:**
- Page size: 20 jobs per page
- Standard pagination controls
- Show "Showing X-Y of Z jobs"

**Filters:**
- Status filter (All, In Progress, Quoted, Received)
- Reduces visible set immediately
- Persists across sessions

**Search (optional enhancement):**
- Search by job number or part number
- Instant filter of results

#### Example

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Jobs                      [Search: ___________]              [+ New Job]   │
├─────────────────────────────────────────────────────────────────────────────┤
│  Filter:  [All] [In Progress] [Quoted] [Received]                           │
│                                                                               │
│  [Job table with 20 rows]                                                    │
│                                                                               │
│  ← Prev   1 2 3 4 5 ... 12   Next →                Showing 1-20 of 234 jobs │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Edge Case 2: Very Long Part Numbers

### Problem Statement

- Part numbers may be long: "P-998877-REV-A-SUBASSY-001"
- Fixed column widths cause overflow
- Text becomes unreadable

### TV Solution: Truncate with Ellipsis

```
V-101     P-998877-REV...     IN PROG     ████     2 days
          ^truncated at 15 chars
```

**Implementation:**
```css
.part-number {
  max-width: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
```

**Rule:**
- Max display: 15 characters
- Always show prefix (e.g., "P-")
- Ellipsis indicates truncation

### Admin Solution: Truncate in Table, Full in Modal

**Table view:**
```
V-101  P-998877-R...  IN PROG  42/100  [Edit]
       ^hover shows tooltip with full text
```

**Modal view:**
```
Part Number: P-998877-REV-A-SUBASSY-001
            ^full text visible, wraps if needed
```

**Implementation:**
```tsx
// Table cell
<div className="truncate max-w-[120px]" title={job.part_number}>
  {job.part_number}
</div>

// Modal
<div className="break-words">
  Part Number: {job.part_number}
</div>
```

---

## Edge Case 3: Completed Jobs

### Problem Statement

- Do completed jobs stay visible forever?
- TV display may become cluttered
- Admin list grows unbounded

### TV Solution: Muted Display + Auto-Hide

**Visual Treatment:**
```
V-105     P-4421      COMPLETED       ████████████████     —
                      ^muted styling, low contrast
```

**Auto-hide logic:**
- Completed jobs remain visible for 7 days
- After 7 days, hidden from TV view
- Still accessible in admin panel

**Muted styling:**
```css
.job-row.completed {
  opacity: 0.5;
  background-color: #fafafa;
}

.job-row.completed .status-pill {
  background-color: #f3f4f6;
  color: #9ca3af;
}
```

### Admin Solution: Filter + Archive

**Default view:**
- Shows only active jobs (not completed)
- "Active" filter selected by default

**All filter:**
- Shows all jobs including completed
- Completed jobs at bottom of list

**Archive action (optional):**
```
[Archive]  ← Manually hide completed job from TV
```

---

## Edge Case 4: Realtime Update Mid-View

### Scenario

User viewing TV display when:
- Job V-101 progress updates from 42/100 to 45/100
- Job V-102 status changes from QUOTED to IN_PROGRESS
- New job V-110 is created

### Behavior: Smooth Visual Feedback

#### Progress Update

```
Step 1 (0ms): Update received
  → Row background: #d1fae5 (light green)

Step 2 (0-300ms): Progress bar animates
  → Width smoothly transitions: 42% → 45%
  → CSS transition: width 300ms ease-out

Step 3 (300-1800ms): Highlight fades
  → Background fades to white
  → CSS transition: background-color 1500ms ease-out
```

**Visual:**
```
Before:
V-101  P-9911  IN PROGRESS  ████████░░░░ 42/100  2 days

During (0-300ms):
V-101  P-9911  IN PROGRESS  ████████░░░░ 42/100  2 days
                            ^green background

After (1800ms):
V-101  P-9911  IN PROGRESS  █████████░░░ 45/100  2 days
                            ^normal background
```

#### Status Change

```
Job moves position in sorted list:
1. Fade out from current position (200ms)
2. Re-sort array
3. Fade in at new position (200ms)
```

**No jarring jumps** - smooth transitions only.

#### New Job Insertion

```
1. New job appears at appropriate position
2. Gentle fade-in (300ms)
3. No slide or bounce effects
```

### Implementation

```tsx
function JobRow({ job }) {
  const [highlighted, setHighlighted] = useState(false)
  const prevProgressRef = useRef(job.pieces_completed)
  
  useEffect(() => {
    // Detect progress change
    if (prevProgressRef.current !== job.pieces_completed) {
      setHighlighted(true)
      setTimeout(() => setHighlighted(false), 1700)
      prevProgressRef.current = job.pieces_completed
    }
  }, [job.pieces_completed])
  
  return (
    <div className={`job-row transition-all duration-1500 
                    ${highlighted ? 'bg-green-50' : ''}`}>
      {/* Row content */}
    </div>
  )
}
```

---

## Edge Case 5: TV Refresh/Reconnect State

### Problem Statement

- Realtime connection may drop
- Network interruption
- Server restart
- User doesn't know if data is stale

### Solution: Visual Indicator + Fallback

**Connected state (normal):**
```
┌─────────────────────────────────────────────────────────────────────────────┐
│  SHOP VISIBILITY BOARD                                           2:43 PM    │
├─────────────────────────────────────────────────────────────────────────────┤
│  [Normal job display]                                                        │
│                                           Last updated: 2:43 PM              │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Disconnected state:**
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

**Reconnected state:**
```
┌─────────────────────────────────────────────────────────────────────────────┐
│  SHOP VISIBILITY BOARD                                           2:43 PM    │
│                                                         ✓ Connected          │
├─────────────────────────────────────────────────────────────────────────────┤
│  [Refreshed job display]                                                     │
│                                           Last updated: 2:43 PM              │
└─────────────────────────────────────────────────────────────────────────────┘
^message fades after 2 seconds
```

### Reconnection Strategy

**Automatic reconnection:**
```
1. Connection lost
   → Show warning immediately
   
2. Attempt reconnect every 10 seconds
   → Max 6 attempts (1 minute)
   
3. If reconnect fails after 1 minute:
   → Fall back to polling every 60 seconds
   
4. When connection restored:
   → Show success message
   → Fetch latest data
   → Resume realtime subscription
   → Hide success message after 2 seconds
```

### Implementation

```tsx
function TVPage() {
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'reconnecting'>('connected')
  const [lastUpdate, setLastUpdate] = useState(new Date())
  
  useEffect(() => {
    const channel = supabase
      .channel('jobs-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'jobs' }, 
        (payload) => {
          handleJobChange(payload)
          setLastUpdate(new Date())
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setConnectionStatus('connected')
        } else if (status === 'CLOSED') {
          setConnectionStatus('disconnected')
          startReconnectAttempts()
        }
      })
    
    return () => channel.unsubscribe()
  }, [])
  
  return (
    <>
      <Header>
        {connectionStatus === 'disconnected' && (
          <div className="text-amber-600">⚠️ Live updates paused</div>
        )}
        {connectionStatus === 'reconnecting' && (
          <div className="text-blue-600">Reconnecting...</div>
        )}
      </Header>
      <JobsTable />
      <Footer>
        Last updated: {formatRelativeTime(lastUpdate)}
      </Footer>
    </>
  )
}
```

### Fallback Behavior

**If realtime unavailable entirely:**
```tsx
function useFallbackPolling() {
  useEffect(() => {
    if (!realtimeAvailable) {
      const interval = setInterval(() => {
        fetchJobs().then(setJobs)
      }, 60000) // Poll every 60 seconds
      
      return () => clearInterval(interval)
    }
  }, [realtimeAvailable])
}
```

---

## Edge Case 6: Zero Jobs in System

### Problem Statement

- New installation
- All jobs completed and archived
- Empty state needs clear messaging

### TV Solution: Friendly Empty State

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  SHOP VISIBILITY BOARD                                           2:43 PM    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│                                                                               │
│                                                                               │
│                         No active jobs at this time                          │
│                                                                               │
│                                                                               │
│                                                                               │
│                                           Last updated: 2:43 PM              │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Styling:**
- Message: 32px, centered
- Color: #6b7280 (muted)
- No error styling (not an error)

### Admin Solution: Call-to-Action

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Jobs                                                      [+ New Job]       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│                                                                               │
│                         📋 No jobs yet                                       │
│                                                                               │
│                         Click "+ New Job" to get started                     │
│                                                                               │
│                                                                               │
└─────────────────────────────────────────────────────────────────────────────┘
```

**CTA visible and actionable**

---

## Edge Case 7: Extremely High Progress (Over 100%)

### Problem Statement

- Data entry error: pieces_completed > total_pieces
- Database constraint should prevent this
- But what if it happens?

### Solution: Cap at 100% Visually

**Display:**
```
Progress bar: 100% filled (not 150%)
Text: "105 / 100 pieces" with warning color
Warning icon: ⚠️
```

**Admin view:**
```
Pieces Completed: 105
Total Pieces: 100
⚠️ Pieces completed exceeds total - please verify
```

**Database constraint (preventative):**
```sql
ALTER TABLE jobs 
  ADD CONSTRAINT pieces_completed_lte_total 
  CHECK (pieces_completed <= total_pieces);
```

---

## Edge Case 8: Missing or Invalid ETA

### Problem Statement

- ETA is optional
- May be null or invalid text
- Display should be consistent

### Solution: Show Em Dash

**If ETA is null or empty:**
```
Display: "—"
```

**If ETA is present:**
```
Display: "2 days"
```

**Never show:**
- "null"
- "undefined"
- Empty space
- "N/A"

---

## Edge Case 9: Concurrent Edits (Admin)

### Problem Statement

- Two admins editing same job simultaneously
- Last write wins in database
- User may overwrite colleague's changes

### Solution: Optimistic UI + Toast Notification

**Scenario:**
```
Admin A opens edit modal for V-101
Admin B updates V-101 via inline edit
Admin A saves changes
```

**Behavior:**
1. Admin A's save succeeds (last write wins)
2. Admin B sees their update
3. Admin B receives toast: "Job was updated by another user"
4. Admin B's view refreshes with latest data

**Implementation:**
```tsx
async function handleSave(jobId, updates) {
  const { data, error } = await supabase
    .from('jobs')
    .update(updates)
    .eq('id', jobId)
    .select()
    .single()
  
  if (data.updated_at > localJobData.updated_at) {
    toast.info('Job was updated by another user')
  }
}
```

**No complex conflict resolution needed** for MVP - last write wins is acceptable.

---

## Edge Case 10: Slow Network / High Latency

### Problem Statement

- User on slow connection
- Mutations take >3 seconds
- Need loading feedback

### Solution: Loading States + Optimistic UI

**Inline progress update:**
```
Default:    42 / 100
Clicked:    [42  ] / 100  [Save] [✕]
Saving:     Saving...
Success:    45 / 100  ✓
```

**Create/Edit modal:**
```
Button states:
- Default:  [Create Job]
- Loading:  [Creating...] (disabled, spinner icon)
- Success:  Modal closes, toast shown
- Error:    [Create Job] + error message
```

**Optimistic UI for progress:**
```tsx
function InlineProgressUpdate({ job, onUpdate }) {
  const [optimisticValue, setOptimisticValue] = useState(job.pieces_completed)
  
  async function handleSave(newValue) {
    setOptimisticValue(newValue) // Update UI immediately
    
    try {
      await onUpdate(newValue) // Actually save
    } catch (error) {
      setOptimisticValue(job.pieces_completed) // Revert on error
      toast.error('Failed to update')
    }
  }
}
```

---

## Summary: Edge Case Handling Principles

### 1. Never Show Nothing
- Empty states have clear messaging
- Errors provide context
- Loading states visible

### 2. Fail Gracefully
- Network issues → Show last known data + warning
- Invalid data → Cap/sanitize display
- Missing data → Use sensible defaults

### 3. Communicate State
- Loading indicators for slow operations
- Success feedback for confirmations
- Error messages that guide recovery

### 4. Prioritize Reliability
- Database constraints prevent bad data
- Client validation before submission
- Fallback mechanisms (polling when realtime fails)

### 5. Optimize for Common Cases
- Most jobs won't exceed screen capacity
- Most operations succeed
- Most data is valid
- Build for the 99% case, handle the 1% gracefully

---

**All edge cases have defined, tested behavior. The system degrades gracefully rather than failing catastrophically.**

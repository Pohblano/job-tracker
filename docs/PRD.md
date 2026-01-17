# Product Requirements Document (PRD)
## Shop Visibility Board (SVB)

---

## 1. Overview

The **Shop Visibility Board (SVB)** is a real-time, read-only dashboard designed to provide engineers and shop personnel with immediate visibility into all active shop jobs and their current production status.

The system prioritizes **visibility over management** and is intended to be displayed continuously on a TV within the shop area.

SVB is not an ERP, scheduling system, or planning tool. It is a shared operational awareness layer.

---

## 2. Problem Statement

Engineers and stakeholders currently lack a single, shared view of shop activity. This results in:

- Frequent verbal status check-ins
- Manual follow-ups
- Inconsistent understanding of job progress
- Reduced efficiency across teams

SVB addresses this by providing a centralized, always-on source of truth.

---

## 3. Goals

- Provide at-a-glance visibility into all shop jobs
- Clearly display production progress
- Reduce ad-hoc communication
- Maintain simplicity, reliability, and speed
- Support passive consumption via TV display

---

## 4. Non-Goals (Explicitly Out of Scope)

SVB is **not** intended to:
- Replace scheduling or planning software
- Track inventory, labor, or costs
- Manage approvals or workflows
- Act as an ERP or MES
- Enforce permissions beyond basic admin access

---

## 5. Target Users

### Viewers (Read-Only)
- Engineers
- Shop floor personnel
- Management (visibility only)

### Editors (Limited Write Access)
- David (primary workflow owner)
- Joe (secondary / oversight)

---

## 6. Core Data Model

Each **Job** represents a single production effort.

Required fields:
- Part Number
- Job Number (V-number)
- Total Pieces
- Pieces Completed
- Status
- Estimated Timeline
- Date Received

---

## 7. Status Workflow

1. Received  
2. Quoted  
3. In Progress  
4. Completed  

---

## 8. Progress Tracking

Progress is calculated as:
pieces_completed / total_pieces

Displayed as a prominent progress bar.

---

## 9. Display Requirements (Shop TV View)

- Full-screen layout
- High contrast and large typography
- Optimized for 1080p displays
- No authentication required for viewing
- Auto-refresh or real-time updates

---

## 10. Admin Interface

Editors can:
- Create jobs
- Update status
- Update pieces completed
- Edit timelines

---

## 11. Technical Stack

- Next.js
- Tailwind CSS
- shadcn/ui
- Supabase
- Vercel

---

## 12. Success Metrics

- Reduced verbal status check-ins
- Updates visible within seconds
- Manual updates under 30 seconds

---

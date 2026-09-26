# Update Report Status Documentation

## Overview

The Civic Issue Tracker allows officers to update the status of civic complaints/reports assigned to their department. This document describes the complete flow of status updates, including which files are involved and how the functionality works.

---

## Status Workflow

### Available Statuses

The system supports five distinct statuses for reports:

| Status | Description | When Used |
|--------|-------------|-----------|
| **pending** | Initial state when a citizen submits a report | Default status on creation |
| **verified** | Officer confirms the report is valid and matches the category | After reviewing pending reports |
| **in-progress** | Work has started on resolving the issue | Officer is actively addressing the complaint |
| **resolved** | Issue has been fixed/addressed | Work is complete |
| **rejected** | Report is invalid or not a civic issue | Requires rejection reason |

### Status Transition Rules

1. **Pending Reports**: Officers must first verify or reject
2. **Verified Reports**: Can be updated to in-progress or resolved
3. **Rejected Reports**: Cannot be updated further (terminal state)
4. **Officers can only update reports assigned to their department**

---

## File Structure & Components

### Frontend Files

#### 1. **ReviewActions.jsx** (`client/src/components/ComplaintDetail/ReviewActions.jsx`)

**Purpose**: Handles initial review of pending complaints

**Key Features**:
- Verify button - Marks report as verified
- Reject button with reason input (max 200 characters)
- Confirmation modals for both actions
- Only shown for complaints with `status === "pending"`

**Props**:
```javascript
{
  onVerify: Function,      // Callback when verify is clicked
  onReject: Function,      // Callback with rejection reason
  isUpdating: Boolean      // Loading state
}
```

**User Flow**:
1. Officer sees pending complaint
2. Reviews complaint details
3. Clicks "Verify Report" → Confirmation modal → Complaint marked as verified
4. OR clicks "Reject Report" → Reason input appears → Enters reason → Confirmation modal → Complaint rejected

---

#### 2. **UpdateStatusCard.jsx** (`client/src/components/ComplaintDetail/UpdateStatusCard.jsx`)

**Purpose**: Allows status updates for non-pending complaints

**Key Features**:
- Dropdown with status options (verified, in-progress, resolved)
- Disabled when report is rejected
- Shows confirmation modal before saving
- Only enabled when selected status differs from current status

**Props**:
```javascript
{
  currentStatus: String,   // Current report status
  onSave: Function,        // Callback with new status
  isUpdating: Boolean      // Loading state
}
```

**User Flow**:
1. Officer opens verified/in-progress complaint
2. Selects new status from dropdown
3. Clicks "Save Status" button
4. Confirms in modal
5. Status updates, UI reflects change

**Special Behavior**:
- If `currentStatus === "rejected"`: Shows disabled message instead of form

---

#### 3. **ConfirmActionModal.jsx** (`client/src/components/ComplaintDetail/ConfirmActionModal.jsx`)

**Purpose**: Reusable confirmation modal for all status changes

**Props**:
```javascript
{
  isOpen: Boolean,
  title: String,
  message: String,
  confirmLabel: String,
  confirmClassName: String,
  isLoading: Boolean,
  onConfirm: Function,
  onCancel: Function
}
```

---

#### 4. **OfficerComplaintDetail.jsx** (`client/src/pages/Officer/OfficerComplaintDetail.jsx`)

**Purpose**: Main page that orchestrates the status update flow

**Key Functionality**:

```javascript
const handleStatusChange = async (newStatus, reason) => {
  // Makes PATCH request to backend
  const response = await axios.patch(
    `http://localhost:5000/api/officer/complaints/${complaint.report_id}/status`,
    reason 
      ? { status: newStatus, rejection_reason: reason } 
      : { status: newStatus },
    { withCredentials: true }
  );
  
  // Updates local state
  setCurrentStatus(newStatus);
  
  // Redirects if verified or rejected
  if (newStatus === "verified" || newStatus === "rejected") {
    navigate("/officer/complaints");
  }
};
```

**Conditional Rendering**:
- Shows `ReviewActions` component if `currentStatus === "pending"`
- Shows `UpdateStatusCard` component for all other statuses

---

### Backend Files

#### 5. **officerRoutes.js** (`server/routes/officerRoutes.js`)

**Route Definition**:
```javascript
PATCH /api/officer/complaints/:id/status
```

**Middleware**:
- `checkToken` - Verifies JWT authentication

**Handler**:
- `updateComplaintStatus` from `officerControllers.js`

---

#### 6. **officerControllers.js** (`server/controllers/officerControllers.js`)

**Function**: `updateComplaintStatus`

**Request Parameters**:
```javascript
// URL params
{ id: report_id }

// Body
{
  status: String,              // Required: one of ALLOWED_STATUSES
  rejection_reason: String     // Required only if status === "rejected"
}
```

**Validation Checks**:

1. **Authentication**: User must be logged in
2. **Authorization**: User role must be "officer"
3. **Status Validation**: Status must be in `ALLOWED_STATUSES` array
4. **Rejection Reason**: Required when `status === "rejected"`
5. **Department Assignment**: Officer must have an assigned department
6. **Report Ownership**: Report must be assigned to officer's department

**Database Operations** (uses transaction):

```sql
-- 1. Look up officer's department
SELECT department FROM officers WHERE user_id = $1

-- 2. Update report status (only if assigned to officer's department)
UPDATE reports
SET status = $1, updated_at = CURRENT_TIMESTAMP
WHERE report_id = $2 AND assigned_department = $3
RETURNING *

-- 3. If rejecting, log to rejected_complaints table
INSERT INTO rejected_complaints (report_id, rejected_by, reason)
VALUES ($1, $2, $3)
ON CONFLICT (report_id) DO UPDATE SET
  rejected_by = EXCLUDED.rejected_by,
  reason = EXCLUDED.reason,
  rejected_at = CURRENT_TIMESTAMP
```

**Response**:
```javascript
{
  success: true,
  message: "Status updated successfully.",
  report: { /* updated report object */ }
}
```

**Error Responses**:
- `401`: Not authenticated
- `403`: Not an officer or no department assigned
- `400`: Invalid status or missing rejection reason
- `404`: Complaint not found in officer's department
- `500`: Server error

---

### Database Schema

#### 7. **reports table** (`server/db/create_reports_table.sql`)

**Relevant Columns**:
```sql
status VARCHAR(20) NOT NULL DEFAULT 'pending'
  CHECK (status IN ('pending', 'verified', 'in-progress', 'resolved', 'rejected')),
assigned_department VARCHAR(100),
updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
```

#### 8. **rejected_complaints table** (`server/db/create_rejected_complaints_table.sql`)

**Purpose**: Stores rejection reasons for audit trail

**Columns**:
- `report_id` (PK, FK to reports)
- `rejected_by` (FK to users - the officer who rejected)
- `reason` (TEXT - rejection explanation)
- `rejected_at` (TIMESTAMP)

---

## Complete Update Flow

### Scenario 1: Verifying a Pending Report

```
1. Officer navigates to pending complaint detail page
   ↓
2. OfficerComplaintDetail.jsx renders ReviewActions component
   ↓
3. Officer clicks "Verify Report" button
   ↓
4. ConfirmActionModal appears asking for confirmation
   ↓
5. Officer confirms
   ↓
6. handleStatusChange("verified") called
   ↓
7. PATCH /api/officer/complaints/{id}/status
   Body: { status: "verified" }
   ↓
8. Backend validates officer and department
   ↓
9. Database updates report.status = "verified"
   ↓
10. Frontend shows success toast and redirects to complaints list
```

### Scenario 2: Rejecting a Report

```
1. Officer clicks "Reject Report" in ReviewActions
   ↓
2. Rejection reason textarea appears
   ↓
3. Officer enters reason (max 200 chars) and clicks "Continue"
   ↓
4. ConfirmActionModal appears with rejection warning
   ↓
5. Officer confirms
   ↓
6. handleStatusChange("rejected", reason) called
   ↓
7. PATCH /api/officer/complaints/{id}/status
   Body: { status: "rejected", rejection_reason: "..." }
   ↓
8. Backend validates and begins transaction
   ↓
9. Updates report.status = "rejected"
   ↓
10. Inserts into rejected_complaints table
   ↓
11. Commits transaction
   ↓
12. Frontend shows success and redirects
```

### Scenario 3: Updating Status of Verified Report

```
1. Officer opens verified complaint
   ↓
2. OfficerComplaintDetail.jsx renders UpdateStatusCard
   ↓
3. Officer selects "In Progress" from dropdown
   ↓
4. Clicks "Save Status" button
   ↓
5. ConfirmActionModal shows status change preview
   ↓
6. Officer confirms
   ↓
7. handleStatusChange("in-progress") called
   ↓
8. PATCH /api/officer/complaints/{id}/status
   Body: { status: "in-progress" }
   ↓
9. Backend validates and updates database
   ↓
10. Frontend updates local state, shows success toast
   ↓
11. Page remains on detail view (no redirect for non-terminal states)
```

---

## Security & Access Control

### Authentication
- JWT token required in cookies (`withCredentials: true`)
- Token checked by `checkToken` middleware

### Authorization
- Only users with `role === "officer"` can update statuses
- Officers can only update reports where `assigned_department` matches their department
- Enforced at database level via WHERE clause

### Data Validation
- Status must be in predefined `ALLOWED_STATUSES` array
- Rejection reason required and trimmed when rejecting
- Character limits enforced (200 chars for rejection reason)

---

## API Endpoint Summary

### Endpoint
```
PATCH /api/officer/complaints/:id/status
```

### Headers
```
Cookie: jwt=<token>
Content-Type: application/json
```

### Request Body
```json
{
  "status": "verified" | "in-progress" | "resolved" | "rejected",
  "rejection_reason": "string (required only if status is 'rejected')"
}
```

### Success Response (200)
```json
{
  "success": true,
  "message": "Status updated successfully.",
  "report": {
    "report_id": "uuid",
    "status": "verified",
    "updated_at": "2026-09-26T01:00:00.000Z",
    // ... other report fields
  }
}
```

### Error Responses
```json
// 401 Unauthorized
{
  "success": false,
  "error": "User not authenticated. Please log in."
}

// 403 Forbidden
{
  "success": false,
  "error": "Access denied. Officer role required."
}

// 400 Bad Request
{
  "success": false,
  "error": "Status must be one of: pending, verified, in-progress, resolved, rejected"
}

// 404 Not Found
{
  "success": false,
  "error": "Complaint not found in your department."
}
```

---

## UI Component Hierarchy

```
OfficerComplaintDetail.jsx (Page)
├── ComplaintHeader.jsx
├── ComplaintInformation.jsx
└── [Conditional Actions]
    ├── ReviewActions.jsx (if status === "pending")
    │   └── ConfirmActionModal.jsx (2 instances)
    └── UpdateStatusCard.jsx (if status !== "pending")
        └── ConfirmActionModal.jsx
```

---

## Key Takeaways

1. **Status updates are handled by two different components** depending on whether the report is pending or not
2. **All status changes require confirmation** through modals
3. **Rejected reports cannot be updated** - it's a terminal state
4. **Department-based access control** ensures officers can only update their assigned reports
5. **Rejection reasons are audited** in a separate table
6. **Transaction-based updates** ensure data consistency
7. **Automatic redirection** occurs after verify/reject operations

---

## Future Enhancement Possibilities

- Add status change history/audit log
- Email notifications to citizens on status changes
- Bulk status updates for multiple reports
- Custom status workflow per department


- Officer notes/comments on status changes
- Estimated resolution time tracking

---

*Last Updated: 2026-09-26*

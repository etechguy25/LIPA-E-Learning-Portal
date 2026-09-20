# Firestore Security Specification

## 1. Data Invariants
- **Identity Invariant**: Users can read and update only their own profile unless they have the administrator role.
- **Role Elevation Guard**: Regular students and faculty cannot modify their `role` property.
- **Course Integrity**: Courses can only be created, modified, or deleted by authenticated administrators. Enrolled students and instructors may read course catalogs.
- **Submission Integrity**: Students may only submit assignments for their own `studentId`. Instructors and admins can grade and provide feedback.
- **Financial Immutability**: Payment transactions are append-only audit records created by the bursar/admin or via verified payment processing. Students can read only their own transactions.
- **Audit Trail Immutability**: `/activity_logs/{logId}` records are append-only. They capture login audits, course alterations, and system changes. Modification of existing log records is prohibited (`allow update: if false`).
- **System Settings Integrity**: `/system_settings/{settingId}` may only be altered by authenticated administrators.
- **Default Deny**: All unmapped collections or paths are strictly closed (`allow read, write: if false;`).

## 2. The "Dirty Dozen" Vulnerability Payloads (Must be blocked with PERMISSION_DENIED)
1. **Unauthenticated User Write**: Anonymous request attempting to create a user profile document in `/users/{userId}`.
2. **Role Tampering**: Student sending `{ role: 'admin' }` to self-escalate privileges in `/users/{studentId}`.
3. **Ghost / Shadow Fields**: Submitting unknown malicious keys like `{ __backdoor: true, isSuperAdmin: true }` during update.
4. **ID Poisoning Attack**: Passing a 2KB string or path-traversal character sequence as `userId` or `courseId`.
5. **Cross-Student Impersonation**: Student A creating an assignment submission under Student B's `studentId`.
6. **Course Hijack**: Student sending an update to `/courses/{courseId}` to modify tuition fee or credits.
7. **Score Tampering**: Student updating their own submission to set `{ score: 100, status: 'graded' }`.
8. **Transaction Forgery**: Student injecting a fake `{ amount: 5000, status: 'completed' }` transaction under another student's ID.
9. **Blanket Collection Scrape**: Unauthorized list query querying all user records without appropriate authentication filter.
10. **Denial-of-Wallet Payload**: Injecting unbounded payload arrays or megabyte-long text into string fields exceeding maxLength limits.
11. **Activity Log Erasure or Tampering**: Student or non-admin attempting to overwrite or update an audit entry in `/activity_logs/{logId}`.
12. **System Parameter Hijack**: Student or instructor attempting to change `tuitionFeePerCredit` or institutional flags in `/system_settings/{settingId}`.

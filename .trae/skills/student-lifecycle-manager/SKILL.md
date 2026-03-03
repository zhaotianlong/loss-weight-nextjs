---
name: "student-lifecycle-manager"
description: "Manages the end-to-end student journey: registration, check-in, room/bed assignment, renewal, and checkout. Invoke when handling student status changes or accommodation requests."
---

# Student Lifecycle Manager

This skill governs the standardized process for student movements and accommodation within the camp.

## Core Workflows

### 1. Registration & Check-in
-   **Validation**: Verify student exists and is not currently "In Camp".
-   **Accommodation**: Check bed availability and match room type with student gender.
-   **Financial Check**: Ensure tuition is initiated. Check-in usually triggers a `tuition` record with `source: '学费(入住)'` and `status: 3` (Pending Audit).
-   **Status Update**: Set student status to `1` (In Camp) and bed status to `occupied`.

### 2. Renewal Process
-   **Trigger**: Triggered for students whose `checkoutDate` is within 7 days or already passed.
-   **Application**: Create a `tuition` record with `source: '学费(续住)'`.
-   **Locking**: Set bed status to `2` (Reserved/Pending Audit) until payment is confirmed.
-   **Extension**: Upon audit approval, update student's `checkoutDate`.

### 3. Room Change (换房)
-   **Process**: Releases current bed and reserves new bed.
-   **Audit**: Requires financial audit if there is a price difference.
-   **Status**: Managed via `POST /rooms/apply-change-bed`.

### 4. Checkout (离营)
-   **Validation**: Check for outstanding fees or items.
-   **Release**: Set student status to `left_camp`, clear `bedId`, and set bed status to `available`.

## Data Model References

-   `student`: `stuId`, `status`, `campId`, `checkinDate`, `checkoutDate`, `bedId`.
-   `room` & `bed`: `roomId`, `bedId`, `stuId`, `status` (1: Available, 2: Reserved, 3: Occupied).
-   `tuition`: Financial records linking lifecycle events to payments.

## Implementation Entry Points

-   Services: `src/service/student.ts`, `src/service/room.ts`.
-   Handlers: `src/mocks/handlers/student.ts`, `src/mocks/handlers/room.ts`.
-   UI: `app/student/list/page.tsx`, `app/room/status/page.tsx`.

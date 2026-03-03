---
name: "coach-performance-manager"
description: "Calculates and manages coach performance metrics including recruitment, private coaching, and renewal actuals vs goals. Invoke when modifying performance targets or analyzing coach achievements."
---

# Coach Performance Manager

This skill handles the complex logic of calculating actual performance metrics for coaches by aggregating data from various financial and service records.

## Core Responsibilities

1.  **Recruitment Actuals (招生业绩)**:
    -   Calculated from `tuition` records where `source` includes "入住" (Check-in).
    -   Must match the coach's `salespersonId` and the specific `month`.
    -   Status must be `paid` (1) or `pending_audit` (3).

2.  **Private Coaching Actuals (私教业绩)**:
    -   Calculated from `stuPrivateOrders`.
    -   Aggregated by `bookingCoachId` and `orderTime` (month).
    -   Status must be "已完成" (Completed) or "上课中" (In Progress).
    -   **Important**: Must filter by `campId` by joining with the `student` collection since orders don't have direct camp IDs.

3.  **Renewal Actuals (续住业绩)**:
    -   Calculated from `tuition` records where `source` includes "续住" (Renewal).
    -   Aggregated by `salespersonId`, `month`, and `campId`.

4.  **Goal Management**:
    -   Ensures performance goals are associated with a specific `campId`.
    -   Validates that goal types (e.g., renewal type: amount vs person-days) are handled correctly in summaries.

## Data Filtering Rules

-   **Camp Isolation**: Always ensure metrics are filtered by the selected `campId`.
-   **Role-Based Access**: 
    -   SuperAdmins can view and edit all camp goals.
    -   CampAdmins can only view/edit their own camp.
    -   Coaches can only view their own performance.

## Implementation Details

-   **Backend (MSW)**: Logic is implemented in `src/mocks/handlers/performance.ts`.
-   **Frontend**: Utilizes `getPerformanceStats` and `getPerformanceGoals` services.
-   **UI**: Integrated into `app/coach/performance/page.tsx` and the Dashboard `app/page.tsx`.

## Example Calculation Logic

```typescript
// Recruitment Actual Calculation
const recruitmentActual = tuitions
  .filter((t) => 
    t.salespersonId === goal.coachId && 
    t.date.startsWith(goal.month) && 
    t.source.includes('入住') &&
    (t.status === 'paid' || t.status === 3) &&
    t.campId === goal.campId
  )
  .reduce((sum, t) => sum + t.amount, 0);
```

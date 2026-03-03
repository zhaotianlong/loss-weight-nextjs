---
name: "camp-operation-analyzer"
description: "Analyzes camp operational data including duty statistics, renewal rates, and revenue predictions. Invoke when generating management reports or evaluating operational efficiency."
---

# Camp Operation Analyzer

This skill provides high-level data insights and operational analytics for the fitness camp management.

## Analytical Domains

### 1. Duty & Workload Statistics
-   **Metrics**: Total duty counts, total hours, and workload distribution among staff.
-   **Efficiency**: Identifies workload imbalances and peaks in activity.
-   **Trigger**: Generating monthly staff workload reports or optimizing schedule distribution.

### 2. Renewal Rate Analysis
-   **Logic**: Renewal Rate = (Number of Renewed Students / Total Expiring Students) * 100%.
-   **Context**: Linked to `student` (checkout dates) and `tuition` (renewal sources).
-   **Trigger**: Evaluating camp retention performance.

### 3. Revenue Prediction
-   **Factors**: Current student count, upcoming renewals (7-day window), and historical average private coaching sales.
-   **logic**: Summarizes `monthlyTuition` and `monthlyPrivateCoaching` from the `performance` service.
-   **Trigger**: Financial planning or dashboard metric forecasting.

## Implementation Details

-   **Data Sources**: `tuition`, `student`, `duty`, `stuPrivateOrders`.
-   **Dashboard Integration**: Powers the core metrics in `app/page.tsx`.
-   **Back-end Logic**: Implemented in `src/mocks/handlers/performance.ts` and `src/mocks/handlers/duty.ts`.

## Key Insights Example

-   "1月份共值班62次，平均每名员工15.5次，分布均衡。"
-   "本月预期学费收入：XXXX元（含已支付及7天内待续费）。"

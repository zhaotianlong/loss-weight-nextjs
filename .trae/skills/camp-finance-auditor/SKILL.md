---
name: "camp-finance-auditor"
description: "Handles complex audit logic for money and room changes (check-in, room change, refund). Invoke when modifying tuition, renewal, or bed status rollback."
---

# 营地财务审计员

本技能专门用于处理减肥训练营中复杂的财务与房源联动逻辑。

## 核心职责
1. **入住审核逻辑**：校验学费记录，审核通过后自动分配床位并更新学员状态。
2. **换房审计**：处理原床位释放、新床位锁定、差价计算及财务流水生成。
3. **状态回滚**：当财务申请被拒绝时，确保床位状态从“预留审核中”安全恢复。

## 调用指南
- 当用户要求修改 `src/mocks/handlers/tuition.ts` 时。
- 当涉及 `applyCheckin` 或 `applyChangeBed` 的业务流变更时。
- 在实现退费或续费逻辑时。

## 关键代码参考
- 财务状态：`1-已支付, 2-未支付, 3-待审核, 4-已拒绝`。
- 逻辑务必包含对 `addItem('tuition', ...)` 的调用。

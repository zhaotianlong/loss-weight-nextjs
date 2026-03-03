---
name: "camp-scheduler"
description: "Manages coach duty, course schedules, and student routines, checking for conflicts. Invoke when modifying coach duty or student schedules."
---

# 封闭式排班调度员

本技能负责协调训练营内的人员流动、课程排期及值班安排，确保营地 24 小时有序运行。

## 核心职责
1. **教练值班调度**：确保每个营地每天都有教练值班，处理跨天值班逻辑。
2. **课程冲突检测**：检查教练是否在同一时间段被分配了多个私教课或大课。
3. **学员日程生成**：结合菜谱时间、训练时间及休息时间生成学员每日动态日程。

## 调用指南
- 当用户要求修改 `src/mock/data/duty.ts` 或 `studentSchedule.ts` 时。
- 当涉及教练请假或课程调期逻辑时。
- 在实现营地日历视图功能时。

## 业务规则
- 值班类型：`白班 (08:00-20:00)`, `晚班 (20:00-08:00)`。
- 强制休息：连续值班不得超过 24 小时。

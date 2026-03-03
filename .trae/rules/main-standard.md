---
alwaysApply: false
description: 
---
# 封闭式减肥训练营开发规范

## 项目背景
本项目是为封闭式减肥训练营设计的管理系统，核心业务包括学员生命周期管理、房源财务审计闭环、营养配餐及教练业绩考核。

## 技术规范
- **前端**: Next.js (App Router), Ant Design, ProComponents.
- **Mock**: 使用 MSW (Mock Service Worker) 拦截请求，数据存储在 `src/mock/data`。
- **状态管理**: 优先使用 URL 状态和 React Context，复杂业务逻辑封装在 `src/service`。

## 业务核心准则
1. **财务审计闭环**: 
   - 任何涉及房源变动（入住、换房）或费用产生的操作，必须先创建状态为 `pending` (3) 的财务记录。
   - 只有财务审核通过后，才能更新床位和学员的实际物理状态。
2. **数据一致性**: 
   - 床位状态 `status`: 1-正常, 2-预留审核中, 3-维护中。
   - 学员状态 `status`: 1-训练中, 2-已结营, 3-待入营。
3. **安全与权限**:
   - 超管 (SuperAdmin) 可跨营地操作。
   - 营地管理员仅限操作所属 `campId` 的数据。

## UI/UX 要求
- 列表页统一使用 `ProTable`。
- 金额显示必须带 `¥` 符号，且保留两位小数。
- 关键删除操作必须使用 `Popconfirm`。

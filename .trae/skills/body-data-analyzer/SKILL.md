---
name: "body-data-analyzer"
description: "Analyzes student body data (height, weight, body fat) to generate trends and alerts. Invoke when processing body data or generating analysis reports."
---

# 身体数据分析专家

本技能用于处理学员的各项体测指标，并提供科学的减重建议和趋势预测。

## 核心职责
1. **BMI 计算**：根据身高体重自动计算 BMI 并匹配健康区间。
2. **趋势分析**：计算周减重率、月减重进度，并与目标体重对比。
3. **异常预警**：检测体重异常波动或长期停滞，提示教练介入。

## 调用指南
- 当用户要求修改 `src/mock/data/stuBodyData.ts` 或相关图表组件时。
- 当需要生成学员减重周报/月报逻辑时。
- 在实现学员入营体测表单时。

## 算法逻辑
- 减重进度 = (初始体重 - 当前体重) / (初始体重 - 目标体重) * 100%。
- 建议减重速率：每周 0.5kg - 1.5kg。

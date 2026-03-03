import { http, ApiResponse } from '@/lib/request';
import type { PerformanceGoal } from '@/mock/data/performance';

export interface PerformanceGoalParams {
  page?: number;
  pageSize?: number;
  campId?: number;
  coachId?: string;
  month?: string;
}

export interface PerformanceStatsParams {
  campId?: number;
  month?: string;
}

/**
 * 获取业绩目标列表
 */
export const getPerformanceGoals = (params?: PerformanceGoalParams): Promise<ApiResponse<PerformanceGoal[]>> => {
  return http.get<PerformanceGoal[]>('/performance/goals', { params });
};

/**
 * 创建业绩目标
 */
export const createPerformanceGoal = (data: Omit<PerformanceGoal, 'id' | 'createTime' | 'updateTime'>): Promise<ApiResponse<PerformanceGoal>> => {
  return http.post<PerformanceGoal>('/performance/goals', data);
};

/**
 * 更新业绩目标
 */
export const updatePerformanceGoal = (id: number, data: Partial<PerformanceGoal>): Promise<ApiResponse<PerformanceGoal>> => {
  return http.put<PerformanceGoal>(`/performance/goals/${id}`, data);
};

/**
 * 删除业绩目标
 */
export const deletePerformanceGoal = (id: number): Promise<ApiResponse<void>> => {
  return http.delete<void>(`/performance/goals/${id}`);
};

/**
 * 获取业绩统计数据
 */
export const getPerformanceStats = (params?: PerformanceStatsParams): Promise<ApiResponse<any>> => {
  return http.get<any>('/performance/stats', { params });
};

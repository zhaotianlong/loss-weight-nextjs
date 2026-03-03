/**
 * 学费管理相关接口
 */
import { http, ApiResponse } from '@/lib/request';

export interface Tuition {
  id: number;
  stuId?: number;
  studentName?: string; // 学员名称
  campId: number;
  type: 'income' | 'expense'; // 类型：收入或支出
  source: string; // 来源
  amount: number;
  originalAmount?: number; // 原价
  actualAmount?: number;   // 实际金额
  paymentDate?: string;
  dueDate: string;
  status: number; // 0: 待支付, 1: 已支付, 2: 已逾期, 3: 待审核
  description?: string;
  createTime?: string;
  updateTime?: string;
  applyInfo?: any; // 存储申请入住/续费的详细参数
}

/**
 * 审核财务记录
 */
export const approveTuition = (id: number): Promise<ApiResponse<void>> => {
  return http.post<void>(`/tuition/${id}/approve`);
};

/**
 * 拒绝财务记录
 */
export const rejectTuition = (id: number): Promise<ApiResponse<void>> => {
  return http.post<void>(`/tuition/${id}/reject`);
};

export interface TuitionRenewal {
  id: number;
  stuId: number;
  originalTuitionId: number;
  amount: number;
  paymentDate?: string;
  dueDate: string;
  status: number;
}

export interface TuitionListParams {
  page?: number;
  pageSize?: number;
  stuId?: number;
  campId?: number;
  status?: number;
}

/**
 * 获取学费列表
 */
export const getTuitionList = (params?: TuitionListParams): Promise<ApiResponse<Tuition[]>> => {
  return http.get<Tuition[]>('/tuition', { params });
};

/**
 * 创建学费记录
 */
export const createTuition = (data: Omit<Tuition, 'id'>): Promise<ApiResponse<Tuition>> => {
  return http.post<Tuition>('/tuition', data);
};

/**
 * 更新学费记录
 */
export const updateTuition = (id: number, data: Partial<Tuition>): Promise<ApiResponse<Tuition>> => {
  return http.put<Tuition>(`/tuition/${id}`, data);
};

/**
 * 删除学费记录
 */
export const deleteTuition = (id: number): Promise<ApiResponse<void>> => {
  return http.delete<void>(`/tuition/${id}`);
};

/**
 * 获取续费列表
 */
export const getTuitionRenewalList = (params?: { stuId?: number }): Promise<ApiResponse<TuitionRenewal[]>> => {
  return http.get<TuitionRenewal[]>('/tuition/renewal', { params });
};

/**
 * 创建续费记录
 */
export const createTuitionRenewal = (data: Omit<TuitionRenewal, 'id'>): Promise<ApiResponse<TuitionRenewal>> => {
  return http.post<TuitionRenewal>('/tuition/renewal', data);
};

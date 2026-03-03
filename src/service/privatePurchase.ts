/**
 * 学员私教购买记录相关接口
 */
import { http, ApiResponse } from '@/lib/request';

export interface PrivatePurchase {
  purchaseId: number;
  stuId: number;
  courseId: number;
  quantity: number;
  totalPrice: number;
  purchaseDate: string;
  status: number;
}

export interface PrivatePurchaseListParams {
  page?: number;
  pageSize?: number;
  stuId?: number;
  coachId?: string;
  courseId?: number;
  status?: number;
}

/**
 * 获取私教购买记录列表
 */
export const getPrivatePurchaseList = (params?: PrivatePurchaseListParams): Promise<ApiResponse<PrivatePurchase[]>> => {
  return http.get<PrivatePurchase[]>('/private-purchases', { params });
};

/**
 * 获取私教购买记录详情
 */
export const getPrivatePurchaseDetail = (id: number): Promise<ApiResponse<PrivatePurchase>> => {
  return http.get<PrivatePurchase>(`/private-purchases/${id}`);
};

/**
 * 创建私教购买记录
 */
export const createPrivatePurchase = (data: Omit<PrivatePurchase, 'purchaseId'>): Promise<ApiResponse<PrivatePurchase>> => {
  return http.post<PrivatePurchase>('/private-purchases', data);
};

/**
 * 更新私教购买记录
 */
export const updatePrivatePurchase = (id: number, data: Partial<PrivatePurchase>): Promise<ApiResponse<PrivatePurchase>> => {
  return http.put<PrivatePurchase>(`/private-purchases/${id}`, data);
};

/**
 * 删除私教购买记录
 */
export const deletePrivatePurchase = (id: number): Promise<ApiResponse<void>> => {
  return http.delete<void>(`/private-purchases/${id}`);
};

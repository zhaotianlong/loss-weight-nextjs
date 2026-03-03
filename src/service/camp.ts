/**
 * 营地管理相关接口
 */
import { http, ApiResponse } from '@/lib/request';

export interface Camp {
  campId: number;
  campName: string;
  address: string;
  capacity: number;
  currentNum: number;
  contactPerson: string;
  contactPhone: string;
  status: number;
  createDate?: string | null;
  openDate?: string | null;
  closeDate?: string | null;
  remark?: string | null;
  createTime?: string;
  updateTime?: string;
}

export interface CampListParams {
  page?: number;
  pageSize?: number;
  campName?: string;
  address?: string;
  status?: number;
}

/**
 * 获取营地列表
 */
export const getCampList = (params?: CampListParams): Promise<ApiResponse<Camp[]>> => {
  return http.get<Camp[]>('/camps', { params });
};

/**
 * 获取营地详情
 */
export const getCampDetail = (id: number): Promise<ApiResponse<Camp>> => {
  return http.get<Camp>(`/camps/${id}`);
};

/**
 * 创建营地
 */
export const createCamp = (data: Omit<Camp, 'campId'>): Promise<ApiResponse<Camp>> => {
  return http.post<Camp>('/camps', data);
};

/**
 * 更新营地
 */
export const updateCamp = (id: number, data: Partial<Camp>): Promise<ApiResponse<Camp>> => {
  return http.put<Camp>(`/camps/${id}`, data);
};

/**
 * 删除营地
 */
export const deleteCamp = (id: number): Promise<ApiResponse<void>> => {
  return http.delete<void>(`/camps/${id}`);
};

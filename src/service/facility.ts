
import { http, ApiResponse } from '@/lib/request';
import { Facility } from '@/mock/data/facility';

export interface FacilityListParams {
  page?: number;
  pageSize?: number;
  campId?: number;
  name?: string;
}

/**
 * 获取设施列表
 */
export const getFacilityList = (params?: FacilityListParams): Promise<ApiResponse<Facility[]>> => {
  return http.get<Facility[]>('/facilities', { params });
};

/**
 * 获取设施详情
 */
export const getFacilityDetail = (id: number): Promise<ApiResponse<Facility>> => {
  return http.get<Facility>(`/facilities/${id}`);
};

/**
 * 创建设施
 */
export const createFacility = (data: Omit<Facility, 'id' | 'createTime' | 'updateTime'>): Promise<ApiResponse<Facility>> => {
  return http.post<Facility>('/facilities', data);
};

/**
 * 更新设施
 */
export const updateFacility = (id: number, data: Partial<Facility>): Promise<ApiResponse<Facility>> => {
  return http.put<Facility>(`/facilities/${id}`, data);
};

/**
 * 删除设施
 */
export const deleteFacility = (id: number): Promise<ApiResponse<void>> => {
  return http.delete<void>(`/facilities/${id}`);
};

/**
 * 学员入住记录相关接口
 */
import { http, ApiResponse } from '@/lib/request';

export interface Checkin {
  checkinId: number;
  stuId: number;
  campId: number;
  checkinDate: string;
  checkinTime?: string;
  status: number;
}

export interface CheckinListParams {
  page?: number;
  pageSize?: number;
  stuId?: number;
  campId?: number;
  checkinDate?: string;
  status?: number;
}

/**
 * 获取入住记录列表
 */
export const getCheckinList = (params?: CheckinListParams): Promise<ApiResponse<Checkin[]>> => {
  return http.get<Checkin[]>('/checkins', { params });
};

/**
 * 获取入住记录详情
 */
export const getCheckinDetail = (id: number): Promise<ApiResponse<Checkin>> => {
  return http.get<Checkin>(`/checkins/${id}`);
};

/**
 * 创建入住记录
 */
export const createCheckin = (data: Omit<Checkin, 'checkinId'>): Promise<ApiResponse<Checkin>> => {
  return http.post<Checkin>('/checkins', data);
};

/**
 * 更新入住记录
 */
export const updateCheckin = (id: number, data: Partial<Checkin>): Promise<ApiResponse<Checkin>> => {
  return http.put<Checkin>(`/checkins/${id}`, data);
};

/**
 * 删除入住记录
 */
export const deleteCheckin = (id: number): Promise<ApiResponse<void>> => {
  return http.delete<void>(`/checkins/${id}`);
};

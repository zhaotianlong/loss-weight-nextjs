/**
 * 学员身体数据相关接口
 */
import { http, ApiResponse } from '@/lib/request';

export interface BodyData {
  recordId: number;
  stuId: number;
  weight: number; // 体重 kg
  bmi: number; // BMI指数
  fatRate?: number; // 体脂率 %
  muscleRate?: number; // 肌肉率 %
  muscleMass?: number; // 肌肉量 kg
  waistCircumference?: number; // 腰围 cm
  hipCircumference?: number; // 臀围 cm
  chestCircumference?: number; // 胸围 cm
  armCircumference?: number; // 臂围 cm
  legCircumference?: number; // 腿围 cm
  height?: number; // 身高 cm
  measureType?: string; // 测量类型（入营测量、周测、月测等）
  note?: string; // 备注
  measuredAt: string; // 测量日期
}

export interface BodyDataListParams {
  page?: number;
  pageSize?: number;
  stuId?: number;
  measuredAt?: string;
}

/**
 * 获取身体数据列表
 */
export const getBodyDataList = (params?: BodyDataListParams): Promise<ApiResponse<BodyData[]>> => {
  return http.get<BodyData[]>('/stu-body-data', { params });
};

/**
 * 获取身体数据详情
 */
export const getBodyDataDetail = (id: number): Promise<ApiResponse<BodyData>> => {
  return http.get<BodyData>(`/stu-body-data/${id}`);
};

/**
 * 创建身体数据记录
 */
export const createBodyData = (data: Omit<BodyData, 'recordId'>): Promise<ApiResponse<BodyData>> => {
  return http.post<BodyData>('/stu-body-data', data);
};

/**
 * 更新身体数据记录
 */
export const updateBodyData = (id: number, data: Partial<BodyData>): Promise<ApiResponse<BodyData>> => {
  return http.put<BodyData>(`/stu-body-data/${id}`, data);
};

/**
 * 删除身体数据记录
 */
export const deleteBodyData = (id: number): Promise<ApiResponse<void>> => {
  return http.delete<void>(`/stu-body-data/${id}`);
};

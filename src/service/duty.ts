/**
 * 值班管理相关接口
 */
import { http, ApiResponse } from '@/lib/request';

export interface Duty {
  id: number;
  coach: string;
  coachIds?: string[];
  courseId?: number;
  date: string;
  timeSlot: string;
  location?: string;
  status: string;
  campId: number;
  type?: string;
  mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack'; // 菜谱类型
  calories?: number; // 热量 (Kcal)
  protein?: number; // 蛋白质 (g)
  carbs?: number; // 碳水 (g)
  fat?: number; // 脂肪 (g)
  remark?: string;
  createTime?: string;
  updateTime?: string;
}

export interface DutyListParams {
  page?: number;
  pageSize?: number;
  coach?: string;
  coachIds?: string[];
  date?: string;
  location?: string;
  status?: string;
  campId?: number;
  type?: string;
  mealType?: string;
}

/**
 * 批量创建菜谱 (支持周循环)
 */
export interface WeeklyMealPattern {
  dayOfWeek: number; // 1-7 代表周一到周日
  meals: Array<{
    mealType: string;
    timeSlot: string;
    location: string;
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    remark?: string;
  }>;
}

export const batchCreateRecipes = (data: { 
  campId: number; 
  startDate: string; // 循环开始日期
  endDate: string;   // 循环截止日期
  patterns: WeeklyMealPattern[];
}): Promise<ApiResponse<void>> => {
  return http.post<void>('/duties/batch-recipes', data);
};

/**
 * 批量创建排班 (支持周循环)
 */
export interface WeeklySchedulePattern {
  dayOfWeek: number; // 1-7 代表周一到周日
  items: Array<{
    type: string;
    mealType?: string;
    timeSlot: string;
    location?: string;
    courseId?: number;
    coachIds?: string[];
    coach?: string;
    remark?: string;
  }>;
}

export const batchCreateSchedules = (data: {
  campId: number;
  startDate: string;
  endDate: string;
  patterns: WeeklySchedulePattern[];
}): Promise<ApiResponse<void>> => {
  return http.post<void>('/duties/batch-schedules', data);
};

/**
 * 获取值班列表
 */
export const getDutyList = (params?: DutyListParams): Promise<ApiResponse<Duty[]>> => {
  return http.get<Duty[]>('/duties', { params });
};

/**
 * 获取值班详情
 */
export const getDutyDetail = (id: number): Promise<ApiResponse<Duty>> => {
  return http.get<Duty>(`/duties/${id}`);
};

/**
 * 创建值班记录
 */
export const createDuty = (data: Omit<Duty, 'id'>): Promise<ApiResponse<Duty>> => {
  return http.post<Duty>('/duties', data);
};

/**
 * 更新值班记录
 */
export const updateDuty = (id: number, data: Partial<Duty>): Promise<ApiResponse<Duty>> => {
  return http.put<Duty>(`/duties/${id}`, data);
};

/**
 * 删除值班记录
 */
export const deleteDuty = (id: number): Promise<ApiResponse<void>> => {
  return http.delete<void>(`/duties/${id}`);
};

/**
 * 课程管理相关接口
 */
import { http, ApiResponse } from '@/lib/request';

export interface PrivateCourse {
  courseId: number;
  campId: number; // 新增字段
  type: '常规' | '拉伸' | '瑜伽' | '普拉提' | '筋膜刀';
  paymentType: string;
  price?: number;
  monthlyPrice?: number;
  monthlySessions?: number;
  duration: number;
  status: number;
  createTime?: string;
  updateTime?: string;
  coaches?: {
    id: string;
    name: string;
    gender: '男' | '女';
  }[];
}

export interface PublicCourse {
  courseId: number;
  campId: number;
  title: string;
  coachId: string;
  schedule?: string;
  location?: string;
  maxParticipants?: number;
  currentParticipants?: number;
  status: number;
  createTime?: string;
  updateTime?: string;
  coaches?: {
    id: string;
    name: string;
    gender: '男' | '女';
  }[];
}

export interface PrivateCourseListParams {
  page?: number;
  pageSize?: number;
  type?: string;
  paymentType?: string;
  status?: number;
  campId?: number; // 新增筛选参数
}

export interface PublicCourseListParams {
  page?: number;
  pageSize?: number;
  campId?: number;
  title?: string;
  coachId?: string;
}

/**
 * 获取私教课列表
 */
export const getPrivateCourseList = (params?: PrivateCourseListParams): Promise<ApiResponse<PrivateCourse[]>> => {
  return http.get<PrivateCourse[]>('/private-courses', { params });
};

/**
 * 创建私教课
 */
export const createPrivateCourse = (data: Omit<PrivateCourse, 'courseId'>): Promise<ApiResponse<PrivateCourse>> => {
  return http.post<PrivateCourse>('/private-courses', data);
};

/**
 * 更新私教课
 */
export const updatePrivateCourse = (id: number, data: Partial<PrivateCourse>): Promise<ApiResponse<PrivateCourse>> => {
  return http.put<PrivateCourse>(`/private-courses/${id}`, data);
};

/**
 * 删除私教课
 */
export const deletePrivateCourse = (id: number): Promise<ApiResponse<void>> => {
  return http.delete<void>(`/private-courses/${id}`);
};

/**
 * 获取公共课列表
 */
export const getPublicCourseList = (params?: PublicCourseListParams): Promise<ApiResponse<PublicCourse[]>> => {
  return http.get<PublicCourse[]>('/courses', { params });
};

/**
 * 创建公共课
 */
export const createPublicCourse = (data: Omit<PublicCourse, 'courseId'>): Promise<ApiResponse<PublicCourse>> => {
  return http.post<PublicCourse>('/courses', data);
};

/**
 * 更新公共课
 */
export const updatePublicCourse = (id: number, data: Partial<PublicCourse>): Promise<ApiResponse<PublicCourse>> => {
  return http.put<PublicCourse>(`/courses/${id}`, data);
};

/**
 * 删除公共课
 */
export const deletePublicCourse = (id: number): Promise<ApiResponse<void>> => {
  return http.delete<void>(`/courses/${id}`);
};

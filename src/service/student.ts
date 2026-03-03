/**
 * 学员管理相关接口
 */
import { http, ApiResponse } from '@/lib/request';

export interface Student {
  stuId: number;
  name: string;
  gender: 'male' | 'female';
  idCard: string;
  phone: string;
  campId: number;
  bedId?: number;
  checkinDate: string;
  checkoutDate?: string | null;
  dietTaboo?: string;
  paymentStatus: number;
  status: number; // 1: 在训, 2: 暂停, 3: 结业
  initialWeight?: number; // 入营体重
  currentWeight?: number; // 当前体重
  initialFatRate?: number; // 入营体脂率
  currentFatRate?: number; // 当前体脂率
  coachName?: string; // 负责教练
  coachId?: string; // 负责教练ID
  createTime?: string;
  updateTime?: string;
}

export interface StudentListParams {
  page?: number;
  pageSize?: number;
  name?: string;
  phone?: string;
  campId?: number;
  status?: number;
}

/**
 * 获取学员列表
 */
export const getStudentList = (params?: StudentListParams): Promise<ApiResponse<Student[]>> => {
  return http.get<Student[]>('/students', { params });
};

/**
 * 获取学员详情
 */
export const getStudentDetail = (id: number): Promise<ApiResponse<Student>> => {
  return http.get<Student>(`/students/${id}`);
};

/**
 * 创建学员
 */
export const createStudent = (data: Omit<Student, 'stuId'>): Promise<ApiResponse<Student>> => {
  return http.post<Student>('/students', data);
};

/**
 * 更新学员
 */
export const updateStudent = (id: number, data: Partial<Student>): Promise<ApiResponse<Student>> => {
  return http.put<Student>(`/students/${id}`, data);
};

/**
 * 删除学员
 */
export const deleteStudent = (id: number): Promise<ApiResponse<void>> => {
  return http.delete<void>(`/students/${id}`);
};

/**
 * 申请学员续租参数
 */
export interface ApplyRenewalParams {
  stuId: number;
  days: number; // 续租天数
  originalAmount: number;
  actualAmount: number;
  salespersonId?: string;
}

export const applyRenewStudent = (params: ApplyRenewalParams): Promise<ApiResponse<void>> => {
  return http.post<void>('/students/apply-renew', params);
};

/**
 * 学员私教记录
 */
export interface StuPrivateRecord {
  id: string | number;
  orderId: string;
  courseId: number;
  courseType: string;
  paymentType: '包月' | '单节' | '常规' | '拉伸' | '瑜伽';
  originalPrice: number;
  discountPrice: number;
  totalSessions: number;
  usedSessions: number;
  status: '开单' | '上课中' | '已完成';
  orderTime: string;
  closeTime?: string;
  totalPrice: number;
  bookingCoach: string;
  bookingCoachId?: string;
  classRecords?: StuClassRecord[];
}

export interface StuClassRecord {
  id: string | number;
  stuId: number;
  orderId: string;
  recordId: string;
  teachingCoach: string;
  teachingCoachId?: string;
  location: string;
  startTime: string;
  endTime: string;
  photoUrl?: string;
}

export const getStuPrivateRecords = (stuId: number): Promise<ApiResponse<StuPrivateRecord[]>> => {
  return http.get<StuPrivateRecord[]>(`/students/${stuId}/private-records`);
};

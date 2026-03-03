import { http, ApiResponse } from '@/lib/request';

export interface CoachStudentRelation {
  id: number;
  campId: number;
  coachId: string;
  coachName: string;
  studentId: number;
  studentName: string;
  startDate: string;
  endDate?: string;
  status: 'active' | 'ended' | 'transferred';
  createTime: string;
  updateTime: string;
}

export interface CoachOption {
  label: string;
  value: string;
  campId: number;
}

export interface Coach {
  empId: string;
  name: string;
  gender: '男' | '女';
  phone: string;
  role: string;
  campId: number;
  qualification?: string;
  dutyArea?: string;
  hireDate?: string;
  status: number;
  createTime?: string;
  updateTime?: string;
}

// 获取分配列表
export async function getCoachStudentList(params: {
  page?: number;
  pageSize?: number;
  campId?: number;
  coachName?: string;
  studentName?: string;
  status?: string;
}) {
  return http.get<CoachStudentRelation[]>('/coach/student-list', { params });
}

export interface CoachListParams {
  campId?: number;
}

/**
 * 获取教练列表 (下拉选择专用)
 */
export const getCoachList = (params?: CoachListParams): Promise<ApiResponse<CoachOption[]>> => {
  return http.get<CoachOption[]>('/coach/list', { params });
};

// 获取教练列表 (管理页面使用)
export async function getCoaches(params: {
  page?: number;
  pageSize?: number;
  name?: string;
  campId?: number;
}) {
  return http.get<Coach[]>('/coaches', { params });
}

// 创建教练
export async function createCoach(data: Partial<Coach>) {
  return http.post<Coach>('/coaches', data);
}

// 更新教练
export async function updateCoach(id: string, data: Partial<Coach>) {
  return http.put<Coach>(`/coaches/${id}`, data);
}

// 删除教练
export async function deleteCoach(id: string) {
  return http.delete<void>(`/coaches/${id}`);
}

// 获取负责的学员
export async function getResponsibleStudents(coachId: string) {
  return http.get<any[]>(`/coach/responsible-students/${coachId}`);
}

// 获取课程安排
export async function getCoachCourses(coachId: string, type: 'private' | 'public') {
  return http.get<any[]>(`/coach/courses/${type}/${coachId}`);
}

// 获取教练业绩
export async function getCoachPerformance(coachId: string, type: 'course' | 'enrollment' | 'stats') {
  return http.get<any>(`/coach/performance/${type}/${coachId}`);
}

// 安排查房
export async function arrangeRoomInspection(data: any) {
  return http.post('/coach/room-inspection', data);
}

// 分配/更换教练
export async function assignStudentToCoach(data: {
  studentId: number;
  coachId: string;
  startDate: string;
}) {
  return http.post<CoachStudentRelation>('/coach/assign', data);
}

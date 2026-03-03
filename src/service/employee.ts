/**
 * 员工管理相关接口
 */
import { http, ApiResponse } from '@/lib/request';

export interface Employee {
  empId: string;
  name: string;
  phone: string;
  role: string; // 统一使用 role 字段
  campId: number;
  qualification?: string;
  dutyArea?: string;
  hireDate: string;
  status: number;
  baseSalary: number;
  allowCommission: boolean;
}

export interface EmployeeListParams {
  page?: number;
  pageSize?: number;
  name?: string;
  role?: string; // 统一使用 role 字段
  campId?: number;
  status?: number;
}

/**
 * 获取员工列表
 */
export const getEmployeeList = (params?: EmployeeListParams): Promise<ApiResponse<Employee[]>> => {
  return http.get<Employee[]>('/users', { params });
};

/**
 * 获取员工详情
 */
export const getEmployeeDetail = (id: string): Promise<ApiResponse<Employee>> => {
  return http.get<Employee>(`/users/${id}`);
};

/**
 * 创建员工
 */
export const createEmployee = (data: Omit<Employee, 'empId'>): Promise<ApiResponse<Employee>> => {
  return http.post<Employee>('/users', data);
};

/**
 * 更新员工
 */
export const updateEmployee = (id: string, data: Partial<Employee>): Promise<ApiResponse<Employee>> => {
  return http.put<Employee>(`/users/${id}`, data);
};

/**
 * 删除员工
 */
export const deleteEmployee = (id: string): Promise<ApiResponse<void>> => {
  return http.delete<void>(`/users/${id}`);
};

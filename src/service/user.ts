/**
 * 用户管理相关接口（管理员/员工）
 */
import { http, ApiResponse } from '@/lib/request';

export interface User {
  userId?: string;
  id?: string;
  name: string;
  email?: string;
  phone: string;
  role: string;
  status: number;
  avatar?: string; // 个人头像
  idNumber?: string; // 身份号（身份证号）
  address?: string; // 居住地址
  attachments?: string[]; // 附件（文件URL数组）
  campId?: number;
  campName?: string;
  password?: string; // 管理员角色的登录密码（仅创建/编辑时使用）
  createTime?: string;
  updateTime?: string;
  baseSalary?: number;
  allowCommission?: boolean;
}

export interface UserListParams {
  page?: number;
  pageSize?: number;
  name?: string;
  phone?: string;
  email?: string;
  role?: string;
  status?: number;
  campId?: number;
}

/**
 * 获取用户列表
 */
export const getUserList = (params?: UserListParams): Promise<ApiResponse<User[]>> => {
  return http.get<User[]>('/users', { params });
};

/**
 * 获取用户详情
 */
export const getUserDetail = (id: string): Promise<ApiResponse<User>> => {
  return http.get<User>(`/users/${id}`);
};

/**
 * 创建用户
 */
export const createUser = (data: Omit<User, 'userId' | 'id'>): Promise<ApiResponse<User>> => {
  return http.post<User>('/users', data);
};

/**
 * 更新用户
 */
export const updateUser = (id: string, data: Partial<User>): Promise<ApiResponse<User>> => {
  return http.put<User>(`/users/${id}`, data);
};

/**
 * 删除用户
 */
export const deleteUser = (id: string): Promise<ApiResponse<void>> => {
  return http.delete<void>(`/users/${id}`);
};

/**
 * 重置用户密码
 */
export const resetUserPassword = (id: string, newPassword: string): Promise<ApiResponse<void>> => {
  return http.post<void>(`/users/${id}/reset-password`, { newPassword });
};

/**
 * 个人中心相关接口
 */
import { http, ApiResponse } from '@/lib/request';

/**
 * 获取当前用户信息
 */
export const getCurrentUser = (): Promise<ApiResponse<any>> => {
  // TODO: 实际应该从认证系统获取当前用户ID
  const currentUserId = 'emp001'; // 临时使用固定ID
  return http.get(`/users/${currentUserId}`);
};

/**
 * 修改密码
 */
export const changePassword = (
  userId: string,
  oldPassword: string,
  newPassword: string
): Promise<ApiResponse<void>> => {
  return http.post(`/users/${userId}/change-password`, {
    oldPassword,
    newPassword,
  });
};

/**
 * 更新个人资料
 */
export const updateProfile = (userId: string, data: any): Promise<ApiResponse<any>> => {
  return http.put(`/users/${userId}`, data);
};

/**
 * 上传头像
 */
export const uploadAvatar = (userId: string, formData: FormData): Promise<ApiResponse<string>> => {
  return http.post(`/users/${userId}/avatar`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

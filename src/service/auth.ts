/**
 * 认证相关接口
 */
import { http, ApiResponse } from '@/lib/request';

export interface LoginByPasswordParams {
  username?: string;
  phone?: string;
  password: string;
}

export interface LoginByCodeParams {
  phone: string;
  code: string;
}

export interface SendCodeParams {
  phone: string;
}

export interface LoginResponse {
  token: string;
  user: {
    userId: string;
    id: string;
    name: string;
    phone: string;
    email?: string;
    role: string;
    status: number;
    avatar?: string;
  };
}

/**
 * 账号密码登录
 */
export const loginByPassword = (params: LoginByPasswordParams): Promise<ApiResponse<LoginResponse>> => {
  return http.post<LoginResponse>('/auth/login', params);
};

/**
 * 手机号验证码登录
 */
export const loginByCode = (params: LoginByCodeParams): Promise<ApiResponse<LoginResponse>> => {
  return http.post<LoginResponse>('/auth/login-by-code', params);
};

/**
 * 发送验证码
 */
export const sendCode = (params: SendCodeParams): Promise<ApiResponse<{ code: string }>> => {
  return http.post<{ code: string }>('/auth/send-code', params);
};

/**
 * 退出登录
 */
export const logout = (): Promise<ApiResponse<void>> => {
  return http.post<void>('/auth/logout');
};

/**
 * 刷新 token
 */
export const refreshToken = (): Promise<ApiResponse<{ token: string }>> => {
  return http.post<{ token: string }>('/auth/refresh');
};

/**
 * 获取当前用户信息（通过 token）
 */
export const getCurrentUser = (): Promise<ApiResponse<LoginResponse['user']>> => {
  return http.get<LoginResponse['user']>('/auth/me');
};


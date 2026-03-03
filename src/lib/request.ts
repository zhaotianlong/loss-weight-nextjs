/**
 * Axios 请求封装
 * 包含请求拦截器、响应拦截器和通用请求方法
 */
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { message } from 'antd';
import { removeToken, saveRedirectPath } from '@/utils/auth';

// 响应数据结构
export interface ApiResponse<T = any> {
  success?: boolean; // 保留兼容性
  code?: number; // 业务错误码，200 表示成功，其他值表示业务错误
  data: T;
  message?: string; // 保留兼容性
  msg?: string; // 业务错误消息
  meta?: {
    page: number;
    pageSize: number;
    total: number;
    pageCount: number;
  };
}

// 创建 axios 实例
const request: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3002/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    // 添加 token 到请求头
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// 是否正在跳转登录页（防止重复跳转）
let isRedirectingToLogin = false;

// 响应拦截器
request.interceptors.response.use(
  (response: AxiosResponse) => {
    const { data } = response;
    
    // 业务错误处理：HTTP 200 但 code 不为 200
    if (data && typeof data === 'object' && 'code' in data) {
      const responseData = data as ApiResponse;
      if (responseData.code !== undefined && responseData.code !== 200) {
        // 业务错误：显示 msg 或 message
        const errorMsg = responseData.msg || responseData.message || '业务处理失败';
        message.error(errorMsg);
        // 创建一个错误，让后续处理能够捕获
        const error = new Error(errorMsg) as any;
        error.response = response;
        error.isBusinessError = true;
        return Promise.reject(error);
      }
    }
    
    // 兼容旧格式：如果返回的数据结构是 { success, data, message }
    if (data && typeof data === 'object' && 'success' in data) {
      const responseData = data as ApiResponse;
      if (responseData.success === false) {
        const errorMsg = responseData.message || responseData.msg || '请求失败';
        message.error(errorMsg);
        const error = new Error(errorMsg) as any;
        error.response = response;
        error.isBusinessError = true;
        return Promise.reject(error);
      }
    }
    
    // 兼容直接返回 data 的情况
    return response;
  },
  (error: AxiosError) => {
    // 业务错误已经在 response 拦截器中处理，这里不需要重复处理
    if ((error as any).isBusinessError) {
      return Promise.reject(error);
    }
    
    // 处理网络错误（HTTP 状态码错误：4xx、5xx）
    if (error.response) {
      const { status, data } = error.response;
      
      // 检查响应数据中是否包含自定义错误消息
      let customMessage: string | undefined;
      if (data && typeof data === 'object') {
        const responseData = data as any;
        customMessage = responseData.msg || responseData.message;
      }
      
      switch (status) {
        case 400:
          // 网络错误：请求参数错误
          message.error(customMessage || '请求参数错误');
          break;
        case 401:
          // 网络错误：Token 过期或无效，清除 token 并跳转到登录页
          if (typeof window !== 'undefined' && !isRedirectingToLogin) {
            const currentPath = window.location.pathname;
            // 如果当前在登录页，不跳转
            if (currentPath === '/login') {
              break;
            }
            
            isRedirectingToLogin = true;
            removeToken();
            // 保存当前路径
            saveRedirectPath(currentPath);
            message.error('登录已过期，请重新登录');
            setTimeout(() => {
              window.location.href = '/login';
              isRedirectingToLogin = false;
            }, 100);
          }
          break;
        case 403:
          // 网络错误：拒绝访问
          message.error(customMessage || '拒绝访问');
          break;
        case 404:
          // 网络错误：资源不存在
          message.error(customMessage || '请求的资源不存在');
          break;
        case 500:
          // 网络错误：服务器错误
          message.error(customMessage || '服务器错误');
          break;
        default:
          message.error(customMessage || `请求失败: ${status}`);
      }
    } else if (error.request) {
      // 网络错误：请求已发出但没有收到响应
      message.error('网络错误，请检查网络连接');
    } else {
      // 网络错误：请求配置错误
      message.error('请求配置错误');
    }
    
    return Promise.reject(error);
  }
);

// 通用请求方法
export const http = {
  get: <T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    return request.get<ApiResponse<T>>(url, config).then((res) => {
      const data = res.data;
      // 优先检查 code 字段
      if (data && typeof data === 'object' && 'code' in data) {
        return data as ApiResponse<T>;
      }
      // 兼容旧格式 success 字段
      if (data && typeof data === 'object' && 'success' in data) {
        return data as ApiResponse<T>;
      }
      // 默认成功
      return { code: 200, success: true, data: data as T } as ApiResponse<T>;
    });
  },
  
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    return request.post<ApiResponse<T>>(url, data, config).then((res) => {
      const responseData = res.data;
      if (responseData && typeof responseData === 'object' && 'code' in responseData) {
        return responseData as ApiResponse<T>;
      }
      if (responseData && typeof responseData === 'object' && 'success' in responseData) {
        return responseData as ApiResponse<T>;
      }
      return { code: 200, success: true, data: responseData as T } as ApiResponse<T>;
    });
  },
  
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    return request.put<ApiResponse<T>>(url, data, config).then((res) => {
      const responseData = res.data;
      if (responseData && typeof responseData === 'object' && 'code' in responseData) {
        return responseData as ApiResponse<T>;
      }
      if (responseData && typeof responseData === 'object' && 'success' in responseData) {
        return responseData as ApiResponse<T>;
      }
      return { code: 200, success: true, data: responseData as T } as ApiResponse<T>;
    });
  },
  
  delete: <T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    return request.delete<ApiResponse<T>>(url, config).then((res) => {
      const data = res.data;
      if (data && typeof data === 'object' && 'code' in data) {
        return data as ApiResponse<T>;
      }
      if (data && typeof data === 'object' && 'success' in data) {
        return data as ApiResponse<T>;
      }
      return { code: 200, success: true, data: data as T } as ApiResponse<T>;
    });
  },
  
  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    return request.patch<ApiResponse<T>>(url, data, config).then((res) => {
      const responseData = res.data;
      if (responseData && typeof responseData === 'object' && 'code' in responseData) {
        return responseData as ApiResponse<T>;
      }
      if (responseData && typeof responseData === 'object' && 'success' in responseData) {
        return responseData as ApiResponse<T>;
      }
      return { code: 200, success: true, data: responseData as T } as ApiResponse<T>;
    });
  },
};

export default request;

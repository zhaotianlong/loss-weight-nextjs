'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { type User } from '@/service/user';
import { message } from 'antd';
import { useMSW } from '@/mocks/MSWContext';
import { waitForMSW } from '@/lib/mswReady';
import { getToken, removeToken } from '@/utils/auth';
import { getCurrentUser } from '@/service/auth';
import { Permission, hasPermission } from '@/constants/permissions';
import { logger } from '@/utils/logger';

interface UserContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  permissions: Permission[];
  refreshUser: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  logout: () => void;
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;
}

const UserContext = createContext<UserContextType>({
  user: null,
  loading: false,
  isAuthenticated: false,
  permissions: [],
  refreshUser: async () => {},
  updateUser: async () => {},
  logout: () => {},
  hasPermission: () => false,
  hasAnyPermission: () => false,
  hasAllPermissions: () => false,
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  // 如果有 token，初始 loading 应该为 true，表示正在验证用户信息
  const [loading, setLoading] = useState(() => {
    // 客户端环境才检查 token
    if (typeof window !== 'undefined') {
      return !!getToken();
    }
    return false;
  });
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const { isReady: mswReady } = useMSW();

  const refreshUser = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setUser(null);
      setPermissions([]);
      setLoading(false);
      return;
    }

    // 等待 MSW 就绪（开发环境）
    if (process.env.NODE_ENV === 'development') {
      await waitForMSW();
    }

    setLoading(true);
    try {
      // 通过 token 获取当前用户信息
      const res = await getCurrentUser();
      setUser(res.data);
      
      // 根据角色计算权限
      if (res.data.role) {
        const { rolePermissions } = await import('@/constants/permissions');
        const rolePerms = rolePermissions[res.data.role as keyof typeof rolePermissions] || [];
        setPermissions(rolePerms);
      }
    } catch (err: any) {
      logger.error('获取用户信息失败', err, {
        status: err?.response?.status || err?.status,
        pathname: typeof window !== 'undefined' ? window.location.pathname : undefined,
      });
      // 如果获取失败（如 token 过期），清除 token 和用户信息
      // 401 错误会在请求拦截器中处理跳转，这里只清除状态
      if (err?.response?.status === 401 || err?.status === 401) {
        removeToken();
        setUser(null);
        setPermissions([]);
        // 如果不在登录页，跳转会在请求拦截器中处理
      } else {
        // 其他错误也清除状态
        removeToken();
        setUser(null);
        setPermissions([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    removeToken();
    setUser(null);
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }, []);

  const updateUser = useCallback(async (userData: Partial<User>) => {
    if (!user) return;
    
    // 更新本地状态
    setUser((prev) => (prev ? { ...prev, ...userData } : null));
    
    // 刷新服务器数据
    await refreshUser();
  }, [user, refreshUser]);

  useEffect(() => {
    // 等待 MSW 就绪后再获取用户信息
    if (mswReady || process.env.NODE_ENV !== 'development') {
      // 检查是否有 token
      if (getToken()) {
        refreshUser();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mswReady]);

  const isAuthenticated = !!getToken() && !!user;

  // 权限检查方法
  const checkPermission = useCallback((permission: Permission): boolean => {
    if (!user) return false;
    return hasPermission(user.role, permission);
  }, [user]);

  const checkAnyPermission = useCallback((perms: Permission[]): boolean => {
    if (!user) return false;
    return perms.some((perm) => hasPermission(user.role, perm));
  }, [user]);

  const checkAllPermissions = useCallback((perms: Permission[]): boolean => {
    if (!user) return false;
    return perms.every((perm) => hasPermission(user.role, perm));
  }, [user]);

  return (
    <UserContext.Provider value={{ 
      user, 
      loading, 
      isAuthenticated,
      permissions,
      refreshUser, 
      updateUser,
      logout,
      hasPermission: checkPermission,
      hasAnyPermission: checkAnyPermission,
      hasAllPermissions: checkAllPermissions,
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
}

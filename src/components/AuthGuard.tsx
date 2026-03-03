'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { Spin } from 'antd';
import { saveRedirectPath } from '@/utils/auth';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, loading } = useUser();

  useEffect(() => {
    // 登录页面不需要验证
    if (pathname === '/login') {
      return;
    }

    // 如果未登录，保存当前路径并跳转到登录页
    if (!loading && !isAuthenticated) {
      saveRedirectPath(pathname);
      router.push('/login');
    }
  }, [isAuthenticated, loading, pathname, router]);

  // 登录页面直接显示
  if (pathname === '/login') {
    return <>{children}</>;
  }

  // 加载中显示加载状态
  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  // 未登录不显示内容（会跳转到登录页）
  if (!isAuthenticated) {
    return null;
  }

  // 已登录显示内容
  return <>{children}</>;
}


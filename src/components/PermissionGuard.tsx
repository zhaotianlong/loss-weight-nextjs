'use client';

import React from 'react';
import { Result, Button } from 'antd';
import { usePermission } from '@/hooks/usePermission';
import { Permission } from '@/constants/permissions';
import { useRouter } from 'next/navigation';

interface PermissionGuardProps {
  children: React.ReactNode;
  permission?: Permission;
  permissions?: Permission[];
  requireAll?: boolean; // true: 需要所有权限, false: 需要任一权限
  fallback?: React.ReactNode;
}

export default function PermissionGuard({
  children,
  permission,
  permissions,
  requireAll = false,
  fallback,
}: PermissionGuardProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermission();
  const router = useRouter();

  let hasAccess = true;

  if (permission) {
    hasAccess = hasPermission(permission);
  } else if (permissions && permissions.length > 0) {
    hasAccess = requireAll
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);
  }

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <Result
        status="403"
        title="403"
        subTitle="抱歉，您没有权限访问此页面"
        extra={
          <Button type="primary" onClick={() => router.push('/')}>
            返回首页
          </Button>
        }
      />
    );
  }

  return <>{children}</>;
}



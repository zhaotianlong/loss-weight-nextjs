/**
 * 权限检查 Hook
 */
import { useUser } from '@/contexts/UserContext';
import { Permission } from '@/constants/permissions';

/**
 * 权限检查 Hook
 */
export function usePermission() {
  const { hasPermission, hasAnyPermission, hasAllPermissions, user, permissions } = useUser();

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    user,
    permissions,
    isSuperAdmin: user?.role === '超级管理员',
    isCampAdmin: user?.role === '营地管理员',
    isLogisticsAdmin: user?.role === '后勤管理',
    isCoachAdmin: user?.role === '教练管理',
  };
}

/**
 * 检查单个权限
 */
export function useHasPermission(permission: Permission): boolean {
  const { hasPermission } = useUser();
  return hasPermission(permission);
}



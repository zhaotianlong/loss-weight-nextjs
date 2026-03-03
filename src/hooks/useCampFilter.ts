/**
 * 营地过滤相关的 Hook
 * 用于处理非超级管理员的营地数据过滤
 */
import { useUser } from '@/contexts/UserContext';
import { isSuperAdmin } from '@/constants/permissions';
import { useMemo, useCallback } from 'react';

export function useCampFilter() {
  const { user } = useUser();
  
  const isSuper = useMemo(() => {
    return user?.role ? isSuperAdmin(user.role) : false;
  }, [user]);

  const currentCampId = useMemo(() => {
    return user?.campId;
  }, [user]);

  /**
   * 获取应该使用的营地ID
   * 如果是超级管理员，返回请求的campId（如果有）
   * 否则返回当前用户context中的campId
   */
  const getCampIdForQuery = useCallback((requestCampId?: number): number | undefined => {
    if (isSuper) {
      return requestCampId;
    }
    // 非超级管理员强制使用context中的campId
    return currentCampId;
  }, [isSuper, currentCampId]);

  /**
   * 获取搜索表单的默认营地ID
   * 对于所有用户（包括超级管理员），返回当前用户所在的营地ID，用于默认选择
   * 超级管理员可以后续切换查看其他营地的数据
   */
  const getDefaultCampId = useCallback((): number | undefined => {
    return currentCampId;
  }, [currentCampId]);

  /**
   * 是否应该显示营地筛选
   * 只有超级管理员才显示营地筛选
   */
  const shouldShowCampFilter = useCallback((): boolean => {
    return isSuper;
  }, [isSuper]);

  return {
    isSuper,
    currentCampId,
    getCampIdForQuery,
    getDefaultCampId,
    shouldShowCampFilter,
  };
}


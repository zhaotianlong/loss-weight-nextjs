/**
 * 从请求头获取当前用户信息
 * 用于MSW handlers中获取当前登录用户
 */
import { getById } from '@/mock/mockData';

/**
 * 从请求头中提取用户信息
 */
export async function getCurrentUserFromRequest(req: { headers: { get: (name: string) => string | null } }) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.replace('Bearer ', '');
  // 从 token 中提取 empId（实际应该解析 JWT）
  const match = token.match(/mock_token_(\w+)_/);
  if (!match) {
    return null;
  }

  const empId = match[1];
  
  // 获取用户信息
  const employee = await getById('employee', 'empId', empId);
  if (!employee) {
    return null;
  }

  // 获取账号信息以确定角色
  const { getUserAccount } = await import('@/mock/mockData');
  const account = getUserAccount(empId);

  return {
    empId,
    campId: (employee as any).campId,
    role: account?.role || (employee as any).role,
  };
}


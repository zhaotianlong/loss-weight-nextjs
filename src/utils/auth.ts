/**
 * Token 管理工具
 * 只存储 token，用户信息通过接口获取
 */

const TOKEN_KEY = 'auth_token';
const REDIRECT_KEY = 'redirect_path'; // 登录前保存的路径

/**
 * 保存 token
 */
export function setToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token);
  }
}

/**
 * 获取 token
 */
export function getToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(TOKEN_KEY);
  }
  return null;
}

/**
 * 删除 token
 */
export function removeToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(REDIRECT_KEY);
  }
}

/**
 * 检查是否已登录（仅检查 token 是否存在）
 */
export function isAuthenticated(): boolean {
  return !!getToken();
}

/**
 * 保存登录前要访问的路径
 */
export function saveRedirectPath(path: string): void {
  if (typeof window !== 'undefined' && path !== '/login') {
    sessionStorage.setItem(REDIRECT_KEY, path);
  }
}

/**
 * 获取并清除登录前保存的路径
 */
export function getAndClearRedirectPath(): string | null {
  if (typeof window !== 'undefined') {
    const path = sessionStorage.getItem(REDIRECT_KEY);
    sessionStorage.removeItem(REDIRECT_KEY);
    return path;
  }
  return null;
}


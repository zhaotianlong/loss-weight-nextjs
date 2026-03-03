/**
 * MSW 就绪状态管理
 * 用于在请求前检查 MSW 是否已启动
 */

let mswReadyPromise: Promise<boolean> | null = null;
let mswReadyResolve: ((value: boolean) => void) | null = null;

// 在开发环境，创建等待 Promise
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  mswReadyPromise = new Promise<boolean>((resolve) => {
    mswReadyResolve = resolve;
    
    // 检查 MSW worker 是否已注册
    const checkMSW = () => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistration().then((registration) => {
          if (registration?.active) {
            // 给一点时间让 MSW 完全启动
            setTimeout(() => {
              resolve(true);
            }, 100);
          } else {
            // 如果还没注册，等待一段时间后重试
            setTimeout(checkMSW, 100);
          }
        });
      } else {
        // 不支持 Service Worker，直接标记为就绪
        resolve(true);
      }
    };

    // 延迟检查，给 MSW 启动时间
    setTimeout(checkMSW, 200);
  });
}

/**
 * 通知 MSW 已就绪（由 MSWContext 调用）
 */
export function notifyMSWReady() {
  if (mswReadyResolve) {
    mswReadyResolve(true);
    mswReadyResolve = null;
  }
}

/**
 * 等待 MSW 就绪
 */
export async function waitForMSW(): Promise<boolean> {
  if (process.env.NODE_ENV !== 'development') {
    return true; // 生产环境直接返回 true
  }

  // 从 MSWContext 获取状态
  try {
    const { getMSWReady } = await import('@/mocks/MSWContext');
    if (getMSWReady()) {
      return true;
    }
  } catch {
    // 如果导入失败，继续等待
  }

  if (mswReadyPromise) {
    return mswReadyPromise;
  }

  return true;
}

/**
 * 检查 MSW 是否就绪（同步）
 */
export function isMSWReady(): boolean {
  try {
    // 尝试从 MSWContext 获取状态
    const { getMSWReady } = require('@/mocks/MSWContext');
    return getMSWReady();
  } catch {
    return process.env.NODE_ENV !== 'development';
  }
}


'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { logger } from '@/utils/logger';

interface MSWContextType {
  isReady: boolean;
}

const MSWContext = createContext<MSWContextType>({ isReady: false });

// 全局标志，供请求拦截器使用
let globalMSWReady = false;

export function setMSWReady(ready: boolean) {
  globalMSWReady = ready;
}

export function getMSWReady() {
  // 模拟真实环境，不使用 MSW
  return true;
}

export function MSWProvider({ children }: { children: React.ReactNode }) {
  // 模拟真实环境，直接返回 children
  return <MSWContext.Provider value={{ isReady: true }}>{children}</MSWContext.Provider>;
}

export function useMSW() {
  return useContext(MSWContext);
}

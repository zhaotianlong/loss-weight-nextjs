'use client';

import React from 'react';
import { MSWProvider } from './MSWContext';

export default function InitMock({ children }: { children: React.ReactNode }) {
  return <MSWProvider>{children}</MSWProvider>;
}

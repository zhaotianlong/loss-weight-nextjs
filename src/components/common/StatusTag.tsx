/**
 * 状态标签组件
 */
import React from 'react';
import { Tag } from 'antd';
import { StatusEnum, StudentStatusEnum, PaymentStatusEnum, StatusTagMap, StudentStatusTagMap, PaymentStatusTagMap } from '@/constants';

interface StatusTagProps {
  status: number | string;
  type?: 'default' | 'student' | 'payment';
}

export const StatusTag: React.FC<StatusTagProps> = ({ status, type = 'default' }) => {
  let tagConfig: { text: string; color: string } | undefined;

  if (type === 'student') {
    tagConfig = StudentStatusTagMap[status as StudentStatusEnum];
  } else if (type === 'payment') {
    tagConfig = PaymentStatusTagMap[status as PaymentStatusEnum];
  } else {
    tagConfig = StatusTagMap[status as StatusEnum];
  }

  if (!tagConfig) {
    return <Tag>{String(status)}</Tag>;
  }

  return <Tag color={tagConfig.color}>{tagConfig.text}</Tag>;
};

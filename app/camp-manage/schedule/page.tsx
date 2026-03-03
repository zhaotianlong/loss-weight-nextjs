'use client';

import React from 'react';
import { Card, Typography, Breadcrumb } from 'antd';
import { HomeOutlined } from '@ant-design/icons';

const { Title } = Typography;

export default function CampSchedulePage() {
  return (
    <div style={{ padding: '24px' }}>
      <Breadcrumb 
        style={{ marginBottom: '16px' }}
        items={[
          {
            href: '/',
            title: <HomeOutlined />,
          },
          {
            title: '营地管理',
          },
          {
            title: '营地日程设置',
          },
        ]}
      />
      
      <Card>
        <Title level={4}>营地日程设置</Title>
        <p>这里是营地日程设置页面，您可以在这里配置各个营地的默认日程模板。</p>
        {/* 这里将来可以添加具体的日程设置逻辑 */}
      </Card>
    </div>
  );
}

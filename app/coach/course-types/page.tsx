'use client';

import React from 'react';
import { Card, Tabs } from 'antd';
import PrivateCourseTypeTable from '../private/page';
import PublicCourseTypeTable from '../public/page';

export default function CourseTypesPage() {
  return (
    <Card bordered={false}>
      <Tabs
        defaultActiveKey="private"
        items={[
          {
            key: 'private',
            label: '私教课类型',
            children: <PrivateCourseTypeTable />,
          },
          {
            key: 'public',
            label: '公共课类型',
            children: <PublicCourseTypeTable />,
          },
        ]}
      />
    </Card>
  );
}

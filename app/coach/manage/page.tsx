'use client';

import React, { useRef, useState, useEffect } from 'react';
import { ProTable, ProColumns, ActionType, type ProFormInstance } from '@ant-design/pro-components';
import { Button, Space, message, Tag, Dropdown } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { getCoaches, Coach } from '@/service/coach';
import { getCampList, type Camp } from '@/service/camp';
import { useMSW } from '@/mocks/MSWContext';
import { useCampFilter } from '@/hooks/useCampFilter';
import CoachActionModal from './components/CoachActionModal';
import { useRouter } from 'next/navigation';

export default function CoachManagePage() {
  const actionRef = useRef<ActionType>(undefined);
  const formRef = useRef<ProFormInstance>(undefined);
  const router = useRouter();
  const { isReady: mswReady } = useMSW();
  const [campList, setCampList] = useState<Camp[]>([]);
  
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [actionType, setActionType] = useState<'students' | 'courses' | 'performance'>('students');
  const [currentCoach, setCurrentCoach] = useState<Coach | null>(null);
  
  const { getCampIdForQuery, shouldShowCampFilter, getDefaultCampId } = useCampFilter();

  useEffect(() => {
    const fetchCamps = async () => {
      try {
        const res = await getCampList({ pageSize: 1000 });
        setCampList(res.data || []);
      } catch (error) {
        console.error('获取营地列表失败:', error);
      }
    };
    fetchCamps();
  }, []);

  React.useEffect(() => {
    if (mswReady && actionRef.current) {
      actionRef.current.reload();
    }
  }, [mswReady]);

  const columns: ProColumns<Coach>[] = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      width: 100,
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      key: 'phone',
      width: 120,
    },
    {
      title: '所属营地',
      dataIndex: 'campId',
      key: 'campId',
      width: 120,
      valueType: 'select',
      hideInSearch: !shouldShowCampFilter(),
      valueEnum: campList.reduce((acc, camp) => {
        acc[camp.campId] = { text: camp.campName };
        return acc;
      }, {} as Record<number, { text: string }>),
      fieldProps: {
        options: campList.map(camp => ({ label: camp.campName, value: camp.campId })),
      },
    },
    {
      title: '负责内容',
      dataIndex: 'dutyArea',
      key: 'dutyArea',
      ellipsis: true,
      hideInSearch: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      valueEnum: {
        1: { text: '在职', status: 'Success' },
        0: { text: '离职', status: 'Error' },
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      valueType: 'option',
      render: (_, record) => (
        <Space size="small">
          <Dropdown
            menu={{
              items: [
                {
                  key: 'students',
                  label: '查看负责学员',
                  onClick: () => {
                    setCurrentCoach(record);
                    setActionType('students');
                    setActionModalVisible(true);
                  },
                },
                {
                  key: 'courses',
                  label: '查看课程安排',
                  onClick: () => {
                    setCurrentCoach(record);
                    setActionType('courses');
                    setActionModalVisible(true);
                  },
                },
                {
                  key: 'performance',
                  label: '查看业绩',
                  onClick: () => {
                    setCurrentCoach(record);
                    setActionType('performance');
                    setActionModalVisible(true);
                  },
                },
              ],
            }}
          >
            <Button type="link" size="small">
              更多操作 <DownOutlined />
            </Button>
          </Dropdown>
        </Space>
      ),
    },
  ];

  return (
    <>
      <ProTable<Coach>
        headerTitle="教练管理"
        actionRef={actionRef}
        formRef={formRef}
        rowKey="empId"
        search={{ labelWidth: 'auto' }}
        request={async (params) => {
          if (!mswReady) return { data: [], success: false, total: 0 };
          const res = await getCoaches({
            page: params.current,
            pageSize: params.pageSize,
            name: params.name,
            campId: getCampIdForQuery(params.campId ? Number(params.campId) : undefined),
          });
          return {
            data: res.data || [],
            success: res.success,
            total: res.meta?.total || 0,
          };
        }}
        columns={columns}
      />
      
      <CoachActionModal
        visible={actionModalVisible}
        type={actionType}
        coach={currentCoach}
        onCancel={() => setActionModalVisible(false)}
      />
    </>
  );
}

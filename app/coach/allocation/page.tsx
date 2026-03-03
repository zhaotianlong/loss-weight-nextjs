'use client';

import React, { useRef, useState, useEffect } from 'react';
import { ProTable, ProColumns, ActionType, ProFormInstance } from '@ant-design/pro-components';
import { Button, message, Tag } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { getCoachStudentList, assignStudentToCoach, CoachStudentRelation } from '@/service/coach';
import { getCampList, type Camp } from '@/service/camp';
import { useCampFilter } from '@/hooks/useCampFilter';
import AssignModal from './components/AssignModal';

export default function CoachAllocationPage() {
  const actionRef = useRef<ActionType>(undefined);
  const formRef = useRef<ProFormInstance>(undefined);
  const [campList, setCampList] = useState<Camp[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
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

  const handleAssign = async (values: Record<string, unknown>) => {
    try {
      await assignStudentToCoach(values as any);
      message.success('分配成功');
      setModalVisible(false);
      actionRef.current?.reload();
    } catch (error) {
      message.error('分配失败');
    }
  };

  const columns: ProColumns<CoachStudentRelation>[] = [
    ...(shouldShowCampFilter() ? [{
      title: '营地',
      dataIndex: 'campId',
      key: 'campId',
      width: 150,
      valueType: 'select' as const,
      valueEnum: campList.reduce((acc, camp) => {
        acc[camp.campId] = { text: camp.campName };
        return acc;
      }, {} as Record<number, { text: string }>),
      hideInTable: false,
      hideInSearch: false,
      initialValue: getDefaultCampId(),
      fieldProps: (form: ProFormInstance) => ({
        options: campList.map(camp => ({
          label: camp.campName,
          value: camp.campId,
        })),
        onChange: (value: number) => {
           form.setFieldsValue({ campId: value });
           form.submit();
         },
      }),
      render: (_: unknown, record: CoachStudentRelation) => {
        const camp = campList.find(c => c.campId === record.campId);
        return camp?.campName || '-';
      },
    }] : []),
    ...(!shouldShowCampFilter() ? [{
      title: '所属营地',
      dataIndex: 'campId',
      key: 'campId',
      width: 150,
      hideInSearch: true,
      render: (_: unknown, record: CoachStudentRelation) => {
        const camp = campList.find(c => c.campId === record.campId);
        return camp?.campName || '-';
      },
    }] : []),
    {
      title: '教练',
      dataIndex: 'coachName',
      key: 'coachName',
      width: 120,
      fieldProps: {
        onPressEnter: () => {
          formRef.current?.submit();
        },
      },
      render: (dom) => <strong>{dom}</strong>,
    },
    {
      title: '学员',
      dataIndex: 'studentName',
      key: 'studentName',
      width: 120,
      fieldProps: {
        onPressEnter: () => {
          formRef.current?.submit();
        },
      },
      render: (dom) => <strong>{dom}</strong>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      valueType: 'select',
      valueEnum: {
        active: { text: '进行中', status: 'Success' },
        transferred: { text: '已转出', status: 'Default' },
        ended: { text: '已结束', status: 'Default' },
      },
      fieldProps: {
        onChange: () => {
          formRef.current?.submit();
        },
      },
    },
    {
      title: '开始日期',
      dataIndex: 'startDate',
      key: 'startDate',
      valueType: 'date',
      width: 120,
      hideInSearch: true,
    },
    {
      title: '结束日期',
      dataIndex: 'endDate',
      key: 'endDate',
      valueType: 'date',
      width: 120,
      hideInSearch: true,
      render: (text: any) => text || '-',
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      valueType: 'dateTime',
      width: 160,
      hideInSearch: true,
    },
  ];

  return (
    <>
      <ProTable<CoachStudentRelation>
        headerTitle="学员分配"
        actionRef={actionRef}
        formRef={formRef}
        rowKey="id"
        search={{
          labelWidth: 'auto',
        }}
        toolBarRender={() => [
          <Button 
            type="primary" 
            key="primary" 
            icon={<PlusOutlined />}
            onClick={() => setModalVisible(true)}
          >
            分配教练
          </Button>,
        ]}
        request={async (params) => {
          try {
            const response = await getCoachStudentList({
              page: params.current,
              pageSize: params.pageSize,
              campId: getCampIdForQuery(params.campId ? Number(params.campId) : undefined),
              coachName: params.coachName,
              studentName: params.studentName,
              status: params.status,
            });
            return {
              data: response.data || [],
              success: true,
              total: response.meta?.total || 0,
            };
          } catch (error) {
            return {
              data: [],
              success: false,
              total: 0,
            };
          }
        }}
        columns={columns}
      />
      <AssignModal
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleAssign}
      />
    </>
  );
}

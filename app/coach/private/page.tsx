'use client';

import React, { useRef, useState, useEffect } from 'react';
import { ProTable, ProColumns, ActionType, ProFormInstance } from '@ant-design/pro-components';
import { Button, Space, message, Popconfirm, Tag, Typography, Tooltip } from 'antd';

const { Text } = Typography;
import { PlusOutlined, EditOutlined, DeleteOutlined, UserAddOutlined } from '@ant-design/icons';
import { getPrivateCourseList, createPrivateCourse, updatePrivateCourse, deletePrivateCourse, type PrivateCourse } from '@/service/course';
import { formatMoney } from '@/utils';
import PrivateCourseModal from './components/PrivateCourseModal';
import { getCoachList, type CoachOption } from '@/service/coach';
import { getCampList, type Camp } from '@/service/camp';
import { useCampFilter } from '@/hooks/useCampFilter';
import { Modal, Select } from 'antd';

export default function PrivateCourseTypeTable() {
  const actionRef = useRef<ActionType>(undefined);
  const formRef = useRef<ProFormInstance>(undefined);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingCourse, setEditingCourse] = useState<PrivateCourse | null>(null);
  const [campList, setCampList] = useState<Camp[]>([]);
  const { getCampIdForQuery, shouldShowCampFilter, getDefaultCampId } = useCampFilter();

  // 安排教练相关状态
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [selectedCoaches, setSelectedCoaches] = useState<string[]>([]);
  const [coachOptions, setCoachOptions] = useState<CoachOption[]>([]);
  const [currentCourseId, setCurrentCourseId] = useState<number | null>(null);

  // 获取营地列表供筛选使用
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await getCampList({ pageSize: 100 });
        setCampList(data || []);
      } catch (error) {
        console.error('获取营地列表失败:', error);
      }
    };
    fetchData();
  }, []);

  const fetchCoachOptions = async (campId?: number) => {
    try {
      const res = await getCoachList({ campId });
      setCoachOptions(res.data || []);
    } catch (error) {
      console.error('获取教练列表失败:', error);
    }
  };

  const handleAssignCoach = (course: PrivateCourse) => {
    setCurrentCourseId(course.courseId);
    setSelectedCoaches(course.coaches?.map(c => c.id) || []);
    // 根据课程所属营地筛选教练
    fetchCoachOptions(course.campId);
    setAssignModalVisible(true);
  };

  const handleAssignSubmit = async () => {
    if (!currentCourseId) return;
    try {
      const coachesToAssign = coachOptions
        .filter(c => selectedCoaches.includes(c.value))
        .map(c => ({
          id: c.value,
          name: c.label,
          gender: '男' as const // 简化处理，实际应从接口获取
        }));

      await updatePrivateCourse(currentCourseId, {
        coaches: coachesToAssign as PrivateCourse['coaches']
      });
      message.success('教练安排成功');
      setAssignModalVisible(false);
      actionRef.current?.reload();
    } catch (error) {
      message.error('安排失败');
    }
  };

  const handleRemoveCoach = async (course: PrivateCourse, coachId: string) => {
    try {
      const updatedCoaches = course.coaches?.filter(c => c.id !== coachId) || [];
      await updatePrivateCourse(course.courseId, {
        coaches: updatedCoaches as PrivateCourse['coaches']
      });
      message.success('教练已移除');
      actionRef.current?.reload();
    } catch (error) {
      message.error('移除失败');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deletePrivateCourse(id);
      message.success('私教课类型已删除');
      actionRef.current?.reload();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleCreate = () => {
    setModalMode('create');
    setEditingCourse(null);
    setModalVisible(true);
  };

  const handleEdit = (course: PrivateCourse) => {
    setEditingCourse(course);
    setModalMode('edit');
    setModalVisible(true);
  };

  const handleModalOk = async (values: Omit<PrivateCourse, 'courseId'>) => {
    try {
      if (modalMode === 'create') {
        await createPrivateCourse(values);
        message.success('私教课类型创建成功');
      } else {
        if (editingCourse) {
          await updatePrivateCourse(editingCourse.courseId, values);
          message.success('私教课类型更新成功');
        }
      }
      setModalVisible(false);
      actionRef.current?.reload();
    } catch {
      message.error(modalMode === 'create' ? '创建失败' : '更新失败');
    }
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    setEditingCourse(null);
  };

  const columns: ProColumns<PrivateCourse>[] = [
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
      hideInTable: false, // 在表格中显示
      hideInSearch: false, // 在搜索表单中显示
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
      render: (_: React.ReactNode, record: PrivateCourse) => {
        const camp = campList.find(c => c.campId === record.campId);
        return camp?.campName || '-';
      },
    }] : []),
    // 非超级管理员也需要在表格中显示所属营地，但在搜索表单中隐藏
    ...(!shouldShowCampFilter() ? [{
      title: '所属营地',
      dataIndex: 'campId',
      key: 'campId',
      width: 150,
      hideInSearch: true, // 不在搜索表单中显示
      render: (_: React.ReactNode, record: PrivateCourse) => {
        const camp = campList.find(c => c.campId === record.campId);
        return camp?.campName || '-';
      },
    }] : []),
    {
      title: '私教课类型',
      dataIndex: 'type',
      key: 'type',
      width: 150,
      valueType: 'select',
      valueEnum: {
        '常规': { text: '常规' },
        '拉伸': { text: '拉伸' },
        '瑜伽': { text: '瑜伽' },
        '普拉提': { text: '普拉提' },
        '筋膜刀': { text: '筋膜刀' },
      },
    },
    {
      title: '付费类型',
      dataIndex: 'paymentType',
      key: 'paymentType',
      width: 150,
      render: (_dom: React.ReactNode, record: PrivateCourse) => (
        <Space>
          {record.paymentType ? record.paymentType.split(',').map(type => (
            <Tag color={type === '包月' ? 'blue' : 'default'} key={type}>
              {type}
            </Tag>
          )) : '-'}
        </Space>
      ),
      valueType: 'select',
      valueEnum: {
        '包月': { text: '包月' },
        '单节': { text: '单节' },
      },
      fieldProps: {
        mode: 'multiple',
      },
    },
    {
      title: '负责教练',
      key: 'coaches',
      width: 150,
      hideInSearch: true,
      render: (_, record) => {
        const coachNames = record.coaches?.map(c => c.name).join('、') || '-';
        return (
          <Tooltip title={coachNames}>
            <Text ellipsis style={{ maxWidth: 150 }}>
              {coachNames}
            </Text>
          </Tooltip>
        );
      },
    },
    {
      title: '价格',
      key: 'price',
      width: 200,
      hideInSearch: true,
      render: (_dom: React.ReactNode, record: PrivateCourse) => {
        const prices = [];
        if (record.price) {
          prices.push(<div key="single">单节: {formatMoney(record.price)}</div>);
        }
        if (record.monthlyPrice) {
          prices.push(
            <div key="monthly">
              包月: {formatMoney(record.monthlyPrice)} 
              {record.monthlySessions ? ` (${record.monthlySessions}节)` : ''}
            </div>
          );
        }
        return <Space direction="vertical" size={0}>{prices}</Space>;
      },
    },
    {
      title: '课程时长',
      dataIndex: 'duration',
      key: 'duration',
      width: 120,
      hideInSearch: true,
      render: (_dom: React.ReactNode, record: PrivateCourse) => `${record.duration} 分钟`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      valueType: 'select',
      valueEnum: {
        1: { text: '启用', status: 'Success' },
        0: { text: '禁用', status: 'Default' },
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 250,
      valueType: 'option',
      render: (_: React.ReactNode, record: PrivateCourse) => (
        <Space size="small">
          <Button 
            type="link" 
            size="small" 
            icon={<UserAddOutlined />}
            onClick={() => handleAssignCoach(record)}
          >
            安排教练
          </Button>
          <Button 
            type="link" 
            size="small" 
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="删除私教课"
            description="确定要删除该私教课吗？"
            onConfirm={() => handleDelete(record.courseId)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger size="small" icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const expandedRowRender = (record: PrivateCourse) => {
    const coachColumns: ProColumns<Required<PrivateCourse>['coaches'][number]>[] = [
      { title: '教练名称', dataIndex: 'name', key: 'name' },
      { title: '性别', dataIndex: 'gender', key: 'gender' },
      {
        title: '操作',
        key: 'action',
        render: (_: React.ReactNode, coach) => (
          <Space size="small">
            <Popconfirm
              title="移除教练"
              description="确定要移除该教练吗？"
              onConfirm={() => handleRemoveCoach(record, coach.id)}
              okText="确定"
              cancelText="取消"
            >
              <Button type="link" danger size="small">
                移除
              </Button>
            </Popconfirm>
          </Space>
        ),
      },
    ];
    return (
      <ProTable
        columns={coachColumns}
        headerTitle={false}
        search={false}
        options={false}
        dataSource={record.coaches}
        pagination={false}
        rowKey="id"
      />
    );
  };

  return (
    <>
      <ProTable<PrivateCourse>
        headerTitle="私教课类型管理"
        actionRef={actionRef}
        formRef={formRef}
        rowKey="courseId"
        search={{
          labelWidth: 'auto',
        }}
        expandable={{ expandedRowRender }}
        toolBarRender={() => [
          <Button 
            type="primary" 
            key="primary" 
            icon={<PlusOutlined />}
            onClick={handleCreate}
          >
            新增私教课类型
          </Button>,
        ]}
        request={async (params) => {
          try {
            const response = await getPrivateCourseList({
              page: params.current,
              pageSize: params.pageSize,
              type: params.type,
              paymentType: params.paymentType,
              status: params.status ? Number(params.status) : undefined,
              campId: getCampIdForQuery(params.campId ? Number(params.campId) : undefined),
            });
            return {
              data: response.data || [],
              success: response.success,
              total: response.meta?.total || 0,
            };
          } catch (error) {
            console.error(error);
            return {
              data: [],
              success: false,
              total: 0,
            };
          }
        }}
        columns={columns}
      />
      <PrivateCourseModal
        visible={modalVisible}
        mode={modalMode}
        course={editingCourse}
        campList={campList}
        defaultCampId={getDefaultCampId()}
        onCancel={handleModalCancel}
        onOk={handleModalOk}
      />
      
      <Modal
        title="安排教练"
        open={assignModalVisible}
        onOk={handleAssignSubmit}
        onCancel={() => setAssignModalVisible(false)}
        destroyOnClose
      >
        <div style={{ padding: '20px 0' }}>
          <div style={{ marginBottom: 8 }}>选择教练:</div>
          <Select
            mode="multiple"
            style={{ width: '100%' }}
            placeholder="请选择要安排的教练"
            value={selectedCoaches}
            onChange={setSelectedCoaches}
            options={coachOptions}
          />
        </div>
      </Modal>
    </>
  );
}
'use client';

import React, { useRef, useState, useEffect } from 'react';
import { ProTable, ProColumns, ActionType, ProFormInstance } from '@ant-design/pro-components';
import { Button, Space, message, Popconfirm, Modal, Select, Typography, Tooltip } from 'antd';

const { Text } = Typography;
import { PlusOutlined, EditOutlined, DeleteOutlined, UserAddOutlined } from '@ant-design/icons';
import { getPublicCourseList, deletePublicCourse, createPublicCourse, updatePublicCourse, type PublicCourse } from '@/service/course';
import { getCampList, type Camp } from '@/service/camp';
import { getCoachList, type CoachOption } from '@/service/coach';
import { StatusTag } from '@/components/common';
import { useCampFilter } from '@/hooks/useCampFilter';
import PublicCourseModal from './components/PublicCourseModal';

export default function PublicCourseTypeTable() {
  const actionRef = useRef<ActionType>(undefined);
  const formRef = useRef<ProFormInstance>(undefined);
  const [campList, setCampList] = useState<Camp[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingCourse, setEditingCourse] = useState<PublicCourse | null>(null);
  const [coachOptions, setCoachOptions] = useState<CoachOption[]>([]);
  const { getCampIdForQuery, shouldShowCampFilter, getDefaultCampId } = useCampFilter();

  // 获取营地列表和教练列表用于筛选和展示
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [campRes, coachRes] = await Promise.all([
          getCampList({ pageSize: 1000 }),
          getCoachList()
        ]);
        setCampList(campRes.data || []);
        setCoachOptions(coachRes.data || []);
      } catch (error) {
        console.error('获取基础数据失败:', error);
      }
    };
    fetchData();
  }, []);

  const handleDelete = async (id: number) => {
    try {
      await deletePublicCourse(id);
      message.success('公共课类型已删除');
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

  const handleEdit = (course: PublicCourse) => {
    setEditingCourse(course);
    setModalMode('edit');
    setModalVisible(true);
  };

  const handleModalOk = async (values: Omit<PublicCourse, 'courseId'>) => {
    try {
      if (modalMode === 'create') {
        await createPublicCourse(values);
        message.success('公共课类型创建成功');
      } else {
        if (editingCourse) {
          await updatePublicCourse(editingCourse.courseId, values);
          message.success('公共课类型更新成功');
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

  const columns: ProColumns<PublicCourse>[] = [
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
      render: (_: React.ReactNode, record: PublicCourse) => {
        const camp = campList.find(c => c.campId === record.campId);
        return camp?.campName || '-';
      },
    }] : []),
    // 非超级管理员也需要在表格中显示所属营地
    ...(!shouldShowCampFilter() ? [{
      title: '所属营地',
      dataIndex: 'campId',
      key: 'campId',
      width: 150,
      hideInSearch: true, // 不在搜索表单中显示
      render: (_: React.ReactNode, record: PublicCourse) => {
        const camp = campList.find(c => c.campId === record.campId);
        return camp?.campName || '-';
      },
    }] : []),
    {
      title: '课程名称',
      dataIndex: 'title',
      key: 'title',
      width: 200,
      render: (text: React.ReactNode) => <strong>{text}</strong>,
    },
    {
      title: '负责教练',
      dataIndex: 'coachId',
      key: 'coachId',
      width: 150,
      valueType: 'select',
      fieldProps: (form: ProFormInstance) => {
        const selectedCampId = form.getFieldValue('campId');
        return {
          options: coachOptions
            .filter(coach => !selectedCampId || coach.campId === Number(selectedCampId))
            .map(coach => ({ label: coach.label, value: coach.value })),
        };
      },
      render: (_, record: PublicCourse) => {
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
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      valueType: 'dateTime',
      width: 160,
      sorter: true,
      hideInSearch: true,
      hideInForm: true,
    },
    {
      title: '更新时间',
      dataIndex: 'updateTime',
      key: 'updateTime',
      valueType: 'dateTime',
      width: 160,
      sorter: true,
      hideInSearch: true,
      hideInForm: true,
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
      fieldProps: {
        onChange: () => {
          formRef.current?.submit();
        },
      },
      render: (_: React.ReactNode, record: PublicCourse) => <StatusTag status={record.status} />,
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      valueType: 'option',
      render: (_: React.ReactNode, record: PublicCourse) => (
        <Space size="small">
          <Button 
            type="link" 
            size="small" 
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="删除公共课类型"
            description="确定要删除该公共课类型吗？"
            onConfirm={() => handleDelete(record.courseId)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="link"
              danger
              size="small"
              icon={<DeleteOutlined />}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <ProTable<PublicCourse>
        headerTitle="公共课类型管理"
        actionRef={actionRef}
        formRef={formRef}
        rowKey="courseId"
        search={{
          labelWidth: 'auto',
        }}
        toolBarRender={() => [
          <Button 
            type="primary" 
            key="primary" 
            icon={<PlusOutlined />}
            onClick={handleCreate}
          >
            新增公共课类型
          </Button>,
        ]}
        request={async (params) => {
          try {
            const response = await getPublicCourseList({
              page: params.current,
              pageSize: params.pageSize,
              // 从context获取campId，非超级管理员强制使用当前用户的campId
              campId: getCampIdForQuery(params.campId ? Number(params.campId) : undefined),
              title: params.title,
              coachId: params.coachId,
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
      <PublicCourseModal
        visible={modalVisible}
        mode={modalMode}
        course={editingCourse}
        campList={campList}
        coachOptions={coachOptions}
        defaultCampId={getDefaultCampId()}
        onCancel={handleModalCancel}
        onOk={handleModalOk}
      />
    </>
  );
}
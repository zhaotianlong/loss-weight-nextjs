'use client';

import React, { useRef, useState } from 'react';
import { ProTable, ProColumns, ActionType, ProFormInstance } from '@ant-design/pro-components';
import { Button, Space, Tag, message, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getCampList, deleteCamp, createCamp, updateCamp, getCampDetail, type Camp } from '@/service/camp';
import { StatusTag } from '@/components/common';
import { calculateOccupancyRate } from '@/utils';
import CampModal from './components/CampModal';
import PermissionGuard from '@/components/PermissionGuard';
import { Permission } from '@/constants/permissions';

export default function CampManagePage() {
  const actionRef = useRef<ActionType>(undefined);
  const formRef = useRef<ProFormInstance>(undefined);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingCamp, setEditingCamp] = useState<Camp | null>(null);

  const handleDelete = async (id: number) => {
    try {
      await deleteCamp(id);
      message.success('营地已删除');
      actionRef.current?.reload();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleCreate = () => {
    setModalMode('create');
    setEditingCamp(null);
    setModalVisible(true);
  };

  const handleEdit = async (camp: Camp) => {
    try {
      // 获取完整的营地信息
      const res = await getCampDetail(camp.campId);
      setEditingCamp(res.data);
      setModalMode('edit');
      setModalVisible(true);
    } catch (error) {
      message.error('获取营地信息失败');
    }
  };

  const handleModalOk = async (values: Omit<Camp, 'campId' | 'currentNum'>) => {
    try {
      if (modalMode === 'create') {
        // 创建时 currentNum 默认为 0
        await createCamp({ ...values, currentNum: 0 });
        message.success('营地创建成功');
      } else {
        if (editingCamp) {
          await updateCamp(editingCamp.campId, values);
          message.success('营地更新成功');
        }
      }
      setModalVisible(false);
      actionRef.current?.reload();
    } catch (error) {
      message.error(modalMode === 'create' ? '创建失败' : '更新失败');
    }
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    setEditingCamp(null);
  };

  const columns: ProColumns<Camp>[] = [
    {
      title: '营地名称',
      dataIndex: 'campName',
      key: 'campName',
      width: 200,
      render: (dom) => <strong>{dom}</strong>,
    },
    {
      title: '位置',
      dataIndex: 'address',
      key: 'address',
      width: 250,
      ellipsis: true,
      fieldProps: {
        onPressEnter: () => {
          formRef.current?.submit();
        },
      },
    },
    {
      title: '容量',
      dataIndex: 'capacity',
      key: 'capacity',
      width: 100,
      hideInSearch: true,
      render: (capacity) => `${capacity} 人`,
    },
    {
      title: '当前入住',
      dataIndex: 'currentNum',
      key: 'currentNum',
      width: 120,
      hideInSearch: true,
      render: (currentNum) => `${currentNum} 人`,
    },
    {
      title: '占用率',
      key: 'occupancyRate',
      width: 150,
      hideInSearch: true,
      render: (_: any, record: Camp) => {
        const rate = calculateOccupancyRate(record.currentNum, record.capacity);
        return (
          <Tag color={rate > 80 ? 'red' : rate > 60 ? 'orange' : 'green'}>
            {rate}%
          </Tag>
        );
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      valueType: 'select',
      valueEnum: {
        1: { text: '运营中', status: 'Success' },
        0: { text: '已关闭', status: 'Default' },
      },
      fieldProps: {
        onChange: () => {
          // 选择状态后立即触发表单提交，从而筛选数据
          formRef.current?.submit();
        },
      },
      render: (_: any, record: Camp) => <StatusTag status={record.status} />,
    },
    {
      title: '创建日期',
      dataIndex: 'createDate',
      key: 'createDate',
      width: 120,
      hideInSearch: true,
      render: (_: any, record: Camp) => record.createDate || '-',
    },
    {
      title: '开业日期',
      dataIndex: 'openDate',
      key: 'openDate',
      width: 120,
      hideInSearch: true,
      render: (_: any, record: Camp) => record.openDate || '-',
    },
    {
      title: '关店日期',
      dataIndex: 'closeDate',
      key: 'closeDate',
      width: 120,
      hideInSearch: true,
      render: (_: any, record: Camp) => record.closeDate || '-',
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
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      width: 200,
      ellipsis: true,
      hideInSearch: true,
      render: (_: any, record: Camp) => record.remark || '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      valueType: 'option',
      render: (_: any, record: Camp) => (
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
            title="删除营地"
            description="确定要删除该营地吗？"
            onConfirm={() => handleDelete(record.campId)}
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

  return (
    <PermissionGuard permission={Permission.CAMP_VIEW}>
      <ProTable<Camp>
        headerTitle="营地管理"
        actionRef={actionRef}
        formRef={formRef}
        rowKey="campId"
        search={{
          labelWidth: 'auto',
          defaultCollapsed: false,
        }}
        toolBarRender={() => [
          <Button
            type="primary"
            key="primary"
            icon={<PlusOutlined />}
            onClick={handleCreate}
          >
            新增营地
          </Button>,
        ]}
        request={async (params) => {
          try {
            const response = await getCampList({
              page: params.current,
              pageSize: params.pageSize,
              campName: params.campName,
              address: params.address,
              status: params.status ? Number(params.status) : undefined,
            });
            return {
              data: response.data || [],
              success: response.success,
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
      <CampModal
        visible={modalVisible}
        mode={modalMode}
        camp={editingCamp}
        onCancel={handleModalCancel}
        onOk={handleModalOk}
      />
    </PermissionGuard>
  );
}
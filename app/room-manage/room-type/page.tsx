'use client';

import React, { useRef, useState, useEffect } from 'react';
import { ProTable, ProColumns, ActionType, ProFormInstance } from '@ant-design/pro-components';
import { Button, Space, message, Popconfirm, Tag, Typography } from 'antd';

const { Text } = Typography;
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getRoomTypeList, deleteRoomType, createRoomType, updateRoomType, type RoomType } from '@/service/room';
import { getCampList, type Camp } from '@/service/camp';
import { StatusTag } from '@/components/common';
import PermissionGuard from '@/components/PermissionGuard';
import { Permission } from '@/constants/permissions';
import { useCampFilter } from '@/hooks/useCampFilter';
import RoomTypeModal from './components/RoomTypeModal';

export default function HouseTypePage() {
  const actionRef = useRef<ActionType>(null);
  const formRef = useRef<ProFormInstance>(undefined);
  const [campList, setCampList] = useState<Camp[]>([]);
  const [roomTypeList, setRoomTypeList] = useState<RoomType[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingRoomType, setEditingRoomType] = useState<RoomType | null>(null);
  const { shouldShowCampFilter, getCampIdForQuery, getDefaultCampId, currentCampId } = useCampFilter();

  // 获取营地列表
  useEffect(() => {
    const fetchCamps = async () => {
      try {
        const campRes = await getCampList({ pageSize: 1000 });
        setCampList(campRes.data || []);
      } catch (err) {
        console.error('获取营地列表失败:', err);
      }
    };
    fetchCamps();
  }, []);

  // 初始化时加载房间类型列表
  useEffect(() => {
    // 如果是非超级管理员，使用当前用户的营地ID
    // 如果是超级管理员，等待用户选择营地
    if (!shouldShowCampFilter() && currentCampId) {
      // 非超级管理员，使用默认营地ID
      (async () => {
        try {
          const roomTypeRes = await getRoomTypeList({ 
            pageSize: 1000,
            campId: currentCampId 
          });
          setRoomTypeList(roomTypeRes.data || []);
        } catch (error) {
          console.error('获取房间类型列表失败:', error);
        }
      })();
    }
  }, [shouldShowCampFilter, currentCampId]);

  const handleDelete = async (id: number) => {
    try {
      await deleteRoomType(id);
      message.success('房间类型已删除');
      actionRef.current?.reload();
    } catch {
      message.error('删除失败');
    }
  };

  const handleCreate = () => {
    setModalMode('create');
    setEditingRoomType(null);
    setModalVisible(true);
  };

  const handleEdit = (roomType: RoomType) => {
    setEditingRoomType(roomType);
    setModalMode('edit');
    setModalVisible(true);
  };

  const handleModalOk = async (values: Omit<RoomType, 'roomTypeId'>) => {
    try {
      if (modalMode === 'create') {
        await createRoomType(values);
        message.success('房间类型创建成功');
      } else {
        if (editingRoomType) {
          await updateRoomType(editingRoomType.roomTypeId, values);
          message.success('房间类型更新成功');
        }
      }
      setModalVisible(false);
      // 重新获取房间类型列表，更新下拉选项
      // 使用当前选中的营地ID或默认营地ID
      const currentSelectedCampId = shouldShowCampFilter() 
        ? formRef.current?.getFieldValue('campId') || getDefaultCampId()
        : getDefaultCampId();
      const roomTypeRes = await getRoomTypeList({ 
        pageSize: 1000,
        campId: currentSelectedCampId 
      });
      setRoomTypeList(roomTypeRes.data || []);
      actionRef.current?.reload();
    } catch {
      message.error(modalMode === 'create' ? '创建失败' : '更新失败');
    }
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    setEditingRoomType(null);
  };

  const columns: ProColumns<RoomType>[] = [
    {
      title: '所属营地',
      dataIndex: 'campId',
      key: 'campId',
      width: 180,
      valueType: shouldShowCampFilter() ? ('select' as const) : undefined,
      valueEnum: shouldShowCampFilter() ? campList.reduce((acc, camp) => {
        acc[camp.campId] = { text: camp.campName };
        return acc;
      }, {} as Record<number, { text: string }>) : undefined,
      hideInTable: false, // 在表格中显示
      hideInSearch: !shouldShowCampFilter(), // 非超级管理员不显示筛选
      fieldProps: shouldShowCampFilter() ? {
        options: campList.map(camp => ({
          label: camp.campName,
          value: camp.campId,
        })),
        onChange: async (value: number) => {
          formRef.current?.setFieldsValue({ campId: value });
          // 切换营地时，重新获取该营地的房间类型列表
          try {
            const roomTypeRes = await getRoomTypeList({ 
              pageSize: 1000,
              campId: value 
            });
            setRoomTypeList(roomTypeRes.data || []);
            // 清空房间类型的选择，因为切换营地后之前的房间类型可能不适用
            formRef.current?.setFieldsValue({ bedCount: undefined });
          } catch (error) {
            console.error('获取房间类型列表失败:', error);
          }
          // 选择营地后立即触发表单提交，从而筛选数据
          formRef.current?.submit();
        },
      } : {
        disabled: true,
      },
      initialValue: getDefaultCampId(),
      render: (_: unknown, record: RoomType) => {
        const camp = campList.find(c => c.campId === record.campId);
        return camp?.campName || '-';
      },
    },
    {
      title: '房间类型',
      dataIndex: 'bedCount',
      key: 'bedCount',
      width: 200,
      valueType: 'select',
      valueEnum: (() => {
        // 按 bedCount 去重，相同的床位数只保留一个选项
        // 使用第一个遇到的房间类型名称作为显示文本
        const bedCountMap = new Map<number, string>();
        roomTypeList.forEach(rt => {
          if (!bedCountMap.has(rt.bedCount)) {
            bedCountMap.set(rt.bedCount, rt.roomName);
          }
        });
        const result: Record<number, { text: string }> = {};
        bedCountMap.forEach((text, bedCount) => {
          result[bedCount] = { text: `${text}(${bedCount}人)` };
        });
        return result;
      })(),
      hideInTable: true, // 只在搜索表单中显示，用于筛选
      hideInSearch: false, // 在搜索表单中显示
      fieldProps: {
        placeholder: '请选择房间类型',
        onChange: () => {
          // 选择房间类型后立即触发表单提交，从而筛选数据
          formRef.current?.submit();
        },
      },
    },
    {
      title: '类型名称',
      dataIndex: 'roomName',
      key: 'roomName',
      width: 200,
      hideInSearch: true, // 不在搜索表单中显示
      render: (_: unknown, record: RoomType) => (
        <strong>{record.roomName}</strong>
      ),
    },
    {
      title: '床位数',
      dataIndex: 'bedCount',
      key: 'bedCount',
      width: 100,
      hideInSearch: true,
      render: (_: unknown, record: RoomType) => `${record.bedCount} 人`,
    },
    {
      title: '床位类型',
      dataIndex: 'bedType',
      key: 'bedType',
      width: 120,
      valueType: 'select',
      valueEnum: {
        0: { text: '普通床位' },
        1: { text: '上下床' },
      },
      hideInTable: false, // 在表格中显示
      hideInSearch: false, // 在搜索表单中显示
      fieldProps: {
        placeholder: '请选择床位类型',
        onChange: () => {
          // 选择床位类型后立即触发表单提交，从而筛选数据
          formRef.current?.submit();
        },
      },
      render: (_: unknown, record: RoomType) => (
        <Tag color={record.bedType === 1 ? 'blue' : 'default'}>
          {record.bedType === 1 ? '上下床' : '普通床位'}
        </Tag>
      ),
    },
    {
      title: '价格 (元)',
      key: 'price',
      width: 180,
      hideInSearch: true,
      render: (_: unknown, record: RoomType) => {
        if (record.bedType === 1) {
          return (
            <Space direction="vertical" size={0}>
              <Text type="secondary" style={{ fontSize: 12 }}>上铺: ¥{record.upperPrice || 0}</Text>
              <Text type="secondary" style={{ fontSize: 12 }}>下铺: ¥{record.lowerPrice || 0}</Text>
            </Space>
          );
        }
        return `¥${record.price || 0}`;
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
      dataIndex: 'roomStatus',
      key: 'roomStatus',
      width: 100,
      valueType: 'select',
      valueEnum: {
        1: { text: '启用', status: 'Success' },
        0: { text: '禁用', status: 'Default' },
      },
      fieldProps: {
        onChange: () => {
          // 选择状态后立即触发表单提交，从而筛选数据
          formRef.current?.submit();
        },
      },
      render: (_: unknown, record: RoomType) => <StatusTag status={record.roomStatus} />,
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      valueType: 'option',
      render: (_: unknown, record: RoomType) => (
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
            title="删除房间类型"
            description="确定要删除该房间类型吗？"
            onConfirm={() => handleDelete(record.roomTypeId)}
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
    <PermissionGuard permission={Permission.ROOM_VIEW}>
      <ProTable<RoomType>
      headerTitle="房间类型"
      actionRef={actionRef}
      formRef={formRef}
      rowKey="roomTypeId"
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
          新增类型
        </Button>,
      ]}
      request={async (params) => {
        try {
          const response = await getRoomTypeList({
            page: params.current,
            pageSize: params.pageSize,
            // 从context获取campId，非超级管理员强制使用当前用户的campId
            campId: getCampIdForQuery(params.campId ? Number(params.campId) : undefined),
            bedCount: params.bedCount ? Number(params.bedCount) : undefined,
            bedType: params.bedType ? Number(params.bedType) : undefined,
            roomStatus: params.roomStatus ? Number(params.roomStatus) : undefined,
          });
          return {
            data: response.data || [],
            success: response.success,
            total: response.meta?.total || 0,
          };
        } catch {
          return {
            data: [],
            success: false,
            total: 0,
          };
        }
      }}
      columns={columns}
    />
    <RoomTypeModal
      visible={modalVisible}
      mode={modalMode}
      roomType={editingRoomType}
      campList={campList}
      defaultCampId={getDefaultCampId()}
      onCancel={handleModalCancel}
      onOk={handleModalOk}
    />
    </PermissionGuard>
  );
}
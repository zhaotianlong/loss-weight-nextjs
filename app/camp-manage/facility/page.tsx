
'use client';

import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { ProTable, ProColumns, ActionType, ProFormInstance } from '@ant-design/pro-components';
import { Button, Space, message, Popconfirm, Image, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { 
  getFacilityList, 
  deleteFacility, 
  createFacility, 
  updateFacility, 
  getFacilityDetail 
} from '@/service/facility';
import { getCampList, type Camp } from '@/service/camp';
import { useUser } from '@/contexts/UserContext';
import type { Facility } from '@/mock/data/facility';
import FacilityModal from './components/FacilityModal';
import PermissionGuard from '@/components/PermissionGuard';
import { Permission } from '@/constants/permissions';
import { useCampFilter } from '@/hooks/useCampFilter';

export default function FacilityManagePage() {
  const actionRef = useRef<ActionType>(undefined);
  const formRef = useRef<ProFormInstance>(undefined);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingFacility, setEditingFacility] = useState<Facility | null>(null);
  const [campList, setCampList] = useState<Camp[]>([]);
  const { user } = useUser();
  const { isSuper, getDefaultCampId } = useCampFilter();
  const isCampAdmin = user?.role === '营地管理员';
  const canOperate = isSuper || isCampAdmin;

  const fetchCamps = useCallback(async () => {
    try {
      const res = await getCampList({ pageSize: 100 });
      setCampList(res.data || []);
    } catch (error) {
      console.error('获取营地列表失败:', error);
    }
  }, []);

  useEffect(() => {
    if (isSuper) {
      fetchCamps();
    }
  }, [isSuper, fetchCamps]);

  const handleDelete = async (id: number) => {
    try {
      await deleteFacility(id);
      message.success('设施已删除');
      actionRef.current?.reload();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleCreate = () => {
    setModalMode('create');
    setEditingFacility(null);
    setModalVisible(true);
  };

  const handleEdit = async (record: Facility) => {
    try {
      const res = await getFacilityDetail(record.id);
      setEditingFacility(res.data);
      setModalMode('edit');
      setModalVisible(true);
    } catch (error) {
      message.error('获取详情失败');
    }
  };

  const handleModalOk = async (values: Omit<Facility, 'id' | 'createTime' | 'updateTime'>) => {
    try {
      if (modalMode === 'create') {
        await createFacility(values);
        message.success('创建成功');
      } else {
        if (editingFacility) {
          await updateFacility(editingFacility.id, values);
          message.success('更新成功');
        }
      }
      setModalVisible(false);
      actionRef.current?.reload();
    } catch (error) {
      message.error(modalMode === 'create' ? '创建失败' : '更新失败');
    }
  };

  const columns: ProColumns<Facility>[] = useMemo(() => [
    {
      title: '所属营地',
      dataIndex: 'campId',
      key: 'campId',
      width: 150,
      valueType: 'select',
      hideInTable: !isSuper,
      hideInSearch: !isSuper,
      valueEnum: campList.reduce((acc, camp) => {
        acc[camp.campId.toString()] = { text: camp.campName };
        return acc;
      }, {} as Record<string, { text: string }>),
      fieldProps: {
        showSearch: true,
        placeholder: '请选择营地',
      },
    },
    {
      title: '场地名称',
      dataIndex: 'name',
      key: 'name',
      width: 120,
      render: (dom) => <Tag color="blue">{dom}</Tag>,
    },
    {
      title: '具体地点',
      dataIndex: 'location',
      key: 'location',
      width: 180,
      ellipsis: true,
    },
    {
      title: '容纳人数',
      dataIndex: 'capacity',
      key: 'capacity',
      width: 100,
      hideInSearch: true,
      render: (val) => `${val} 人`,
    },
    {
      title: '场地照片',
      dataIndex: 'photos',
      key: 'photos',
      width: 120,
      hideInSearch: true,
      render: (photos) => {
        if (!photos || (photos as string[]).length === 0) return '-';
        return (
          <Image
            width={40}
            height={40}
            src={(photos as string[])[0]}
            preview={{
              mask: <span>查看</span>,
            }}
            style={{ borderRadius: 4, objectFit: 'cover' }}
          />
        );
      },
    },
    {
      title: '特点描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      hideInSearch: true,
    },
    {
      title: '更新时间',
      dataIndex: 'updateTime',
      key: 'updateTime',
      valueType: 'dateTime',
      width: 160,
      hideInSearch: true,
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      valueType: 'option',
      hideInTable: !canOperate,
      render: (_, record) => (
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
            title="删除设施"
            description="确定要删除该设施吗？"
            onConfirm={() => handleDelete(record.id)}
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
  ], [isSuper, campList, canOperate]);

  return (
    <PermissionGuard permission={Permission.CAMP_FACILITY_VIEW}>
      <div style={{ padding: '24px' }}>
        <ProTable<Facility>
          headerTitle="营地设施管理"
          actionRef={actionRef}
          formRef={formRef}
          rowKey="id"
          search={{
          labelWidth: 'auto',
          defaultCollapsed: false,
        }}
        form={{
          initialValues: {
            campId: getDefaultCampId()?.toString(),
          },
        }}
        toolBarRender={() => [
            canOperate && (
              <Button
                type="primary"
                key="primary"
                icon={<PlusOutlined />}
                onClick={handleCreate}
              >
                新增设施
              </Button>
            ),
          ].filter(Boolean) as React.ReactNode[]}
          request={async (params) => {
            try {
              const response = await getFacilityList({
                page: params.current,
                pageSize: params.pageSize,
                campId: params.campId,
                name: params.name,
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
        <FacilityModal
          visible={modalVisible}
          mode={modalMode}
          facility={editingFacility}
          onCancel={() => setModalVisible(false)}
          onOk={handleModalOk}
        />
      </div>
    </PermissionGuard>
  );
}

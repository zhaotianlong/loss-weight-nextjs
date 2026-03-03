'use client';

import React, { useRef, useState, useEffect } from 'react';
import { ProTable, ProColumns, ActionType, StatisticCard, ProFormInstance } from '@ant-design/pro-components';
import { Button, Space, message, Popconfirm, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, DownloadOutlined, DollarOutlined, CheckCircleOutlined, CloseCircleOutlined, EyeOutlined } from '@ant-design/icons';
import { getTuitionList, createTuition, updateTuition, deleteTuition, approveTuition, rejectTuition, type Tuition } from '@/service/tuition';
import { getCampList, type Camp } from '@/service/camp';
import { StatusTag } from '@/components/common';
import { formatMoney } from '@/utils';
import { useCampFilter } from '@/hooks/useCampFilter';
import TuitionModal from './components/TuitionModal';

const { Text } = Typography;

export default function FinancePage() {
  const actionRef = useRef<ActionType>(undefined);
  const formRef = useRef<ProFormInstance>(undefined);
  const [campList, setCampList] = useState<Camp[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingTuition, setEditingTuition] = useState<Tuition | null>(null);
  const [stats, setStats] = useState({ income: 0, expense: 0, pending: 0 });
  const { getCampIdForQuery, shouldShowCampFilter, getDefaultCampId } = useCampFilter();

  const handleApprove = async (id: number) => {
    try {
      const res = await approveTuition(id);
      if (res.success) {
        message.success('审核通过');
        actionRef.current?.reload();
      } else {
        message.error(res.msg || '审核失败');
      }
    } catch (error) {
      message.error('审核操作失败');
    }
  };

  const handleReject = async (id: number) => {
    try {
      const res = await rejectTuition(id);
      if (res.success) {
        message.success('已拒绝申请');
        actionRef.current?.reload();
      } else {
        message.error(res.msg || '操作失败');
      }
    } catch (error) {
      message.error('拒绝操作失败');
    }
  };

  // 获取营地列表用于筛选
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

  const handleDelete = async (id: number) => {
    try {
      await deleteTuition(id);
      message.success('学费记录已删除');
      actionRef.current?.reload();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleCreate = () => {
    setModalMode('create');
    setEditingTuition(null);
    setModalVisible(true);
  };

  const handleEdit = (tuition: Tuition) => {
    setEditingTuition(tuition);
    setModalMode('edit');
    setModalVisible(true);
  };

  const handleModalOk = async (values: Omit<Tuition, 'id'>) => {
    try {
      if (modalMode === 'create') {
        await createTuition(values);
        message.success('学费记录创建成功');
      } else {
        if (editingTuition) {
          await updateTuition(editingTuition.id, values);
          message.success('学费记录更新成功');
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
    setEditingTuition(null);
  };

  const columns: any[] = [
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
      fieldProps: {
        options: campList.map(camp => ({
          label: camp.campName,
          value: camp.campId,
        })),
      },
      render: (_: unknown, record: Tuition) => {
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
      render: (_: unknown, record: Tuition) => {
        const camp = campList.find(c => c.campId === record.campId);
        return camp?.campName || '-';
      },
    }] : []),
    {
      title: '学员名称',
      dataIndex: 'studentName',
      key: 'studentName',
      width: 120,
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      valueType: 'select',
      valueEnum: {
        income: { text: '收入', status: 'Success' },
        expense: { text: '支出', status: 'Error' },
      },
    },
    {
      title: '来源',
      dataIndex: 'source',
      key: 'source',
      width: 150,
    },
    {
      title: '金额',
      dataIndex: 'amount',
      key: 'amount',
      width: 150,
      hideInSearch: true,
      render: (_: unknown, record: Tuition) => (
        <Space direction="vertical" size={0}>
          <strong style={{ color: '#ff4d4f' }}>{formatMoney(record.amount)}</strong>
          {record.originalAmount && (
            <Text type="secondary" delete style={{ fontSize: 12 }}>
              {formatMoney(record.originalAmount)}
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: '支付日期',
      dataIndex: 'paymentDate',
      key: 'paymentDate',
      width: 120,
      valueType: 'date',
      hideInSearch: true,
      render: (text) => text || '-',
    },
    {
      title: '到期日期',
      dataIndex: 'dueDate',
      key: 'dueDate',
      width: 120,
      valueType: 'date',
      hideInSearch: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      valueType: 'select',
      valueEnum: {
        1: { text: '已支付', status: 'Success' },
        0: { text: '待支付', status: 'Warning' },
        2: { text: '已逾期', status: 'Error' },
        3: { text: '待审核', status: 'Processing' },
        4: { text: '已拒绝', status: 'Error' },
      },
      fieldProps: {
        onChange: () => {
          formRef.current?.submit();
        },
      },
      render: (_: unknown, record: Tuition) => <StatusTag status={record.status} type="payment" />,
    },
    {
      title: '说明',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      hideInSearch: true,
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
      title: '操作',
      key: 'action',
      width: 250,
      valueType: 'option',
      render: (_: unknown, record: Tuition) => {
        const isAuditRecord = [1, 3, 4].includes(record.status);
        return (
          <Space size="small">
            {record.status === 3 && (
              <>
                <Popconfirm
                  title="确认审核"
                  description="审核通过后将正式办理入住/续租，确定吗？"
                  onConfirm={() => handleApprove(record.id)}
                  okText="确定"
                  cancelText="取消"
                >
                  <Button 
                    type="link" 
                    size="small" 
                    icon={<CheckCircleOutlined />}
                    style={{ color: '#52c41a' }}
                  >
                    审核
                  </Button>
                </Popconfirm>
                <Popconfirm
                  title="确认拒绝"
                  description="拒绝后将取消该入住/续费申请，确定吗？"
                  onConfirm={() => handleReject(record.id)}
                  okText="确定"
                  cancelText="取消"
                >
                  <Button 
                    type="link" 
                    size="small" 
                    danger
                    icon={<CloseCircleOutlined />}
                  >
                    拒绝
                  </Button>
                </Popconfirm>
              </>
            )}
            <Button 
              type="link" 
              size="small" 
              icon={isAuditRecord ? <EyeOutlined /> : <EditOutlined />}
              onClick={() => handleEdit(record)}
            >
              {isAuditRecord ? '查看' : '编辑'}
            </Button>
            {!isAuditRecord && (
              <Popconfirm
                title="删除学费记录"
                description="确定要删除该学费记录吗？"
                onConfirm={() => handleDelete(record.id)}
                okText="确定"
                cancelText="取消"
              >
                <Button type="link" danger size="small" icon={<DeleteOutlined />}>
                  删除
                </Button>
              </Popconfirm>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <div>
      <StatisticCard.Group direction="row" style={{ marginBottom: 16 }}>
        <StatisticCard
          statistic={{
            title: '总收入',
            value: stats.income,
            prefix: <DollarOutlined />,
            suffix: '元',
            valueStyle: { color: '#52c41a' },
          }}
        />
        <StatisticCard
          statistic={{
            title: '总支出',
            value: stats.expense,
            prefix: <DollarOutlined />,
            suffix: '元',
            valueStyle: { color: '#ff4d4f' },
          }}
        />
        <StatisticCard
          statistic={{
            title: '待处理',
            value: stats.pending,
            prefix: <DollarOutlined />,
            suffix: '元',
            valueStyle: { color: '#faad14' },
          }}
        />
      </StatisticCard.Group>

      <ProTable<Tuition>
        headerTitle="财务审核"
        actionRef={actionRef}
        rowKey="id"
        options={{
          reload: false,
          density: false,
          setting: false,
        }}
        search={{
          labelWidth: 'auto',
        }}
        toolBarRender={() => [
          <Button key="export" icon={<DownloadOutlined />}>
            导出报表
          </Button>,
          <Button 
            type="primary" 
            key="primary" 
            icon={<PlusOutlined />}
            onClick={handleCreate}
          >
            新增记录
          </Button>,
        ]}
        request={async (params) => {
          try {
            const response = await getTuitionList({
              page: params.current,
              pageSize: params.pageSize,
              stuId: params.stuId ? Number(params.stuId) : undefined,
              // 从context获取campId，非超级管理员强制使用当前用户的campId
              campId: getCampIdForQuery(params.campId ? Number(params.campId) : undefined),
              status: params.status ? Number(params.status) : undefined,
            });
            
            // 计算统计数据
            const data = response.data || [];
            const incomeAmount = data
              .filter((f) => f.type === 'income' && f.status === 1)
              .reduce((sum, f) => sum + (f.amount || 0), 0);
            const expenseAmount = data
              .filter((f) => f.type === 'expense' && f.status === 1)
              .reduce((sum, f) => sum + (f.amount || 0), 0);
            const pendingAmount = data
              .filter((f) => f.status === 0 || f.status === 3)
              .reduce((sum, f) => sum + (f.amount || 0), 0);

            setStats({
              income: incomeAmount,
              expense: expenseAmount,
              pending: pendingAmount,
            });

            return {
              data,
              success: response.success,
              total: response.meta?.total || 0,
              extra: {
                incomeAmount,
                expenseAmount,
                pendingAmount,
              },
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
      <TuitionModal
        visible={modalVisible}
        mode={modalMode}
        tuition={editingTuition}
        disabled={editingTuition ? [1, 3, 4].includes(editingTuition.status) : false}
        campList={campList}
        defaultCampId={getDefaultCampId()}
        onCancel={handleModalCancel}
        onOk={handleModalOk}
      />
    </div>
  );
}
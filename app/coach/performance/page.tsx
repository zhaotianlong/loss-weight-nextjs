'use client';

import React, { useRef, useState, useEffect } from 'react';
import { ProTable, StatisticCard, ProColumns, ActionType } from '@ant-design/pro-components';
import { Button, message, Space, Popconfirm, Modal, Form, InputNumber, Select, DatePicker, Row, Col, Typography } from 'antd';
import { PlusOutlined, DollarOutlined, EditOutlined, DeleteOutlined, CheckCircleOutlined, CloseCircleOutlined, SyncOutlined, ClockCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { 
  getPerformanceGoals, 
  createPerformanceGoal, 
  updatePerformanceGoal, 
  deletePerformanceGoal, 
  getPerformanceStats 
} from '@/service/performance';
import { getCampList } from '@/service/camp';
import { getCoachList } from '@/service/coach';
import { useCampFilter } from '@/hooks/useCampFilter';
import { usePermission } from '@/hooks/usePermission';
import type { PerformanceGoal } from '@/mock/data/performance';
import type { Camp } from '@/service/camp';
import type { CoachOption } from '@/service/coach';
import { Tag } from 'antd';

const { Text } = Typography;

interface PerformanceStats {
  month: string;
  campId?: number;
  campName?: string;
  summary: {
    totalRecruitmentGoal: number;
    totalRecruitmentActual: number;
    totalPrivateCoachingGoal: number;
    totalPrivateCoachingActual: number;
    totalRenewalGoal: number;
    totalRenewalActual: number;
  };
  coachStats: Array<{
    coachId: string;
    coachName: string;
    month: string;
    goals: {
      recruitment: number;
      privateCoaching: number;
      renewal: number;
      renewalType: 'amount' | 'percentage';
    };
    actual: {
      recruitment: number;
      privateCoaching: number;
      renewal: number;
    };
  }>;
}

interface MonthlySummary {
  month: string;
  campId: number;
  campName: string;
  recruitmentGoal: number;
  recruitmentActual: number;
  privateCoachingGoal: number;
  privateCoachingActual: number;
  renewalGoal: number;
  renewalActual: number;
  status: 'achieved' | 'failed' | 'processing' | 'not_started';
  coachGoals: PerformanceGoal[];
}

interface PerformanceGoalWithActual extends PerformanceGoal {
  actual: {
    recruitment: number;
    privateCoaching: number;
    renewal: number;
  };
}

export default function PerformancePage() {
  const actionRef = useRef<ActionType>(null);
  const [form] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingGoal, setEditingGoal] = useState<PerformanceGoal | null>(null);
  const [campList, setCampList] = useState<Camp[]>([]);
  const [coachList, setCoachList] = useState<CoachOption[]>([]);
  const [statsData, setStatsData] = useState<PerformanceStats | null>(null);
  const { shouldShowCampFilter, getDefaultCampId, currentCampId } = useCampFilter();
  const { isSuperAdmin, isCampAdmin } = usePermission();
  const canEdit = isSuperAdmin || isCampAdmin;

  const fetchStats = async (campId?: number, month?: string) => {
    if (!campId) {
      setStatsData(null);
      return;
    }
    const res = await getPerformanceStats({ 
      campId, 
      month: month || dayjs().format('YYYY-MM')
    });
    setStatsData(res.data);
  };

  // 获取状态标签
  const getStatusTag = (status: string) => {
    switch (status) {
      case 'achieved':
        return <Tag icon={<CheckCircleOutlined />} color="success">达成</Tag>;
      case 'failed':
        return <Tag icon={<CloseCircleOutlined />} color="error">未达成</Tag>;
      case 'processing':
        return <Tag icon={<SyncOutlined spin />} color="processing">进行中</Tag>;
      case 'not_started':
        return <Tag icon={<ClockCircleOutlined />} color="default">未开始</Tag>;
      default:
        return null;
    }
  };

  // 获取初始数据
  useEffect(() => {
    const init = async () => {
      // 营地列表将由 ProTable 列中的 request 自动加载并 setCampList
      const defaultCampId = getDefaultCampId();
      if (defaultCampId) {
        await fetchStats(defaultCampId, undefined);
      }
    };
    init();
  }, []);

  const loadCoaches = async (campId: number) => {
    const res = await getCoachList({ campId });
    setCoachList(res.data || []);
  };

  const handleAdd = () => {
    setEditingGoal(null);
    form.resetFields();
    const initialCampId = currentCampId || getDefaultCampId();
    form.setFieldsValue({
      month: dayjs(),
      campId: initialCampId,
      renewalType: 'amount'
    });
    if (initialCampId) loadCoaches(initialCampId);
    setModalVisible(true);
  };

  const handleEdit = (record: PerformanceGoal) => {
    setEditingGoal(record);
    form.setFieldsValue({
      ...record,
      month: dayjs(record.month)
    });
    loadCoaches(record.campId);
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await deletePerformanceGoal(id);
      if (res.success) {
        message.success('删除成功');
        actionRef.current?.reload();
        fetchStats(undefined, undefined);
      }
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const formattedValues = {
        ...values,
        month: dayjs(values.month).format('YYYY-MM'),
        coachName: coachList.find(c => c.value === values.coachId)?.label || ''
      };

      if (editingGoal) {
        await updatePerformanceGoal(editingGoal.id, formattedValues);
        message.success('更新成功');
      } else {
        await createPerformanceGoal(formattedValues);
        message.success('创建成功');
      }
      setModalVisible(false);
      actionRef.current?.reload();
      fetchStats(undefined, undefined);
    } catch (error) {
      console.error('Submit failed:', error);
    }
  };

  const parentColumns: ProColumns<MonthlySummary>[] = [
    {
      title: '营地',
      dataIndex: 'campId',
      width: 120,
      valueType: 'select',
      initialValue: getDefaultCampId(),
      hideInSearch: !shouldShowCampFilter(),
      fieldProps: {
        disabled: !isSuperAdmin,
      },
      request: async () => {
        const res = await getCampList();
        const list = res.data || [];
        setCampList(list);
        return list.map(item => ({
          label: item.campName,
          value: item.campId,
        }));
      },
      render: (_, record) => <Tag color="blue">{record.campName}</Tag>,
    },
    {
      title: '月份',
      dataIndex: 'month',
      valueType: 'dateMonth',
      width: 100,
    },
    {
      title: '总招生目标',
      dataIndex: 'recruitmentGoal',
      valueType: 'money',
      hideInSearch: true,
      width: 120,
    },
    {
      title: '实际招生',
      dataIndex: 'recruitmentActual',
      valueType: 'money',
      hideInSearch: true,
      width: 120,
      render: (val) => <Text type="success">{val}</Text>
    },
    {
      title: '私教目标',
      dataIndex: 'privateCoachingGoal',
      valueType: 'money',
      hideInSearch: true,
      width: 120,
    },
    {
      title: '实际私教',
      dataIndex: 'privateCoachingActual',
      valueType: 'money',
      hideInSearch: true,
      width: 120,
      render: (val) => <Text type="success">{val}</Text>
    },
    {
      title: '续住目标',
      dataIndex: 'renewalGoal',
      valueType: 'money',
      hideInSearch: true,
      width: 120,
    },
    {
      title: '实际续住',
      dataIndex: 'renewalActual',
      valueType: 'money',
      hideInSearch: true,
      width: 120,
      render: (val) => <Text type="success">{val}</Text>
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (_, record) => getStatusTag(record.status),
      hideInSearch: true,
    },
  ];

  const childColumns: ProColumns<PerformanceGoal & { actual?: PerformanceStats['coachStats'][0]['actual'] }>[] = [
    {
      title: '教练名称',
      dataIndex: 'coachName',
    },
    {
      title: '招生目标',
      dataIndex: 'recruitmentGoal',
      valueType: 'money',
    },
    {
      title: '招生实际',
      dataIndex: ['actual', 'recruitment'],
      valueType: 'money',
      render: (val) => <Text type="success">{val}</Text>
    },
    {
      title: '私教目标',
      dataIndex: 'privateCoachingGoal',
      valueType: 'money',
    },
    {
      title: '私教实际',
      dataIndex: ['actual', 'privateCoaching'],
      valueType: 'money',
      render: (val) => <Text type="success">{val}</Text>
    },
    {
      title: '续住目标',
      dataIndex: 'renewalGoal',
      render: (_, record) => {
        if (record.renewalType === 'percentage') {
          const targetAmount = (record.recruitmentGoal * record.renewalGoal) / 100;
          return (
            <Space direction="vertical" size={0}>
              <Text>{record.renewalGoal}%</Text>
              <Text type="secondary" style={{ fontSize: 12 }}>
                (约 ¥{targetAmount.toLocaleString()})
              </Text>
            </Space>
          );
        }
        return `¥${record.renewalGoal.toLocaleString()}`;
      }
    },
    {
      title: '续住实际',
      dataIndex: ['actual', 'renewal'],
      valueType: 'money',
      render: (val, record) => {
        const actualVal = Number(val) || 0;
        if (record.renewalType === 'percentage') {
          // 这里显示金额，并标注百分比达成情况
          const recruitmentActual = Number(record.actual?.recruitment) || 0;
          return (
            <Space direction="vertical" size={0}>
              <Text type="success">¥{actualVal.toLocaleString()}</Text>
              {recruitmentActual > 0 && (
                <Text type="secondary" style={{ fontSize: 12 }}>
                  占招生 {((actualVal / recruitmentActual) * 100).toFixed(1)}%
                </Text>
              )}
            </Space>
          );
        }
        return <Text type="success">¥{actualVal.toLocaleString()}</Text>;
      }
    },
    {
      title: '操作',
      valueType: 'option',
      width: 120,
      hideInTable: !canEdit,
      render: (_, record) => [
        <Button key="edit" type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>编辑</Button>,
        <Popconfirm
          key="delete"
          title="确定删除此业绩目标吗？"
          onConfirm={() => handleDelete(record.id)}
        >
          <Button type="link" size="small" danger icon={<DeleteOutlined />}>删除</Button>
        </Popconfirm>,
      ],
    },
  ];

  const getCardTitle = (baseTitle: string) => {
    if (!statsData) return baseTitle;
    const month = statsData.month;
    const campName = statsData.campName || campList.find(c => c.campId === statsData.campId)?.campName;
    return `${baseTitle} (${month}${campName ? ` - ${campName}` : ''})`;
  };

  return (
    <div style={{ padding: 24 }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Row gutter={[16, 16]}>
            <Col span={8}>
              <StatisticCard
                statistic={{
                  title: getCardTitle('招生目标总额'),
                  value: statsData?.summary?.totalRecruitmentGoal || 0,
                  prefix: <DollarOutlined />,
                  suffix: '元',
                }}
              />
            </Col>
            <Col span={8}>
              <StatisticCard
                statistic={{
                  title: getCardTitle('私教目标总额'),
                  value: statsData?.summary?.totalPrivateCoachingGoal || 0,
                  prefix: <DollarOutlined />,
                  suffix: '元',
                }}
              />
            </Col>
            <Col span={8}>
              <StatisticCard
                statistic={{
                  title: getCardTitle('续住目标总额'),
                  value: statsData?.summary?.totalRenewalGoal || 0,
                  prefix: <DollarOutlined />,
                  suffix: '元',
                }}
              />
            </Col>
            <Col span={8}>
              <StatisticCard
                statistic={{
                  title: getCardTitle('招生实际完成'),
                  value: statsData?.summary?.totalRecruitmentActual || 0,
                  prefix: <DollarOutlined />,
                  suffix: '元',
                  status: (statsData?.summary?.totalRecruitmentActual ?? 0) >= (statsData?.summary?.totalRecruitmentGoal ?? 0) ? 'success' : 'processing'
                }}
              />
            </Col>
            <Col span={8}>
              <StatisticCard
                statistic={{
                  title: getCardTitle('私教实际完成'),
                  value: statsData?.summary?.totalPrivateCoachingActual || 0,
                  prefix: <DollarOutlined />,
                  suffix: '元',
                  status: (statsData?.summary?.totalPrivateCoachingActual ?? 0) >= (statsData?.summary?.totalPrivateCoachingGoal ?? 0) ? 'success' : 'processing'
                }}
              />
            </Col>
            <Col span={8}>
              <StatisticCard
                statistic={{
                  title: getCardTitle('续住实际完成'),
                  value: statsData?.summary?.totalRenewalActual || 0,
                  prefix: <DollarOutlined />,
                  suffix: '元',
                  status: (statsData?.summary?.totalRenewalActual ?? 0) >= (statsData?.summary?.totalRenewalGoal ?? 0) ? 'success' : 'processing'
                }}
              />
            </Col>
          </Row>

        <ProTable<MonthlySummary>
          headerTitle="业绩统计与目标"
          actionRef={actionRef}
          columns={parentColumns}
          request={async (params) => {
            // 同步更新顶部统计卡片
            fetchStats(params.campId, params.month);

            const res = await getPerformanceGoals(params);
            const goals = (res.data || []) as (PerformanceGoal & { 
              actual: { recruitment: number; privateCoaching: number; renewal: number } 
            })[];
            
            // 按月份和营地分组
            const groups: Record<string, MonthlySummary> = {};
            const now = dayjs();
            const currentMonthStr = now.format('YYYY-MM');

            goals.forEach(goal => {
              const month = goal.month;
              const campId = goal.campId;
              const campName = (goal as any).campName;
              if (!month || !campId) return;

              const key = `${month}-${campId}`;

              if (!groups[key]) {
                groups[key] = {
                  month,
                  campId,
                  campName: campName || campList.find(c => c.campId === campId)?.campName || `营地${campId}`,
                  recruitmentGoal: 0,
                  recruitmentActual: 0,
                  privateCoachingGoal: 0,
                  privateCoachingActual: 0,
                  renewalGoal: 0,
                  renewalActual: 0,
                  status: 'processing',
                  coachGoals: []
                };
              }
              groups[key].recruitmentGoal += (goal.recruitmentGoal || 0);
              groups[key].recruitmentActual += (goal.actual?.recruitment || 0);
              groups[key].privateCoachingGoal += (goal.privateCoachingGoal || 0);
              groups[key].privateCoachingActual += (goal.actual?.privateCoaching || 0);
              groups[key].renewalGoal += (goal.renewalType === 'amount' ? (goal.renewalGoal || 0) : 0);
              groups[key].renewalActual += (goal.actual?.renewal || 0);
              groups[key].coachGoals.push(goal);
            });

            // 补充状态逻辑
            const result = Object.values(groups).map(group => {
              const groupMonth = dayjs(group.month);
              
              if (group.month === currentMonthStr) {
                group.status = 'processing';
              } else if (groupMonth.isAfter(now)) {
                group.status = 'not_started';
              } else {
                // 过去月份：判断各项指标是否均达成
                const recruitmentAchieved = group.recruitmentActual >= group.recruitmentGoal;
                const privateAchieved = group.privateCoachingActual >= group.privateCoachingGoal;
                const renewalAchieved = group.renewalActual >= group.renewalGoal;
                
                group.status = (recruitmentAchieved && privateAchieved && renewalAchieved) ? 'achieved' : 'failed';
              }
              return group;
            }).sort((a, b) => {
              if (a.month !== b.month) return b.month.localeCompare(a.month);
              return a.campId - b.campId;
            });

            return {
              data: result,
              success: true,
              total: result.length,
            };
          }}
          rowKey={(record) => `${record.month}-${record.campId}`}
          expandable={{
            expandedRowRender: (record) => {
              if (!record || !record.coachGoals) return null;
              return (
                <ProTable<PerformanceGoal & { actual?: PerformanceStats['coachStats'][0]['actual'] }>
                  columns={childColumns}
                  headerTitle={false}
                  search={false}
                  options={false}
                  dataSource={record.coachGoals.map(child => {
                    // 优先使用接口直接返回的 actual 数据（包含历史月份真实数据）
                    const goalWithActual = child as unknown as PerformanceGoalWithActual;
                    return {
                      ...child,
                      actual: goalWithActual.actual || statsData?.coachStats?.find(s => s.coachId === child.coachId)?.actual
                    };
                  })}
                  pagination={false}
                  rowKey="id"
                />
              );
            },
          }}
          search={{
            labelWidth: 'auto',
          }}
          toolBarRender={() => [
            canEdit && (
              <Button key="add" type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                设置业绩目标
              </Button>
            ),
          ].filter(Boolean) as React.ReactNode[]}
        />

        <Modal
          title={editingGoal ? '编辑业绩目标' : '设置业绩目标'}
          open={modalVisible}
          onOk={handleModalOk}
          onCancel={() => setModalVisible(false)}
          width={500}
          destroyOnClose
        >
          <Form form={form} layout="vertical" initialValues={{ renewalType: 'amount' }}>
            <Form.Item 
              name="campId" 
              label="所属营地" 
              rules={[{ required: true, message: '请选择营地' }]}
              hidden={!shouldShowCampFilter()}
            >
              <Select 
                placeholder="请选择营地"
                options={campList.map(c => ({ label: c.campName, value: c.campId }))}
                onChange={(val) => loadCoaches(val)}
              />
            </Form.Item>
            <Form.Item name="month" label="考核月份" rules={[{ required: true, message: '请选择月份' }]}>
              <DatePicker picker="month" style={{ width: '100%' }} placeholder="请选择月份" />
            </Form.Item>
            <Form.Item name="coachId" label="考核教练" rules={[{ required: true, message: '请选择教练' }]}>
              <Select 
                placeholder="请选择教练"
                options={coachList} 
                showSearch 
                filterOption={(input, option) => (option?.label ?? '').includes(input)} 
              />
            </Form.Item>
            <Form.Item name="recruitmentGoal" label="招生目标金额" rules={[{ required: true, message: '请输入招生目标' }]}>
              <InputNumber style={{ width: '100%' }} min={0} precision={2} prefix="¥" placeholder="请输入目标金额" />
            </Form.Item>
            <Form.Item name="privateCoachingGoal" label="私教目标金额" rules={[{ required: true, message: '请输入私教目标' }]}>
              <InputNumber style={{ width: '100%' }} min={0} precision={2} prefix="¥" placeholder="请输入目标金额" />
            </Form.Item>
            <Row gutter={16}>
              <Col span={10}>
                <Form.Item name="renewalType" label="续住目标类型" rules={[{ required: true }]}>
                  <Select options={[
                    { label: '固定金额', value: 'amount' }, 
                    { label: '百分比', value: 'percentage' }
                  ]} />
                </Form.Item>
              </Col>
              <Col span={14}>
                <Form.Item 
                  noStyle 
                  shouldUpdate={(prev, curr) => prev.renewalType !== curr.renewalType}
                >
                  {({ getFieldValue }) => (
                    <Form.Item 
                      name="renewalGoal" 
                      label="续住目标值" 
                      rules={[{ required: true, message: '请输入续住目标' }]}
                    >
                      <InputNumber 
                        style={{ width: '100%' }} 
                        min={0} 
                        precision={getFieldValue('renewalType') === 'percentage' ? 0 : 2}
                        prefix={getFieldValue('renewalType') === 'amount' ? '¥' : undefined}
                        suffix={getFieldValue('renewalType') === 'percentage' ? '%' : undefined}
                        placeholder="请输入目标值"
                      />
                    </Form.Item>
                  )}
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Modal>
      </Space>
    </div>
  );
}

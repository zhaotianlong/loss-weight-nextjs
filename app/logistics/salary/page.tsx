'use client';

import React, { useRef, useState, useEffect } from 'react';
import { ProTable, ProColumns, ActionType, EditableProTable } from '@ant-design/pro-components';
import { Button, message, Space, Modal, Form, InputNumber, Select, Typography, Tag, Card, Tabs, Tooltip, Divider, Input, Row, Col, Popconfirm } from 'antd';
import { EditOutlined, CalculatorOutlined, InfoCircleOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { 
  getSalaryList, 
  updateSalaryOther, 
  MonthlySalary, 
  SalaryDetail, 
  getCommissionStrategies, 
  saveCommissionStrategy, 
  deleteCommissionStrategy,
  CommissionStrategy,
  CommissionGradient
} from '@/service/salary';
import { getCampList, Camp } from '@/service/camp';
import { useCampFilter } from '@/hooks/useCampFilter';
import { usePermission } from '@/hooks/usePermission';

const { Text, Title } = Typography;

export default function SalaryPage() {
  const actionRef = useRef<ActionType>(null);
  const strategyActionRef = useRef<ActionType>(null);
  const [form] = Form.useForm();
  const [strategyForm] = Form.useForm();
  const [activeTab, setActiveTab] = useState('summary');
  const [modalVisible, setModalVisible] = useState(false);
  const [strategyModalVisible, setStrategyModalVisible] = useState(false);
  const [editingDetail, setEditingDetail] = useState<{ detail: SalaryDetail; month: string; campId: number } | null>(null);
  const [editingStrategy, setEditingStrategy] = useState<CommissionStrategy | null>(null);
  const { isSuperAdmin, isCampAdmin } = usePermission();
  const canEdit = isSuperAdmin || isCampAdmin;

  const handleEdit = (detail: SalaryDetail, month: string, campId: number) => {
    setEditingDetail({ detail, month, campId });
    const remarkValue = detail.remark ? detail.remark.split(', ') : [];
    form.setFieldsValue({
      other: detail.other,
      remark: remarkValue,
    });
    setModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      if (!editingDetail) return;

      const remarkStr = Array.isArray(values.remark) ? values.remark.join(', ') : values.remark;

      const res = await updateSalaryOther({
        empId: editingDetail.detail.empId,
        month: editingDetail.month,
        campId: editingDetail.campId,
        other: values.other,
        remark: remarkStr,
      });

      if (res.success) {
        message.success('更新成功');
        setModalVisible(false);
        actionRef.current?.reload();
      }
    } catch (error) {
      console.error('Update failed:', error);
    }
  };

  const handleSaveStrategy = async () => {
    try {
      const values = await strategyForm.validateFields();
      const res = await saveCommissionStrategy({
        ...editingStrategy,
        ...values,
      });
      if (res.success) {
        message.success('保存成功');
        setStrategyModalVisible(false);
        strategyActionRef.current?.reload();
      }
    } catch (error) {
      console.error('Save strategy failed:', error);
    }
  };

  const parentColumns: ProColumns<MonthlySalary>[] = [
    {
      title: '月份',
      dataIndex: 'month',
      valueType: 'dateMonth',
      width: 100,
    },
    {
      title: '营地',
      dataIndex: 'campId',
      hideInTable: true,
      valueType: 'select',
      initialValue: useCampFilter().getDefaultCampId(),
      fieldProps: {
        disabled: !isSuperAdmin,
      },
      request: async () => {
        const res = await getCampList();
        return (res.data || []).map(item => ({
          label: item.campName,
          value: item.campId,
        }));
      },
    },
    {
      title: '总工资金额',
      dataIndex: 'totalAmount',
      valueType: 'money',
      hideInSearch: true,
      width: 150,
      align: 'right',
      render: (_, record) => (
        <Text strong type="danger" style={{ whiteSpace: 'nowrap', fontSize: 16 }}>
          ¥{Number(record.totalAmount || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </Text>
      ),
    },
    {
      title: '总底薪',
      dataIndex: 'totalBase',
      valueType: 'money',
      hideInSearch: true,
      width: 120,
      align: 'right',
      render: (val) => <span style={{ whiteSpace: 'nowrap', color: '#666' }}>{val}</span>,
    },
    {
      title: '总提成',
      dataIndex: 'totalCommission',
      valueType: 'money',
      hideInSearch: true,
      width: 120,
      align: 'right',
      render: (val) => (
        <Text type="success" strong style={{ whiteSpace: 'nowrap' }}>
          {val}
        </Text>
      ),
    },
    {
      title: '总其他',
      dataIndex: 'totalOther',
      valueType: 'money',
      hideInSearch: true,
      width: 120,
      align: 'right',
      render: (val) => <span style={{ whiteSpace: 'nowrap', color: '#666' }}>{val}</span>,
    },
    {
      title: '操作',
      valueType: 'option',
      width: 100,
      render: () => <Text type="secondary" style={{ fontSize: 12 }}>展开查看详情</Text>
    }
  ];

  const childColumns = (month: string, campId: number): ProColumns<SalaryDetail>[] => [
    {
      title: '员工姓名',
      dataIndex: 'empName',
      width: 100,
      fixed: 'left',
    },
    {
      title: '岗位',
      dataIndex: 'role',
      width: 100,
      render: (role) => <Tag color="blue" style={{ marginRight: 0 }}>{role as string}</Tag>,
    },
    {
      title: '底薪',
      dataIndex: 'baseSalary',
      valueType: 'money',
      width: 110,
      align: 'right',
      render: (val) => <span style={{ whiteSpace: 'nowrap', fontWeight: 500 }}>{val}</span>,
    },
    {
      title: '提成',
      dataIndex: 'commissions',
      width: 160,
      align: 'right',
      render: (_, record) => {
        const { recruitment, privateCoaching, renewal } = record.commissions;
        const total = Number(recruitment || 0) + Number(privateCoaching || 0) + Number(renewal || 0);
        if (total === 0) return <span style={{ whiteSpace: 'nowrap', color: '#bfbfbf' }}>¥0.00</span>;
        return (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <Text type="success" strong style={{ whiteSpace: 'nowrap' }}>
              ¥{total.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
            </Text>
            <Tooltip title={
              <div style={{ padding: '4px' }}>
                <div style={{ marginBottom: 4, borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: 4 }}>提成明细:</div>
                <div>招生提成: ¥{Number(recruitment || 0).toFixed(2)}</div>
                <div>私教提成: ¥{Number(privateCoaching || 0).toFixed(2)}</div>
                <div>续住提成: ¥{Number(renewal || 0).toFixed(2)}</div>
              </div>
            }>
              <Text type="secondary" style={{ fontSize: 11, cursor: 'help', lineHeight: '12px' }}>
                (招:{Number(recruitment || 0).toFixed(0)} 私:{Number(privateCoaching || 0).toFixed(0)} 续:{Number(renewal || 0).toFixed(0)}) <InfoCircleOutlined style={{ fontSize: 10 }} />
              </Text>
            </Tooltip>
          </div>
        );
      },
    },
    {
      title: '其他',
      dataIndex: 'other',
      valueType: 'money',
      width: 100,
      align: 'right',
      render: (val) => <span style={{ whiteSpace: 'nowrap' }}>{val}</span>,
    },
    {
      title: '总工资',
      dataIndex: 'totalSalary',
      valueType: 'money',
      width: 120,
      align: 'right',
      render: (_, record) => (
        <Text strong type="danger" style={{ whiteSpace: 'nowrap', fontSize: 15 }}>
          ¥{Number(record.totalSalary || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </Text>
      ),
    },
    {
      title: '备注',
      dataIndex: 'remark',
      ellipsis: true,
      minWidth: 150,
      render: (val) => val || <Text type="secondary">-</Text>,
    },
    {
      title: '提成规则',
      dataIndex: 'ruleSummary',
      hideInSearch: true,
      width: 120,
      render: (_, record) => {
        if (!record.allowCommission) {
          return <Text type="secondary" style={{ fontSize: 12 }}>无</Text>;
        }
        return (
          <Tooltip title="基于当月设定的梯度提成策略自动计算">
            <Text type="secondary" style={{ fontSize: 12, borderBottom: '1px dashed #ccc', cursor: 'help' }}>梯度比例计算</Text>
          </Tooltip>
        );
      }
    },
    {
      title: '操作',
      valueType: 'option',
      width: 80,
      fixed: 'right',
      hideInTable: !canEdit,
      render: (_, record) => [
        <Button 
          key="edit" 
          type="link" 
          size="small" 
          icon={<EditOutlined />} 
          style={{ padding: 0 }}
          onClick={() => handleEdit(record, month, campId)}
        >
          调整
        </Button>,
      ],
    },
  ];

  const strategyColumns: ProColumns<CommissionStrategy>[] = [
    {
      title: '月份',
      dataIndex: 'month',
      valueType: 'dateMonth',
      width: 120,
    },
    {
      title: '适用岗位',
      dataIndex: 'role',
      valueType: 'select',
      valueEnum: {
        '教练': { text: '教练' },
        '教练管理员': { text: '教练管理员' },
        '招生老师': { text: '招生老师' },
      },
    },
    {
      title: '提成类型',
      dataIndex: 'type',
      valueType: 'select',
      valueEnum: {
        'recruitment': { text: '招生提成' },
        'privateCoaching': { text: '私教提成' },
        'renewal': { text: '续住提成' },
      },
    },
    {
      title: '梯度规则',
      dataIndex: 'gradients',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          {record.gradients.map((g, i) => (
            <div key={i}>
              金额 ≥ ¥{g.threshold.toLocaleString()} : <Text type="success">{(g.rate * 100).toFixed(1)}%</Text>
            </div>
          ))}
        </Space>
      ),
    },
    {
      title: '操作',
      valueType: 'option',
      width: 150,
      render: (_, record) => [
        <Button 
          key="edit" 
          type="link" 
          size="small" 
          icon={<EditOutlined />} 
          onClick={() => {
            setEditingStrategy(record);
            strategyForm.setFieldsValue(record);
            setStrategyModalVisible(true);
          }}
        >
          编辑
        </Button>,
        <Popconfirm 
          key="delete" 
          title="确定删除吗？" 
          onConfirm={async () => {
            await deleteCommissionStrategy(record.id);
            message.success('删除成功');
            strategyActionRef.current?.reload();
          }}
        >
          <Button type="link" danger size="small" icon={<DeleteOutlined />}>删除</Button>
        </Popconfirm>
      ],
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card bordered={false} style={{ marginBottom: 24 }}>
        <Space>
          <CalculatorOutlined style={{ fontSize: 24, color: '#1890ff' }} />
          <Title level={4} style={{ margin: 0 }}>薪资与提成管理</Title>
        </Space>
      </Card>

      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        items={[
          {
            key: 'summary',
            label: '工资汇总',
            children: (
              <ProTable<MonthlySalary>
                headerTitle="每月工资汇总表"
                actionRef={actionRef}
                columns={parentColumns}
                request={async (params) => {
                  const res = await getSalaryList({
                    campId: params.campId ? Number(params.campId) : undefined,
                    month: params.month,
                  });
                  return {
                    data: res.data || [],
                    success: true,
                  };
                }}
                rowKey="month"
                pagination={false}
                scroll={{ x: 'max-content' }}
                expandable={{
                  expandedRowRender: (record) => (
                    <div style={{ margin: '0 24px 16px 48px', padding: '16px', background: '#fafafa', borderRadius: '8px', border: '1px solid #f0f0f0' }}>
                      <ProTable<SalaryDetail>
                        columns={childColumns(record.month, record.campId)}
                        headerTitle={<span style={{ fontSize: 14, color: '#666' }}>薪资明细清单</span>}
                        search={false}
                        options={false}
                        dataSource={record.details}
                        pagination={false}
                        rowKey="empId"
                        size="small"
                        scroll={{ x: 'max-content' }}
                        expandable={{
                          rowExpandable: (record) => record.allowCommission,
                          expandedRowRender: (record) => (
                            <div style={{ margin: '8px 0', padding: '12px', background: '#fff', borderRadius: '4px', border: '1px dashed #e8e8e8' }}>
                              <Text strong style={{ fontSize: 13, marginBottom: 8, display: 'block' }}>提成计算详情：</Text>
                              <Row gutter={16}>
                                {[
                                  { label: '招生提成', performance: record.performance?.recruitment },
                                  { label: '私教提成', performance: record.performance?.privateCoaching },
                                  { label: '续住提成', performance: record.performance?.renewal }
                                ].map((item, index) => (
                                  <Col span={8} key={index}>
                                    <div style={{ padding: '8px', background: '#f9f9f9', borderRadius: '4px' }}>
                                      <div style={{ color: '#888', fontSize: 12 }}>{item.label}</div>
                                      <div style={{ marginTop: 4 }}>
                                        业绩：<Text strong>¥{Number(item.performance?.actual || 0).toLocaleString()}</Text>
                                      </div>
                                      <div style={{ fontSize: 12, color: '#666' }}>
                                        匹配比例：<Tag color="green" style={{ margin: 0, fontSize: 11 }}>{(Number(item.performance?.rate || 0) * 100).toFixed(1)}%</Tag>
                                      </div>
                                      <div style={{ marginTop: 4, borderTop: '1px solid #eee', paddingTop: 4 }}>
                                        提成：<Text type="success" strong>¥{(Number(item.performance?.actual || 0) * Number(item.performance?.rate || 0)).toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
                                      </div>
                                    </div>
                                  </Col>
                                ))}
                              </Row>
                            </div>
                          ),
                        }}
                      />
                    </div>
                  ),
                  defaultExpandAllRows: true,
                }}
                search={{ labelWidth: 'auto' }}
              />
            ),
          },
          {
            key: 'strategy',
            label: '提成策略设置',
            children: (
              <ProTable<CommissionStrategy>
                headerTitle="提成计算规则配置"
                actionRef={strategyActionRef}
                columns={strategyColumns}
                request={async (params) => {
                  const res = await getCommissionStrategies({
                    month: params.month,
                    role: params.role,
                  });
                  return {
                    data: res.data || [],
                    success: true,
                  };
                }}
                rowKey="id"
                toolBarRender={() => [
                  <Button 
                    key="add" 
                    type="primary" 
                    icon={<PlusOutlined />}
                    onClick={() => {
                      setEditingStrategy(null);
                      strategyForm.resetFields();
                      strategyForm.setFieldsValue({ gradients: [{ threshold: 0, rate: 0.05 }] });
                      setStrategyModalVisible(true);
                    }}
                  >
                    新增策略
                  </Button>
                ]}
                search={{ labelWidth: 'auto' }}
              />
            ),
          }
        ]}
      />

      <Modal
        title="工资调整"
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item label="员工">
            <Text strong>{editingDetail?.detail.empName}</Text>
            <Tag style={{ marginLeft: 8 }}>{editingDetail?.detail.role}</Tag>
          </Form.Item>
          <Form.Item label="月份">
            <Text>{editingDetail?.month}</Text>
          </Form.Item>
          <Form.Item name="other" label="其他调整金额" rules={[{ required: true, message: '请输入调整金额' }]}>
            <InputNumber style={{ width: '100%' }} precision={2} prefix="¥" placeholder="支持负数" />
          </Form.Item>
          <Form.Item name="remark" label="备注说明">
            <Select mode="tags" placeholder="请选择或输入备注" style={{ width: '100%' }}
              options={[{ label: '加班补贴', value: '加班补贴' }, { label: '绩效奖金', value: '绩效奖金' }, { label: '全勤奖', value: '全勤奖' }, { label: '请假扣除', value: '请假扣除' }]}
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={editingStrategy ? '编辑提成策略' : '新增提成策略'}
        open={strategyModalVisible}
        onOk={handleSaveStrategy}
        onCancel={() => setStrategyModalVisible(false)}
        width={600}
        destroyOnClose
      >
        <Form form={strategyForm} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="month" label="适用月份" rules={[{ required: true }]}>
                <Select placeholder="选择月份">
                  {Array.from({ length: 6 }).map((_, i) => {
                    const m = dayjs().subtract(i - 1, 'month').format('YYYY-MM');
                    return <Select.Option key={m} value={m}>{m}</Select.Option>;
                  })}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="role" label="适用岗位" rules={[{ required: true }]}>
                <Select placeholder="选择岗位">
                  <Select.Option value="教练">教练</Select.Option>
                  <Select.Option value="教练管理员">教练管理员</Select.Option>
                  <Select.Option value="招生老师">招生老师</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="type" label="提成类型" rules={[{ required: true }]}>
            <Select placeholder="选择类型">
              <Select.Option value="recruitment">招生提成</Select.Option>
              <Select.Option value="privateCoaching">私教提成</Select.Option>
              <Select.Option value="renewal">续住提成</Select.Option>
            </Select>
          </Form.Item>
          
          <Divider plain style={{ fontSize: 14 }}>梯度规则配置</Divider>
          
          <Form.List name="gradients">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                    <Form.Item
                      {...restField}
                      name={[name, 'threshold']}
                      label={name === 0 ? "起征金额" : ""}
                      rules={[{ required: true, message: '金额' }]}
                    >
                      <InputNumber prefix="¥" placeholder="阈值" style={{ width: 150 }} />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'rate']}
                      label={name === 0 ? "提成比例" : ""}
                      rules={[{ required: true, message: '比例' }]}
                    >
                      <InputNumber min={0} max={1} step={0.01} precision={3} 
                        formatter={value => `${(Number(value) * 100).toFixed(1)}%`}
                        parser={value => {
                          const val = String(value || '').replace('%', '');
                          return (Number(val) / 100) as unknown as 0 | 1;
                        }}
                        style={{ width: 120 }}
                      />
                    </Form.Item>
                    {fields.length > 1 && (
                      <DeleteOutlined onClick={() => remove(name)} style={{ color: '#ff4d4f', cursor: 'pointer' }} />
                    )}
                  </Space>
                ))}
                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                  添加梯度
                </Button>
              </>
            )}
          </Form.List>
        </Form>
      </Modal>
    </div>
  );
}

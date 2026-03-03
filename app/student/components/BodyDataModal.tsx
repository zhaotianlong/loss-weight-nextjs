'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Modal, Table, Tabs, Card, Space, Typography, Empty, Spin } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getBodyDataList, type BodyData } from '@/service/bodyData';
import { useMSW } from '@/mocks/MSWContext';

const { Title, Text } = Typography;

interface BodyDataModalProps {
  visible: boolean;
  studentId: number;
  studentName?: string;
  onCancel: () => void;
}

export default function BodyDataModal({ visible, studentId, studentName, onCancel }: BodyDataModalProps) {
  const { isReady: mswReady } = useMSW();
  const [loading, setLoading] = useState(false);
  const [bodyDataList, setBodyDataList] = useState<BodyData[]>([]);

  const fetchBodyData = useCallback(async () => {
    if (!studentId) return;
    setLoading(true);
    try {
      const response = await getBodyDataList({ 
        stuId: studentId,
        pageSize: 1000 // 获取所有数据用于图表
      });
      if (response.success && response.data) {
        // 按测量日期排序
        const sortedData = [...response.data].sort((a, b) => 
          new Date(a.measuredAt).getTime() - new Date(b.measuredAt).getTime()
        );
        setBodyDataList(sortedData);
      }
    } catch (error) {
      console.error('获取身体数据失败:', error);
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    if (visible && studentId && mswReady) {
      fetchBodyData();
    }
  }, [visible, studentId, mswReady, fetchBodyData]);

  // 准备图表数据（只包含有值的字段）
  const chartData = bodyDataList.map((item) => {
    const data: Record<string, string | number | undefined> = {
      date: item.measuredAt,
      weight: item.weight,
      bmi: item.bmi,
    };
    if (item.fatRate !== undefined) data.fatRate = item.fatRate;
    if (item.muscleRate !== undefined) data.muscleRate = item.muscleRate;
    if (item.muscleMass !== undefined) data.muscleMass = item.muscleMass;
    if (item.waistCircumference !== undefined) data.waistCircumference = item.waistCircumference;
    if (item.hipCircumference !== undefined) data.hipCircumference = item.hipCircumference;
    if (item.chestCircumference !== undefined) data.chestCircumference = item.chestCircumference;
    if (item.armCircumference !== undefined) data.armCircumference = item.armCircumference;
    if (item.legCircumference !== undefined) data.legCircumference = item.legCircumference;
    return data;
  });

  // 表格列定义
  const columns = [
    {
      title: '测量日期',
      dataIndex: 'measuredAt',
      key: 'measuredAt',
      width: 120,
    },
    {
      title: '测量类型',
      dataIndex: 'measureType',
      key: 'measureType',
      width: 100,
    },
    {
      title: '体重(kg)',
      dataIndex: 'weight',
      key: 'weight',
      width: 100,
      render: (val: number) => val?.toFixed(1),
    },
    {
      title: 'BMI',
      dataIndex: 'bmi',
      key: 'bmi',
      width: 80,
      render: (val: number) => val?.toFixed(1),
    },
    {
      title: '体脂率(%)',
      dataIndex: 'fatRate',
      key: 'fatRate',
      width: 100,
      render: (val?: number) => val !== undefined ? val.toFixed(1) : '-',
    },
    {
      title: '肌肉率(%)',
      dataIndex: 'muscleRate',
      key: 'muscleRate',
      width: 100,
      render: (val?: number) => val !== undefined ? val.toFixed(1) : '-',
    },
    {
      title: '肌肉量(kg)',
      dataIndex: 'muscleMass',
      key: 'muscleMass',
      width: 100,
      render: (val?: number) => val !== undefined ? val.toFixed(1) : '-',
    },
    {
      title: '腰围(cm)',
      dataIndex: 'waistCircumference',
      key: 'waistCircumference',
      width: 100,
      render: (val?: number) => val !== undefined ? val.toFixed(1) : '-',
    },
    {
      title: '臀围(cm)',
      dataIndex: 'hipCircumference',
      key: 'hipCircumference',
      width: 100,
      render: (val?: number) => val !== undefined ? val.toFixed(1) : '-',
    },
    {
      title: '胸围(cm)',
      dataIndex: 'chestCircumference',
      key: 'chestCircumference',
      width: 100,
      render: (val?: number) => val !== undefined ? val.toFixed(1) : '-',
    },
    {
      title: '臂围(cm)',
      dataIndex: 'armCircumference',
      key: 'armCircumference',
      width: 100,
      render: (val?: number) => val !== undefined ? val.toFixed(1) : '-',
    },
    {
      title: '腿围(cm)',
      dataIndex: 'legCircumference',
      key: 'legCircumference',
      width: 100,
      render: (val?: number) => val !== undefined ? val.toFixed(1) : '-',
    },
    {
      title: '备注',
      dataIndex: 'note',
      key: 'note',
      ellipsis: true,
    },
  ];

  // 计算变化趋势
  const getTrend = (current?: number, previous?: number) => {
    if (current === undefined || previous === undefined) return null;
    const diff = current - previous;
    const percent = ((diff / previous) * 100).toFixed(1);
    return { diff, percent };
  };

  const latestData = bodyDataList[bodyDataList.length - 1];
  const previousData = bodyDataList.length > 1 ? bodyDataList[bodyDataList.length - 2] : null;

  return (
    <Modal
      title={
        <Space>
          <span>身体数据记录</span>
          {studentName && <Text type="secondary">({studentName})</Text>}
        </Space>
      }
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={1200}
      destroyOnClose
    >
      <Spin spinning={loading}>
        {bodyDataList.length === 0 ? (
          <Empty description="暂无身体数据记录" style={{ padding: '40px 0' }} />
        ) : (
          <Tabs
            defaultActiveKey="chart"
            items={[
              {
                key: 'chart',
                label: '数据趋势',
                children: (
                  <div>
                    {/* 最新数据概览 */}
                    {latestData && (
                      <Card size="small" style={{ marginBottom: 16 }}>
                        <Title level={5}>最新数据</Title>
                        <Space size="large" wrap>
                          <div>
                            <Text type="secondary">体重:</Text>
                            <Text strong style={{ marginLeft: 8 }}>{latestData.weight} kg</Text>
                            {previousData && getTrend(latestData.weight, previousData.weight) && (
                              <Text 
                                type={getTrend(latestData.weight, previousData.weight)!.diff < 0 ? 'success' : 'danger'}
                                style={{ marginLeft: 8 }}
                              >
                                ({getTrend(latestData.weight, previousData.weight)!.diff > 0 ? '+' : ''}
                                {getTrend(latestData.weight, previousData.weight)!.diff.toFixed(1)} kg, 
                                {getTrend(latestData.weight, previousData.weight)!.percent}%)
                              </Text>
                            )}
                          </div>
                          <div>
                            <Text type="secondary">BMI:</Text>
                            <Text strong style={{ marginLeft: 8 }}>{latestData.bmi.toFixed(1)}</Text>
                            {previousData && getTrend(latestData.bmi, previousData.bmi) && (
                              <Text 
                                type={getTrend(latestData.bmi, previousData.bmi)!.diff < 0 ? 'success' : 'danger'}
                                style={{ marginLeft: 8 }}
                              >
                                ({getTrend(latestData.bmi, previousData.bmi)!.diff > 0 ? '+' : ''}
                                {getTrend(latestData.bmi, previousData.bmi)!.diff.toFixed(1)}, 
                                {getTrend(latestData.bmi, previousData.bmi)!.percent}%)
                              </Text>
                            )}
                          </div>
                          {latestData.fatRate !== undefined && (
                            <div>
                              <Text type="secondary">体脂率:</Text>
                              <Text strong style={{ marginLeft: 8 }}>{latestData.fatRate.toFixed(1)}%</Text>
                              {previousData?.fatRate !== undefined && getTrend(latestData.fatRate, previousData.fatRate) && (
                                <Text 
                                  type={getTrend(latestData.fatRate, previousData.fatRate)!.diff < 0 ? 'success' : 'danger'}
                                  style={{ marginLeft: 8 }}
                                >
                                  {getTrend(latestData.fatRate, previousData.fatRate)!.diff > 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                                  <span style={{ marginLeft: 4 }}>
                                    ({getTrend(latestData.fatRate, previousData.fatRate)!.diff > 0 ? '+' : ''}
                                    {getTrend(latestData.fatRate, previousData.fatRate)!.diff.toFixed(1)}%, 
                                    {getTrend(latestData.fatRate, previousData.fatRate)!.percent}%)
                                  </span>
                                </Text>
                              )}
                            </div>
                          )}
                          {latestData.muscleMass !== undefined && (
                            <div>
                              <Text type="secondary">肌肉量:</Text>
                              <Text strong style={{ marginLeft: 8 }}>{latestData.muscleMass.toFixed(1)} kg</Text>
                              {previousData?.muscleMass !== undefined && getTrend(latestData.muscleMass, previousData.muscleMass) && (
                                <Text 
                                  type={getTrend(latestData.muscleMass, previousData.muscleMass)!.diff > 0 ? 'success' : 'danger'}
                                  style={{ marginLeft: 8 }}
                                >
                                  ({getTrend(latestData.muscleMass, previousData.muscleMass)!.diff > 0 ? '+' : ''}
                                  {getTrend(latestData.muscleMass, previousData.muscleMass)!.diff.toFixed(1)} kg, 
                                  {getTrend(latestData.muscleMass, previousData.muscleMass)!.percent}%)
                                </Text>
                              )}
                            </div>
                          )}
                        </Space>
                      </Card>
                    )}

                    {/* 围度指标概览 */}
                    {latestData && (
                      (latestData.waistCircumference !== undefined ||
                       latestData.hipCircumference !== undefined ||
                       latestData.chestCircumference !== undefined ||
                       latestData.armCircumference !== undefined ||
                       latestData.legCircumference !== undefined) && (
                        <Card size="small" style={{ marginBottom: 16 }}>
                          <Title level={5}>围度指标</Title>
                          <Space size="large" wrap>
                            {latestData.waistCircumference !== undefined && (
                              <div>
                                <Text type="secondary">腰围:</Text>
                                <Text strong style={{ marginLeft: 8 }}>{latestData.waistCircumference.toFixed(1)} cm</Text>
                                {previousData?.waistCircumference !== undefined && getTrend(latestData.waistCircumference, previousData.waistCircumference) && (
                                  <Text 
                                    type={getTrend(latestData.waistCircumference, previousData.waistCircumference)!.diff < 0 ? 'success' : 'danger'}
                                    style={{ marginLeft: 8 }}
                                  >
                                    ({getTrend(latestData.waistCircumference, previousData.waistCircumference)!.diff > 0 ? '+' : ''}
                                    {getTrend(latestData.waistCircumference, previousData.waistCircumference)!.diff.toFixed(1)} cm)
                                  </Text>
                                )}
                              </div>
                            )}
                            {latestData.hipCircumference !== undefined && (
                              <div>
                                <Text type="secondary">臀围:</Text>
                                <Text strong style={{ marginLeft: 8 }}>{latestData.hipCircumference.toFixed(1)} cm</Text>
                                {previousData?.hipCircumference !== undefined && getTrend(latestData.hipCircumference, previousData.hipCircumference) && (
                                  <Text 
                                    type={getTrend(latestData.hipCircumference, previousData.hipCircumference)!.diff < 0 ? 'success' : 'danger'}
                                    style={{ marginLeft: 8 }}
                                  >
                                    ({getTrend(latestData.hipCircumference, previousData.hipCircumference)!.diff > 0 ? '+' : ''}
                                    {getTrend(latestData.hipCircumference, previousData.hipCircumference)!.diff.toFixed(1)} cm)
                                  </Text>
                                )}
                              </div>
                            )}
                            {latestData.chestCircumference !== undefined && (
                              <div>
                                <Text type="secondary">胸围:</Text>
                                <Text strong style={{ marginLeft: 8 }}>{latestData.chestCircumference.toFixed(1)} cm</Text>
                                {previousData?.chestCircumference !== undefined && getTrend(latestData.chestCircumference, previousData.chestCircumference) && (
                                  <Text 
                                    type={getTrend(latestData.chestCircumference, previousData.chestCircumference)!.diff < 0 ? 'success' : 'danger'}
                                    style={{ marginLeft: 8 }}
                                  >
                                    ({getTrend(latestData.chestCircumference, previousData.chestCircumference)!.diff > 0 ? '+' : ''}
                                    {getTrend(latestData.chestCircumference, previousData.chestCircumference)!.diff.toFixed(1)} cm)
                                  </Text>
                                )}
                              </div>
                            )}
                            {latestData.armCircumference !== undefined && (
                              <div>
                                <Text type="secondary">臂围:</Text>
                                <Text strong style={{ marginLeft: 8 }}>{latestData.armCircumference.toFixed(1)} cm</Text>
                                {previousData?.armCircumference !== undefined && getTrend(latestData.armCircumference, previousData.armCircumference) && (
                                  <Text 
                                    type={getTrend(latestData.armCircumference, previousData.armCircumference)!.diff > 0 ? 'success' : 'danger'}
                                    style={{ marginLeft: 8 }}
                                  >
                                    ({getTrend(latestData.armCircumference, previousData.armCircumference)!.diff > 0 ? '+' : ''}
                                    {getTrend(latestData.armCircumference, previousData.armCircumference)!.diff.toFixed(1)} cm)
                                  </Text>
                                )}
                              </div>
                            )}
                            {latestData.legCircumference !== undefined && (
                              <div>
                                <Text type="secondary">腿围:</Text>
                                <Text strong style={{ marginLeft: 8 }}>{latestData.legCircumference.toFixed(1)} cm</Text>
                                {previousData?.legCircumference !== undefined && getTrend(latestData.legCircumference, previousData.legCircumference) && (
                                  <Text 
                                    type={getTrend(latestData.legCircumference, previousData.legCircumference)!.diff > 0 ? 'success' : 'danger'}
                                    style={{ marginLeft: 8 }}
                                  >
                                    ({getTrend(latestData.legCircumference, previousData.legCircumference)!.diff > 0 ? '+' : ''}
                                    {getTrend(latestData.legCircumference, previousData.legCircumference)!.diff.toFixed(1)} cm)
                                  </Text>
                                )}
                              </div>
                            )}
                          </Space>
                        </Card>
                      )
                    )}

                    {/* 体重趋势图 */}
                    <Card size="small" style={{ marginBottom: 16 }}>
                      <Title level={5}>体重变化趋势 (kg)</Title>
                      <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="weight" stroke="#1890ff" strokeWidth={2} dot={{ r: 4 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </Card>

                    {/* BMI和体脂率趋势图 */}
                    <Card size="small" style={{ marginBottom: 16 }}>
                      <Title level={5}>BMI & 体脂率变化趋势</Title>
                      <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis yAxisId="left" />
                          <YAxis yAxisId="right" orientation="right" />
                          <Tooltip />
                          <Legend />
                          <Line 
                            yAxisId="left"
                            type="monotone" 
                            dataKey="bmi" 
                            stroke="#52c41a" 
                            strokeWidth={2} 
                            dot={{ r: 4 }}
                            name="BMI"
                          />
                          <Line 
                            yAxisId="right"
                            type="monotone" 
                            dataKey="fatRate" 
                            stroke="#ff4d4f" 
                            strokeWidth={2} 
                            dot={{ r: 4 }}
                            name="体脂率(%)"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </Card>

                    {/* 肌肉相关指标趋势图 */}
                    {(bodyDataList.some(item => item.muscleRate !== undefined) || 
                      bodyDataList.some(item => item.muscleMass !== undefined)) && (
                      <Card size="small" style={{ marginBottom: 16 }}>
                        <Title level={5}>肌肉相关指标变化趋势</Title>
                        <ResponsiveContainer width="100%" height={250}>
                          <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis yAxisId="left" />
                            <YAxis yAxisId="right" orientation="right" />
                            <Tooltip />
                            <Legend />
                            {bodyDataList.some(item => item.muscleRate !== undefined) && (
                              <Line 
                                yAxisId="left"
                                type="monotone" 
                                dataKey="muscleRate" 
                                stroke="#722ed1" 
                                strokeWidth={2} 
                                dot={{ r: 4 }}
                                name="肌肉率(%)"
                              />
                            )}
                            {bodyDataList.some(item => item.muscleMass !== undefined) && (
                              <Line 
                                yAxisId="right"
                                type="monotone" 
                                dataKey="muscleMass" 
                                stroke="#fa8c16" 
                                strokeWidth={2} 
                                dot={{ r: 4 }}
                                name="肌肉量(kg)"
                              />
                            )}
                          </LineChart>
                        </ResponsiveContainer>
                      </Card>
                    )}

                    {/* 围度指标趋势图 */}
                    {(bodyDataList.some(item => item.waistCircumference !== undefined) ||
                      bodyDataList.some(item => item.hipCircumference !== undefined) ||
                      bodyDataList.some(item => item.chestCircumference !== undefined) ||
                      bodyDataList.some(item => item.armCircumference !== undefined) ||
                      bodyDataList.some(item => item.legCircumference !== undefined)) && (
                      <Card size="small">
                        <Title level={5}>围度指标变化趋势 (cm)</Title>
                        <ResponsiveContainer width="100%" height={300}>
                          <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            {bodyDataList.some(item => item.waistCircumference !== undefined) && (
                              <Line 
                                type="monotone" 
                                dataKey="waistCircumference" 
                                stroke="#13c2c2" 
                                strokeWidth={2} 
                                dot={{ r: 4 }}
                                name="腰围"
                              />
                            )}
                            {bodyDataList.some(item => item.hipCircumference !== undefined) && (
                              <Line 
                                type="monotone" 
                                dataKey="hipCircumference" 
                                stroke="#eb2f96" 
                                strokeWidth={2} 
                                dot={{ r: 4 }}
                                name="臀围"
                              />
                            )}
                            {bodyDataList.some(item => item.chestCircumference !== undefined) && (
                              <Line 
                                type="monotone" 
                                dataKey="chestCircumference" 
                                stroke="#faad14" 
                                strokeWidth={2} 
                                dot={{ r: 4 }}
                                name="胸围"
                              />
                            )}
                            {bodyDataList.some(item => item.armCircumference !== undefined) && (
                              <Line 
                                type="monotone" 
                                dataKey="armCircumference" 
                                stroke="#52c41a" 
                                strokeWidth={2} 
                                dot={{ r: 4 }}
                                name="臂围"
                              />
                            )}
                            {bodyDataList.some(item => item.legCircumference !== undefined) && (
                              <Line 
                                type="monotone" 
                                dataKey="legCircumference" 
                                stroke="#2f54eb" 
                                strokeWidth={2} 
                                dot={{ r: 4 }}
                                name="腿围"
                              />
                            )}
                          </LineChart>
                        </ResponsiveContainer>
                      </Card>
                    )}
                  </div>
                ),
              },
              {
                key: 'table',
                label: '历史记录',
                children: (
                  <Table
                    columns={columns}
                    dataSource={bodyDataList}
                    rowKey="recordId"
                    pagination={{
                      pageSize: 10,
                      showSizeChanger: true,
                      showTotal: (total) => `共 ${total} 条记录`,
                    }}
                    size="small"
                  />
                ),
              },
            ]}
          />
        )}
      </Spin>
    </Modal>
  );
}
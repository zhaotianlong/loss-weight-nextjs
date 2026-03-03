'use client';

import React, { useState, useEffect } from 'react';
import { Modal, Table, Tag, Typography, Spin, Empty, Space, Divider } from 'antd';
import dayjs from 'dayjs';
import { getDutyList, type Duty } from '@/service/duty';

const { Text } = Typography;

interface WeeklyRecipeModalProps {
  visible: boolean;
  onCancel: () => void;
  campId?: number;
  pivotDate: dayjs.Dayjs; // 本周的第一天 (周一)
}

const MEAL_TYPE_MAP: Record<string, { label: string; color: string }> = {
  breakfast: { label: '早餐', color: 'orange' },
  lunch: { label: '午餐', color: 'green' },
  dinner: { label: '晚餐', color: 'blue' },
  snack: { label: '加餐', color: 'purple' },
};

export default function WeeklyRecipeModal({ visible, onCancel, campId, pivotDate }: WeeklyRecipeModalProps) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Duty[]>([]);

  useEffect(() => {
    if (visible && campId) {
      fetchWeeklyData();
    }
  }, [visible, campId, pivotDate]);

  const fetchWeeklyData = async () => {
    setLoading(true);
    try {
      const res = await getDutyList({
        campId,
        type: 'meal',
        pageSize: 1000, 
      });

      const weeklyData = (res.data || []).filter(item => {
        const itemDate = dayjs(item.date);
        return (itemDate.isSame(pivotDate, 'day') || itemDate.isAfter(pivotDate)) && 
               (itemDate.isSame(pivotDate.add(6, 'day'), 'day') || itemDate.isBefore(pivotDate.add(6, 'day')));
      });

      // 排序：先按日期，再按时间段
      const sortedData = weeklyData.sort((a, b) => {
        if (a.date !== b.date) {
          return a.date.localeCompare(b.date);
        }
        return a.timeSlot.localeCompare(b.timeSlot);
      });

      setData(sortedData);
    } catch (error) {
      console.error('获取本周菜谱失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
      width: 120,
      render: (text) => (
        <span>
          {dayjs(text as string).format('MM-DD')} 
          <Text type="secondary" style={{ marginLeft: 4, fontSize: 12 }}>
            ({dayjs(text as string).format('ddd')})
          </Text>
        </span>
      ),
      onCell: (record: Duty, index?: number) => {
        if (index === undefined) return {};
        let rowSpan = 1;
        if (index > 0 && data[index - 1].date === record.date) {
          rowSpan = 0;
        } else {
          for (let i = index + 1; i < data.length; i++) {
            if (data[i].date === record.date) {
              rowSpan++;
            } else {
              break;
            }
          }
        }
        return { rowSpan };
      },
    },
    {
      title: '时段',
      dataIndex: 'timeSlot',
      key: 'timeSlot',
      width: 110,
      render: (text) => <Text strong>{text as React.ReactNode}</Text>,
    },
    {
      title: '类型',
      dataIndex: 'mealType',
      key: 'mealType',
      width: 90,
      render: (type) => {
        const info = MEAL_TYPE_MAP[type as string || ''] || { label: '餐食', color: 'default' };
        return <Tag color={info.color}>{info.label}</Tag>;
      },
    },
    {
      title: '菜谱内容',
      dataIndex: 'location',
      key: 'location',
      render: (text) => <Text>{(text as React.ReactNode) || '-'}</Text>,
    },
    {
      title: '营养成分',
      key: 'nutrition',
      width: 320,
      render: (_, record: Duty) => (
        <Space split={<Divider type="vertical" />} style={{ fontSize: 12 }}>
          {record.calories !== undefined && <span>热量: {record.calories}kcal</span>}
          {record.carbs !== undefined && <span>碳水: {record.carbs}g</span>}
          {record.protein !== undefined && <span>蛋白质: {record.protein}g</span>}
          {record.fat !== undefined && <span>脂肪: {record.fat}g</span>}
        </Space>
      ),
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      width: 150,
      render: (text) => <Text type="secondary" style={{ fontSize: 12 }}>{(text as React.ReactNode) || '-'}</Text>,
    },
  ];

  return (
    <Modal
      title={`本周菜谱安排 (${pivotDate.format('YYYY-MM-DD')} ~ ${pivotDate.add(6, 'day').format('YYYY-MM-DD')})`}
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={1200}
      style={{ top: 20 }}
      styles={{ body: { padding: '12px 24px 24px' } }}
    >
      <div style={{ minHeight: 400 }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '100px 0' }}><Spin tip="正在加载本周菜谱..." /></div>
        ) : data.length > 0 ? (
          <Table
            dataSource={data}
            columns={columns}
            rowKey="id"
            pagination={false}
            size="middle"
            bordered
            scroll={{ y: 'calc(100vh - 200px)' }}
          />
        ) : (
          <Empty description="本周暂无菜谱安排" style={{ marginTop: 100 }} />
        )}
      </div>
    </Modal>
  );
}

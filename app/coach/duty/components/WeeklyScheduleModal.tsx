'use client';

import React, { useState, useEffect } from 'react';
import { Modal, Table, Tag, Typography, Spin, Empty } from 'antd';
import dayjs from 'dayjs';
import { getDutyList, type Duty } from '@/service/duty';

const { Text } = Typography;

interface WeeklyScheduleModalProps {
  visible: boolean;
  onCancel: () => void;
  campId?: number;
  pivotDate: dayjs.Dayjs; // 本周的第一天 (周一)
}

const MEAL_TYPE_MAP: Record<string, string> = {
  breakfast: '早餐',
  lunch: '午餐',
  dinner: '晚餐',
  snack: '加餐',
};

export default function WeeklyScheduleModal({ visible, onCancel, campId, pivotDate }: WeeklyScheduleModalProps) {
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
      const startDate = pivotDate.format('YYYY-MM-DD');
      const endDate = pivotDate.add(6, 'day').format('YYYY-MM-DD');
      
      const res = await getDutyList({
        campId,
        // 这里假设后端支持日期范围查询，如果不支持，我们可能需要循环获取或修改接口
        // 实际上，目前的 mock 接口支持分页，我们可以一次性拿多点数据在前端过滤
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
      console.error('获取本周日程失败:', error);
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
        // 合并相同日期的单元格
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
      width: 120,
      render: (text) => <Text strong>{text as React.ReactNode}</Text>,
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type, record: Duty) => {
        if ((type as string) === 'meal') {
          return <Tag color="orange">{MEAL_TYPE_MAP[record.mealType || ''] || '餐饮'}</Tag>;
        }
        if ((type as string) === 'duty') {
          return <Tag color="blue">值班</Tag>;
        }
        return <Tag color="green">训练</Tag>;
      },
    },
    {
      title: '安排内容',
      key: 'content',
      render: (_, record: Duty) => (
        <Text>{record.location || record.remark || '-'}</Text>
      ),
    },
    {
      title: '负责教练',
      dataIndex: 'coach',
      key: 'coach',
      width: 150,
      render: (text) => (text as React.ReactNode) || <Text type="secondary" italic>未设置</Text>,
    },
  ];

  return (
    <Modal
      title={`本周日程安排 (${pivotDate.format('YYYY-MM-DD')} ~ ${pivotDate.add(6, 'day').format('YYYY-MM-DD')})`}
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={1100}
      style={{ top: 20 }}
      styles={{ body: { padding: '12px 24px 24px' } }}
    >
      <div style={{ minHeight: 400 }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '100px 0' }}><Spin tip="正在加载本周日程..." /></div>
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
          <Empty description="本周暂无日程安排" style={{ marginTop: 100 }} />
        )}
      </div>
    </Modal>
  );
}

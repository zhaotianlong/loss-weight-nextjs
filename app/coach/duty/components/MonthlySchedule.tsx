'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, Card, Badge, Typography, Button, Space, Empty, Spin, Tag } from 'antd';
const { Text } = Typography;
import { LeftOutlined, RightOutlined, CalendarOutlined } from '@ant-design/icons';
import { ProTable, type ProColumns } from '@ant-design/pro-components';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import { Popconfirm, message, Select } from 'antd';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { getDutyList, deleteDuty, updateDuty, type Duty } from '@/service/duty';
import { getCoachList, type CoachOption } from '@/service/coach';
import { getPublicCourseList, type PublicCourse } from '@/service/course';
import { useCampFilter } from '@/hooks/useCampFilter';

dayjs.locale('zh-cn');

// 节假日/气节模拟数据
const HOLIDAYS: Record<string, string[]> = {
  '2026-01-01': ['元旦（休）', '元旦'],
  '2026-01-04': ['元旦（班）'],
  '2026-01-05': ['小寒'],
  '2026-01-20': ['大寒'],
  '2026-02-04': ['立春'],
};

interface MonthlyScheduleProps {
  campId?: number;
  refreshKey?: number;
  onEdit?: (duty: Duty) => void;
}

export default function MonthlySchedule({ campId, refreshKey, onEdit }: MonthlyScheduleProps) {
  const [loading, setLoading] = useState(false);
  const [scheduleList, setScheduleList] = useState<Duty[]>([]);
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs>(dayjs());
  const [viewMode, setViewMode] = useState<'month' | 'year'>('month');
  const [coaches, setCoaches] = useState<CoachOption[]>([]);
  const [publicCourses, setPublicCourses] = useState<PublicCourse[]>([]);
  const { isSuper } = useCampFilter();

  useEffect(() => {
    fetchScheduleData();
    fetchBaseData();
  }, [campId, refreshKey]);

  const fetchBaseData = async () => {
    if (!campId) return;
    try {
      const [coachRes, courseRes] = await Promise.all([
        getCoachList({ campId }),
        getPublicCourseList({ campId, pageSize: 100 })
      ]);
      setCoaches(coachRes.data || []);
      setPublicCourses(courseRes.data || []);
    } catch (error) {
      console.error('获取基础数据失败:', error);
    }
  };

  const fetchScheduleData = async () => {
    setLoading(true);
    try {
      const res = await getDutyList({ campId });
      setScheduleList(res.data || []);
    } catch (error) {
      console.error('获取排班数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteDuty(id);
      message.success('删除成功');
      fetchScheduleData();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const tableData = useMemo(() => {
    const selected = dayjs(selectedDate);
    let filtered = [];
    if (viewMode === 'year') {
      filtered = scheduleList.filter(item => {
        const itemDate = dayjs(item.date);
        return itemDate.year() === selected.year() && itemDate.month() === selected.month();
      });
    } else {
      filtered = scheduleList.filter(item => {
        const itemDate = dayjs(item.date);
        return itemDate.isSame(selected, 'day');
      });
    }

    // 按照日期和时间排序
    return [...filtered].sort((a, b) => {
      const dateDiff = dayjs(a.date).diff(dayjs(b.date));
      if (dateDiff !== 0) return dateDiff;
      return a.timeSlot.localeCompare(b.timeSlot);
    });
  }, [scheduleList, selectedDate, viewMode]);

  const scheduleMap = useMemo(() => {
    const map: Record<string, Duty[]> = {};
    scheduleList.forEach(item => {
      if (!map[item.date]) {
        map[item.date] = [];
      }
      map[item.date].push(item);
    });
    return map;
  }, [scheduleList]);

  const dateCellRender = (value: dayjs.Dayjs) => {
    const dateStr = value.format('YYYY-MM-DD');
    const daySchedules = scheduleMap[dateStr] || [];
    const holidays = HOLIDAYS[dateStr] || [];
    const isToday = value.isSame(dayjs(), 'day');

    const getBadgeStatus = (type?: string) => {
      if (type === 'meal') return 'warning';
      if (type === 'duty') return 'processing';
      return 'success';
    };

    return (
      <div style={{ height: '100%', position: 'relative', padding: '2px' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-start', marginBottom: '2px' }}>
          <span style={{ 
            fontSize: '12px',
            color: isToday ? '#fff' : '#8c8c8c',
            background: isToday ? '#1890ff' : 'transparent',
            borderRadius: '50%',
            width: '20px',
            height: '20px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: isToday ? 'bold' : 'normal'
          }}>
            {value.date()}
          </span>
        </div>
        
        <div className="events" style={{ display: 'flex', flexDirection: 'column', gap: '2px', overflowY: 'auto', maxHeight: '80px' }}>
          {holidays.length > 0 && (
            <div style={{ display: 'flex', gap: '2px', flexWrap: 'wrap', marginBottom: 2 }}>
              {holidays.map((h, i) => (
                <div key={i} style={{ 
                  background: '#fff1f0', 
                  color: '#f5222d', 
                  fontSize: '10px', 
                  padding: '0 4px', 
                  borderRadius: '2px',
                  whiteSpace: 'nowrap',
                  border: '1px solid #ffa39e'
                }}>
                  {h}
                </div>
              ))}
            </div>
          )}

          {daySchedules.length > 0 ? (
            daySchedules.map(item => (
              <div key={item.id} style={{ fontSize: '10px', display: 'flex', alignItems: 'center', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                <Badge status={getBadgeStatus(item.type)} size="small" />
                <span style={{ color: '#595959', marginLeft: 4 }}>
                  {item.type === 'meal' ? '餐饮' : item.type === 'duty' ? '值班' : '训练'}
                </span>
              </div>
            ))
          ) : (
            !holidays.length && (
              <div style={{ 
                marginTop: '2px',
                background: '#f5f5f5', 
                color: '#bfbfbf', 
                fontSize: '10px', 
                padding: '0 6px', 
                borderRadius: '10px',
                textAlign: 'center',
                width: 'fit-content'
              }}>
                无安排
              </div>
            )
          )}
        </div>
      </div>
    );
  };

  const monthCellRender = (value: dayjs.Dayjs) => {
    const monthSchedules = scheduleList.filter(item => {
      const itemDate = dayjs(item.date);
      return itemDate.year() === value.year() && itemDate.month() === value.month();
    });

    if (monthSchedules.length === 0) {
      return (
        <div style={{ padding: '8px' }}>
          <Tag color="default" style={{ border: 'none', background: '#f5f5f5', color: '#bfbfbf' }}>无安排</Tag>
        </div>
      );
    }

    return (
      <div style={{ padding: '8px' }}>
        <div style={{ fontSize: '12px', color: '#1890ff' }}>
          <Badge color="#1890ff" /> {monthSchedules.length}项安排
        </div>
      </div>
    );
  };

  const handleCoachChange = async (id: number, coachIds: string[], coachNames: string) => {
    try {
      await updateDuty(id, { coachIds, coach: coachNames });
      message.success('教练已更新');
      fetchScheduleData();
    } catch (error) {
      message.error('更新失败');
    }
  };

  const getStatus = (date: string, timeSlot: string) => {
    const startTime = timeSlot.split('-')[0];
    const itemDateTime = dayjs(`${date}T${startTime}`);
    const now = dayjs();
    return itemDateTime.isBefore(now) ? 'completed' : 'pending';
  };

  const isPast = (date: string, timeSlot: string) => {
    const startTime = timeSlot.split('-')[0];
    const itemDateTime = dayjs(`${date}T${startTime}`);
    return itemDateTime.isBefore(dayjs());
  };

  const columns: ProColumns<Duty>[] = [
    {
      title: '时间',
      dataIndex: 'timeSlot',
      key: 'timeSlot',
      width: 120,
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      valueEnum: {
        meal: { text: '餐饮', status: 'Warning' },
        training: { text: '训练', status: 'Success' },
        duty: { text: '值班', status: 'Processing' },
      },
      width: 100,
    },
    {
      title: '排班内容',
      key: 'content',
      width: 200,
      render: (_, record) => {
        if (record.type === 'training' && record.courseId) {
          const course = publicCourses.find(c => c.courseId === record.courseId);
          return <Tag color="error">{course?.title || '未知课程'}</Tag>;
        }
        return <Text type="secondary">{record.remark || record.location || '-'}</Text>;
      }
    },
    {
      title: '负责教练',
      dataIndex: 'coach',
      key: 'coach',
      width: 120,
      render: (_, record) => {
        return (
            <Select
            mode="multiple"
            value={record.coachIds}
            style={{ width: '100%' }}
            bordered={false}
            allowClear
            placeholder="无"
            disabled={!isSuper && isPast(record.date, record.timeSlot)}
            onChange={(val, options) => {
              if (Array.isArray(options)) {
                const labels = options.map(opt => (opt as { label: string }).label).filter(Boolean).join('、');
                handleCoachChange(record.id, val, labels);
              }
            }}
            options={coaches.map(c => ({ label: c.label, value: c.value }))}
          />
        );
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (_, record) => {
        const status = getStatus(record.date, record.timeSlot);
        return status === 'completed' ? 
          <Tag color="success">已完成</Tag> : 
          <Tag color="default">未开始</Tag>;
      }
    },
    {
      title: '操作',
      valueType: 'option',
      width: 80,
      render: (_, record) => {
        if (isSuper || !isPast(record.date, record.timeSlot)) {
          return (
            <Space>
               <Button 
                type="text" 
                size="small" 
                icon={<EditOutlined />} 
                onClick={() => onEdit?.(record)}
              />
              <Popconfirm
                title="删除日程"
                description="确定要删除该日程安排吗？"
                onConfirm={() => handleDelete(record.id)}
                okText="确定"
                cancelText="取消"
              >
                <Button 
                  type="text" 
                  size="small" 
                  danger 
                  icon={<DeleteOutlined />} 
                />
              </Popconfirm>
            </Space>
          );
        }
        return null;
      },
    },
  ];

  if (loading && scheduleList.length === 0) {
    return <div style={{ textAlign: 'center', padding: 50 }}><Spin tip="加载中..." /></div>;
  }

  return (
    <div style={{ padding: '16px 0' }}>
      <Card variant="borderless" style={{ marginBottom: 16 }} styles={{ body: { padding: 0 } }}>
        <Calendar
          fullscreen
          value={selectedDate}
          mode={viewMode}
          onSelect={(date) => setSelectedDate(date)}
          onPanelChange={(date, mode) => setViewMode(mode)}
          headerRender={({ value }) => {
            const year = value.year();
            const month = value.month();
            return (
              <div style={{ padding: '16px', borderBottom: '1px solid #f0f0f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography.Title level={4} style={{ margin: 0 }}>
                    {viewMode === 'year' ? `${year}年` : `${year}年${month + 1}月`}
                  </Typography.Title>
                  <Space size="middle">
                    <Button onClick={() => setSelectedDate(dayjs())}>今天</Button>
                    <Space size={4}>
                      <Button icon={<LeftOutlined />} onClick={() => setSelectedDate(value.subtract(1, 'month'))} />
                      <Button icon={<RightOutlined />} onClick={() => setSelectedDate(value.add(1, 'month'))} />
                    </Space>
                  </Space>
                </div>
              </div>
            );
          }}
          cellRender={(date, info) => {
            if (info.type === 'month') return monthCellRender(date);
            return dateCellRender(date);
          }}
        />
      </Card>

      <ProTable<Duty>
        columns={columns}
        dataSource={tableData}
        rowKey="id"
        search={false}
        options={false}
        headerTitle={
          <Space>
            <CalendarOutlined />
            <Typography.Text strong>
              {viewMode === 'year' 
                ? `${selectedDate.format('YYYY-MM')} 月度安排详情` 
                : `${selectedDate.format('YYYY-MM-DD')} 当日安排详情`}
            </Typography.Text>
          </Space>
        }
        pagination={{ pageSize: 8 }}
        locale={{ emptyText: <Empty description="暂无日程安排" /> }}
      />
    </div>
  );
}

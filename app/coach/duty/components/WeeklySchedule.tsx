'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, Tag, Typography, Space, Row, Col, Badge, Empty, Button, Spin, Popconfirm, message, Select } from 'antd';
import { LeftOutlined, RightOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import { getDutyList, deleteDuty, updateDuty, type Duty } from '@/service/duty';
import { getCoachList, type CoachOption } from '@/service/coach';
import { getPublicCourseList, type PublicCourse } from '@/service/course';
import { useCampFilter } from '@/hooks/useCampFilter';
import CoachAssignModal from './CoachAssignModal';
import WeeklyScheduleModal from './WeeklyScheduleModal';

const { Text, Title } = Typography;
const MEAL_TYPE_MAP: Record<string, string> = {
  breakfast: '早餐',
  lunch: '午餐',
  dinner: '晚餐',
  snack: '加餐',
};

dayjs.locale('zh-cn');

interface WeeklyScheduleProps {
  campId?: number;
  refreshKey?: number;
  onEdit?: (duty: Duty) => void;
}

export default function WeeklySchedule({ campId, refreshKey, onEdit }: WeeklyScheduleProps) {
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs>(dayjs());
  const [pivotDate, setPivotDate] = useState<dayjs.Dayjs>(dayjs().startOf('week'));
  const [duties, setDuties] = useState<Duty[]>([]);
  const [coaches, setCoaches] = useState<CoachOption[]>([]);
  const [publicCourses, setPublicCourses] = useState<PublicCourse[]>([]);
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [weeklyModalVisible, setWeeklyModalVisible] = useState(false);
  const [currentDuty, setCurrentDuty] = useState<Duty | null>(null);
  const { isSuper } = useCampFilter();

  useEffect(() => {
    fetchSchedules();
    fetchBaseData();
  }, [selectedDate, campId, refreshKey]);

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

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const res = await getDutyList({ 
        date: selectedDate.format('YYYY-MM-DD'),
        campId: campId
      });
      // 按照时间排序
      const sortedData = (res.data || []).sort((a, b) => a.timeSlot.localeCompare(b.timeSlot));
      setDuties(sortedData);
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
      fetchSchedules();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleCoachChange = async (id: number, coachIds: string[], coachNames: string) => {
    try {
      await updateDuty(id, { coachIds, coach: coachNames });
      message.success('教练已更新');
      fetchSchedules();
    } catch (error) {
      message.error('更新失败');
    }
  };

  const weekDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      days.push(pivotDate.add(i, 'day'));
    }
    return days;
  }, [pivotDate]);

  const handlePrevWeek = () => {
    const newPivot = pivotDate.subtract(1, 'week');
    setPivotDate(newPivot);
    // 保持选中同一周的同一天（可选）
    setSelectedDate(selectedDate.subtract(1, 'week'));
  };

  const handleNextWeek = () => {
    const newPivot = pivotDate.add(1, 'week');
    setPivotDate(newPivot);
    // 保持选中同一周的同一天（可选）
    setSelectedDate(selectedDate.add(1, 'week'));
  };

  const handleToday = () => {
    const today = dayjs();
    setSelectedDate(today);
    setPivotDate(today.startOf('week'));
  };

  const getStatusTag = (status: string, date: string, timeSlot: string) => {
    // 逻辑调整：状态完全由当前时间决定
    const startTime = timeSlot.split('-')[0];
    const itemDateTime = dayjs(`${date}T${startTime}`);
    const now = dayjs();
    
    let computedStatus = 'pending';
    if (itemDateTime.isBefore(now)) {
      computedStatus = 'completed';
    }

    switch (computedStatus) {
      case 'completed':
        return <Tag color="success">已完成</Tag>;
      default:
        return <Tag color="default">未开始</Tag>;
    }
  };

  const isPast = (date: string, timeSlot: string) => {
    const startTime = timeSlot.split('-')[0];
    const itemDateTime = dayjs(`${date}T${startTime}`);
    return itemDateTime.isBefore(dayjs());
  };

  const getTypeColor = (type?: string) => {
    if (type === 'meal') return '#faad14';
    if (type === 'duty') return '#1890ff';
    return '#52c41a';
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '16px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Button icon={<LeftOutlined />} onClick={handlePrevWeek} type="text" />
        <Title level={4} style={{ margin: 0 }}>
          {selectedDate.isSame(dayjs(), 'day') ? '今日安排' : selectedDate.format('YYYY年MM月DD日')}
        </Title>
        <Button icon={<RightOutlined />} onClick={handleNextWeek} type="text" />
      </div>

      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <Space>
          <Button size="small" onClick={handleToday}>回到今天</Button>
          <Button size="small" type="primary" ghost onClick={() => setWeeklyModalVisible(true)}>本周日程</Button>
        </Space>
      </div>

      {/* Week Tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 32, overflowX: 'auto', paddingBottom: 8 }}>
        {weekDays.map((day: dayjs.Dayjs) => {
          const isSelected = day.isSame(selectedDate, 'day');
          return (
            <div 
              key={day.toString()}
              onClick={() => setSelectedDate(day)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer',
                minWidth: 60,
              }}
            >
              <Text type={isSelected ? undefined : 'secondary'} style={{ fontSize: 12, marginBottom: 8 }}>
                {day.format('ddd')}
              </Text>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: isSelected ? '#52c41a' : 'transparent',
                color: isSelected ? '#fff' : undefined,
                fontWeight: isSelected ? 'bold' : 'normal',
              }}>
                {day.date()}
              </div>
            </div>
          );
        })}
      </div>

      {/* Timeline */}
      <div style={{ position: 'relative', minHeight: 200 }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}><Spin /></div>
        ) : duties.length > 0 ? (
          duties.map((item, index) => {
            const [startTime, endTime] = item.timeSlot.split('-');
            return (
              <div key={item.id} style={{ display: 'flex', marginBottom: 24, position: 'relative' }}>
                {/* Time and Line */}
                <div style={{ width: 80, marginRight: 16, textAlign: 'right', paddingTop: 8 }}>
                  <Text strong style={{ fontSize: 20, display: 'block' }}>{startTime}</Text>
                  <Text type="secondary" style={{ fontSize: 13 }}>- {endTime}</Text>
                  {index < duties.length - 1 && (
                    <div style={{
                      position: 'absolute',
                      left: 88,
                      top: 52,
                      bottom: -24,
                      width: 1,
                      background: '#f0f0f0',
                    }} />
                  )}
                </div>

                {/* Card */}
                <Card 
                  variant="borderless"
                  style={{ 
                    flex: 1, 
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    borderLeft: `4px solid ${getTypeColor(item.type)}`,
                    borderRadius: 8,
                    cursor: 'pointer'
                  }}
                  styles={{ body: { padding: '16px 20px' } }}
                  onClick={() => {
                    if (item.type !== 'meal') {
                      onEdit?.(item);
                    }
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8, flexWrap: 'wrap' }}>
                        <Text strong style={{ fontSize: 18, color: '#262626' }}>
                          {item.type === 'meal' ? (MEAL_TYPE_MAP[item.mealType || ''] || '餐饮') : item.type === 'duty' ? '值班' : '训练'}
                        </Text>
                        
                        {/* 训练内容/备注 - 移动到标题旁边 */}
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          {item.type === 'training' && item.courseId ? (
                            <div style={{ 
                              display: 'inline-block',
                              padding: '6px 14px', 
                              background: '#e6f7ff',
                              border: '1px solid #91d5ff',
                              borderRadius: 6,
                              color: '#0050b3',
                              fontSize: 15,
                              fontWeight: 'bold',
                              lineHeight: 1.2
                            }}>
                              {publicCourses.find(c => c.courseId === item.courseId)?.title || '未知课程'}
                            </div>
                          ) : (
                            <div style={{ 
                              display: 'inline-block',
                              padding: '6px 14px', 
                              background: item.type === 'meal' ? '#fff7e6' : '#f0f5ff',
                              border: `1px solid ${item.type === 'meal' ? '#ffd591' : '#adc6ff'}`,
                              borderRadius: 6,
                              color: item.type === 'meal' ? '#d46b08' : '#0050b3',
                              fontSize: 15,
                              fontWeight: 'bold',
                              lineHeight: 1.2
                            }}>
                              {item.type === 'meal' ? (item.location || '营养餐食') : (item.remark || item.location || '值班任务')}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 底部信息栏：教练信息 */}
                      <div style={{ marginTop: 16 }}>
                        <Text type="secondary" style={{ fontSize: 14 }}>
                          负责教练：{item.coach || <Text type="secondary" italic>未设置</Text>}
                        </Text>
                      </div>
                    </div>

                    {/* 右侧操作与状态区：纵向排列并右对齐 */}
                    <div style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'flex-end', 
                      justifyContent: 'space-between',
                      minHeight: 80, // 确保有足够高度进行垂直分布
                      paddingLeft: 16 
                    }}>
                      {getStatusTag(item.status, item.date, item.timeSlot)}
                      
                      <Space size={8} style={{ marginTop: 'auto' }}>
                        {(isSuper || !isPast(item.date, item.timeSlot)) && (
                          <Button 
                            type="link" 
                            size="small" 
                            onClick={(e) => {
                              e.stopPropagation();
                              setCurrentDuty(item);
                              setAssignModalVisible(true);
                            }}
                            style={{ padding: '0 4px' }}
                          >
                            设置人员
                          </Button>
                        )}
                        
                        {item.type !== 'meal' && (isSuper || !isPast(item.date, item.timeSlot)) && (
                          <div onClick={(e) => e.stopPropagation()}>
                            <Popconfirm
                              title="删除日程"
                              description="确定要删除该日程安排吗？"
                              onConfirm={() => handleDelete(item.id)}
                              okText="确定"
                              cancelText="取消"
                            >
                              <Button 
                                type="text" 
                                size="small" 
                                danger 
                                icon={<DeleteOutlined />} 
                                style={{ display: 'flex', alignItems: 'center', padding: '0 4px' }}
                              >
                                删除
                              </Button>
                            </Popconfirm>
                          </div>
                        )}
                      </Space>
                    </div>
                  </div>
                </Card>
              </div>
            );
          })
        ) : (
          <Empty description={`${selectedDate.format('YYYY-MM-DD')} 当日无安排`} />
        )}
      </div>
      <CoachAssignModal
        visible={assignModalVisible}
        duty={currentDuty}
        coaches={coaches}
        onCancel={() => {
          setAssignModalVisible(false);
          setCurrentDuty(null);
        }}
        onOk={async (coachIds, coachNames) => {
          if (currentDuty) {
            await handleCoachChange(currentDuty.id, coachIds, coachNames);
          }
        }}
      />
      <WeeklyScheduleModal
        visible={weeklyModalVisible}
        onCancel={() => setWeeklyModalVisible(false)}
        campId={campId}
        pivotDate={pivotDate}
      />
    </div>
  );
}

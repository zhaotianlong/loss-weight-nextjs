
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, Tag, Typography, Row, Col, Empty, Button, Spin, message, Popconfirm, Space, Divider } from 'antd';
import { LeftOutlined, RightOutlined, DeleteOutlined, EditOutlined, SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import { getDutyList, deleteDuty, type Duty } from '@/service/duty';
import RecipeDayModal from './RecipeDayModal';
import WeeklyRecipeModal from './WeeklyRecipeModal';

const { Text, Title } = Typography;

dayjs.locale('zh-cn');

interface WeeklyRecipeProps {
  campId?: number;
  refreshKey?: number;
}

const MEAL_TYPE_MAP: Record<string, { label: string; color: string }> = {
  breakfast: { label: '早餐', color: 'orange' },
  lunch: { label: '午餐', color: 'green' },
  dinner: { label: '晚餐', color: 'blue' },
  snack: { label: '加餐', color: 'purple' },
};

export default function WeeklyRecipe({ campId, refreshKey }: WeeklyRecipeProps) {
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs>(dayjs());
  const [pivotDate, setPivotDate] = useState<dayjs.Dayjs>(dayjs().startOf('week'));
  const [recipes, setRecipes] = useState<Duty[]>([]);
  const [dayModalVisible, setDayModalVisible] = useState(false);
  const [weeklyModalVisible, setWeeklyModalVisible] = useState(false);

  useEffect(() => {
    fetchRecipes();
  }, [selectedDate, campId, refreshKey]);

  const fetchRecipes = async () => {
    if (!campId) return;
    setLoading(true);
    try {
      const res = await getDutyList({ 
        date: selectedDate.format('YYYY-MM-DD'),
        campId: campId,
        type: 'meal'
      });
      // 按照时间排序
      const sortedData = (res.data || []).sort((a, b) => a.timeSlot.localeCompare(b.timeSlot));
      setRecipes(sortedData);
    } catch (error) {
      console.error('获取菜谱失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteDuty(id);
      message.success('删除成功');
      fetchRecipes();
    } catch (error) {
      message.error('删除失败');
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
    setSelectedDate(selectedDate.subtract(1, 'week'));
  };

  const handleNextWeek = () => {
    const newPivot = pivotDate.add(1, 'week');
    setPivotDate(newPivot);
    setSelectedDate(selectedDate.add(1, 'week'));
  };

  const handleBackToToday = () => {
    const today = dayjs();
    setSelectedDate(today);
    setPivotDate(today.startOf('week'));
  };

  const isToday = selectedDate.isSame(dayjs(), 'day');

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '16px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Button icon={<LeftOutlined />} onClick={handlePrevWeek} type="text" />
        <div style={{ textAlign: 'center' }}>
          <Space direction="vertical" size={0}>
            <Title level={4} style={{ margin: 0 }}>
              {isToday ? '今日菜谱' : selectedDate.format('YYYY年MM月DD日')}
            </Title>
            <Space size="middle" style={{ marginTop: 4 }}>
              <Button 
                type="link" 
                size="small" 
                icon={isToday ? <EditOutlined /> : <SearchOutlined />} 
                onClick={() => setDayModalVisible(true)}
              >
                管理菜谱
              </Button>
              {!isToday && (
                <Button 
                  type="link" 
                  size="small" 
                  onClick={handleBackToToday}
                  style={{ color: '#8c8c8c' }}
                >
                  回到今天
                </Button>
              )}
              <Button 
                type="link" 
                size="small" 
                onClick={() => setWeeklyModalVisible(true)}
                style={{ color: '#1890ff' }}
              >
                本周菜谱
              </Button>
            </Space>
          </Space>
        </div>
        <Button icon={<RightOutlined />} onClick={handleNextWeek} type="text" />
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
                minWidth: 80,
              }}
            >
              <Text type={isSelected ? undefined : 'secondary'} style={{ fontSize: 12, marginBottom: 8 }}>
                {day.format('ddd')}
              </Text>
              <div style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: isSelected ? '#1890ff' : 'transparent',
                color: isSelected ? '#fff' : undefined,
                fontWeight: isSelected ? 'bold' : 'normal',
                border: isSelected ? 'none' : '1px solid #f0f0f0'
              }}>
                {day.date()}
              </div>
            </div>
          );
        })}
      </div>

      {/* Recipe List */}
      <div style={{ position: 'relative', minHeight: 200 }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}><Spin /></div>
        ) : recipes.length > 0 ? (
          <Row gutter={[16, 16]}>
            {recipes.map((item) => {
              const mealInfo = MEAL_TYPE_MAP[item.mealType || ''] || { label: '餐食', color: 'default' };
              return (
                <Col span={24} key={item.id}>
                  <Card 
                    variant="borderless"
                    style={{ 
                      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                      borderRadius: 12,
                      overflow: 'hidden'
                    }}
                    styles={{ body: { padding: 0 } }}
                  >
                    <div style={{ display: 'flex' }}>
                      <div style={{ 
                        width: 100, 
                        background: '#f8f9fa', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        borderRight: '1px solid #f0f0f0',
                        padding: '16px 0'
                      }}>
                        <Text strong style={{ fontSize: 16 }}>{item.timeSlot.split('-')[0]}</Text>
                        <Tag color={mealInfo.color} style={{ margin: '8px 0 0 0' }}>{mealInfo.label}</Tag>
                      </div>
                      <div style={{ flex: 1, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <Text strong style={{ fontSize: 18, display: 'block', marginBottom: 4 }}>
                            {item.location}
                          </Text>
                          <Space split={<Divider type="vertical" />} style={{ marginBottom: 4, display: 'block' }}>
                            {item.calories !== undefined && <Text type="secondary">热量: {item.calories} Kcal</Text>}
                            {item.carbs !== undefined && <Text type="secondary">碳水: {item.carbs} g</Text>}
                            {item.protein !== undefined && <Text type="secondary">蛋白质: {item.protein} g</Text>}
                            {item.fat !== undefined && <Text type="secondary">脂肪: {item.fat} g</Text>}
                          </Space>
                          {item.remark && <div style={{ marginTop: 4 }}><Text type="secondary" style={{ fontSize: 14 }}>备注: {item.remark}</Text></div>}
                        </div>
                        <Popconfirm
                          title="确定要删除这条菜谱吗？"
                          onConfirm={() => handleDelete(item.id)}
                          okText="确定"
                          cancelText="取消"
                        >
                          <Button type="text" danger icon={<DeleteOutlined />} />
                        </Popconfirm>
                      </div>
                    </div>
                  </Card>
                </Col>
              );
            })}
          </Row>
        ) : (
          <Empty description={`${selectedDate.format('YYYY-MM-DD')} 当日无菜谱安排`} />
        )}
      </div>

      <RecipeDayModal
        visible={dayModalVisible}
        date={selectedDate.format('YYYY-MM-DD')}
        campId={campId}
        disableDateChange={true}
        onCancel={() => setDayModalVisible(false)}
        onOk={() => {
          setDayModalVisible(false);
          fetchRecipes();
        }}
      />

      <WeeklyRecipeModal
        visible={weeklyModalVisible}
        onCancel={() => setWeeklyModalVisible(false)}
        campId={campId}
        pivotDate={pivotDate}
      />
    </div>
  );
}

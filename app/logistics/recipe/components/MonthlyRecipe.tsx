
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, Card, Badge, Typography, Button, Space, Empty, Spin, Tag } from 'antd';
import { LeftOutlined, RightOutlined, CalendarOutlined, EditOutlined, SearchOutlined } from '@ant-design/icons';
import { ProTable, type ProColumns } from '@ant-design/pro-components';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import { getDutyList, deleteDuty, type Duty } from '@/service/duty';
import RecipeDayModal from './RecipeDayModal';

const { Text } = Typography;
dayjs.locale('zh-cn');

interface MonthlyRecipeProps {
  campId?: number;
  refreshKey?: number;
}

const MEAL_TYPE_MAP: Record<string, { label: string; color: string; badgeStatus: 'success' | 'processing' | 'default' | 'error' | 'warning' }> = {
  breakfast: { label: '早', color: 'orange', badgeStatus: 'warning' },
  lunch: { label: '午', color: 'green', badgeStatus: 'success' },
  dinner: { label: '晚', color: 'blue', badgeStatus: 'processing' },
  snack: { label: '加', color: 'purple', badgeStatus: 'default' },
};

export default function MonthlyRecipe({ campId, refreshKey }: MonthlyRecipeProps) {
  const [loading, setLoading] = useState(false);
  const [recipeList, setRecipeList] = useState<Duty[]>([]);
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs>(dayjs());
  const [viewMode, setViewMode] = useState<'month' | 'year'>('month');
  const [dayModalVisible, setDayModalVisible] = useState(false);

  useEffect(() => {
    fetchRecipeData();
  }, [campId, refreshKey]);

  const fetchRecipeData = async () => {
    if (!campId) return;
    setLoading(true);
    try {
      // 增加 pageSize 以获取整月数据，Mock 默认 20 条不足以支撑月视图
      const res = await getDutyList({ campId, type: 'meal', pageSize: 500 });
      setRecipeList(res.data || []);
    } catch (error) {
      console.error('获取菜谱数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const scheduleMap = useMemo(() => {
    const map: Record<string, Duty[]> = {};
    recipeList.forEach(item => {
      if (!map[item.date]) {
        map[item.date] = [];
      }
      map[item.date].push(item);
    });
    return map;
  }, [recipeList]);

  const dateCellRender = (value: dayjs.Dayjs) => {
    const dateStr = value.format('YYYY-MM-DD');
    const dayRecipes = (scheduleMap[dateStr] || []).sort((a, b) => a.timeSlot.localeCompare(b.timeSlot));

    return (
      <div style={{ height: '100%', position: 'relative', padding: '2px' }}>
        <div className="events" style={{ overflowY: 'auto', maxHeight: '100px' }}>
          {dayRecipes.map(item => {
            const mealInfo = MEAL_TYPE_MAP[item.mealType || ''] || { label: '餐', color: 'default', badgeStatus: 'default' };
            return (
              <div key={item.id} style={{ fontSize: '10px', display: 'flex', alignItems: 'center', marginBottom: 2 }}>
                <Badge status={mealInfo.badgeStatus} size="small" />
                <span style={{ color: '#595959', marginLeft: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {mealInfo.label}: {item.location}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const columns: ProColumns<Duty>[] = [
    {
      title: '时间',
      dataIndex: 'timeSlot',
      width: 120,
    },
    {
      title: '餐食类型',
      dataIndex: 'mealType',
      width: 100,
      render: (type: string) => {
        const info = MEAL_TYPE_MAP[type] || { label: '未知', color: 'default' };
        return <Tag color={info.color}>{info.label}</Tag>;
      }
    },
    {
      title: '菜谱内容',
      dataIndex: 'location',
      ellipsis: true,
    },
    {
      title: '营养成分',
      key: 'nutrition',
      render: (_, record) => (
        <Space size="small" split={<span style={{ color: '#ccc' }}>|</span>}>
          {record.calories !== undefined && <span>{record.calories}kcal</span>}
          {record.carbs !== undefined && <span>碳{record.carbs}g</span>}
          {record.protein !== undefined && <span>蛋{record.protein}g</span>}
          {record.fat !== undefined && <span>脂{record.fat}g</span>}
        </Space>
      )
    },
    {
      title: '备注',
      dataIndex: 'remark',
      ellipsis: true,
    },
  ];

  const tableData = useMemo(() => {
    const selected = dayjs(selectedDate);
    return recipeList.filter(item => {
      const itemDate = dayjs(item.date);
      return itemDate.isSame(selected, 'day');
    }).sort((a, b) => a.timeSlot.localeCompare(b.timeSlot));
  }, [recipeList, selectedDate]);

  if (loading && recipeList.length === 0) {
    return <div style={{ textAlign: 'center', padding: 50 }}><Spin tip="加载中..." /></div>;
  }

  const isToday = selectedDate.isSame(dayjs(), 'day');

  return (
    <div style={{ padding: '16px 0' }}>
      <Card variant="borderless" style={{ marginBottom: 16 }} styles={{ body: { padding: 0 } }}>
        <Calendar
          fullscreen
          value={selectedDate}
          mode={viewMode}
          onSelect={setSelectedDate}
          onPanelChange={(date, mode) => setViewMode(mode)}
          cellRender={(date, info) => {
            if (info.type === 'date') return dateCellRender(date);
            return info.originNode;
          }}
          headerRender={({ value }) => {
            const year = value.year();
            const month = value.month();
            return (
              <div style={{ padding: '16px', borderBottom: '1px solid #f0f0f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography.Title level={4} style={{ margin: 0 }}>
                    {`${year}年${month + 1}月`}
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
        />
      </Card>

      <ProTable<Duty>
        columns={columns}
        dataSource={tableData}
        rowKey="id"
        search={false}
        options={false}
        headerTitle={
          <Space size="large">
            <Space>
              <CalendarOutlined />
              <Text strong>{selectedDate.format('YYYY-MM-DD')} 当日菜谱详情</Text>
            </Space>
            <Button 
              type="primary" 
              ghost 
              size="small" 
              icon={isToday ? <EditOutlined /> : <SearchOutlined />}
              onClick={() => setDayModalVisible(true)}
            >
              管理菜谱
            </Button>
          </Space>
        }
        pagination={false}
        locale={{ emptyText: <Empty description="暂无菜谱安排" /> }}
      />

      <RecipeDayModal
        visible={dayModalVisible}
        date={selectedDate.format('YYYY-MM-DD')}
        campId={campId}
        disableDateChange={true}
        onCancel={() => setDayModalVisible(false)}
        onOk={() => {
          setDayModalVisible(false);
          fetchRecipeData();
        }}
      />
    </div>
  );
}

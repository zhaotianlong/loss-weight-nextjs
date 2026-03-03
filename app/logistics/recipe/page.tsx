
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, Tabs, Button, Select, Space } from 'antd';
import { PlusOutlined, CalendarOutlined, TableOutlined } from '@ant-design/icons';
import WeeklyRecipe from './components/WeeklyRecipe';
import MonthlyRecipe from './components/MonthlyRecipe';
import RecipeBatchModal from './components/RecipeBatchModal';
import RecipeDayModal from './components/RecipeDayModal';
import { getCampList, type Camp } from '@/service/camp';
import { useCampFilter } from '@/hooks/useCampFilter';
import dayjs from 'dayjs';

export default function RecipePage() {
  const [activeTab, setActiveTab] = useState('weekly');
  const [batchModalVisible, setBatchModalVisible] = useState(false);
  const [dayModalVisible, setDayModalVisible] = useState(false);
  const [selectedDayModalDate, setSelectedDayModalDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [refreshKey, setRefreshKey] = useState(0);
  const [campList, setCampList] = useState<Camp[]>([]);
  const { isSuper, getDefaultCampId } = useCampFilter();
  const [selectedCampId, setSelectedCampId] = useState<number | undefined>(getDefaultCampId());

  const fetchCamps = useCallback(async () => {
    try {
      const { data } = await getCampList({ pageSize: 100 });
      setCampList(data || []);
    } catch (error) {
      console.error('获取营地列表失败:', error);
    }
  }, []);

  useEffect(() => {
    if (isSuper) {
      fetchCamps();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuper]);

  const items = [
    {
      key: 'weekly',
      label: (
        <span>
          <TableOutlined /> 周菜谱
        </span>
      ),
      children: <WeeklyRecipe campId={selectedCampId} refreshKey={refreshKey} />,
    },
    {
      key: 'monthly',
      label: (
        <span>
          <CalendarOutlined /> 月菜谱
        </span>
      ),
      children: <MonthlyRecipe campId={selectedCampId} refreshKey={refreshKey} />,
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card 
        title="菜谱管理" 
        extra={
          <Space size="large">
            {isSuper && (
              <Select
                style={{ width: 220 }}
                placeholder="请选择营地"
                value={selectedCampId}
                onChange={setSelectedCampId}
                options={campList.map(camp => ({ label: camp.campName, value: camp.campId }))}
              />
            )}
            <Button 
              type="primary" 
              ghost
              icon={<PlusOutlined />}
              onClick={() => setDayModalVisible(true)}
            >
              新增菜谱
            </Button>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => setBatchModalVisible(true)}
            >
              批量设置菜谱
            </Button>
          </Space>
        }
      >
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab} 
          items={items}
          type="card"
        />
      </Card>

      <RecipeBatchModal
        visible={batchModalVisible}
        campId={selectedCampId}
        onCancel={() => setBatchModalVisible(false)}
        onOk={() => {
          setBatchModalVisible(false);
          setRefreshKey(prev => prev + 1);
        }}
      />

      <RecipeDayModal
        visible={dayModalVisible}
        date={dayjs().format('YYYY-MM-DD')}
        campId={selectedCampId}
        onCancel={() => setDayModalVisible(false)}
        onOk={() => {
          setDayModalVisible(false);
          setRefreshKey(prev => prev + 1);
        }}
      />
    </div>
  );
}

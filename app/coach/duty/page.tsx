'use client';

import React, { useState, useEffect } from 'react';
import { Card, Tabs, Button, Select, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import WeeklySchedule from './components/WeeklySchedule';
import MonthlySchedule from './components/MonthlySchedule';
import DutyModal from './components/DutyModal';
import ScheduleBatchModal from './components/ScheduleBatchModal';
import { createDuty, updateDuty, type Duty } from '@/service/duty';
import { message } from 'antd';
import { useCampFilter } from '@/hooks/useCampFilter';
import { getCampList, type Camp } from '@/service/camp';

export default function SchedulePage() {
  const [modalVisible, setModalVisible] = useState(false);
  const [batchModalVisible, setBatchModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingDuty, setEditingDuty] = useState<Duty | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  
  const { isSuper, getDefaultCampId } = useCampFilter();
  const [selectedCampId, setSelectedCampId] = useState<number | undefined>(getDefaultCampId());
  const [campList, setCampList] = useState<Camp[]>([]);

  useEffect(() => {
    const fetchCamps = async () => {
      try {
        const { data } = await getCampList({ pageSize: 100 });
        setCampList(data || []);
      } catch (error) {
        console.error('获取营地列表失败:', error);
      }
    };
    if (isSuper) {
      fetchCamps();
    }
  }, [isSuper]);

  const handleCreate = () => {
    setModalMode('create');
    setEditingDuty(null);
    setModalVisible(true);
  };

  const handleEdit = (duty: Duty) => {
    setModalMode('edit');
    setEditingDuty(duty);
    setModalVisible(true);
  };

  const handleModalOk = async (values: Omit<Duty, 'id'>) => {
    try {
      if (modalMode === 'create') {
        await createDuty(values);
        message.success('排班记录创建成功');
      } else if (editingDuty?.id) {
        await updateDuty(editingDuty.id, values);
        message.success('排班记录更新成功');
      }
      setModalVisible(false);
      setRefreshKey(prev => prev + 1); // 触发刷新
    } catch {
      message.error(modalMode === 'create' ? '创建失败' : '更新失败');
    }
  };

  const items = [
    {
      key: 'weekly',
      label: '周排班',
      children: <WeeklySchedule campId={selectedCampId} refreshKey={refreshKey} onEdit={handleEdit} />,
    },
    {
      key: 'monthly',
      label: '月排班',
      children: <MonthlySchedule campId={selectedCampId} refreshKey={refreshKey} onEdit={handleEdit} />,
    },
  ];

  return (
    <Card 
      title="日程排班" 
      extra={
        <Space>
          {isSuper && (
            <Select
              style={{ width: 200 }}
              placeholder="请选择营地"
              value={selectedCampId}
              onChange={setSelectedCampId}
              options={campList.map(camp => ({ label: camp.campName, value: camp.campId }))}
              allowClear
            />
          )}
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={handleCreate}
          >
            新增排班
          </Button>
          <Button 
            type="primary" 
            ghost
            icon={<PlusOutlined />}
            onClick={() => setBatchModalVisible(true)}
          >
            批量设置日程
          </Button>
        </Space>
      }
    >
      <Tabs defaultActiveKey="weekly" items={items} />
      <DutyModal
        visible={modalVisible}
        mode={modalMode}
        duty={editingDuty}
        onCancel={() => setModalVisible(false)}
        onOk={handleModalOk}
      />
      <ScheduleBatchModal
        visible={batchModalVisible}
        campId={selectedCampId}
        onCancel={() => setBatchModalVisible(false)}
        onOk={() => {
          setBatchModalVisible(false);
          setRefreshKey(prev => prev + 1);
        }}
      />
    </Card>
  );
}
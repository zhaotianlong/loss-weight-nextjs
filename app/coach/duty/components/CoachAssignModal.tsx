'use client';

import React, { useState, useEffect } from 'react';
import { Modal, Form, Select, Descriptions, Tag, Space, Divider } from 'antd';
import { type Duty } from '@/service/duty';
import { type CoachOption } from '@/service/coach';

interface CoachAssignModalProps {
  visible: boolean;
  duty: Duty | null;
  coaches: CoachOption[];
  onCancel: () => void;
  onOk: (coachIds: string[], coachNames: string) => Promise<void>;
}

const MEAL_TYPE_MAP: Record<string, string> = {
  breakfast: '早餐',
  lunch: '午餐',
  dinner: '晚餐',
  snack: '加餐',
};

export default function CoachAssignModal({ visible, duty, coaches, onCancel, onOk }: CoachAssignModalProps) {
  const [form] = Form.useForm();
  const [confirmLoading, setConfirmLoading] = useState(false);

  useEffect(() => {
    if (visible && duty) {
      form.setFieldsValue({
        coachIds: duty.coachIds || [],
      });
    }
  }, [visible, duty, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setConfirmLoading(true);
      
      const selectedCoaches = coaches.filter(c => values.coachIds.includes(c.value));
      const coachNames = selectedCoaches.map(c => c.label).join('、');
      
      await onOk(values.coachIds, coachNames);
      onCancel();
    } catch (error) {
      console.error('表单校验失败:', error);
    } finally {
      setConfirmLoading(false);
    }
  };

  if (!duty) return null;

  return (
    <Modal
      title="设置人员"
      open={visible}
      onOk={handleOk}
      onCancel={onCancel}
      confirmLoading={confirmLoading}
      width={500}
      destroyOnClose
    >
      <Descriptions column={1} size="small" bordered>
        <Descriptions.Item label="日程类型">
          {duty.type === 'meal' ? (MEAL_TYPE_MAP[duty.mealType || ''] || '餐饮') : duty.type === 'duty' ? '值班' : '训练'}
        </Descriptions.Item>
        <Descriptions.Item label="时间时段">
          {duty.date} {duty.timeSlot}
        </Descriptions.Item>
        <Descriptions.Item label="具体内容">
          <Text strong>{duty.location || duty.remark || '无'}</Text>
        </Descriptions.Item>
      </Descriptions>
      
      <Divider orientation="left" style={{ fontSize: 14, color: '#8c8c8c' }}>人员设置</Divider>
      
      <Form form={form} layout="vertical">
        <Form.Item
          name="coachIds"
          label="负责教练"
          rules={[{ required: true, message: '请至少选择一名教练' }]}
        >
          <Select
            mode="multiple"
            placeholder="请选择负责教练"
            style={{ width: '100%' }}
            options={coaches.map(c => ({ label: c.label, value: c.value }))}
            maxTagCount="responsive"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}

import { Typography } from 'antd';
const { Text } = Typography;

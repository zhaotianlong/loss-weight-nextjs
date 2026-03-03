
'use client';

import React, { useState } from 'react';
import { Modal, Form, DatePicker, Select, Input, Space, Button, message, Divider, InputNumber, Tabs } from 'antd';
import { PlusOutlined, DeleteOutlined, CopyOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { batchCreateRecipes } from '@/service/duty';

const { Option } = Select;

interface RecipeBatchModalProps {
  visible: boolean;
  campId?: number;
  onCancel: () => void;
  onOk: () => void;
}

const MEAL_TYPES = [
  { label: '早餐', value: 'breakfast', defaultTime: '07:30-08:00' },
  { label: '午餐', value: 'lunch', defaultTime: '12:00-12:30' },
  { label: '晚餐', value: 'dinner', defaultTime: '18:00-18:30' },
  { label: '加餐', value: 'snack', defaultTime: '10:00-10:15' },
];

const DAYS_OF_WEEK = [
  { label: '周一', value: 1 },
  { label: '周二', value: 2 },
  { label: '周三', value: 3 },
  { label: '周四', value: 4 },
  { label: '周五', value: 5 },
  { label: '周六', value: 6 },
  { label: '周日', value: 7 },
];

interface MealInput {
  mealType: string;
  timeSlot: string;
  location: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  remark?: string;
}

interface FormValues {
  startDate: dayjs.Dayjs;
  endDate: dayjs.Dayjs;
  [key: string]: MealInput[] | dayjs.Dayjs | undefined; // day1, day2, etc.
}

export default function RecipeBatchModal({ visible, campId, onCancel, onOk }: RecipeBatchModalProps) {
  const [form] = Form.useForm<FormValues>();
  const [loading, setLoading] = useState(false);
  const [activeDay, setActiveDay] = useState('1');

  const handleFinish = async (values: FormValues) => {
    if (!campId) {
      message.error('请先选择营地');
      return;
    }

    setLoading(true);
    try {
      const { startDate, endDate, ...dayPatterns } = values;
      
      const patterns = DAYS_OF_WEEK.map(day => ({
        dayOfWeek: day.value,
        meals: (dayPatterns[`day${day.value}`] as MealInput[] || []).map((m: MealInput) => ({
          mealType: m.mealType,
          timeSlot: m.timeSlot,
          location: m.location,
          calories: m.calories,
          protein: m.protein,
          carbs: m.carbs,
          fat: m.fat,
          remark: m.remark,
        })),
      })).filter(p => p.meals.length > 0);

      if (patterns.length === 0) {
        message.warning('请至少设置一天的菜谱');
        setLoading(false);
        return;
      }

      await batchCreateRecipes({
        campId,
        startDate: startDate.format('YYYY-MM-DD'),
        endDate: endDate.format('YYYY-MM-DD'),
        patterns,
      });
      
      message.success('菜谱批量生成成功');
      onOk();
    } catch (error) {
      console.error('批量设置失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToAll = () => {
    const currentMeals = form.getFieldValue(`day${activeDay}`) as MealInput[];
    if (!currentMeals || currentMeals.length === 0) {
      message.warning('当前天没有菜谱可复制');
      return;
    }

    const updates: Partial<FormValues> = {};
    DAYS_OF_WEEK.forEach(day => {
      if (day.value.toString() !== activeDay) {
        updates[`day${day.value}`] = JSON.parse(JSON.stringify(currentMeals));
      }
    });
    form.setFieldsValue(updates);
    message.success('已复制到所有工作日');
  };

  const renderDayForm = (dayValue: number) => (
    <Form.List name={`day${dayValue}`}>
      {(fields, { add, remove }) => (
        <>
          {fields.map(({ key, name, ...restField }) => (
            <div key={key} style={{ background: '#fcfcfc', padding: '16px', marginBottom: '16px', borderRadius: '8px', border: '1px solid #f0f0f0' }}>
              <Space style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                <Form.Item
                  {...restField}
                  name={[name, 'mealType']}
                  rules={[{ required: true, message: '类型' }]}
                >
                  <Select placeholder="餐食类型" style={{ width: 100 }}>
                    {MEAL_TYPES.map(type => (
                      <Option key={type.value} value={type.value}>{type.label}</Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item
                  {...restField}
                  name={[name, 'timeSlot']}
                  rules={[{ required: true, message: '时段' }]}
                >
                  <Input placeholder="时段 (如 07:30-08:00)" style={{ width: 150 }} />
                </Form.Item>
                <Form.Item
                  {...restField}
                  name={[name, 'location']}
                  rules={[{ required: true, message: '内容' }]}
                >
                  <Input placeholder="菜谱内容" style={{ width: 350 }} />
                </Form.Item>
                <Button type="text" danger icon={<DeleteOutlined />} onClick={() => remove(name)} />
              </Space>
              
              <Space style={{ display: 'flex' }} align="baseline" wrap>
                <Form.Item {...restField} name={[name, 'calories']} label="热量(Kcal)">
                  <InputNumber min={0} placeholder="热量" style={{ width: 100 }} />
                </Form.Item>
                <Form.Item {...restField} name={[name, 'carbs']} label="碳水(g)">
                  <InputNumber min={0} placeholder="碳水" style={{ width: 100 }} />
                </Form.Item>
                <Form.Item {...restField} name={[name, 'protein']} label="蛋白质(g)">
                  <InputNumber min={0} placeholder="蛋白质" style={{ width: 100 }} />
                </Form.Item>
                <Form.Item {...restField} name={[name, 'fat']} label="脂肪(g)">
                  <InputNumber min={0} placeholder="脂肪" style={{ width: 100 }} />
                </Form.Item>
                <Form.Item {...restField} name={[name, 'remark']} label="备注">
                  <Input placeholder="备注" style={{ width: 120 }} />
                </Form.Item>
              </Space>
            </div>
          ))}
          <Form.Item>
            <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
              添加餐食
            </Button>
          </Form.Item>
        </>
      )}
    </Form.List>
  );

  return (
    <Modal
      title="批量设置菜谱 (周循环生成)"
      open={visible}
      onOk={() => form.submit()}
      onCancel={onCancel}
      confirmLoading={loading}
      width={1000}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{
          startDate: dayjs().startOf('week').add(1, 'day'), // 默认为下周一或本周一
          endDate: dayjs().startOf('week').add(1, 'month'),
          ...DAYS_OF_WEEK.reduce((acc, day) => ({
            ...acc,
            [`day${day.value}`]: [
              { mealType: 'breakfast', timeSlot: '07:30-08:00' },
              { mealType: 'lunch', timeSlot: '12:00-12:30' },
              { mealType: 'dinner', timeSlot: '18:00-18:30' },
            ]
          }), {} as Record<string, MealInput[]>),
        }}
      >
        <div style={{ display: 'flex', gap: '24px', marginBottom: '16px', background: '#fafafa', padding: '16px', borderRadius: '8px' }}>
          <Form.Item
            name="startDate"
            label="开始日期"
            rules={[{ required: true, message: '请选择开始日期' }]}
            tooltip="从该日期所在的周开始应用循环"
          >
            <DatePicker style={{ width: 200 }} />
          </Form.Item>
          <Form.Item
            name="endDate"
            label="截止日期"
            rules={[{ required: true, message: '请选择截止日期' }]}
            tooltip="循环生成的最后期限"
          >
            <DatePicker style={{ width: 200 }} />
          </Form.Item>
          <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end', paddingBottom: '24px' }}>
            {/* 功能先隐藏 */}
            {/* <Button icon={<CopyOutlined />} onClick={copyToAll}>复制当前天到整周</Button> */}
          </div>
        </div>

        <Tabs
          activeKey={activeDay}
          onChange={setActiveDay}
          type="card"
          items={DAYS_OF_WEEK.map(day => ({
            key: day.value.toString(),
            label: day.label,
            children: (
              <div style={{ padding: '16px', border: '1px solid #f0f0f0', borderTop: 'none', borderRadius: '0 0 8px 8px' }}>
                {renderDayForm(day.value)}
              </div>
            ),
          }))}
        />
      </Form>
    </Modal>
  );
}

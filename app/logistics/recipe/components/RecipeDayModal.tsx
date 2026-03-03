
'use client';

import React, { useState, useEffect } from 'react';
import { Modal, Form, Select, Input, Space, Button, message, InputNumber, Divider, Spin, DatePicker, Tag } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { getDutyList, createDuty, updateDuty, deleteDuty, type Duty } from '@/service/duty';
import dayjs from 'dayjs';

const { Option } = Select;

interface RecipeDayModalProps {
  visible: boolean;
  date: string; // 作为初始日期
  campId?: number;
  onCancel: () => void;
  onOk: () => void;
  disableDateChange?: boolean;
}

const MEAL_TYPES = [
  { label: '早餐', value: 'breakfast', defaultTime: '07:30-08:00' },
  { label: '午餐', value: 'lunch', defaultTime: '12:00-12:30' },
  { label: '晚餐', value: 'dinner', defaultTime: '18:00-18:30' },
  { label: '加餐', value: 'snack', defaultTime: '10:00-10:15' },
];

interface MealFormItem {
  id?: number;
  mealType: string;
  timeSlot: string;
  location: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  remark?: string;
}

export default function RecipeDayModal({ visible, date: initialDate, campId, onCancel, onOk, disableDateChange = false }: RecipeDayModalProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(initialDate);
  const [initialRecipes, setInitialRecipes] = useState<Duty[]>([]);

  const isToday = dayjs(selectedDate).isSame(dayjs(), 'day');

  useEffect(() => {
    if (visible && initialDate) {
      setSelectedDate(initialDate);
    }
  }, [visible, initialDate]);

  useEffect(() => {
    if (visible && selectedDate && campId) {
      fetchDayRecipes();
    }
  }, [visible, selectedDate, campId]);

  const fetchDayRecipes = async () => {
    setFetching(true);
    try {
      const res = await getDutyList({
        date: selectedDate,
        campId,
        type: 'meal',
      });
      const data = (res.data || []).sort((a, b) => a.timeSlot.localeCompare(b.timeSlot));
      setInitialRecipes(data);
      form.setFieldsValue({
        meals: data.length > 0 ? data.map(item => ({
          id: item.id,
          mealType: item.mealType,
          timeSlot: item.timeSlot,
          location: item.location,
          calories: item.calories,
          protein: item.protein,
          carbs: item.carbs,
          fat: item.fat,
          remark: item.remark,
        })) : [{ mealType: 'breakfast', timeSlot: '07:30-08:00', location: '' }],
      });
    } catch (error) {
      console.error('获取当日菜谱失败:', error);
    } finally {
      setFetching(false);
    }
  };

  const handleFinish = async (values: { meals: MealFormItem[] }) => {
    if (!campId) return;
    setLoading(true);
    try {
      const currentMeals = values.meals || [];
      const initialIds = initialRecipes.map(r => r.id);
      const currentIds = currentMeals.map(m => m.id).filter(id => id !== undefined) as number[];

      // 1. 删除已移除的
      const toDelete = initialIds.filter(id => !currentIds.includes(id));
      await Promise.all(toDelete.map(id => deleteDuty(id)));

      // 2. 新增或更新
      await Promise.all(currentMeals.map(async (meal) => {
        const payload: Omit<Duty, 'id'> = {
          campId,
          date: selectedDate,
          type: 'meal',
          mealType: meal.mealType as 'breakfast' | 'lunch' | 'dinner' | 'snack',
          timeSlot: meal.timeSlot,
          location: meal.location,
          calories: meal.calories,
          protein: meal.protein,
          carbs: meal.carbs,
          fat: meal.fat,
          remark: meal.remark,
          status: 'scheduled',
          coach: '',
          coachIds: [],
        };

        if (meal.id) {
          await updateDuty(meal.id, payload);
        } else {
          await createDuty(payload);
        }
      }));

      message.success(`${selectedDate} 菜谱保存成功`);
      onOk();
    } catch (error) {
      console.error('保存菜谱失败:', error);
      message.error('保存失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="菜谱管理"
      open={visible}
      onOk={() => form.submit()}
      onCancel={onCancel}
      confirmLoading={loading}
      width={900}
      destroyOnClose
    >
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontWeight: 'bold' }}>管理日期:</span>
        <DatePicker 
          value={dayjs(selectedDate)} 
          onChange={(date) => date && setSelectedDate(date.format('YYYY-MM-DD'))}
          disabled={disableDateChange}
          allowClear={false}
        />
      </div>

      <Spin spinning={fetching}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          initialValues={{ meals: [] }}
        >
          <Form.List name="meals">
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
                        <Input placeholder="备注" style={{ width: 150 }} />
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
        </Form>
      </Spin>
    </Modal>
  );
}

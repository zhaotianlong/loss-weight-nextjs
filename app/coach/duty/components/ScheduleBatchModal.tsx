'use client';

import React, { useState, useEffect } from 'react';
import { Modal, Form, DatePicker, Select, Input, Space, Button, message, Tabs } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { batchCreateSchedules } from '@/service/duty';
import { getCoachList, type CoachOption } from '@/service/coach';
import { getPublicCourseList, type PublicCourse } from '@/service/course';

const { Option } = Select;

interface ScheduleBatchModalProps {
  visible: boolean;
  campId?: number;
  onCancel: () => void;
  onOk: () => void;
}

const TYPES = [
  { label: '训练', value: 'training' },
  { label: '值班', value: 'duty' },
];

const MEAL_TYPES = [
  { label: '早餐', value: 'breakfast' },
  { label: '午餐', value: 'lunch' },
  { label: '晚餐', value: 'dinner' },
  { label: '加餐', value: 'snack' },
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

interface ScheduleInput {
  type: string;
  mealType?: string;
  timeSlot: string;
  location?: string;
  courseId?: number;
  coachIds?: string[];
  remark?: string;
}

interface FormValues {
  startDate: dayjs.Dayjs;
  endDate: dayjs.Dayjs;
  [key: string]: ScheduleInput[] | dayjs.Dayjs | undefined;
}

export default function ScheduleBatchModal({ visible, campId, onCancel, onOk }: ScheduleBatchModalProps) {
  const [form] = Form.useForm<FormValues>();
  const [loading, setLoading] = useState(false);
  const [activeDay, setActiveDay] = useState('1');
  const [coaches, setCoaches] = useState<CoachOption[]>([]);
  const [publicCourses, setPublicCourses] = useState<PublicCourse[]>([]);

  useEffect(() => {
    if (visible && campId) {
      fetchBaseData();
    }
  }, [visible, campId]);

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
        items: (dayPatterns[`day${day.value}`] as ScheduleInput[] || []).map((item: ScheduleInput) => {
          const coachNames = coaches
            .filter(c => item.coachIds?.includes(c.value))
            .map(c => c.label)
            .join('、');
            
          return {
            type: item.type,
            mealType: item.mealType,
            timeSlot: item.timeSlot,
            location: item.location,
            courseId: item.courseId,
            coachIds: item.coachIds,
            coach: coachNames,
            remark: item.remark,
          };
        }),
      })).filter(p => p.items.length > 0);

      if (patterns.length === 0) {
        message.warning('请至少设置一天的日程');
        setLoading(false);
        return;
      }

      await batchCreateSchedules({
        campId,
        startDate: startDate.format('YYYY-MM-DD'),
        endDate: endDate.format('YYYY-MM-DD'),
        patterns,
      });
      
      message.success('日程批量生成成功');
      onOk();
    } catch (error) {
      console.error('批量设置失败:', error);
      message.error('生成失败');
    } finally {
      setLoading(false);
    }
  };

  const renderDayForm = (dayValue: number) => (
    <Form.List name={`day${dayValue}`}>
      {(fields, { add, remove }) => (
        <>
          {fields.map(({ key, name, ...restField }) => (
            <div key={key} style={{ background: '#fcfcfc', padding: '16px', marginBottom: '16px', borderRadius: '8px', border: '1px solid #f0f0f0' }}>
              <Space style={{ display: 'flex', marginBottom: 8, flexWrap: 'wrap' }} align="baseline">
                <Form.Item
                  {...restField}
                  name={[name, 'type']}
                  rules={[{ required: true, message: '类型' }]}
                >
                  <Select placeholder="类型" style={{ width: 100 }}>
                    {TYPES.map(t => (
                      <Option key={t.value} value={t.value}>{t.label}</Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => 
                  prevValues[`day${dayValue}`]?.[name]?.type !== currentValues[`day${dayValue}`]?.[name]?.type
                }>
                  {({ getFieldValue }) => {
                    const type = getFieldValue([`day${dayValue}`, name, 'type']);
                    if (type === 'meal') {
                      return (
                        <Form.Item
                          {...restField}
                          name={[name, 'mealType']}
                          rules={[{ required: true, message: '餐食类型' }]}
                        >
                          <Select placeholder="餐食类型" style={{ width: 100 }}>
                            {MEAL_TYPES.map(m => (
                              <Option key={m.value} value={m.value}>{m.label}</Option>
                            ))}
                          </Select>
                        </Form.Item>
                      );
                    }
                    return null;
                  }}
                </Form.Item>

                <Form.Item
                  {...restField}
                  name={[name, 'timeSlot']}
                  rules={[{ required: true, message: '时段' }]}
                >
                  <Input placeholder="时段 (如 09:00-10:00)" style={{ width: 150 }} />
                </Form.Item>

                <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => 
                  prevValues[`day${dayValue}`]?.[name]?.type !== currentValues[`day${dayValue}`]?.[name]?.type
                }>
                  {({ getFieldValue }) => {
                    const type = getFieldValue([`day${dayValue}`, name, 'type']);
                    if (type === 'training') {
                      return (
                        <Form.Item
                          {...restField}
                          name={[name, 'courseId']}
                          rules={[{ required: true, message: '请选择课程' }]}
                        >
                          <Select placeholder="选择课程" style={{ width: 200 }}>
                            {publicCourses.map(c => (
                              <Option key={c.courseId} value={c.courseId}>{c.title}</Option>
                            ))}
                          </Select>
                        </Form.Item>
                      );
                    }
                    return (
                      <Form.Item
                        {...restField}
                        name={[name, 'location']}
                        rules={[{ required: true, message: '内容' }]}
                      >
                        <Input placeholder="地点/内容" style={{ width: 200 }} />
                      </Form.Item>
                    );
                  }}
                </Form.Item>

                <Form.Item
                  {...restField}
                  name={[name, 'coachIds']}
                >
                  <Select
                    mode="multiple"
                    placeholder="选择教练"
                    style={{ width: 200 }}
                    maxTagCount="responsive"
                    options={coaches.map(c => ({ label: c.label, value: c.value }))}
                  />
                </Form.Item>

                <Form.Item
                  {...restField}
                  name={[name, 'remark']}
                >
                  <Input placeholder="备注" style={{ width: 150 }} />
                </Form.Item>

                <Button type="text" danger icon={<DeleteOutlined />} onClick={() => remove(name)} />
              </Space>
            </div>
          ))}
          <Form.Item>
            <Button type="dashed" onClick={() => add({ type: 'training' })} block icon={<PlusOutlined />}>
              添加项
            </Button>
          </Form.Item>
        </>
      )}
    </Form.List>
  );

  return (
    <Modal
      title="批量设置日程 (周循环生成)"
      open={visible}
      onOk={() => form.submit()}
      onCancel={onCancel}
      confirmLoading={loading}
      width={1300}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{
          startDate: dayjs().startOf('week').add(1, 'day'),
          endDate: dayjs().startOf('week').add(1, 'month'),
        }}
      >
        <div style={{ display: 'flex', gap: '24px', marginBottom: '16px', background: '#fafafa', padding: '16px', borderRadius: '8px' }}>
          <Form.Item
            name="startDate"
            label="开始日期"
            rules={[{ required: true, message: '请选择开始日期' }]}
          >
            <DatePicker style={{ width: 200 }} />
          </Form.Item>
          <Form.Item
            name="endDate"
            label="截止日期"
            rules={[{ required: true, message: '请选择截止日期' }]}
          >
            <DatePicker style={{ width: 200 }} />
          </Form.Item>
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

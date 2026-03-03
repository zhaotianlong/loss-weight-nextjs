'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Modal, Form, Input, Select, DatePicker, TimePicker } from 'antd';
import dayjs from 'dayjs';
import type { Duty } from '@/service/duty';
import { getCoachList, type CoachOption } from '@/service/coach';
import { getCampList, type Camp } from '@/service/camp';
import { getPublicCourseList, type PublicCourse } from '@/service/course';
import { useCampFilter } from '@/hooks/useCampFilter';

interface DutyModalProps {
  visible: boolean;
  mode: 'create' | 'edit';
  duty?: Duty | null;
  onCancel: () => void;
  onOk: (values: Omit<Duty, 'id'>) => Promise<void> | void;
}

export default function DutyModal({
  visible,
  mode,
  duty,
  onCancel,
  onOk,
}: DutyModalProps) {
  const [form] = Form.useForm();
  const { isSuper, getDefaultCampId } = useCampFilter();
  const [coaches, setCoaches] = useState<CoachOption[]>([]);
  const [allCoaches, setAllCoaches] = useState<CoachOption[]>([]);
  const [camps, setCamps] = useState<Camp[]>([]);
  const [publicCourses, setPublicCourses] = useState<PublicCourse[]>([]);
  const [loading, setLoading] = useState(false);
  const lastFetchedCampId = React.useRef<number | undefined>(undefined);

  const selectedType = Form.useWatch('type', form);
  const selectedCourseId = Form.useWatch('courseId', form);

  // 获取数据
  const fetchData = useCallback(async (campId?: number) => {
    if (!campId) {
      setCoaches([]);
      setAllCoaches([]);
      setPublicCourses([]);
      return;
    }
    
    setLoading(true);
    try {
      const [coachRes, courseRes] = await Promise.all([
        getCoachList({ campId }),
        getPublicCourseList({ campId, pageSize: 100 })
      ]);
      setAllCoaches(coachRes.data || []);
      setPublicCourses(courseRes.data || []);
      lastFetchedCampId.current = campId;
    } catch (error) {
      console.error('获取数据失败:', error);
      lastFetchedCampId.current = undefined;
    } finally {
      setLoading(false);
    }
  }, []);

  // 根据类型和课程筛选教练
  useEffect(() => {
    if (selectedType === 'training' && selectedCourseId) {
      const course = publicCourses.find(c => c.courseId === selectedCourseId);
      if (course && course.coaches) {
        const courseCoachIds = course.coaches.map(c => c.id);
        setCoaches(allCoaches.filter(c => courseCoachIds.includes(c.value)));
      } else {
        setCoaches([]);
      }
    } else {
      setCoaches(allCoaches);
    }
    // 当类型或课程变化导致教练池变化时，检查已选教练是否在池中，不在则清除
    const currentCoachIds = form.getFieldValue('coachIds') || [];
    if (currentCoachIds.length > 0) {
      const validIds = currentCoachIds.filter((id: string) => 
        (selectedType === 'training' && selectedCourseId) 
          ? publicCourses.find(c => c.courseId === selectedCourseId)?.coaches?.some(cc => cc.id === id)
          : allCoaches.some(c => c.value === id)
      );
      if (validIds.length !== currentCoachIds.length) {
        form.setFieldsValue({ coachIds: validIds });
      }
    }
  }, [selectedType, selectedCourseId, allCoaches, publicCourses, form]);

  // 获取营地列表
  useEffect(() => {
    if (visible && isSuper) {
      const fetchCamps = async () => {
        try {
          const res = await getCampList({ pageSize: 100 });
          setCamps(res.data || []);
        } catch (error) {
          console.error('获取营地列表失败:', error);
        }
      };
      fetchCamps();
    }
  }, [visible, isSuper]);

  // 当弹窗打开或营地变化时更新表单和教练列表
  useEffect(() => {
    if (visible) {
      const initialCampId = duty?.campId || getDefaultCampId();
      
      if (initialCampId) {
        fetchData(initialCampId);
      }

      if (mode === 'edit' && duty) {
        // 解析 timeSlot 字符串为 dayjs 数组
        let timeRange: [dayjs.Dayjs, dayjs.Dayjs] | undefined = undefined;
        if (duty.timeSlot && duty.timeSlot.includes('-')) {
          const [start, end] = duty.timeSlot.split('-');
          timeRange = [dayjs(start, 'HH:mm'), dayjs(end, 'HH:mm')];
        }

        form.setFieldsValue({
          campId: duty.campId,
          coach: duty.coach,
          coachIds: duty.coachIds || [],
          date: duty.date ? dayjs(duty.date) : undefined,
          timeRange: timeRange,
          location: duty.location,
          status: duty.status,
          type: duty.type || 'training',
          courseId: duty.courseId,
          remark: duty.remark,
        });
      } else {
        // 只有在切换到 create 模式且弹窗刚打开时重置
        form.setFieldsValue({ 
          status: 'scheduled',
          type: 'training',
          campId: initialCampId,
          coachIds: [],
        });
      }
    } else {
      // 弹窗关闭时重置状态
      lastFetchedCampId.current = undefined;
      form.resetFields();
    }
  }, [visible, mode, duty, form, getDefaultCampId, fetchData]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      // 格式化数据
      const { timeRange, ...rest } = values;
      const submitValues: Omit<Duty, 'id'> = {
        ...rest,
        date: values.date ? values.date.format('YYYY-MM-DD') : '',
        // 格式化时间范围
        timeSlot: timeRange 
          ? `${timeRange[0].format('HH:mm')}-${timeRange[1].format('HH:mm')}`
          : '',
        campId: values.campId || getDefaultCampId() || 0,
        coach: values.coach || '',
        status: values.status || 'scheduled',
      };
      
      await onOk(submitValues);
      form.resetFields(); // 操作成功后重置
    } catch (err) {
      console.error('表单验证失败:', err);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  const handleCampChange = (value: number) => {
    form.setFieldsValue({ coachIds: undefined, coach: undefined, courseId: undefined });
    fetchData(value);
  };

  const handleCoachChange = (values: string[], options: unknown) => {
    if (options && Array.isArray(options)) {
      const labels = options.map(opt => (opt as { label: string }).label).filter(Boolean).join('、');
      form.setFieldsValue({ coach: labels });
    } else {
      form.setFieldsValue({ coach: '' });
    }
  };

  return (
    <Modal
      title={mode === 'create' ? '新增排班' : '编辑排班'}
      open={visible}
      onOk={handleSubmit}
      onCancel={handleCancel}
      okText="确定"
      cancelText="取消"
      width={600}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        style={{ marginTop: 24 }}
      >
        {isSuper && (
          <Form.Item
            name="campId"
            label="所属营地"
            rules={[{ required: true, message: '请选择营地' }]}
          >
            <Select 
              placeholder="请选择营地" 
              onChange={handleCampChange}
              options={camps.map(camp => ({ label: camp.campName, value: camp.campId }))}
            />
          </Form.Item>
        )}

        <Form.Item
          name="type"
          label="类型"
          rules={[{ required: true, message: '请选择类型' }]}
        >
          <Select 
            placeholder="请选择类型"
            onChange={() => form.setFieldsValue({ coachIds: undefined, courseId: undefined, remark: undefined, location: undefined })}
          >
            <Select.Option value="training">训练</Select.Option>
            <Select.Option value="duty">值班</Select.Option>
          </Select>
        </Form.Item>

        {selectedType === 'training' && (
          <>
            <Form.Item
              name="courseId"
              label="训练课程"
              rules={[{ required: true, message: '请选择训练课程' }]}
            >
              <Select 
                placeholder="请选择训练课程"
                options={publicCourses.map(course => ({ label: course.title, value: course.courseId }))}
              />
            </Form.Item>
            <Form.Item
              name="location"
              label="训练地点"
            >
              <Input placeholder="请输入训练地点（可选）" />
            </Form.Item>
          </>
        )}

        {selectedType === 'duty' && (
          <>
            <Form.Item
              name="location"
              label="值班地点"
              rules={[{ required: true, message: '请输入值班地点' }]}
            >
              <Input placeholder="请输入值班地点" />
            </Form.Item>
            <Form.Item
              name="remark"
              label="值班备注"
            >
              <Input.TextArea placeholder="请输入备注（可选）" rows={3} />
            </Form.Item>
          </>
        )}

        <Form.Item
          name="coachIds"
          label="教练"
          rules={[{ required: true, message: '请选择教练' }]}
        >
          <Select 
            mode="multiple"
            placeholder="请选择教练" 
            loading={loading}
            onChange={handleCoachChange}
            options={coaches.map(coach => ({ label: coach.label, value: coach.value }))}
          />
        </Form.Item>

        <Form.Item
          name="coach"
          hidden
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="date"
          label="日期"
          rules={[{ required: true, message: '请选择日期' }]}
        >
          <DatePicker 
            style={{ width: '100%' }} 
            placeholder="请选择日期" 
            disabledDate={(current) => {
              // 非超管不允许选择过去日期
              return !isSuper && current && current < dayjs().startOf('day');
            }}
          />
        </Form.Item>

        <Form.Item
          name="timeRange"
          label="时段"
          rules={[
            { required: true, message: '请选择时段' },
            {
              validator: async (_, value) => {
                if (value && value[0] && value[1]) {
                  if (!value[0].isBefore(value[1])) {
                    return Promise.reject(new Error('开始时间必须小于结束时间'));
                  }
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <TimePicker.RangePicker 
            format="HH:mm" 
            style={{ width: '100%' }} 
            placeholder={['开始时间', '结束时间']}
          />
        </Form.Item>

        <Form.Item
          name="status"
          label="状态"
          rules={[{ required: true, message: '请选择状态' }]}
        >
          <Select placeholder="请选择状态">
            <Select.Option value="scheduled">已安排</Select.Option>
            <Select.Option value="completed">已完成</Select.Option>
            <Select.Option value="cancelled">已取消</Select.Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
}


'use client';

import React, { useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Select } from 'antd';
import type { PublicCourse } from '@/service/course';
import type { Camp } from '@/service/camp';
import { useCampFilter } from '@/hooks/useCampFilter';

import type { CoachOption } from '@/service/coach';

interface PublicCourseModalProps {
  visible: boolean;
  mode: 'create' | 'edit';
  course?: PublicCourse | null;
  campList: Camp[];
  coachOptions: CoachOption[];
  defaultCampId?: number;
  onCancel: () => void;
  onOk: (values: Omit<PublicCourse, 'courseId'>) => Promise<void> | void;
}

export default function PublicCourseModal({
  visible,
  mode,
  course,
  campList,
  coachOptions,
  defaultCampId,
  onCancel,
  onOk,
}: PublicCourseModalProps) {
  const [form] = Form.useForm();
  const { shouldShowCampFilter, currentCampId } = useCampFilter();

  const selectedCampId = Form.useWatch('campId', form);

  const filteredCoaches = React.useMemo(() => {
    if (!selectedCampId) return [];
    return coachOptions.filter(coach => coach.campId === selectedCampId);
  }, [selectedCampId, coachOptions]);

  useEffect(() => {
    if (visible) {
      if (mode === 'edit' && course) {
        form.setFieldsValue({
          campId: course.campId,
          title: course.title,
          coachIds: course.coaches?.map(c => c.id) || [],
          status: course.status,
        });
      } else {
        form.resetFields();
        // 如果不是超级管理员，使用当前用户的营地ID；否则使用 defaultCampId
        const initialCampId = shouldShowCampFilter() ? defaultCampId : (currentCampId || defaultCampId);
        form.setFieldsValue({ 
          campId: initialCampId,
          coachIds: [],
          status: 1, // 默认状态为启用
        });
      }
    }
  }, [visible, mode, course, form, defaultCampId, shouldShowCampFilter, currentCampId]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      // 如果不是超级管理员，强制使用当前用户的营地ID
      if (!shouldShowCampFilter() && currentCampId) {
        values.campId = currentCampId;
      }

      // 将 coachIds 转换为 coaches 对象数组
      const { coachIds, ...rest } = values;
      const coaches = coachOptions
        .filter(opt => coachIds.includes(opt.value))
        .map(opt => ({
          id: opt.value,
          name: opt.label,
          gender: '男' as const // 简化处理
        }));

      onOk({
        ...rest,
        coaches
      } as Omit<PublicCourse, 'courseId'>);
      form.resetFields();
    } catch (err) {
      console.error('表单验证失败:', err);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={mode === 'create' ? '新增公共课类型' : '编辑公共课类型'}
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
        <Form.Item
          name="campId"
          label="所属营地"
          rules={[{ required: true, message: '请选择所属营地' }]}
          hidden={!shouldShowCampFilter()}
        >
          <Select 
            placeholder="请选择所属营地"
            onChange={() => form.setFieldsValue({ coachIds: [] })}
          >
            {campList.map((camp) => (
              <Select.Option key={camp.campId} value={camp.campId}>
                {camp.campName}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="title"
          label="课程名称"
          rules={[
            { required: true, message: '请输入课程名称' },
            { max: 100, message: '课程名称最多100个字符' },
          ]}
        >
          <Input placeholder="请输入课程名称" />
        </Form.Item>

        <Form.Item
          name="coachIds"
          label="负责教练"
          rules={[{ required: true, message: '请选择负责教练' }]}
        >
          <Select 
            mode="multiple"
            placeholder="请选择负责教练" 
            showSearch 
            optionFilterProp="label"
          >
            {filteredCoaches.map((coach) => (
              <Select.Option key={coach.value} value={coach.value} label={coach.label}>
                {coach.label}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="status"
          label="状态"
          rules={[{ required: true, message: '请选择状态' }]}
        >
          <Select placeholder="请选择状态">
            <Select.Option value={1}>启用</Select.Option>
            <Select.Option value={0}>禁用</Select.Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
}


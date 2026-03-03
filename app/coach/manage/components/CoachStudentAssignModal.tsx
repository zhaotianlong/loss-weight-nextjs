'use client';

import React, { useEffect, useState } from 'react';
import { Modal, Form, Select, DatePicker, message, Spin } from 'antd';
import { getStudentList } from '@/service/student';
import { Coach } from '@/service/coach';
import dayjs from 'dayjs';

interface CoachStudentAssignModalProps {
  visible: boolean;
  coach: Coach | null;
  onCancel: () => void;
  onOk: (values: any) => Promise<void>;
}

export default function CoachStudentAssignModal({
  visible,
  coach,
  onCancel,
  onOk,
}: CoachStudentAssignModalProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [studentList, setStudentList] = useState<{ label: string; value: number }[]>([]);

  const fetchStudents = async (campId: number) => {
    setLoading(true);
    try {
      const res = await getStudentList({ campId, pageSize: 1000, status: 1 }); // 只查询在训学员
      setStudentList((res.data || []).map(s => ({ label: s.name, value: s.stuId })));
    } catch (error) {
      console.error('获取学员列表失败:', error);
      message.error('获取学员列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible && coach) {
      form.resetFields();
      form.setFieldsValue({
        coachName: coach.name,
        startDate: dayjs(),
      });
      fetchStudents(coach.campId);
    }
  }, [visible, coach, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await onOk({
        studentId: values.studentId,
        coachId: coach?.empId,
        startDate: values.startDate.format('YYYY-MM-DD'),
      });
      form.resetFields();
    } catch (error) {
      console.error('Validate Failed:', error);
    }
  };

  return (
    <Modal
      title={`为教练 ${coach?.name} 分配学员`}
      open={visible}
      onOk={handleSubmit}
      onCancel={onCancel}
      confirmLoading={loading}
      destroyOnClose
    >
      <Spin spinning={loading}>
        <Form form={form} layout="vertical">
          <Form.Item
            name="studentId"
            label="选择学员"
            rules={[{ required: true, message: '请选择学员' }]}
          >
            <Select
              showSearch
              placeholder="请搜索并选择学员"
              optionFilterProp="label"
              options={studentList}
            />
          </Form.Item>
          <Form.Item
            name="startDate"
            label="开始日期"
            rules={[{ required: true, message: '请选择开始日期' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Spin>
    </Modal>
  );
}

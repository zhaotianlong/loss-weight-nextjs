'use client';

import React, { useEffect, useState } from 'react';
import { Modal, Form, Select, DatePicker, message, Input } from 'antd';
import { getCoachList } from '@/service/coach';
import { Student } from '@/service/student';
import dayjs from 'dayjs';

interface StudentAssignModalProps {
  visible: boolean;
  student: Student | null;
  onCancel: () => void;
  onOk: (values: any) => void;
}

const StudentAssignModal: React.FC<StudentAssignModalProps> = ({ visible, student, onCancel, onOk }) => {
  const [form] = Form.useForm();
  const [coachList, setCoachList] = useState<{ label: string; value: string }[]>([]);

  const fetchCoaches = async (campId: number) => {
    try {
      const res = await getCoachList({ campId });
      setCoachList(res.data || []);
    } catch (error) {
      console.error('Fetch coaches failed', error);
    }
  };

  useEffect(() => {
    if (visible && student) {
      form.resetFields();
      form.setFieldsValue({
        studentName: student.name,
        startDate: dayjs(),
        coachId: student.coachId
      });
      fetchCoaches(student.campId);
    }
  }, [visible, student]);

  return (
    <Modal
      title={student?.coachId ? "更换教练" : "分配教练"}
      open={visible}
      onCancel={onCancel}
      onOk={() => form.validateFields().then(values => {
        onOk({
          studentId: student?.stuId,
          coachId: values.coachId,
          startDate: values.startDate.format('YYYY-MM-DD')
        });
      })}
    >
      <Form form={form} layout="vertical">
        <Form.Item label="学员姓名" name="studentName">
           <Input disabled />
        </Form.Item>
        <Form.Item
          name="coachId"
          label="选择教练"
          rules={[{ required: true, message: '请选择教练' }]}
        >
          <Select
            placeholder="请选择教练"
            options={coachList}
            showSearch
            optionFilterProp="label"
          />
        </Form.Item>
        <Form.Item
          name="startDate"
          label="生效日期"
          rules={[{ required: true, message: '请选择生效日期' }]}
        >
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default StudentAssignModal;

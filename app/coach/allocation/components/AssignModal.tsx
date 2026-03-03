'use client';

import React, { useEffect, useState } from 'react';
import { Modal, Form, Select, DatePicker, message } from 'antd';
import { getCoachList } from '@/service/coach';
import { getStudentList } from '@/service/student';
import { useCampFilter } from '@/hooks/useCampFilter';
import dayjs from 'dayjs';

interface AssignModalProps {
  visible: boolean;
  onCancel: () => void;
  onOk: (values: any) => void;
}

const AssignModal: React.FC<AssignModalProps> = ({ visible, onCancel, onOk }) => {
  const [form] = Form.useForm();
  const [coachList, setCoachList] = useState<{ label: string; value: string }[]>([]);
  const [studentList, setStudentList] = useState<{ label: string; value: number }[]>([]);
  const { currentCampId, getDefaultCampId } = useCampFilter();

  const fetchOptions = async (campId: number) => {
    try {
      const [coachRes, studentRes] = await Promise.all([
        getCoachList({ campId }),
        getStudentList({ campId, pageSize: 1000, status: 1 }) // 只查询在训学员
      ]);
      setCoachList(coachRes.data || []);
      setStudentList((studentRes.data || []).map(s => ({ label: s.name, value: s.stuId })));
    } catch (error) {
      console.error('Fetch options failed', error);
    }
  };

  useEffect(() => {
    if (visible) {
      form.resetFields();
      const campId = currentCampId || getDefaultCampId();
      if (campId) {
        fetchOptions(campId);
      }
      form.setFieldValue('startDate', dayjs());
    }
  }, [visible, currentCampId]);

  return (
    <Modal
      title="分配教练"
      open={visible}
      onCancel={onCancel}
      onOk={() => form.validateFields().then(values => {
        onOk({
          ...values,
          startDate: values.startDate.format('YYYY-MM-DD')
        });
      })}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="studentId"
          label="学员"
          rules={[{ required: true, message: '请选择学员' }]}
        >
          <Select
            showSearch
            placeholder="请选择学员"
            optionFilterProp="label"
            options={studentList}
          />
        </Form.Item>
        <Form.Item
          name="coachId"
          label="教练"
          rules={[{ required: true, message: '请选择教练' }]}
        >
          <Select
            placeholder="请选择教练"
            options={coachList}
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
    </Modal>
  );
};

export default AssignModal;

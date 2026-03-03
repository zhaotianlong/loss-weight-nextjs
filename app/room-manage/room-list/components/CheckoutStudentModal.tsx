'use client';

import React, { useEffect } from 'react';
import { Modal, Form, DatePicker, message } from 'antd';
import type { Student } from '@/service/student';
import dayjs from 'dayjs';

interface CheckoutStudentModalProps {
  visible: boolean;
  student: Student | null;
  bedNum: string;
  onOk: (checkoutDate: string) => Promise<void> | void;
  onCancel: () => void;
}

export default function CheckoutStudentModal({
  visible,
  student,
  bedNum,
  onOk,
  onCancel,
}: CheckoutStudentModalProps) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible && student) {
      form.setFieldsValue({
        checkoutDate: dayjs(), // 默认今天
      });
    }
  }, [visible, student, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await onOk(values.checkoutDate.format('YYYY-MM-DD'));
      form.resetFields();
    } catch (err) {
      console.error('表单验证失败:', err);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  if (!student) {
    return null;
  }

  // 计算当前到期日期
  let currentExpireDate: string | null = null;
  if (student.checkoutDate) {
    currentExpireDate = student.checkoutDate;
  } else if (student.checkinDate) {
    const checkin = dayjs(student.checkinDate);
    currentExpireDate = checkin.add(30, 'day').format('YYYY-MM-DD');
  }

  return (
    <Modal
      title={`学员离营 - ${student.name}`}
      open={visible}
      onOk={handleSubmit}
      onCancel={handleCancel}
      okText="确认离营"
      cancelText="取消"
    >
      <div style={{ marginBottom: 16 }}>
        <p><strong>床位号：</strong>{bedNum}</p>
        <p><strong>学员姓名：</strong>{student.name}</p>
        {currentExpireDate && (
          <p><strong>原到期日期：</strong>{currentExpireDate}</p>
        )}
      </div>
      <Form form={form} layout="vertical">
        <Form.Item
          name="checkoutDate"
          label="离营日期"
          rules={[{ required: true, message: '请选择离营日期' }]}
        >
          <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
        </Form.Item>
      </Form>
    </Modal>
  );
}



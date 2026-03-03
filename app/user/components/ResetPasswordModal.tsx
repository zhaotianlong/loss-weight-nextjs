'use client';

import React, { useEffect } from 'react';
import { Modal, Form, Input, message } from 'antd';
import type { User } from '@/service/user';
import { encryptPasswordForTransmit } from '@/utils/password';

interface ResetPasswordModalProps {
  visible: boolean;
  user: User | null;
  onCancel: () => void;
  onOk: (userId: string, newPassword: string) => Promise<void> | void;
}

export default function ResetPasswordModal({
  visible,
  user,
  onCancel,
  onOk,
}: ResetPasswordModalProps) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible) {
      form.resetFields();
      form.setFieldsValue({
        newPassword: '',
        confirmPassword: '',
      });
    }
  }, [visible, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (!user || !user.userId) {
        message.error('用户信息不存在');
        return;
      }
      // 对密码进行加密后再传输
      const encryptedPassword = await encryptPasswordForTransmit(values.newPassword);
      await onOk(user.userId, encryptedPassword);
      form.resetFields();
    } catch (err) {
      console.error('表单验证失败:', err);
      message.error('密码加密失败，请重试');
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={`重置密码 - ${user?.name || ''}`}
      open={visible}
      onOk={handleSubmit}
      onCancel={handleCancel}
      okText="确认重置"
      cancelText="取消"
      width={500}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        style={{ marginTop: 24 }}
      >
        <Form.Item
          name="newPassword"
          label="新密码"
          rules={[
            { required: true, message: '请输入新密码' },
            { min: 6, message: '密码至少6个字符' },
          ]}
        >
          <Input.Password placeholder="请输入新密码" />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          label="确认密码"
          dependencies={['newPassword']}
          rules={[
            { required: true, message: '请确认新密码' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('newPassword') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('两次输入的密码不一致'));
              },
            }),
          ]}
        >
          <Input.Password placeholder="请再次输入新密码" />
        </Form.Item>
      </Form>
    </Modal>
  );
}


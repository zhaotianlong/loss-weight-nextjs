'use client';

import React from 'react';
import { Modal, Form, Input, message } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { encryptPasswordForTransmit } from '@/utils/password';

interface ChangePasswordModalProps {
  visible: boolean;
  onCancel: () => void;
  onOk: (values: { oldPassword: string; newPassword: string }) => void;
}

export default function ChangePasswordModal({
  visible,
  onCancel,
  onOk,
}: ChangePasswordModalProps) {
  const [form] = Form.useForm();

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      // 验证新密码和确认密码是否一致
      if (values.newPassword !== values.confirmPassword) {
        message.error('两次输入的密码不一致');
        return;
      }

      // 对密码进行加密后再传输（生产环境安全要求）
      const encryptedOldPassword = await encryptPasswordForTransmit(values.oldPassword);
      const encryptedNewPassword = await encryptPasswordForTransmit(values.newPassword);

      onOk({
        oldPassword: encryptedOldPassword,
        newPassword: encryptedNewPassword,
      });
      
      // 成功后重置表单
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
      title="修改密码"
      open={visible}
      onOk={handleSubmit}
      onCancel={handleCancel}
      okText="确认修改"
      cancelText="取消"
      width={500}
    >
      <Form
        form={form}
        layout="vertical"
        style={{ marginTop: 24 }}
      >
        <Form.Item
          name="oldPassword"
          label="原密码"
          rules={[
            { required: true, message: '请输入原密码' },
            { min: 6, message: '密码至少6个字符' },
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="请输入原密码"
          />
        </Form.Item>

        <Form.Item
          name="newPassword"
          label="新密码"
          rules={[
            { required: true, message: '请输入新密码' },
            { min: 6, message: '密码至少6个字符' },
            { max: 20, message: '密码最多20个字符' },
            {
              pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
              message: '密码必须包含大小写字母和数字',
            },
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="请输入新密码"
          />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          label="确认新密码"
          dependencies={['newPassword']}
          rules={[
            { required: true, message: '请再次输入新密码' },
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
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="请再次输入新密码"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}


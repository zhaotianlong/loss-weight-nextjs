'use client';

import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, message, Upload, Avatar } from 'antd';
import { UserOutlined, PhoneOutlined, MailOutlined, CameraOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import type { UploadFile } from 'antd/es/upload/interface';
import type { User } from '@/service/user';
import { uploadAvatar } from '@/service/profile';
import { useUser } from '@/contexts/UserContext';

interface EditProfileModalProps {
  visible: boolean;
  user: User | null;
  onCancel: () => void;
  onOk: (values: Partial<User>) => void;
}

export default function EditProfileModal({
  visible,
  user,
  onCancel,
  onOk,
}: EditProfileModalProps) {
  const { user: currentUser } = useUser();
  const [form] = Form.useForm();
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(user?.avatar);
  const [uploading, setUploading] = useState(false);
  
  // 使用全局用户信息作为数据源
  const displayUser = user || currentUser;

  useEffect(() => {
    if (visible && displayUser) {
      form.setFieldsValue({
        name: displayUser.name,
        phone: displayUser.phone,
        email: displayUser.email,
        avatar: displayUser.avatar,
      });
      setAvatarUrl(displayUser.avatar);
    }
  }, [visible, displayUser, form]);

  const handleAvatarUpload: UploadProps['customRequest'] = async (options) => {
    const { file, onSuccess, onError } = options;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file as File);
      
      // 使用当前用户ID
      const currentUserId = displayUser?.userId || displayUser?.id;
      if (!currentUserId) {
        message.error('用户ID不存在');
        return;
      }
      const res = await uploadAvatar(currentUserId, formData);
      
      setAvatarUrl(res.data);
      form.setFieldsValue({ avatar: res.data });
      message.success('头像上传成功');
      
      if (onSuccess) {
        onSuccess(res.data);
      }
    } catch (err) {
      message.error('头像上传失败');
      if (onError) {
        onError(err as Error);
      }
    } finally {
      setUploading(false);
    }
  };

  const uploadProps: UploadProps = {
    name: 'avatar',
    listType: 'picture-circle',
    showUploadList: false,
    customRequest: handleAvatarUpload,
    accept: 'image/*',
    beforeUpload: (file) => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('只能上传图片文件！');
        return false;
      }
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        message.error('图片大小不能超过 2MB！');
        return false;
      }
      return true;
    },
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      onOk(values);
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
      title="编辑个人资料"
      open={visible}
      onOk={handleSubmit}
      onCancel={handleCancel}
      okText="保存"
      cancelText="取消"
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        style={{ marginTop: 24 }}
      >
        <Form.Item
          name="avatar"
          label="头像"
          style={{ textAlign: 'center' }}
        >
          <Upload {...uploadProps}>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <Avatar
                size={100}
                src={avatarUrl}
                icon={<UserOutlined />}
                style={{ cursor: 'pointer' }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: 'rgba(0, 0, 0, 0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <CameraOutlined style={{ color: '#fff', fontSize: 14 }} />
              </div>
            </div>
          </Upload>
          {uploading && <div style={{ marginTop: 8, color: '#999' }}>上传中...</div>}
        </Form.Item>

        <Form.Item
          name="name"
          label="姓名"
          rules={[
            { required: true, message: '请输入姓名' },
            { min: 2, message: '姓名至少2个字符' },
            { max: 20, message: '姓名最多20个字符' },
          ]}
        >
          <Input
            prefix={<UserOutlined />}
            placeholder="请输入姓名"
          />
        </Form.Item>

        <Form.Item
          name="phone"
          label="手机号"
          rules={[
            { required: true, message: '请输入手机号' },
            { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' },
          ]}
        >
          <Input
            prefix={<PhoneOutlined />}
            placeholder="请输入手机号"
            maxLength={11}
          />
        </Form.Item>

        <Form.Item
          name="email"
          label="邮箱"
          rules={[
            { type: 'email', message: '请输入正确的邮箱地址' },
          ]}
        >
          <Input
            prefix={<MailOutlined />}
            placeholder="请输入邮箱（可选）"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}

'use client';

import React, { useState } from 'react';
import { ProCard } from '@ant-design/pro-components';
import { Descriptions, Avatar, Button, Space, message, Upload } from 'antd';
import { UserOutlined, EditOutlined, LockOutlined, CameraOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { updateUser, type User } from '@/service/user';
import { changePassword as changePasswordApi, uploadAvatar } from '@/service/profile';
import { useUser } from '@/contexts/UserContext';
import EditProfileModal from './components/EditProfileModal';
import ChangePasswordModal from './components/ChangePasswordModal';

export default function ProfilePage() {
  const { user, loading, refreshUser, logout } = useUser();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);

  // 获取当前用户ID（从user中获取）
  const currentUserId = user?.userId || user?.id;

  const handleEditProfile = async (values: Partial<User>) => {
    if (!currentUserId) {
      message.error('用户ID不存在');
      return;
    }
    try {
      await updateUser(currentUserId, values);
      message.success('个人信息更新成功');
      setEditModalVisible(false);
      // 更新全局用户状态
      await refreshUser();
    } catch (err) {
      message.error('更新失败');
      console.error(err);
    }
  };

  const handleChangePassword = async (values: { oldPassword: string; newPassword: string }) => {
    if (!currentUserId) {
      message.error('用户ID不存在');
      return;
    }
    try {
      await changePasswordApi(currentUserId, values.oldPassword, values.newPassword);
      message.success('密码修改成功，请重新登录', 2);
      setPasswordModalVisible(false);
      // 密码修改成功后，清除 token 并跳转到登录页
      // 延迟一下让用户看到成功提示
      setTimeout(() => {
        logout();
      }, 1500);
    } catch (err) {
      message.error('密码修改失败');
      console.error(err);
    }
  };

  const handleAvatarUpload: UploadProps['customRequest'] = async (options) => {
    const { file, onSuccess, onError } = options;
    if (!currentUserId) {
      message.error('用户ID不存在');
      if (onError) {
        onError(new Error('用户ID不存在'));
      }
      return;
    }
    try {
      const formData = new FormData();
      formData.append('file', file as File);
      
      const res = await uploadAvatar(currentUserId, formData);
      
      // 更新用户信息中的头像
      if (res.data) {
        await updateUser(currentUserId, { avatar: res.data });
        // 更新全局用户状态
        await refreshUser();
      }
      
      message.success('头像上传成功');
      if (onSuccess) {
        onSuccess(res.data);
      }
    } catch (err) {
      message.error('头像上传失败');
      if (onError) {
        onError(err as Error);
      }
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

  return (
    <div style={{ padding: 24 }}>
      <ProCard
        title="个人中心"
        extra={
          <Space>
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => setEditModalVisible(true)}
            >
              编辑资料
            </Button>
            <Button
              icon={<LockOutlined />}
              onClick={() => setPasswordModalVisible(true)}
            >
              修改密码
            </Button>
          </Space>
        }
        loading={loading}
      >
        {user && (
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <Upload {...uploadProps}>
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <Avatar
                  size={120}
                  src={user.avatar}
                  icon={<UserOutlined />}
                  style={{ marginBottom: 16, cursor: 'pointer' }}
                />
                <div
                  style={{
                    position: 'absolute',
                    bottom: 20,
                    right: '50%',
                    transform: 'translateX(50%)',
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <CameraOutlined style={{ color: '#fff', fontSize: 16 }} />
                </div>
              </div>
            </Upload>
            <h2 style={{ marginBottom: 8 }}>{user.name}</h2>
            <p style={{ color: '#999', marginBottom: 0 }}>{user.role}</p>
          </div>
        )}

        <Descriptions title="基本信息" bordered column={2}>
          <Descriptions.Item label="姓名">{user?.name || '-'}</Descriptions.Item>
          <Descriptions.Item label="角色">{user?.role || '-'}</Descriptions.Item>
          <Descriptions.Item label="手机号">{user?.phone || '-'}</Descriptions.Item>
          <Descriptions.Item label="邮箱">{user?.email || '-'}</Descriptions.Item>
          <Descriptions.Item label="所属营地">{user?.campName || '-'}</Descriptions.Item>
          <Descriptions.Item label="状态">
            {user?.status === 1 ? '正常' : '停用'}
          </Descriptions.Item>
          <Descriptions.Item label="用户ID">{user?.userId || user?.id || '-'}</Descriptions.Item>
          <Descriptions.Item label="营地ID">{user?.campId || '-'}</Descriptions.Item>
        </Descriptions>
      </ProCard>

      <EditProfileModal
        visible={editModalVisible}
        user={user}
        onCancel={() => setEditModalVisible(false)}
        onOk={handleEditProfile}
      />

      <ChangePasswordModal
        visible={passwordModalVisible}
        onCancel={() => setPasswordModalVisible(false)}
        onOk={handleChangePassword}
      />
    </div>
  );
}

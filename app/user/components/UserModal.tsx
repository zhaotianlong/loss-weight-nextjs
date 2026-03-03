'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Modal, Form, Input, Select, Alert, message, InputNumber, Switch } from 'antd';
import type { User } from '@/service/user';
import type { Camp } from '@/service/camp';
import { getUserAccount } from '@/mock/mockData';
import { encryptPasswordForTransmit } from '@/utils/password';
import { useCampFilter } from '@/hooks/useCampFilter';

interface UserModalProps {
  visible: boolean;
  mode: 'create' | 'edit';
  user?: User | null;
  campList: Camp[];
  defaultCampId?: number;
  canManageAdminRole?: boolean; // 是否可以管理管理员角色
  onCancel: () => void;
  onOk: (values: Omit<User, 'userId' | 'id'>) => Promise<void> | void;
}

// 管理员角色列表
const ADMIN_ROLES = ['超级管理员', '营地管理员', '后勤管理员', '教练管理员', '招生管理员'];

// 普通员工角色列表
const REGULAR_ROLES = ['教练', '餐饮', '保洁', '行政', '招生销售', '运营'];

export default function UserModal({
  visible,
  mode,
  user,
  campList,
  defaultCampId,
  canManageAdminRole = false,
  onCancel,
  onOk,
}: UserModalProps) {
  const [form] = Form.useForm();
  const { shouldShowCampFilter, currentCampId, isSuper } = useCampFilter();

  // 使用 ref 记录是否已经初始化过，避免重复重置表单
  const initializedRef = useRef<{ visible: boolean; mode: string; userId?: string } | null>(null);

  useEffect(() => {
    if (visible) {
      const initKey = `${visible}_${mode}_${user?.userId || 'create'}`;
      const lastInitKey = initializedRef.current 
        ? `${initializedRef.current.visible}_${initializedRef.current.mode}_${initializedRef.current.userId || 'create'}`
        : null;
      
      // 只有当 visible、mode 或 user 真正变化时才初始化
      if (initKey !== lastInitKey) {
        if (mode === 'edit' && user) {
          form.setFieldsValue({
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            status: user.status,
            campId: user.campId,
            avatar: user.avatar,
            idNumber: user.idNumber,
            address: user.address,
            allowCommission: user.allowCommission ?? false,
            attachmentsText: (user.attachments || []).join('\n'), // 将数组转换为文本，用于显示
          });
          initializedRef.current = { visible, mode, userId: user.userId || user.id };
        } else if (mode === 'create') {
          // 只在真正需要时重置表单
          form.resetFields();
          // 如果不是超级管理员，使用当前用户的营地ID；否则使用 defaultCampId
          const initialCampId = isSuper ? defaultCampId : (currentCampId || defaultCampId);
          form.setFieldsValue({ 
            campId: initialCampId,
            status: 1, // 默认状态为在职
          });
          initializedRef.current = { visible, mode };
        }
      }
    } else {
      // 弹窗关闭时重置初始化标记
      initializedRef.current = null;
    }
  }, [visible, mode, user?.userId, user?.id, isSuper, currentCampId, defaultCampId, form, user]);
  
  // 监听角色变化
  const handleRoleChange = (role: string) => {
    // 如果是管理员角色，设置默认密码
    if (ADMIN_ROLES.includes(role)) {
      if (mode === 'create') {
        form.setFieldsValue({ password: 'admin123' });
      } else if (user?.userId) {
        // 编辑模式：获取当前密码
        const account = getUserAccount(user.userId);
        form.setFieldsValue({ password: account?.password || 'admin123' });
      }
    } else {
      // 普通员工角色，清除密码字段
      form.setFieldsValue({ password: undefined });
    }
  };
  
  // 监听手机号变化，更新提示信息
  const phone = Form.useWatch('phone', form);
  // 监听角色字段值变化，确保 selectedRole 与表单值同步
  const selectedRole = Form.useWatch('role', form) || '';
  
  const handleSubmit = async () => {
    try {
      // 先获取表单值，用于后续检查
      const currentValues = form.getFieldsValue();
      
      // 检查角色是否已选择（在验证前先检查，避免验证失败时丢失信息）
      if (!currentValues.role) {
        message.error('请选择角色');
        // 手动触发表单验证，高亮错误字段
        form.validateFields(['role']);
        return;
      }
      
      // 执行表单验证
      const values = await form.validateFields();
      
      // 再次确认角色值（验证后可能被清理）
      if (!values.role) {
        // 如果验证后角色值丢失，使用验证前的值
        values.role = currentValues.role;
      }
      
      // 权限检查：如果选择了管理员角色，但当前用户不是超级管理员，阻止提交
      const adminRoles = ['超级管理员', '营地管理员', '后勤管理员', '教练管理员', '招生管理员'];
      if (adminRoles.includes(values.role) && !canManageAdminRole) {
        message.warning('只有超级管理员可以新增或修改管理员角色');
        return;
      }
      
      // 如果提供了密码（管理员角色），对密码进行加密后再传输
      if (values.password && ADMIN_ROLES.includes(values.role)) {
        try {
          values.password = await encryptPasswordForTransmit(values.password);
        } catch (err) {
          console.error('密码加密失败:', err);
          message.error('密码加密失败，请重试');
          return;
        }
      }
      
      // 处理附件字段：将文本转换为数组
      if (values.attachmentsText) {
        values.attachments = values.attachmentsText.split('\n').filter((url: string) => url.trim());
      } else {
        values.attachments = [];
      }
      delete values.attachmentsText; // 删除临时字段
      
      // 如果不是超级管理员，强制使用当前用户的营地ID
      if (!shouldShowCampFilter() && currentCampId) {
        values.campId = currentCampId;
      }
      
      onOk(values);
      form.resetFields();
    } catch (err: any) {
      console.error('表单验证失败:', err);
      // 显示验证错误信息
      if (err?.errorFields && err.errorFields.length > 0) {
        const firstError = err.errorFields[0];
        if (firstError?.errors && firstError.errors.length > 0) {
          message.error(firstError.errors[0]);
        } else {
          message.error('请检查表单填写是否正确');
        }
      } else {
        message.error('表单验证失败，请检查填写是否正确');
      }
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={mode === 'create' ? '新增员工' : '编辑员工'}
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
          name="name"
          label="姓名"
          rules={[
            { required: true, message: '请输入姓名' },
            { max: 50, message: '姓名最多50个字符' },
          ]}
        >
          <Input placeholder="请输入姓名" />
        </Form.Item>

        <Form.Item
          name="phone"
          label="电话"
          rules={[
            { required: true, message: '请输入电话' },
            { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' },
          ]}
        >
          <Input placeholder="请输入手机号" maxLength={11} />
        </Form.Item>

        <Form.Item
          name="email"
          label="邮箱"
          rules={[
            { type: 'email', message: '请输入正确的邮箱地址' },
          ]}
        >
          <Input placeholder="请输入邮箱（可选）" />
        </Form.Item>

        <Form.Item
          name="avatar"
          label="个人头像"
        >
          <Input placeholder="请输入头像URL（可选）" />
        </Form.Item>

        <Form.Item
          name="idNumber"
          label="身份号"
          rules={[
            { pattern: /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/, message: '请输入正确的身份证号' },
          ]}
        >
          <Input placeholder="请输入身份证号（可选）" maxLength={18} />
        </Form.Item>

        <Form.Item
          name="address"
          label="居住地址"
        >
          <Input.TextArea 
            placeholder="请输入居住地址（可选）" 
            rows={2}
            maxLength={200}
            showCount
          />
        </Form.Item>

        <Form.Item
          name="attachmentsText"
          label="附件"
          tooltip="输入附件URL，多个URL用换行分隔"
        >
          <Input.TextArea 
            placeholder="请输入附件URL，多个URL用换行分隔（可选）" 
            rows={3}
          />
        </Form.Item>

        <Form.Item
          name="role"
          label="角色"
          rules={[{ required: true, message: '请选择角色' }]}
        >
          <Select 
            placeholder="请选择角色"
            onChange={handleRoleChange}
            disabled={mode === 'edit' && !!user?.role && ADMIN_ROLES.includes(user.role) && !canManageAdminRole}
          >
            <Select.OptGroup label="管理员员工（可登录）">
              {ADMIN_ROLES.map(role => (
                <Select.Option 
                  key={role} 
                  value={role}
                  disabled={!canManageAdminRole}
                >
                  {role}
                </Select.Option>
              ))}
            </Select.OptGroup>
            <Select.OptGroup label="普通员工">
              {REGULAR_ROLES.map(role => (
                <Select.Option key={role} value={role}>{role}</Select.Option>
              ))}
            </Select.OptGroup>
          </Select>
          {!canManageAdminRole && (
            <div style={{ color: '#999', fontSize: '12px', marginTop: 4 }}>
              提示：只有超级管理员可以新增或修改管理员角色
            </div>
          )}
        </Form.Item>
        
        {/* 管理员角色显示密码字段 - 只有超级管理员可以管理 */}
        {ADMIN_ROLES.includes(selectedRole) && canManageAdminRole && (
          <>
            <Alert
              message="提示"
              description={`管理员员工可以登录系统，账号默认为手机号：${phone || '请先输入手机号'}，初始密码如下。`}
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
            <Form.Item
              name="password"
              label="登录密码"
              rules={[
                { required: ADMIN_ROLES.includes(selectedRole), message: '请输入密码' },
                { min: 6, message: '密码至少6个字符' },
              ]}
            >
              <Input.Password 
                placeholder="请输入密码（管理员角色必填）"
                readOnly={mode === 'edit'}
                style={{ backgroundColor: mode === 'edit' ? '#f5f5f5' : undefined }}
              />
            </Form.Item>
          </>
        )}

        <Form.Item
          name="campId"
          label="所属营地"
          hidden={!shouldShowCampFilter()}
        >
          <Select placeholder="请选择所属营地（可选）" allowClear>
            {campList.map((camp) => (
              <Select.Option key={camp.campId} value={camp.campId}>
                {camp.campName}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="baseSalary"
          label="底薪"
          rules={[{ required: true, message: '请输入底薪' }]}
        >
          <InputNumber 
            placeholder="请输入底薪" 
            style={{ width: '100%' }} 
            min={0} 
            precision={2}
            prefix="¥"
          />
        </Form.Item>

        <Form.Item
          name="allowCommission"
          label="支持提成"
          valuePropName="checked"
          initialValue={false}
        >
          <Switch />
        </Form.Item>

        <Form.Item
          name="status"
          label="状态"
          rules={[{ required: true, message: '请选择状态' }]}
        >
          <Select placeholder="请选择状态">
            <Select.Option value={1}>在职</Select.Option>
            <Select.Option value={0}>离职</Select.Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
}


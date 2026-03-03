'use client';

import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Tabs, message, Space, Spin } from 'antd';
import { UserOutlined, LockOutlined, MobileOutlined, SafetyOutlined } from '@ant-design/icons';
import { loginByPassword, loginByCode, sendCode } from '@/service/auth';
import { setToken, getAndClearRedirectPath } from '@/utils/auth';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { encryptPasswordForTransmit } from '@/utils/password';

type LoginType = 'password' | 'code';

export default function LoginPage() {
  const [form] = Form.useForm();
  const router = useRouter();
  const { isAuthenticated, loading: userLoading } = useUser();
  const [loginType, setLoginType] = useState<LoginType>('password');
  const [loading, setLoading] = useState(false);
  const [codeLoading, setCodeLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // 如果已登录且用户信息已加载，跳转到首页
  useEffect(() => {
    if (!userLoading && isAuthenticated) {
      getAndClearRedirectPath(); // 清除保存的路径
      router.replace('/'); // 使用 replace 避免浏览器历史记录中有登录页
    }
  }, [isAuthenticated, userLoading, router]);

  // 如果正在加载用户信息，显示加载状态
  if (userLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: 400,
            padding: 40,
            background: '#fff',
            borderRadius: 8,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            textAlign: 'center',
          }}
        >
          <Spin size="large" />
        </div>
      </div>
    );
  }

  // 如果已登录，不显示登录表单（会跳转）
  if (isAuthenticated) {
    return null;
  }

  // 发送验证码
  const handleSendCode = async () => {
    try {
      const phone = form.getFieldValue('phone');
      if (!phone) {
        message.error('请输入手机号');
        return;
      }
      if (!/^1[3-9]\d{9}$/.test(phone)) {
        message.error('请输入正确的手机号');
        return;
      }

      setCodeLoading(true);
      const res = await sendCode({ phone });
      message.success(`验证码已发送：${res.data.code}（开发环境显示）`);
      
      // 开始倒计时
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      message.error('发送验证码失败');
    } finally {
      setCodeLoading(false);
    }
  };

  // 账号密码登录
  const handlePasswordLogin = async (values: any) => {
    setLoading(true);
    try {
      // 对密码进行加密后再传输
      const encryptedPassword = await encryptPasswordForTransmit(values.password);
      
      // 判断是账号还是手机号
      const isPhone = /^1[3-9]\d{9}$/.test(values.username);
      const res = await loginByPassword({
        username: isPhone ? undefined : values.username,
        phone: isPhone ? values.username : undefined,
        password: encryptedPassword,
      });
      
      // 只保存 token，用户信息通过接口获取
      setToken(res.data.token);
      
      message.success('登录成功');
      
      // 清除保存的路径，刷新页面让 UserContext 重新初始化并获取用户信息
      getAndClearRedirectPath();
      // 使用 window.location.href 强制刷新页面，确保 UserContext 重新初始化
      window.location.href = '/';
    } catch (err) {
      message.error('登录失败，请检查账号密码');
    } finally {
      setLoading(false);
    }
  };

  // 验证码登录
  const handleCodeLogin = async (values: any) => {
    setLoading(true);
    try {
      const res = await loginByCode({
        phone: values.phone,
        code: values.code,
      });
      
      // 只保存 token，用户信息通过接口获取
      setToken(res.data.token);
      
      message.success('登录成功');
      
      // 清除保存的路径，刷新页面让 UserContext 重新初始化并获取用户信息
      getAndClearRedirectPath();
      // 使用 window.location.href 强制刷新页面，确保 UserContext 重新初始化
      window.location.href = '/';
    } catch (err) {
      message.error('登录失败，请检查验证码');
    } finally {
      setLoading(false);
    }
  };

  const tabItems = [
    {
      key: 'password',
      label: '账号密码登录',
      children: (
        <Form
          form={form}
          onFinish={handlePasswordLogin}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="username"
            label="账号"
            rules={[
              { required: true, message: '请输入账号或手机号' },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="请输入账号或手机号"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="密码"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, message: '密码至少6个字符' },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="请输入密码"
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              登录
            </Button>
          </Form.Item>
        </Form>
      ),
    },
    {
      key: 'code',
      label: '手机号验证码登录',
      children: (
        <Form
          form={form}
          onFinish={handleCodeLogin}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="phone"
            label="手机号"
            rules={[
              { required: true, message: '请输入手机号' },
              { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' },
            ]}
          >
            <Input
              prefix={<MobileOutlined />}
              placeholder="请输入手机号"
              maxLength={11}
            />
          </Form.Item>

          <Form.Item
            name="code"
            label="验证码"
            rules={[
              { required: true, message: '请输入验证码' },
              { len: 6, message: '验证码为6位数字' },
            ]}
          >
            <Space.Compact style={{ width: '100%' }}>
              <Input
                prefix={<SafetyOutlined />}
                placeholder="请输入验证码"
                maxLength={6}
                style={{ flex: 1 }}
              />
              <Button
                onClick={handleSendCode}
                loading={codeLoading}
                disabled={countdown > 0}
              >
                {countdown > 0 ? `${countdown}秒` : '发送验证码'}
              </Button>
            </Space.Compact>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              登录
            </Button>
          </Form.Item>
        </Form>
      ),
    },
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 400,
          padding: 40,
          background: '#fff',
          borderRadius: 8,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 8 }}>
            减肥训练营管理系统
          </h1>
          <p style={{ color: '#999' }}>请登录您的账号</p>
        </div>

        <Tabs
          activeKey={loginType}
          onChange={(key) => {
            setLoginType(key as LoginType);
            form.resetFields();
          }}
          items={tabItems}
        />
      </div>
    </div>
  );
}


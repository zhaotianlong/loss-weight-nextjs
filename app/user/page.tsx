'use client';

import React, { useRef, useState, useEffect } from 'react';
import { ProTable, ProColumns, ActionType, ProFormInstance } from '@ant-design/pro-components';
import { Button, Space, message, Popconfirm, Avatar, Tooltip, Tag } from 'antd';
import { UserOutlined, EditOutlined, DeleteOutlined, PaperClipOutlined, PlusOutlined, LockOutlined } from '@ant-design/icons';
import { getUserList, deleteUser, createUser, updateUser, resetUserPassword, type User } from '@/service/user';
import { getCampList, type Camp } from '@/service/camp';
import { EmployeePositionTag } from '@/components/common';
import { StatusTag } from '@/components/common';
import { useCampFilter } from '@/hooks/useCampFilter';
import { useUser } from '@/contexts/UserContext';
import { isSuperAdmin } from '@/constants/permissions';
import UserModal from './components/UserModal';
import ResetPasswordModal from './components/ResetPasswordModal';

export default function UserPage() {
  const actionRef = useRef<ActionType>(undefined);
  const formRef = useRef<ProFormInstance>(undefined);
  const [campList, setCampList] = useState<Camp[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [resetPasswordVisible, setResetPasswordVisible] = useState(false);
  const [resettingUser, setResettingUser] = useState<User | null>(null);
  const { getCampIdForQuery, shouldShowCampFilter, getDefaultCampId } = useCampFilter();
  const { user: currentUser } = useUser();

  // 获取营地列表用于筛选
  useEffect(() => {
    const fetchCamps = async () => {
      try {
        const res = await getCampList({ pageSize: 1000 });
        setCampList(res.data || []);
      } catch (error) {
        console.error('获取营地列表失败:', error);
      }
    };
    fetchCamps();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await deleteUser(id);
      message.success('员工已删除');
      actionRef.current?.reload();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleCreate = () => {
    setModalMode('create');
    setEditingUser(null);
    setModalVisible(true);
  };

  const handleEdit = (user: User) => {
    // 检查是否在编辑管理员角色，且当前用户不是超级管理员
    const adminRoles = ['超级管理员', '营地管理员', '后勤管理员', '教练管理员', '招生管理员'];
    if (adminRoles.includes(user.role) && !canManageAdminRole()) {
      message.warning('只有超级管理员可以编辑管理员角色');
      return;
    }
    setEditingUser(user);
    setModalMode('edit');
    setModalVisible(true);
  };

  const handleModalOk = async (values: Omit<User, 'userId' | 'id'>) => {
    try {
      if (modalMode === 'create') {
        await createUser(values);
        message.success('员工创建成功');
      } else {
        if (editingUser) {
          const id = editingUser.userId || editingUser.id || '';
          await updateUser(id, values);
          message.success('员工更新成功');
        }
      }
      setModalVisible(false);
      actionRef.current?.reload();
    } catch {
      message.error(modalMode === 'create' ? '创建失败' : '更新失败');
    }
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    setEditingUser(null);
  };

  // 检查是否可以重置密码
  const canResetPassword = (targetUser: User): boolean => {
    if (!currentUser) return false;
    
    // 只有管理员角色可以重置密码
    const adminRoles = ['超级管理员', '营地管理员', '后勤管理员', '教练管理员', '招生管理员'];
    if (!adminRoles.includes(targetUser.role)) {
      return false;
    }

    // 超级管理员可以重置任何人的密码
    if (isSuperAdmin(currentUser.role)) {
      return true;
    }

    // 营地管理员只能重置自己营地的人员密码
    if (currentUser.role === '营地管理员') {
      return currentUser.campId === targetUser.campId;
    }

    // 其他管理员可以重置自己的密码
    if (currentUser.userId === targetUser.userId) {
      return true;
    }

    return false;
  };

  // 检查是否可以编辑/新增管理员角色
  const canManageAdminRole = (): boolean => {
    if (!currentUser) return false;
    return isSuperAdmin(currentUser.role);
  };

  const handleResetPassword = (user: User) => {
    setResettingUser(user);
    setResetPasswordVisible(true);
  };

  const handleResetPasswordOk = async (userId: string, newPassword: string) => {
    try {
      await resetUserPassword(userId, newPassword);
      message.success('密码重置成功，该用户需要重新登录');
      setResetPasswordVisible(false);
      setResettingUser(null);
    } catch (error) {
      message.error('密码重置失败');
    }
  };

  const handleResetPasswordCancel = () => {
    setResetPasswordVisible(false);
    setResettingUser(null);
  };

  // 身份证号脱敏处理
  const maskIdNumber = (idNumber?: string): string => {
    if (!idNumber) return '-';
    const len = idNumber.length;
    if (len === 18) {
      // 18位身份证：显示前6位和后4位
      return `${idNumber.substring(0, 6)}${'*'.repeat(8)}${idNumber.substring(14)}`;
    } else if (len === 15) {
      // 15位身份证：显示前6位和后3位
      return `${idNumber.substring(0, 6)}${'*'.repeat(6)}${idNumber.substring(12)}`;
    }
    // 其他长度：只显示前3位和后2位
    return `${idNumber.substring(0, 3)}${'*'.repeat(Math.max(0, len - 5))}${idNumber.substring(len - 2)}`;
  };

  const columns: ProColumns<User>[] = [
    ...(shouldShowCampFilter() ? [{
      title: '营地',
      dataIndex: 'campId',
      key: 'campId',
      width: 150,
      valueType: 'select' as const,
      valueEnum: campList.reduce((acc, camp) => {
        acc[camp.campId] = { text: camp.campName };
        return acc;
      }, {} as Record<number, { text: string }>),
      hideInTable: false, // 在表格中显示
      hideInSearch: false, // 在搜索表单中显示
      initialValue: getDefaultCampId(),
      fieldProps: (form) => ({
        options: campList.map(camp => ({
          label: camp.campName,
          value: camp.campId,
        })),
        onChange: (value: number) => {
           form.setFieldsValue({ campId: value });
           form.submit();
         },
      }),
      render: (_: unknown, record: User) => {
        const camp = campList.find(c => c.campId === record.campId);
        return camp?.campName || '-';
      },
    }] : []),
    // 非超级管理员也需要在表格中显示所属营地
    ...(!shouldShowCampFilter() ? [{
      title: '所属营地',
      dataIndex: 'campId',
      key: 'campId',
      width: 150,
      hideInSearch: true, // 不在搜索表单中显示
      render: (_: unknown, record: User) => {
        const camp = campList.find(c => c.campId === record.campId);
        return camp?.campName || '-';
      },
    }] : []),
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      width: 120,
      fieldProps: {
        onPressEnter: () => {
          // 输入框回车时触发搜索
          formRef.current?.submit();
        },
      },
      render: (_: unknown, record: User) => <strong>{record.name}</strong>,
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      width: 120,
      valueType: 'select',
      valueEnum: {
        '超级管理员': { text: '超级管理员', status: 'Error' },
        '营地管理员': { text: '营地管理员', status: 'Error' },
        '后勤管理员': { text: '后勤管理员', status: 'Error' },
        '教练管理员': { text: '教练管理员', status: 'Error' },
        '招生管理员': { text: '招生管理员', status: 'Error' },
        '教练': { text: '教练', status: 'Processing' },
        '餐饮': { text: '餐饮', status: 'Success' },
        '保洁': { text: '保洁', status: 'Default' },
        '行政': { text: '行政', status: 'Warning' },
        '招生销售': { text: '招生销售', status: 'Warning' },
        '运营': { text: '运营', status: 'Success' },
      },
      fieldProps: {
        onChange: () => {
          // 下拉列表改变时触发搜索
          formRef.current?.submit();
        },
      },
      render: (_: any, record: User) => <EmployeePositionTag position={record.role} />,
    },
    {
      title: '电话',
      dataIndex: 'phone',
      key: 'phone',
      width: 130,
      fieldProps: {
        onPressEnter: () => {
          // 输入框回车时触发搜索
          formRef.current?.submit();
        },
      },
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      width: 200,
      fieldProps: {
        onPressEnter: () => {
          // 输入框回车时触发搜索
          formRef.current?.submit();
        },
      },
    },
    {
      title: '头像',
      dataIndex: 'avatar',
      key: 'avatar',
      width: 80,
      hideInSearch: true,
      render: (_: unknown, record: User) => {
        if (record.avatar) {
          return (
            <Tooltip title={record.avatar}>
              <Avatar src={record.avatar} size={40} />
            </Tooltip>
          );
        }
        return <Avatar icon={<UserOutlined />} size={40} />;
      },
    },
    {
      title: '身份号',
      dataIndex: 'idNumber',
      key: 'idNumber',
      width: 180,
      hideInSearch: true,
      render: (_: unknown, record: User) => {
        if (!record.idNumber) return '-';
        return (
          <Tooltip title={record.idNumber}>
            <span style={{ fontFamily: 'monospace' }}>{maskIdNumber(record.idNumber)}</span>
          </Tooltip>
        );
      },
    },
    {
      title: '居住地址',
      dataIndex: 'address',
      key: 'address',
      width: 200,
      hideInSearch: true,
      ellipsis: true,
      render: (text) => {
        if (!text) return '-';
        return (
          <Tooltip title={text as string}>
            <span>{text}</span>
          </Tooltip>
        );
      },
    },
    {
      title: '底薪',
      dataIndex: 'baseSalary',
      key: 'baseSalary',
      width: 120,
      valueType: 'money',
      hideInSearch: true,
      sorter: true,
    },
    {
      title: '支持提成',
      dataIndex: 'allowCommission',
      key: 'allowCommission',
      width: 100,
      render: (val) => val ? <Tag color="green">是</Tag> : <Tag color="default">否</Tag>,
    },
    {
      title: '附件',
      dataIndex: 'attachments',
      key: 'attachments',
      width: 120,
      hideInSearch: true,
      render: (_: unknown, record: User) => {
        if (!record.attachments || record.attachments.length === 0) return '-';
        return (
          <Tooltip 
            title={
              <div>
                {record.attachments.map((url, index) => (
                  <div key={index} style={{ marginBottom: 4 }}>
                    <a href={url} target="_blank" rel="noopener noreferrer" style={{ color: '#fff' }}>
                      {url}
                    </a>
                  </div>
                ))}
              </div>
            }
          >
            <Tag icon={<PaperClipOutlined />} color="blue">
              {record.attachments.length} 个文件
            </Tag>
          </Tooltip>
        );
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      valueType: 'dateTime',
      width: 160,
      sorter: true,
      hideInSearch: true,
      hideInForm: true,
    },
    {
      title: '更新时间',
      dataIndex: 'updateTime',
      key: 'updateTime',
      valueType: 'dateTime',
      width: 160,
      sorter: true,
      hideInSearch: true,
      hideInForm: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      valueType: 'select',
      valueEnum: {
        1: { text: '在职', status: 'Success' },
        0: { text: '离职', status: 'Default' },
      },
      fieldProps: {
        onChange: () => {
          // 下拉列表改变时触发搜索
          formRef.current?.submit();
        },
      },
      render: (_: any, record: User) => <StatusTag status={record.status} />,
    },
    {
      title: '操作',
      key: 'action',
      width: 280,
      fixed: 'right' as const,
      valueType: 'option',
      render: (_: any, record: User) => {
        const adminRoles = ['超级管理员', '营地管理员', '后勤管理员', '教练管理员', '招生管理员'];
        const isAdminRole = adminRoles.includes(record.role);
        
        return (
          <Space size="small">
            <Button 
              type="link" 
              size="small" 
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            >
              编辑
            </Button>
            {canResetPassword(record) && (
              <Button 
                type="link" 
                size="small" 
                icon={<LockOutlined />}
                onClick={() => handleResetPassword(record)}
              >
                重置密码
              </Button>
            )}
            <Popconfirm
              title="删除员工"
              description="确定要删除该员工吗？"
              onConfirm={() => handleDelete(record.userId || record.id || '')}
              okText="确定"
              cancelText="取消"
            >
              <Button type="link" danger size="small" icon={<DeleteOutlined />}>
                删除
              </Button>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  return (
    <>
      <ProTable<User>
        headerTitle="员工管理"
        actionRef={actionRef}
        formRef={formRef}
        rowKey={(record) => record.userId || record.id || ''}
        search={{
          labelWidth: 'auto',
        }}
        scroll={{ x: 'max-content' }}
        toolBarRender={() => [
          <Button 
            type="primary" 
            key="primary" 
            icon={<PlusOutlined />}
            onClick={handleCreate}
          >
            新增员工
          </Button>,
        ]}
        request={async (params) => {
          console.log('UserPage request params:', params);
          try {
            const response = await getUserList({
              page: params.current,
              pageSize: params.pageSize,
              name: params.name,
              phone: params.phone,
              email: params.email,
              role: params.role,
              status: params.status ? Number(params.status) : undefined,
              // 从context获取campId，非超级管理员强制使用当前用户的campId
              campId: getCampIdForQuery(params.campId ? Number(params.campId) : undefined),
            });
            return {
              data: response.data || [],
              success: response.success,
              total: response.meta?.total || 0,
            };
          } catch (error) {
            return {
              data: [],
              success: false,
              total: 0,
            };
          }
        }}
        columns={columns}
      />
      <UserModal
        visible={modalVisible}
        mode={modalMode}
        user={editingUser}
        campList={campList}
        defaultCampId={getDefaultCampId()}
        canManageAdminRole={canManageAdminRole()}
        onCancel={handleModalCancel}
        onOk={handleModalOk}
      />
      <ResetPasswordModal
        visible={resetPasswordVisible}
        user={resettingUser}
        onCancel={handleResetPasswordCancel}
        onOk={handleResetPasswordOk}
      />
    </>
  );
}
'use client';

import React, { useEffect, useState } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Input,
  Select,
  Row,
  Col,
  Tag,
  Popconfirm,
  message,
} from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';

type StudentRow = {
  id: string;
  name: string;
  gender?: string;
  phone?: string;
  weight?: number;
  height?: number;
  bmi?: number;
  joinDate?: string;
  status?: string;
};

export default function StudentsPage() {
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/students?page=1&pageSize=1000');
        if (!res.ok) throw new Error('fetch students failed');
        const json = await res.json();
        const data = json.data || [];
        const rows: StudentRow[] = data.map((s: any) => ({
          id: String(s.stuId ?? s.id ?? ''),
          name: s.name,
          gender: s.gender ? (s.gender === 'male' ? '男' : s.gender === 'female' ? '女' : s.gender) : undefined,
          phone: s.phone,
          joinDate: s.checkinDate ?? s.joinDate,
          status: s.status === 1 ? 'active' : s.status === 2 ? 'paused' : String(s.status),
        }));
        setStudents(rows);
      } catch (err) {
        message.error('获取学员列表失败');
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const handleDelete = (id: string) => {
    setStudents(students.filter((s) => s.id !== id));
    message.success('学员已删除');
  };

  const columns = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      width: 120,
      render: (text) => <strong>{text as React.ReactNode}</strong>,
    },
    {
      title: '性别',
      dataIndex: 'gender',
      key: 'gender',
      width: 80,
    },
    {
      title: '联系方式',
      dataIndex: 'phone',
      key: 'phone',
      width: 130,
    },
    {
      title: '身体指标',
      key: 'physical',
      width: 150,
      render: (_, record: StudentRow) => (
        <div>
          <p style={{ margin: '4px 0' }}>体重: {record.weight ?? '-'} kg</p>
          <p style={{ margin: '4px 0' }}>BMI: {record.bmi ?? '-'}</p>
        </div>
      ),
    },
    {
      title: '入营日期',
      dataIndex: 'joinDate',
      key: 'joinDate',
      width: 120,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        const tagColor = {
          active: 'green',
          paused: 'orange',
          completed: 'blue',
        };
        const tagText = {
          active: '在训',
          paused: '暂停',
          completed: '结业',
        };
        return (
          <Tag color={tagColor[status as keyof typeof tagColor]}>
            {tagText[status as keyof typeof tagText]}
          </Tag>
        );
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_: any, record: StudentRow) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
          >
            编辑
          </Button>
          <Button
            type="default"
            size="small"
          >
            身体数据
          </Button>
          <Popconfirm
            title="删除学员"
            description="确定要删除该学员吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="primary"
              danger
              size="small"
              icon={<DeleteOutlined />}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const filteredStudents = students.filter((student) => {
    const matchName = student.name.toLowerCase().includes(searchText.toLowerCase()) ||
                      student.phone.includes(searchText);
    const matchStatus = !filterStatus || student.status === filterStatus;
    return matchName && matchStatus;
  });

  return (
    <div>
      {/* 页面标题 */}
      <Card
        style={{
          marginBottom: '24px',
          background: 'transparent',
          border: 'none',
        }}
      >
        <Row justify="space-between" align="middle">
          <Col>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>
              学员管理
            </h1>
            <p style={{ color: '#999', margin: '8px 0 0 0' }}>
              共 {students.length} 名学员
            </p>
          </Col>
          <Col>
            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
            >
              新增学员
            </Button>
          </Col>
        </Row>
      </Card>

      {/* 搜索和过滤 */}
      <Card style={{ marginBottom: '24px' }} bordered={false}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={10}>
            <Input
              placeholder="搜索学员姓名、电话..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              size="large"
            />
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Select
              placeholder="全部状态"
              size="large"
              value={filterStatus}
              onChange={setFilterStatus}
              style={{ width: '100%' }}
              allowClear
              options={[
                { label: '在训', value: 'active' },
                { label: '暂停', value: 'paused' },
                { label: '结业', value: 'completed' },
              ]}
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Button
              type="primary"
              size="large"
              block
              icon={<SearchOutlined />}
            >
              搜索
            </Button>
          </Col>
        </Row>
      </Card>

      {/* 学员表格 */}
      <Card bordered={false}>
        <Table
          dataSource={filteredStudents}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            total: filteredStudents.length,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>
    </div>
  );
}

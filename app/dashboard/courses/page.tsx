'use client';

import React, { useState } from 'react';
import {
  Card,
  Table,
  Button,
  Tabs,
  Space,
  Tag,
  Progress,
  Row,
  Col,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';

type PublicCourseRow = {
  id: string;
  name: string;
  instructor?: string;
  time?: string;
  location?: string;
  maxParticipants?: number;
  currentParticipants?: number;
};

type PrivateCourseRow = {
  id: string;
  student?: string;
  coach?: string;
  title: string;
  price?: number;
  sessions?: number;
  completedSessions?: number;
  status?: string;
};

export default function CoursesPage() {
  const [publicCourses, setPublicCourses] = useState<PublicCourseRow[]>([]);
  const [privateCourses, setPrivateCourses] = useState<PrivateCourseRow[]>([]);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [pubRes, privRes] = await Promise.all([
          fetch('/api/courses?page=1&pageSize=1000'),
          fetch('/api/private-courses?page=1&pageSize=1000'),
        ]);
        const pubJson = await pubRes.json();
        const privJson = await privRes.json();
        const pubs = (pubJson.data || []).map((c: any) => ({
          id: String(c.courseId ?? c.id ?? ''),
          name: c.title,
          instructor: c.coachId,
          time: c.schedule,
          location: c.location ?? '-',
          maxParticipants: c.maxParticipants ?? 40,
          currentParticipants: c.currentParticipants ?? Math.floor(Math.random() * (c.maxParticipants ?? 40)),
        })) as PublicCourseRow[];
        const privs = (privJson.data || []).map((p: any) => ({
          id: String(p.courseId ?? p.courseId),
          title: p.title,
          coach: p.coachId,
          price: p.price,
          sessions: p.duration,
          completedSessions: 0,
          status: p.status === 1 ? 'active' : String(p.status),
        })) as PrivateCourseRow[];
        setPublicCourses(pubs);
        setPrivateCourses(privs);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const publicColumns = [
    {
      title: '课程名称',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <strong>{text as React.ReactNode}</strong>,
    },
    {
      title: '教练',
      dataIndex: 'instructor',
      key: 'instructor',
    },
    {
      title: '时间',
      dataIndex: 'time',
      key: 'time',
    },
    {
      title: '地点',
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: '参加人数',
      key: 'participants',
      render: (_: any, record: PublicCourseRow) => (
        <div>
          <Tag color={(record.currentParticipants ?? 0) >= (record.maxParticipants ?? 0) ? 'red' : 'green'}>
            {record.currentParticipants ?? 0}/{record.maxParticipants ?? 0}
          </Tag>
          <Progress
            percent={Math.round(((record.currentParticipants ?? 0) / Math.max(1, (record.maxParticipants ?? 1))) * 100)}
            size="small"
            style={{ marginTop: '8px' }}
          />
        </div>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: () => (
        <Space size="small">
          <Button type="primary" size="small" icon={<EditOutlined />}>
            编辑
          </Button>
          <Button type="primary" danger size="small" icon={<DeleteOutlined />}>
            删除
          </Button>
        </Space>
      ),
    },
  ];

  const privateColumns = [
    {
      title: '学员',
      dataIndex: 'student',
      key: 'student',
    },
    {
      title: '教练',
      dataIndex: 'coach',
      key: 'coach',
    },
    {
      title: '课程名称',
      dataIndex: 'title',
      key: 'title',
      render: (text) => <strong>{text as React.ReactNode}</strong>,
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      render: (price) => <strong>¥{price as React.ReactNode}</strong>,
    },
    {
      title: '课时进度',
      key: 'progress',
      render: (_, record: PrivateCourseRow) => (
        <div>
          <span>{record.completedSessions ?? 0}/{record.sessions ?? 0}</span>
          <Progress
            percent={Math.round(((record.completedSessions ?? 0) / Math.max(1, (record.sessions ?? 1))) * 100)}
            size="small"
            style={{ marginTop: '8px' }}
          />
        </div>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colors = { active: 'green', completed: 'blue', cancelled: 'red' };
        const labels = { active: '进行中', completed: '已完成', cancelled: '已取消' };
        return <Tag color={colors[status as keyof typeof colors]}>{labels[status as keyof typeof labels]}</Tag>;
      },
    },
  ];

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
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>
          课程管理
        </h1>
        <p style={{ color: '#999', margin: '8px 0 0 0' }}>
          管理公共课程和私教课程
        </p>
      </Card>

      {/* 课程选项卡 */}
      <Card bordered={false}>
        <Tabs
          items={[
            {
              key: 'public',
              label: '公共课程（免费）',
              children: (
                <div>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    style={{ marginBottom: '16px' }}
                  >
                    新增课程
                  </Button>
                  <Table
                    dataSource={publicCourses}
                    columns={publicColumns}
                    rowKey="id"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                  />
                </div>
              ),
            },
            {
              key: 'private',
              label: '私教课程（付费）',
              children: (
                <div>
                  <Table
                    dataSource={privateCourses}
                    columns={privateColumns}
                    rowKey="id"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                  />
                </div>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
}

'use client';

import React from 'react';
import { ProCard, StatisticCard } from '@ant-design/pro-components';
import { Row, Col, Table, Alert, Space, Button, Tag } from 'antd';
import {
  TeamOutlined,
  DollarOutlined,
  BookOutlined,
  HomeOutlined,
} from '@ant-design/icons';
import { getCheckinList } from '@/service/checkin';
import { getStudentList } from '@/service/student';
import { formatDate } from '@/utils';

export default function Dashboard() {
  interface CheckinItem {
    key: string;
    name: string;
    gender: string;
    room: string;
    checkInDate: string;
  }

  interface StudentItem {
    checkoutDate?: string | null;
    status: number;
  }

  const [checkInData, setCheckInData] = React.useState<CheckinItem[]>([]);
  const [checkInLoading, setCheckInLoading] = React.useState(false);
  const [stats, setStats] = React.useState({
    totalStudents: 0,
    inCampStudents: 0,
    occupancyRate: 0,
    pendingTuition: 0,
    todayCourses: 0,
  });

  React.useEffect(() => {
    const fetchData = async () => {
      setCheckInLoading(true);
      try {
        // 获取最近入住记录
        const checkinRes = await getCheckinList({ page: 1, pageSize: 10 });
        const checkinItems: CheckinItem[] = (checkinRes.data || []).map((c, idx: number) => ({
          key: String(c.checkinId ?? idx),
          name: String(c.stuId ?? ''),
          gender: '-',
          room: '-',
          checkInDate: formatDate(c.checkinDate),
        }));
        setCheckInData(checkinItems);

        // 获取学员统计数据
        const studentRes = await getStudentList({ page: 1, pageSize: 1000 });
        const students = (studentRes.data || []) as StudentItem[];
        const inCamp = students.filter((s) => !s.checkoutDate && s.status === 1);
        
        setStats({
          totalStudents: students.length,
          inCampStudents: inCamp.length,
          occupancyRate: 0,
          pendingTuition: 0,
          todayCourses: 8,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setCheckInLoading(false);
      }
    };
    fetchData();
  }, []);

  const checkInColumns = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '性别',
      dataIndex: 'gender',
      key: 'gender',
    },
    {
      title: '房间',
      dataIndex: 'room',
      key: 'room',
    },
    {
      title: '入住日期',
      dataIndex: 'checkInDate',
      key: 'checkInDate',
    },
  ];

  const renewalData = [
    { name: '陈女士', expiryDays: '2', amount: '9999' },
    { name: '赵先生', expiryDays: '5', amount: '5999' },
    { name: '孙女士', expiryDays: '6', amount: '12999' },
  ];

  const meals = [
    { meal: '早餐', name: '燕麦粥配水果', calories: '250', time: '07:00' },
    { meal: '加餐', name: '低脂酸奶', calories: '120', time: '10:00' },
    { meal: '午餐', name: '鸡胸肉+糙米+蔬菜', calories: '480', time: '12:00' },
    { meal: '晚餐', name: '鱼类+蒸蔬菜', calories: '350', time: '18:00' },
  ];

  return (
    <div>
      <ProCard
        style={{
          background: 'linear-gradient(135deg, #1890ff 0%, #1890ff 100%)',
          color: 'white',
          marginBottom: 24,
        }}
      >
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: 0, color: 'white' }}>
          欢迎回到仪表板
        </h1>
        <p style={{ margin: '8px 0 0 0', opacity: 0.9, color: 'white' }}>
          当前营地：北京减肥训练营 | 日期：{formatDate(new Date())}
        </p>
      </ProCard>

      <StatisticCard.Group direction="row" style={{ marginBottom: 24 }}>
        <StatisticCard
          statistic={{
            title: '总学员数',
            value: stats.totalStudents,
            prefix: <TeamOutlined />,
            suffix: '人',
            valueStyle: { color: '#1890ff' },
            description: `其中入住 ${stats.inCampStudents} 人`,
          }}
        />
        <StatisticCard
          statistic={{
            title: '床位占用率',
            value: stats.occupancyRate,
            prefix: <HomeOutlined />,
            suffix: '%',
            valueStyle: { color: '#52c41a' },
            description: '125/200 床位',
          }}
        />
        <StatisticCard
          statistic={{
            title: '待收学费',
            value: stats.pendingTuition,
            prefix: <DollarOutlined />,
            suffix: '元',
            valueStyle: { color: '#faad14' },
            description: '5 名学员',
          }}
        />
        <StatisticCard
          statistic={{
            title: '今日课程',
            value: stats.todayCourses,
            prefix: <BookOutlined />,
            suffix: '门',
            valueStyle: { color: '#722ed1' },
            description: '参加人数：87 人',
          }}
        />
      </StatisticCard.Group>

      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <ProCard title="最近入住学员" bordered>
            <Table
              dataSource={checkInData}
              columns={checkInColumns}
              pagination={false}
              size="small"
              loading={checkInLoading}
            />
          </ProCard>
        </Col>

        <Col xs={24} lg={12}>
          <ProCard title="待续费学员（7天内到期）" bordered>
            <Space direction="vertical" style={{ width: '100%' }}>
              {renewalData.map((item, index) => (
                <Alert
                  key={index}
                  message={
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <strong>{item.name}</strong>
                        <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#999' }}>
                          {item.expiryDays} 天后到期
                        </p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <strong style={{ color: '#ff4d4f' }}>¥{item.amount}</strong>
                        <Button
                          type="link"
                          size="small"
                          style={{ display: 'block', marginTop: '4px' }}
                        >
                          处理续费
                        </Button>
                      </div>
                    </div>
                  }
                  type="warning"
                  showIcon={false}
                  style={{ marginBottom: '8px' }}
                />
              ))}
            </Space>
          </ProCard>
        </Col>
      </Row>

      <ProCard title="今日菜单" bordered>
        <Row gutter={[16, 16]}>
          {meals.map((item, index) => (
            <Col xs={24} sm={12} lg={6} key={index}>
              <ProCard
                size="small"
                style={{
                  background: 'linear-gradient(135deg, #f6f8fb 0%, #f0f5fb 100%)',
                  border: '1px solid #e6f7ff',
                }}
              >
                <p style={{ fontSize: '12px', color: '#999', margin: '0 0 8px 0' }}>
                  {item.time}
                </p>
                <p style={{ fontWeight: 'bold', margin: '0 0 8px 0', fontSize: '14px' }}>
                  {item.meal}
                </p>
                <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#666' }}>
                  {item.name}
                </p>
                <Tag color="green">🔥 {item.calories} kcal</Tag>
              </ProCard>
            </Col>
          ))}
        </Row>
      </ProCard>
    </div>
  );
}
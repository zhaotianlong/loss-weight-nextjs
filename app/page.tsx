'use client';

import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, List, Avatar, Tag, Space, Typography, Select, Skeleton, message } from 'antd';
import { 
  TeamOutlined, 
  HomeOutlined, 
  DollarCircleOutlined, 
  BookOutlined,
  CalendarOutlined,
  FireOutlined,
  UserOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { getStudentList, Student } from '@/service/student';
import { getRoomDetailList, RoomDetail, Bed } from '@/service/room';
import { getTuitionList, Tuition } from '@/service/tuition';
import { getPublicCourseList, PublicCourse } from '@/service/course';
import { getCampList } from '@/service/camp';
import { getPerformanceStats } from '@/service/performance';
import { getDutyList, Duty } from '@/service/duty';
import { usePermission } from '@/hooks/usePermission';
import { useCampFilter } from '@/hooks/useCampFilter';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const MEAL_TYPE_MAP: Record<string, string> = {
  breakfast: '早餐',
  lunch: '午餐',
  dinner: '晚餐',
  snack: '加餐',
};

interface RenewalStudent extends Student {
  daysLeft: number;
}

interface DashboardStats {
  totalStudents: number;
  inCampStudents: number;
  totalBeds: number;
  occupiedBeds: number;
  pendingTuition: number;
  pendingTuitionCount: number;
  todayCourseCount: number;
  todayCourseParticipants: number;
  monthlyTuition: number;
  monthlyPrivateCoaching: number;
  recentCheckins: Student[];
  renewalStudents: RenewalStudent[];
  todayDuties: Duty[];
  publicCourses: PublicCourse[];
}

export default function Dashboard() {
  const { isSuperAdmin } = usePermission();
  const { currentCampId, getDefaultCampId } = useCampFilter();
  const [selectedCampId, setSelectedCampId] = useState<number | undefined>(undefined);
  const [campList, setCampList] = useState<{ campId: number; campName: string }[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  // 初始化营地列表和默认营地
  useEffect(() => {
    const init = async () => {
      try {
        const res = await getCampList();
        const camps = (res.data || []) as { campId: number; campName: string }[];
        setCampList(camps);
        
        const defaultId = currentCampId || getDefaultCampId();
        setSelectedCampId(defaultId);
      } catch (error) {
        console.error('Failed to init camps:', error);
      }
    };
    init();
  }, [currentCampId]);

  // 获取仪表盘数据
  useEffect(() => {
    if (!selectedCampId) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const currentMonth = dayjs().format('YYYY-MM');
        const today = dayjs().format('YYYY-MM-DD');
        const [
          studentRes,
          roomRes,
          tuitionRes,
          courseRes,
          performanceRes,
          dutyRes
        ] = await Promise.all([
          getStudentList({ campId: selectedCampId, pageSize: 1000 }),
          getRoomDetailList({ campId: selectedCampId, pageSize: 1000 }),
          getTuitionList({ campId: selectedCampId, status: 3, pageSize: 1000 }), // 3 为待审核
          getPublicCourseList({ campId: selectedCampId, pageSize: 1000 }),
          getPerformanceStats({ campId: selectedCampId, month: currentMonth }),
          getDutyList({ campId: selectedCampId, date: today })
        ]);

        const students = studentRes.data || [];
        const rooms = roomRes.data || [];
        const tuitionRecords = tuitionRes.data || [];
        const courses = courseRes.data || [];
        const performanceData = performanceRes.data || {};
        const duties = dutyRes.data || [];

        // 计算指标
        const inCampStudents = students.filter((s: Student) => s.status === 1);
        
        let totalBeds = 0;
        let occupiedBeds = 0;
        rooms.forEach((room: RoomDetail) => {
          totalBeds += (room.beds?.length || 0);
          occupiedBeds += (room.beds?.filter((b: Bed) => b.stuId) || []).length;
        });

        const pendingTuition = tuitionRecords.reduce((sum: number, t: Tuition) => sum + (t.amount || 0), 0);
        
        const todayCourses = courses.filter((c: PublicCourse) => c.schedule?.startsWith(today));
        const todayCourseParticipants = todayCourses.reduce((sum: number, c: PublicCourse) => sum + (c.currentParticipants || 0), 0);

        // 最近入住 (所有学员按入住日期排序)
        const recentCheckins = [...students]
          .filter((s: Student) => s.checkinDate)
          .sort((a: Student, b: Student) => dayjs(b.checkinDate).unix() - dayjs(a.checkinDate).unix());

        // 待续费 (7天内到期 + 已到期)
        const renewalStudents = students
          .filter((s: Student) => s.status === 1 && s.checkoutDate)
          .map((s: Student) => {
            const daysLeft = dayjs(s.checkoutDate).diff(dayjs(), 'day');
            return { ...s, daysLeft };
          })
          .filter((s: RenewalStudent) => s.daysLeft <= 7) // 包含已到期的 (daysLeft < 0)
          .sort((a: RenewalStudent, b: RenewalStudent) => a.daysLeft - b.daysLeft);

        // 今日排班 (按照时间排序)
        const todayDuties = duties.sort((a: Duty, b: Duty) => a.timeSlot.localeCompare(b.timeSlot));

        setStats({
          totalStudents: students.length,
          inCampStudents: inCampStudents.length,
          totalBeds,
          occupiedBeds,
          pendingTuition,
          pendingTuitionCount: tuitionRecords.length,
          todayCourseCount: todayCourses.length,
          todayCourseParticipants,
          monthlyTuition: performanceData.summary?.totalRecruitmentActual || 0,
          monthlyPrivateCoaching: performanceData.summary?.totalPrivateCoachingActual || 0,
          recentCheckins,
          renewalStudents,
          todayDuties,
          publicCourses: courses
        });
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
        message.error('数据加载失败');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedCampId]);

  if (!selectedCampId && campList.length > 0) {
    return <div className="p-4"><Skeleton active /></div>;
  }

  const currentCamp = campList.find(c => c.campId === selectedCampId);

  return (
    <div style={{ padding: '24px' }}>
      {/* 欢迎栏 */}
      <div style={{ 
        background: 'linear-gradient(90deg, #1890ff 0%, #36cfc9 100%)', 
        padding: '32px', 
        borderRadius: '8px',
        marginBottom: '24px',
        color: '#fff',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <Title level={2} style={{ color: '#fff', marginBottom: '8px' }}>欢迎回到仪表板</Title>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Text style={{ color: 'rgba(255,255,255,0.85)' }}>
              当前营地：{currentCamp?.campName || '加载中...'} | 日期：{dayjs().format('YYYY-MM-DD')}
            </Text>
            {isSuperAdmin && (
              <Select
                value={selectedCampId}
                onChange={setSelectedCampId}
                style={{ width: 200 }}
                placeholder="切换营地查看"
                size="small"
              >
                {campList.map(camp => (
                  <Select.Option key={camp.campId} value={camp.campId}>
                    {camp.campName}
                  </Select.Option>
                ))}
              </Select>
            )}
          </div>
        </div>
        <div style={{ 
          position: 'absolute', 
          right: '-20px', 
          bottom: '-20px', 
          opacity: 0.1,
          fontSize: '120px'
        }}>
          <HomeOutlined />
        </div>
      </div>

      {/* 核心统计指标 */}
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} lg={8}>
          <Card bordered={false} hoverable>
            <Skeleton loading={loading} active>
              <Statistic
                title="总学员数"
                value={stats?.totalStudents || 0}
                prefix={<TeamOutlined style={{ color: '#1890ff' }} />}
                suffix="人"
              />
              <div style={{ marginTop: '12px', color: 'rgba(0,0,0,0.45)' }}>
                其中入住 <Text style={{ color: '#1890ff' }}>{stats?.inCampStudents || 0}</Text> 人
              </div>
            </Skeleton>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card bordered={false} hoverable>
            <Skeleton loading={loading} active>
              <Statistic
                title="床位占用率"
                value={stats?.totalBeds ? Math.round((stats.occupiedBeds / stats.totalBeds) * 100) : 0}
                precision={1}
                prefix={<HomeOutlined style={{ color: '#52c41a' }} />}
                suffix="%"
              />
              <div style={{ marginTop: '12px', color: 'rgba(0,0,0,0.45)' }}>
                {stats?.occupiedBeds || 0} / {stats?.totalBeds || 0} 床位
              </div>
            </Skeleton>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card bordered={false} hoverable>
            <Skeleton loading={loading} active>
              <Statistic
                title="本月总收入 (招生)"
                value={stats?.monthlyTuition || 0}
                prefix={<DollarCircleOutlined style={{ color: '#f5222d' }} />}
                suffix="元"
              />
              <div style={{ marginTop: '12px', color: 'rgba(0,0,0,0.45)' }}>
                本月招生学费总额
              </div>
            </Skeleton>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card bordered={false} hoverable>
            <Skeleton loading={loading} active>
              <Statistic
                title="本月私教收入"
                value={stats?.monthlyPrivateCoaching || 0}
                prefix={<DollarCircleOutlined style={{ color: '#722ed1' }} />}
                suffix="元"
              />
              <div style={{ marginTop: '12px', color: 'rgba(0,0,0,0.45)' }}>
                本月私教课销售总额
              </div>
            </Skeleton>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card bordered={false} hoverable>
            <Skeleton loading={loading} active>
              <Statistic
                title="待审核学费"
                value={stats?.pendingTuition || 0}
                prefix={<DollarCircleOutlined style={{ color: '#faad14' }} />}
                suffix="元"
              />
              <div style={{ marginTop: '12px', color: 'rgba(0,0,0,0.45)' }}>
                共 <Text type="warning">{stats?.pendingTuitionCount || 0}</Text> 笔待处理
              </div>
            </Skeleton>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card bordered={false} hoverable>
            <Skeleton loading={loading} active>
              <Statistic
                title="今日课程"
                value={stats?.todayCourseCount || 0}
                prefix={<BookOutlined style={{ color: '#722ed1' }} />}
                suffix="门"
              />
              <div style={{ marginTop: '12px', color: 'rgba(0,0,0,0.45)' }}>
                预计参加人数：{stats?.todayCourseParticipants || 0} 人
              </div>
            </Skeleton>
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginTop: '24px' }}>
        {/* 最近入住 */}
        <Col xs={24} lg={16}>
          <Card title="最近入住学员" bordered={false}>
            <List
              loading={loading}
              dataSource={stats?.recentCheckins || []}
              pagination={{
                pageSize: 6,
                size: 'small',
                simple: true
              }}
              renderItem={(item: Student) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar icon={<UserOutlined />} />}
                    title={item.name}
                    description={
                      <Space split={<Text type="secondary">|</Text>}>
                        <Text type="secondary">营地：{currentCamp?.campName}</Text>
                        <Text type="secondary">性别：{item.gender === 'male' ? '男' : '女'}</Text>
                      </Space>
                    }
                  />
                  <div style={{ textAlign: 'right' }}>
                    <Text type="secondary" style={{ fontSize: '12px' }}>入住日期</Text>
                    <div style={{ fontWeight: 'bold' }}>{item.checkinDate}</div>
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* 待续费提醒 */}
        <Col xs={24} lg={8}>
          <Card title="待续费学员 (7天内到期)" bordered={false}>
            <List
              loading={loading}
              dataSource={stats?.renewalStudents || []}
              pagination={{
                pageSize: 4,
                size: 'small',
                simple: true
              }}
              renderItem={(item: RenewalStudent) => (
                <List.Item actions={[<a key="renew">处理续费</a>]}>
                  <List.Item.Meta
                    title={item.name}
                    description={
                      <Space direction="vertical" size={0}>
                        <Tag color={item.daysLeft <= 0 ? 'red' : item.daysLeft <= 2 ? 'volcano' : 'orange'}>
                          {item.daysLeft < 0 ? `已过期 ${Math.abs(item.daysLeft)} 天` : item.daysLeft === 0 ? '今日到期' : `${item.daysLeft} 天后到期`}
                        </Tag>
                        {item.checkoutDate && <Text type="secondary" style={{ fontSize: '12px' }}>到期: {item.checkoutDate}</Text>}
                      </Space>
                    }
                  />
                </List.Item>
              )}
              locale={{ emptyText: '暂无即将到期学员' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 今日安排 */}
      <Card title="今日安排 (排班与餐饮)" style={{ marginTop: '24px' }} bordered={false}>
        <Row gutter={[16, 16]}>
          {(stats?.todayDuties || []).map((item, index) => {
            const [startTime] = item.timeSlot.split('-');
            const isMeal = item.type === 'meal';
            const getTypeColor = (type?: string) => {
              if (type === 'meal') return '#faad14';
              if (type === 'duty') return '#1890ff';
              return '#52c41a';
            };

            return (
              <Col xs={24} sm={12} md={8} lg={6} key={item.id || index}>
                <Card 
                  size="small" 
                  style={{ 
                    background: isMeal ? '#fff7e6' : '#f0f5ff', 
                    borderRadius: '8px',
                    borderLeft: `4px solid ${getTypeColor(item.type)}`
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <Tag color={isMeal ? 'orange' : 'blue'}>{startTime}</Tag>
                    <Text type="secondary">
                      {isMeal ? (MEAL_TYPE_MAP[item.mealType || ''] || '餐饮') : item.type === 'duty' ? '值班' : '训练'}
                    </Text>
                  </div>
                  <Title level={5} style={{ margin: '8px 0', fontSize: '16px' }}>
                    {isMeal ? (item.location || '营养餐食') : 
                      (item.type === 'training' && item.courseId ? 
                        (stats?.publicCourses.find(c => c.courseId === item.courseId)?.title || '未知课程') : 
                        (item.remark || item.location || '值班任务'))}
                  </Title>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Space size={4}>
                      <ClockCircleOutlined style={{ color: 'rgba(0,0,0,0.45)', fontSize: '12px' }} />
                      <Text type="secondary" style={{ fontSize: '12px' }}>{item.timeSlot}</Text>
                    </Space>
                    {isMeal && item.calories && (
                      <Space size={4}>
                        <FireOutlined style={{ color: '#ff4d4f', fontSize: '12px' }} />
                        <Text type="success" style={{ fontSize: '12px' }}>{item.calories}kcal</Text>
                      </Space>
                    )}
                  </div>
                  <div style={{ marginTop: '8px', borderTop: '1px dashed rgba(0,0,0,0.06)', paddingTop: '8px' }}>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      负责人：{item.coach || '未设置'}
                    </Text>
                  </div>
                </Card>
              </Col>
            );
          })}
          {(!stats?.todayDuties || stats.todayDuties.length === 0) && !loading && (
            <Col span={24}>
              <div style={{ textAlign: 'center', padding: '40px', background: '#fafafa', borderRadius: '8px' }}>
                <CalendarOutlined style={{ fontSize: '32px', color: 'rgba(0,0,0,0.15)', marginBottom: '12px' }} />
                <div style={{ color: 'rgba(0,0,0,0.45)' }}>今日暂无排班安排</div>
              </div>
            </Col>
          )}
        </Row>
      </Card>
    </div>
  );
}
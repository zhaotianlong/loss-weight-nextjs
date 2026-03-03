'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Tabs, Tag, Empty, Spin, Button, Space, Typography, DatePicker, Row, Col, Card, Statistic, List, Rate, Calendar, Badge, Radio } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, TrophyOutlined, ScheduleOutlined, StarOutlined, CalendarOutlined, SearchOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';
import type { ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { getResponsibleStudents, getCoachCourses, getCoachPerformance, type Coach } from '@/service/coach';
import BodyDataModal from '../../../../app/student/components/BodyDataModal';
import type { Student } from '@/service/student';
import dayjs from 'dayjs';
import localeData from 'dayjs/plugin/localeData';
import 'dayjs/locale/zh-cn';
import { Input } from 'antd';

dayjs.extend(localeData);
dayjs.locale('zh-cn');

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// 定义课程数据类型
interface CourseData {
  id: string | number;
  studentName?: string;
  location: string;
  startTime: string;
  endTime?: string;
  duration: number;
  courseType: string;
  paymentType?: '包月' | '单节';
  isPublic?: boolean;
}

// 节假日/气节模拟数据
const HOLIDAYS: Record<string, string[]> = {
  '2026-01-01': ['元旦（休）', '元旦'],
  '2026-01-04': ['元旦（班）'],
  '2026-01-05': ['小寒'],
  '2026-01-20': ['大寒'],
  '2026-02-04': ['立春'],
  '2026-01-14': ['14日'], // Image shows a red circle on 14
};

// 模拟农历（仅作展示）
const LUNAR_DAYS: Record<string, string> = {
  '2026-01-01': '十三',
  '2026-01-02': '十四',
  '2026-01-03': '十五',
  '2026-01-04': '十六',
  '2026-01-05': '十七',
  '2026-01-14': '廿六',
  '2026-01-18': '三十',
  '2026-01-19': '初二',
  '2026-01-20': '初三',
  '2026-01-29': '十一',
  '2026-01-30': '十二',
};

// 定义统计数据类型
interface PerformanceStats {
  coursesToComplete: number;
  coursesSold: number;
  monthlyData: { month: string; count: number }[];
  rankings: { name: string; amount: number; rank: number }[];
  rating: number;
}

// 定义业绩数据类型
interface PerformanceData {
  id: string | number;
  studentName: string;
  courseType?: '常规' | '拉伸' | '瑜伽' | '普拉提' | '筋膜刀';
  paymentType?: '包月' | '单节';
  tuitionType?: '到期续费' | '入营付费';
  duration?: string;
  originalPrice?: number;
  discountPrice?: number;
  status?: '开单' | '上课中' | '已完成';
  orderTime?: string;
  closeTime?: string;
  amount: number;
  date: string;
}

interface CoachActionModalProps {
  visible: boolean;
  type: 'students' | 'courses' | 'inspection' | 'performance';
  coach: Coach | null;
  onCancel: () => void;
}

export default function CoachActionModal({
  visible,
  type,
  coach,
  onCancel,
}: CoachActionModalProps) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Student[]>([]);
  const [publicCourses, setPublicCourses] = useState<CourseData[]>([]);
  const [privateCourses, setPrivateCourses] = useState<CourseData[]>([]);
  const [coursePerformance, setCoursePerformance] = useState<PerformanceData[]>([]);
  const [enrollmentPerformance, setEnrollmentPerformance] = useState<PerformanceData[]>([]);
  const [performanceStats, setPerformanceStats] = useState<PerformanceStats | null>(null);
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs>(dayjs());
  const [viewMode, setViewMode] = useState<'month' | 'year'>('month');
  const [bodyDataVisible, setBodyDataVisible] = useState(false);
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<dayjs.Dayjs>(dayjs());
  const [selectedPerformanceMonth, setSelectedPerformanceMonth] = useState<dayjs.Dayjs>(dayjs());

  useEffect(() => {
    if (visible && coach) {
      if (type === 'students') {
        fetchStudents();
      } else if (type === 'courses') {
        fetchCourses();
      } else if (type === 'performance') {
        fetchPerformance();
      }
    }
  }, [visible, type, coach, selectedMonth, selectedPerformanceMonth]);

  const fetchStudents = async () => {
    if (!coach) return;
    setLoading(true);
    try {
      const res = await getResponsibleStudents(coach.empId);
      let studentList = (res.data || []) as Student[];
      
      // 过滤在营学员（状态为1）
      studentList = studentList.filter(student => student.status === 1);
      
      // 按月份过滤（假设checkinDate是入营日期）
      if (selectedMonth) {
        const monthStart = selectedMonth.startOf('month');
        const monthEnd = selectedMonth.endOf('month');
        studentList = studentList.filter(student => {
          if (!student.checkinDate) return false;
          const checkinDate = dayjs(student.checkinDate);
          // 检查日期是否在选定月份内（包含边界）
          return (checkinDate.isSame(monthStart) || checkinDate.isAfter(monthStart)) && 
                 (checkinDate.isSame(monthEnd) || checkinDate.isBefore(monthEnd));
        });
      }
      
      setData(studentList);
    } catch (error) {
      console.error('获取学员失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    if (!coach) return;
    setLoading(true);
    try {
      const [privateRes, publicRes] = await Promise.all([
        getCoachCourses(coach.empId, 'private'),
        getCoachCourses(coach.empId, 'public'),
      ]);
      
      // 转换数据格式以适配 ProTable
      const mapCourseData = (items: Record<string, unknown>[], isPublic = false): CourseData[] => {
        return (items || []).map(item => {
          const startTime = (item.startTime || item.scheduleTime || item.schedule || '2025-01-01 09:00') as string;
          const duration = (item.duration || item.durationMinutes || 60) as number;
          const endTime = dayjs(startTime).add(duration, 'minute').format('YYYY-MM-DD HH:mm');
          
          return {
            id: (item.id || item.courseId) as string | number,
            studentName: (item.studentName || (isPublic ? '多人公共课' : '未知学员')) as string,
            location: (item.location || '一号训练场') as string,
            startTime,
            endTime,
            duration,
            courseType: (item.courseType || '常规') as string,
            paymentType: (item.paymentType || '单节') as CourseData['paymentType'],
            isPublic,
          };
        });
      };

      setPrivateCourses(mapCourseData(privateRes.data, false));
      setPublicCourses(mapCourseData(publicRes.data, true));
    } catch (error) {
      console.error('获取课程失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPerformance = async () => {
    if (!coach) return;
    setLoading(true);
    try {
      const [courseRes, enrollmentRes, statsRes] = await Promise.all([
        getCoachPerformance(coach.empId, 'course'),
        getCoachPerformance(coach.empId, 'enrollment'),
        getCoachPerformance(coach.empId, 'stats'),
      ]);
      
      const mapPerformanceData = (items: Record<string, unknown>[]): PerformanceData[] => {
        let filtered = (items || []).map((item, index) => ({
          id: (item.id || index) as string | number,
          studentName: (item.studentName || '未知学员') as string,
          courseType: item.courseType as PerformanceData['courseType'],
          paymentType: item.paymentType as PerformanceData['paymentType'],
          tuitionType: item.tuitionType as PerformanceData['tuitionType'],
          duration: item.duration as string,
          originalPrice: item.originalPrice as number,
          discountPrice: item.discountPrice as number,
          status: item.status as PerformanceData['status'],
          orderTime: item.orderTime as string,
          closeTime: item.closeTime as string,
          amount: (item.amount || 0) as number,
          date: (item.date || '2025-01-01') as string,
        }));

        // 按月份筛选业绩
        if (selectedPerformanceMonth) {
          const monthStart = selectedPerformanceMonth.startOf('month');
          filtered = filtered.filter(item => {
            const performanceDate = dayjs(item.date);
            return performanceDate.isSame(monthStart, 'month');
          });
        }

        return filtered;
      };

      setCoursePerformance(mapPerformanceData(courseRes.data));
      setEnrollmentPerformance(mapPerformanceData(enrollmentRes.data));
      setPerformanceStats(statsRes.data);
    } catch (error) {
      console.error('获取业绩失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const privatePerformanceColumns: ProColumns<PerformanceData>[] = [
    {
      title: '学员名称',
      dataIndex: 'studentName',
      key: 'studentName',
    },
    {
      title: '私教课类型',
      dataIndex: 'courseType',
      key: 'courseType',
      valueEnum: {
        '常规': { text: '常规' },
        '拉伸': { text: '拉伸' },
        '瑜伽': { text: '瑜伽' },
        '普拉提': { text: '普拉提' },
        '筋膜刀': { text: '筋膜刀' },
      },
    },
    {
      title: '付费类型',
      dataIndex: 'paymentType',
      key: 'paymentType',
      valueEnum: {
        '包月': { text: '包月' },
        '单节': { text: '单节' },
      },
    },
    {
      title: '原价/优惠价',
      key: 'prices',
      render: (_, record) => {
        if (!record.originalPrice && !record.discountPrice) return '-';
        return (
          <Space size={4}>
            {record.originalPrice && <span style={{ textDecoration: 'line-through', color: '#999' }}>¥{record.originalPrice}</span>}
            {record.discountPrice && <span style={{ color: '#f5222d' }}>¥{record.discountPrice}</span>}
          </Space>
        );
      },
    },
    {
      title: '时长',
      dataIndex: 'duration',
      key: 'duration',
      render: (val: React.ReactNode) => val || '-',
    },
    {
      title: '进度',
      dataIndex: 'status',
      key: 'status',
      valueEnum: {
        '开单': { text: '开单', status: 'Default' },
        '上课中': { text: '上课中', status: 'Processing' },
        '已完成': { text: '已完成', status: 'Success' },
      },
    },
    {
      title: '时间节点',
      key: 'times',
      width: 200,
      render: (_, record) => (
        <div style={{ fontSize: '12px' }}>
          <div>开单: {record.orderTime || '-'}</div>
          <div>关单: {record.closeTime || '-'}</div>
        </div>
      ),
    },
    {
      title: '总价',
      dataIndex: 'amount',
      key: 'amount',
      valueType: 'money',
    },
  ];

  const enrollmentPerformanceColumns: ProColumns<PerformanceData>[] = [
    {
      title: '学员名称',
      dataIndex: 'studentName',
      key: 'studentName',
    },
    {
      title: '学费类型',
      dataIndex: 'tuitionType',
      key: 'tuitionType',
      valueEnum: {
        '到期续费': { text: '到期续费' },
        '入营付费': { text: '入营付费' },
      },
    },
    {
      title: '时长',
      dataIndex: 'duration',
      key: 'duration',
    },
    {
      title: '进度',
      dataIndex: 'status',
      key: 'status',
      valueEnum: {
        '开单': { text: '开单', status: 'Default' },
        '上课中': { text: '上课中', status: 'Processing' },
        '已完成': { text: '已完成', status: 'Success' },
      },
    },
    {
      title: '时间节点',
      key: 'times',
      width: 200,
      render: (_, record) => (
        <div style={{ fontSize: '12px' }}>
          <div>开单: {record.orderTime || '-'}</div>
          <div>关单: {record.closeTime || '-'}</div>
        </div>
      ),
    },
    {
      title: '学费总价',
      dataIndex: 'amount',
      key: 'amount',
      valueType: 'money',
    },
  ];

  const allCourses = useMemo(() => [...privateCourses, ...publicCourses], [privateCourses, publicCourses]);

  const tableData = useMemo(() => {
    const selected = dayjs(selectedDate);
    if (viewMode === 'year') {
      // 按年筛选时，显示选中日期（所在月份）的当月所有上课数据
      return allCourses.filter(course => {
        const courseDate = dayjs(course.startTime);
        return courseDate.year() === selected.year() && courseDate.month() === selected.month();
      });
    }
    // 按照月筛选时，点击某一天只显示当天的上课数据
    return allCourses.filter(course => {
      const courseDate = dayjs(course.startTime);
      return courseDate.isSame(selected, 'day');
    });
  }, [allCourses, selectedDate, viewMode]);

  const dateCellRender = (value: dayjs.Dayjs) => {
    const dateStr = value.format('YYYY-MM-DD');
    const dayCourses = allCourses.filter(course => dayjs(course.startTime).isSame(value, 'day'));
    const privateCount = dayCourses.filter(c => !c.isPublic).length;
    const publicCount = dayCourses.filter(c => c.isPublic).length;
    const holidays = HOLIDAYS[dateStr] || [];
    const lunarDay = LUNAR_DAYS[dateStr] || '';
    const isToday = value.isSame(dayjs(), 'day');

    return (
      <div style={{ height: '100%', position: 'relative', padding: '2px' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-start', marginBottom: '2px' }}>
          <span style={{ 
            fontSize: '12px',
            color: isToday ? '#fff' : '#8c8c8c',
            background: isToday ? '#1890ff' : 'transparent',
            borderRadius: '50%',
            width: '20px',
            height: '20px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: isToday ? 'bold' : 'normal'
          }}>
            {value.date()}
          </span>
        </div>
        
        <div className="events" style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {holidays.map((h, i) => (
            <div key={i} style={{ 
              background: '#fff1f0', 
              color: '#f5222d', 
              fontSize: '10px', 
              padding: '0 4px', 
              borderRadius: '2px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              border: '1px solid #ffa39e'
            }}>
              {h}
            </div>
          ))}
          
          {dayCourses.length > 0 ? (
            <div style={{ marginTop: '2px' }}>
              {privateCount > 0 && (
                <div style={{ fontSize: '10px', color: '#1890ff', display: 'flex', alignItems: 'center' }}>
                  <Badge status="processing" size="small" />
                  {privateCount}节私教
                </div>
              )}
              {publicCount > 0 && (
                <div style={{ fontSize: '10px', color: '#722ed1', display: 'flex', alignItems: 'center' }}>
                  <Badge status="warning" size="small" />
                  {publicCount}节公开
                </div>
              )}
            </div>
          ) : (
            !holidays.length && (
              <div style={{ 
                marginTop: '2px',
                background: '#f5f5f5', 
                color: '#bfbfbf', 
                fontSize: '10px', 
                padding: '0 6px', 
                borderRadius: '10px',
                textAlign: 'center',
                width: 'fit-content'
              }}>
                无课
              </div>
            )
          )}
        </div>
      </div>
    );
  };

  const monthCellRender = (value: dayjs.Dayjs) => {
    const selectedMonth = value.month();
    const selectedYear = value.year();
    const monthCourses = allCourses.filter(course => {
      const courseDate = dayjs(course.startTime);
      return courseDate.year() === selectedYear && courseDate.month() === selectedMonth;
    });
    
    const privateCount = monthCourses.filter(c => !c.isPublic).length;
    const publicCount = monthCourses.filter(c => c.isPublic).length;

    if (monthCourses.length === 0) {
      return (
        <div style={{ padding: '8px' }}>
          <Tag color="default" style={{ border: 'none', background: '#f5f5f5', color: '#bfbfbf' }}>无课</Tag>
        </div>
      );
    }

    return (
      <div style={{ padding: '8px' }}>
        <div style={{ fontSize: '12px', color: '#1890ff', marginBottom: '4px' }}>
          <Badge color="#1890ff" /> {privateCount}节私教
        </div>
        <div style={{ fontSize: '12px', color: '#722ed1' }}>
          <Badge color="#faad14" /> {publicCount}节公开
        </div>
      </div>
    );
  };

  const courseColumns: ProColumns<CourseData>[] = [
    {
      title: '学员名称',
      dataIndex: 'studentName',
      key: 'studentName',
      width: 120,
    },
    {
      title: '上课地点',
      dataIndex: 'location',
      key: 'location',
      width: 120,
    },
    {
      title: '上课时间',
      key: 'time',
      width: 200,
      render: (_, record) => (
        <span>
          {dayjs(record.startTime).format('HH:mm')} - {dayjs(record.endTime).format('HH:mm')}
        </span>
      ),
    },
    {
      title: '时长',
      dataIndex: 'duration',
      key: 'duration',
      width: 80,
      render: (val: React.ReactNode) => `${val}分钟`,
    },
    {
      title: '类型',
      key: 'type',
      width: 150,
      render: (_, record) => {
        const typeStr = record.isPublic ? '公共课' : `${record.courseType}(私教)`;
        return <Tag color={record.isPublic ? 'orange' : 'blue'}>{typeStr}</Tag>;
      },
    },
    {
      title: '付费类型',
      dataIndex: 'paymentType',
      key: 'paymentType',
      width: 100,
      render: (val: React.ReactNode) => val || '-',
    },
  ];

  const studentColumns: ProColumns<Student>[] = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '性别',
      dataIndex: 'gender',
      key: 'gender',
      valueEnum: {
        male: { text: '男' },
        female: { text: '女' },
      },
    },
    {
      title: '入营日期',
      dataIndex: 'checkinDate',
      key: 'checkinDate',
    },
    {
      title: '入营体重(kg)',
      dataIndex: 'initialWeight',
      key: 'initialWeight',
      render: (val: React.ReactNode) => val || '-',
    },
    {
      title: '当前体重(kg)',
      dataIndex: 'currentWeight',
      key: 'currentWeight',
      render: (val: React.ReactNode, record) => {
        if (!val) return '-';
        const current = Number(val);
        const initial = Number(record.initialWeight);
        if (isNaN(current) || isNaN(initial)) return val;
        
        const diff = current - initial;
        if (diff === 0) return val;
        
        return (
          <Space size={4}>
            {val}
            <Typography.Text type={diff < 0 ? 'success' : 'danger'}>
              {diff < 0 ? <ArrowDownOutlined /> : <ArrowUpOutlined />}
            </Typography.Text>
          </Space>
        );
      },
    },
    {
      title: '入营体脂(%)',
      dataIndex: 'initialFatRate',
      key: 'initialFatRate',
      render: (val: React.ReactNode) => val || '-',
    },
    {
      title: '当前体脂(%)',
      dataIndex: 'currentFatRate',
      key: 'currentFatRate',
      render: (val: React.ReactNode, record) => {
        if (!val) return '-';
        const current = Number(val);
        const initial = Number(record.initialFatRate);
        if (isNaN(current) || isNaN(initial)) return val;
        
        const diff = current - initial;
        if (diff === 0) return val;
        
        return (
          <Space size={4}>
            {val}
            <Typography.Text type={diff < 0 ? 'success' : 'danger'}>
              {diff < 0 ? <ArrowDownOutlined /> : <ArrowUpOutlined />}
            </Typography.Text>
          </Space>
        );
      },
    },
    {
      title: '操作',
      valueType: 'option',
      key: 'option',
      render: (_, record) => (
        <Space>
          <Button 
            type="link" 
            size="small"
            onClick={() => {
              setCurrentStudent(record);
              setBodyDataVisible(true);
            }}
          >
            身体数据
          </Button>
        </Space>
      ),
    },
  ];

  const renderContent = () => {
    if (loading) return <div style={{ textAlign: 'center', padding: 20 }}><Spin /></div>;

    if (type === 'students') {
      return (
        <>
          <ProTable<Student>
            columns={studentColumns}
            dataSource={data as Student[]}
            rowKey="stuId"
            search={false}
            options={false}
            headerTitle={
              <Space>
                <span>按入营月份筛选:</span>
                <DatePicker 
                  picker="month" 
                  value={selectedMonth} 
                  onChange={(date) => {
                    if (date) setSelectedMonth(date);
                  }} 
                  allowClear={false}
                />
              </Space>
            }
            pagination={{
              pageSize: 5,
            }}
            locale={{ emptyText: <Empty description="暂无符合条件的在营学员" /> }}
          />
          {currentStudent && (
            <BodyDataModal
              visible={bodyDataVisible}
              studentId={currentStudent.stuId}
              studentName={currentStudent.name}
              onCancel={() => {
                setBodyDataVisible(false);
                setCurrentStudent(null);
              }}
            />
          )}
        </>
      );
    }

    if (type === 'courses') {
      return (
        <div style={{ padding: '16px 0' }}>
          <Card 
            variant="borderless" 
            style={{ marginBottom: 16 }}
            styles={{ body: { padding: 0 } }}
          >
            <Calendar
            fullscreen
            value={selectedDate}
            mode={viewMode}
            onSelect={(date, info) => {
              setSelectedDate(date);
            }}
            onPanelChange={(date, mode) => {
              setViewMode(mode);
            }}
            headerRender={({ value, onChange, onTypeChange }) => {
              const year = value.year();
              const month = value.month();
              
              return (
                <div style={{ padding: '16px', borderBottom: '1px solid #f0f0f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <Typography.Title level={3} style={{ margin: 0 }}>
                      {viewMode === 'year' ? `${year}年` : `${year}年${month + 1}月`}
                    </Typography.Title>
                    
                    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                      <Radio.Group
                        size="middle"
                        onChange={(e) => {
                          const val = e.target.value;
                          setViewMode(val);
                        }}
                        value={viewMode}
                        buttonStyle="solid"
                      >
                        <Radio.Button value="month">月</Radio.Button>
                        <Radio.Button value="year">年</Radio.Button>
                      </Radio.Group>

                      <Space size={4}>
                        <Button
                          onClick={() => {
                            const now = dayjs();
                            setSelectedDate(now);
                            setViewMode('month');
                          }}
                        >
                          今天
                        </Button>
                        <Button 
                          icon={<LeftOutlined />} 
                          onClick={() => {
                            const newValue = value.subtract(1, viewMode === 'year' ? 'year' : 'month');
                            setSelectedDate(newValue);
                          }}
                        />
                        <Button 
                          icon={<RightOutlined />} 
                          onClick={() => {
                            const newValue = value.add(1, viewMode === 'year' ? 'year' : 'month');
                            setSelectedDate(newValue);
                          }}
                        />
                      </Space>
                    </div>
                  </div>
                </div>
              );
            }}
            cellRender={(date, info) => {
              if (info.type === 'month') {
                return monthCellRender(date);
              }
              return dateCellRender(date);
            }}
          />
          </Card>

          <ProTable<CourseData>
            columns={courseColumns}
            dataSource={tableData}
            rowKey="id"
            search={false}
            options={false}
            headerTitle={
              <Space>
                <CalendarOutlined />
                <Typography.Text strong>
                  {viewMode === 'year' 
                    ? `${selectedDate.format('YYYY-MM')} 月度课程详情` 
                    : `${selectedDate.format('YYYY-MM-DD')} 课程详情`}
                </Typography.Text>
              </Space>
            }
            pagination={{
              pageSize: 5,
            }}
            locale={{ emptyText: <Empty description={`${selectedDate.format(viewMode === 'year' ? 'YYYY-MM' : 'YYYY-MM-DD')} 暂无课程安排`} /> }}
          />
        </div>
      );
    }

    if (type === 'performance') {
      return (
        <Tabs
          items={[
            {
              key: 'private',
              label: '私教开单业绩',
              children: (
                <ProTable<PerformanceData>
                  columns={privatePerformanceColumns}
                  dataSource={coursePerformance}
                  rowKey="id"
                  search={false}
                  options={false}
                  headerTitle={
                    <Space>
                      <span>筛选月份:</span>
                      <DatePicker 
                        picker="month" 
                        value={selectedPerformanceMonth} 
                        onChange={(date) => {
                          if (date) setSelectedPerformanceMonth(date);
                        }} 
                        allowClear={false}
                      />
                    </Space>
                  }
                  pagination={{ pageSize: 5 }}
                  locale={{ emptyText: <Empty description="该月暂无私教开单业绩记录" /> }}
                />
              ),
            },
            {
              key: 'enrollment',
              label: '招生业绩',
              children: (
                <ProTable<PerformanceData>
                  columns={enrollmentPerformanceColumns}
                  dataSource={enrollmentPerformance}
                  rowKey="id"
                  search={false}
                  options={false}
                  headerTitle={
                    <Space>
                      <span>筛选月份:</span>
                      <DatePicker 
                        picker="month" 
                        value={selectedPerformanceMonth} 
                        onChange={(date) => {
                          if (date) setSelectedPerformanceMonth(date);
                        }} 
                        allowClear={false}
                      />
                    </Space>
                  }
                  pagination={{ pageSize: 5 }}
                  locale={{ emptyText: <Empty description="该月暂无招生业绩记录" /> }}
                />
              ),
            },
            {
              key: 'charts',
              label: '图表分析',
              children: performanceStats ? (
                <div style={{ padding: '16px 0' }}>
                  <Row gutter={16} style={{ marginBottom: 16 }}>
                    <Col span={6}>
                      <Card variant="borderless">
                        <Statistic
                          title="待完成课程"
                          value={performanceStats.coursesToComplete}
                          prefix={<ScheduleOutlined />}
                          valueStyle={{ color: '#1890ff' }}
                        />
                      </Card>
                    </Col>
                    <Col span={6}>
                      <Card variant="borderless">
                        <Statistic
                          title="已售出课程"
                          value={performanceStats.coursesSold}
                          prefix={<TrophyOutlined />}
                          valueStyle={{ color: '#52c41a' }}
                        />
                      </Card>
                    </Col>
                    <Col span={6}>
                      <Card variant="borderless">
                        <Statistic
                          title="课程口碑评分"
                          value={performanceStats.rating}
                          suffix="/ 5.0"
                          prefix={<StarOutlined />}
                          valueStyle={{ color: '#faad14' }}
                        />
                        <Rate disabled defaultValue={performanceStats.rating} allowHalf style={{ fontSize: 12 }} />
                      </Card>
                    </Col>
                    <Col span={6}>
                      <Card variant="borderless">
                        <Statistic
                          title="当前业绩排名"
                          value={performanceStats.rankings.find(r => r.name === coach?.name)?.rank || '-'}
                          prefix={<TrophyOutlined />}
                          valueStyle={{ color: '#f5222d' }}
                        />
                      </Card>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col span={16}>
                      <Card title="年度开课统计" variant="borderless">
                        <div style={{ height: 300 }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={performanceStats.monthlyData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="month" />
                              <YAxis />
                              <Tooltip />
                              <Legend />
                              <Bar dataKey="count" name="开课数量" fill="#1890ff" radius={[4, 4, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </Card>
                    </Col>
                    <Col span={8}>
                      <Card title="教练业绩排行榜 (Top 10)" variant="borderless">
                        <List
                          size="small"
                          dataSource={performanceStats.rankings}
                          renderItem={(item) => (
                            <List.Item>
                              <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                                <Space>
                                  <Tag color={item.rank <= 3 ? '#f50' : 'default'}>{item.rank}</Tag>
                                  <Typography.Text strong={item.name === coach?.name}>
                                    {item.name}
                                  </Typography.Text>
                                </Space>
                                <Typography.Text type="secondary">
                                  ¥{(item.amount / 10000).toFixed(1)}w
                                </Typography.Text>
                              </Space>
                            </List.Item>
                          )}
                        />
                      </Card>
                    </Col>
                  </Row>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: 40 }}><Spin tip="加载统计数据中..." /></div>
              ),
            },
          ]}
        />
      );
    }

    return null;
  };

  const getTitle = () => {
    if (!coach) return '';
    const name = coach.name;
    switch (type) {
      case 'students': return `${name} - 负责学员列表`;
      case 'courses': return `${name} - 课程安排`;
      case 'performance': return `${name} - 业绩统计`;
      default: return '';
    }
  };

  return (
    <Modal
      title={getTitle()}
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={1200}
      destroyOnClose
    >
      {renderContent()}
    </Modal>
  );
}

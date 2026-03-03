import { rest } from 'msw';
import { mockData, addItem, updateItem } from '../../mock/mockData';
import { CoachStudentRelation } from '../../mock/data/coachStudent';
import dayjs from 'dayjs';
import { type StuPrivateRecord, type StuClassRecord } from '@/service/student';
import { type PublicCourse } from '@/service/course';

// 这里的类型定义可以根据需要进行补充，或者直接使用从 service 中导出的类型
interface PrivateCourseSchedule {
  id: string | number;
  studentName: string;
  location: string;
  startTime: string;
  endTime: string;
  duration: number;
  courseType: string;
  paymentType: string;
  isPublic: boolean;
}

interface PerformanceRecord {
  id: string | number;
  studentName: string;
  courseType: string;
  paymentType: string;
  amount: number;
  originalPrice: number;
  discountPrice: number;
  duration: string;
  status: string;
  orderTime: string;
  closeTime?: string;
  date: string;
}

export const coachHandlers = [
  // 获取教练列表
  rest.get('/api/coaches', (req, res, ctx) => {
    const url = new URL(req.url);
    const page = Number(url.searchParams.get('page') || '1');
    const pageSize = Number(url.searchParams.get('pageSize') || '10');
    const name = url.searchParams.get('name');
    const campId = url.searchParams.get('campId');

    let coaches = mockData.employee.filter(e => e.role === '教练' || e.role === '教练管理员');

    if (name) {
      coaches = coaches.filter(c => c.name.includes(name));
    }
    if (campId) {
      coaches = coaches.filter(c => c.campId === Number(campId));
    }

    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const data = coaches.slice(start, end);

    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data,
        meta: {
          total: coaches.length,
          page,
          pageSize,
        },
      })
    );
  }),

  // 创建教练 (同步到 employee)
  rest.post('/api/coaches', async (req, res, ctx) => {
    const body = await req.json();
    const newCoach = addItem('employee', {
      ...body,
      empId: `emp${Date.now().toString().slice(-3)}`,
      status: 1,
    });
    return res(ctx.status(200), ctx.json({ success: true, data: newCoach }));
  }),

  // 更新教练
  rest.put('/api/coaches/:id', async (req, res, ctx) => {
    const id = req.params.id;
    const body = await req.json();
    const updated = updateItem('employee', 'empId', id, body);
    if (updated) {
      return res(ctx.status(200), ctx.json({ success: true, data: updated }));
    }
    return res(ctx.status(404), ctx.json({ success: false, message: '教练不存在' }));
  }),

  // 删除教练
  rest.delete('/api/coaches/:id', async (req, res, ctx) => {
    const id = req.params.id;
    const index = mockData.employee.findIndex(e => e.empId === id);
    if (index !== -1) {
      mockData.employee.splice(index, 1);
      return res(ctx.status(200), ctx.json({ success: true, message: '已删除' }));
    }
    return res(ctx.status(404), ctx.json({ success: false, message: '教练不存在' }));
  }),

  // 获取负责的学员列表
  rest.get('/api/coach/responsible-students/:coachId', (req, res, ctx) => {
    const coachId = req.params.coachId as string;
    const relations = mockData.coachStudentRelations.filter(r => r.coachId === coachId && r.status === 'active');
    const studentIds = relations.map(r => r.studentId);
    const responsibleStudents = mockData.student.filter(s => studentIds.includes(s.stuId));

    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: responsibleStudents,
      })
    );
  }),

  // 获取私教课安排
  rest.get('/api/coach/courses/private/:coachId', (req, res, ctx) => {
    const coachId = req.params.coachId as string;
    
    // 从平铺的 stuClassRecords 中提取所有该教练教授的课程记录
    const allPrivateCourses: PrivateCourseSchedule[] = mockData.stuClassRecords
      .filter(cls => cls.teachingCoachId === coachId)
      .map(cls => {
        const student = mockData.student.find(s => s.stuId === cls.stuId);
        const order = mockData.stuPrivateOrders.find(o => o.orderId === cls.orderId);
        return {
          id: cls.id,
          studentName: student?.name || '未知学员',
          location: cls.location,
          startTime: cls.startTime,
          endTime: cls.endTime,
          duration: dayjs(cls.endTime).diff(dayjs(cls.startTime), 'minute'),
          courseType: order?.courseType || '未知课程',
          paymentType: order?.paymentType || '未知方式',
          isPublic: false
        };
      });

    return res(ctx.status(200), ctx.json({ success: true, data: allPrivateCourses }));
  }),

  // 获取公共课安排
  rest.get('/api/coach/courses/public/:coachId', (req, res, ctx) => {
    const coachId = req.params.coachId as string;
    
    // 从全局 course 表中筛选该教练的公共课
    const publicCourses = (mockData.course as PublicCourse[])
      .filter(c => c.coachId === coachId || c.coaches?.some(coach => coach.id === coachId))
      .map(c => ({
        id: c.courseId,
        location: c.location || '大操场',
        startTime: c.createTime || '2026-01-14 08:00',
        duration: 60,
        courseType: c.title,
        isPublic: true
      }));

    return res(ctx.status(200), ctx.json({ success: true, data: publicCourses }));
  }),

  // 获取业绩统计
  rest.get('/api/coach/performance/:type/:coachId', (req, res, ctx) => {
    const { type, coachId } = req.params;
    
    if (type === 'course') {
      // 从平铺的 stuPrivateOrders 中提取该教练开单的记录
      const performanceData: PerformanceRecord[] = mockData.stuPrivateOrders
        .filter(order => order.bookingCoachId === coachId)
        .map(order => {
          const student = mockData.student.find(s => s.stuId === order.stuId);
          return {
            id: order.id,
            studentName: student?.name || '未知学员',
            courseType: order.courseType,
            paymentType: order.paymentType,
            amount: order.totalPrice,
            originalPrice: order.originalPrice,
            discountPrice: order.discountPrice,
            duration: `${order.usedSessions}/${order.totalSessions || (order.paymentType === '包月' ? 30 : order.totalSessions)} 节`,
            status: order.status,
            orderTime: order.orderTime,
            closeTime: order.closeTime,
            date: order.orderTime.split(' ')[0]
          };
        });

      return res(ctx.status(200), ctx.json({ success: true, data: performanceData }));
    }

    if (type === 'enrollment') {
      // 从全局 tuition 表中提取
      // 假设教练业绩也包含负责学员的入营费用，这里简单通过学生关联教练来模拟
      const relations = mockData.coachStudentRelations.filter(r => r.coachId === coachId);
      const studentNames = relations.map(r => r.studentName);
      
      const enrollmentData = mockData.tuition
        .filter(t => studentNames.includes(t.studentName))
        .map(t => ({
          id: t.id,
          studentName: t.studentName,
          tuitionType: t.type === '学费' ? '入营付费' : '到期续费',
          duration: '30天',
          amount: t.amount,
          status: t.status === 'paid' ? '已完成' : '上课中',
          orderTime: t.createTime,
          closeTime: t.updateTime,
          date: t.date
        }));

      return res(ctx.status(200), ctx.json({ success: true, data: enrollmentData }));
    }

    if (type === 'stats') {
      const stats = mockData.performanceStats.find(s => s.coachId === coachId);
      const monthlyData = mockData.coachMonthlyPerformance
        .filter(m => m.coachId === coachId)
        .map(m => ({ month: m.month, count: m.count }));

      const finalStats = stats ? { ...stats, monthlyData } : {
        coachId,
        coursesToComplete: 0,
        coursesSold: 0,
        monthlyData: Array.from({ length: 12 }, (_, i) => ({ month: `${i + 1}月`, count: 0 })),
        rating: 0,
      };

      return res(
        ctx.status(200),
        ctx.json({
          success: true,
          data: {
            ...finalStats,
            rankings: mockData.performanceRankings,
          }
        })
      );
    }

    return res(ctx.status(404), ctx.json({ success: false, message: '未知业绩类型' }));
  }),

  // 创建私教订单
  rest.post('/api/coach/private-orders', async (req, res, ctx) => {
    const { coachId, stuId, courseId, paymentType, originalPrice, discountPrice, totalSessions } = await req.json();
    
    // 1. 检查教练权限 (私教课类型中配置的有权限)
    const hasPermission = mockData.privateCourseCoachRelations.some(
      rel => rel.coachId === coachId && rel.courseId === courseId
    );
    
    if (!hasPermission) {
      return res(ctx.status(403), ctx.json({ success: false, message: '该教练无权开设此类型私教课' }));
    }
    
    const coach = mockData.employee.find(e => e.empId === coachId);
    const course = mockData.privateCourse.find(c => c.courseId === courseId);
    
    const newOrder = addItem('stuPrivateOrders', {
      id: Date.now(),
      stuId,
      orderId: `ORD${dayjs().format('YYYYMMDDHHmmss')}`,
      courseId,
      courseType: course?.type || '未知课程',
      paymentType,
      originalPrice,
      discountPrice,
      totalSessions,
      usedSessions: 0,
      status: '开单',
      orderTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      totalPrice: discountPrice,
      bookingCoach: coach?.name || '未知教练',
      bookingCoachId: coachId,
    });
    
    return res(ctx.status(200), ctx.json({ success: true, data: newOrder }));
  }),

  // 记录私教上课
  rest.post('/api/coach/class-records', async (req, res, ctx) => {
    const { orderId, teachingCoachId, location, startTime, endTime } = await req.json();
    
    // 1. 查找对应的私教订单
    const order = mockData.stuPrivateOrders.find(o => o.orderId === orderId);
    if (!order) {
      return res(ctx.status(404), ctx.json({ success: false, message: '未找到对应的私教订单' }));
    }
    
    if (order.status === '已完成' || order.usedSessions >= order.totalSessions) {
      return res(ctx.status(400), ctx.json({ success: false, message: '该订单课时已用完或已结束' }));
    }
    
    const coach = mockData.employee.find(e => e.empId === teachingCoachId);
    
    // 2. 创建上课记录
    const newRecord = addItem('stuClassRecords', {
      id: Date.now(),
      stuId: order.stuId,
      orderId: order.orderId,
      recordId: `REC${dayjs().format('YYYYMMDDHHmmss')}`,
      teachingCoach: coach?.name || '未知教练',
      teachingCoachId,
      location,
      startTime,
      endTime,
    });
    
    // 3. 更新订单状态
    order.usedSessions += 1;
    order.status = '上课中';
    
    // 4. 判断课程是否结束
    if (order.usedSessions >= order.totalSessions) {
      order.status = '已完成';
      order.closeTime = dayjs().format('YYYY-MM-DD HH:mm:ss');
    }
    
    order.updateTime = new Date().toISOString();
    
    return res(ctx.status(200), ctx.json({ success: true, data: newRecord, orderStatus: order.status }));
  }),

  // 获取教练个人业绩概览
  rest.get('/api/coach/performance/:coachId/overview', (req, res, ctx) => {
    const coachId = req.params.coachId as string;
    const stats = mockData.performanceStats.find(s => s.coachId === coachId);
    
    if (!stats) {
      return res(ctx.status(404), ctx.json({ success: false, message: 'Coach performance not found' }));
    }

    const monthlyData = mockData.coachMonthlyPerformance
      .filter(m => m.coachId === coachId)
      .map(m => ({ month: m.month, count: m.count }));

    const data = {
      ...stats,
      monthlyData
    };

    return res(ctx.status(200), ctx.json({ success: true, data }));
  }),

  // 安排查房 (保存到 duty 表中，类型标记为查房)
  rest.post('/api/coach/room-inspection', async (req, res, ctx) => {
    const body = await req.json();
    const newInspection = addItem('duty', {
      ...body,
      id: Date.now(),
      type: '查房',
      status: '待执行',
    });
    return res(ctx.status(200), ctx.json({ success: true, data: newInspection }));
  }),

  // 原有的接口保留...
  rest.get('/api/coach/student-list', (req, res, ctx) => {
    const url = new URL(req.url);
    const page = Number(url.searchParams.get('page') || '1');
    const pageSize = Number(url.searchParams.get('pageSize') || '10');
    const campId = url.searchParams.get('campId');
    const coachName = url.searchParams.get('coachName');
    const studentName = url.searchParams.get('studentName');
    const status = url.searchParams.get('status');

    let filtered = [...mockData.coachStudentRelations];

    if (campId) {
      filtered = filtered.filter(item => item.campId === Number(campId));
    }
    if (coachName) {
      filtered = filtered.filter(item => item.coachName.includes(coachName));
    }
    if (studentName) {
      filtered = filtered.filter(item => item.studentName.includes(studentName));
    }
    if (status) {
      filtered = filtered.filter(item => item.status === status);
    }

    // 排序：最新的在前面
    filtered.sort((a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime());

    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const data = filtered.slice(start, end);

    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data,
        meta: {
          total: filtered.length,
          page,
          pageSize,
        },
      })
    );
  }),

  // 获取教练列表 (用于下拉选择)
  rest.get('/api/coach/list', (req, res, ctx) => {
    const url = new URL(req.url);
    const campId = url.searchParams.get('campId');
    
    let coaches = mockData.employee.filter(e => e.role === '教练' || e.role === '教练管理员');
    
    if (campId) {
      coaches = coaches.filter(c => c.campId === Number(campId));
    }

    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: coaches.map(c => ({
          label: c.name,
          value: c.empId,
          campId: c.campId
        })),
      })
    );
  }),

  // 分配/更换教练
  rest.post('/api/coach/assign', async (req, res, ctx) => {
    const body = await req.json() as {
      studentId: number;
      coachId: string;
      startDate: string;
    };
    const { studentId, coachId, startDate } = body;

    // 查找学生和教练信息
    const targetStudent = mockData.student.find(s => s.stuId === studentId);
    const targetCoach = mockData.employee.find(e => e.empId === coachId);

    if (!targetStudent || !targetCoach) {
      return res(
        ctx.status(200),
        ctx.json({
          success: false,
          message: '学生或教练不存在',
        })
      );
    }

    // 检查该学生是否已有正在进行的分配
    const activeRelationIndex = mockData.coachStudentRelations.findIndex(
      r => r.studentId === studentId && r.status === 'active'
    );

    const now = new Date().toISOString();

    // 如果有，先结束旧的
    if (activeRelationIndex !== -1) {
      mockData.coachStudentRelations[activeRelationIndex] = {
        ...mockData.coachStudentRelations[activeRelationIndex],
        status: 'transferred',
        endDate: startDate, // 结束日期为新分配的开始日期
        updateTime: now,
      };
    }

    // 创建新分配
    const newRelation = addItem('coachStudentRelations', {
      id: Math.max(...mockData.coachStudentRelations.map(r => r.id), 0) + 1,
      campId: targetStudent.campId,
      coachId,
      coachName: targetCoach.name,
      studentId,
      studentName: targetStudent.name,
      startDate,
      status: 'active' as const,
    });

    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: newRelation,
      })
    );
  }),
];

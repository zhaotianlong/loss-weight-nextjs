import { rest } from 'msw';
import dayjs from 'dayjs';
import { getCollection, getById, addItem, updateItem, deleteItem, mockData } from '@/mock/mockData';
import { getCurrentUserFromRequest } from '@/utils/getCurrentUserFromRequest';
import { isSuperAdmin } from '@/constants/permissions';
import { getStuPrivateRecordsByStuId } from '@/mock/data/stuPrivateOrders';
import { Student } from '@/service/student';

export const studentHandlers = [
  // 获取学员私教记录
  rest.get('/api/students/:id/private-records', async (req, res, ctx) => {
    const id = Number(req.params.id);
    const data = getStuPrivateRecordsByStuId(id);
    return res(ctx.status(200), ctx.json({ code: 200, success: true, data }));
  }),

  // 学员列表（可按 campId 过滤，返回 { data, meta }）
  rest.get('/api/students', async (req, res, ctx) => {
    // 获取当前用户信息
    const currentUser = await getCurrentUserFromRequest(req);
    
    // 从请求参数获取campId
    const requestCampId = req.url.searchParams.get('campId')
      ? Number(req.url.searchParams.get('campId'))
      : undefined;

    // 如果不是超级管理员，强制使用当前用户的campId
    let finalCampId = requestCampId;
    if (currentUser && !isSuperAdmin(currentUser.role)) {
      finalCampId = currentUser.campId;
      // 如果请求的campId与当前用户的campId不匹配，返回403
      if (requestCampId && requestCampId !== currentUser.campId) {
        return res(
          ctx.status(403),
          ctx.json({ success: false, message: '无权访问其他营地的数据' })
        );
      }
    }

    const name = req.url.searchParams.get('name');
    const phone = req.url.searchParams.get('phone');
    const status = req.url.searchParams.get('status');
    
    const full = (await getCollection('student', {
      filter: (item: Record<string, unknown>) => {
        if (finalCampId && item.campId !== finalCampId) return false;
        if (name && !String(item.name)?.toLowerCase().includes(name.toLowerCase())) return false;
        if (phone && !String(item.phone)?.includes(phone)) return false;
        if (status !== null && status !== undefined && item.status !== Number(status)) return false;
        return true;
      },
    })) as Student[];
    
    // 补充教练信息
    const fullWithCoach = full.map(student => {
      const relation = mockData.coachStudentRelations.find(r => r.studentId === student.stuId && r.status === 'active');
      return {
        ...student,
        coachId: relation?.coachId,
        coachName: relation?.coachName,
      };
    });

    const page = Number(req.url.searchParams.get('page')) || 1;
    const pageSize = Number(req.url.searchParams.get('pageSize')) || 20;
    const total = fullWithCoach.length;
    const start = (page - 1) * pageSize;
    const data = fullWithCoach.slice(start, start + pageSize);
    const meta = { page, pageSize, total, pageCount: Math.ceil(total / pageSize) };
    return res(ctx.status(200), ctx.json({ code: 200, success: true, data, meta }));
  }),

  // 单个学员
  rest.get('/api/students/:id', async (req, res, ctx) => {
    const id = Number(req.params.id);
    const item = (await getById('student', 'stuId', id)) as Student;
    if (!item) return res(ctx.status(404), ctx.json({ success: false, message: 'Not found' }));
    return res(ctx.status(200), ctx.json({ code: 200, success: true, data: item }));
  }),

  // 创建学员
  rest.post('/api/students', async (req, res, ctx) => {
    const body = await req.json();
    const newId = Date.now();
    const newStudent = { ...body, stuId: newId };
    addItem('student', newStudent);
    return res(ctx.status(200), ctx.json({ code: 200, success: true, data: newStudent }));
  }),

  // 更新学员
  rest.put('/api/students/:id', async (req, res, ctx) => {
    const id = Number(req.params.id);
    const body = await req.json();
    const updated = updateItem('student', 'stuId', id, body);
    if (!updated) return res(ctx.status(404), ctx.json({ success: false, message: 'Not found' }));
    return res(ctx.status(200), ctx.json({ code: 200, success: true, data: updated }));
  }),

  // 删除学员
  rest.delete('/api/students/:id', async (req, res, ctx) => {
    const id = Number(req.params.id);
    const deleted = deleteItem('student', 'stuId', id);
    if (!deleted) return res(ctx.status(404), ctx.json({ success: false, message: 'Not found' }));
    return res(ctx.status(200), ctx.json({ code: 200, success: true, msg: 'Deleted', data: null }));
  }),

  // 申请学员续租
  rest.post('/api/students/apply-renew', async (req, res, ctx) => {
    const body = await req.json();
    const { stuId, days, originalAmount, actualAmount, salespersonId } = body;

    // 验证参数
    if (!stuId || !days || days <= 0) {
      return res(ctx.status(200), ctx.json({ code: 4004, msg: '参数错误', success: false }));
    }

    // 获取学员信息
    const student = (await getById('student', 'stuId', stuId)) as Student;
    if (!student) {
      return res(ctx.status(200), ctx.json({ code: 4005, msg: '学员不存在', success: false }));
    }

    // 创建待审核的财务记录
    const newTuitionId = Date.now();
    const newTuition = {
      id: newTuitionId,
      stuId,
      studentName: student.name,
      campId: student.campId,
      type: 'income',
      source: '学费(续住)',
      amount: actualAmount,
      originalAmount,
      actualAmount,
      date: dayjs().format('YYYY-MM-DD'),
      dueDate: student.checkoutDate || dayjs(student.checkinDate).add(30, 'day').format('YYYY-MM-DD'),
      status: 3, // 待审核
      description: `申请续租: ${days}天`,
      salespersonId,
      createTime: new Date().toISOString(),
      updateTime: new Date().toISOString(),
      applyInfo: {
        type: 'renewal',
        stuId,
        days,
        salespersonId,
      }
    };
    addItem('tuition', newTuition);

    // 更新床位状态为预留审核中 (status: 2)
    if (student.bedId) {
      updateItem('bed', 'bedId', student.bedId, { status: 2 });
    }

    return res(ctx.status(200), ctx.json({ 
      code: 200, 
      success: true, 
      msg: '申请续租成功，请等待财务审核',
      data: null 
    }));
  }),
];

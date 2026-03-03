import { rest } from 'msw';
import { getCollection, addItem, updateItem, deleteItem, CollectionItem } from '@/mock/mockData';
import { getCurrentUserFromRequest } from '@/utils/getCurrentUserFromRequest';
import { isSuperAdmin } from '@/constants/permissions';
import { Tuition } from '@/mock/data/tuition';
import { StuPrivateOrder } from '@/mock/data/stuPrivateOrders';
import { Student } from '@/service/student';

type PerformanceGoal = CollectionItem<'performanceGoals'>;

export const performanceHandlers = [
  // 获取业绩目标列表
  rest.get('/api/performance/goals', async (req, res, ctx) => {
    const currentUser = await getCurrentUserFromRequest(req);
    const campId = req.url.searchParams.get('campId') ? Number(req.url.searchParams.get('campId')) : undefined;
    const coachId = req.url.searchParams.get('coachId');
    const month = req.url.searchParams.get('month');

    let finalCampId = campId;
    if (currentUser && !isSuperAdmin(currentUser.role)) {
      finalCampId = currentUser.campId;
    }

    const goals = await getCollection('performanceGoals', {
      filter: (item: PerformanceGoal) => {
        if (finalCampId && item.campId !== finalCampId) return false;
        if (coachId && item.coachId !== coachId) return false;
        if (month && item.month !== month) return false;
        return true;
      }
    });

    const tuitions = await getCollection('tuition');
    const privateOrders = await getCollection('stuPrivateOrders');
    const students = await getCollection('student') as Student[];
    const studentMap = new Map(students.map(s => [s.stuId, s]));

    const goalsWithActual = goals.map(goal => {
      // 招生实际 (学费-入住)
      const recruitmentActual = tuitions
        .filter((t: Tuition) => 
          t.salespersonId === goal.coachId && 
          t.date.startsWith(goal.month) && 
          t.source.includes('入住') &&
          (t.status === 'paid' || t.status === 3) &&
          t.campId === goal.campId
        )
        .reduce((sum: number, t: Tuition) => sum + t.amount, 0);

      // 私教实际 (通过学员营地过滤)
      const privateCoachingActual = privateOrders
        .filter((o: StuPrivateOrder) => {
          const student = studentMap.get(o.stuId);
          return o.bookingCoachId === goal.coachId && 
            o.orderTime.startsWith(goal.month) &&
            (o.status === '已完成' || o.status === '上课中') &&
            student?.campId === goal.campId;
        })
        .reduce((sum: number, o: StuPrivateOrder) => sum + o.totalPrice, 0);

      // 续住实际 (学费-续住)
      const renewalActual = tuitions
        .filter((t: Tuition) => 
          t.salespersonId === goal.coachId && 
          t.date.startsWith(goal.month) && 
          t.source.includes('续住') &&
          (t.status === 'paid' || t.status === 3) &&
          t.campId === goal.campId
        )
        .reduce((sum: number, t: Tuition) => sum + t.amount, 0);

      return {
        ...goal,
        actual: {
          recruitment: recruitmentActual,
          privateCoaching: privateCoachingActual,
          renewal: renewalActual
        }
      };
    });

    return res(ctx.status(200), ctx.json({ 
      success: true, 
      data: goalsWithActual,
      meta: {
        total: goalsWithActual.length,
        page: 1,
        pageSize: 1000
      }
    }));
  }),

  // 创建业绩目标
  rest.post('/api/performance/goals', async (req, res, ctx) => {
    const body = await req.json();
    const newId = Date.now();
    const newGoal = { ...body, id: newId } as PerformanceGoal;
    addItem('performanceGoals', newGoal);
    return res(ctx.status(200), ctx.json({ success: true, data: newGoal }));
  }),

  // 更新业绩目标
  rest.put('/api/performance/goals/:id', async (req, res, ctx) => {
    const id = Number(req.params.id);
    const body = await req.json();
    const updated = updateItem('performanceGoals', 'id', id, body);
    if (!updated) return res(ctx.status(404), ctx.json({ success: false, message: '未找到业绩目标' }));
    return res(ctx.status(200), ctx.json({ success: true, data: updated }));
  }),

  // 删除业绩目标
  rest.delete('/api/performance/goals/:id', async (req, res, ctx) => {
    const id = Number(req.params.id);
    const deleted = deleteItem('performanceGoals', 'id', id);
    if (!deleted) return res(ctx.status(404), ctx.json({ success: false, message: '未找到业绩目标' }));
    return res(ctx.status(200), ctx.json({ success: true, message: '删除成功' }));
  }),

  // 获取业绩统计
  rest.get('/api/performance/stats', async (req, res, ctx) => {
    const currentUser = await getCurrentUserFromRequest(req);
    const campId = req.url.searchParams.get('campId') ? Number(req.url.searchParams.get('campId')) : undefined;
    const month = req.url.searchParams.get('month') || new Date().toISOString().slice(0, 7);

    let finalCampId = campId;
    if (currentUser && !isSuperAdmin(currentUser.role)) {
      finalCampId = currentUser.campId;
    }

    // 这里模拟从学费记录和私教订单中计算实际业绩
    const goals = await getCollection('performanceGoals', {
      filter: (item: PerformanceGoal) => {
        if (finalCampId && item.campId !== finalCampId) return false;
        if (month && item.month !== month) return false;
        return true;
      }
    });

    const tuitions = await getCollection('tuition');
    const privateOrders = await getCollection('stuPrivateOrders');
    const students = await getCollection('student') as Student[];
    const studentMap = new Map(students.map(s => [s.stuId, s]));

    const coachStats = goals.map(goal => {
      // 过滤当月该教练的招生业绩 (学费-入住)
      const recruitmentActual = tuitions
        .filter((t: Tuition) => 
          t.salespersonId === goal.coachId && 
          t.date.startsWith(goal.month) && 
          t.source.includes('入住') &&
          (t.status === 'paid' || t.status === 3) &&
          t.campId === goal.campId
        )
        .reduce((sum: number, t: Tuition) => sum + t.amount, 0);

      // 过滤当月该教练的私教业绩 (通过学员营地过滤)
      const privateCoachingActual = privateOrders
        .filter((o: StuPrivateOrder) => {
          const student = studentMap.get(o.stuId);
          return o.bookingCoachId === goal.coachId && 
            o.orderTime.startsWith(goal.month) &&
            (o.status === '已完成' || o.status === '上课中') &&
            student?.campId === goal.campId;
        })
        .reduce((sum: number, o: StuPrivateOrder) => sum + o.totalPrice, 0);

      // 过滤当月该教练的续住业绩 (学费-续住)
      const renewalActual = tuitions
        .filter((t: Tuition) => 
          t.salespersonId === goal.coachId && 
          t.date.startsWith(goal.month) && 
          t.source.includes('续住') &&
          (t.status === 'paid' || t.status === 3) &&
          t.campId === goal.campId
        )
        .reduce((sum: number, t: Tuition) => sum + t.amount, 0);

      return {
        coachId: goal.coachId,
        coachName: goal.coachName,
        month: goal.month,
        goals: {
          recruitment: goal.recruitmentGoal,
          privateCoaching: goal.privateCoachingGoal,
          renewal: goal.renewalGoal,
          renewalType: goal.renewalType
        },
        actual: {
          recruitment: recruitmentActual,
          privateCoaching: privateCoachingActual,
          renewal: renewalActual
        }
      };
    });

    return res(ctx.status(200), ctx.json({
      success: true,
      data: {
        month,
        campId: finalCampId,
        summary: {
          totalRecruitmentGoal: goals.reduce((sum, g) => sum + g.recruitmentGoal, 0),
          totalRecruitmentActual: coachStats.reduce((sum, s) => sum + s.actual.recruitment, 0),
          totalPrivateCoachingGoal: goals.reduce((sum, g) => sum + g.privateCoachingGoal, 0),
          totalPrivateCoachingActual: coachStats.reduce((sum, s) => sum + s.actual.privateCoaching, 0),
          totalRenewalGoal: goals.reduce((sum, g) => sum + (g.renewalType === 'amount' ? g.renewalGoal : 0), 0),
          totalRenewalActual: coachStats.reduce((sum, s) => sum + (s.goals.renewalType === 'amount' ? s.actual.renewal : 0), 0),
        },
        coachStats
      }
    }));
  }),
];

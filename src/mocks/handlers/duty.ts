/**
 * 值班管理相关 MSW handlers
 */
import { rest } from 'msw';
import { getCollection, addItem, updateItem, deleteItem, CollectionItem, getById, mockData } from '@/mock/mockData';
import dayjs from 'dayjs';

type Duty = CollectionItem<'duty'>;
type Employee = CollectionItem<'employee'>;

// 获取当前用户的辅助函数
async function getCurrentUser(req: { headers: { get: (name: string) => string | null } }): Promise<Employee | null> {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.replace('Bearer ', '');
  const match = token.match(/mock_token_(\w+)_/);
  if (!match) return null;
  const empId = match[1];
  return await getById('employee', 'empId', empId) as Employee | undefined || null;
}

export const dutyHandlers = [
  // 值班列表
  rest.get('/api/duties', async (req, res, ctx) => {
    const user = await getCurrentUser(req);
    if (!user) return res(ctx.status(401), ctx.json({ success: false, message: '未授权' }));

    const coach = req.url.searchParams.get('coach');
    const coachId = req.url.searchParams.get('coachId');
    const coachIdsParam = req.url.searchParams.getAll('coachIds');
    const date = req.url.searchParams.get('date');
    const location = req.url.searchParams.get('location');
    const status = req.url.searchParams.get('status');
    const campId = req.url.searchParams.get('campId');
    const type = req.url.searchParams.get('type');
    const mealType = req.url.searchParams.get('mealType');

    const page = Number(req.url.searchParams.get('page')) || 1;
    const pageSize = Number(req.url.searchParams.get('pageSize')) || 20;

    const filtered = await getCollection('duty', {
      filter: (item: Duty) => {
        const dutyItem = item as Duty & { 
          campId: number; 
          coach: string; 
          coachIds?: string[];
          coachId?: string;
          date: string; 
          location: string; 
          status: string; 
          type: string;
          mealType?: string;
        };
        
        // 1. 强制营地隔离：非超级管理员只能看到自己所属营地的数据
        const currentUser = user as Employee & { campId: number };
        if (currentUser.role !== '超级管理员') {
          if (dutyItem.campId !== currentUser.campId) return false;
        } else if (campId) {
          // 超级管理员如果传了 campId，则按传参过滤
          if (dutyItem.campId !== Number(campId)) return false;
        }

        // 2. 基础属性过滤
        if (coach && !dutyItem.coach?.toLowerCase().includes(coach.toLowerCase())) return false;
        if (coachId && dutyItem.coachId !== coachId && !dutyItem.coachIds?.includes(coachId)) return false;
        if (coachIdsParam && coachIdsParam.length > 0) {
          if (!dutyItem.coachIds?.some((id: string) => coachIdsParam.includes(id))) return false;
        }
        if (date && dutyItem.date !== date) return false;
        if (location && !dutyItem.location?.toLowerCase().includes(location.toLowerCase())) return false;
        if (status && dutyItem.status !== status) return false;
        if (type && dutyItem.type !== type) return false;
        if (mealType && dutyItem.mealType !== mealType) return false;

        // 3. 角色职能过滤
        if (user.role === '教练管理' && dutyItem.type !== 'training') return false;
        if (user.role === '后勤管理' && dutyItem.type !== 'meal') return false;

        return true;
      },
    });

    const total = filtered.length;
    const start = (page - 1) * pageSize;
    const data = filtered.slice(start, start + pageSize);
    const meta = { page, pageSize, total, pageCount: Math.ceil(total / pageSize) };
    return res(ctx.status(200), ctx.json({ success: true, data, meta }));
  }),

  // 创建值班记录
  rest.post('/api/duties', async (req, res, ctx) => {
    const user = await getCurrentUser(req);
    if (!user) return res(ctx.status(401), ctx.json({ success: false, message: '未授权' }));

    const body = await req.json() as Partial<Duty>;
    
    // 权限校验
    if (user.role !== '超级管理员') {
      // 检查日期是否过期
      if (dayjs(body.date).isBefore(dayjs(), 'day')) {
        return res(ctx.status(403), ctx.json({ success: false, message: '不能创建过时排班' }));
      }
      // 检查职能
      if (user.role === '教练管理' && body.type !== 'training') {
        return res(ctx.status(403), ctx.json({ success: false, message: '只能创建教练排班' }));
      }
      if (user.role === '后勤管理' && body.type !== 'meal') {
        return res(ctx.status(403), ctx.json({ success: false, message: '只能创建后勤排班' }));
      }
    }

    const newId = Date.now();
    const newDuty = { ...body, id: newId, campId: body.campId || (user as Employee & { campId: number }).campId || 101 } as Duty;
    addItem('duty', newDuty);
    return res(ctx.status(200), ctx.json({ success: true, data: newDuty }));
  }),

  // 更新值班记录
  rest.put('/api/duties/:id', async (req, res, ctx) => {
    const user = await getCurrentUser(req);
    if (!user) return res(ctx.status(401), ctx.json({ success: false, message: '未授权' }));

    const id = Number(req.params.id);
    const body = await req.json() as Partial<Duty>;
    
    const existing = await getById('duty', 'id', id) as (Duty & { date: string; type: string }) | undefined;
    if (!existing) return res(ctx.status(404), ctx.json({ success: false, message: '未找到记录' }));

    // 权限校验
    if (user.role !== '超级管理员') {
      // 检查日期是否过期
      if (dayjs(existing.date).isBefore(dayjs(), 'day')) {
        return res(ctx.status(403), ctx.json({ success: false, message: '不能修改过时排班' }));
      }
      // 检查职能
      if (user.role === '教练管理' && existing.type !== 'training') {
        return res(ctx.status(403), ctx.json({ success: false, message: '无权操作此类型排班' }));
      }
      if (user.role === '后勤管理' && existing.type !== 'meal') {
        return res(ctx.status(403), ctx.json({ success: false, message: '无权操作此类型排班' }));
      }
    }

    const updated = updateItem('duty', 'id', id, body);
    return res(ctx.status(200), ctx.json({ success: true, data: updated }));
  }),

  // 删除值班记录
  rest.delete('/api/duties/:id', async (req, res, ctx) => {
    const user = await getCurrentUser(req);
    if (!user) return res(ctx.status(401), ctx.json({ success: false, message: '未授权' }));

    const id = Number(req.params.id);
    const existing = await getById('duty', 'id', id) as (Duty & { date: string; type: string }) | undefined;
    if (!existing) return res(ctx.status(404), ctx.json({ success: false, message: '未找到记录' }));

    // 权限校验
    if (user.role !== '超级管理员') {
      // 检查日期是否过期
      if (dayjs(existing.date).isBefore(dayjs(), 'day')) {
        return res(ctx.status(403), ctx.json({ success: false, message: '不能删除过时排班' }));
      }
      // 检查职能
      if (user.role === '教练管理' && existing.type !== 'training') {
        return res(ctx.status(403), ctx.json({ success: false, message: '无权操作此类型排班' }));
      }
      if (user.role === '后勤管理' && existing.type !== 'meal') {
        return res(ctx.status(403), ctx.json({ success: false, message: '无权操作此类型排班' }));
      }
    }

    const deleted = deleteItem('duty', 'id', id);
    return res(ctx.status(200), ctx.json({ success: true, message: 'Deleted' }));
  }),

  // 批量创建菜谱 (支持周循环)
  rest.post('/api/duties/batch-recipes', async (req, res, ctx) => {
    const user = await getCurrentUser(req);
    if (!user) return res(ctx.status(401), ctx.json({ success: false, message: '未授权' }));

    interface WeeklyMealPattern {
      dayOfWeek: number; // 1-7 代表周一到周日
      meals: Array<{
        mealType: string;
        timeSlot: string;
        location: string;
        calories?: number;
        protein?: number;
        carbs?: number;
        fat?: number;
        remark?: string;
      }>;
    }

    interface BatchRecipeBody {
      campId: number;
      startDate: string; // 循环开始日期
      endDate: string;   // 循环截止日期
      patterns: WeeklyMealPattern[];
    }

    const { campId, startDate, endDate, patterns } = await req.json() as BatchRecipeBody;
    
    if (!campId || !startDate || !endDate || !patterns) {
      return res(ctx.status(400), ctx.json({ success: false, message: '参数不完整' }));
    }

    const start = dayjs(startDate);
    const end = dayjs(endDate);
    const diffDays = end.diff(start, 'day');

    // 1. 覆盖逻辑：删除该营地在时间范围内的所有现有菜谱
    mockData.duty = mockData.duty.filter(d => 
      !(d.campId === campId && d.type === 'meal' && dayjs(d.date).isAfter(start.subtract(1, 'day')) && dayjs(d.date).isBefore(end.add(1, 'day')))
    );

    // 2. 插入逻辑：按周循环插入
    for (let i = 0; i <= diffDays; i++) {
      const current = start.add(i, 'day');
      const currentDateStr = current.format('YYYY-MM-DD');
      let dayOfWeek: number = current.day(); // 0-6 (Sun-Sat)
      if (dayOfWeek === 0) dayOfWeek = 7; // Convert 0 (Sun) to 7

      const pattern = patterns.find(p => p.dayOfWeek === dayOfWeek);
      if (pattern && pattern.meals) {
        for (const meal of pattern.meals) {
          const newId = Date.now() + Math.random();
          const newDuty = {
            id: newId,
            campId,
            date: currentDateStr,
            timeSlot: meal.timeSlot,
            location: meal.location,
            calories: meal.calories,
            protein: meal.protein,
            carbs: meal.carbs,
            fat: meal.fat,
            remark: meal.remark,
            type: 'meal',
            mealType: meal.mealType,
            status: 'scheduled',
            coach: '',
            coachIds: [],
            createTime: new Date().toISOString(),
            updateTime: new Date().toISOString(),
          };
          addItem('duty', newDuty);
        }
      }
    }

    return res(ctx.status(200), ctx.json({ success: true, message: 'Batch recipes created with weekly pattern' }));
  }),

  // 批量创建排班 (支持周循环)
  rest.post('/api/duties/batch-schedules', async (req, res, ctx) => {
    const user = await getCurrentUser(req);
    if (!user) return res(ctx.status(401), ctx.json({ success: false, message: '未授权' }));

    interface WeeklySchedulePattern {
      dayOfWeek: number;
      items: Array<{
        type: string;
        mealType?: string;
        timeSlot: string;
        location?: string;
        courseId?: number;
        coachIds?: string[];
        coach?: string;
        remark?: string;
      }>;
    }

    interface BatchScheduleBody {
      campId: number;
      startDate: string;
      endDate: string;
      patterns: WeeklySchedulePattern[];
    }

    const { campId, startDate, endDate, patterns } = await req.json() as BatchScheduleBody;
    
    if (!campId || !startDate || !endDate || !patterns) {
      return res(ctx.status(400), ctx.json({ success: false, message: '参数不完整' }));
    }

    const start = dayjs(startDate);
    const end = dayjs(endDate);
    const diffDays = end.diff(start, 'day');

    // 1. 覆盖逻辑：只删除该营地在时间范围内的 'training' 和 'duty' 类型，保留 'meal'
    mockData.duty = mockData.duty.filter(d => 
      !(d.campId === campId && (d.type === 'training' || d.type === 'duty') && dayjs(d.date).isAfter(start.subtract(1, 'day')) && dayjs(d.date).isBefore(end.add(1, 'day')))
    );

    // 2. 插入逻辑
    for (let i = 0; i <= diffDays; i++) {
      const current = start.add(i, 'day');
      const currentDateStr = current.format('YYYY-MM-DD');
      let dayOfWeek: number = current.day();
      if (dayOfWeek === 0) dayOfWeek = 7;

      const pattern = patterns.find(p => p.dayOfWeek === dayOfWeek);
      if (pattern && pattern.items) {
        for (const item of pattern.items) {
          const newId = Date.now() + Math.random();
          const newDuty = {
            id: newId,
            campId,
            date: currentDateStr,
            timeSlot: item.timeSlot,
            location: item.location || '',
            courseId: item.courseId,
            type: item.type,
            mealType: item.mealType,
            coachIds: item.coachIds || [],
            coach: item.coach || '',
            remark: item.remark || '',
            status: 'scheduled',
            createTime: new Date().toISOString(),
            updateTime: new Date().toISOString(),
          };
          addItem('duty', newDuty);
        }
      }
    }

    return res(ctx.status(200), ctx.json({ success: true, message: 'Batch schedules created' }));
  }),
];

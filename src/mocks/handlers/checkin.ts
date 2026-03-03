/**
 * 入住记录相关 MSW handlers
 */
import { rest } from 'msw';
import { getCollection, getById, addItem, updateItem, deleteItem, CollectionItem } from '@/mock/mockData';

type Checkin = CollectionItem<'studentCheckin'>;

export const checkinHandlers = [
  // 入住记录列表
  rest.get('/api/checkins', async (req, res, ctx) => {
    const stuId = req.url.searchParams.get('stuId')
      ? Number(req.url.searchParams.get('stuId'))
      : undefined;
    const campId = req.url.searchParams.get('campId')
      ? Number(req.url.searchParams.get('campId'))
      : undefined;
    const checkinDate = req.url.searchParams.get('checkinDate');
    const status = req.url.searchParams.get('status');

    let full = await getCollection('studentCheckin', {
      filter: (item: Checkin) => {
        if (stuId && (item as any).stuId !== stuId) return false;
        if (campId && (item as any).campId !== campId) return false;
        if (checkinDate && (item as any).checkinDate !== checkinDate) return false;
        if (status !== null && status !== undefined && (item as any).status !== Number(status)) return false;
        return true;
      },
    });

    const page = Number(req.url.searchParams.get('page')) || 1;
    const pageSize = Number(req.url.searchParams.get('pageSize')) || 20;
    const total = full.length;
    const start = (page - 1) * pageSize;
    const data = full.slice(start, start + pageSize);
    const meta = { page, pageSize, total, pageCount: Math.ceil(total / pageSize) };
    return res(ctx.status(200), ctx.json({ success: true, data, meta }));
  }),

  // 创建入住记录
  rest.post('/api/checkins', async (req, res, ctx) => {
    const body = await req.json();
    const { stuId, campId, checkinDate, bedId } = body;
    
    // 1. 检查床位是否可用
    if (bedId) {
      const bed = await getById('bed', 'bedId', bedId);
      if (bed && (bed as any).stuId && (bed as any).stuId !== stuId) {
        return res(ctx.status(400), ctx.json({ success: false, message: '该床位已被占用' }));
      }
    }

    // 2. 创建入住记录
    const newId = Date.now();
    const newCheckin = { ...body, checkinId: newId, status: body.status ?? 1 };
    addItem('studentCheckin', newCheckin);

    // 3. 更新学员状态
    updateItem('student', 'stuId', stuId, {
      status: 1, // 在营
      checkinDate: checkinDate || new Date().toISOString().split('T')[0],
      bedId: bedId || (body as any).bedId,
      campId: campId
    });

    // 4. 更新床位状态
    if (bedId) {
      updateItem('bed', 'bedId', bedId, {
        stuId: stuId,
        status: 1 // 正常占用
      });
    }

    return res(ctx.status(200), ctx.json({ success: true, data: newCheckin }));
  }),

  // 更新入住记录
  rest.put('/api/checkins/:id', async (req, res, ctx) => {
    const id = Number(req.params.id);
    const body = await req.json();
    const updated = updateItem('studentCheckin', 'checkinId', id, body);
    if (!updated) return res(ctx.status(404), ctx.json({ success: false, message: 'Not found' }));
    return res(ctx.status(200), ctx.json({ success: true, data: updated }));
  }),

  // 删除入住记录
  rest.delete('/api/checkins/:id', async (req, res, ctx) => {
    const id = Number(req.params.id);
    const deleted = deleteItem('studentCheckin', 'checkinId', id);
    if (!deleted) return res(ctx.status(404), ctx.json({ success: false, message: 'Not found' }));
    return res(ctx.status(200), ctx.json({ success: true, message: 'Deleted' }));
  }),
];

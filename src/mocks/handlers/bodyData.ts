/**
 * 学员身体数据相关 MSW handlers
 */
import { rest } from 'msw';
import { getCollection, getById, addItem, updateItem, deleteItem, CollectionItem } from '@/mock/mockData';

type BodyData = CollectionItem<'stuBodyData'>;

export const bodyDataHandlers = [
  // 身体数据列表
  rest.get('/api/stu-body-data', async (req, res, ctx) => {
    const stuId = req.url.searchParams.get('stuId')
      ? Number(req.url.searchParams.get('stuId'))
      : undefined;
    const measuredAt = req.url.searchParams.get('measuredAt');

    let full = await getCollection('stuBodyData', {
      filter: (item: BodyData) => {
        if (stuId && (item as any).stuId !== stuId) return false;
        if (measuredAt && (item as any).measuredAt !== measuredAt) return false;
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

  // 创建身体数据记录
  rest.post('/api/stu-body-data', async (req, res, ctx) => {
    const body = await req.json();
    const newId = Date.now();
    const newBodyData = { ...body, recordId: newId };
    addItem('stuBodyData', newBodyData);
    return res(ctx.status(200), ctx.json({ success: true, data: newBodyData }));
  }),

  // 更新身体数据记录
  rest.put('/api/stu-body-data/:id', async (req, res, ctx) => {
    const id = Number(req.params.id);
    const body = await req.json();
    const updated = updateItem('stuBodyData', 'recordId', id, body);
    if (!updated) return res(ctx.status(404), ctx.json({ success: false, message: 'Not found' }));
    return res(ctx.status(200), ctx.json({ success: true, data: updated }));
  }),

  // 删除身体数据记录
  rest.delete('/api/stu-body-data/:id', async (req, res, ctx) => {
    const id = Number(req.params.id);
    const deleted = deleteItem('stuBodyData', 'recordId', id);
    if (!deleted) return res(ctx.status(404), ctx.json({ success: false, message: 'Not found' }));
    return res(ctx.status(200), ctx.json({ success: true, message: 'Deleted' }));
  }),
];

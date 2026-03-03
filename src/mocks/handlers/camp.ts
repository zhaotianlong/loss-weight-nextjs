/**
 * 营地相关 MSW handlers
 */
import { rest } from 'msw';
import { getCollection, getById, addItem, updateItem, deleteItem, CollectionItem } from '@/mock/mockData';

type Camp = CollectionItem<'camp'>;

export const campHandlers = [
  // 营地列表（支持分页）
  rest.get('/api/camps', async (req, res, ctx) => {
    const page = Number(req.url.searchParams.get('page')) || 1;
    const pageSize = Number(req.url.searchParams.get('pageSize')) || 10;
    const campName = req.url.searchParams.get('campName');
    const address = req.url.searchParams.get('address');
    const status = req.url.searchParams.get('status');

    let full = await getCollection('camp');
    
    // 过滤
    if (campName) {
      full = full.filter((item: Camp) => 
        (item as any).campName?.toLowerCase().includes(campName.toLowerCase())
      );
    }
    if (address) {
      full = full.filter((item: Camp) => 
        (item as any).address?.toLowerCase().includes(address.toLowerCase())
      );
    }
    if (status !== null && status !== undefined) {
      full = full.filter((item: Camp) => (item as any).status === Number(status));
    }

    const total = full.length;
    const start = (page - 1) * pageSize;
    const data = full.slice(start, start + pageSize);
    const meta = { page, pageSize, total, pageCount: Math.ceil(total / pageSize) };
    return res(ctx.status(200), ctx.json({ success: true, data, meta }));
  }),

  // 单个营地
  rest.get('/api/camps/:id', async (req, res, ctx) => {
    const id = Number(req.params.id);
    const item = await getById('camp', 'campId', id);
    if (!item) return res(ctx.status(404), ctx.json({ success: false, message: 'Not found' }));
    return res(ctx.status(200), ctx.json({ success: true, data: item }));
  }),

  // 创建营地
  rest.post('/api/camps', async (req, res, ctx) => {
    const body = await req.json();
    const newId = Date.now();
    const newCamp = { ...body, campId: newId, currentNum: body.currentNum || 0 };
    addItem('camp', newCamp);
    return res(ctx.status(200), ctx.json({ success: true, data: newCamp }));
  }),

  // 更新营地
  rest.put('/api/camps/:id', async (req, res, ctx) => {
    const id = Number(req.params.id);
    const body = await req.json();
    const updated = updateItem('camp', 'campId', id, body);
    if (!updated) return res(ctx.status(404), ctx.json({ success: false, message: 'Not found' }));
    return res(ctx.status(200), ctx.json({ success: true, data: updated }));
  }),

  // 删除营地
  rest.delete('/api/camps/:id', async (req, res, ctx) => {
    const id = Number(req.params.id);
    const deleted = deleteItem('camp', 'campId', id);
    if (!deleted) return res(ctx.status(404), ctx.json({ success: false, message: 'Not found' }));
    return res(ctx.status(200), ctx.json({ success: true, message: 'Deleted' }));
  }),
];

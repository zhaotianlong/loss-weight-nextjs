/**
 * 私教购买记录相关 MSW handlers
 */
import { rest } from 'msw';
import { getCollection, getById, addItem, updateItem, deleteItem, CollectionItem, mockData } from '@/mock/mockData';

type PrivateOrder = CollectionItem<'stuPrivateOrders'>;

export const privatePurchaseHandlers = [
  // 私教购买记录列表 (这里重定向到 private-orders)
  rest.get('/api/private-purchases', async (req, res, ctx) => {
    const stuId = req.url.searchParams.get('stuId')
      ? Number(req.url.searchParams.get('stuId'))
      : undefined;
    const coachId = req.url.searchParams.get('coachId');
    const courseId = req.url.searchParams.get('courseId')
      ? Number(req.url.searchParams.get('courseId'))
      : undefined;
    const status = req.url.searchParams.get('status');

    let full = mockData.stuPrivateOrders;
    
    if (stuId) {
      full = full.filter(item => item.stuId === stuId);
    }
    if (courseId) {
      full = full.filter(item => item.courseId === courseId);
    }
    if (status !== null && status !== undefined) {
      // 这里的 status 需要适配字符串枚举
      // '开单' | '上课中' | '已完成'
      // 假设前端传 1, 2, 3 对应相应状态，或者直接传字符串
      // 这里做个简单的兼容处理，如果传数字则转换
      let statusStr = status;
      if (status === '1') statusStr = '开单';
      if (status === '2') statusStr = '上课中';
      if (status === '3') statusStr = '已完成';
      
      full = full.filter(item => item.status === statusStr);
    }

    const page = Number(req.url.searchParams.get('page')) || 1;
    const pageSize = Number(req.url.searchParams.get('pageSize')) || 20;
    const total = full.length;
    const start = (page - 1) * pageSize;
    const data = full.slice(start, start + pageSize);
    const meta = { page, pageSize, total, pageCount: Math.ceil(total / pageSize) };
    return res(ctx.status(200), ctx.json({ success: true, data, meta }));
  }),

  // 创建私教购买记录 (重定向到创建订单)
  rest.post('/api/private-purchases', async (req, res, ctx) => {
    const body = await req.json();
    const newId = Date.now();
    // 适配旧接口参数到新模型
    const newOrder = addItem('stuPrivateOrders', {
       id: newId,
       stuId: body.stuId,
       orderId: `ORD${newId}`,
       courseId: body.courseId,
       courseType: '常规', // 默认值
       paymentType: '单节', // 默认值
       originalPrice: body.totalPrice || 0,
       discountPrice: body.totalPrice || 0,
       totalSessions: body.quantity || 1,
       usedSessions: 0,
       status: '开单',
       orderTime: new Date().toISOString(),
       totalPrice: body.totalPrice || 0,
       bookingCoach: '系统',
       bookingCoachId: 'sys',
    });
    return res(ctx.status(200), ctx.json({ success: true, data: newOrder }));
  }),

  // 更新私教购买记录
  rest.put('/api/private-purchases/:id', async (req, res, ctx) => {
    const id = Number(req.params.id);
    const body = await req.json();
    const updated = updateItem('stuPrivateOrders', 'id', id, body);
    if (!updated) return res(ctx.status(404), ctx.json({ success: false, message: 'Not found' }));
    return res(ctx.status(200), ctx.json({ success: true, data: updated }));
  }),

  // 删除私教购买记录
  rest.delete('/api/private-purchases/:id', async (req, res, ctx) => {
    const id = Number(req.params.id);
    const deleted = deleteItem('stuPrivateOrders', 'id', id);
    if (!deleted) return res(ctx.status(404), ctx.json({ success: false, message: 'Not found' }));
    return res(ctx.status(200), ctx.json({ success: true, message: 'Deleted' }));
  }),
];


import { rest } from 'msw';
import { getCollection, addItem, updateItem, deleteItem, CollectionItem, getById } from '@/mock/mockData';

type Facility = CollectionItem<'facility'>;
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

export const facilityHandlers = [
  // 获取设施列表
  rest.get('/api/facilities', async (req, res, ctx) => {
    const user = await getCurrentUser(req);
    if (!user) return res(ctx.status(401), ctx.json({ success: false, message: '未授权' }));

    const campId = req.url.searchParams.get('campId');
    const name = req.url.searchParams.get('name');
    
    const page = Number(req.url.searchParams.get('page')) || 1;
    const pageSize = Number(req.url.searchParams.get('pageSize')) || 20;

    const filtered = await getCollection('facility', {
      filter: (item: Facility) => {
        const facilityItem = item as Facility;
        
        // 权限校验
        if (user.role !== '超级管理员') {
          // 非超管只能看到自己所属营地的设施
          if (facilityItem.campId !== (user as any).campId) return false;
        } else if (campId) {
          // 超管如果传了 campId，则按传参过滤
          if (facilityItem.campId !== Number(campId)) return false;
        }

        if (name && !facilityItem.name.includes(name)) return false;

        return true;
      },
    });

    const total = filtered.length;
    const start = (page - 1) * pageSize;
    const data = filtered.slice(start, start + pageSize);
    const meta = { page, pageSize, total, pageCount: Math.ceil(total / pageSize) };

    return res(ctx.status(200), ctx.json({ success: true, data, meta }));
  }),

  // 获取设施详情
  rest.get('/api/facilities/:id', async (req, res, ctx) => {
    const user = await getCurrentUser(req);
    if (!user) return res(ctx.status(401), ctx.json({ success: false, message: '未授权' }));

    const id = Number(req.params.id);
    const item = await getById('facility', 'id', id);

    if (!item) return res(ctx.status(404), ctx.json({ success: false, message: '未找到设施' }));

    // 权限校验
    if (user.role !== '超级管理员' && (item as any).campId !== (user as any).campId) {
      return res(ctx.status(403), ctx.json({ success: false, message: '无权查看此营地设施' }));
    }

    return res(ctx.status(200), ctx.json({ success: true, data: item }));
  }),

  // 创建设施
  rest.post('/api/facilities', async (req, res, ctx) => {
    const user = await getCurrentUser(req);
    if (!user) return res(ctx.status(401), ctx.json({ success: false, message: '未授权' }));

    // 只有超管和营地管理员可以操作
    if (user.role !== '超级管理员' && user.role !== '营地管理员') {
      return res(ctx.status(403), ctx.json({ success: false, message: '无权操作' }));
    }

    const body = await req.json() as Partial<Facility>;
    
    // 边界校验
    if (!body.name) return res(ctx.status(400), ctx.json({ success: false, message: '场地名称不能为空' }));
    if (!body.campId && user.role !== '超级管理员') {
        body.campId = (user as any).campId;
    }
    if (!body.campId) return res(ctx.status(400), ctx.json({ success: false, message: '所属营地不能为空' }));

    const newId = Date.now();
    const newItem = { ...body, id: newId } as Facility;
    addItem('facility', newItem);

    return res(ctx.status(200), ctx.json({ success: true, data: newItem }));
  }),

  // 更新设施
  rest.put('/api/facilities/:id', async (req, res, ctx) => {
    const user = await getCurrentUser(req);
    if (!user) return res(ctx.status(401), ctx.json({ success: false, message: '未授权' }));

    // 只有超管和营地管理员可以操作
    if (user.role !== '超级管理员' && user.role !== '营地管理员') {
      return res(ctx.status(403), ctx.json({ success: false, message: '无权操作' }));
    }

    const id = Number(req.params.id);
    const body = await req.json() as Partial<Facility>;
    
    const existing = await getById('facility', 'id', id);
    if (!existing) return res(ctx.status(404), ctx.json({ success: false, message: '未找到设施' }));

    // 权限校验：非超管只能操作自己营地的设施
    if (user.role !== '超级管理员' && (existing as any).campId !== (user as any).campId) {
      return res(ctx.status(403), ctx.json({ success: false, message: '无权操作此营地设施' }));
    }

    const updated = updateItem('facility', 'id', id, body);
    return res(ctx.status(200), ctx.json({ success: true, data: updated }));
  }),

  // 删除设施
  rest.delete('/api/facilities/:id', async (req, res, ctx) => {
    const user = await getCurrentUser(req);
    if (!user) return res(ctx.status(401), ctx.json({ success: false, message: '未授权' }));

    // 只有超管和营地管理员可以操作
    if (user.role !== '超级管理员' && user.role !== '营地管理员') {
      return res(ctx.status(403), ctx.json({ success: false, message: '无权操作' }));
    }

    const id = Number(req.params.id);
    const existing = await getById('facility', 'id', id);
    if (!existing) return res(ctx.status(404), ctx.json({ success: false, message: '未找到设施' }));

    // 权限校验：非超管只能操作自己营地的设施
    if (user.role !== '超级管理员' && (existing as any).campId !== (user as any).campId) {
      return res(ctx.status(403), ctx.json({ success: false, message: '无权操作此营地设施' }));
    }

    deleteItem('facility', 'id', id);
    return res(ctx.status(200), ctx.json({ success: true, message: 'Deleted' }));
  }),
];

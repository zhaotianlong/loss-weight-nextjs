/**
 * 菜谱相关 MSW handlers
 */
import { rest } from 'msw';
import { getCollection, addItem, updateItem, deleteItem, CollectionItem } from '@/mock/mockData';
import { getCurrentUserFromRequest } from '@/utils/getCurrentUserFromRequest';
import { isSuperAdmin } from '@/constants/permissions';

type Recipe = CollectionItem<'recipe'>;

export const recipeHandlers = [
  // 菜谱列表
  rest.get('/api/recipes', async (req, res, ctx) => {
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
    const category = req.url.searchParams.get('category');

    const page = Number(req.url.searchParams.get('page')) || 1;
    const pageSize = Number(req.url.searchParams.get('pageSize')) || 20;

    const filtered = await getCollection('recipe', {
      filter: (item: Recipe) => {
        // 如果不是超级管理员，强制过滤当前营地
        if (finalCampId && (item as any).campId !== finalCampId) {
          return false;
        }
        if (name && !item.name?.toLowerCase().includes(name.toLowerCase())) {
          return false;
        }
        if (category && item.category !== category) {
          return false;
        }
        return true;
      },
    });

    const total = filtered.length;
    const start = (page - 1) * pageSize;
    const data = filtered.slice(start, start + pageSize);
    const meta = { page, pageSize, total, pageCount: Math.ceil(total / pageSize) };
    return res(ctx.status(200), ctx.json({ success: true, data, meta }));
  }),

  // 创建菜谱
  rest.post('/api/recipes', async (req, res, ctx) => {
    const body = await req.json();
    const newId = `recipe_${Date.now()}`;
    const newRecipe = { ...body, id: newId } as Recipe;
    addItem('recipe', newRecipe);
    return res(ctx.status(200), ctx.json({ success: true, data: newRecipe }));
  }),

  // 更新菜谱
  rest.put('/api/recipes/:id', async (req, res, ctx) => {
    const id = req.params.id as string;
    const body = await req.json();
    const updated = updateItem('recipe', 'id', id, body);
    if (!updated) return res(ctx.status(404), ctx.json({ success: false, message: 'Not found' }));
    return res(ctx.status(200), ctx.json({ success: true, data: updated }));
  }),

  // 删除菜谱
  rest.delete('/api/recipes/:id', async (req, res, ctx) => {
    const id = req.params.id as string;
    const deleted = deleteItem('recipe', 'id', id);
    if (!deleted) return res(ctx.status(404), ctx.json({ success: false, message: 'Not found' }));
    return res(ctx.status(200), ctx.json({ success: true, message: 'Deleted' }));
  }),
];

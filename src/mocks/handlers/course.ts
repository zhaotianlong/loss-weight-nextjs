/**
 * 课程相关 MSW handlers
 */
import { rest } from 'msw';
import { getCollection, getById, addItem, updateItem, deleteItem, CollectionItem } from '@/mock/mockData';
import { getCurrentUserFromRequest } from '@/utils/getCurrentUserFromRequest';
import { isSuperAdmin } from '@/constants/permissions';

type Course = CollectionItem<'course'>;
type PrivateCourse = CollectionItem<'privateCourse'>;

import { privateCourseCoachRelations } from '@/mock/data/privateCourse';

export const courseHandlers = [
  // 公共课程列表
  rest.get('/api/courses', async (req, res, ctx) => {
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

    const title = req.url.searchParams.get('title');
    const coachId = req.url.searchParams.get('coachId');

    let full = await getCollection('course', {
      filter: finalCampId ? ((item) => (item as unknown as Course).campId === finalCampId) : undefined,
    });

    if (title) {
      full = full.filter((item) =>
        ((item as unknown as Course).title as string)?.toLowerCase().includes(title.toLowerCase())
      );
    }
    if (coachId) {
      full = full.filter((item) => (item as unknown as Course).coachId === coachId);
    }

    // ... inside api/private-courses
    // ... filtering logic ...

    const page = Number(req.url.searchParams.get('page')) || 1;
    const pageSize = Number(req.url.searchParams.get('pageSize')) || 20;
    const total = full.length;
    const start = (page - 1) * pageSize;
    const data = full.slice(start, start + pageSize);

    // 关联教练信息
    const dataWithCoaches = data.map((course) => {
      const courseItem = course as unknown as Course & { coaches?: { id: string; name: string; gender: string }[] };
      // 如果数据中已经有了 coaches，直接使用最新的
      if (courseItem.coaches && courseItem.coaches.length > 0) {
        return courseItem;
      }

      // 否则从关系表中获取 (兼容旧数据)
      const relations = privateCourseCoachRelations.filter(
        (r) => r.courseId === courseItem.courseId
      );
      return {
        ...courseItem,
        coaches: relations.map((r) => ({
          id: r.coachId,
          name: r.coachName,
          gender: '男', 
        })),
      };
    });

    const meta = { page, pageSize, total, pageCount: Math.ceil(total / pageSize) };
    return res(ctx.status(200), ctx.json({ success: true, data: dataWithCoaches, meta }));
  }),

  // 创建公共课程
  rest.post('/api/courses', async (req, res, ctx) => {
    const body = await req.json();
    const newId = Date.now();
    const now = new Date().toISOString();
    const newCourse = { 
      ...body, 
      courseId: newId, 
      status: body.status ?? 1,
      createTime: now,
      updateTime: now
    };
    addItem('course', newCourse);
    return res(ctx.status(200), ctx.json({ success: true, data: newCourse }));
  }),

  // 更新公共课程
  rest.put('/api/courses/:id', async (req, res, ctx) => {
    const id = Number(req.params.id);
    const body = await req.json();
    const updated = updateItem('course', 'courseId', id, {
      ...body,
      updateTime: new Date().toISOString()
    });
    if (!updated) return res(ctx.status(404), ctx.json({ success: false, message: 'Not found' }));
    return res(ctx.status(200), ctx.json({ success: true, data: updated }));
  }),

  // 删除公共课程
  rest.delete('/api/courses/:id', async (req, res, ctx) => {
    const id = Number(req.params.id);
    const deleted = deleteItem('course', 'courseId', id);
    if (!deleted) return res(ctx.status(404), ctx.json({ success: false, message: 'Not found' }));
    return res(ctx.status(200), ctx.json({ success: true, message: 'Deleted' }));
  }),

  // 私教课程列表
  rest.get('/api/private-courses', async (req, res, ctx) => {
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

    const type = req.url.searchParams.get('type');
    const paymentType = req.url.searchParams.get('paymentType');
    const status = req.url.searchParams.get('status');

    let full = await getCollection('privateCourse', {
      filter: finalCampId ? ((item) => (item as unknown as PrivateCourse).campId === finalCampId) : undefined,
    });

    if (type) {
      full = full.filter((item) => (item as unknown as PrivateCourse).type === type);
    }
    if (paymentType) {
      // 如果 paymentType 是数组，则检查课程是否包含其中任一类型
      const filterTypes = Array.isArray(paymentType) ? paymentType : [paymentType];
      full = full.filter((item) => {
        const itemPaymentTypes = ((item as unknown as PrivateCourse).paymentType as string)?.split(',') || [];
        return itemPaymentTypes.some((t: string) => filterTypes.includes(t));
      });
    }
    if (status !== null && status !== undefined) {
      full = full.filter((item) => (item as unknown as PrivateCourse).status === Number(status));
    }

    const page = Number(req.url.searchParams.get('page')) || 1;
    const pageSize = Number(req.url.searchParams.get('pageSize')) || 20;
    const total = full.length;
    const start = (page - 1) * pageSize;
    const data = full.slice(start, start + pageSize);

    // 关联教练信息
    const dataWithCoaches = data.map((course) => {
      const relations = privateCourseCoachRelations.filter(
        (r) => r.courseId === (course as Record<string, unknown>).courseId
      );
      return {
        ...(course as unknown as Record<string, unknown>),
        coaches: relations.map((r) => ({
          id: r.coachId,
          name: r.coachName,
          gender: '男', // 暂时写死，如果需要准确性别需关联 employee 表
        })),
      };
    });

    const meta = { page, pageSize, total, pageCount: Math.ceil(total / pageSize) };
    return res(ctx.status(200), ctx.json({ success: true, data: dataWithCoaches, meta }));
  }),

  // 创建私教课程
  rest.post('/api/private-courses', async (req, res, ctx) => {
    const body = await req.json();
    const currentUser = await getCurrentUserFromRequest(req);
    const newId = Date.now();
    const newCourse = { 
      ...body, 
      courseId: newId, 
      status: body.status ?? 1,
      campId: currentUser?.campId || 101 // 默认为当前用户的 campId
    };
    addItem('privateCourse', newCourse);
    return res(ctx.status(200), ctx.json({ success: true, data: newCourse }));
  }),

  // 更新私教课程
  rest.put('/api/private-courses/:id', async (req, res, ctx) => {
    const id = Number(req.params.id);
    const body = await req.json();
    const updated = updateItem('privateCourse', 'courseId', id, body);
    if (!updated) return res(ctx.status(404), ctx.json({ success: false, message: 'Not found' }));
    return res(ctx.status(200), ctx.json({ success: true, data: updated }));
  }),

  // 删除私教课程
  rest.delete('/api/private-courses/:id', async (req, res, ctx) => {
    const id = Number(req.params.id);
    const deleted = deleteItem('privateCourse', 'courseId', id);
    if (!deleted) return res(ctx.status(404), ctx.json({ success: false, message: 'Not found' }));
    return res(ctx.status(200), ctx.json({ success: true, message: 'Deleted' }));
  }),
];

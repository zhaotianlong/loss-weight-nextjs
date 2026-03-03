/**
 * 学费相关 MSW handlers
 */
import { rest } from 'msw';
import { getCollection, getById, addItem, updateItem, deleteItem, CollectionItem } from '@/mock/mockData';
import { getCurrentUserFromRequest } from '@/utils/getCurrentUserFromRequest';
import { isSuperAdmin } from '@/constants/permissions';

type Tuition = CollectionItem<'tuition'>;
type Renewal = CollectionItem<'renewal'>;

export const tuitionHandlers = [
  // 学费列表
  rest.get('/api/tuition', async (req, res, ctx) => {
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

    const stuId = req.url.searchParams.get('studentId')
      ? Number(req.url.searchParams.get('studentId'))
      : undefined;
    const status = req.url.searchParams.get('status');

    const page = Number(req.url.searchParams.get('page')) || 1;
    const pageSize = Number(req.url.searchParams.get('pageSize')) || 20;

    const filtered = await getCollection('tuition', {
      filter: (item: Tuition) => {
        // 如果不是超级管理员，强制过滤当前营地
        if (finalCampId && (item as any).campId !== finalCampId) {
          return false;
        }
        if (stuId && (item as any).stuId !== stuId) {
          return false;
        }
        if (status !== null && status !== undefined && (item as any).status !== Number(status)) {
          return false;
        }
        // 过滤掉已拒绝的记录 (status: 4)
        if ((item as any).status === 4) {
          return false;
        }
        return true;
      },
    });

    // 补充学员名称
    const students = await getCollection('student');
    const studentMap = new Map((students as any[]).map(s => [s.stuId, s.name]));
    
    const dataWithNames = filtered.map((item: any) => ({
      ...item,
      studentName: item.studentName || studentMap.get(item.stuId) || '未知学员',
    }));

    const total = dataWithNames.length;
    const start = (page - 1) * pageSize;
    const data = dataWithNames.slice(start, start + pageSize);
    const meta = { page, pageSize, total, pageCount: Math.ceil(total / pageSize) };
    return res(ctx.status(200), ctx.json({ success: true, data, meta }));
  }),

  // 创建学费记录
  rest.post('/api/tuition', async (req, res, ctx) => {
    const body = await req.json();
    const newId = Date.now();
    const newTuition = { ...body, id: newId } as Tuition;
    addItem('tuition', newTuition);
    return res(ctx.status(200), ctx.json({ success: true, data: newTuition }));
  }),

  // 更新学费记录
  rest.put('/api/tuition/:id', async (req, res, ctx) => {
    const id = Number(req.params.id);
    const body = await req.json();
    const updated = updateItem('tuition', 'id', id, body);
    if (!updated) return res(ctx.status(404), ctx.json({ success: false, message: 'Not found' }));
    return res(ctx.status(200), ctx.json({ success: true, data: updated }));
  }),

  // 删除学费记录
  rest.delete('/api/tuition/:id', async (req, res, ctx) => {
    const id = Number(req.params.id);
    const deleted = deleteItem('tuition', 'id', id);
    if (!deleted) return res(ctx.status(404), ctx.json({ success: false, message: 'Not found' }));
    return res(ctx.status(200), ctx.json({ success: true, message: 'Deleted' }));
  }),

  // 续费列表
  rest.get('/api/tuition/renewal', async (req, res, ctx) => {
    const stuId = req.url.searchParams.get('stuId')
      ? Number(req.url.searchParams.get('stuId'))
      : undefined;

    const page = Number(req.url.searchParams.get('page')) || 1;
    const pageSize = Number(req.url.searchParams.get('pageSize')) || 20;

    const filtered = await getCollection('renewal', {
      filter: (item: Renewal) => {
        if (stuId && (item as any).stuId !== stuId) {
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

  // 创建续费记录
  rest.post('/api/tuition/renewal', async (req, res, ctx) => {
    const body = await req.json();
    const newId = Date.now();
    const newRenewal = { ...body, id: newId } as Renewal;
    addItem('renewal', newRenewal);
    return res(ctx.status(200), ctx.json({ success: true, data: newRenewal }));
  }),

  // 审核财务记录
  rest.post('/api/tuition/:id/approve', async (req, res, ctx) => {
    const id = Number(req.params.id);
    const tuition = (await getById('tuition', 'id', id)) as any;
    if (!tuition) return res(ctx.status(404), ctx.json({ success: false, message: '未找到该记录' }));

    if (tuition.status !== 3) {
      return res(ctx.status(200), ctx.json({ success: false, message: '只有待审核的记录可以审核' }));
    }

    const { applyInfo } = tuition;
    if (!applyInfo) return res(ctx.status(200), ctx.json({ success: false, message: '缺少申请信息' }));

    // 1. 更新财务记录状态为已支付
    updateItem('tuition', 'id', id, {
      status: 1,
      paymentDate: new Date().toISOString().split('T')[0],
    });

    // 2. 执行后续业务逻辑
    if (applyInfo.type === 'checkin') {
      const { bedId, bedNum, roomId, roomTypeId, stuId, checkinDate } = applyInfo;
      
      const student = (await getById('student', 'stuId', stuId)) as any;
      updateItem('tuition', 'id', id, { studentName: student?.name });

      // 更新床位
      let finalBedId = bedId;
      if (bedId === 0) {
        // 先尝试查找是否已经因为审核中而创建了占位床位
        const beds = await getCollection('bed');
        const existingBed = beds.find((b: any) => b.roomId === roomId && b.bedNum === bedNum);
        
        if (existingBed) {
          updateItem('bed', 'bedId', existingBed.bedId, { stuId, status: 1 });
          finalBedId = existingBed.bedId;
        } else {
          const newBedId = Date.now();
          const newBed = {
            bedId: newBedId,
            roomId,
            roomTypeId,
            bedNum,
            stuId,
            status: 1,
          };
          addItem('bed', newBed);
          finalBedId = newBedId;
        }
      } else {
        updateItem('bed', 'bedId', bedId, { stuId, status: 1 });
      }

      // 更新学员
      updateItem('student', 'stuId', stuId, {
        bedId: finalBedId,
        checkinDate,
        checkoutDate: null,
      });

      // 创建入住记录
      addItem('studentCheckin', {
        checkinId: Date.now(),
        stuId,
        campId: tuition.campId,
        checkinDate,
        checkinTime: new Date().toTimeString().slice(0, 5),
        status: 1,
      });
    } else if (applyInfo.type === 'renewal') {
      const { stuId, days } = applyInfo;
      const student = (await getById('student', 'stuId', stuId)) as any;
      updateItem('tuition', 'id', id, { studentName: student?.name });
      
      let newCheckoutDate: string;
      if (student.checkoutDate) {
        const currentExpire = new Date(student.checkoutDate);
        currentExpire.setDate(currentExpire.getDate() + days);
        newCheckoutDate = currentExpire.toISOString().split('T')[0];
      } else {
        const checkin = new Date(student.checkinDate);
        const baseExpire = new Date(checkin);
        baseExpire.setDate(baseExpire.getDate() + 30 + days);
        newCheckoutDate = baseExpire.toISOString().split('T')[0];
      }

      updateItem('student', 'stuId', stuId, {
        checkoutDate: newCheckoutDate,
      });

      // 审核通过后，将床位状态改回正常 (status: 1)
      if (student.bedId) {
        updateItem('bed', 'bedId', student.bedId, { status: 1 });
      }
    } else if (applyInfo.type === 'changeBed') {
      const { currentBedId, newBedId, stuId } = applyInfo;
      
      const student = (await getById('student', 'stuId', stuId)) as any;
      updateItem('tuition', 'id', id, { studentName: student?.name });

      // 1. 清空原床位的学员ID，并恢复状态为正常
      updateItem('bed', 'bedId', currentBedId, { stuId: null, status: 1 });

      // 2. 更新新床位的学员ID，并恢复状态为正常
      updateItem('bed', 'bedId', newBedId, { stuId, status: 1 });

      // 3. 更新学员的床位ID
      updateItem('student', 'stuId', stuId, {
        bedId: newBedId,
      });
    }

    return res(ctx.status(200), ctx.json({ success: true, message: '审核通过' }));
  }),

  // 拒绝财务记录
  rest.post('/api/tuition/:id/reject', async (req, res, ctx) => {
    const id = Number(req.params.id);
    const tuition = (await getById('tuition', 'id', id)) as any;
    if (!tuition) return res(ctx.status(404), ctx.json({ success: false, message: '未找到该记录' }));

    if (tuition.status !== 3) {
      return res(ctx.status(200), ctx.json({ success: false, message: '只有待审核的记录可以拒绝' }));
    }

    const { applyInfo } = tuition;

    // 1. 更新财务记录状态为已拒绝
    updateItem('tuition', 'id', id, {
      status: 4,
    });

    // 2. 如果是入住/续费申请，恢复床位状态
    if (applyInfo) {
      if (applyInfo.type === 'checkin') {
        const { bedId, bedNum, roomId } = applyInfo;
        if (bedId === 0) {
          // 如果是新建的占位床位，删除它
          const beds = await getCollection('bed');
          const placeholderBed = beds.find((b: any) => b.roomId === roomId && b.bedNum === bedNum && b.status === 2);
          if (placeholderBed) {
            deleteItem('bed', 'bedId', placeholderBed.bedId);
          }
        } else {
          // 恢复已有床位状态为正常 (status: 1)
          updateItem('bed', 'bedId', bedId, { status: 1 });
        }
      } else if (applyInfo.type === 'renewal') {
        const { stuId } = applyInfo;
        const student = (await getById('student', 'stuId', stuId)) as any;
        if (student && student.bedId) {
          updateItem('bed', 'bedId', student.bedId, { status: 1 });
        }
      } else if (applyInfo.type === 'changeBed') {
        const { currentBedId, newBedId } = applyInfo;
        // 恢复两个床位状态为正常 (status: 1)
        updateItem('bed', 'bedId', currentBedId, { status: 1 });
        updateItem('bed', 'bedId', newBedId, { status: 1 });
      }
    }

    return res(ctx.status(200), ctx.json({ success: true, message: '已拒绝申请' }));
  }),
];

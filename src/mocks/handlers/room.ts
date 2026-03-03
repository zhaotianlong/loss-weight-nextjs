/**
 * 房间相关 MSW handlers
 */
import { rest } from 'msw';
import dayjs from 'dayjs';
import { getCollection, addItem, updateItem, deleteItem, CollectionItem } from '@/mock/mockData';
import { getCurrentUserFromRequest } from '@/utils/getCurrentUserFromRequest';
import { isSuperAdmin } from '@/constants/permissions';

type Room = CollectionItem<'room'>;
type RoomType = CollectionItem<'campRoomType'>;
type Bed = CollectionItem<'bed'>;
type Student = CollectionItem<'student'>;

interface StudentCheckin {
  checkinId: number;
  stuId: number;
  status: number;
}

export const roomHandlers = [
  // 聚合接口：按营地查询所有房间、床位和学员信息
  rest.get('/api/rooms/with-beds-students', async (req, res, ctx) => {
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
    const typeId = req.url.searchParams.get('typeId')
      ? Number(req.url.searchParams.get('typeId'))
      : undefined;
    const bedCount = req.url.searchParams.get('bedCount')
      ? Number(req.url.searchParams.get('bedCount'))
      : undefined;
    const roomName = req.url.searchParams.get('roomName');
    const studentName = req.url.searchParams.get('studentName');
    const page = Number(req.url.searchParams.get('page')) || 1;
    const pageSize = Number(req.url.searchParams.get('pageSize')) || 20;
    const roomNum = req.url.searchParams.get('roomNum');
    const status = req.url.searchParams.get('status');
    const bedType = req.url.searchParams.get('bedType')
      ? Number(req.url.searchParams.get('bedType'))
      : undefined;

    // 获取所有相关数据
    const [rooms, roomTypes, beds, students] = await Promise.all([
      getCollection('room', {
        filter: finalCampId ? ((item: Room) => item.campId === finalCampId) : undefined,
      }),
      getCollection('campRoomType'),
      getCollection('bed'),
      getCollection('student'),
    ]);

    // 创建映射表以提高查询效率
    const roomTypeMap = new Map(
      (roomTypes as RoomType[]).map(rt => [rt.roomTypeId, rt])
    );
    const studentMap = new Map(
      (students as Student[]).map(s => [s.stuId, s])
    );

    // 如果按学员名称筛选，先找到符合条件的学员ID
    let studentIds: Set<number> | undefined;
    if (studentName) {
      const matchedStudents = (students as Student[]).filter((s: Student) =>
        s.name?.toLowerCase().includes(studentName.toLowerCase())
      );
      studentIds = new Set(matchedStudents.map(s => s.stuId));
    }

    // 如果按床位类型筛选，先找到符合条件的房间类型ID
    let roomTypeIdsByBedType: Set<number> | undefined;
    if (bedType !== null && bedType !== undefined) {
      const matchedRoomTypes = (roomTypes as RoomType[]).filter(
        (rt: RoomType) => rt.bedType === bedType
      );
      roomTypeIdsByBedType = new Set(matchedRoomTypes.map(rt => rt.roomTypeId));
    }

    // 如果按房间类型名称筛选，先找到符合条件的房间类型ID（包含匹配）
    let roomTypeIdsByRoomName: Set<number> | undefined;
    if (roomName) {
      const matchedRoomTypes = (roomTypes as RoomType[]).filter(
        (rt: RoomType) => rt.roomName?.toLowerCase().includes(roomName.toLowerCase())
      );
      roomTypeIdsByRoomName = new Set(matchedRoomTypes.map(rt => rt.roomTypeId));
    }

    // 如果按床位数筛选，先找到符合条件的房间类型ID
    let roomTypeIdsByBedCount: Set<number> | undefined;
    if (bedCount !== null && bedCount !== undefined) {
      const matchedRoomTypes = (roomTypes as RoomType[]).filter(
        (rt: RoomType) => rt.bedCount === bedCount
      );
      roomTypeIdsByBedCount = new Set(matchedRoomTypes.map(rt => rt.roomTypeId));
    }

    // 如果按房间类型筛选，先找到符合条件的房间
    let roomIdsByType: Set<number> | undefined;
    if (typeId) {
      const matchedRooms = (rooms as Room[]).filter(
        (r: Room) => r.typeId === typeId
      );
      roomIdsByType = new Set(matchedRooms.map(r => r.roomId));
    }

    // 过滤房间
    let filteredRooms = rooms as Room[];
    if (roomNum) {
      filteredRooms = filteredRooms.filter((item: Room) =>
        item.roomNum?.toLowerCase().includes(roomNum.toLowerCase())
      );
    }
    if (status !== null && status !== undefined) {
      filteredRooms = filteredRooms.filter((item: Room) => item.status === Number(status));
    }
    if (typeId && roomIdsByType) {
      filteredRooms = filteredRooms.filter((item: Room) => roomIdsByType!.has(item.roomId));
    }
    // 如果按房间类型名称筛选，只保留对应房间类型的房间
    if (roomName && roomTypeIdsByRoomName) {
      filteredRooms = filteredRooms.filter((item: Room) => 
        roomTypeIdsByRoomName!.has(item.typeId)
      );
    }
    // 如果按床位数筛选，只保留对应床位数的房间
    if (bedCount !== null && bedCount !== undefined && roomTypeIdsByBedCount) {
      filteredRooms = filteredRooms.filter((item: Room) => 
        roomTypeIdsByBedCount!.has(item.typeId)
      );
    }
    // 如果按床位类型筛选，只保留对应床位类型的房间
    if (bedType !== null && bedType !== undefined && roomTypeIdsByBedType) {
      filteredRooms = filteredRooms.filter((item: Room) => 
        roomTypeIdsByBedType!.has(item.typeId)
      );
    }

    // 组装数据：为每个房间关联房间类型、床位和学员信息
    let roomDetails = filteredRooms.map((room: Room) => {
      const roomType = roomTypeMap.get(room.typeId);
      const roomBeds = (beds as Bed[])
        .filter(bed => bed.roomId === room.roomId)
        .map(bed => {
          const student = bed.stuId ? studentMap.get(bed.stuId) : undefined;
          return {
            ...bed,
            student,
          };
        })
        .sort((a, b) => {
          // 按床位号排序
          const matchA = a.bedNum.match(/-(\d+)$/);
          const matchB = b.bedNum.match(/-(\d+)$/);
          if (matchA && matchB) {
            return parseInt(matchA[1]) - parseInt(matchB[1]);
          }
          return 0;
        });

      return {
        ...room,
        roomType,
        beds: roomBeds,
      };
    });

    // 如果按学员名称筛选，只保留包含该学员的房间
    if (studentName && studentIds) {
      roomDetails = roomDetails.filter(room =>
        room.beds.some(bed => bed.stuId && studentIds!.has(bed.stuId))
      );
    }

    // 分页
    const total = roomDetails.length;
    const start = (page - 1) * pageSize;
    const data = roomDetails.slice(start, start + pageSize);
    const meta = { page, pageSize, total, pageCount: Math.ceil(total / pageSize) };

    return res(ctx.status(200), ctx.json({ code: 200, success: true, data, meta }));
  }),

  // 房间列表（可按 campId 过滤，返回 { data, meta }）
  rest.get('/api/rooms', async (req, res, ctx) => {
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

    const typeId = req.url.searchParams.get('typeId')
      ? Number(req.url.searchParams.get('typeId'))
      : undefined;
    const roomNum = req.url.searchParams.get('roomNum');
    const status = req.url.searchParams.get('status');

    let full = await getCollection('room', {
      filter: finalCampId ? ((item: Room) => item.campId === finalCampId) : undefined,
    });

    // 额外过滤
    if (typeId) {
      full = full.filter((item: Room) => item.typeId === typeId);
    }
    if (roomNum) {
      full = full.filter((item: Room) => 
        item.roomNum?.toLowerCase().includes(roomNum.toLowerCase())
      );
    }
    if (status !== null && status !== undefined) {
      full = full.filter((item: Room) => item.status === Number(status));
    }

    const page = Number(req.url.searchParams.get('page')) || 1;
    const pageSize = Number(req.url.searchParams.get('pageSize')) || 20;
    const total = full.length;
    const start = (page - 1) * pageSize;
    const data = full.slice(start, start + pageSize);
    const meta = { page, pageSize, total, pageCount: Math.ceil(total / pageSize) };
    return res(ctx.status(200), ctx.json({ code: 200, success: true, data, meta }));
  }),

  // 房间类型列表
  rest.get('/api/room-types', async (req, res, ctx) => {
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

    const roomName = req.url.searchParams.get('roomName');
    const bedCount = req.url.searchParams.get('bedCount')
      ? Number(req.url.searchParams.get('bedCount'))
      : undefined;
    const bedType = req.url.searchParams.get('bedType');
    const roomStatus = req.url.searchParams.get('roomStatus');

    let full = await getCollection('campRoomType', {
      filter: finalCampId ? ((item: RoomType) => item.campId === finalCampId) : undefined,
    });

    if (roomName) {
      // 类型名称使用包含匹配（模糊搜索）
      full = full.filter((item: RoomType) =>
        item.roomName?.toLowerCase().includes(roomName.toLowerCase())
      );
    }

    if (bedCount !== null && bedCount !== undefined) {
      full = full.filter((item: RoomType) => item.bedCount === bedCount);
    }

    if (bedType !== null && bedType !== undefined) {
      full = full.filter((item: RoomType) => item.bedType === Number(bedType));
    }

    if (roomStatus !== null && roomStatus !== undefined) {
      full = full.filter((item: RoomType) => item.roomStatus === Number(roomStatus));
    }

    const page = Number(req.url.searchParams.get('page')) || 1;
    const pageSize = Number(req.url.searchParams.get('pageSize')) || 20;
    const total = full.length;
    const start = (page - 1) * pageSize;
    const data = full.slice(start, start + pageSize);
    const meta = { page, pageSize, total, pageCount: Math.ceil(total / pageSize) };
    return res(ctx.status(200), ctx.json({ code: 200, success: true, data, meta }));
  }),

  // 创建房间类型
  rest.post('/api/room-types', async (req, res, ctx) => {
    const body = await req.json();
    
    // 校验：床位数<2时，bedType必须为0（普通床位）
    if (body.bedCount < 2 && body.bedType === 1) {
      return res(
        ctx.status(200),
        ctx.json({
          code: 4007,
          success: false,
          msg: '只有床位数≥2的房间类型才能选择上下床',
          data: null,
        })
      );
    }
    
    const newId = Date.now();
    const newRoomType = { ...body, roomTypeId: newId };
    addItem('campRoomType', newRoomType);
    return res(ctx.status(200), ctx.json({ code: 200, success: true, data: newRoomType }));
  }),

  // 更新房间类型
  rest.put('/api/room-types/:id', async (req, res, ctx) => {
    const id = Number(req.params.id);
    const body = await req.json();
    
    // 获取更新后的bedCount，如果body中有则使用，否则从现有数据中获取
    const roomTypes = await getCollection('campRoomType');
    const existingRoomType = (roomTypes as RoomType[]).find((rt: RoomType) => rt.roomTypeId === id);
    const bedCount = body.bedCount !== undefined ? body.bedCount : (existingRoomType?.bedCount || 0);
    const bedType = body.bedType !== undefined ? body.bedType : (existingRoomType?.bedType || 0);
    
    // 校验：床位数<2时，bedType必须为0（普通床位）
    if (bedCount < 2 && bedType === 1) {
      return res(
        ctx.status(200),
        ctx.json({
          code: 4007,
          success: false,
          msg: '只有床位数≥2的房间类型才能选择上下床',
          data: null,
        })
      );
    }
    
    const updated = updateItem('campRoomType', 'roomTypeId', id, body);
    if (!updated) return res(ctx.status(404), ctx.json({ success: false, message: 'Not found' }));
    return res(ctx.status(200), ctx.json({ code: 200, success: true, data: updated }));
  }),

  // 删除房间类型
  rest.delete('/api/room-types/:id', async (req, res, ctx) => {
    const id = Number(req.params.id);
    const deleted = deleteItem('campRoomType', 'roomTypeId', id);
    if (!deleted) return res(ctx.status(404), ctx.json({ success: false, message: 'Not found' }));
    return res(ctx.status(200), ctx.json({ code: 200, success: true, msg: 'Deleted', data: null }));
  }),

  // 创建房间
  rest.post('/api/rooms', async (req, res, ctx) => {
    const body = await req.json();
    
    // 校验房间类型是否允许使用
    const roomTypes = await getCollection('campRoomType');
    const roomType = (roomTypes as RoomType[]).find((rt: RoomType) => rt.roomTypeId === body.typeId);
    if (!roomType) {
      return res(
        ctx.status(200),
        ctx.json({
          code: 4008,
          success: false,
          msg: '房间类型不存在',
          data: null,
        })
      );
    }
    
    // 校验：如果房间类型的bedCount<2，bedType必须为0
    if (roomType.bedCount < 2 && roomType.bedType === 1) {
      return res(
        ctx.status(200),
        ctx.json({
          code: 4009,
          success: false,
          msg: '该房间类型的床位数<2，不能使用上下床',
          data: null,
        })
      );
    }
    
    const newId = Date.now();
    const newRoom = { ...body, roomId: newId };
    addItem('room', newRoom);
    
    // 自动创建对应数量的床位
    const bedCount = body.bedCount || roomType.bedCount || 1;
    const bedType = roomType.bedType || 0;
    
    for (let i = 1; i <= bedCount; i++) {
      const bedId = Date.now() + i; // 确保每个床位ID唯一
      const bedNum = `${body.roomNum}-${i}`;
      const newBed = {
        bedId,
        roomId: newId,
        roomTypeId: body.typeId,
        bedNum,
        stuId: null,
        status: 1, // 默认可用
      };
      addItem('bed', newBed);
    }
    
    return res(ctx.status(200), ctx.json({ code: 200, success: true, data: newRoom }));
  }),

  // 更新房间
  rest.put('/api/rooms/:id', async (req, res, ctx) => {
    const id = Number(req.params.id);
    const body = await req.json();
    
    // 先检查房间是否存在
    const rooms = await getCollection('room');
    const room = (rooms as Room[]).find((r: Room) => r.roomId === id);
    if (!room) {
      return res(ctx.status(404), ctx.json({ success: false, message: '房间不存在' }));
    }
    
    // 如果修改了房间类型（typeId），需要校验入住人数
    if (body.typeId && body.typeId !== room.typeId) {
      // 获取新的房间类型信息
      const roomTypes = await getCollection('campRoomType');
      const newRoomType = (roomTypes as RoomType[]).find((rt: RoomType) => rt.roomTypeId === body.typeId);
      
      if (!newRoomType) {
        // 业务错误：房间类型不存在
        return res(
          ctx.status(200),
          ctx.json({ 
            code: 4002, 
            msg: '房间类型不存在',
            success: false,
            data: null
          })
        );
      }
      
      // 校验：如果房间类型的bedCount<2，bedType必须为0
      if (newRoomType.bedCount < 2 && newRoomType.bedType === 1) {
        return res(
          ctx.status(200),
          ctx.json({
            code: 4009,
            success: false,
            msg: '该房间类型的床位数<2，不能使用上下床',
            data: null,
          })
        );
      }
      
      // 统计当前房间已入住的学员数量
      const beds = await getCollection('bed');
      const roomBeds = (beds as Bed[]).filter((bed: Bed) => bed.roomId === id);
      const occupiedCount = roomBeds.filter((bed: Bed) => bed.stuId !== null && bed.stuId !== undefined).length;
      
      // 检查新的房间类型的床位数是否足够容纳当前已入住的学员
      if (occupiedCount > newRoomType.bedCount) {
        // 业务错误：已入住人数超过新房间类型的床位数
        return res(
          ctx.status(200),
          ctx.json({ 
            code: 4003, 
            msg: `当前房间已入住 ${occupiedCount} 人，不能改为 ${newRoomType.bedCount} 人间的房间类型（${newRoomType.roomName}）`,
            success: false,
            data: null
          })
        );
      }
    }
    
    // 执行更新
    const updated = updateItem('room', 'roomId', id, body);
    if (!updated) {
      return res(ctx.status(404), ctx.json({ success: false, message: '更新失败，房间不存在' }));
    }
    
    return res(ctx.status(200), ctx.json({ code: 200, success: true, data: updated }));
  }),

  // 删除房间
  rest.delete('/api/rooms/:id', async (req, res, ctx) => {
    const id = Number(req.params.id);
    
    // 先检查该房间是否存在 - 网络错误：404
    const rooms = await getCollection('room');
    const room = (rooms as Room[]).find((r: Room) => r.roomId === id);
    if (!room) {
      return res(ctx.status(404), ctx.json({ success: false, message: '房间不存在' }));
    }
    
    // 检查该房间的所有床位，判断是否有学员 - 业务错误：返回 200，code 不为 200
    const beds = await getCollection('bed');
    const roomBeds = (beds as Bed[]).filter((bed: Bed) => bed.roomId === id);
    
    // 检查是否有床位存在学员（stuId 不为 null 且不为空）
    const hasStudent = roomBeds.some((bed: Bed) => bed.stuId !== null && bed.stuId !== undefined);
    
    if (hasStudent) {
      // 业务错误：返回 HTTP 200，但 code 不为 200
      return res(
        ctx.status(200),
        ctx.json({ 
          code: 4001, 
          msg: '该房间仍有学员入住，无法删除。请先让所有学员退房后再删除。',
          success: false,
          data: null
        })
      );
    }
    
    // 如果没有学员，删除该房间的所有床位
    for (const bed of roomBeds) {
      deleteItem('bed', 'bedId', bed.bedId);
    }
    
    // 再删除房间 - 网络错误：500
    const deleted = deleteItem('room', 'roomId', id);
    if (!deleted) {
      return res(ctx.status(500), ctx.json({ success: false, message: '删除房间失败，请稍后重试' }));
    }
    
    // 成功：返回 HTTP 200，code 200
    return res(ctx.status(200), ctx.json({ code: 200, success: true, msg: '删除成功', data: null }));
  }),

  // 申请入住学员
  rest.post('/api/rooms/apply-checkin', async (req, res, ctx) => {
    const body = await req.json();
    const { bedId, bedNum, roomId, roomTypeId, stuId, checkinDate, originalAmount, actualAmount, salespersonId } = body;

    if (bedId === undefined || !stuId || !checkinDate) {
      return res(
        ctx.status(200),
        ctx.json({
          code: 4001,
          success: false,
          msg: '参数不完整',
          data: null,
        })
      );
    }

    // 检查学员是否存在
    const students = await getCollection('student');
    const student = students.find((s: Student) => s.stuId === stuId);
    if (!student) {
      return res(ctx.status(200), ctx.json({ code: 4004, success: false, msg: '学员不存在' }));
    }

    // 创建待审核的财务记录
    const newTuitionId = Date.now();
    const newTuition = {
      id: newTuitionId,
      stuId,
      studentName: student.name,
      campId: student.campId,
      type: 'income',
      source: '学费(入住)',
      amount: actualAmount,
      originalAmount,
      actualAmount,
      date: checkinDate,
      dueDate: dayjs(checkinDate).add(30, 'day').format('YYYY-MM-DD'),
      status: 3, // 待审核
      description: `申请入住: 床位 ${bedNum || '未指定'}`,
      salespersonId,
      createTime: new Date().toISOString(),
      updateTime: new Date().toISOString(),
      applyInfo: {
        type: 'checkin',
        bedId,
        bedNum,
        roomId,
        roomTypeId,
        stuId,
        checkinDate,
        salespersonId,
      }
    };
    addItem('tuition', newTuition);

    // 更新床位状态为预留审核中 (status: 2)
    if (bedId !== 0) {
      updateItem('bed', 'bedId', bedId, { status: 2 });
    } else if (roomId && roomTypeId && bedNum) {
      // 如果是空床位（未创建），为了显示状态，我们需要创建一个占位床位
      addItem('bed', {
        bedId: Date.now() + 1,
        roomId,
        roomTypeId,
        bedNum,
        stuId: null,
        status: 2,
      });
    }

    return res(
      ctx.status(200),
      ctx.json({
        code: 200,
        success: true,
        msg: '申请入住成功，请等待财务审核',
        data: null,
      })
    );
  }),

  // 申请更换床位
  rest.post('/api/rooms/apply-change-bed', async (req, res, ctx) => {
    const body = await req.json();
    const { currentBedId, newBedId, stuId, originalAmount, actualAmount } = body;

    if (!currentBedId || !newBedId || !stuId) {
      return res(
        ctx.status(200),
        ctx.json({
          code: 4001,
          success: false,
          msg: '参数不完整',
          data: null,
        })
      );
    }

    // 获取学员信息
    const students = await getCollection('student');
    const student = students.find((s: Student) => s.stuId === stuId);
    if (!student) {
      return res(ctx.status(200), ctx.json({ code: 4004, success: false, msg: '学员不存在' }));
    }

    // 检查当前床位
    const beds = await getCollection('bed');
    const currentBed = beds.find((b: Bed) => b.bedId === currentBedId);
    if (!currentBed || currentBed.stuId !== stuId) {
      return res(
        ctx.status(200),
        ctx.json({
          code: 4002,
          success: false,
          msg: '当前床位信息不匹配',
          data: null,
        })
      );
    }

    // 检查新床位是否存在
    const newBed = beds.find((b: Bed) => b.bedId === newBedId);
    if (!newBed) {
      return res(
        ctx.status(200),
        ctx.json({
          code: 4003,
          success: false,
          msg: '新床位不存在',
          data: null,
        })
      );
    }

    // 检查新床位是否已被占用
    if (newBed.stuId) {
      return res(
        ctx.status(200),
        ctx.json({
          code: 4004,
          success: false,
          msg: '新床位已被占用',
          data: null,
        })
      );
    }

    // 创建待审核的财务记录
    const newTuitionId = Date.now();
    const newTuition = {
      id: newTuitionId,
      stuId,
      studentName: student.name,
      campId: student.campId,
      type: 'income',
      source: '学费(换房)',
      amount: actualAmount,
      originalAmount,
      actualAmount,
      dueDate: student.checkoutDate || dayjs().add(30, 'day').format('YYYY-MM-DD'),
      status: 3, // 待审核
      description: `申请更换床位: 从 ${currentBed.bedNum} 到 ${newBed.bedNum}`,
      createTime: new Date().toISOString(),
      updateTime: new Date().toISOString(),
      applyInfo: {
        type: 'changeBed',
        currentBedId,
        newBedId,
        stuId,
      }
    };
    addItem('tuition', newTuition);

    // 更新两个床位的状态为预留审核中 (status: 2)
    updateItem('bed', 'bedId', currentBedId, { status: 2 });
    updateItem('bed', 'bedId', newBedId, { status: 2 });

    return res(
      ctx.status(200),
      ctx.json({
        code: 200,
        success: true,
        msg: '更换床位申请成功，请等待财务审核',
        data: null,
      })
    );
  }),

  // 学员离营
  rest.post('/api/rooms/checkout-student', async (req, res, ctx) => {
    const body = await req.json();
    const { bedId, stuId, checkoutDate } = body;

    if (!bedId || !stuId || !checkoutDate) {
      return res(
        ctx.status(200),
        ctx.json({
          code: 4001,
          success: false,
          msg: '参数不完整',
          data: null,
        })
      );
    }

    // 检查床位是否存在
    const beds = await getCollection('bed');
    const bed = beds.find((b: Bed) => b.bedId === bedId);
    if (!bed) {
      return res(
        ctx.status(200),
        ctx.json({
          code: 4002,
          success: false,
          msg: '床位不存在',
          data: null,
        })
      );
    }

    // 检查床位是否被该学员占用
    if (bed.stuId !== stuId) {
      return res(
        ctx.status(200),
        ctx.json({
          code: 4010,
          success: false,
          msg: '床位信息不匹配',
          data: null,
        })
      );
    }

    // 检查学员是否存在
    const students = await getCollection('student');
    const student = students.find((s: Student) => s.stuId === stuId);
    if (!student) {
      return res(
        ctx.status(200),
        ctx.json({
          code: 4004,
          success: false,
          msg: '学员不存在',
          data: null,
        })
      );
    }

    // 更新学员的退房日期和清空床位ID
    updateItem('student', 'stuId', stuId, {
      checkoutDate,
      bedId: null, // 清空床位关联
    });

    // 清空床位的学员ID
    updateItem('bed', 'bedId', bedId, { stuId: null });

    // 更新入住记录状态为已退房
    const checkins = await getCollection('studentCheckin');
    const activeCheckin = (checkins as unknown as StudentCheckin[]).find(
      (c) => c.stuId === stuId && c.status === 1
    );
    if (activeCheckin) {
      updateItem('studentCheckin', 'checkinId', activeCheckin.checkinId, {
        status: 0, // 0表示已退房
      });
    }

    return res(
      ctx.status(200),
      ctx.json({
        code: 200,
        success: true,
        msg: '学员离营成功',
        data: null,
      })
    );
  }),
];

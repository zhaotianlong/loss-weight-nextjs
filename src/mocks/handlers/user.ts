/**
 * 用户/员工相关 MSW handlers
 */
import { rest } from 'msw';
import { getCollection, getById, addItem, updateItem, deleteItem, CollectionItem, mockData, getUserAccount, setUserAccount, setPhoneToEmpId } from '@/mock/mockData';
import { getCurrentUserFromRequest } from '@/utils/getCurrentUserFromRequest';
import { isSuperAdmin } from '@/constants/permissions';
import { hashPassword, encryptPasswordForTransmit, verifyPassword } from '@/utils/password';

type Employee = CollectionItem<'employee'>;

// 管理员角色列表
const ADMIN_ROLES = ['超级管理员', '营地管理员', '后勤管理员', '教练管理员', '招生管理员'];

export const userHandlers = [
  // 用户/员工列表
  rest.get('/api/users', async (req, res, ctx) => {
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
    const phone = req.url.searchParams.get('phone');
    const email = req.url.searchParams.get('email');
    const role = req.url.searchParams.get('role');
    const status = req.url.searchParams.get('status');

    let full = await getCollection('employee');
    
    // 如果不是超级管理员，只返回当前营地的员工
    if (finalCampId) {
      full = full.filter((item: Employee) => {
        const emp = item as Record<string, unknown>;
        return emp.campId === finalCampId;
      });
    }

    // 过滤
    if (name) {
      full = full.filter((item: Employee) => {
        const emp = item as Record<string, unknown>;
        return (emp.name as string)?.toLowerCase().includes(name.toLowerCase());
      });
    }
    if (phone) {
      full = full.filter((item: Employee) => {
        const emp = item as Record<string, unknown>;
        return (emp.phone as string)?.includes(phone);
      });
    }
    if (role) {
      full = full.filter((item: Employee) => {
        const emp = item as Record<string, unknown>;
        return emp.role === role;
      });
    }
    if (status !== null && status !== undefined) {
      full = full.filter((item: Employee) => {
        const emp = item as Record<string, unknown>;
        return emp.status === Number(status);
      });
    }

    const page = Number(req.url.searchParams.get('page')) || 1;
    const pageSize = Number(req.url.searchParams.get('pageSize')) || 20;
    const total = full.length;
    const start = (page - 1) * pageSize;
    const data = full.slice(start, start + pageSize).map((item: Employee) => {
      const emp = item as Record<string, unknown>;
      return {
        userId: emp.empId as string,
        id: emp.empId as string,
        name: emp.name as string,
        phone: emp.phone as string,
        email: emp.email as string,
        role: emp.role as string,
        status: emp.status as number,
        avatar: emp.avatar as string,
        idNumber: emp.idNumber as string,
        address: emp.address as string,
        attachments: (emp.attachments as string[]) || [],
        baseSalary: (emp.baseSalary as number) || 0,
        allowCommission: (emp.allowCommission as boolean) ?? false,
        campId: emp.campId as number,
        createTime: emp.createTime as string,
        updateTime: emp.updateTime as string,
      };
    });
    const meta = { page, pageSize, total, pageCount: Math.ceil(total / pageSize) };
    return res(ctx.status(200), ctx.json({ success: true, data, meta }));
  }),

  // 单个用户
  rest.get('/api/users/:id', async (req, res, ctx) => {
    const id = req.params.id as string;
    const item = await getById('employee', 'empId', id);
    if (!item) return res(ctx.status(404), ctx.json({ success: false, message: 'Not found' }));
    const emp = item as Record<string, unknown>;
    const user = {
      userId: emp.empId as string,
      id: emp.empId as string,
      name: emp.name as string,
      phone: emp.phone as string,
      email: (emp.email as string) || `${emp.empId}@camp.com`, // 如果没有email，生成一个默认的
      role: emp.role as string,
      status: emp.status as number,
      avatar: emp.avatar as string,
      idNumber: emp.idNumber as string,
      address: emp.address as string,
      attachments: (emp.attachments as string[]) || [],
      baseSalary: (emp.baseSalary as number) || 0,
      allowCommission: (emp.allowCommission as boolean) ?? false,
      campId: emp.campId as number,
      createTime: emp.createTime as string,
      updateTime: emp.updateTime as string,
    };
    return res(ctx.status(200), ctx.json({ success: true, data: user }));
  }),

  // 创建用户
  // 生产环境模拟：前端已对管理员密码进行 SHA-256 传输加密，后端接收加密后的密码
  rest.post('/api/users', async (req, res, ctx) => {
    const body = await req.json();
    
    // 获取当前用户信息，用于权限检查和 campId 设置
    const currentUser = await getCurrentUserFromRequest(req);
    if (!currentUser) {
      return res(
        ctx.status(401),
        ctx.json({ success: false, message: '未授权，请先登录' })
      );
    }
    
    // 权限检查：只有超级管理员可以创建管理员角色
    if (body.role && ADMIN_ROLES.includes(body.role)) {
      if (!isSuperAdmin(currentUser.role)) {
        return res(
          ctx.status(403),
          ctx.json({ success: false, message: '只有超级管理员可以创建管理员角色' })
        );
      }
    }
    
    // 确定 campId：超级管理员可以使用传入的 campId，非超级管理员强制使用当前用户的 campId
    let finalCampId = body.campId;
    if (!isSuperAdmin(currentUser.role)) {
      // 非超级管理员必须使用当前用户的 campId
      finalCampId = currentUser.campId || 101;
    } else {
      // 超级管理员可以使用传入的 campId，如果没有则使用默认值
      finalCampId = body.campId || 101;
    }
    
    const newId = `emp${Date.now()}`;
    const newEmployee = {
      empId: newId,
      name: body.name,
      phone: body.phone,
      email: body.email,
      role: body.role,
      campId: finalCampId,
      qualification: body.qualification || '',
      dutyArea: body.dutyArea || '',
      hireDate: new Date().toISOString().split('T')[0],
      status: body.status ?? 1,
      avatar: body.avatar,
      idNumber: body.idNumber,
      address: body.address,
      attachments: body.attachments || [],
      baseSalary: body.baseSalary || 0,
      allowCommission: body.allowCommission ?? false,
    };
    addItem('employee', newEmployee);
    
    // 更新手机号映射（所有员工都需要）
    setPhoneToEmpId(body.phone, newId);
    
    // 如果是管理员角色，需要创建登录账号（账号为手机号）
    // 生产环境模拟：body.password 是前端已加密的 SHA-256 哈希值
    if (ADMIN_ROLES.includes(body.role)) {
      let passwordToHash = body.password;
      if (!passwordToHash) {
        // 如果没有提供密码，使用默认密码并先进行传输加密（模拟前端加密）
        passwordToHash = await encryptPasswordForTransmit('admin123');
      }
      // 对传输加密后的密码进行 PBKDF2 哈希加盐存储
      // 存储格式：PBKDF2(SHA-256(原始密码)) = salt:hash
      const hashedPassword = await hashPassword(passwordToHash);
      setUserAccount(newId, {
        password: hashedPassword,
        role: body.role,
      });
    }
    
    const empRecord = newEmployee as Record<string, unknown>;
    const user = {
      userId: newEmployee.empId,
      id: newEmployee.empId,
      name: newEmployee.name,
      phone: newEmployee.phone,
      email: newEmployee.email || `${newEmployee.empId}@camp.com`,
      role: newEmployee.role,
      status: newEmployee.status,
      avatar: newEmployee.avatar,
      idNumber: newEmployee.idNumber,
      address: newEmployee.address,
      attachments: newEmployee.attachments,
      baseSalary: newEmployee.baseSalary,
      allowCommission: newEmployee.allowCommission,
      createTime: empRecord.createTime as string,
      updateTime: empRecord.updateTime as string,
    };
    return res(ctx.status(200), ctx.json({ success: true, data: user }));
  }),

  // 更新用户
  rest.put('/api/users/:id', async (req, res, ctx) => {
    const id = req.params.id;
    const body = await req.json();
    
    // 权限检查：如果更新角色为管理员角色，只有超级管理员可以操作
    if (body.role && ADMIN_ROLES.includes(body.role)) {
      const currentUser = await getCurrentUserFromRequest(req);
      if (!currentUser) {
        return res(
          ctx.status(401),
          ctx.json({ success: false, message: '未授权，请先登录' })
        );
      }
      if (!isSuperAdmin(currentUser.role)) {
        // 检查是否是在编辑现有的管理员角色
        const existingUser = await getById('employee', 'empId', id);
        if (existingUser && ADMIN_ROLES.includes((existingUser as any).role)) {
          // 如果原角色是管理员，且新角色也是管理员，且不是超级管理员，则不允许修改
          return res(
            ctx.status(403),
            ctx.json({ success: false, message: '只有超级管理员可以修改管理员角色' })
          );
        } else {
          // 如果原角色不是管理员，新角色是管理员，且不是超级管理员，则不允许
          return res(
            ctx.status(403),
            ctx.json({ success: false, message: '只有超级管理员可以将角色修改为管理员角色' })
          );
        }
      }
    }
    
    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.email !== undefined) updateData.email = body.email;
    if (body.role !== undefined) updateData.role = body.role;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.avatar !== undefined) updateData.avatar = body.avatar;
    if (body.idNumber !== undefined) updateData.idNumber = body.idNumber;
    if (body.address !== undefined) updateData.address = body.address;
    if (body.attachments !== undefined) updateData.attachments = body.attachments;
    if (body.baseSalary !== undefined) updateData.baseSalary = body.baseSalary;
    if (body.allowCommission !== undefined) updateData.allowCommission = body.allowCommission;
    
    const updated = updateItem('employee', 'empId', id, updateData);
    if (!updated) return res(ctx.status(404), ctx.json({ success: false, message: 'Not found' }));
    
    // 如果手机号有更新，更新手机号映射
    if (body.phone) {
      setPhoneToEmpId(body.phone, id);
    }
    
    // 如果是管理员角色，需要创建或更新登录账号（账号为手机号）
    // 生产环境模拟：body.password 是前端已加密的 SHA-256 哈希值
    if (body.role && ADMIN_ROLES.includes(body.role)) {
      
      const currentAccount = getUserAccount(id);
      // 如果账号不存在，创建账号；如果存在，更新角色和密码（如果提供了）
      let passwordToSet = currentAccount?.password;
      // 如果提供了新密码，说明前端已经加密过了（SHA-256），我们需要对这个加密值再进行 PBKDF2 哈希
      if (body.password) {
        // body.password 是前端传输加密后的 SHA-256 哈希值
        // 需要再进行 PBKDF2 哈希加盐存储
        passwordToSet = await hashPassword(body.password);
      } else if (!currentAccount) {
        // 如果没有提供密码且账号不存在，使用默认密码并先加密再哈希（模拟前端加密）
        const defaultEncrypted = await encryptPasswordForTransmit('admin123');
        passwordToSet = await hashPassword(defaultEncrypted);
      }
      setUserAccount(id, {
        password: passwordToSet!,
        role: body.role,
      });
    } else if (body.role) {
      // 如果从管理员角色改为普通员工角色，删除登录账号
      
      const currentAccount = getUserAccount(id);
      if (currentAccount && ADMIN_ROLES.includes(currentAccount.role)) {
        // 从 userAccounts 中删除
        delete (mockData.userAccounts as Record<string, unknown>)[id];
      }
    }
    
    // 返回统一格式的用户数据
    const empUpdated = updated as Record<string, unknown>;
    const user = {
      userId: empUpdated.empId as string,
      id: empUpdated.empId as string,
      name: empUpdated.name as string,
      phone: empUpdated.phone as string,
      email: (empUpdated.email as string) || `${empUpdated.empId}@camp.com`,
      role: empUpdated.role as string,
      status: empUpdated.status as number,
      avatar: empUpdated.avatar as string,
      createTime: empUpdated.createTime as string,
      updateTime: empUpdated.updateTime as string,
    };
    return res(ctx.status(200), ctx.json({ success: true, data: user }));
  }),

  // 删除用户
  rest.delete('/api/users/:id', async (req, res, ctx) => {
    const id = req.params.id;
    const deleted = deleteItem('employee', 'empId', id);
    if (!deleted) return res(ctx.status(404), ctx.json({ success: false, message: 'Not found' }));
    return res(ctx.status(200), ctx.json({ success: true, message: 'Deleted' }));
  }),

  // 修改密码
  // 修改密码（用户自己修改密码）
  // 生产环境模拟：前端已对密码进行 SHA-256 传输加密，后端接收加密后的密码
  rest.post('/api/users/:id/change-password', async (req, res, ctx) => {
    const id = req.params.id;
    const body = await req.json();
    const { oldPassword, newPassword } = body;

    // 验证参数
    if (!oldPassword || !newPassword) {
      return res(
        ctx.status(400),
        ctx.json({ success: false, message: '原密码和新密码不能为空' })
      );
    }

    // 注意：前端已对密码进行 SHA-256 加密，这里的 newPassword 是加密后的值
    // 长度检查应该基于加密后的哈希值（通常是64个十六进制字符）
    // 但为了兼容性，这里不做长度检查（因为前端已经验证过原始密码长度）

    // 获取当前用户账号
    
    
    const account = getUserAccount(id);
    
    if (!account) {
      return res(
        ctx.status(404),
        ctx.json({ success: false, message: '用户账号不存在' })
      );
    }

    // 验证原密码（oldPassword 是前端加密后的 SHA-256 哈希值）
    // 存储的密码格式：PBKDF2(SHA-256(原始密码)) = salt:hash
    const isOldPasswordValid = await verifyPassword(oldPassword, account.password);
    if (!isOldPasswordValid) {
      return res(
        ctx.status(400),
        ctx.json({ success: false, message: '原密码错误' })
      );
    }

    // 更新为新密码
    // newPassword 是前端加密后的 SHA-256 哈希值，需要再进行 PBKDF2 哈希加盐存储
    const hashedNewPassword = await hashPassword(newPassword);
    setUserAccount(id, {
      password: hashedNewPassword,
      role: account.role,
    });

    return res(
      ctx.status(200),
      ctx.json({ success: true, message: '密码修改成功' })
    );
  }),

  // 重置密码（管理员重置其他管理员密码）
  // 生产环境模拟：前端已对密码进行 SHA-256 传输加密，后端接收加密后的密码
  rest.post('/api/users/:id/reset-password', async (req, res, ctx) => {
    const id = req.params.id;
    const body = await req.json();
    const { newPassword } = body;

    // 验证参数
    if (!newPassword) {
      return res(
        ctx.status(400),
        ctx.json({ success: false, message: '新密码不能为空' })
      );
    }

    // 注意：前端已对密码进行 SHA-256 加密，这里的 newPassword 是加密后的值
    // 长度检查应该基于加密后的哈希值（通常是64个十六进制字符）
    // 但为了兼容性，这里不做长度检查（因为前端已经验证过原始密码长度）

    // 获取当前用户信息
    const currentUser = await getCurrentUserFromRequest(req);
    if (!currentUser) {
      return res(
        ctx.status(401),
        ctx.json({ success: false, message: '未授权，请先登录' })
      );
    }

    // 获取目标用户信息
    const targetUser = await getById('employee', 'empId', id);
    if (!targetUser) {
      return res(
        ctx.status(404),
        ctx.json({ success: false, message: '用户不存在' })
      );
    }

    // 权限检查：只有管理员角色才能重置密码
    if (!ADMIN_ROLES.includes((targetUser as any).role)) {
      return res(
        ctx.status(403),
        ctx.json({ success: false, message: '只能重置管理员角色的密码' })
      );
    }

    // 权限检查：超级管理员可以重置任何人密码，营地管理员只能重置自己营地的人员密码
    const currentUserRole = currentUser.role;
    const targetUserCampId = (targetUser as any).campId;
    
    if (currentUserRole === '超级管理员') {
      // 超级管理员可以重置任何人密码
    } else if (currentUserRole === '营地管理员') {
      // 营地管理员只能重置自己营地的人员密码
      if (currentUser.campId !== targetUserCampId) {
        return res(
          ctx.status(403),
          ctx.json({ success: false, message: '只能重置自己营地的人员密码' })
        );
      }
    } else {
      // 其他管理员只能重置自己的密码
      if (currentUser.empId !== id) {
        return res(
          ctx.status(403),
          ctx.json({ success: false, message: '只能重置自己的密码' })
        );
      }
    }

    // 更新密码（需要哈希加盐）
    
    
    const currentAccount = getUserAccount(id);
    if (!currentAccount) {
      return res(
        ctx.status(404),
        ctx.json({ success: false, message: '该用户账号不存在' })
      );
    }

    // 生产环境模拟：前端已经对密码进行了传输加密（SHA-256）
    // newPassword 是前端传输加密后的 SHA-256 哈希值
    // 需要再进行 PBKDF2 哈希加盐存储
    // 存储格式：PBKDF2(SHA-256(原始密码)) = salt:hash
    const hashedPassword = await hashPassword(newPassword);
    setUserAccount(id, {
      password: hashedPassword,
      role: currentAccount.role,
    });

    // 重置密码后，使token失效（通过返回特殊标识，前端可以处理）
    // 注意：在实际项目中，应该在服务端维护token黑名单或修改用户信息触发token失效
    // 这里简化处理，只是返回成功，前端可以提示用户重新登录

    return res(
      ctx.status(200),
      ctx.json({ 
        success: true, 
        message: '密码重置成功，该用户需要重新登录',
        data: { tokenExpired: true } // 标识token需要失效
      })
    );
  }),

  // 上传头像
  rest.post('/api/users/:id/avatar', async (req, res, ctx) => {
    const id = req.params.id;
    
    // 验证用户是否存在
    const item = await getById('employee', 'empId', id);
    if (!item) {
      return res(
        ctx.status(404),
        ctx.json({ success: false, message: '用户不存在' })
      );
    }

    // 模拟文件上传，返回一个头像 URL
    // 实际项目中，这里应该将文件保存到文件存储服务（如 OSS、S3 等）
    // 并返回文件的访问 URL
    // 使用时间戳确保每次上传返回不同的 URL（模拟真实场景）
    const avatarUrl = `https://gw.alipayobjects.com/zos/antfincdn/efFD%24IOql2/weixintupian_20170331104822.jpg?t=${Date.now()}`;
    
    // 更新用户头像（在实际项目中，这应该更新数据库）
    // 注意：这里只是模拟，实际应该持久化到数据库
    (item as any).avatar = avatarUrl;
    
    return res(
      ctx.status(200),
      ctx.json({ success: true, data: avatarUrl, message: '头像上传成功' })
    );
  }),
];

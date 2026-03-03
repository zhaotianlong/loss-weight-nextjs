/**
 * 认证相关 MSW handlers
 */
import { rest } from 'msw';
import { getById, getUserAccount, getEmpIdByPhone } from '@/mock/mockData';

// 模拟验证码存储（实际应该存储在服务器）
const codeStore = new Map<string, { code: string; expireTime: number }>();

// 生成6位验证码
function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export const authHandlers = [
  // 账号密码登录
  // 生产环境模拟：前端已对密码进行 SHA-256 传输加密，后端接收加密后的密码
  rest.post('/api/auth/login', async (req, res, ctx) => {
    const body = await req.json();
    const { username, phone, password } = body;

    if (!password) {
      return res(
        ctx.status(400),
        ctx.json({ success: false, message: '密码不能为空' })
      );
    }

    // 通过账号或手机号查找用户
    let empId: string | null = null;
    if (username) {
      // 账号登录：账号就是 empId
      empId = username;
    } else if (phone) {
      // 手机号登录
      empId = getEmpIdByPhone(phone) || null;
    }

    if (!empId) {
      return res(
        ctx.status(401),
        ctx.json({ success: false, message: '账号或手机号不存在' })
      );
    }

    // 验证密码
    const account = getUserAccount(empId);
    if (!account) {
      return res(
        ctx.status(401),
        ctx.json({ success: false, message: '账号不存在' })
      );
    }
    
    // 生产环境模拟：前端已经对密码进行了传输加密（SHA-256）
    // password 参数是前端传输加密后的 SHA-256 哈希值
    // 存储的密码格式：PBKDF2(SHA-256(原始密码)) = salt:hash
    // 验证流程：对前端加密值进行 PBKDF2 哈希，然后与存储值比较
    const { verifyPassword } = await import('@/utils/password');
    const isValid = await verifyPassword(password, account.password);
    if (!isValid) {
      return res(
        ctx.status(401),
        ctx.json({ success: false, message: '密码错误' })
      );
    }

    // 获取用户信息
    const employee = await getById('employee', 'empId', empId);
    if (!employee) {
      return res(
        ctx.status(404),
        ctx.json({ success: false, message: '用户不存在' })
      );
    }

    // 获取用户所属营地信息
    const campId = (employee as any).campId;
    let campName: string | undefined;
    if (campId) {
      const camp = await getById('camp', 'campId', campId);
      if (camp) {
        campName = (camp as any).campName;
      }
    }

    // 生成 token（实际应该使用 JWT）
    const token = `mock_token_${empId}_${Date.now()}`;

    const user = {
      userId: (employee as any).empId,
      id: (employee as any).empId,
      name: (employee as any).name,
      phone: (employee as any).phone,
      email: (employee as any).email || `${(employee as any).empId}@camp.com`,
      role: (employee as any).role,
      status: (employee as any).status,
      avatar: (employee as any).avatar,
      campId: campId || undefined,
      campName: campName || undefined,
    };

    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: {
          token,
          user,
        },
      })
    );
  }),

  // 手机号验证码登录
  rest.post('/api/auth/login-by-code', async (req, res, ctx) => {
    const body = await req.json();
    const { phone, code } = body;

    if (!phone || !code) {
      return res(
        ctx.status(400),
        ctx.json({ success: false, message: '手机号和验证码不能为空' })
      );
    }

    // 验证手机号格式
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      return res(
        ctx.status(400),
        ctx.json({ success: false, message: '手机号格式不正确' })
      );
    }

    // 验证验证码
    const storedCode = codeStore.get(phone);
    if (!storedCode || storedCode.code !== code) {
      return res(
        ctx.status(401),
        ctx.json({ success: false, message: '验证码错误或已过期' })
      );
    }

    // 检查验证码是否过期（5分钟）
    if (Date.now() > storedCode.expireTime) {
      codeStore.delete(phone);
      return res(
        ctx.status(401),
        ctx.json({ success: false, message: '验证码已过期' })
      );
    }

    // 通过手机号查找用户
    const empId = getEmpIdByPhone(phone);
    if (!empId) {
      return res(
        ctx.status(404),
        ctx.json({ success: false, message: '该手机号未注册' })
      );
    }

    // 获取用户信息
    const employee = await getById('employee', 'empId', empId);
    if (!employee) {
      return res(
        ctx.status(404),
        ctx.json({ success: false, message: '用户不存在' })
      );
    }

    // 获取用户所属营地信息
    const campId = (employee as any).campId;
    let campName: string | undefined;
    if (campId) {
      const camp = await getById('camp', 'campId', campId);
      if (camp) {
        campName = (camp as any).campName;
      }
    }

    // 生成 token
    const token = `mock_token_${empId}_${Date.now()}`;

    // 清除验证码
    codeStore.delete(phone);

    const user = {
      userId: (employee as any).empId,
      id: (employee as any).empId,
      name: (employee as any).name,
      phone: (employee as any).phone,
      email: (employee as any).email || `${(employee as any).empId}@camp.com`,
      role: (employee as any).role,
      status: (employee as any).status,
      avatar: (employee as any).avatar,
      campId: campId || undefined,
      campName: campName || undefined,
    };

    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: {
          token,
          user,
        },
      })
    );
  }),

  // 发送验证码
  rest.post('/api/auth/send-code', async (req, res, ctx) => {
    const body = await req.json();
    const { phone } = body;

    if (!phone) {
      return res(
        ctx.status(400),
        ctx.json({ success: false, message: '手机号不能为空' })
      );
    }

    // 验证手机号格式
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      return res(
        ctx.status(400),
        ctx.json({ success: false, message: '手机号格式不正确' })
      );
    }

    // 检查手机号是否已注册
    if (!getEmpIdByPhone(phone)) {
      return res(
        ctx.status(404),
        ctx.json({ success: false, message: '该手机号未注册' })
      );
    }

    // 生成验证码
    const code = generateCode();
    const expireTime = Date.now() + 5 * 60 * 1000; // 5分钟过期

    // 存储验证码
    codeStore.set(phone, { code, expireTime });

    // 开发环境返回验证码（实际应该通过短信发送）
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: { code }, // 开发环境返回验证码，生产环境不返回
        message: '验证码已发送',
      })
    );
  }),

  // 退出登录
  rest.post('/api/auth/logout', async (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({ success: true, message: '退出登录成功' })
    );
  }),

  // 刷新 token
  rest.post('/api/auth/refresh', async (req, res, ctx) => {
    // 从请求头获取 token
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res(
        ctx.status(401),
        ctx.json({ success: false, message: '未授权' })
      );
    }

    const oldToken = authHeader.replace('Bearer ', '');
    // 从 token 中提取 empId（实际应该解析 JWT）
    const match = oldToken.match(/mock_token_(\w+)_/);
    if (!match) {
      return res(
        ctx.status(401),
        ctx.json({ success: false, message: '无效的 token' })
      );
    }

    const empId = match[1];
    const newToken = `mock_token_${empId}_${Date.now()}`;

    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: { token: newToken },
      })
    );
  }),

  // 通过 token 获取当前用户信息
  rest.get('/api/auth/me', async (req, res, ctx) => {
    // 从请求头获取 token
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res(
        ctx.status(401),
        ctx.json({ success: false, message: '未授权，请先登录' })
      );
    }

    const token = authHeader.replace('Bearer ', '');
    // 从 token 中提取 empId（实际应该解析 JWT）
    const match = token.match(/mock_token_(\w+)_/);
    if (!match) {
      return res(
        ctx.status(401),
        ctx.json({ success: false, message: '无效的 token' })
      );
    }

    const empId = match[1];

    // 获取用户信息
    const employee = await getById('employee', 'empId', empId);
    if (!employee) {
      return res(
        ctx.status(404),
        ctx.json({ success: false, message: '用户不存在' })
      );
    }

    // 获取用户所属营地信息
    const campId = (employee as any).campId;
    let campName: string | undefined;
    if (campId) {
      const camp = await getById('camp', 'campId', campId);
      if (camp) {
        campName = (camp as any).campName;
      }
    }

    const user = {
      userId: (employee as any).empId,
      id: (employee as any).empId,
      name: (employee as any).name,
      phone: (employee as any).phone,
      email: (employee as any).email || `${(employee as any).empId}@camp.com`,
      role: (employee as any).role,
      status: (employee as any).status,
      avatar: (employee as any).avatar,
      campId: campId || undefined,
      campName: campName || undefined,
    };

    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: user,
      })
    );
  }),
];


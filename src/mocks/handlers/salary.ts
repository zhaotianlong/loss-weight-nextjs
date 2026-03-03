import { rest } from 'msw';
import { getCollection, addItem, updateItem, deleteItem, mockData } from '@/mock/mockData';
import { getCurrentUserFromRequest } from '@/utils/getCurrentUserFromRequest';
import { isSuperAdmin } from '@/constants/permissions';

interface Gradient {
  threshold: number;
  rate: number;
}

// 计算梯度提成
const calculateCommission = (amount: number, gradients: Gradient[] | undefined) => {
  if (!gradients || gradients.length === 0) return { commission: 0, rate: 0 };
  // 按阈值降序排列，找到匹配的最大阈值
  const sorted = [...gradients].sort((a, b) => b.threshold - a.threshold);
  const matched = sorted.find(g => amount >= g.threshold);
  const rate = matched ? matched.rate : 0;
  return { commission: amount * rate, rate };
};

export const salaryHandlers = [
  // 获取提成策略
  rest.get('/api/salary/strategies', async (req, res, ctx) => {
    const month = req.url.searchParams.get('month');
    const role = req.url.searchParams.get('role');
    
    let strategies = await getCollection('commissionStrategies');
    if (month) strategies = strategies.filter(s => s.month === month);
    if (role) strategies = strategies.filter(s => s.role === role);
    
    return res(ctx.status(200), ctx.json({ success: true, data: strategies }));
  }),

  // 保存提成策略
  rest.post('/api/salary/strategies', async (req, res, ctx) => {
    const body = await req.json();
    if (body.id) {
      updateItem('commissionStrategies', 'id', body.id, { ...body, updateTime: new Date().toISOString() });
    } else {
      addItem('commissionStrategies', {
        ...body,
        id: Date.now(),
        createTime: new Date().toISOString(),
        updateTime: new Date().toISOString()
      });
    }
    return res(ctx.status(200), ctx.json({ success: true }));
  }),

  // 删除提成策略
  rest.delete('/api/salary/strategies/:id', async (req, res, ctx) => {
    const id = Number(req.params.id);
    deleteItem('commissionStrategies', 'id', id);
    return res(ctx.status(200), ctx.json({ success: true }));
  }),

  // 获取工资列表
  rest.get('/api/salary/list', async (req, res, ctx) => {
    const currentUser = await getCurrentUserFromRequest(req);
    const campId = req.url.searchParams.get('campId') ? Number(req.url.searchParams.get('campId')) : undefined;
    const month = req.url.searchParams.get('month');

    let finalCampId = campId;
    if (currentUser && !isSuperAdmin(currentUser.role)) {
      finalCampId = currentUser.campId;
    }

    const employees = await getCollection('employee', {
      filter: (emp) => !finalCampId || emp.campId === finalCampId
    });

    const tuitions = await getCollection('tuition');
    const privateOrders = await getCollection('stuPrivateOrders');
    const salaryRecords = await getCollection('salaryRecords');
    const students = await getCollection('student');
    const strategies = await getCollection('commissionStrategies');
    const studentMap = new Map(students.map(s => [s.stuId, s]));

    // 汇总所有月份或指定月份
    const months = month ? [month] : Array.from(new Set([
      ...tuitions.map(t => t.date.slice(0, 7)),
      ...privateOrders.map(o => o.orderTime.slice(0, 7)),
      ...salaryRecords.map(s => s.month)
    ])).sort().reverse();

    const result = months.map(m => {
      const details = employees.map(emp => {
        const recruitmentActual = tuitions
          .filter(t => 
            t.salespersonId === emp.empId && 
            t.date.startsWith(m) && 
            t.source.includes('入住') &&
            (t.status === 'paid' || t.status === 3)
          )
          .reduce((sum, t) => sum + Number(t.amount || 0), 0);

        const privateCoachingActual = privateOrders
          .filter(o => {
            const student = studentMap.get(o.stuId);
            return o.bookingCoachId === emp.empId && 
              o.orderTime.startsWith(m) &&
              (o.status === '已完成' || o.status === '上课中') &&
              (!finalCampId || student?.campId === finalCampId);
          })
          .reduce((sum, o) => sum + Number(o.totalPrice || 0), 0);

        const renewalActual = tuitions
          .filter(t => 
            t.salespersonId === emp.empId && 
            t.date.startsWith(m) && 
            t.source.includes('续住') &&
            (t.status === 'paid' || t.status === 3)
          )
          .reduce((sum, t) => sum + Number(t.amount || 0), 0);

        // 获取该岗位该月的提成策略
        const empStrategies = strategies.filter(s => s.month === m && s.role === emp.role);
        const recruitmentStrategy = empStrategies.find(s => s.type === 'recruitment');
        const privateStrategy = empStrategies.find(s => s.type === 'privateCoaching');
        const renewalStrategy = empStrategies.find(s => s.type === 'renewal');

        const recruitmentResult = emp.allowCommission ? calculateCommission(recruitmentActual, recruitmentStrategy?.gradients) : { commission: 0, rate: 0 };
        const privateResult = emp.allowCommission ? calculateCommission(privateCoachingActual, privateStrategy?.gradients) : { commission: 0, rate: 0 };
        const renewalResult = emp.allowCommission ? calculateCommission(renewalActual, renewalStrategy?.gradients) : { commission: 0, rate: 0 };

        const commRecruitment = Number(recruitmentResult.commission || 0);
        const commPrivate = Number(privateResult.commission || 0);
        const commRenewal = Number(renewalResult.commission || 0);

        const manualRecord = salaryRecords.find(s => s.empId === emp.empId && s.month === m);
        const other = Number(manualRecord?.other || 0);
        const remark = manualRecord?.remark || '';
        const baseSalary = Number((emp as Record<string, unknown>).baseSalary || 0);

        const totalCommission = commRecruitment + commPrivate + commRenewal;
        const totalSalary = baseSalary + totalCommission + other;

        return {
          empId: emp.empId,
          empName: emp.name,
          role: emp.role,
          allowCommission: emp.allowCommission,
          baseSalary: baseSalary,
          commissions: {
            recruitment: commRecruitment,
            privateCoaching: commPrivate,
            renewal: commRenewal
          },
          performance: {
            recruitment: { actual: recruitmentActual, rate: recruitmentResult.rate },
            privateCoaching: { actual: privateCoachingActual, rate: privateResult.rate },
            renewal: { actual: renewalActual, rate: renewalResult.rate }
          },
          other: other,
          totalSalary: totalSalary,
          remark
        };
      }).filter(d => (d.totalSalary || 0) > 0 || (d.baseSalary || 0) > 0);

      const totalBase = details.reduce((sum, d) => sum + Number(d.baseSalary || 0), 0);
      const totalCommission = details.reduce((sum, d) => {
        const c = d.commissions;
        return sum + Number(c.recruitment || 0) + Number(c.privateCoaching || 0) + Number(c.renewal || 0);
      }, 0);
      const totalOther = details.reduce((sum, d) => sum + Number(d.other || 0), 0);
      const totalAmount = totalBase + totalCommission + totalOther;

      return {
        month: m,
        campId: finalCampId,
        totalAmount: Number(totalAmount || 0),
        totalBase: Number(totalBase || 0),
        totalCommission: Number(totalCommission || 0),
        totalOther: Number(totalOther || 0),
        details
      };
    }).filter(r => (r.totalAmount || 0) > 0);

    return res(ctx.status(200), ctx.json({ success: true, data: result }));
  }),

  // 更新或新增工资其他项
  rest.post('/api/salary/other', async (req, res, ctx) => {
    const body = await req.json();
    const { empId, month, other, remark, campId } = body;

    const existing = mockData.salaryRecords.find(s => s.empId === empId && s.month === month);
    if (existing) {
      updateItem('salaryRecords', 'id', existing.id, { other, remark, updateTime: new Date().toISOString() });
    } else {
      addItem('salaryRecords', {
        id: Date.now(),
        empId,
        month,
        other,
        remark,
        campId,
        createTime: new Date().toISOString(),
        updateTime: new Date().toISOString()
      });
    }

    return res(ctx.status(200), ctx.json({ success: true }));
  }),
];

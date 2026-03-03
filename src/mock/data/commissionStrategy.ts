export interface CommissionGradient {
  threshold: number; // 金额阈值
  rate: number; // 提成比例 (如 0.05)
}

export interface CommissionStrategy {
  id: number;
  month: string; // YYYY-MM
  role: string; // 关联岗位，如 '教练', '教练管理员'
  type: 'recruitment' | 'privateCoaching' | 'renewal'; // 招生、私教、续住
  gradients: CommissionGradient[];
  createTime: string;
  updateTime: string;
}

export const commissionStrategies: CommissionStrategy[] = [
  // 2026-01 教练招生提成策略：0-50000 5%, 50000以上 8%
  {
    id: 1,
    month: '2026-01',
    role: '教练',
    type: 'recruitment',
    gradients: [
      { threshold: 0, rate: 0.05 },
      { threshold: 50000, rate: 0.08 },
    ],
    createTime: '2026-01-01T00:00:00.000Z',
    updateTime: '2026-01-01T00:00:00.000Z',
  },
  // 2026-01 教练管理员招生提成策略：固定 5%
  {
    id: 2,
    month: '2026-01',
    role: '教练管理员',
    type: 'recruitment',
    gradients: [
      { threshold: 0, rate: 0.05 },
    ],
    createTime: '2026-01-01T00:00:00.000Z',
    updateTime: '2026-01-01T00:00:00.000Z',
  },
  // 私教提成策略：固定 10%
  {
    id: 3,
    month: '2026-01',
    role: '教练',
    type: 'privateCoaching',
    gradients: [
      { threshold: 0, rate: 0.1 },
    ],
    createTime: '2026-01-01T00:00:00.000Z',
    updateTime: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 4,
    month: '2026-01',
    role: '教练管理员',
    type: 'privateCoaching',
    gradients: [
      { threshold: 0, rate: 0.1 },
    ],
    createTime: '2026-01-01T00:00:00.000Z',
    updateTime: '2026-01-01T00:00:00.000Z',
  },
  // 续住提成策略：固定 3%
  {
    id: 5,
    month: '2026-01',
    role: '教练',
    type: 'renewal',
    gradients: [
      { threshold: 0, rate: 0.03 },
    ],
    createTime: '2026-01-01T00:00:00.000Z',
    updateTime: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 6,
    month: '2026-01',
    role: '教练管理员',
    type: 'renewal',
    gradients: [
      { threshold: 0, rate: 0.03 },
    ],
    createTime: '2026-01-01T00:00:00.000Z',
    updateTime: '2026-01-01T00:00:00.000Z',
  },
];

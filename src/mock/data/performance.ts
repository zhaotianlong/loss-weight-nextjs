export interface CoachPerformanceStats {
  id: number;
  coachId: string;
  coursesToComplete: number;
  coursesSold: number;
  rating: number;
}

export interface CoachMonthlyPerformance {
  id: number;
  coachId: string;
  month: string;
  count: number;
}

export interface PerformanceRanking {
  id: number;
  name: string;
  amount: number;
  rank: number;
}

export interface PerformanceGoal {
  id: number;
  campId: number;
  coachId: string;
  coachName: string;
  month: string; // YYYY-MM
  recruitmentGoal: number; // 招生目标（金额）
  privateCoachingGoal: number; // 私教目标（金额）
  renewalGoal: number; // 续住目标（金额或百分比）
  renewalType: 'amount' | 'percentage';
  createTime: string;
  updateTime: string;
}

export const performanceGoals: PerformanceGoal[] = [
  {
    id: 1,
    campId: 101,
    coachId: 'emp002',
    coachName: '李强',
    month: '2026-01',
    recruitmentGoal: 50000,
    privateCoachingGoal: 20000,
    renewalGoal: 10000,
    renewalType: 'amount',
    createTime: '2026-01-01T00:00:00.000Z',
    updateTime: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 2,
    campId: 101,
    coachId: 'emp003',
    coachName: '王丽',
    month: '2026-01',
    recruitmentGoal: 40000,
    privateCoachingGoal: 15000,
    renewalGoal: 10,
    renewalType: 'percentage',
    createTime: '2026-01-01T00:00:00.000Z',
    updateTime: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 3,
    campId: 101,
    coachId: 'emp002',
    coachName: '李强',
    month: '2025-12',
    recruitmentGoal: 60000,
    privateCoachingGoal: 25000,
    renewalGoal: 15000,
    renewalType: 'amount',
    createTime: '2025-12-01T00:00:00.000Z',
    updateTime: '2025-12-01T00:00:00.000Z',
  },
  {
    id: 4,
    campId: 101,
    coachId: 'emp003',
    coachName: '王丽',
    month: '2025-12',
    recruitmentGoal: 45000,
    privateCoachingGoal: 20000,
    renewalGoal: 12000,
    renewalType: 'amount',
    createTime: '2025-12-01T00:00:00.000Z',
    updateTime: '2025-12-01T00:00:00.000Z',
  },
  {
    id: 5,
    campId: 101,
    coachId: 'emp002',
    coachName: '李强',
    month: '2025-11',
    recruitmentGoal: 50000,
    privateCoachingGoal: 20000,
    renewalGoal: 10000,
    renewalType: 'amount',
    createTime: '2025-11-01T00:00:00.000Z',
    updateTime: '2025-11-01T00:00:00.000Z',
  },
  {
    id: 6,
    campId: 101,
    coachId: 'emp003',
    coachName: '王丽',
    month: '2025-11',
    recruitmentGoal: 40000,
    privateCoachingGoal: 15000,
    renewalGoal: 8000,
    renewalType: 'amount',
    createTime: '2025-11-01T00:00:00.000Z',
    updateTime: '2025-11-01T00:00:00.000Z',
  }
];

export const performanceStats: CoachPerformanceStats[] = [
  {
    id: 1,
    coachId: 'emp002', // 李强
    coursesToComplete: 12,
    coursesSold: 45,
    rating: 4.8,
  },
  {
    id: 2,
    coachId: 'emp003', // 王丽
    coursesToComplete: 8,
    coursesSold: 38,
    rating: 4.9,
  },
];

export const coachMonthlyPerformance: CoachMonthlyPerformance[] = [
  // 李强 (emp002)
  { id: 1, coachId: 'emp002', month: '1月', count: 5 },
  { id: 2, coachId: 'emp002', month: '2月', count: 8 },
  { id: 3, coachId: 'emp002', month: '3月', count: 12 },
  { id: 4, coachId: 'emp002', month: '4月', count: 7 },
  { id: 5, coachId: 'emp002', month: '5月', count: 15 },
  { id: 6, coachId: 'emp002', month: '6月', count: 10 },
  { id: 7, coachId: 'emp002', month: '7月', count: 9 },
  { id: 8, coachId: 'emp002', month: '8月', count: 11 },
  { id: 9, coachId: 'emp002', month: '9月', count: 6 },
  { id: 10, coachId: 'emp002', month: '10月', count: 14 },
  { id: 11, coachId: 'emp002', month: '11月', count: 13 },
  { id: 12, coachId: 'emp002', month: '12月', count: 18 },
  // 王丽 (emp003)
  { id: 13, coachId: 'emp003', month: '1月', count: 4 },
  { id: 14, coachId: 'emp003', month: '2月', count: 6 },
  { id: 15, coachId: 'emp003', month: '3月', count: 10 },
  { id: 16, coachId: 'emp003', month: '4月', count: 5 },
  { id: 17, coachId: 'emp003', month: '5月', count: 12 },
  { id: 18, coachId: 'emp003', month: '6月', count: 8 },
  { id: 19, coachId: 'emp003', month: '7月', count: 7 },
  { id: 20, coachId: 'emp003', month: '8月', count: 9 },
  { id: 21, coachId: 'emp003', month: '9月', count: 5 },
  { id: 22, coachId: 'emp003', month: '10月', count: 11 },
  { id: 23, coachId: 'emp003', month: '11月', count: 10 },
  { id: 24, coachId: 'emp003', month: '12月', count: 14 },
];

export const performanceRankings: PerformanceRanking[] = [
  { id: 1, name: '李强', amount: 125000, rank: 1 },
  { id: 2, name: '王丽', amount: 118000, rank: 2 },
  { id: 3, name: '张伟', amount: 105000, rank: 3 },
  { id: 4, name: '刘洋', amount: 98000, rank: 4 },
  { id: 5, name: '陈明', amount: 92000, rank: 5 },
  { id: 6, name: '赵刚', amount: 88000, rank: 6 },
  { id: 7, name: '孙颖', amount: 85000, rank: 7 },
  { id: 8, name: '周杰', amount: 82000, rank: 8 },
  { id: 9, name: '吴磊', amount: 78000, rank: 9 },
  { id: 10, name: '郑洁', amount: 75000, rank: 10 },
];

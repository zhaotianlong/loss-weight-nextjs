export interface SalaryRecord {
  id: number;
  empId: string;
  month: string; // YYYY-MM
  campId: number;
  baseSalary: number;
  commissions: {
    recruitment: number;
    privateCoaching: number;
    renewal: number;
  };
  other: number;
  remark?: string;
  createTime: string;
  updateTime: string;
}

// 存储手动调整的其他项或备注
export const salaryRecords: SalaryRecord[] = [
  {
    id: 1,
    empId: 'emp002',
    month: '2026-01',
    campId: 101,
    baseSalary: 8000,
    commissions: {
      recruitment: 450,
      privateCoaching: 0,
      renewal: 90,
    },
    other: 500,
    remark: '年终奖金部分发放',
    createTime: '2026-01-20T10:00:00.000Z',
    updateTime: '2026-01-20T10:00:00.000Z',
  },
];

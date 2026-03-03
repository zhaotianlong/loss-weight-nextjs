import { http } from '@/lib/request';

export interface SalaryDetail {
  empId: string;
  empName: string;
  role: string;
  allowCommission: boolean;
  baseSalary: number;
  commissions: {
    recruitment: number;
    privateCoaching: number;
    renewal: number;
  };
  performance?: {
    recruitment: { actual: number; rate: number };
    privateCoaching: { actual: number; rate: number };
    renewal: { actual: number; rate: number };
  };
  other: number;
  totalSalary: number;
  remark?: string;
}

export interface MonthlySalary {
  month: string;
  campId: number;
  totalAmount: number;
  totalBase: number;
  totalCommission: number;
  totalOther: number;
  details: SalaryDetail[];
  strategyApplied?: string; // 显示应用的规则摘要
}

export interface CommissionGradient {
  threshold: number;
  rate: number;
}

export interface CommissionStrategy {
  id: number;
  month: string;
  role: string;
  type: 'recruitment' | 'privateCoaching' | 'renewal';
  gradients: CommissionGradient[];
}

export const getSalaryList = (params: { campId?: number; month?: string }) => {
  return http.get<MonthlySalary[]>('/salary/list', { params });
};

export const updateSalaryOther = (data: { empId: string; month: string; other: number; remark?: string; campId: number }) => {
  return http.post<void>('/salary/other', data);
};

export const deleteSalaryRecord = (id: number) => {
  return http.delete<void>(`/salary/${id}`);
};

export const getCommissionStrategies = (params: { month?: string; role?: string }) => {
  return http.get<CommissionStrategy[]>('/salary/strategies', { params });
};

export const saveCommissionStrategy = (data: CommissionStrategy) => {
  return http.post<void>('/salary/strategies', data);
};

export const deleteCommissionStrategy = (id: number) => {
  return http.delete<void>(`/salary/strategies/${id}`);
};

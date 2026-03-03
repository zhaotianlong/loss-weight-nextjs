// 导入所有数据文件
import { camp } from './data/camp';
import { campRoomType } from './data/campRoomType';
import { room } from './data/room';
import { bed } from './data/bed';
import { employee } from './data/employee';
import { userAccounts } from './data/userAccounts';
import { phoneToEmpId } from './data/phoneToEmpId';
import { student } from './data/student';
import { campFeeStandard } from './data/campFeeStandard';
import { studentCheckin } from './data/studentCheckin';
import { privateCourse, privateCourseCoachRelations } from './data/privateCourse';
import { stuPrivateOrders } from './data/stuPrivateOrders';
import { stuClassRecords } from './data/stuPrivateRecord';
import { course, courseCoachRelations } from './data/course';
import { stuBodyData } from './data/stuBodyData';
import { recipe } from './data/recipe';
import { tuition } from './data/tuition';
import { renewal } from './data/renewal';
import { duty } from './data/duty';
import { salaryRecords } from './data/salary';
import { commissionStrategies } from './data/commissionStrategy';
import { facilities } from './data/facility';
import { coachStudentRelations } from './data/coachStudent';
import { 
  performanceStats, 
  performanceRankings, 
  coachMonthlyPerformance,
  performanceGoals
} from './data/performance';

// 组合所有数据
export const mockData = {
  camp,
  campRoomType,
  room,
  bed,
  employee,
  userAccounts,
  phoneToEmpId,
  student,
  campFeeStandard,
  studentCheckin,
  privateCourse,
  privateCourseCoachRelations,
  course,
  courseCoachRelations,
  stuBodyData,
  recipe,
  tuition,
    renewal,
    duty,
    salaryRecords,
    commissionStrategies,
    facility: facilities,
    coachStudentRelations,
    performanceStats,
  performanceRankings,
  coachMonthlyPerformance,
  performanceGoals,
  stuPrivateOrders,
  stuClassRecords,
};

export type CollectionName = keyof typeof mockData;

export type CollectionItem<K extends CollectionName> = (typeof mockData)[K] extends Array<infer U> ? U : unknown;

export async function getCollection<K extends CollectionName>(
  name: K,
  options?: { page?: number; pageSize?: number; filter?: (item: CollectionItem<K>) => boolean; delayMs?: number }
): Promise<CollectionItem<K>[]> {
  const list = ((mockData as unknown) as Record<string, unknown[]>)[name] as CollectionItem<K>[];
  let filtered = options?.filter ? (list.filter(options.filter as (item: CollectionItem<K>) => boolean) as CollectionItem<K>[]) : list.slice();
  
  // 默认按照 updateTime 降序排列
  filtered = filtered.sort((a, b) => {
    const timeA = (a as { updateTime?: string }).updateTime ? new Date((a as { updateTime?: string }).updateTime!).getTime() : 0;
    const timeB = (b as { updateTime?: string }).updateTime ? new Date((b as { updateTime?: string }).updateTime!).getTime() : 0;
    return timeB - timeA;
  });

  const page = options?.page ?? 1;
  const pageSize = options?.pageSize ?? 1000;
  const start = (page - 1) * pageSize;
  const result = filtered.slice(start, start + pageSize);
  if (options?.delayMs) await new Promise((r) => setTimeout(r, options.delayMs));
  return result;
}

export async function getById<K extends CollectionName, T = CollectionItem<K>>(
  name: K,
  idField: keyof T | string,
  idValue: unknown,
  delayMs = 100
): Promise<T | undefined> {
  const list = ((mockData as unknown) as Record<string, unknown[]>)[name] as T[];
  const item = list.find((it) => String(((it as unknown) as Record<string, unknown>)[String(idField)]) === String(idValue));
  if (delayMs) await new Promise((r) => setTimeout(r, delayMs));
  return item;
}

/**
 * 获取账号密码配置
 */
export function getUserAccount(empId: string): { password: string; role: string } | undefined {
  return (mockData.userAccounts as Record<string, { password: string; role: string }>)[empId];
}

/**
 * 设置账号密码配置
 */
export function setUserAccount(empId: string, account: { password: string; role: string }): void {
  (mockData.userAccounts as Record<string, { password: string; role: string }>)[empId] = account;
}

/**
 * 通过手机号获取员工ID
 */
export function getEmpIdByPhone(phone: string): string | undefined {
  return (mockData.phoneToEmpId as Record<string, string>)[phone];
}

/**
 * 设置手机号到员工ID的映射
 */
export function setPhoneToEmpId(phone: string, empId: string): void {
  (mockData.phoneToEmpId as Record<string, string>)[phone] = empId;
}

/**
 * 在集合中添加新项
 */
export function addItem<K extends CollectionName, T = CollectionItem<K>>(
  name: K,
  item: T
): T {
  const list = ((mockData as unknown) as Record<string, unknown[]>)[name] as T[];
  const now = new Date().toISOString();
  const newItem = {
    ...item,
    createTime: (item as unknown as { createTime?: string }).createTime || now,
    updateTime: (item as unknown as { updateTime?: string }).updateTime || now,
  };
  list.push(newItem);
  return newItem;
}

/**
 * 更新集合中的项
 */
export function updateItem<K extends CollectionName, T = CollectionItem<K>>(
  name: K,
  idField: keyof T | string,
  idValue: unknown,
  updates: Partial<T>
): T | undefined {
  const list = ((mockData as unknown) as Record<string, unknown[]>)[name] as T[];
  const index = list.findIndex((it) => 
    String(((it as unknown) as Record<string, unknown>)[String(idField)]) === String(idValue)
  );
  if (index === -1) return undefined;
  
  const now = new Date().toISOString();
  list[index] = { 
    ...list[index], 
    ...updates,
    updateTime: now 
  } as T;
  return list[index];
}

/**
 * 从集合中删除项
 */
export function deleteItem<K extends CollectionName, T = CollectionItem<K>>(
  name: K,
  idField: keyof T | string,
  idValue: unknown
): boolean {
  const list = ((mockData as unknown) as Record<string, unknown[]>)[name] as T[];
  const index = list.findIndex((it) => 
    String(((it as unknown) as Record<string, unknown>)[String(idField)]) === String(idValue)
  );
  if (index === -1) return false;
  list.splice(index, 1);
  return true;
}

export default mockData;

/**
 * MSW Handlers 统一导出
 * 按业务模块拆分，统一导出所有 handlers
 */
import { campHandlers } from './camp';
import { studentHandlers } from './student';
import { roomHandlers } from './room';
import { userHandlers } from './user';
import { courseHandlers } from './course';
import { checkinHandlers } from './checkin';
import { recipeHandlers } from './recipe';
import { tuitionHandlers } from './tuition';
import { bodyDataHandlers } from './bodyData';
import { privatePurchaseHandlers } from './privatePurchase';
import { dutyHandlers } from './duty';
import { authHandlers } from './auth';
import { coachHandlers } from './coach';
import { facilityHandlers } from './facility';
import { performanceHandlers } from './performance';
import { salaryHandlers } from './salary';

export const handlers = [
  ...authHandlers,
  ...campHandlers,
  ...studentHandlers,
  ...roomHandlers,
  ...userHandlers,
  ...courseHandlers,
  ...checkinHandlers,
  ...recipeHandlers,
  ...tuitionHandlers,
  ...bodyDataHandlers,
  ...privatePurchaseHandlers,
  ...dutyHandlers,
  ...coachHandlers,
  ...facilityHandlers,
  ...performanceHandlers,
  ...salaryHandlers,
];

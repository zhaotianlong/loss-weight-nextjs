/**
 * 减肥训练营管理系统 - 数据模型定义
 */

// ==================== 通用类型 ====================
export type UserRole = 'admin' | 'manager' | 'coach' | 'chef' | 'cleaner' | 'receptionist';
export type Gender = 'male' | 'female';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type CourseType = 'public' | 'private';
export type CheckinStatus = 'checked_in' | 'checked_out' | 'no_show';

// ==================== 用户相关 ====================
/** 管理员/员工 */
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string; // 加密存储
  role: UserRole;
  avatar?: string;
  isActive: boolean;
  joinDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ==================== 营地相关 ====================
/** 营地信息 */
export interface Camp {
  id: string;
  name: string;
  location: string;
  address: string;
  capacity: number; // 容纳人数
  description?: string;
  contactPhone: string;
  manager: string; // User ID
  createdAt: Date;
  updatedAt: Date;
}

/** 房间 */
export interface Room {
  id: string;
  campId: string;
  roomNumber: string;
  floor: number;
  beds: number; // 床位数
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/** 床位 */
export interface Bed {
  id: string;
  roomId: string;
  bedNumber: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ==================== 学员相关 ====================
/** 学员基本信息 */
export interface Student {
  id: string;
  name: string;
  gender: Gender;
  phone: string;
  idNumber: string; // 身份证号
  birthDate: Date;
  emergencyContact: string;
  emergencyPhone: string;
  joinDate: Date;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

/** 学员身体信息 */
export interface StudentPhysicalInfo {
  id: string;
  studentId: string;
  recordDate: Date;
  height: number; // cm
  weight: number; // kg
  bmIndex: number; // BMI
  fatPercentage?: number; // 体脂率 %
  muscleMass?: number; // 肌肉质量 kg
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

/** 学员入住记录 */
export interface StudentCheckIn {
  id: string;
  studentId: string;
  bedId: string;
  checkInDate: Date;
  checkOutDate?: Date;
  status: CheckinStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ==================== 课程相关 ====================
/** 公共课程 */
export interface PublicCourse {
  id: string;
  campId: string;
  name: string;
  description?: string;
  instructorId: string; // Coach User ID
  schedule: CourseSchedule[]; // 周期性课程表
  maxParticipants?: number;
  location: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/** 课程时间安排 */
export interface CourseSchedule {
  id: string;
  courseId: string;
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  repeating: boolean; // 是否重复
}

/** 私教课程 */
export interface PrivateCourse {
  id: string;
  studentId: string;
  coachId: string; // Coach User ID
  title: string;
  description?: string;
  totalSessions: number;
  completedSessions: number;
  startDate: Date;
  endDate?: Date;
  price: number;
  status: 'active' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

/** 私教课程购买记录 */
export interface PrivateCourseOrder {
  id: string;
  studentId: string;
  courseId: string;
  purchaseDate: Date;
  totalAmount: number;
  sessionsIncluded: number;
  paymentStatus: PaymentStatus;
  paymentDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ==================== 菜谱相关 ====================
/** 菜谱 */
export interface Recipe {
  id: string;
  campId: string;
  name: string;
  category: string; // 早餐、午餐、晚餐、加餐
  ingredients: RecipeIngredient[];
  instructions: string;
  calories: number;
  protein: number; // g
  carbs: number; // g
  fat: number; // g
  chef: string; // User ID
  isActive: boolean;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

/** 菜谱成分 */
export interface RecipeIngredient {
  id: string;
  recipeId: string;
  ingredient: string;
  quantity: number;
  unit: string; // g, ml, 个等
}

/** 每日菜单 */
export interface DailyMenu {
  id: string;
  campId: string;
  date: Date;
  breakfast: string; // Recipe ID
  lunch: string; // Recipe ID
  dinner: string; // Recipe ID
  snack?: string; // Recipe ID
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ==================== 费用相关 ====================
/** 营地收费标准表 */
export interface CampChargeStandard {
  id: string;
  campId: string;
  packageName: string;
  duration: number; // 天数
  price: number;
  discount?: number; // 折扣百分比
  includes: string[]; // 包含项目
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/** 学费记录 */
export interface StudentTuition {
  id: string;
  studentId: string;
  chargeStandardId: string;
  amount: number;
  paymentStatus: PaymentStatus;
  paymentDate?: Date;
  expiryDate?: Date; // 续费有效期
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

/** 续费记录 */
export interface TuitionRenewal {
  id: string;
  tuitionId: string;
  renewalDate: Date;
  newExpiryDate: Date;
  amount: number;
  paymentStatus: PaymentStatus;
  paymentDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ==================== 统计相关 ====================
export interface StudentStats {
  totalStudents: number;
  activeStudents: number;
  checkedInStudents: number;
  averageWeight: number;
  averageBMI: number;
}

export interface CampStats {
  totalBeds: number;
  occupiedBeds: number;
  occupancyRate: number;
  totalRevenue: number;
  pendingPayments: number;
}

/**
 * 常量定义
 * 包含状态枚举、角色枚举、业务常量等
 */

// 通用状态枚举
export enum StatusEnum {
  /** 启用/正常 */
  ACTIVE = 1,
  /** 禁用/关闭 */
  INACTIVE = 0,
}

// 员工角色枚举
export enum EmployeeRoleEnum {
  // 管理员角色（可登录）
  /** 超级管理员 */
  SUPER_ADMIN = '超级管理员',
  /** 营地管理员 */
  CAMP_ADMIN = '营地管理员',
  /** 后勤管理员 */
  LOGISTICS_ADMIN = '后勤管理员',
  /** 教练管理员 */
  COACH_ADMIN = '教练管理员',
  /** 招生管理员 */
  RECRUITMENT_ADMIN = '招生管理员',
  // 普通员工角色（不可登录）
  /** 教练 */
  COACH = '教练',
  /** 餐饮 */
  CATERING = '餐饮',
  /** 保洁 */
  CLEANING = '保洁',
  /** 行政 */
  ADMINISTRATION = '行政',
  /** 招生销售 */
  RECRUITMENT_SALES = '招生销售',
  /** 运营 */
  OPERATIONS = '运营',
}

// 兼容旧名称（已废弃，建议使用 EmployeeRoleEnum）
export enum EmployeePositionEnum {
  /** 管理者 */
  MANAGER = '管理者',
  /** 教练 */
  COACH = '教练',
  /** 餐饮后勤 */
  CATERING = '餐饮后勤',
  /** 清洁后勤 */
  CLEANING = '清洁后勤',
  /** 前台 */
  RECEPTION = '前台',
}

// 学员状态枚举
export enum StudentStatusEnum {
  /** 在训 */
  ACTIVE = 1,
  /** 暂停 */
  PAUSED = 2,
  /** 结业 */
  COMPLETED = 3,
}

// 支付状态枚举
export enum PaymentStatusEnum {
  /** 已支付 */
  PAID = 1,
  /** 待支付 */
  PENDING = 0,
  /** 已逾期 */
  OVERDUE = 2,
  /** 待审核 */
  AUDIT_PENDING = 3,
  /** 已拒绝 */
  REJECTED = 4,
}

// 课程类型枚举
export enum CourseTypeEnum {
  /** 私教课 */
  PRIVATE = 'private',
  /** 公共课 */
  PUBLIC = 'public',
}

// 菜谱类别枚举
export enum RecipeCategoryEnum {
  /** 早餐 */
  BREAKFAST = 'breakfast',
  /** 午餐 */
  LUNCH = 'lunch',
  /** 晚餐 */
  DINNER = 'dinner',
  /** 加餐 */
  SNACK = 'snack',
}

// 状态标签映射
export const StatusTagMap = {
  [StatusEnum.ACTIVE]: { text: '启用', color: 'success' },
  [StatusEnum.INACTIVE]: { text: '禁用', color: 'default' },
};

// 学员状态标签映射
export const StudentStatusTagMap = {
  [StudentStatusEnum.ACTIVE]: { text: '在训', color: 'success' },
  [StudentStatusEnum.PAUSED]: { text: '暂停', color: 'warning' },
  [StudentStatusEnum.COMPLETED]: { text: '结业', color: 'processing' },
};

// 支付状态标签映射
export const PaymentStatusTagMap = {
  [PaymentStatusEnum.PAID]: { text: '已支付', color: 'success' },
  [PaymentStatusEnum.PENDING]: { text: '待支付', color: 'warning' },
  [PaymentStatusEnum.OVERDUE]: { text: '已逾期', color: 'error' },
  [PaymentStatusEnum.AUDIT_PENDING]: { text: '待审核', color: 'processing' },
  [PaymentStatusEnum.REJECTED]: { text: '已拒绝', color: 'error' },
};

// 员工角色标签映射
export const EmployeeRoleTagMap = {
  // 管理员角色
  [EmployeeRoleEnum.SUPER_ADMIN]: { text: '超级管理员', color: 'red' },
  [EmployeeRoleEnum.CAMP_ADMIN]: { text: '营地管理员', color: 'orange' },
  [EmployeeRoleEnum.LOGISTICS_ADMIN]: { text: '后勤管理员', color: 'purple' },
  [EmployeeRoleEnum.COACH_ADMIN]: { text: '教练管理员', color: 'blue' },
  [EmployeeRoleEnum.RECRUITMENT_ADMIN]: { text: '招生管理员', color: 'cyan' },
  // 普通员工角色
  [EmployeeRoleEnum.COACH]: { text: '教练', color: 'blue' },
  [EmployeeRoleEnum.CATERING]: { text: '餐饮', color: 'green' },
  [EmployeeRoleEnum.CLEANING]: { text: '保洁', color: 'default' },
  [EmployeeRoleEnum.ADMINISTRATION]: { text: '行政', color: 'geekblue' },
  [EmployeeRoleEnum.RECRUITMENT_SALES]: { text: '招生销售', color: 'volcano' },
  [EmployeeRoleEnum.OPERATIONS]: { text: '运营', color: 'lime' },
};

// 兼容旧名称（已废弃，建议使用 EmployeeRoleTagMap）
export const EmployeePositionTagMap = {
  [EmployeePositionEnum.MANAGER]: { text: '管理者', color: 'red' },
  [EmployeePositionEnum.COACH]: { text: '教练', color: 'blue' },
  [EmployeePositionEnum.CATERING]: { text: '餐饮后勤', color: 'green' },
  [EmployeePositionEnum.CLEANING]: { text: '清洁后勤', color: 'orange' },
  [EmployeePositionEnum.RECEPTION]: { text: '前台', color: 'purple' },
};

// 菜谱类别标签映射
export const RecipeCategoryTagMap = {
  [RecipeCategoryEnum.BREAKFAST]: { text: '早餐', color: 'orange' },
  [RecipeCategoryEnum.LUNCH]: { text: '午餐', color: 'blue' },
  [RecipeCategoryEnum.DINNER]: { text: '晚餐', color: 'purple' },
  [RecipeCategoryEnum.SNACK]: { text: '加餐', color: 'green' },
};

// 分页默认配置
export const PAGINATION_CONFIG = {
  defaultPageSize: 10,
  pageSizeOptions: ['10', '20', '50', '100'],
};

// 日期格式
export const DATE_FORMAT = 'YYYY-MM-DD';
export const DATETIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';

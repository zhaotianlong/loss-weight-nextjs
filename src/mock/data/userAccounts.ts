// userAccounts 数据
// 管理员员工可以登录，账号默认为手机号
// 密码使用 PBKDF2 哈希加盐存储（格式：salt:hash）
// 原始密码：888888（所有管理员统一使用此密码）
// 
// 加密流程：
// 1. 前端传输加密：SHA-256(888888 + TRANSMIT_KEY) → 传输到后端
// 2. 后端存储加密：PBKDF2(传输加密值, salt, 100000次迭代) → 存储
// 
// 安全说明：
// - salt 使用通用标识符（admin_salt_001），不暴露真实密码
// - 哈希值使用 PBKDF2 算法生成（100000 次迭代，SHA-256）
// - 这些值是预计算的，确保与异步验证函数兼容

export const userAccounts = {
  // 超级管理员
  "emp001": { "password": "admin_salt_001:876ae2a9a131c5455c180e8e6b8ddbe4e0bd761d355dfceb9ade2768d3434d26", "role": "超级管理员" },
  // 营地管理员
  "emp010": { "password": "admin_salt_001:876ae2a9a131c5455c180e8e6b8ddbe4e0bd761d355dfceb9ade2768d3434d26", "role": "营地管理员" },
  "emp019": { "password": "admin_salt_001:876ae2a9a131c5455c180e8e6b8ddbe4e0bd761d355dfceb9ade2768d3434d26", "role": "营地管理员" },
  // 后勤管理员
  "emp006": { "password": "admin_salt_001:876ae2a9a131c5455c180e8e6b8ddbe4e0bd761d355dfceb9ade2768d3434d26", "role": "后勤管理员" },
  "emp015": { "password": "admin_salt_001:876ae2a9a131c5455c180e8e6b8ddbe4e0bd761d355dfceb9ade2768d3434d26", "role": "后勤管理员" },
  "emp024": { "password": "admin_salt_001:876ae2a9a131c5455c180e8e6b8ddbe4e0bd761d355dfceb9ade2768d3434d26", "role": "后勤管理员" },
  // 教练管理员
  "emp002": { "password": "admin_salt_001:876ae2a9a131c5455c180e8e6b8ddbe4e0bd761d355dfceb9ade2768d3434d26", "role": "教练管理员" },
  "emp011": { "password": "admin_salt_001:876ae2a9a131c5455c180e8e6b8ddbe4e0bd761d355dfceb9ade2768d3434d26", "role": "教练管理员" },
  "emp020": { "password": "admin_salt_001:876ae2a9a131c5455c180e8e6b8ddbe4e0bd761d355dfceb9ade2768d3434d26", "role": "教练管理员" }
};

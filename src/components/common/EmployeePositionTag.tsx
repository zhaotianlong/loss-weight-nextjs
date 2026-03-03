/**
 * 员工角色标签组件
 */
import { Tag } from 'antd';
import { EmployeeRoleEnum, EmployeeRoleTagMap, EmployeePositionEnum, EmployeePositionTagMap } from '@/constants';

interface EmployeePositionTagProps {
  position: string; // 实际上传入的是 role
}

export const EmployeePositionTag: React.FC<EmployeePositionTagProps> = ({ position }) => {
  // 优先使用新的角色映射
  let tagConfig = EmployeeRoleTagMap[position as EmployeeRoleEnum];
  
  // 如果新映射中没有，尝试使用旧映射（兼容）
  if (!tagConfig) {
    tagConfig = EmployeePositionTagMap[position as EmployeePositionEnum];
  }
  
  if (!tagConfig) {
    return <Tag>{position}</Tag>;
  }

  return <Tag color={tagConfig.color}>{tagConfig.text}</Tag>;
};

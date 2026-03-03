/**
 * 菜谱类别标签组件
 */
import { Tag } from 'antd';
import { RecipeCategoryEnum, RecipeCategoryTagMap } from '@/constants';

interface RecipeCategoryTagProps {
  category: string;
}

export const RecipeCategoryTag: React.FC<RecipeCategoryTagProps> = ({ category }) => {
  const tagConfig = RecipeCategoryTagMap[category as RecipeCategoryEnum];
  
  if (!tagConfig) {
    return <Tag>{category}</Tag>;
  }

  return <Tag color={tagConfig.color}>{tagConfig.text}</Tag>;
};

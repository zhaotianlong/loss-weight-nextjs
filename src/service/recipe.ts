/**
 * 菜谱管理相关接口
 */
import { http, ApiResponse } from '@/lib/request';

export interface Recipe {
  id: string;
  campId?: number;
  name: string;
  category: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients?: Array<{
    ingredient: string;
    quantity: number;
    unit: string;
  }>;
  instructions?: string;
  isActive?: boolean;
  createTime?: string;
  updateTime?: string;
}

export interface RecipeListParams {
  page?: number;
  pageSize?: number;
  name?: string;
  category?: string;
  campId?: number;
}

/**
 * 获取菜谱列表
 */
export const getRecipeList = (params?: RecipeListParams): Promise<ApiResponse<Recipe[]>> => {
  return http.get<Recipe[]>('/recipes', { params });
};

/**
 * 获取菜谱详情
 */
export const getRecipeDetail = (id: string): Promise<ApiResponse<Recipe>> => {
  return http.get<Recipe>(`/recipes/${id}`);
};

/**
 * 创建菜谱
 */
export const createRecipe = (data: Omit<Recipe, 'id'>): Promise<ApiResponse<Recipe>> => {
  return http.post<Recipe>('/recipes', data);
};

/**
 * 更新菜谱
 */
export const updateRecipe = (id: string, data: Partial<Recipe>): Promise<ApiResponse<Recipe>> => {
  return http.put<Recipe>(`/recipes/${id}`, data);
};

/**
 * 删除菜谱
 */
export const deleteRecipe = (id: string): Promise<ApiResponse<void>> => {
  return http.delete<void>(`/recipes/${id}`);
};

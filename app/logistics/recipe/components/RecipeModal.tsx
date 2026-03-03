'use client';

import React, { useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Select } from 'antd';
import type { Recipe } from '@/service/recipe';
import type { Camp } from '@/service/camp';
import { useCampFilter } from '@/hooks/useCampFilter';

interface RecipeModalProps {
  visible: boolean;
  mode: 'create' | 'edit';
  recipe?: Recipe | null;
  campList: Camp[];
  defaultCampId?: number;
  onCancel: () => void;
  onOk: (values: Omit<Recipe, 'id'>) => Promise<void> | void;
}

export default function RecipeModal({
  visible,
  mode,
  recipe,
  campList,
  defaultCampId,
  onCancel,
  onOk,
}: RecipeModalProps) {
  const [form] = Form.useForm();
  const { shouldShowCampFilter, currentCampId } = useCampFilter();

  useEffect(() => {
    if (visible) {
      if (mode === 'edit' && recipe) {
        form.setFieldsValue({
          name: recipe.name,
          category: recipe.category,
          calories: recipe.calories,
          protein: recipe.protein,
          carbs: recipe.carbs,
          fat: recipe.fat,
          campId: recipe.campId,
          isActive: recipe.isActive !== false,
        });
      } else {
        form.resetFields();
        // 如果不是超级管理员，使用当前用户的营地ID；否则使用 defaultCampId
        const initialCampId = shouldShowCampFilter() ? defaultCampId : (currentCampId || defaultCampId);
        form.setFieldsValue({ 
          campId: initialCampId,
          isActive: true, // 默认启用
        });
      }
    }
  }, [visible, mode, recipe, form, defaultCampId, shouldShowCampFilter, currentCampId]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      // 如果不是超级管理员，强制使用当前用户的营地ID
      if (!shouldShowCampFilter() && currentCampId) {
        values.campId = currentCampId;
      }
      onOk(values);
      form.resetFields();
    } catch (err) {
      console.error('表单验证失败:', err);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={mode === 'create' ? '新增菜谱' : '编辑菜谱'}
      open={visible}
      onOk={handleSubmit}
      onCancel={handleCancel}
      okText="确定"
      cancelText="取消"
      width={600}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        style={{ marginTop: 24 }}
      >
        <Form.Item
          name="name"
          label="菜谱名称"
          rules={[
            { required: true, message: '请输入菜谱名称' },
            { max: 100, message: '菜谱名称最多100个字符' },
          ]}
        >
          <Input placeholder="请输入菜谱名称" />
        </Form.Item>

        <Form.Item
          name="category"
          label="类别"
          rules={[{ required: true, message: '请选择类别' }]}
        >
          <Select placeholder="请选择类别">
            <Select.Option value="breakfast">早餐</Select.Option>
            <Select.Option value="lunch">午餐</Select.Option>
            <Select.Option value="dinner">晚餐</Select.Option>
            <Select.Option value="snack">加餐</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="campId"
          label="所属营地"
          hidden={!shouldShowCampFilter()}
        >
          <Select placeholder="请选择所属营地（可选）" allowClear>
            {campList.map((camp) => (
              <Select.Option key={camp.campId} value={camp.campId}>
                {camp.campName}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="calories"
          label="热量 (kcal)"
          rules={[
            { required: true, message: '请输入热量' },
            { type: 'number', min: 0, message: '热量必须大于等于0' },
          ]}
        >
          <InputNumber
            style={{ width: '100%' }}
            placeholder="请输入热量"
            min={0}
            addonAfter="kcal"
          />
        </Form.Item>

        <Form.Item
          name="protein"
          label="蛋白质 (g)"
          rules={[
            { required: true, message: '请输入蛋白质含量' },
            { type: 'number', min: 0, message: '蛋白质含量必须大于等于0' },
          ]}
        >
          <InputNumber
            style={{ width: '100%' }}
            placeholder="请输入蛋白质含量"
            min={0}
            addonAfter="g"
            step={0.1}
          />
        </Form.Item>

        <Form.Item
          name="carbs"
          label="碳水化合物 (g)"
          rules={[
            { required: true, message: '请输入碳水化合物含量' },
            { type: 'number', min: 0, message: '碳水化合物含量必须大于等于0' },
          ]}
        >
          <InputNumber
            style={{ width: '100%' }}
            placeholder="请输入碳水化合物含量"
            min={0}
            addonAfter="g"
            step={0.1}
          />
        </Form.Item>

        <Form.Item
          name="fat"
          label="脂肪 (g)"
          rules={[
            { required: true, message: '请输入脂肪含量' },
            { type: 'number', min: 0, message: '脂肪含量必须大于等于0' },
          ]}
        >
          <InputNumber
            style={{ width: '100%' }}
            placeholder="请输入脂肪含量"
            min={0}
            addonAfter="g"
            step={0.1}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}


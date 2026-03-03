'use client';

import React, { useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Select } from 'antd';
import type { PrivateCourse } from '@/service/course';
import type { Camp } from '@/service/camp';
import { useCampFilter } from '@/hooks/useCampFilter';

interface PrivateCourseModalProps {
  visible: boolean;
  mode: 'create' | 'edit';
  course?: PrivateCourse | null;
  campList: Camp[];
  defaultCampId?: number;
  onCancel: () => void;
  onOk: (values: Omit<PrivateCourse, 'courseId'>) => Promise<void> | void;
}

export default function PrivateCourseModal({
  visible,
  mode,
  course,
  campList,
  defaultCampId,
  onCancel,
  onOk,
}: PrivateCourseModalProps) {
  const [form] = Form.useForm();
  const { shouldShowCampFilter, currentCampId } = useCampFilter();

  useEffect(() => {
    if (visible) {
      if (mode === 'edit' && course) {
        form.setFieldsValue({
          campId: course.campId,
          type: course.type,
          paymentType: course.paymentType ? course.paymentType.split(',') : [],
          price: course.price,
          monthlyPrice: course.monthlyPrice,
          monthlySessions: course.monthlySessions,
          duration: course.duration,
          status: course.status,
        });
      } else {
        form.resetFields();
        // 如果不是超级管理员，使用当前用户的营地ID；否则使用 defaultCampId
        const initialCampId = shouldShowCampFilter() ? defaultCampId : (currentCampId || defaultCampId);
        form.setFieldsValue({ 
          campId: initialCampId,
          status: 1, // 默认状态为启用
        });
      }
    }
  }, [visible, mode, course, form, defaultCampId, shouldShowCampFilter, currentCampId]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      // 如果不是超级管理员，强制使用当前用户的营地ID
      if (!shouldShowCampFilter() && currentCampId) {
        values.campId = currentCampId;
      }

      const formattedValues = {
        ...values,
        paymentType: values.paymentType ? values.paymentType.join(',') : '',
      };
      await onOk(formattedValues);
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
      title={mode === 'create' ? '新增私教课' : '编辑私教课'}
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
          name="campId"
          label="所属营地"
          rules={[{ required: true, message: '请选择所属营地' }]}
          hidden={!shouldShowCampFilter()}
        >
          <Select placeholder="请选择所属营地">
            {campList.map((camp) => (
              <Select.Option key={camp.campId} value={camp.campId}>
                {camp.campName}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="type"
          label="私教课类型"
          rules={[{ required: true, message: '请选择私教课类型' }]}
        >
          <Select placeholder="请选择私教课类型">
            <Select.Option value="常规">常规</Select.Option>
            <Select.Option value="拉伸">拉伸</Select.Option>
            <Select.Option value="瑜伽">瑜伽</Select.Option>
            <Select.Option value="普拉提">普拉提</Select.Option>
            <Select.Option value="筋膜刀">筋膜刀</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="paymentType"
          label="付费类型"
          rules={[{ required: true, message: '请选择付费类型' }]}
        >
          <Select placeholder="请选择付费类型" mode="multiple">
            <Select.Option value="包月">包月</Select.Option>
            <Select.Option value="单节">单节</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          noStyle
          shouldUpdate={(prevValues, currentValues) => prevValues.paymentType !== currentValues.paymentType}
        >
          {({ getFieldValue }) => {
            const paymentType = getFieldValue('paymentType') || [];
            const isMonthly = paymentType.includes('包月');
            const isSingle = paymentType.includes('单节');

            return (
              <>
                {isSingle && (
                  <Form.Item
                    name="price"
                    label="单节课单价"
                    rules={[
                      { required: true, message: '请输入单节课单价' },
                      { type: 'number', min: 0.01, message: '单价必须大于0' },
                    ]}
                  >
                    <InputNumber
                      style={{ width: '100%' }}
                      placeholder="请输入单节课单价"
                      min={0.01}
                      step={10}
                      precision={2}
                      prefix="¥"
                    />
                  </Form.Item>
                )}

                {isMonthly && (
                  <>
                    <Form.Item
                      name="monthlyPrice"
                      label="包月总价"
                      rules={[
                        { required: true, message: '请输入包月总价' },
                        { type: 'number', min: 0.01, message: '总价必须大于0' },
                      ]}
                    >
                      <InputNumber
                        style={{ width: '100%' }}
                        placeholder="请输入包月总价"
                        min={0.01}
                        step={100}
                        precision={2}
                        prefix="¥"
                      />
                    </Form.Item>
                    <Form.Item
                      name="monthlySessions"
                      label="包月包含课时数（每月最低）"
                      rules={[
                        { required: true, message: '请输入包月包含课时数' },
                        { type: 'number', min: 1, message: '课时数必须大于0' },
                      ]}
                    >
                      <InputNumber
                        style={{ width: '100%' }}
                        placeholder="请输入包月包含课时数"
                        min={1}
                        addonAfter="节"
                      />
                    </Form.Item>
                  </>
                )}
              </>
            );
          }}
        </Form.Item>

        <Form.Item
          name="duration"
          label="课程时长（分钟）"
          rules={[
            { required: true, message: '请输入课程时长' },
            { type: 'number', min: 1, message: '课程时长必须大于0' },
          ]}
        >
          <InputNumber
            style={{ width: '100%' }}
            placeholder="请输入课程时长"
            min={1}
            addonAfter="分钟"
          />
        </Form.Item>

        <Form.Item
          name="status"
          label="状态"
          rules={[{ required: true, message: '请选择状态' }]}
        >
          <Select placeholder="请选择状态">
            <Select.Option value={1}>启用</Select.Option>
            <Select.Option value={0}>禁用</Select.Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
}


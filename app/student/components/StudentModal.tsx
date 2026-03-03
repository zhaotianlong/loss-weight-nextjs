'use client';

import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, DatePicker } from 'antd';
import dayjs from 'dayjs';
import type { Student } from '@/service/student';
import type { Camp } from '@/service/camp';
import { useCampFilter } from '@/hooks/useCampFilter';

interface StudentModalProps {
  visible: boolean;
  mode: 'create' | 'edit';
  student?: Student | null;
  campList: Camp[];
  defaultCampId?: number;
  onCancel: () => void;
  onOk: (values: Omit<Student, 'stuId'>) => Promise<void> | void;
}

export default function StudentModal({
  visible,
  mode,
  student,
  campList,
  defaultCampId,
  onCancel,
  onOk,
}: StudentModalProps) {
  const [form] = Form.useForm();
  const { shouldShowCampFilter, currentCampId } = useCampFilter();

  useEffect(() => {
    if (visible) {
      if (mode === 'edit' && student) {
        form.setFieldsValue({
          name: student.name,
          idCard: student.idCard,
          phone: student.phone,
          campId: student.campId,
          checkinDate: student.checkinDate ? dayjs(student.checkinDate) : undefined,
          checkoutDate: student.checkoutDate ? dayjs(student.checkoutDate) : undefined,
          dietTaboo: student.dietTaboo,
          status: student.status,
        });
      } else {
        form.resetFields();
        // 如果不是超级管理员，使用当前用户的营地ID；否则使用 defaultCampId
        const initialCampId = shouldShowCampFilter() ? defaultCampId : (currentCampId || defaultCampId);
        form.setFieldsValue({ 
          campId: initialCampId,
          status: 1, // 默认状态为在训
        });
      }
    }
  }, [visible, mode, student, form, defaultCampId, shouldShowCampFilter, currentCampId]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const submitValues = {
        ...values,
        checkinDate: values.checkinDate ? values.checkinDate.format('YYYY-MM-DD') : undefined,
        checkoutDate: values.checkoutDate ? values.checkoutDate.format('YYYY-MM-DD') : undefined,
        paymentStatus: student?.paymentStatus || 0, // 保留原有支付状态
      };
      // 如果不是超级管理员，强制使用当前用户的营地ID
      if (!shouldShowCampFilter() && currentCampId) {
        submitValues.campId = currentCampId;
      }
      onOk(submitValues);
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
      title={mode === 'create' ? '新增学员' : '编辑学员'}
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
          label="姓名"
          rules={[
            { required: true, message: '请输入姓名' },
            { max: 50, message: '姓名最多50个字符' },
          ]}
        >
          <Input placeholder="请输入学员姓名" />
        </Form.Item>

        <Form.Item
          name="idCard"
          label="身份证号"
          rules={[
            { required: true, message: '请输入身份证号' },
            { pattern: /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/, message: '请输入正确的身份证号' },
          ]}
        >
          <Input placeholder="请输入18位身份证号" maxLength={18} />
        </Form.Item>

        <Form.Item
          name="phone"
          label="联系方式"
          rules={[
            { required: true, message: '请输入联系方式' },
            { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' },
          ]}
        >
          <Input placeholder="请输入手机号" maxLength={11} />
        </Form.Item>

        {mode === 'edit' && student && (
          <Form.Item
            label="负责教练"
          >
            <Input 
              value={student.coachName || '未分配'} 
              disabled 
              placeholder="未分配教练"
            />
          </Form.Item>
        )}

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
          name="checkinDate"
          label="入营日期"
          rules={[{ required: true, message: '请选择入营日期' }]}
        >
          <DatePicker style={{ width: '100%' }} placeholder="请选择入营日期" />
        </Form.Item>

        <Form.Item
          name="checkoutDate"
          label="退营日期"
        >
          <DatePicker style={{ width: '100%' }} placeholder="请选择退营日期（可选）" />
        </Form.Item>

        <Form.Item
          name="dietTaboo"
          label="饮食禁忌"
        >
          <Input.TextArea 
            placeholder="请输入饮食禁忌（可选）" 
            rows={3}
            maxLength={200}
            showCount
          />
        </Form.Item>

        <Form.Item
          name="status"
          label="状态"
          rules={[{ required: true, message: '请选择状态' }]}
        >
          <Select placeholder="请选择状态">
            <Select.Option value={1}>在训</Select.Option>
            <Select.Option value={2}>暂停</Select.Option>
            <Select.Option value={3}>结业</Select.Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
}


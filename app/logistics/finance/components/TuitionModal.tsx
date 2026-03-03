'use client';

import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, InputNumber, Select, DatePicker, AutoComplete, Button } from 'antd';
import dayjs from 'dayjs';
import type { Tuition } from '@/service/tuition';
import type { Camp } from '@/service/camp';
import { useCampFilter } from '@/hooks/useCampFilter';
import { getPrivateCourseList } from '@/service/course';
import { getStudentList } from '@/service/student';

interface TuitionModalProps {
  visible: boolean;
  mode: 'create' | 'edit';
  tuition?: Tuition | null;
  campList: Camp[];
  defaultCampId?: number;
  onCancel: () => void;
  onOk: (values: Omit<Tuition, 'id'>) => Promise<void> | void;
  disabled?: boolean;
}

export default function TuitionModal({
  visible,
  mode,
  tuition,
  campList,
  defaultCampId,
  onCancel,
  onOk,
  disabled,
}: TuitionModalProps) {
  const [form] = Form.useForm();
  const { shouldShowCampFilter, currentCampId } = useCampFilter();
  const [privateCourseTypes, setPrivateCourseTypes] = useState<string[]>([]);
  const [studentOptions, setStudentOptions] = useState<{ value: string; label: string; stuId: number }[]>([]);

  const selectedType = Form.useWatch('type', form);

  // 获取私教课类型
  useEffect(() => {
    const fetchPrivateCourseTypes = async () => {
      try {
        const res = await getPrivateCourseList({ pageSize: 1000 });
        const types = Array.from(new Set(res.data?.map(c => c.type) || []));
        setPrivateCourseTypes(types);
      } catch (error) {
        console.error('获取私教课类型失败:', error);
      }
    };
    fetchPrivateCourseTypes();
  }, []);

  // 搜索学员
  const handleSearchStudent = async (value: string) => {
    if (!value) {
      setStudentOptions([]);
      return;
    }
    try {
      const res = await getStudentList({ name: value, pageSize: 10 });
      setStudentOptions(res.data?.map(s => ({
        value: s.name,
        label: `${s.name} (${s.phone})`,
        stuId: s.stuId,
      })) || []);
    } catch (error) {
      console.error('搜索学员失败:', error);
    }
  };

  useEffect(() => {
    if (visible) {
      if (mode === 'edit' && tuition) {
        form.setFieldsValue({
          stuId: tuition.stuId,
          studentName: tuition.studentName,
          campId: tuition.campId,
          amount: tuition.amount,
          originalAmount: tuition.originalAmount,
          actualAmount: tuition.actualAmount,
          type: tuition.type,
          source: tuition.source,
          paymentDate: tuition.paymentDate ? dayjs(tuition.paymentDate) : undefined,
          dueDate: tuition.dueDate ? dayjs(tuition.dueDate) : undefined,
          status: tuition.status,
          description: tuition.description,
        });
      } else {
        form.resetFields();
        const initialCampId = shouldShowCampFilter() ? defaultCampId : (currentCampId || defaultCampId);
        form.setFieldsValue({ 
          campId: initialCampId,
          status: 0,
          type: 'income',
        });
      }
    }
  }, [visible, mode, tuition, form, defaultCampId, shouldShowCampFilter, currentCampId]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const submitValues = {
        ...values,
        paymentDate: values.paymentDate ? values.paymentDate.format('YYYY-MM-DD') : undefined,
        dueDate: values.dueDate ? values.dueDate.format('YYYY-MM-DD') : undefined,
      };
      
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

  const incomeSources = [
    { label: '学费(入住)', value: '学费(入住)' },
    { label: '学费(续住)', value: '学费(续住)' },
    { label: '学费(换房)', value: '学费(换房)' },
    ...privateCourseTypes.map(t => ({ label: `私教课(${t})`, value: `私教课(${t})` })),
    { label: '其他', value: '其他' },
  ];

  return (
    <Modal
      title={disabled ? '查看记录' : (mode === 'create' ? '新增记录' : '编辑记录')}
      open={visible}
      onOk={disabled ? onCancel : handleSubmit}
      onCancel={handleCancel}
      footer={disabled ? [
        <Button key="close" onClick={handleCancel}>关闭</Button>
      ] : undefined}
      okText="确定"
      cancelText="取消"
      width={600}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        style={{ marginTop: 24 }}
        disabled={disabled}
      >
        <Form.Item
          name="type"
          label="收支类型"
          rules={[{ required: true, message: '请选择收支类型' }]}
        >
          <Select placeholder="请选择收支类型">
            <Select.Option value="income">收入</Select.Option>
            <Select.Option value="expense">支出</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="source"
          label="来源"
          rules={[{ required: true, message: '请选择或输入来源' }]}
        >
          {selectedType === 'income' ? (
            <Select placeholder="请选择收入来源" options={incomeSources} />
          ) : (
            <Input placeholder="请输入支出来源（自定义）" />
          )}
        </Form.Item>

        <Form.Item
          name="studentName"
          label="学员名称"
        >
          <AutoComplete
            placeholder="请输入学员名称搜索"
            onSearch={handleSearchStudent}
            options={studentOptions}
            onSelect={(_, option) => {
              form.setFieldsValue({ stuId: option.stuId });
            }}
          />
        </Form.Item>

        <Form.Item
          name="stuId"
          label="学员ID"
          hidden
        >
          <InputNumber />
        </Form.Item>

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

        <div style={{ display: 'flex', gap: 16 }}>
          <Form.Item
            name="originalAmount"
            label="原价金额"
            style={{ flex: 1 }}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="原价金额"
              min={0}
              precision={2}
              prefix="¥"
            />
          </Form.Item>

          <Form.Item
            name="actualAmount"
            label="成交金额"
            style={{ flex: 1 }}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="成交金额"
              min={0}
              precision={2}
              prefix="¥"
            />
          </Form.Item>
        </div>

        <Form.Item
          name="amount"
          label="记账金额"
          rules={[
            { required: true, message: '请输入记账金额' },
            { type: 'number', min: 0.01, message: '金额必须大于0' },
          ]}
        >
          <InputNumber
            style={{ width: '100%' }}
            placeholder="请输入最终显示在列表的金额"
            min={0.01}
            step={100}
            precision={2}
            prefix="¥"
          />
        </Form.Item>

        <div style={{ display: 'flex', gap: 16 }}>
          <Form.Item
            name="dueDate"
            label="到期日期"
            rules={[{ required: true, message: '请选择到期日期' }]}
            style={{ flex: 1 }}
          >
            <DatePicker style={{ width: '100%' }} placeholder="请选择到期日期" />
          </Form.Item>

          <Form.Item
            name="paymentDate"
            label="支付日期"
            style={{ flex: 1 }}
          >
            <DatePicker style={{ width: '100%' }} placeholder="支付日期" />
          </Form.Item>
        </div>

        <Form.Item
          name="status"
          label="状态"
          rules={[{ required: true, message: '请选择状态' }]}
        >
          <Select placeholder="请选择状态">
            <Select.Option value={1}>已支付</Select.Option>
            <Select.Option value={0}>待支付</Select.Option>
            <Select.Option value={2}>已逾期</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="description"
          label="说明"
        >
          <Input.TextArea 
            placeholder="请输入说明（可选）" 
            rows={2}
            maxLength={200}
            showCount
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}


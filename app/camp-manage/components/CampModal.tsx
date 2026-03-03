'use client';

import React, { useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Select, DatePicker } from 'antd';
import type { Camp } from '@/service/camp';
import dayjs from 'dayjs';

interface CampModalProps {
  visible: boolean;
  mode: 'create' | 'edit';
  camp?: Camp | null;
  onCancel: () => void;
  onOk: (values: Omit<Camp, 'campId' | 'currentNum'>) => void;
}

export default function CampModal({
  visible,
  mode,
  camp,
  onCancel,
  onOk,
}: CampModalProps) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible) {
      if (mode === 'edit' && camp) {
        form.setFieldsValue({
          campName: camp.campName,
          address: camp.address,
          capacity: camp.capacity,
          contactPerson: camp.contactPerson,
          contactPhone: camp.contactPhone,
          status: camp.status,
          createDate: camp.createDate ? dayjs(camp.createDate) : null,
          openDate: camp.openDate ? dayjs(camp.openDate) : null,
          closeDate: camp.closeDate ? dayjs(camp.closeDate) : null,
          remark: camp.remark || '',
        });
      } else {
        form.resetFields();
        form.setFieldsValue({ status: 1 }); // 默认状态为运营中
      }
    }
  }, [visible, mode, camp, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      // 将日期对象转换为字符串格式
      const submitValues = {
        ...values,
        createDate: values.createDate ? values.createDate.format('YYYY-MM-DD') : null,
        openDate: values.openDate ? values.openDate.format('YYYY-MM-DD') : null,
        closeDate: values.closeDate ? values.closeDate.format('YYYY-MM-DD') : null,
      };
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
      title={mode === 'create' ? '新增营地' : '编辑营地'}
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
          name="campName"
          label="营地名称"
          rules={[
            { required: true, message: '请输入营地名称' },
            { max: 50, message: '营地名称最多50个字符' },
          ]}
        >
          <Input placeholder="请输入营地名称" />
        </Form.Item>

        <Form.Item
          name="address"
          label="位置/地址"
          rules={[
            { required: true, message: '请输入位置/地址' },
            { max: 200, message: '地址最多200个字符' },
          ]}
        >
          <Input.TextArea
            rows={3}
            placeholder="请输入位置/地址"
            showCount
            maxLength={200}
          />
        </Form.Item>

        <Form.Item
          name="capacity"
          label="容量"
          rules={[
            { required: true, message: '请输入容量' },
            { type: 'number', min: 1, message: '容量必须大于0' },
            { type: 'number', max: 10000, message: '容量不能超过10000' },
          ]}
        >
          <InputNumber
            style={{ width: '100%' }}
            placeholder="请输入容量"
            min={1}
            max={10000}
            addonAfter="人"
          />
        </Form.Item>

        <Form.Item
          name="contactPerson"
          label="联系人"
          rules={[
            { required: true, message: '请输入联系人' },
            { max: 50, message: '联系人最多50个字符' },
          ]}
        >
          <Input placeholder="请输入联系人" />
        </Form.Item>

        <Form.Item
          name="contactPhone"
          label="联系电话"
          rules={[
            { required: true, message: '请输入联系电话' },
            { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' },
          ]}
        >
          <Input placeholder="请输入联系电话" maxLength={11} />
        </Form.Item>

        <Form.Item
          name="status"
          label="状态"
          rules={[{ required: true, message: '请选择状态' }]}
        >
          <Select placeholder="请选择状态">
            <Select.Option value={1}>运营中</Select.Option>
            <Select.Option value={0}>已关闭</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="createDate"
          label="创建日期"
        >
          <DatePicker
            style={{ width: '100%' }}
            placeholder="请选择创建日期"
            format="YYYY-MM-DD"
          />
        </Form.Item>

        <Form.Item
          name="openDate"
          label="开业日期"
        >
          <DatePicker
            style={{ width: '100%' }}
            placeholder="请选择开业日期"
            format="YYYY-MM-DD"
          />
        </Form.Item>

        <Form.Item
          name="closeDate"
          label="关店日期"
        >
          <DatePicker
            style={{ width: '100%' }}
            placeholder="请选择关店日期"
            format="YYYY-MM-DD"
          />
        </Form.Item>

        <Form.Item
          name="remark"
          label="备注"
          rules={[
            { max: 500, message: '备注最多500个字符' },
          ]}
        >
          <Input.TextArea
            rows={3}
            placeholder="请输入备注信息"
            showCount
            maxLength={500}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}



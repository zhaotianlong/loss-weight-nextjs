'use client';

import React, { useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Select } from 'antd';
import type { RoomType } from '@/service/room';
import type { Camp } from '@/service/camp';
import { useCampFilter } from '@/hooks/useCampFilter';

interface RoomTypeModalProps {
  visible: boolean;
  mode: 'create' | 'edit';
  roomType?: RoomType | null;
  campList: Camp[];
  defaultCampId?: number;
  onCancel: () => void;
  onOk: (values: Omit<RoomType, 'roomTypeId'>) => void;
}

export default function RoomTypeModal({
  visible,
  mode,
  roomType,
  campList,
  defaultCampId,
  onCancel,
  onOk,
}: RoomTypeModalProps) {
  const [form] = Form.useForm();
  const { shouldShowCampFilter, currentCampId } = useCampFilter();

  useEffect(() => {
    if (visible) {
      if (mode === 'edit' && roomType) {
        form.setFieldsValue({
          campId: roomType.campId,
          roomName: roomType.roomName,
          bedCount: roomType.bedCount,
          bedType: roomType.bedType,
          roomStatus: roomType.roomStatus,
          price: roomType.price,
          upperPrice: roomType.upperPrice,
          lowerPrice: roomType.lowerPrice,
        });
      } else {
        form.resetFields();
        // 如果不是超级管理员，使用当前用户的营地ID；否则使用 defaultCampId
        const initialCampId = shouldShowCampFilter() ? defaultCampId : (currentCampId || defaultCampId);
        form.setFieldsValue({ 
          campId: initialCampId,
          bedType: 0,
          roomStatus: 1, // 默认状态为启用
        });
      }
    }
  }, [visible, mode, roomType, form, defaultCampId, shouldShowCampFilter, currentCampId]);

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
      title={mode === 'create' ? '新增房间类型' : '编辑房间类型'}
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
          name="roomName"
          label="类型名称"
          rules={[
            { required: true, message: '请输入类型名称' },
            { max: 50, message: '类型名称最多50个字符' },
          ]}
        >
          <Input placeholder="请输入类型名称，如：单人间、双人间等" />
        </Form.Item>

        <Form.Item
          name="bedCount"
          label="床位数"
          rules={[
            { required: true, message: '请输入床位数' },
            { type: 'number', min: 1, message: '床位数必须大于0' },
            { type: 'number', max: 20, message: '床位数不能超过20' },
          ]}
        >
          <InputNumber
            style={{ width: '100%' }}
            placeholder="请输入床位数"
            min={1}
            max={20}
            addonAfter="人"
          />
        </Form.Item>

        <Form.Item
          name="bedType"
          label="床位类型"
          rules={[{ required: true, message: '请选择床位类型' }]}
        >
          <Select placeholder="请选择床位类型">
            <Select.Option value={0}>普通床位</Select.Option>
            <Select.Option value={1}>上下床</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item noStyle shouldUpdate={(prev, curr) => prev.bedType !== curr.bedType}>
          {({ getFieldValue }) => {
            const type = getFieldValue('bedType');
            if (type === 1) {
              return (
                <div style={{ display: 'flex', gap: 16 }}>
                  <Form.Item
                    name="upperPrice"
                    label="上床价格"
                    rules={[{ required: true, message: '请输入上床价格' }]}
                    style={{ flex: 1 }}
                  >
                    <InputNumber
                      style={{ width: '100%' }}
                      placeholder="上床价格"
                      min={0}
                      precision={2}
                      addonAfter="元"
                    />
                  </Form.Item>
                  <Form.Item
                    name="lowerPrice"
                    label="下床价格"
                    rules={[{ required: true, message: '请输入下床价格' }]}
                    style={{ flex: 1 }}
                  >
                    <InputNumber
                      style={{ width: '100%' }}
                      placeholder="下床价格"
                      min={0}
                      precision={2}
                      addonAfter="元"
                    />
                  </Form.Item>
                </div>
              );
            }
            return (
              <Form.Item
                name="price"
                label="房间价格"
                rules={[{ required: true, message: '请输入房间价格' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="请输入房间价格"
                  min={0}
                  precision={2}
                  addonAfter="元"
                />
              </Form.Item>
            );
          }}
        </Form.Item>

        <Form.Item
          name="roomStatus"
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


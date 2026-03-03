
'use client';

import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, InputNumber, Select, Upload, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { Facility } from '@/mock/data/facility';
import { getCampList, type Camp } from '@/service/camp';
import { useUser } from '@/contexts/UserContext';

interface FacilityModalProps {
  visible: boolean;
  mode: 'create' | 'edit';
  facility?: Facility | null;
  onCancel: () => void;
  onOk: (values: Omit<Facility, 'id' | 'createTime' | 'updateTime'>) => Promise<void>;
}

export default function FacilityModal({
  visible,
  mode,
  facility,
  onCancel,
  onOk,
}: FacilityModalProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [campList, setCampList] = useState<Camp[]>([]);
  const { user } = useUser();
  const isSuper = user?.role === '超级管理员';

  useEffect(() => {
    if (visible) {
      if (mode === 'edit' && facility) {
        form.setFieldsValue({
          ...facility,
          photos: facility.photos.map((url, index) => ({
            uid: `-${index}`,
            name: `photo-${index}`,
            status: 'done',
            url,
          })),
        });
      } else {
        form.resetFields();
        if (!isSuper && user?.campId) {
          form.setFieldsValue({ campId: user.campId });
        }
      }
      
      if (isSuper) {
        fetchCamps();
      }
    }
  }, [visible, mode, facility, isSuper, user]);

  const fetchCamps = async () => {
    try {
      const res = await getCampList({ pageSize: 100 });
      setCampList(res.data || []);
    } catch (error) {
      console.error('获取营地列表失败:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      // 处理照片列表，将其转换回字符串数组
      const photos = values.photos?.map((file: any) => file.url || file.response?.url).filter(Boolean) || [];
      
      await onOk({
        ...values,
        photos,
      });
      form.resetFields();
    } catch (error) {
      console.error('表单校验失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const facilityNameOptions = [
    { label: '有氧区', value: '有氧区' },
    { label: '器械区', value: '器械区' },
    { label: '单车室', value: '单车室' },
    { label: '操课区', value: '操课区' },
    { label: '拉伸区', value: '拉伸区' },
    { label: '瑜伽室', value: '瑜伽室' },
    { label: '游泳池', value: '游泳室' },
    { label: '羽毛球场', value: '羽毛球场' },
  ];

  return (
    <Modal
      title={mode === 'create' ? '新增设施' : '编辑设施'}
      open={visible}
      onOk={handleSubmit}
      onCancel={onCancel}
      confirmLoading={loading}
      width={600}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{ capacity: 1 }}
      >
        {isSuper && (
          <Form.Item
            name="campId"
            label="所属营地"
            rules={[{ required: true, message: '请选择营地' }]}
          >
            <Select placeholder="请选择营地">
              {campList.map(camp => (
                <Select.Option key={camp.campId} value={camp.campId}>
                  {camp.campName}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        )}

        <Form.Item
          name="name"
          label="场地名称"
          rules={[{ required: true, message: '请输入或选择场地名称' }]}
          tooltip="常见场地：有氧区、器械区、单车室、操课区等"
        >
          <Select
            showSearch
            placeholder="请输入或选择场地名称"
            options={facilityNameOptions}
            onSearch={(val) => {
              // 支持自定义输入
            }}
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            dropdownRender={(menu) => (
              <>
                {menu}
              </>
            )}
          />
        </Form.Item>

        <Form.Item
          name="location"
          label="具体地点"
          rules={[{ required: true, message: '请输入具体地点' }]}
        >
          <Input placeholder="例如：主楼二层东侧" />
        </Form.Item>

        <Form.Item
          name="capacity"
          label="容纳人数"
          rules={[{ required: true, message: '请输入容纳人数' }]}
        >
          <InputNumber min={1} style={{ width: '100%' }} placeholder="请输入可容纳人数" />
        </Form.Item>

        <Form.Item
          name="description"
          label="特点描述"
        >
          <Input.TextArea rows={4} placeholder="请输入场地特点描述" />
        </Form.Item>

        <Form.Item
          name="photos"
          label="场地照片"
          valuePropName="fileList"
          getValueFromEvent={(e: any) => {
            if (Array.isArray(e)) return e;
            return e?.fileList;
          }}
        >
          <Upload
            listType="picture-card"
            action="/api/upload" // 模拟上传接口
            maxCount={5}
          >
            <div>
              <PlusOutlined />
              <div style={{ marginTop: 8 }}>上传照片</div>
            </div>
          </Upload>
        </Form.Item>
      </Form>
    </Modal>
  );
}

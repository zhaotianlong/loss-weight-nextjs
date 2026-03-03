'use client';

import React, { useEffect, useState } from 'react';
import { Modal, Form, InputNumber, Divider, Typography, message, Select } from 'antd';
import type { Student } from '@/service/student';
import { getRoomTypeList, type RoomType } from '@/service/room';
import { getCoachList, type CoachOption } from '@/service/coach';
import dayjs from 'dayjs';

const { Text } = Typography;

interface RenewalModalProps {
  visible: boolean;
  student: Student | null;
  onOk: (params: {
    stuId: number;
    days: number;
    originalAmount: number;
    actualAmount: number;
    salespersonId?: string;
  }) => Promise<void> | void;
  onCancel: () => void;
}

export default function RenewalModal({
  visible,
  student,
  onOk,
  onCancel,
}: RenewalModalProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [roomType, setRoomType] = useState<RoomType | null>(null);
  const [coachList, setCoachList] = useState<CoachOption[]>([]);

  useEffect(() => {
    if (visible && student) {
      form.setFieldsValue({
        days: 30,
      });

      setLoading(true);
      const promises: [Promise<any>, Promise<any>] = [
        getCoachList({ campId: student.campId }),
        student.bedId ? getRoomTypeList({ campId: student.campId }) : Promise.resolve({ data: [] })
      ];

      Promise.all(promises)
        .then(([coachRes, roomRes]) => {
          setCoachList(coachRes.data || []);
          
          if (roomRes.data && roomRes.data.length > 0) {
            const rt = roomRes.data[0];
            setRoomType(rt);
            const price = rt.price || rt.lowerPrice || 0;
            form.setFieldsValue({
              originalAmount: price,
              actualAmount: price,
            });
          }
        })
        .finally(() => setLoading(false));
    }
  }, [visible, student, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (student) {
        setLoading(true);
        try {
          await onOk({
            stuId: student.stuId,
            days: values.days,
            originalAmount: values.originalAmount,
            actualAmount: values.actualAmount,
            salespersonId: values.salespersonId,
          });
          form.resetFields();
        } finally {
          setLoading(false);
        }
      }
    } catch (err) {
      console.error('表单验证失败:', err);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  // 计算续租后的到期日期
  const calculateNewExpireDate = (days: number): string | null => {
    if (!student) return null;
    
    let currentExpireDate: dayjs.Dayjs;
    if (student.checkoutDate) {
      currentExpireDate = dayjs(student.checkoutDate);
    } else if (student.checkinDate) {
      currentExpireDate = dayjs(student.checkinDate).add(30, 'day');
    } else {
      return null;
    }

    return currentExpireDate.add(days, 'day').format('YYYY-MM-DD');
  };

  const days = Form.useWatch('days', form);
  const originalAmount = Form.useWatch('originalAmount', form);

  return (
    <Modal
      title={`申请续租 - ${student?.name}`}
      open={visible}
      onOk={handleSubmit}
      onCancel={handleCancel}
      confirmLoading={loading}
      okText="提交申请"
      cancelText="取消"
      width={500}
    >
      {student && (
        <Form
          form={form}
          layout="vertical"
          style={{ marginTop: 24 }}
        >
          <Form.Item label="当前到期日期">
            <span>
              {(() => {
                if (student.checkoutDate) {
                  return student.checkoutDate;
                }
                if (student.checkinDate) {
                  return dayjs(student.checkinDate).add(30, 'day').format('YYYY-MM-DD');
                }
                return '-';
              })()}
            </span>
          </Form.Item>

          <Form.Item
            name="days"
            label="续租天数"
            rules={[
              { required: true, message: '请输入续租天数' },
              { type: 'number', min: 1, message: '续租天数必须大于0' },
              { type: 'number', max: 365, message: '续租天数不能超过365天' },
            ]}
          >
            <InputNumber
              min={1}
              max={365}
              style={{ width: '100%' }}
              placeholder="请输入续租天数"
              addonAfter="天"
            />
          </Form.Item>

          {days && days > 0 && (
            <Form.Item label="续租后到期日期">
              <span style={{ color: '#1890ff', fontWeight: 'bold' }}>
                {calculateNewExpireDate(days) || '-'}
              </span>
            </Form.Item>
          )}

          <Form.Item
            name="salespersonId"
            label="招生/续住开单人员"
            tooltip="业绩将计入该教练名下"
          >
            <Select
              placeholder="请选择开单人员"
              showSearch
              filterOption={(input, option) =>
                (option?.label as string)?.toLowerCase().includes(input.toLowerCase()) ||
                false
              }
              loading={loading}
              options={coachList}
            />
          </Form.Item>

          <Divider />

          <Form.Item label="原价金额" name="originalAmount">
            <Text strong style={{ fontSize: 16 }}>¥ {originalAmount || 0}</Text>
          </Form.Item>

          <Form.Item
            name="actualAmount"
            label="实际金额"
            rules={[{ required: true, message: '请输入实际金额' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              precision={2}
              prefix="¥"
              placeholder="请输入成交金额"
            />
          </Form.Item>
        </Form>
      )}
    </Modal>
  );
}


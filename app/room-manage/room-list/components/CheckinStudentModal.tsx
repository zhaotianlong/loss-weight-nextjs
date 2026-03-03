'use client';

import React, { useEffect, useState } from 'react';
import { Modal, Form, Select, DatePicker, message, InputNumber, Typography, Divider } from 'antd';
import type { Student } from '@/service/student';
import { getStudentList } from '@/service/student';
import { getRoomTypeList, type RoomType } from '@/service/room';
import { getCoachList, type CoachOption } from '@/service/coach';
import dayjs from 'dayjs';

const { Text } = Typography;

interface CheckinStudentModalProps {
  visible: boolean;
  bedId: number;
  bedNum: string;
  roomCampId: number;
  roomId?: number;
  roomTypeId?: number;
  onOk: (params: {
    stuId: number;
    checkinDate: string;
    originalAmount: number;
    actualAmount: number;
    salespersonId?: string;
  }) => Promise<void> | void;
  onCancel: () => void;
}

export default function CheckinStudentModal({
  visible,
  bedId,
  bedNum,
  roomCampId,
  roomTypeId,
  onOk,
  onCancel,
}: CheckinStudentModalProps) {
  const [form] = Form.useForm();
  const [studentList, setStudentList] = useState<Student[]>([]);
  const [coachList, setCoachList] = useState<CoachOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [roomType, setRoomType] = useState<RoomType | null>(null);

  // 加载床位价格信息
  useEffect(() => {
    if (visible && roomTypeId) {
      getRoomTypeList({ campId: roomCampId })
        .then(res => {
          if (res.data && res.data.length > 0) {
            const rt = res.data.find(t => t.roomTypeId === roomTypeId);
            if (!rt) return;
            
            setRoomType(rt);
            
            // 计算床位原价
            let price = 0;
            if (rt.bedType === 1) { // 上下床
              const match = bedNum.match(/-(\d+)$/);
              const bedIndex = match ? parseInt(match[1]) : 1;
              const isUpper = rt.bedCount === 2 ? bedIndex === 2 : bedIndex % 2 === 0;
              price = isUpper ? (rt.upperPrice || 0) : (rt.lowerPrice || 0);
            } else {
              price = rt.price || 0;
            }

            form.setFieldsValue({
              originalAmount: price,
              actualAmount: price,
            });
          }
        });
    }
  }, [visible, roomTypeId, bedNum, form, roomCampId]);

  // 加载学员列表和教练列表
  useEffect(() => {
    if (!visible) return;

    const loadData = async () => {
      setLoading(true);
      try {
        const [stuRes, coachRes] = await Promise.all([
          getStudentList({
            pageSize: 1000,
            campId: roomCampId,
            status: 1, // 只获取启用状态的学员
          }),
          getCoachList({ campId: roomCampId })
        ]);
        
        // 过滤掉已有床位的学员
        const availableStudents = (stuRes.data || []).filter(
          (stu) => !stu.bedId || stu.bedId === null
        );
        setStudentList(availableStudents);
        setCoachList(coachRes.data || []);
      } catch (err) {
        console.error('获取列表失败:', err);
        message.error('获取信息失败');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [visible, roomCampId]);

  useEffect(() => {
    if (visible) {
      form.setFieldsValue({
        checkinDate: dayjs(), // 默认今天
      });
    }
  }, [visible, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await onOk({
        stuId: values.stuId,
        checkinDate: values.checkinDate.format('YYYY-MM-DD'),
        originalAmount: values.originalAmount,
        actualAmount: values.actualAmount,
        salespersonId: values.salespersonId,
      });
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
      title={`申请入住学员 - ${bedNum}`}
      open={visible}
      onOk={handleSubmit}
      onCancel={handleCancel}
      confirmLoading={loading}
      okText="提交申请"
      cancelText="取消"
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="stuId"
          label="选择学员"
          rules={[{ required: true, message: '请选择学员' }]}
        >
          <Select
            placeholder="请选择学员"
            showSearch
            filterOption={(input, option) =>
              (option?.label as string)?.toLowerCase().includes(input.toLowerCase()) ||
              false
            }
            loading={loading}
            options={studentList.map((stu) => ({
              label: `${stu.name} (${stu.phone})`,
              value: stu.stuId,
            }))}
          />
        </Form.Item>
        <Form.Item
          name="checkinDate"
          label="入住日期"
          rules={[{ required: true, message: '请选择入住日期' }]}
        >
          <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
        </Form.Item>

        <Form.Item
          name="salespersonId"
          label="招生/开单人员"
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
          <Text strong style={{ fontSize: 16 }}>¥ {form.getFieldValue('originalAmount') || 0}</Text>
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
    </Modal>
  );
}


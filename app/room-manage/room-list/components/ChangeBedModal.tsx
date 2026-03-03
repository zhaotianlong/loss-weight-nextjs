'use client';

import React, { useEffect, useState } from 'react';
import { Modal, Form, Select, message, InputNumber, Divider, Typography } from 'antd';
import type { RoomDetail, RoomType } from '@/service/room';
import { getRoomDetailList, getRoomTypeList } from '@/service/room';

const { Text } = Typography;

interface ChangeBedModalProps {
  visible: boolean;
  currentBedId: number;
  currentBedNum: string;
  studentId: number;
  roomCampId: number;
  currentRoomId: number;
  onOk: (params: {
    newBedId: number;
    originalAmount: number;
    actualAmount: number;
  }) => Promise<void> | void;
  onCancel: () => void;
}

export default function ChangeBedModal({
  visible,
  currentBedId,
  currentBedNum,
  studentId,
  roomCampId,
  currentRoomId,
  onOk,
  onCancel,
}: ChangeBedModalProps) {
  const [form] = Form.useForm();
  const [availableBeds, setAvailableBeds] = useState<Array<{ 
    bedId: number; 
    bedNum: string; 
    roomNum: string; 
    roomTypeName: string;
    bedType: number;
    bedIndex: number;
    bedCount: number;
    roomTypeId: number;
  }>>([]);
  const [loading, setLoading] = useState(false);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);

  const originalAmount = Form.useWatch('originalAmount', form);

  // 根据床位索引和床位数判断上铺/下铺
  const getBedPositionLabel = (bedIndex: number, bedCount: number, bedType: number): string => {
    if (bedType === 0) {
      return '普通床位';
    }
    // bedType === 1 表示上下床
    if (bedCount === 1) return '下铺';
    if (bedCount === 2) {
      return bedIndex === 1 ? '下铺' : '上铺';
    }
    // 多人间：奇数号是下铺，偶数号是上铺
    return bedIndex % 2 === 1 ? '下铺' : '上铺';
  };

  // 监听选择新床位，更新原价
  const handleBedChange = (bedId: number) => {
    const bed = availableBeds.find(b => b.bedId === bedId);
    if (bed && roomTypes.length > 0) {
      const rt = roomTypes.find(t => t.roomTypeId === bed.roomTypeId);
      if (rt) {
        let price = 0;
        if (rt.bedType === 1) { // 上下床
          const isUpper = rt.bedCount === 2 ? bed.bedIndex === 2 : bed.bedIndex % 2 === 0;
          price = isUpper ? (rt.upperPrice || 0) : (rt.lowerPrice || 0);
        } else {
          price = rt.price || 0;
        }
        form.setFieldsValue({
          originalAmount: price,
          actualAmount: price,
        });
      }
    }
  };

  // 加载可用床位列表和房型列表
  useEffect(() => {
    if (!visible) return;

    setLoading(true);
    Promise.all([
      getRoomDetailList({
        pageSize: 1000,
        campId: roomCampId,
      }),
      getRoomTypeList({ campId: roomCampId })
    ])
        .then(([detailRes, typeRes]) => {
          setRoomTypes(typeRes.data || []);
          
          const allBeds: Array<{ 
            bedId: number; 
            bedNum: string; 
            roomNum: string;
            roomTypeName: string;
            bedType: number;
            bedIndex: number;
            bedCount: number;
            roomTypeId: number;
          }> = [];
          (detailRes.data || []).forEach((room: RoomDetail) => {
            const bedCount = room.roomType?.bedCount || room.bedCount || 0;
            const roomTypeName = room.roomType?.roomName || '未知类型';
            const bedType = room.roomType?.bedType ?? 0;
            const roomTypeId = room.roomType?.roomTypeId || room.typeId;
            const bedsMap = new Map(room.beds.map(bed => [bed.bedNum, bed]));
            
            for (let i = 1; i <= bedCount; i++) {
              const bedNum = `${room.roomNum}-${i}`;
              const bed = bedsMap.get(bedNum);
              // 更换床位时，只能选择已存在且状态正常（status === 1）且为空的床位
              if (bed && !bed.stuId && bed.bedId !== currentBedId && bed.status === 1) {
                allBeds.push({
                  bedId: bed.bedId,
                  bedNum,
                  roomNum: room.roomNum,
                  roomTypeName,
                  bedType,
                  bedIndex: i,
                  bedCount,
                  roomTypeId,
                });
              }
            }
          });
          setAvailableBeds(allBeds);
        })
        .catch((err) => {
          console.error('获取信息失败:', err);
          message.error('获取信息失败');
        })
        .finally(() => {
          setLoading(false);
        });
    }, [visible, roomCampId, currentBedId]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await onOk({
        newBedId: values.newBedId,
        originalAmount: values.originalAmount,
        actualAmount: values.actualAmount,
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
      title={`申请更换床位 - ${currentBedNum}`}
      open={visible}
      onOk={handleSubmit}
      onCancel={handleCancel}
      confirmLoading={loading}
      okText="提交申请"
      cancelText="取消"
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="newBedId"
          label="选择新床位"
          rules={[{ required: true, message: '请选择新床位' }]}
        >
          <Select
            placeholder="请选择新床位"
            showSearch
            onChange={handleBedChange}
            filterOption={(input, option) =>
              (option?.label as string)?.toLowerCase().includes(input.toLowerCase()) ||
              false
            }
            loading={loading}
            options={availableBeds.map((bed) => {
              const positionLabel = getBedPositionLabel(bed.bedIndex, bed.bedCount, bed.bedType);
              return {
                label: `${bed.bedNum} ${bed.roomTypeName}（${positionLabel}）`,
                value: bed.bedId,
              };
            })}
          />
        </Form.Item>

        <Divider />

        <Form.Item name="originalAmount" hidden>
          <InputNumber />
        </Form.Item>

        <Form.Item label="原价金额">
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
    </Modal>
  );
}


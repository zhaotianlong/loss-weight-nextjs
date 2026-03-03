'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import { Modal, Form, Input, Select } from 'antd';
import type { Room } from '@/service/room';
import type { RoomType } from '@/service/room';
import type { Camp } from '@/service/camp';
import { useCampFilter } from '@/hooks/useCampFilter';

interface RoomModalProps {
  visible: boolean;
  mode: 'create' | 'edit';
  room?: Room | null;
  campList: Camp[];
  roomTypeList: RoomType[];
  defaultCampId?: number;
  onCancel: () => void;
  onOk: (values: Omit<Room, 'roomId'>) => Promise<void> | void;
  onCampChange?: (campId: number) => void;
}

export default function RoomModal({
  visible,
  mode,
  room,
  campList,
  roomTypeList,
  defaultCampId,
  onCancel,
  onOk,
  onCampChange,
}: RoomModalProps) {
  const [form] = Form.useForm();
  const { shouldShowCampFilter, currentCampId } = useCampFilter();

  // 根据选中的营地筛选房间类型
  const selectedCampId = Form.useWatch('campId', form);
  // 如果不是超级管理员，使用当前用户的营地ID；否则使用表单中选择的营地ID
  const actualCampId = shouldShowCampFilter() ? selectedCampId : (currentCampId || selectedCampId);
  const filteredRoomTypes = useMemo(() => {
    if (!actualCampId) {
      // 如果没有营地ID，返回空数组
      return [];
    }
    // 只返回匹配当前营地ID的房间类型
    return roomTypeList.filter(rt => rt.campId === actualCampId);
  }, [roomTypeList, actualCampId]);

  // 按 roomName 去重后的房间类型列表
  const deduplicatedRoomTypes = useMemo(() => {
    const roomNameMap = new Map<string, RoomType>();
    filteredRoomTypes.forEach(rt => {
      if (!roomNameMap.has(rt.roomName)) {
        roomNameMap.set(rt.roomName, rt);
      }
    });
    return Array.from(roomNameMap.values());
  }, [filteredRoomTypes]);

  // 监听房间类型变化，自动填充床位数和床位类型
  const selectedTypeId = Form.useWatch('typeId', form);
  const bedCountRef = useRef<number | null>(null);
  const selectedBedCount = Form.useWatch('bedCount', form);
  
  // 计算当前选中的bedCount，用于判断是否允许选择上下床
  const currentBedCount = useMemo(() => {
    if (selectedBedCount !== undefined) {
      return selectedBedCount;
    }
    if (selectedTypeId) {
      const roomType = filteredRoomTypes.find(rt => rt.roomTypeId === selectedTypeId);
      return roomType?.bedCount;
    }
    return undefined;
  }, [selectedBedCount, selectedTypeId, filteredRoomTypes]);
  
  useEffect(() => {
    if (selectedTypeId) {
      const roomType = filteredRoomTypes.find(rt => rt.roomTypeId === selectedTypeId);
      if (roomType) {
        if (roomType.bedCount !== bedCountRef.current) {
          bedCountRef.current = roomType.bedCount;
          // 如果床位数<2，强制设置为普通床位（bedType=0）
          const bedType = roomType.bedCount >= 2 ? roomType.bedType : 0;
          form.setFieldsValue({ 
            bedCount: roomType.bedCount,
            bedType,
          });
        }
      }
    }
  }, [selectedTypeId, filteredRoomTypes, form]);
  
  // 监听bedCount变化，如果床位数<2，强制设置为普通床位
  useEffect(() => {
    if (selectedBedCount !== undefined && selectedBedCount < 2) {
      const currentBedType = form.getFieldValue('bedType');
      if (currentBedType === 1) {
        form.setFieldsValue({ bedType: 0 });
      }
    }
  }, [selectedBedCount, form]);

  // 使用 ref 记录是否已经初始化过，避免重复调用 onCampChange
  const initializedRef = useRef(false);
  const visibleRef = useRef(visible);
  // 保存编辑模式下的原始表单值，用于失败后恢复
  const originalFormValuesRef = useRef<Record<string, any> | null>(null);

  useEffect(() => {
    visibleRef.current = visible;
  }, [visible]);

  useEffect(() => {
    if (!visible) {
      // 弹窗关闭时重置状态
      initializedRef.current = false;
      bedCountRef.current = null;
      originalFormValuesRef.current = null;
      return;
    }

    // 弹窗打开时的初始化
    if (mode === 'edit' && room && !initializedRef.current) {
      // 编辑模式下，如果 roomTypeList 中没有该营地的数据，先加载数据
      if (room.campId && onCampChange) {
        const hasCampRoomTypes = roomTypeList.some(rt => rt.campId === room.campId);
        const hasCurrentRoomType = roomTypeList.some(rt => rt.roomTypeId === room.typeId);
        
        if (!hasCampRoomTypes || !hasCurrentRoomType) {
          // 先加载房间类型数据
          onCampChange(room.campId);
          // 不在这里设置表单值，等待 roomTypeList 更新后再设置（由第二个 useEffect 处理）
          return;
        }
      }
      
      // 在编辑模式下，需要从 roomTypeList 中找到对应的 roomType 以获取 bedType
      const roomType = roomTypeList.find(rt => rt.roomTypeId === room.typeId);
      const initialValues = {
        campId: room.campId,
        typeId: room.typeId,
        roomNum: room.roomNum,
        bedCount: room.bedCount,
        bedType: roomType?.bedType ?? 0,
        status: room.status,
      };
      form.setFieldsValue(initialValues);
      // 保存原始表单值，用于失败后恢复
      originalFormValuesRef.current = { ...initialValues };
      bedCountRef.current = room.bedCount;
      initializedRef.current = true;
    } else if (mode === 'create') {
      // 创建模式下，只在首次打开时初始化
      if (!initializedRef.current) {
        form.resetFields();
        // 如果不是超级管理员，使用当前用户的营地ID；否则使用 defaultCampId
        const initialCampId = shouldShowCampFilter() ? defaultCampId : (currentCampId || defaultCampId);
        form.setFieldsValue({ 
          campId: initialCampId,
          status: 1,
        });
        initializedRef.current = true;
        
        // 异步调用，避免阻塞渲染
        if (initialCampId && onCampChange) {
          // 使用 requestAnimationFrame 确保在下一次渲染后调用
          requestAnimationFrame(() => {
            if (visibleRef.current) {
              onCampChange(initialCampId);
            }
          });
        }
      }
    }
  }, [visible, mode, room?.roomId, defaultCampId, roomTypeList.length, form, onCampChange, shouldShowCampFilter, currentCampId]); // 只依赖 roomTypeList.length，避免在 roomTypeList 内容变化时重新初始化已填充的表单

  // 编辑模式下，当 roomTypeList 更新后，如果还没有设置表单值，则设置表单值
  useEffect(() => {
    // 只有在弹窗打开、编辑模式、有房间数据、且还未初始化时才执行
    if (visible && mode === 'edit' && room && !initializedRef.current) {
      // 检查是否已经有该营地的房间类型数据，并且包含当前房间的类型
      const hasCampRoomTypes = roomTypeList.some(rt => rt.campId === room.campId);
      const hasCurrentRoomType = roomTypeList.some(rt => rt.roomTypeId === room.typeId);
      
      if (hasCampRoomTypes && hasCurrentRoomType) {
        // 从 roomTypeList 中找到对应的 roomType 以获取 bedType
        const roomType = roomTypeList.find(rt => rt.roomTypeId === room.typeId);
        const initialValues = {
          campId: room.campId,
          typeId: room.typeId,
          roomNum: room.roomNum,
          bedCount: room.bedCount,
          bedType: roomType?.bedType ?? 0,
          status: room.status,
        };
        form.setFieldsValue(initialValues);
        // 保存原始表单值，用于失败后恢复
        originalFormValuesRef.current = { ...initialValues };
        bedCountRef.current = room.bedCount;
        initializedRef.current = true;
      }
    }
  }, [visible, mode, room?.roomId, roomTypeList.length, form]); // 只依赖 room.roomId 而不是整个 room 对象，避免不必要的重新渲染

  const handleSubmit = async () => {
    // 在提交前，保存当前表单的所有值，用于失败后恢复
    const currentValues = form.getFieldsValue();
    
    try {
      const values = await form.validateFields();
      // 排除 bedType 字段，因为 Room 接口中没有这个字段，后端会从 roomType 中获取
      const { bedType, ...roomValues } = values;
      // 如果不是超级管理员，强制使用当前用户的营地ID
      if (!shouldShowCampFilter() && currentCampId) {
        roomValues.campId = currentCampId;
      }
      // 注意：onOk 是异步的，如果失败会抛出错误，成功时由父组件关闭弹窗并重置表单
      await onOk(roomValues);
      // 只有成功时才重置表单（实际上成功时弹窗会关闭，这里重置是为了保险）
      // form.resetFields();
      // 清空保存的原始值
      originalFormValuesRef.current = null;
    } catch (err) {
      // 表单验证失败或业务错误时，恢复提交前的表单值
      console.error('表单提交失败:', err);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={mode === 'create' ? '新增房间' : '编辑房间'}
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
          <Select 
            key="camp-select"
            placeholder="请选择所属营地"
            disabled={mode === 'edit'}
            onChange={async (value: number) => {
              // 切换营地时，先清空房间类型、床位数和床位类型
              form.setFieldsValue({ typeId: undefined, bedCount: undefined, bedType: undefined });
              bedCountRef.current = null;
              // 通知父组件营地改变，以便更新房间类型列表
              // 等待数据加载完成后再继续
              if (onCampChange) {
                try {
                  await onCampChange(value);
                  // 数据加载完成后，确保房间类型下拉列表已更新
                  // 强制重新渲染（通过 form 的 field 更新）
                  form.setFieldsValue({ campId: value });
                } catch (error) {
                  console.error('加载房间类型失败:', error);
                }
              }
            }}
          >
            {campList.map((camp) => (
              <Select.Option key={camp.campId} value={camp.campId}>
                {camp.campName}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="typeId"
          label="房间类型"
          rules={[{ required: true, message: '请选择房间类型' }]}
        >
          <Select 
            key={`room-type-select-${selectedCampId || 'none'}-${deduplicatedRoomTypes.length}-${roomTypeList.length}`}
            placeholder="请选择房间类型"
            disabled={!selectedCampId}
            showSearch
            loading={!!(mode === 'edit' && room && !deduplicatedRoomTypes.some(rt => rt.roomTypeId === room.typeId) && selectedCampId === room.campId)}
            notFoundContent={deduplicatedRoomTypes.length === 0 && selectedCampId ? '暂无房间类型数据' : '暂无数据'}
            filterOption={(input, option) => {
              const label = option?.label as string;
              return label?.toLowerCase().includes(input.toLowerCase()) ?? false;
            }}
            onChange={(value: number) => {
              bedCountRef.current = null;
              // 选择房间类型时，自动填充床位类型和床位数（如果存在）
              const roomType = filteredRoomTypes.find(rt => rt.roomTypeId === value);
              if (roomType) {
                form.setFieldsValue({ 
                  bedType: roomType.bedType,
                  bedCount: roomType.bedCount,
                });
                bedCountRef.current = roomType.bedCount;
              }
            }}
          >
            {deduplicatedRoomTypes.map((rt) => (
              <Select.Option key={rt.roomTypeId} value={rt.roomTypeId} label={rt.roomName}>
                {rt.roomName}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="bedType"
          label="床位类型"
          rules={[
            { required: true, message: '请选择床位类型' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                const bedCount = getFieldValue('bedCount');
                if (bedCount !== undefined && bedCount < 2 && value === 1) {
                  return Promise.reject(new Error('只有床位数≥2的房间才能选择上下床'));
                }
                return Promise.resolve();
              },
            }),
          ]}
        >
          <Select 
            placeholder="请选择床位类型"
            disabled={currentBedCount !== undefined && currentBedCount < 2}
          >
            <Select.Option value={0}>普通床位</Select.Option>
            <Select.Option value={1} disabled={currentBedCount !== undefined && currentBedCount < 2}>
              上下床
            </Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="roomNum"
          label="房间号"
          rules={[
            { required: true, message: '请输入房间号' },
            { max: 50, message: '房间号最多50个字符' },
          ]}
        >
          <Input placeholder="请输入房间号，如：101、201等" />
        </Form.Item>

        <Form.Item
          name="bedCount"
          label="床位数"
          rules={[
            { required: true, message: '床位数不能为空' },
            { type: 'number', min: 1, message: '床位数必须大于0' },
          ]}
        >
          <Input
            disabled
            placeholder="根据房间类型自动填充"
            suffix="人"
          />
        </Form.Item>

        <Form.Item
          name="status"
          label="状态"
          rules={[{ required: true, message: '请选择状态' }]}
        >
          <Select placeholder="请选择状态">
            <Select.Option value={1}>可用</Select.Option>
            <Select.Option value={0}>不可用</Select.Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
}


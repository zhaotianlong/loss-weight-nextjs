'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ProTable, ProColumns, ActionType, ProFormInstance } from '@ant-design/pro-components';
import { Tag, Table, Space, Button, message, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { getRoomDetailList, createRoom, updateRoom, deleteRoom, type RoomDetail, type Room } from '@/service/room';
import { getCampList, type Camp } from '@/service/camp';
import { getRoomTypeList, type RoomType } from '@/service/room';
import { StatusTag } from '@/components/common';
import type { Student } from '@/service/student';
import { applyRenewStudent } from '@/service/student';
import { useCampFilter } from '@/hooks/useCampFilter';
import RoomModal from './components/RoomModal';
import RenewalModal from './components/RenewalModal';
import CheckinStudentModal from './components/CheckinStudentModal';
import ChangeBedModal from './components/ChangeBedModal';
import CheckoutStudentModal from './components/CheckoutStudentModal';
import { applyCheckinStudent, applyChangeBed, checkoutStudent } from '@/service/room';

// 默认房间类型列表
const DEFAULT_ROOM_TYPES = ['单人间', '双人间', '三人间', '四人间', '六人间', '八人间', '十人间'] as const;

export default function HouseListPage() {
  const actionRef = useRef<ActionType>(null);
  const formRef = useRef<ProFormInstance | undefined>(undefined);
  const [campList, setCampList] = useState<Camp[]>([]);
  const [roomTypeList, setRoomTypeList] = useState<RoomType[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingRoom, setEditingRoom] = useState<RoomDetail | null>(null);
  const [renewalVisible, setRenewalVisible] = useState(false);
  const [renewalStudent, setRenewalStudent] = useState<Student | null>(null);
  const [checkinVisible, setCheckinVisible] = useState(false);
  const [checkinBed, setCheckinBed] = useState<{ bedId: number; bedNum: string; roomCampId: number; roomId?: number; roomTypeId?: number } | null>(null);
  const [changeBedVisible, setChangeBedVisible] = useState(false);
  const [changeBedInfo, setChangeBedInfo] = useState<{ currentBedId: number; currentBedNum: string; studentId: number; roomCampId: number; roomId: number } | null>(null);
  const [checkoutVisible, setCheckoutVisible] = useState(false);
  const [checkoutInfo, setCheckoutInfo] = useState<{ bedId: number; bedNum: string; student: Student } | null>(null);
  const { shouldShowCampFilter, getCampIdForQuery, getDefaultCampId, currentCampId } = useCampFilter();

  // 根据营地ID获取房间类型列表
  const fetchRoomTypesByCamp = useCallback(async (campId?: number) => {
    try {
      const targetCampId = campId || getDefaultCampId();
      if (!targetCampId) {
        // 如果没有营地ID，获取所有房间类型（仅超级管理员可能遇到）
        const roomTypeRes = await getRoomTypeList({ pageSize: 1000 });
        setRoomTypeList(roomTypeRes.data || []);
        return;
      }
      const roomTypeRes = await getRoomTypeList({ 
        pageSize: 1000,
        campId: targetCampId 
      });
      setRoomTypeList(roomTypeRes.data || []);
    } catch (error) {
      console.error('获取房间类型列表失败:', error);
    }
  }, [getDefaultCampId]);

  // 获取营地列表
  useEffect(() => {
    const fetchCamps = async () => {
      try {
        const campRes = await getCampList({ pageSize: 1000 });
        setCampList(campRes.data || []);
      } catch (error) {
        console.error('获取营地列表失败:', error);
      }
    };
    fetchCamps();
  }, []);

  // 初始化时加载房间类型列表
  useEffect(() => {
    // 如果是非超级管理员，使用当前用户的营地ID
    // 如果是超级管理员，等待用户选择营地，初始状态下 roomTypeList 为空数组，会显示默认选项
    if (!shouldShowCampFilter() && currentCampId) {
      // 非超级管理员，使用默认营地ID，直接在 useEffect 中处理异步逻辑
      (async () => {
        try {
          const roomTypeRes = await getRoomTypeList({ 
            pageSize: 1000,
            campId: currentCampId 
          });
          setRoomTypeList(roomTypeRes.data || []);
        } catch (error) {
          console.error('获取房间类型列表失败:', error);
        }
      })();
    }
    // 超级管理员：初始状态下 roomTypeList 为空数组（useState 的初始值），会显示默认选项
    // 用户选择营地后会自动加载该营地的房间类型
  }, [shouldShowCampFilter, currentCampId]);

  // 根据床位号判断上下铺
  const getBedPosition = (bedNum: string, index: number, bedCount: number): string => {
    const match = bedNum.match(/-(\d+)$/);
    if (match) {
      const bedIndex = parseInt(match[1]);
      if (bedCount === 1) return '下铺';
      if (bedCount === 2) {
        return bedIndex === 1 ? '下铺' : '上铺';
      }
      return bedIndex % 2 === 1 ? '下铺' : '上铺';
    }
    return index % 2 === 0 ? '下铺' : '上铺';
  };

  // 获取学员性别显示
  const getGenderDisplay = (idCard: string): string => {
    if (!idCard || idCard.length < 17) return '未知';
    const genderCode = parseInt(idCard.charAt(16));
    return genderCode % 2 === 0 ? '女' : '男';
  };

  // 计算到期日期
  const getExpireDate = (student?: Student): string | null => {
    if (!student) return null;
    if (student.checkoutDate) {
      return student.checkoutDate;
    }
    if (student.checkinDate) {
      const checkin = new Date(student.checkinDate);
      const expire = new Date(checkin);
      expire.setDate(expire.getDate() + 30);
      return expire.toISOString().split('T')[0];
    }
    return null;
  };

  // 判断是否已到期
  const isExpired = (expireDate: string | null): boolean => {
    if (!expireDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expire = new Date(expireDate);
    expire.setHours(0, 0, 0, 0);
    return expire < today;
  };

  // 检查房间中是否有学员到期
  const hasExpiredStudent = (record: RoomDetail): boolean => {
    return record.beds.some(bed => {
      if (!bed.student) return false;
      const expireDate = getExpireDate(bed.student);
      return isExpired(expireDate);
    });
  };

  // 处理删除
  const handleDelete = async (id: number) => {
    try {
      await deleteRoom(id);
      message.success('房间已删除');
      actionRef.current?.reload();
    } catch (error) {
      // 错误消息已在响应拦截器中统一处理，这里不需要再次显示
      console.error('删除房间失败:', error);
    }
  };

  // 处理新增
  const handleCreate = () => {
    setModalMode('create');
    setEditingRoom(null);
    setModalVisible(true);
  };

  // 处理编辑
  const handleEdit = (room: RoomDetail) => {
    setEditingRoom(room);
    setModalMode('edit');
    setModalVisible(true);
  };

  // 处理模态框确定
  const handleModalOk = async (values: Omit<Room, 'roomId'>) => {
    try {
      if (modalMode === 'create') {
        await createRoom(values);
        message.success('房间创建成功');
      } else {
        if (editingRoom) {
          await updateRoom(editingRoom.roomId, values);
          message.success('房间更新成功');
        }
      }
      setModalVisible(false);
      actionRef.current?.reload();
    } catch (error: any) {
      // 如果是业务错误，错误消息已经在响应拦截器中显示，不需要再次显示
      // 只有网络错误或其他未处理的错误才显示通用错误消息
      if (!error?.isBusinessError) {
        message.error(modalMode === 'create' ? '创建失败' : '更新失败');
      }
      // 业务错误时，不关闭弹窗，保持表单数据
      // 网络错误时，也不关闭弹窗，让用户重试
    }
  };

  // 处理模态框取消
  const handleModalCancel = () => {
    setModalVisible(false);
    setEditingRoom(null);
  };

  // 处理续租
  const handleRenewal = async (params: {
    stuId: number;
    days: number;
    originalAmount: number;
    actualAmount: number;
  }) => {
    if (!renewalStudent) return;
    try {
      const res = await applyRenewStudent(params);
      message.success(res.msg || '申请成功');
      setRenewalVisible(false);
      setRenewalStudent(null);
      // 刷新列表，确保更新两处显示：
      // 1. 床位表格中的到期状态显示
      // 2. 房间号的警告图标显示
      // 强制刷新列表：确保获取最新数据并更新显示
      // 使用 setTimeout 确保数据更新完成后再刷新
      setTimeout(() => {
        if (actionRef.current) {
          // 先重置页码，然后重新加载数据
          // reload(true) 会重置到第一页并重新请求数据
          actionRef.current.reload(true);
        }
      }, 200); // 增加延迟时间，确保后端数据更新完成
    } catch (error: any) {
      if (!error?.isBusinessError) {
        message.error('续租失败');
      }
      // 续租失败时保持弹窗打开，不关闭
    }
  };

  // 处理续租取消
  const handleRenewalCancel = () => {
    setRenewalVisible(false);
    setRenewalStudent(null);
  };

  // 处理入住学员
  const handleCheckinStudent = async (params: {
    stuId: number;
    checkinDate: string;
    originalAmount: number;
    actualAmount: number;
  }) => {
    if (!checkinBed) return;
    try {
      const res = await applyCheckinStudent({
        ...params,
        bedId: checkinBed.bedId,
        bedNum: checkinBed.bedNum,
        roomId: checkinBed.roomId,
        roomTypeId: checkinBed.roomTypeId,
      });
      message.success(res.msg || '申请成功');
      setCheckinVisible(false);
      setCheckinBed(null);
      // 刷新列表
      setTimeout(() => {
        if (actionRef.current) {
          actionRef.current.reload(true);
        }
      }, 200);
    } catch (error: any) {
      if (!error?.isBusinessError) {
        message.error('学员入住失败');
      }
    }
  };

  // 处理入住学员取消
  const handleCheckinCancel = () => {
    setCheckinVisible(false);
    setCheckinBed(null);
  };

  // 处理更换床位
  const handleChangeBed = async (params: {
    newBedId: number;
    originalAmount: number;
    actualAmount: number;
  }) => {
    if (!changeBedInfo) return;
    try {
      await applyChangeBed({
        currentBedId: changeBedInfo.currentBedId,
        newBedId: params.newBedId,
        stuId: changeBedInfo.studentId,
        originalAmount: params.originalAmount,
        actualAmount: params.actualAmount,
      });
      message.success('更换床位申请成功，请等待财务审核');
      setChangeBedVisible(false);
      setChangeBedInfo(null);
      // 刷新列表
      setTimeout(() => {
        if (actionRef.current) {
          actionRef.current.reload(true);
        }
      }, 200);
    } catch (error: any) {
      if (!error?.isBusinessError) {
        message.error('更换床位申请失败');
      }
    }
  };

  // 处理更换床位取消
  const handleChangeBedCancel = () => {
    setChangeBedVisible(false);
    setChangeBedInfo(null);
  };

  // 处理学员离营
  const handleCheckoutStudent = async (checkoutDate: string) => {
    if (!checkoutInfo) return;
    try {
      await checkoutStudent({
        bedId: checkoutInfo.bedId,
        stuId: checkoutInfo.student.stuId,
        checkoutDate,
      });
      message.success('学员离营成功');
      setCheckoutVisible(false);
      setCheckoutInfo(null);
      // 刷新列表
      setTimeout(() => {
        if (actionRef.current) {
          actionRef.current.reload(true);
        }
      }, 200);
    } catch (error: any) {
      if (!error?.isBusinessError) {
        message.error('学员离营失败');
      }
    }
  };

  // 处理学员离营取消
  const handleCheckoutCancel = () => {
    setCheckoutVisible(false);
    setCheckoutInfo(null);
  };

  // 床位和学员的嵌套表格列（使用普通 Table 列类型）
  const bedColumns = [
    {
      title: '床位号',
      dataIndex: 'bedNum',
      key: 'bedNum',
      width: 250,
      render: (_: unknown, record: RoomDetail['beds'][0] & { __room?: RoomDetail; __index?: number }) => {
        const room = record.__room;
        if (!room) return '-';
        const index = record.__index ?? 0;
        const bedCount = room.roomType?.bedCount || room.bedCount || 0;
        const bedType = room.roomType?.bedType ?? 0;
        const roomTypeName = room.roomType?.roomName || '未知类型';
        
        // 判断上铺/下铺/普通床位
        let positionLabel = '';
        if (bedType === 0) {
          positionLabel = '普通床位';
        } else {
          positionLabel = getBedPosition(record.bedNum, index, bedCount);
        }
        
        return `${record.bedNum} ${roomTypeName}（${positionLabel}）`;
      },
    },
    {
      title: '学员姓名',
      dataIndex: ['student', 'name'],
      key: 'studentName',
      width: 120,
      render: (_: unknown, record: RoomDetail['beds'][0]) => {
        return record.student?.name || '-';
      },
    },
    {
      title: '性别',
      dataIndex: ['student', 'idCard'],
      key: 'gender',
      width: 80,
      render: (_: unknown, record: RoomDetail['beds'][0]) => {
        if (!record.student?.idCard) return '-';
        return getGenderDisplay(record.student.idCard);
      },
    },
    {
      title: '状态',
      key: 'expireStatus',
      width: 200,
      render: (_: unknown, record: RoomDetail['beds'][0]) => {
        if (record.status === 2) {
          return <Tag color="warning">预留审核中</Tag>;
        }
        if (!record.student) {
          return <Tag>空床位</Tag>;
        }
        const expireDate = getExpireDate(record.student);
        const expired = isExpired(expireDate);
        if (expireDate) {
          return (
            <Space>
              <span
                style={{
                  display: 'inline-block',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: expired ? '#ff4d4f' : '#52c41a',
                }}
              />
              <span style={{ color: expired ? '#ff4d4f' : '#666' }}>
                {expired ? '已到期' : '未到期'} ({expireDate}到期)
              </span>
            </Space>
          );
        }
        return <Tag color="blue">在住</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 250,
      render: (_: unknown, record: RoomDetail['beds'][0] & { __room?: RoomDetail }) => {
        if (record.status === 2) {
          return <span style={{ color: '#999' }}>审核中，暂不可操作</span>;
        }
        if (!record.student) {
          // 无人床位：显示入住学员按钮
          const room = record.__room;
          if (!room) return '-';
          return (
            <Button 
              type="link" 
              size="small"
              onClick={() => {
                setCheckinBed({
                  bedId: record.bedId || 0,
                  bedNum: record.bedNum,
                  roomCampId: room.campId,
                  roomId: room.roomId,
                  roomTypeId: record.roomTypeId,
                });
                setCheckinVisible(true);
              }}
            >
              入住学员
            </Button>
          );
        }
        // 有人床位：显示续租、更换床位和离营按钮
        const room = record.__room;
        if (!room) return '-';
        return (
          <Space size="small">
            <Button 
              type="link" 
              size="small"
              onClick={() => {
                setRenewalStudent(record.student || null);
                setRenewalVisible(true);
              }}
            >
              续租
            </Button>
            <Button 
              type="link" 
              size="small"
              onClick={() => {
                setChangeBedInfo({
                  currentBedId: record.bedId,
                  currentBedNum: record.bedNum,
                  studentId: record.student!.stuId,
                  roomCampId: room.campId,
                  roomId: room.roomId,
                });
                setChangeBedVisible(true);
              }}
            >
              更换床位
            </Button>
            <Button 
              type="link" 
              size="small"
              danger
              onClick={() => {
                setCheckoutInfo({
                  bedId: record.bedId,
                  bedNum: record.bedNum,
                  student: record.student!,
                });
                setCheckoutVisible(true);
              }}
            >
              离营
            </Button>
          </Space>
        );
      },
    },
  ];

  // 主表格列
  const columns: ProColumns<RoomDetail>[] = [
    ...(shouldShowCampFilter() ? [{
      title: '营地',
      dataIndex: 'campId',
      key: 'campId',
      width: 150,
      valueType: 'select' as const,
      valueEnum: campList.reduce((acc, camp) => {
        acc[camp.campId] = { text: camp.campName };
        return acc;
      }, {} as Record<number, { text: string }>),
      hideInTable: false, // 在表格中显示
      hideInSearch: false, // 在搜索表单中显示
      // 超级管理员默认不选中营地，保持为空
      // initialValue: undefined,
      fieldProps: {
        placeholder: '请选择营地',
        allowClear: true,
        options: campList.map(camp => ({
          label: camp.campName,
          value: camp.campId,
        })),
        onChange: async (value: number | undefined) => {
          formRef.current?.setFieldsValue({ campId: value });
          if (value) {
            // 根据选中的营地重新加载房间类型列表
            await fetchRoomTypesByCamp(value);
          } else {
            // 如果清空营地选择，清空房间类型列表（这样会显示默认选项）
            setRoomTypeList([]);
          }
          // 清空房间类型的选择，因为切换营地后之前的房间类型可能不适用
          formRef.current?.setFieldsValue({ roomName: undefined });
          // 选择营地后立即触发表单提交，从而筛选数据
          formRef.current?.submit();
        },
      },
      render: (_: unknown, record: RoomDetail) => {
        const camp = campList.find(c => c.campId === record.campId);
        return camp?.campName || '-';
      },
    }] : []),
    // 非超级管理员也需要在表格中显示所属营地
    ...(!shouldShowCampFilter() ? [{
      title: '所属营地',
      dataIndex: 'campId',
      key: 'campId',
      width: 150,
      hideInSearch: true, // 不在搜索表单中显示
      render: (_: unknown, record: RoomDetail) => {
        const camp = campList.find(c => c.campId === record.campId);
        return camp?.campName || '-';
      },
    }] : []),
    {
      title: '房间号',
      dataIndex: 'roomNum',
      key: 'roomNum',
      width: 150,
      hideInSearch: false, // 在搜索表单中显示
      fieldProps: {
        placeholder: '请输入房间号',
        onPressEnter: () => {
          // 输入框回车后立即触发表单提交，从而筛选数据
          formRef.current?.submit();
        },
      },
      render: (_: unknown, record: RoomDetail) => {
        const roomNum = record.roomNum.split('-').pop() || record.roomNum;
        const hasExpired = hasExpiredStudent(record);
        return (
          <Space>
            {hasExpired && (
              <ExclamationCircleOutlined 
                style={{ color: '#ff4d4f', fontSize: '16px' }}
                title="该房间有学员已到期"
              />
            )}
            <strong>{roomNum}</strong>
          </Space>
        );
      },
    },
    {
      title: '房间类型',
      dataIndex: 'roomName',
      key: 'roomName',
      width: 120,
      valueType: 'select',
      valueEnum: (() => {
        // 如果房间类型列表为空，返回默认选项的 valueEnum
        if (roomTypeList.length === 0) {
          const result: Record<string, { text: string }> = {};
          DEFAULT_ROOM_TYPES.forEach(rt => {
            result[rt] = { text: rt };
          });
          return result;
        }
        // 按 roomName 去重，相同的房间类型名称只保留一个选项
        const roomNameSet = new Set<string>();
        const result: Record<string, { text: string }> = {};
        roomTypeList.forEach(rt => {
          if (!roomNameSet.has(rt.roomName)) {
            roomNameSet.add(rt.roomName);
            result[rt.roomName] = { text: rt.roomName };
          }
        });
        return result;
      })(),
      hideInSearch: false, // 在搜索表单中显示
      fieldProps: {
        placeholder: '请选择房间类型',
        options: (() => {
          // 如果房间类型列表为空，返回默认选项
          if (roomTypeList.length === 0) {
            return DEFAULT_ROOM_TYPES.map(rt => ({
              label: rt,
              value: rt,
            }));
          }
          // 按 roomName 去重，生成下拉选项
          const roomNameSet = new Set<string>();
          return roomTypeList
            .filter(rt => {
              if (roomNameSet.has(rt.roomName)) {
                return false;
              }
              roomNameSet.add(rt.roomName);
              return true;
            })
            .map(rt => ({
              label: rt.roomName,
              value: rt.roomName,
            }));
        })(),
        onChange: () => {
          // 选择房间类型后立即触发表单提交，从而筛选数据
          formRef.current?.submit();
        },
      },
      render: (_: unknown, record: RoomDetail) => {
        return record.roomType?.roomName || '-';
      },
    },
    {
      title: '床位类型',
      dataIndex: 'bedType',
      key: 'bedType',
      width: 120,
      valueType: 'select',
      valueEnum: {
        0: { text: '普通床位' },
        1: { text: '上下床' },
      },
      hideInTable: false, // 在表格中显示
      hideInSearch: false, // 在搜索表单中显示
      fieldProps: {
        placeholder: '请选择床位类型',
        onChange: () => {
          // 选择床位类型后立即触发表单提交，从而筛选数据
          formRef.current?.submit();
        },
      },
      render: (_: unknown, record: RoomDetail) => {
        const bedType = record.roomType?.bedType;
        if (bedType === undefined || bedType === null) return '-';
        return bedType === 0 ? '普通床位' : '上下床';
      },
    },
    {
      title: '床位数',
      dataIndex: 'bedCount',
      key: 'bedCount',
      width: 100,
      hideInSearch: true,
      render: (_: unknown, record: RoomDetail) => `${record.bedCount} 人`,
    },
    {
      title: '已入住',
      key: 'occupiedCount',
      width: 100,
      hideInSearch: true,
      render: (_: unknown, record: RoomDetail) => {
        const occupied = record.beds.filter(bed => bed.student).length;
        return `${occupied}/${record.bedCount}`;
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      valueType: 'dateTime',
      width: 160,
      sorter: true,
      hideInSearch: true,
      hideInForm: true,
    },
    {
      title: '更新时间',
      dataIndex: 'updateTime',
      key: 'updateTime',
      valueType: 'dateTime',
      width: 160,
      sorter: true,
      hideInSearch: true,
      hideInForm: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      valueType: 'select',
      valueEnum: {
        1: { text: '可用', status: 'Success' },
        0: { text: '不可用', status: 'Default' },
      },
      hideInSearch: false, // 在搜索表单中显示
      fieldProps: {
        placeholder: '请选择状态',
        onChange: () => {
          // 选择状态后立即触发表单提交，从而筛选数据
          formRef.current?.submit();
        },
      },
      render: (_: unknown, record: RoomDetail) => <StatusTag status={record.status} />,
    },
    {
      title: '学员名称',
      dataIndex: 'studentName',
      key: 'studentName',
      hideInTable: true, // 不在表格中显示
      hideInSearch: false, // 在搜索表单中显示
      fieldProps: {
        placeholder: '请输入学员名称',
        onPressEnter: () => {
          // 输入框回车后立即触发表单提交，从而筛选数据
          formRef.current?.submit();
        },
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      valueType: 'option',
      hideInSearch: true,
      render: (_: unknown, record: RoomDetail) => (
        <Space size="small">
          <Button 
            type="link" 
            size="small" 
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="删除房间"
            description="确定要删除该房间吗？删除后该房间的所有床位信息也会被删除。"
            onConfirm={() => handleDelete(record.roomId)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger size="small" icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <ProTable<RoomDetail>
        headerTitle="房源管理"
        actionRef={actionRef}
        formRef={formRef}
        rowKey="roomId"
        search={{
          labelWidth: 'auto',
          defaultCollapsed: false,
        }}
        toolBarRender={() => [
          <Button 
            type="primary" 
            key="primary" 
            icon={<PlusOutlined />}
            onClick={handleCreate}
          >
            新增房间
          </Button>,
        ]}
      request={async (params) => {
        try {
          // 确保分页参数有效
          const currentPage = params.current || 1;
          const currentPageSize = params.pageSize || 10;
          
          // 添加时间戳参数避免缓存，确保获取最新数据
          const response = await getRoomDetailList({
            page: currentPage,
            pageSize: currentPageSize,
            // 从context获取campId，非超级管理员强制使用当前用户的campId
            campId: getCampIdForQuery(params.campId ? Number(params.campId) : undefined),
            roomName: params.roomName,
            studentName: params.studentName,
            roomNum: params.roomNum,
            status: params.status ? Number(params.status) : undefined,
            bedType: params.bedType ? Number(params.bedType) : undefined,
            _t: Date.now(), // 添加时间戳避免缓存
          });
          
          return {
            data: response.data || [],
            success: response.success,
            total: response.meta?.total || 0,
          };
        } catch {
          return {
            data: [],
            success: false,
            total: 0,
          };
        }
      }}
      pagination={{
        defaultPageSize: 10,
        pageSizeOptions: ['10', '20', '50', '100'],
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条 / 共 ${total} 条`,
      }}
      columns={columns}
      expandable={{
        expandedRowRender: (record: RoomDetail) => {
          // 按房间容量填充所有床位（包括空床位）
          const bedCount = record.roomType?.bedCount || record.bedCount || 0;
          const bedsMap = new Map(record.beds.map(bed => [bed.bedNum, bed]));
          
          // 生成所有床位的列表
          const allBeds: Array<RoomDetail['beds'][0] & { __room?: RoomDetail }> = [];
          for (let i = 1; i <= bedCount; i++) {
            const bedNum = `${record.roomNum}-${i}`;
            const existingBed = bedsMap.get(bedNum);
            if (existingBed) {
              allBeds.push({
                ...existingBed,
                __room: record,
              });
            } else {
              // 创建空床位数据
              allBeds.push({
                bedId: 0, // 临时ID，实际床位可能还未创建
                roomId: record.roomId,
                roomTypeId: record.roomType?.roomTypeId || 0,
                bedNum,
                stuId: null,
                status: 1,
                __room: record,
              });
            }
          }
          
          // 为每个床位添加房间引用
          const bedsWithRoom = allBeds.map((bed, index) => ({
            ...bed,
            __index: index,
          }));

          return (
            <Table
              columns={bedColumns}
              dataSource={bedsWithRoom}
              rowKey={(record, index) => record.bedId || `empty-${index}`}
              pagination={false}
              size="small"
            />
          );
        },
        rowExpandable: (record: RoomDetail) => {
          const bedCount = record.roomType?.bedCount || record.bedCount || 0;
          return bedCount > 0;
        },
      }}
      />
      <RoomModal
        visible={modalVisible}
        mode={modalMode}
        room={editingRoom ? {
          roomId: editingRoom.roomId,
          campId: editingRoom.campId,
          typeId: editingRoom.typeId,
          roomNum: editingRoom.roomNum,
          bedCount: editingRoom.bedCount,
          status: editingRoom.status,
        } : null}
        campList={campList}
        roomTypeList={roomTypeList}
        defaultCampId={getDefaultCampId()}
        onCampChange={fetchRoomTypesByCamp}
        onCancel={handleModalCancel}
        onOk={handleModalOk}
      />
      <RenewalModal
        visible={renewalVisible}
        student={renewalStudent}
        onOk={handleRenewal}
        onCancel={handleRenewalCancel}
      />
      <CheckinStudentModal
        visible={checkinVisible}
        bedId={checkinBed?.bedId || 0}
        bedNum={checkinBed?.bedNum || ''}
        roomCampId={checkinBed?.roomCampId || 0}
        roomId={checkinBed?.roomId}
        roomTypeId={checkinBed?.roomTypeId}
        onOk={handleCheckinStudent}
        onCancel={handleCheckinCancel}
      />
      <ChangeBedModal
        visible={changeBedVisible}
        currentBedId={changeBedInfo?.currentBedId || 0}
        currentBedNum={changeBedInfo?.currentBedNum || ''}
        studentId={changeBedInfo?.studentId || 0}
        roomCampId={changeBedInfo?.roomCampId || 0}
        currentRoomId={changeBedInfo?.roomId || 0}
        onOk={handleChangeBed}
        onCancel={handleChangeBedCancel}
      />
      <CheckoutStudentModal
        visible={checkoutVisible}
        student={checkoutInfo?.student || null}
        bedNum={checkoutInfo?.bedNum || ''}
        onOk={handleCheckoutStudent}
        onCancel={handleCheckoutCancel}
      />
    </>
  );
}

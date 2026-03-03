'use client';

import React, { useRef, useState, useEffect } from 'react';
import { ProTable, ProColumns, ActionType, type ProFormInstance } from '@ant-design/pro-components';
import { Button, Space, message, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getStudentList, deleteStudent, createStudent, updateStudent, type Student } from '@/service/student';
import { getCampList, type Camp } from '@/service/camp';
import { StatusTag } from '@/components/common';
import { useMSW } from '@/mocks/MSWContext';
import { useCampFilter } from '@/hooks/useCampFilter';
import StudentModal from './components/StudentModal';
import BodyDataModal from './components/BodyDataModal';
import PrivateCourseRecordModal from './components/PrivateCourseRecordModal';
import StudentAssignModal from './components/StudentAssignModal';
import { assignStudentToCoach } from '@/service/coach';

export default function StudentPage() {
  const actionRef = useRef<ActionType>(undefined);
  const formRef = useRef<ProFormInstance>(undefined);
  const { isReady: mswReady } = useMSW();
  const [campList, setCampList] = useState<Camp[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [bodyDataModalVisible, setBodyDataModalVisible] = useState(false);
  const [privateRecordModalVisible, setPrivateRecordModalVisible] = useState(false);
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [assignStudent, setAssignStudent] = useState<Student | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [selectedStudentName, setSelectedStudentName] = useState<string>('');
  const { getCampIdForQuery, shouldShowCampFilter, getDefaultCampId } = useCampFilter();

  // 获取营地列表用于筛选
  useEffect(() => {
    const fetchCamps = async () => {
      try {
        const res = await getCampList({ pageSize: 1000 });
        setCampList(res.data || []);
      } catch (error) {
        console.error('获取营地列表失败:', error);
      }
    };
    fetchCamps();
  }, []);

  // 当 MSW 就绪后，自动刷新表格
  React.useEffect(() => {
    if (mswReady && actionRef.current) {
      actionRef.current.reload();
    }
  }, [mswReady]);

  const handleDelete = async (id: number) => {
    try {
      await deleteStudent(id);
      message.success('学员已删除');
      actionRef.current?.reload();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleCreate = () => {
    setModalMode('create');
    setEditingStudent(null);
    setModalVisible(true);
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setModalMode('edit');
    setModalVisible(true);
  };

  const handleModalOk = async (values: Omit<Student, 'stuId'>) => {
    try {
      if (modalMode === 'create') {
        await createStudent(values);
        message.success('学员创建成功');
      } else {
        if (editingStudent) {
          await updateStudent(editingStudent.stuId, values);
          message.success('学员更新成功');
        }
      }
      setModalVisible(false);
      actionRef.current?.reload();
    } catch {
      message.error(modalMode === 'create' ? '创建失败' : '更新失败');
    }
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    setEditingStudent(null);
  };

  const handleShowBodyData = (student: Student) => {
    setSelectedStudentId(student.stuId);
    setSelectedStudentName(student.name);
    setBodyDataModalVisible(true);
  };

  const handleBodyDataModalCancel = () => {
    setBodyDataModalVisible(false);
    setSelectedStudentId(null);
    setSelectedStudentName('');
  };

  const handleShowPrivateRecords = (student: Student) => {
    setSelectedStudentId(student.stuId);
    setSelectedStudentName(student.name);
    setPrivateRecordModalVisible(true);
  };

  const handlePrivateRecordModalCancel = () => {
    setPrivateRecordModalVisible(false);
    setSelectedStudentId(null);
    setSelectedStudentName('');
  };

  const handleAssignClick = (student: Student) => {
    setAssignStudent(student);
    setAssignModalVisible(true);
  };

  const handleAssignOk = async (values: any) => {
    try {
      await assignStudentToCoach(values);
      message.success('教练分配成功');
      setAssignModalVisible(false);
      setAssignStudent(null);
      actionRef.current?.reload();
    } catch (error) {
      message.error('分配失败');
    }
  };

  const handleAssignCancel = () => {
    setAssignModalVisible(false);
    setAssignStudent(null);
  };

  const columns: ProColumns<Student>[] = [
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
      initialValue: getDefaultCampId(),
      fieldProps: (form) => ({
        options: campList.map(camp => ({
          label: camp.campName,
          value: camp.campId,
        })),
        onChange: (value: number) => {
           form.setFieldsValue({ campId: value });
           form.submit();
         },
      }),
      render: (_: unknown, record: Student) => {
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
      render: (_: unknown, record: Student) => {
        const camp = campList.find(c => c.campId === record.campId);
        return camp?.campName || '-';
      },
    }] : []),
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      width: 120,
      fieldProps: {
        onPressEnter: () => {
          formRef.current?.submit();
        },
      },
      render: (_: any, record: Student) => <strong>{record.name}</strong>,
    },
    {
      title: '身份证号',
      dataIndex: 'idCard',
      key: 'idCard',
      width: 180,
      hideInSearch: true,
    },
    {
      title: '联系方式',
      dataIndex: 'phone',
      key: 'phone',
      width: 130,
    },
    {
      title: '入营日期',
      dataIndex: 'checkinDate',
      key: 'checkinDate',
      width: 120,
      valueType: 'date',
      hideInSearch: true,
    },
    {
      title: '退营日期',
      dataIndex: 'checkoutDate',
      key: 'checkoutDate',
      width: 120,
      valueType: 'date',
      hideInSearch: true,
      render: (_: any, record: Student) => record.checkoutDate || '-',
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
      width: 100,
      valueEnum: {
        1: { text: '在训', status: 'Success' },
        0: { text: '结营', status: 'Default' },
      },
    },
    {
      title: '负责教练',
      dataIndex: 'coachName',
      width: 120,
      render: (val: React.ReactNode) => val || '-',
    },
    {
      title: '操作',
      valueType: 'option',
      key: 'option',
      width: 320,
      render: (_, record: Student) => [
        <a key="assign" onClick={() => handleAssignClick(record)}>
          {record.coachName ? '更换教练' : '分配教练'}
        </a>,
        <a key="edit" onClick={() => handleEdit(record)}>
          编辑
        </a>,
        <a key="body" onClick={() => handleShowBodyData(record)}>
          身体数据
        </a>,
        <a key="private" onClick={() => handleShowPrivateRecords(record)}>
          私教记录
        </a>,
        <Popconfirm
          key="delete"
          title="删除学员"
          onConfirm={() => handleDelete(record.stuId)}
        >
          <a style={{ color: '#ff4d4f' }}>删除</a>
        </Popconfirm>,
      ],
    },
  ];

  return (
    <>
      <ProTable<Student>
        headerTitle="学员管理"
        actionRef={actionRef}
        formRef={formRef}
        rowKey="stuId"
        search={{
          labelWidth: 'auto',
        }}
        toolBarRender={() => [
          <Button 
            type="primary" 
            key="primary" 
            icon={<PlusOutlined />}
            onClick={handleCreate}
          >
            新增学员
          </Button>,
        ]}
        request={async (params) => {
          // 等待 MSW 启动完成
          if (!mswReady) {
            return {
              data: [],
              success: false,
              total: 0,
            };
          }

          try {
            const response = await getStudentList({
              page: params.current,
              pageSize: params.pageSize,
              name: params.name,
              phone: params.phone,
              // 从context获取campId，非超级管理员强制使用当前用户的campId
              campId: getCampIdForQuery(params.campId ? Number(params.campId) : undefined),
              status: params.status ? Number(params.status) : undefined,
            });
            return {
              data: response.data || [],
              success: response.success,
              total: response.meta?.total || 0,
            };
          } catch (error) {
            message.error('获取学员列表失败');
            return {
              data: [],
              success: false,
              total: 0,
            };
          }
        }}
        columns={columns}
      />
      <StudentModal
        visible={modalVisible}
        mode={modalMode}
        student={editingStudent}
        campList={campList}
        defaultCampId={getDefaultCampId()}
        onCancel={handleModalCancel}
        onOk={handleModalOk}
      />
      <BodyDataModal
        visible={bodyDataModalVisible}
        studentId={selectedStudentId || 0}
        studentName={selectedStudentName}
        onCancel={handleBodyDataModalCancel}
      />
      <PrivateCourseRecordModal
        visible={privateRecordModalVisible}
        studentId={selectedStudentId || 0}
        studentName={selectedStudentName}
        onCancel={handlePrivateRecordModalCancel}
      />
      <StudentAssignModal
        visible={assignModalVisible}
        student={assignStudent}
        onCancel={handleAssignCancel}
        onOk={handleAssignOk}
      />
    </>
  );
}
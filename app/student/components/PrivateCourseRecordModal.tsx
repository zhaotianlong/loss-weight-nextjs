'use client';

import React, { useState, useEffect } from 'react';
import { Modal, Tag, Space, Spin, Empty, Badge } from 'antd';
import type { ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { getStuPrivateRecords, type StuPrivateRecord, type StuClassRecord } from '@/service/student';
import dayjs from 'dayjs';

interface PrivateCourseRecordModalProps {
  visible: boolean;
  studentId: number;
  studentName: string;
  onCancel: () => void;
}

export default function PrivateCourseRecordModal({
  visible,
  studentId,
  studentName,
  onCancel,
}: PrivateCourseRecordModalProps) {
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState<StuPrivateRecord[]>([]);

  useEffect(() => {
    if (visible && studentId) {
      fetchRecords();
    }
  }, [visible, studentId]);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await getStuPrivateRecords(studentId);
      setRecords(res.data || []);
    } catch (error) {
      console.error('获取私教记录失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const classColumns: ProColumns<StuClassRecord>[] = [
    {
      title: '记录ID',
      dataIndex: 'recordId',
      key: 'recordId',
      width: 140,
    },
    {
      title: '上课教练',
      dataIndex: 'teachingCoach',
      key: 'teachingCoach',
    },
    {
      title: '上课地点',
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: '开始时间',
      dataIndex: 'startTime',
      key: 'startTime',
      render: (_, record) => dayjs(record.startTime).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '结束时间',
      dataIndex: 'endTime',
      key: 'endTime',
      render: (_, record) => dayjs(record.endTime).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '拍照打卡',
      dataIndex: 'photoUrl',
      key: 'photoUrl',
      render: (_, record) => record.photoUrl ? <img src={record.photoUrl} alt="打卡" style={{ width: 40, height: 40, borderRadius: 4 }} /> : '未打卡',
    },
  ];

  const columns: ProColumns<StuPrivateRecord>[] = [
    {
      title: '开单ID',
      dataIndex: 'orderId',
      key: 'orderId',
      width: 140,
    },
    {
      title: '时间节点',
      key: 'timeline',
      width: 180,
      render: (_, record) => (
        <div style={{ fontSize: '12px' }}>
          <div>开单: {record.orderTime}</div>
          {record.closeTime && <div>关单: {record.closeTime}</div>}
        </div>
      ),
    },
    {
      title: '私教课类型',
      dataIndex: 'courseType',
      key: 'courseType',
    },
    {
      title: '付费类型',
      dataIndex: 'paymentType',
      key: 'paymentType',
      render: (_, record) => (
        <Tag color={record.paymentType === '包月' ? 'blue' : 'default'}>{record.paymentType}</Tag>
      ),
    },
    {
      title: '原价/优惠价',
      key: 'price',
      render: (_, record) => (
        <Space size={4}>
          <span style={{ textDecoration: 'line-through', color: '#999' }}>¥{record.originalPrice}</span>
          <span style={{ color: '#f5222d' }}>¥{record.discountPrice}</span>
        </Space>
      ),
    },
    {
      title: '时长',
      dataIndex: 'duration',
      key: 'duration',
      render: (_, record) => {
        if (record.paymentType === '包月') {
          const total = record.totalSessions || 30; // 默认30天/节
          return `${record.usedSessions}/${total} 节`;
        } else {
          return `${record.usedSessions}/${record.totalSessions} 节`;
        }
      },
    },
    {
      title: '进度',
      dataIndex: 'status',
      key: 'status',
      render: (_, record) => {
        const statusMap = {
          '开单': { color: 'default', text: '开单' },
          '上课中': { color: 'processing', text: '上课中' },
          '已完成': { color: 'success', text: '已完成' },
        };
        const config = statusMap[record.status as keyof typeof statusMap] || statusMap['开单'];
        return <Badge status={config.color as 'default' | 'processing' | 'success'} text={config.text} />;
      },
    },
    {
      title: '总价',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      valueType: 'money',
    },
    {
      title: '开单教练',
      dataIndex: 'bookingCoach',
      key: 'bookingCoach',
    },
  ];

  const expandedRowRender = (record: StuPrivateRecord) => {
    return (
      <ProTable
        columns={classColumns}
        headerTitle={false}
        search={false}
        options={false}
        dataSource={record.classRecords}
        pagination={{ pageSize: 5 }}
        rowKey="id"
      />
    );
  };

  return (
    <Modal
      title={`${studentName} - 私教记录`}
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={1000}
      centered
      destroyOnClose
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin tip="加载中..." />
        </div>
      ) : (
        <ProTable<StuPrivateRecord>
          columns={columns}
          dataSource={records}
          rowKey="id"
          search={false}
          options={false}
          pagination={{ pageSize: 5 }}
          expandable={{ expandedRowRender }}
          locale={{ emptyText: <Empty description="暂无私教记录" /> }}
        />
      )}
    </Modal>
  );
}

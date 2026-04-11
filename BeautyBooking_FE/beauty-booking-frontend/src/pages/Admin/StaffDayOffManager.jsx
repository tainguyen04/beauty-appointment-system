import React, { useState, useEffect, useCallback } from 'react';
import { 
  Table, Tag, Button, Space, Card, Typography, Modal, 
  message, Avatar, Dropdown, Segmented, Input, DatePicker 
} from 'antd';
import { 
  CheckCircleOutlined, CloseCircleOutlined, 
  MoreOutlined, ClockCircleOutlined, 
  UserOutlined, SearchOutlined 
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { usePagination } from '../../hooks/usePagination';
import staffDayOffApi from '../../api/staffDayOffApi';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const StaffDayOffManager = () => {
  // 1. Pagination Hook - Đồng bộ Params với API mới
  const { data, loading, pagination, runFetch, handleTableChange, handleFilterChange } = usePagination(staffDayOffApi.getAllWithStaff);

  const [filterStatus, setFilterStatus] = useState('All');

  useEffect(() => {
    runFetch();
  }, [runFetch]);

  // 2. Xử lý Phê duyệt / Từ chối (Dùng useCallback để ổn định tham chiếu)
  const handleAction = useCallback(async (id, action) => {
    try {
      if (action === 'approve') await staffDayOffApi.approve(id);
      else if (action === 'reject') await staffDayOffApi.reject(id);
      
      message.success(`Đã ${action === 'approve' ? 'phê duyệt' : 'từ chối'} đơn nghỉ`);
      runFetch();
    } catch (error) {
      message.error("Thao tác thất bại", error);
    }
  }, [runFetch]);

  // 3. Xử lý lọc ngày (FromDate - ToDate)
  const onRangeChange = (dates) => {
    if (dates) {
      handleFilterChange({
        FromDate: dates[0].format('YYYY-MM-DD'),
        ToDate: dates[1].format('YYYY-MM-DD'),
      });
    } else {
      handleFilterChange({ FromDate: undefined, ToDate: undefined });
    }
  };

  const columns = [
    {
      title: 'Nhân viên',
      key: 'staff',
      render: (_, record) => (
        <Space>
          <Avatar size="small" src={record.avatarUrl} icon={<UserOutlined />} />
          <div>
            <Text strong style={{ fontSize: '13px', display: 'block' }}>{record.fullName}</Text>
            <Text type="secondary" style={{ fontSize: '11px' }}>{record.email}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Ngày nghỉ',
      dataIndex: 'date',
      render: (date) => (
        <Space direction="vertical" size={0}>
          <Text style={{ fontSize: '13px' }}>{dayjs(date).format('DD/MM/YYYY')}</Text>
          <Text type="secondary" style={{ fontSize: '11px' }}>{dayjs(date).format('dddd')}</Text>
        </Space>
      ),
    },
    {
      title: 'Lý do',
      dataIndex: 'reason',
      ellipsis: true,
      render: (reason) => <Text type="secondary" style={{ fontSize: '12px' }}>{reason || '...'}</Text>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      align: 'center',
      render: (status) => {
        const statusConfig = {
          Pending: { color: 'warning', icon: <ClockCircleOutlined />, text: 'Chờ duyệt' },
          Approved: { color: 'success', icon: <CheckCircleOutlined />, text: 'Đã duyệt' },
          Rejected: { color: 'error', icon: <CloseCircleOutlined />, text: 'Từ chối' },
          Canceled: { color: 'default', icon: <CloseCircleOutlined />, text: 'Đã hủy' },
        };
        const config = statusConfig[status] || statusConfig.Pending;
        return <Tag icon={config.icon} color={config.color} style={{ fontSize: '11px' }}>{config.text}</Tag>;
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 60,
      align: 'center',
      render: (_, record) => {
        if (record.status !== 'Pending') return null;

        const items = [
          { 
            key: 'approve', 
            label: 'Phê duyệt', 
            icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />, 
            onClick: () => handleAction(record.id, 'approve')
          },
          { 
            key: 'reject', 
            label: 'Từ chối', 
            icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />, 
            onClick: () => handleAction(record.id, 'reject')
          }
        ];

        return (
          <Dropdown menu={{ items }} trigger={['click']} placement="bottomRight">
            <Button type="text" size="small" icon={<MoreOutlined />} />
          </Dropdown>
        );
      },
    },
  ];

  return (
    <Card bordered={false} size="small">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>Yêu cầu nghỉ phép</Title>
          <Text type="secondary" style={{ fontSize: '12px' }}>Quản lý và phê duyệt đơn nghỉ</Text>
        </div>
        
        <Space wrap>
          {/* 1. Tìm kiếm theo Keyword */}
          <Input.Search 
            placeholder="Tìm nhân viên..." 
            size="small" 
            style={{ width: 180 }}
            onSearch={(v) => handleFilterChange({ Keyword: v })}
            allowClear
          />

          {/* 2. Lọc theo khoảng ngày */}
          <RangePicker 
            size="small" 
            style={{ width: 230 }} 
            placeholder={['Từ ngày', 'Đến ngày']}
            onChange={onRangeChange}
          />

          {/* 3. Lọc theo trạng thái */}
          <Segmented 
            value={filterStatus}
            size="small"
            options={[
              { label: 'Tất cả', value: 'All' },
              { label: 'Chờ duyệt', value: 'Pending' },
              { label: 'Đã duyệt', value: 'Approved' }
            ]} 
            onChange={(value) => {
              setFilterStatus(value);
              handleFilterChange({ Status: value === 'All' ? undefined : value });
            }}
          />
        </Space>
      </div>

      <Table 
        columns={columns} 
        dataSource={data} 
        loading={loading} 
        pagination={{ ...pagination, size: 'small' }} 
        onChange={handleTableChange}
        rowKey="id"
        size="middle"
      />
    </Card>
  );
};

export default StaffDayOffManager;
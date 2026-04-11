import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Table, Tag, Button, Space, Card, Typography, Modal, 
  message, Avatar, Dropdown, Segmented, Input, DatePicker, Tooltip 
} from 'antd';
import { 
  CheckCircleOutlined, CloseCircleOutlined, 
  MoreOutlined, ClockCircleOutlined, 
  UserOutlined, SearchOutlined, PlusOutlined, DeleteOutlined 
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { usePagination } from '../../hooks/usePagination';
import staffDayOffApi from '../../api/staffDayOffApi';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const StaffDayOffManager = () => {
  // Lấy role từ local để phân quyền
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.role === 'Admin';

  // 1. Pagination Hook - API sẽ trả về { items, totalCount, ... }
  const { data, loading, pagination, runFetch, handleTableChange, handleFilterChange } = usePagination(
    isAdmin ? staffDayOffApi.getAllWithStaff : staffDayOffApi.getMyHistory
  );

  const [filterStatus, setFilterStatus] = useState('All');

  useEffect(() => {
    runFetch();
  }, [runFetch]);

  const handleAction = useCallback(async (id, action) => {
    try {
      if (action === 'approve') await staffDayOffApi.approve(id);
      else if (action === 'reject') await staffDayOffApi.reject(id);
      else if (action === 'cancel') await staffDayOffApi.cancel(id);
      
      message.success(`Thao tác thành công!`);
      runFetch();
    } catch (error) {
      message.error("Thao tác thất bại", error);
    }
  }, [runFetch]);

  const onRangeChange = (dates) => {
    handleFilterChange({
      FromDate: dates ? dates[0].format('YYYY-MM-DD') : undefined,
      ToDate: dates ? dates[1].format('YYYY-MM-DD') : undefined,
    });
  };

  // 4. Cấu hình cột - ĐÃ FIX THEO RESPONSE JSON
  const columns = useMemo(() => {
    const cols = [
      {
        title: 'Ngày nghỉ',
        dataIndex: 'date',
        width: 140,
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
        width: 120,
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
        width: 80,
        align: 'center',
        render: (_, record) => {
          if (record.status !== 'Pending') return null;

          if (isAdmin) {
            const items = [
              { key: 'approve', label: 'Phê duyệt', icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />, onClick: () => handleAction(record.id, 'approve') },
              { key: 'reject', label: 'Từ chối', icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />, onClick: () => handleAction(record.id, 'reject') }
            ];
            return (
              <Dropdown menu={{ items }} trigger={['click']} placement="bottomRight">
                <Button type="text" size="small" icon={<MoreOutlined />} />
              </Dropdown>
            );
          }

          return (
            <Tooltip title="Hủy yêu cầu">
              <Button type="text" danger size="small" icon={<DeleteOutlined />} onClick={() => handleAction(record.id, 'cancel')} />
            </Tooltip>
          );
        },
      },
    ];

    if (isAdmin) {
      cols.unshift({
        title: 'Nhân viên',
        key: 'staff',
        width: 180,
        render: (_, record) => (
          <Space>
            <Avatar size="small" icon={<UserOutlined />} src={record.avatarUrl} />
            <div>
              {/* FIX: Sử dụng staffName theo Response của bạn */}
              <Text strong style={{ fontSize: '13px', display: 'block' }}>{record.staffName}</Text>
              <Text type="secondary" style={{ fontSize: '11px' }}>ID: {record.staffId}</Text>
            </div>
          </Space>
        ),
      });
    }

    return cols;
  }, [isAdmin, handleAction]);

  return (
    <Card bordered={false} size="small">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>
            {isAdmin ? "Quản lý nghỉ phép" : "Lịch sử nghỉ phép của tôi"}
          </Title>
        </div>
        
        <Space wrap>
          {isAdmin && (
            <Input.Search 
              placeholder="Tìm nhân viên..." 
              size="small" 
              style={{ width: 160 }}
              onSearch={(v) => handleFilterChange({ Keyword: v })}
              allowClear
            />
          )}

          <RangePicker 
            size="small" 
            style={{ width: 230 }} 
            onChange={onRangeChange}
            placeholder={['Từ ngày', 'Đến ngày']}
          />

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

          {!isAdmin && (
            <Button type="primary" size="small" icon={<PlusOutlined />}>
              Đăng ký nghỉ
            </Button>
          )}
        </Space>
      </div>

      <Table 
        columns={columns} 
        dataSource={data} // usePagination phải trả về res.items vào đây
        loading={loading} 
        pagination={{ 
          ...pagination, 
          size: 'small',
          showSizeChanger: false 
        }} 
        onChange={handleTableChange}
        rowKey="id"
        size="middle"
      />
    </Card>
  );
};

export default StaffDayOffManager;
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Table, Tag, Button, Space, Card, Typography, Modal, 
  message, Avatar, Dropdown, Segmented, Input, DatePicker, Tooltip, Calendar, Badge 
} from 'antd';
import { 
  CheckCircleOutlined, CloseCircleOutlined, 
  MoreOutlined, ClockCircleOutlined, 
  UserOutlined, SearchOutlined, PlusOutlined, DeleteOutlined,
  TableOutlined, CalendarOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { usePagination } from '../../hooks/usePagination';
import staffDayOffApi from '../../api/staffDayOffApi';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const StaffDayOffManager = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.role === 'Admin';

  // Chế độ xem: table hoặc calendar
  const [viewMode, setViewMode] = useState('table');
  const [filterStatus, setFilterStatus] = useState('All');

  const { data, loading, pagination, runFetch, handleTableChange, handleFilterChange } = usePagination(
    staffDayOffApi.getAllWithStaff // Cả Admin và Staff dùng chung, BE tự phân quyền qua Token
  );

  useEffect(() => {
    runFetch();
  }, [runFetch]);

  // --- Logic Thao tác ---
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

  // --- Logic Calendar Render ---
  const dateCellRender = (value) => {
    const stringValue = value.format('YYYY-MM-DD');
    // Lọc các đơn nghỉ trong ngày này từ list data hiện tại
    const listData = data.filter(item => dayjs(item.date).format('YYYY-MM-DD') === stringValue);
    
    return (
      <ul className="events" style={{ listStyle: 'none', padding: 0 }}>
        {listData.map((item) => {
          const statusConfig = {
            Pending: { color: 'warning', text: 'Chờ' },
            Approved: { color: 'success', text: 'Duyệt' },
            Rejected: { color: 'error', text: 'Từ chối' },
            Canceled: { color: 'default', text: 'Hủy' },
          };
          const config = statusConfig[item.status] || statusConfig.Pending;
          return (
            <li key={item.id}>
              <Badge 
                status={config.color} 
                text={isAdmin ? `${item.staffName.split(' ').pop()}: ${config.text}` : config.text} 
                style={{ fontSize: '10px' }}
              />
            </li>
          );
        })}
      </ul>
    );
  };

  // --- Cấu hình cột Table ---
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
        <Space size="middle">
          <Title level={4} style={{ margin: 0 }}>
            {isAdmin ? "Quản lý nghỉ phép" : "Lịch nghỉ của tôi"}
          </Title>
          {/* Nút chuyển đổi View Mode */}
          <Segmented
            value={viewMode}
            onChange={setViewMode}
            options={[
              { value: 'table', icon: <TableOutlined /> },
              { value: 'calendar', icon: <CalendarOutlined /> },
            ]}
          />
        </Space>
        
        <Space wrap>
          {isAdmin && viewMode === 'table' && (
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
            onChange={(dates) => handleFilterChange({
              FromDate: dates ? dates[0].format('YYYY-MM-DD') : undefined,
              ToDate: dates ? dates[1].format('YYYY-MM-DD') : undefined,
            })}
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

      {viewMode === 'table' ? (
        <Table 
          columns={columns} 
          dataSource={data} 
          loading={loading} 
          pagination={{
            ...pagination,
            showSizeChanger: true,
            pageSizeOptions: ['5', '10', '20'],
          }} 
          onChange={handleTableChange}
          rowKey="id"
          size="middle"
        />
      ) : (
        <div style={{ background: '#fff', padding: '12px', borderRadius: '8px', border: '1px solid #f0f0f0' }}>
          <Calendar 
            fullscreen={true} 
            cellRender={dateCellRender} 
            onPanelChange={() => runFetch()} // Refresh dữ liệu khi đổi tháng
          />
        </div>
      )}
    </Card>
  );
};

export default StaffDayOffManager;
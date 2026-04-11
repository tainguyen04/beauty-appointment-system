import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Table, Tag, Button, Space, Card, Typography, Modal, Form, Select,
  message, Avatar, Dropdown, Segmented, Input, DatePicker, Tooltip, Calendar, Badge 
} from 'antd';
import { 
  CheckCircleOutlined, CloseCircleOutlined, 
  MoreOutlined, ClockCircleOutlined, 
  UserOutlined, PlusOutlined, DeleteOutlined,
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
  
  const [viewMode, setViewMode] = useState('table');
  const [filterStatus, setFilterStatus] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [staffList, setStaffList] = useState([]);
  const [form] = Form.useForm();

  const { data, loading, pagination, runFetch, handleTableChange, handleFilterChange } = usePagination(
    staffDayOffApi.getAllWithStaff 
  );

  useEffect(() => {
    runFetch();
  }, [runFetch]);

  // Lấy danh sách nhân viên cho Admin dùng Select
  useEffect(() => {
    if (isAdmin) {
      const fetchStaffList = async () => {
        try {
          // Giả sử API này trả về mảng [{id, fullName}]
          const response = await staffDayOffApi.getAllStaffs();
          setStaffList(response);
        } catch (error) {
          console.error('Failed to fetch staff list:', error);
        }
      };
      fetchStaffList();
    }
  }, [isAdmin]);

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    if (mode === 'calendar') {
      handleFilterChange({ pageSize: 100, pageNumber: 1 });
    } else {
      handleFilterChange({ pageSize: 10, pageNumber: 1 });
    }
  };

  const handleAction = useCallback(async (id, action) => {
    try {
      if (action === 'approve') await staffDayOffApi.approve(id);
      else if (action === 'reject') await staffDayOffApi.reject(id);
      else if (action === 'cancel') await staffDayOffApi.cancel(id);
      
      message.success(`Thao tác thành công!`);
      runFetch();
    } catch (error) {
      message.error(error.response?.data?.message || "Thao tác thất bại");
    }
  }, [runFetch]);

  const handleFinish = useCallback(async (values) => {
    try {
      const payload = {
        // Nếu admin đăng ký hộ thì gửi staffId lên, staff tự đăng ký thì để undefined (BE tự lấy token)
        staffId: isAdmin ? values.staffId : undefined, 
        date: values.date.format('YYYY-MM-DD'),
        reason: values.reason,
      };
      
      await staffDayOffApi.create(payload);
      message.success(isAdmin ? 'Đã đăng ký nghỉ hộ thành công!' : 'Đăng ký nghỉ thành công!');
      form.resetFields();
      setIsModalOpen(false);
      runFetch();
    } catch (error) {
      // Hiển thị lỗi chi tiết từ Backend (ví dụ: "Đã có lịch hẹn")
      message.error(error.response?.data?.message || 'Đăng ký nghỉ thất bại');
    }
  }, [isAdmin, form, runFetch]);

  const dateCellRender = (value) => {
    const stringValue = value.format('YYYY-MM-DD');
    const listData = data.filter(item => dayjs(item.date).format('YYYY-MM-DD') === stringValue);
    
    return (
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {listData.map((item) => {
          const config = {
            Pending: { color: 'warning', text: 'Chờ' },
            Approved: { color: 'success', text: 'Duyệt' },
            Rejected: { color: 'error', text: 'Từ chối' },
            Canceled: { color: 'default', text: 'Hủy' },
          }[item.status] || { color: 'default', text: '?' };

          return (
            <li key={item.id}>
              <Badge 
                status={config.color} 
                text={isAdmin ? `${item.staffName?.split(' ').pop()}: ${config.text}` : config.text} 
                style={{ fontSize: '10px' }}
              />
            </li>
          );
        })}
      </ul>
    );
  };

  const columns = useMemo(() => {
    const cols = [
      {
        title: 'Ngày nghỉ',
        dataIndex: 'date',
        width: 130,
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
          const config = {
            Pending: { color: 'warning', icon: <ClockCircleOutlined />, text: 'Chờ duyệt' },
            Approved: { color: 'success', icon: <CheckCircleOutlined />, text: 'Đã duyệt' },
            Rejected: { color: 'error', icon: <CloseCircleOutlined />, text: 'Từ chối' },
            Canceled: { color: 'default', icon: <CloseCircleOutlined />, text: 'Đã hủy' },
          }[status] || { color: 'default', text: status };
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
          <Title level={4} style={{ margin: 0 }}>{isAdmin ? "Quản lý nghỉ phép" : "Lịch nghỉ của tôi"}</Title>
          <Segmented
            value={viewMode}
            onChange={handleViewModeChange}
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
              size="small" style={{ width: 160 }}
              onSearch={(v) => handleFilterChange({ Keyword: v })}
              allowClear
            />
          )}

          <RangePicker 
            size="small" style={{ width: 230 }} 
            onChange={(dates) => handleFilterChange({
              FromDate: dates ? dates[0].format('YYYY-MM-DD') : undefined,
              ToDate: dates ? dates[1].format('YYYY-MM-DD') : undefined,
            })}
          />

          <Segmented 
            value={filterStatus}
            size="small"
            options={[
              { label: 'Tất cả', value: 'All' },
              { label: 'Chờ', value: 'Pending' },
              { label: 'Duyệt', value: 'Approved' }
            ]} 
            onChange={(v) => {
              setFilterStatus(v);
              handleFilterChange({ Status: v === 'All' ? undefined : v });
            }}
          />

          <Button 
            type="primary" size="small" icon={<PlusOutlined />}
            onClick={() => setIsModalOpen(true)}
          >
            Đăng ký
          </Button>
        </Space>
      </div>

      {viewMode === 'table' ? (
        <Table 
          columns={columns} dataSource={data} loading={loading} 
          pagination={{
          ...pagination,
          showSizeChanger: true,
          pageSizeOptions: ['5', '10', '20'],
          }}  
          onChange={handleTableChange} rowKey="id" size="middle"
        />
      ) : (
        <div style={{ background: '#fff', padding: '12px', borderRadius: '8px', border: '1px solid #f0f0f0' }}>
          <Calendar fullscreen={true} cellRender={dateCellRender} onPanelChange={() => runFetch()} />
        </div>
      )}

      <Modal
        title={isAdmin ? "Đăng ký nghỉ hộ nhân viên" : "Đăng ký nghỉ phép"}
        open={isModalOpen}
        onOk={() => form.submit()}
        onCancel={() => setIsModalOpen(false)}
        okText="Gửi yêu cầu"
        cancelText="Hủy bỏ"
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleFinish}>
          {isAdmin && (
            <Form.Item 
              name="staffId" label="Nhân viên" 
              rules={[{ required: true, message: 'Vui lòng chọn nhân viên!' }]}
            >
              <Select placeholder="Chọn nhân viên cần đăng ký nghỉ" showSearch optionFilterProp="children">
                {staffList.map(s => <Select.Option key={s.id} value={s.id}>{s.fullName}</Select.Option>)}
              </Select>
            </Form.Item>
          )}

          <Form.Item name="date" label="Ngày nghỉ" rules={[{ required: true, message: 'Vui lòng chọn ngày!' }]}>
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>

          <Form.Item name="reason" label="Lý do" rules={[{ required: true, message: 'Vui lòng nhập lý do!' }]}>
            <Input.TextArea rows={3} placeholder="Ví dụ: Nghỉ việc gia đình..." />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default StaffDayOffManager;
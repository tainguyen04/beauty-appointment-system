import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Table, Tag, Button, Space, Card, Typography, Modal, Form, Select,
  Avatar, Dropdown, Segmented, Input, DatePicker, Tooltip, Calendar, Badge, Popover, Spin // MỚI: Thêm Spin
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
import staffApi from '../../api/staffApi';
import { useApiAction } from '../../hooks/useApiAction'; // MỚI: Import useApiAction

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

  // MỚI: Khởi tạo custom hook xử lý gọi API
  const { actionLoading, execute } = useApiAction();

  useEffect(() => {
    runFetch();
  }, [runFetch]);

  useEffect(() => {
    if (!isAdmin) return;
    const fetchStaffList = async () => {
      try {
        const response = await staffApi.getAll({ pageSize: 100, pageNumber: 1 });
        const actualData = response?.items || response?.data || [];
        setStaffList(actualData);
      } catch (error) {
        console.error('Failed to fetch staff list:', error);
      }
    };
    fetchStaffList();
  }, [isAdmin]);

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    if (mode === 'calendar') {
      handleFilterChange({ pageSize: 100, pageNumber: 1 });
    } else {
      handleFilterChange({ pageSize: 10, pageNumber: 1 });
    }
  };

  // MỚI: Dùng execute để bọc các API thao tác (Duyệt, Từ chối, Hủy, Xóa)
  const handleAction = useCallback(async (id, action) => {
    let apiCall;
    let msg = "Thao tác thành công!";
    
    if (action === 'approve') apiCall = () => staffDayOffApi.approve(id);
    else if (action === 'reject') apiCall = () => staffDayOffApi.reject(id);
    else if (action === 'cancel') apiCall = () => staffDayOffApi.cancel(id);
    else if (action === 'delete') {
      apiCall = () => staffDayOffApi.delete(id);
      msg = 'Đã xóa đơn nghỉ thành công!';
    }

    if (apiCall) {
      const { success } = await execute(apiCall, msg);
      if (success) runFetch();
    }
  }, [runFetch, execute]);

  // MỚI: Dùng execute để bọc API tạo mới
  const handleFinish = useCallback(async (values) => {
    const payload = {
      staffId: isAdmin ? values.staffId : undefined, 
      date: values.date.format('YYYY-MM-DD'),
      reason: values.reason,
    };
    
    const msg = isAdmin ? 'Đã đăng ký nghỉ hộ thành công!' : 'Đăng ký nghỉ thành công!';
    const { success } = await execute(() => staffDayOffApi.create(payload), msg);
    
    if (success) {
      form.resetFields();
      setIsModalOpen(false);
      runFetch();
    }
  }, [isAdmin, form, runFetch, execute]);

  // Render ô lịch 
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
            <Popover 
              key={item.id}
              content={
                <div style={{ maxWidth: 200 }}>
                  <p><b>Lý do:</b> {item.reason || 'Không có'}</p>
                  {item.status === 'Pending' && isAdmin && (
                    <Space>
                      <Button size="small" type="primary" loading={actionLoading} onClick={(e) => {
                        e.stopPropagation(); 
                        handleAction(item.id, 'approve');
                      }}>Duyệt</Button>
                      <Button size="small" danger loading={actionLoading} onClick={(e) => {
                        e.stopPropagation();
                        handleAction(item.id, 'reject');
                      }}>Từ chối</Button>
                    </Space>
                  )}
                </div>
              }
              title={`Đơn của ${item.staffName}`}
            >
              <li style={{ marginBottom: '2px' }}>
                <Badge 
                  status={config.color} 
                  text={isAdmin ? `${item.staffName?.split(' ').pop()}: ${config.text}` : config.text} 
                  style={{ fontSize: '10px' }}
                />
              </li>
            </Popover>
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
          const items = [];

            if (isAdmin && record.status === 'Pending') {
              items.push(
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
                },
                { type: 'divider' } 
              );
            }

            if (!isAdmin && record.status === 'Pending') {
              items.push({
                key: 'cancel',
                label: 'Hủy yêu cầu',
                icon: <DeleteOutlined />,
                onClick: () => handleAction(record.id, 'cancel')
              });
            }

            if (isAdmin || record.status !== 'Approved') {
              items.push({
                key: 'delete',
                label: 'Xóa đơn',
                danger: true,
                icon: <DeleteOutlined />,
                onClick: () => {
                  Modal.confirm({
                    title: 'Xác nhận xóa đơn nghỉ',
                    content: 'Hành động này sẽ ẩn đơn nghỉ khỏi hệ thống. Bạn chắc chắn chứ?',
                    okText: 'Xóa',
                    okType: 'danger',
                    cancelText: 'Hủy',
                    // MỚI: Cập nhật hàm gọi khi confirm
                    onOk: () => handleAction(record.id, 'delete'),
                  });
                }
              });
            }

            if (items.length === 0) return null;

            return (
              <Dropdown menu={{ items }} trigger={['click']} placement="bottomRight">
                <Button type="text" size="small" icon={<MoreOutlined />} />
              </Dropdown>
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
          {/* MỚI: Bọc Spin xung quanh Calendar để hiển thị Loading đồng bộ */}
          <Spin spinning={loading} tip="Đang tải lịch...">
            <Calendar 
              fullscreen={true} 
              cellRender={dateCellRender} 
              onPanelChange={() => runFetch()} 
              onSelect={(date, {source}) => {
                if(source === 'date'){
                  form.setFieldsValue({ date });
                  setIsModalOpen(true);
                }
              }} 
            />
          </Spin>
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
        confirmLoading={actionLoading} // MỚI: Truyền state loading của hook vào Modal
      >
        <Form form={form} layout="vertical" onFinish={handleFinish}>
          {isAdmin && (
            <Form.Item 
              name="staffId" label="Nhân viên" 
              rules={[{ required: true, message: 'Vui lòng chọn nhân viên!' }]}
            >
              <Select 
                placeholder="Chọn nhân viên cần đăng ký nghỉ" 
                showSearch 
                optionFilterProp="label"
                options={staffList.map(s => ({
                  value: s.id || s.Id,
                  label: s.fullName || s.FullName 
                }))}
              />
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
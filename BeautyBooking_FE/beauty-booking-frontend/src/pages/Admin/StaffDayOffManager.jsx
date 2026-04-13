import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Table, Tag, Button, Space, Card, Typography, Modal, Form, Select,
  Row, Col, DatePicker, TimePicker, Segmented, Input, Calendar, Badge, Popover, Spin, Dropdown,
  Drawer, Descriptions, List 
} from 'antd';
import { 
  EditOutlined, PlusOutlined, MoreOutlined,
  TableOutlined, CalendarOutlined, CheckCircleOutlined,
  ClockCircleOutlined, CloseCircleOutlined, SyncOutlined,
  EyeOutlined 
} from '@ant-design/icons';
import dayjs from 'dayjs';

// --- API & Hooks ---
import { usePagination } from '../../hooks/usePagination';
import { useApiAction } from '../../hooks/useApiAction';
import appointmentApi from '../../api/appointmentApi';
import staffApi from '../../api/staffApi'; 
import userApi from '../../api/userApi'; 
import serviceApi from '../../api/serviceApi';
import { convertMinutesToTimeStr, convertDayjsToMinutes } from '../../utils/apiHelper'; 

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
};

const AppointmentManager = () => {
  // --- States ---
  const [viewMode, setViewMode] = useState('table');
  const [filterStatus, setFilterStatus] = useState('All');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  
  // Drawer states
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [recordDetails, setRecordDetails] = useState(null);
  
  // Data states
  const [customerList, setCustomerList] = useState([]); 
  const [serviceList, setServiceList] = useState([]); 
  const [availableStaffs, setAvailableStaffs] = useState([]); 
  const [estimatedTotal, setEstimatedTotal] = useState(0);

  const [form] = Form.useForm();

  // --- Hooks ---
  const { data, loading, pagination, runFetch, handleTableChange, handleFilterChange } = usePagination(
    appointmentApi.getAll
  );
  const { actionLoading, execute } = useApiAction();

  const fetchInitialData = async () => {
    try {
      const userRes = await userApi.getAll();
      const allUsers = userRes?.items || userRes?.data || userRes || [];
      setCustomerList(allUsers.filter(u => u.role === 'Customer' || u.roleName === 'Customer'));
      
      const serviceRes = await serviceApi.getAll();
      setServiceList(serviceRes?.items || serviceRes?.data || serviceRes || []);
    } catch (error) { 
      console.error("Lỗi khi tải dữ liệu ban đầu:", error); 
    }
  };
  // --- Effects ---
  useEffect(() => {
    const initData = async () => {
      await fetchInitialData();
    };
    runFetch();
    initData();
  }, [runFetch]);


  // --- Handlers ---
  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    if (mode === 'calendar') {
      handleFilterChange({ pageSize: 100, pageNumber: 1 });
    } else {
      handleFilterChange({ pageSize: 10, pageNumber: 1 });
    }
  };

  const handleAddNew = useCallback(() => {
    setIsEdit(false);
    setSelectedAppointment(null);
    form.resetFields();
    setAvailableStaffs([]);
    setEstimatedTotal(0);
    setIsModalOpen(true);
  }, [form]);

  const handleEdit = useCallback((record) => {
    setIsEdit(true);
    setSelectedAppointment(record);
    const startTimeObj = record.startTime ? dayjs().startOf('day').add(record.startTime, 'minute') : null;
    const endTimeObj = record.endTime ? dayjs().startOf('day').add(record.endTime, 'minute') : null;
    setEstimatedTotal(record.totalPrice || 0);

    form.setFieldsValue({
      userId: record.userId,
      appointmentDate: record.appointmentDate ? dayjs(record.appointmentDate) : null,
      startTime: startTimeObj,
      endTime: endTimeObj,
      serviceIds: record.appointmentServices?.map(s => s.serviceId) || [] 
    });

    if (record.appointmentDate && record.startTime) {
      const tempEndTime = record.endTime || (record.startTime + 60);
      staffApi.getAvailable(
        dayjs(record.appointmentDate).format('YYYY-MM-DD'), 
        record.startTime, 
        tempEndTime
      ).then(res => {
        setAvailableStaffs(res?.items || res?.data || res || []);
        form.setFieldsValue({ staffId: record.staffId });
      }).catch(err => console.error("Lỗi tải staff:", err));
    } else {
      form.setFieldsValue({ staffId: record.staffId });
    }
    
    setIsModalOpen(true);
  }, [form]);

  const handleSubmit = useCallback(async (values) => {
    const payload = {
      ...values,
      userId: values.userId ? Number(values.userId) : null,
      staffId: values.staffId ? Number(values.staffId) : null,
      appointmentDate: values.appointmentDate ? values.appointmentDate.format('YYYY-MM-DD') : null,
      startTime: values.startTime ? convertDayjsToMinutes(values.startTime) : null,
      endTime: values.endTime ? convertDayjsToMinutes(values.endTime) : null,
      totalPrice: estimatedTotal
    };
    
    const apiCall = isEdit ? () => appointmentApi.update(selectedAppointment.id, payload) : () => appointmentApi.createByAdmin(payload);
    const { success } = await execute(apiCall, isEdit ? "Cập nhật thành công!" : "Tạo thành công!");
    
    if (success) { 
      setIsModalOpen(false); 
      runFetch(); 
    }
  }, [isEdit, selectedAppointment, estimatedTotal, execute, runFetch]);

  // --- Table Columns ---
  const columns = useMemo(() => {
    const baseCols = [
      { 
        title: 'Mã', 
        dataIndex: 'id',
        width: 60,
      },
      { 
        title: 'Khách hàng', 
        dataIndex: 'userName', 
        render: (name) => <Text strong>{name || 'Khách vãng lai'}</Text> 
      },
      { 
        title: 'Thời gian hẹn', 
        key: 'time',
        render: (_, record) => (
          <Space direction="vertical" size={0}>
            <Text style={{ fontSize: '13px', fontWeight: 500 }}>
              {dayjs(record.appointmentDate).format('DD/MM/YYYY')}
            </Text>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.timeRange} 
            </Text>
          </Space>
        ),
      },
      { 
        title: 'Nhân viên', 
        dataIndex: 'staffName', 
        render: (staff) => staff ? <Tag color="blue">{staff}</Tag> : <Text type="secondary">Chưa xếp</Text>
      },
      { 
        title: 'Tổng tiền', 
        dataIndex: 'totalPrice', 
        render: p => <Text type="success" strong>{formatCurrency(p)}</Text> 
      },
      { 
        title: 'Trạng thái', 
        dataIndex: 'appointmentStatus', 
        align: 'center',
        render: (status) => {
          const config = {
            Pending: { color: 'warning', icon: <ClockCircleOutlined />, text: 'Chờ xác nhận' },
            Confirmed: { color: 'processing', icon: <SyncOutlined spin />, text: 'Đã xác nhận' },
            Completed: { color: 'success', icon: <CheckCircleOutlined />, text: 'Hoàn thành' },
            Cancelled: { color: 'error', icon: <CloseCircleOutlined />, text: 'Đã hủy' },
          }[status] || { color: 'default', text: status };
          return <Tag icon={config.icon} color={config.color} style={{ fontSize: '11px' }}>{config.text}</Tag>;
        } 
      }
    ];

    const actionCol = {
      title: 'Thao tác', 
      key: 'action',
      width: 80,
      align: 'center',
      render: (_, record) => {
        const items = [
          { 
            key: 'view', 
            label: 'Xem chi tiết', 
            icon: <EyeOutlined style={{ color: '#1890ff' }}/>, 
            onClick: () => {
              setRecordDetails(record);
              setIsDrawerOpen(true);
            } 
          },
          { type: 'divider' },
          { key: 'edit', label: 'Chỉnh sửa', icon: <EditOutlined />, onClick: () => handleEdit(record) },
        ];
        return (
          <Dropdown menu={{ items }} trigger={['click']} placement="bottomRight">
            <Button type="text" size="small" icon={<MoreOutlined />} />
          </Dropdown>
        );
      }
    };

    return [...baseCols, actionCol];
  }, [handleEdit]);

  // --- Calendar Rendering ---
  const dateCellRender = (value) => {
    const stringValue = value.format('YYYY-MM-DD');
    const listData = Array.isArray(data) ? data.filter(item => dayjs(item.appointmentDate).format('YYYY-MM-DD') === stringValue) : [];
    
    return (
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {listData.map((item) => {
          const config = {
            Pending: { color: 'warning', text: 'Chờ' },
            Confirmed: { color: 'processing', text: 'XN' },
            Completed: { color: 'success', text: 'Xong' },
            Cancelled: { color: 'error', text: 'Hủy' },
          }[item.appointmentStatus] || { color: 'default', text: '?' };

          return (
            <Popover 
              key={item.id}
              title={`Lịch hẹn #${item.id}`}
              content={
                <div style={{ maxWidth: 200 }}>
                  <p><b>Khách:</b> {item.userName || 'N/A'}</p>
                  <p><b>Giờ:</b> {item.timeRange}</p>
                  <p><b>Tổng:</b> {formatCurrency(item.totalPrice)}</p>
                  <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                    <Button size="small" onClick={(e) => {
                      e.stopPropagation();
                      setRecordDetails(item);
                      setIsDrawerOpen(true);
                    }}>Chi tiết</Button>
                    <Button size="small" type="primary" onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(item);
                    }}>Sửa</Button>
                  </Space>
                </div>
              }
            >
              <li style={{ marginBottom: '2px', cursor: 'pointer' }}>
                <Badge 
                  status={config.color} 
                  text={<span style={{ fontSize: '11px' }}>{convertMinutesToTimeStr(item.startTime)} - {item.userName || 'Khách'}</span>} 
                  style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}
                />
              </li>
            </Popover>
          );
        })}
      </ul>
    );
  };

  return (
    <Card bordered={false} size="small">
      {/* HEADER & TOOLBAR */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        <Space size="middle">
          <Title level={4} style={{ margin: 0 }}>Quản lý lịch hẹn</Title>
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
          {viewMode === 'table' && (
            <Input.Search 
              placeholder="Tìm khách hàng, SĐT..." 
              size="small" style={{ width: 180 }}
              onSearch={(v) => handleFilterChange({ Keyword: v })}
              allowClear
            />
          )}

          <RangePicker 
            size="small" style={{ width: 230 }} 
            format="DD/MM/YYYY"
            onChange={(dates) => handleFilterChange({
              FromDate: dates ? dates[0].format('YYYY-MM-DD') : undefined,
              ToDate: dates ? dates[1].format('YYYY-MM-DD') : undefined,
            })}
          />

          <Select
            value={filterStatus}
            size="small" style={{ width: 130 }}
            options={[
              { label: 'Tất cả', value: 'All' },
              { label: 'Chờ xác nhận', value: 'Pending' },
              { label: 'Đã xác nhận', value: 'Confirmed' },
              { label: 'Hoàn thành', value: 'Completed' },
              { label: 'Đã hủy', value: 'Cancelled' }
            ]}
            onChange={(v) => {
              setFilterStatus(v);
              handleFilterChange({ Status: v === 'All' ? undefined : v });
            }}
          />

          <Button 
            type="primary" size="small" icon={<PlusOutlined />}
            onClick={handleAddNew}
          >
            Tạo mới
          </Button>
        </Space>
      </div>

      {/* NỘI DUNG CHÍNH (TABLE HOẶC CALENDAR) */}
      {viewMode === 'table' ? (
        <Table 
          columns={columns} 
          dataSource={Array.isArray(data) ? data : (data?.items || [])} 
          loading={loading} 
          pagination={{
            ...pagination,
            showSizeChanger: true,
            pageSizeOptions: ['5', '10', '20', '50'],
          }}   
          onChange={handleTableChange} 
          rowKey="id" 
          size="middle"
        />
      ) : (
        <div style={{ background: '#fff', padding: '12px', borderRadius: '8px', border: '1px solid #f0f0f0' }}>
          <Spin spinning={loading} tip="Đang tải lịch...">
            <Calendar 
              fullscreen={true} 
              cellRender={(current, info) => info.type === 'date' ? dateCellRender(current) : info.originNode} 
              onPanelChange={() => runFetch()} 
              onSelect={(date, {source}) => {
                if(source === 'date'){
                  handleAddNew();
                  form.setFieldsValue({ appointmentDate: date });
                }
              }} 
            />
          </Spin>
        </div>
      )}

      {/* MODAL THÊM / SỬA */}
      <Modal 
        title={isEdit ? "Sửa lịch hẹn" : "Tạo lịch hẹn"}
        open={isModalOpen}
        onOk={() => form.submit()}
        onCancel={() => setIsModalOpen(false)}
        width={750}
        destroyOnClose
        confirmLoading={actionLoading}
        okText="Lưu lại"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
           <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="appointmentDate" label="Ngày hẹn" rules={[{ required: true }]}>
                  <DatePicker style={{width:'100%'}} format="DD/MM/YYYY" />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name="startTime" label="Giờ bắt đầu" rules={[{ required: true }]}>
                  <TimePicker format="HH:mm" style={{width:'100%'}} minuteStep={15}/>
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name="endTime" label="Giờ kết thúc">
                  <TimePicker format="HH:mm" style={{width:'100%'}} minuteStep={15}/>
                </Form.Item>
              </Col>
           </Row>
           <Form.Item name="userId" label="Khách hàng">
              <Select 
                showSearch 
                placeholder="Chọn khách" 
                allowClear
                options={customerList.map(c => ({ label: c.fullName || c.userName, value: c.id }))}
                filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
              />
           </Form.Item>
           <Form.Item name="serviceIds" label="Dịch vụ" rules={[{ required: true }]}>
              <Select 
                mode="multiple" 
                placeholder="Chọn dịch vụ"
                options={serviceList.map(s => ({ label: s.name || s.serviceName, value: s.id }))}
              />
           </Form.Item>
           <Form.Item name="staffId" label="Nhân viên phụ trách">
              <Select 
                placeholder="Chọn nhân viên (Tùy chọn)" 
                allowClear
                options={availableStaffs.map(s => ({ label: s.fullName, value: s.id }))}
              />
           </Form.Item>
        </Form>
      </Modal>

      {/* DRAWER XEM CHI TIẾT */}
      <Drawer
        title={`Chi tiết lịch hẹn #${recordDetails?.id || ''}`}
        placement="right"
        width={450}
        onClose={() => setIsDrawerOpen(false)}
        open={isDrawerOpen}
      >
        {recordDetails && (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            
            {/* THÔNG TIN CHUNG */}
            <Descriptions title="Thông tin chung" column={1} bordered size="small">
              <Descriptions.Item label="Khách hàng">
                <Text strong>{recordDetails.userName}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Nhân viên phục vụ">
                {recordDetails.staffName || 'Chưa phân công'}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày hẹn">
                {dayjs(recordDetails.appointmentDate).format('DD/MM/YYYY')}
              </Descriptions.Item>
              <Descriptions.Item label="Khung giờ">
                {recordDetails.timeRange}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={recordDetails.appointmentStatus === 'Completed' ? 'success' : recordDetails.appointmentStatus === 'Pending' ? 'warning' : 'processing'}>
                  {recordDetails.appointmentStatus}
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            {/* DANH SÁCH DỊCH VỤ */}
            <div>
              <Title level={5}>Dịch vụ đã chọn</Title>
              <List
                size="small"
                bordered
                dataSource={recordDetails.appointmentServices || []}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      title={item.serviceName}
                      description={`Thời gian: ${item.durationAtBooking} phút`}
                    />
                    <Text strong>{formatCurrency(item.priceAtBooking)}</Text>
                  </List.Item>
                )}
              />
              <div style={{ textAlign: 'right', marginTop: '16px' }}>
                <Text>Tổng cộng: </Text>
                <Title level={4} type="danger" style={{ display: 'inline', margin: 0 }}>
                  {formatCurrency(recordDetails.totalPrice)}
                </Title>
              </div>
            </div>

          </Space>
        )}
      </Drawer>
    </Card>
  );
};

export default AppointmentManager;
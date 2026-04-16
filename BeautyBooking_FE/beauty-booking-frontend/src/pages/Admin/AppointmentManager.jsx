import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Table, Tag, Button, Space, Card, Typography, Modal, Form, Select,
  Row, Col, DatePicker, TimePicker, Segmented, Input, Calendar, Badge, Popover, Spin, Dropdown,
  Drawer, Descriptions, List, Tooltip 
} from 'antd';
import { 
  EditOutlined, PlusOutlined, MoreOutlined,
  TableOutlined, CalendarOutlined, SwapOutlined,
  EyeOutlined, DeleteOutlined, EnvironmentOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

// --- API & Hooks ---
import { usePagination } from '../../hooks/usePagination';
import { useApiAction } from '../../hooks/useApiAction';
import appointmentApi from '../../api/appointmentApi';
import staffApi from '../../api/staffApi'; 
import userApi from '../../api/userApi'; 
import serviceApi from '../../api/serviceApi';
import wardApi from '../../api/wardApi'; 
import { convertMinutesToTimeStr, convertDayjsToMinutes, APPOINTMENT_STATUS, getStatusConfig } from '../../utils/apiHelper'; 

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
};

const AppointmentManager = () => {
  const [viewMode, setViewMode] = useState('table');
  const [filterStatus, setFilterStatus] = useState('All');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [recordDetails, setRecordDetails] = useState(null);
  
  const [customerList, setCustomerList] = useState([]); 
  const [serviceList, setServiceList] = useState([]); 
  const [wardList, setWardList] = useState([]); 
  const [availableStaffs, setAvailableStaffs] = useState([]); 
  const [estimatedTotal, setEstimatedTotal] = useState(0);

  const [form] = Form.useForm();
  const startTime = Form.useWatch('startTime', form);
  const serviceIds = Form.useWatch('serviceIds', form);

  const previewEndTime = useMemo(() => {
    if (!startTime || !serviceIds?.length) return null;
    const totalDuration = serviceIds.reduce((sum, id) => {
      const srv = serviceList.find(s => s.id === id);
      return sum + (srv?.duration || srv?.durationAtBooking || 60);
    }, 0);
    return startTime.add(totalDuration, 'minute');
  }, [startTime, serviceIds, serviceList]);

  const { data, loading, pagination, runFetch, handleTableChange, handleFilterChange } = usePagination(
    appointmentApi.getAll
  );
  const { actionLoading, execute } = useApiAction();

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const userRes = await userApi.getAll();
        const allUsers = userRes?.items || userRes?.data || userRes || [];
        setCustomerList(allUsers.filter(u => u.role === 'Customer' || u.roleName === 'Customer'));
      } catch (e) { console.error("Lỗi tải Customer:", e); }

      try {
        const serviceRes = await serviceApi.getAll();
        setServiceList(serviceRes?.items || serviceRes?.data || serviceRes || []);
      } catch (e) { console.error("Lỗi tải Service:", e); }

      try {
        const wardRes = await wardApi.getAll();
        setWardList(wardRes?.items || wardRes?.data || wardRes || []);
      } catch (e) { console.error("Lỗi tải Ward:", e); }
    };

    runFetch();
    fetchInitialData();
  }, [runFetch]);

  const handleViewModeChange = useCallback((mode) => {
    setViewMode(mode);
    if (mode === 'calendar') {
      handleFilterChange({ pageSize: 100, pageNumber: 1 });
    } else {
      handleFilterChange({ pageSize: 10, pageNumber: 1 });
    }
  }, [handleFilterChange]);

  // --- CẬP NHẬT: Gửi thêm wardId vào API lấy nhân viên ---
  const fetchAvailableStaffs = useCallback(async (dateObj, startTimeObj, serviceIds, currentStaffId, currentStaffName, wardId) => {
    // Chỉ gọi lấy nhân viên nếu đã có đủ Ngày, Giờ và Khu vực
    if (!dateObj || !startTimeObj || !wardId) {
      setAvailableStaffs([]);
      return;
    }
    const startMins = convertDayjsToMinutes(startTimeObj);
    const validServiceIds = serviceIds || [];
    
    try {
      const payload = {
        date: dateObj.format('YYYY-MM-DD'),
        startTime: startMins,
        serviceIds: validServiceIds,
        wardId: wardId, // param truyền cho BE
      };

      const res = await staffApi.getAvailable(payload);
      let staffs = res?.items || res?.data || res || [];
      if (currentStaffId && !staffs.some(s => s.id === currentStaffId)) {
        staffs = [{ id: currentStaffId, fullName: currentStaffName || 'Nhân viên hiện tại' }, ...staffs];
      }
      setAvailableStaffs(staffs);
    } catch (err) {
      console.error("Lỗi tải Staff:", err);
    }
  }, []);

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
    const dateObj = record.appointmentDate ? dayjs(record.appointmentDate) : null;
    const sIds = record.appointmentServices?.map(s => s.serviceId) || [];
    
    setEstimatedTotal(record.totalPrice || 0);

    const actualWardId = record.wardId || record.WardId; // Lấy đúng key

    form.setFieldsValue({
      userId: record.userId,
      wardId: actualWardId, // Giữ lại wardId trên Form
      appointmentDate: dateObj,
      startTime: startTimeObj,
      serviceIds: sIds,
      staffId: record.staffId
    });

    fetchAvailableStaffs(dateObj, startTimeObj, sIds, record.staffId, record.staffName, actualWardId);
    setIsModalOpen(true);
  }, [form, fetchAvailableStaffs]);

  // --- CẬP NHẬT: Quản lý lại Logic kích hoạt ---
  const handleValuesChange = useCallback((changedValues, allValues) => {
    if ('serviceIds' in changedValues) {
      const price = (allValues.serviceIds || []).reduce((sum, id) => {
        const srv = serviceList.find(s => s.id === id);
        return sum + (srv?.price || srv?.priceAtBooking || 0);
      }, 0);
      setEstimatedTotal(price);
    }
    
    // Kiểm tra xem có trường nào liên quan đến Nhân viên bị thay đổi không
    const triggersStaffUpdate = ['appointmentDate', 'startTime', 'serviceIds', 'wardId'].some(k => k in changedValues);

    if (triggersStaffUpdate) {
      const { appointmentDate, startTime, serviceIds, wardId } = allValues;
      
      // Nếu có đủ thông tin mới gọi API load Nhân viên
      if (appointmentDate && startTime && wardId) {
        if ('appointmentDate' in changedValues || 'startTime' in changedValues || 'wardId' in changedValues) {
           form.setFieldsValue({ staffId: null }); 
        }
        fetchAvailableStaffs(appointmentDate, startTime, serviceIds, form.getFieldValue('staffId'), 'Nhân viên đang chọn', wardId);
      } else {
        // Nếu thiếu ngày/giờ/khu vực thì dọn sạch danh sách nhân viên
        setAvailableStaffs([]);
        form.setFieldsValue({ staffId: null });
      }
    }
  }, [serviceList, fetchAvailableStaffs, form]);

  const handleSubmit = useCallback(async (values) => {
    const startMins = values.startTime ? convertDayjsToMinutes(values.startTime) : null;

    const payload = {
      ...values,
      userId: values.userId ? Number(values.userId) : null,
      staffId: values.staffId ? Number(values.staffId) : null,
      appointmentDate: values.appointmentDate ? values.appointmentDate.format('YYYY-MM-DD') : null,
      startTime: startMins,
    };
    
    if (!isEdit) {
      payload.wardId = values.wardId ? Number(values.wardId) : null;
      payload.WardId = payload.wardId; // Gửi cả 2 trường hợp cho BE
    } else {
      delete payload.wardId; 
      delete payload.WardId;
    }
    
    const apiCall = isEdit ? () => appointmentApi.update(selectedAppointment.id, payload) : () => appointmentApi.create(payload);
    const { success } = await execute(apiCall, isEdit ? "Cập nhật thành công!" : "Tạo thành công!");
    
    if (success) { 
      setIsModalOpen(false); 
      runFetch(); 
    }
  }, [isEdit, selectedAppointment, execute, runFetch]);

  const handleUpdateStatus = useCallback(async (id, newStatus) => {
    const { success } = await execute(() => appointmentApi.updateStatus(id, `"${newStatus}"`), "Đổi trạng thái thành công!");
    if (success) runFetch();
  }, [execute, runFetch]);

  const handleDelete = useCallback((id) => {
    Modal.confirm({
      title: 'Xác nhận xóa lịch hẹn',
      content: 'Hành động này không thể hoàn tác. Bạn chắc chắn muốn xóa?',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        const { success } = await execute(() => appointmentApi.delete(id), "Xóa lịch hẹn thành công!");
        if (success) runFetch();
      }
    });
  }, [execute, runFetch]);

  const columns = useMemo(() => {
    const baseCols = [
      { title: 'Mã LH', dataIndex: 'id', width: 80 },
      { title: 'Khách hàng', dataIndex: 'userName', render: (name) => <Text strong>{name || 'Khách vãng lai'}</Text> },
      { 
        title: 'Khu vực', 
        dataIndex: 'wardName', 
        width: 150,
        ellipsis: true,
        render: (name) => name ? <Tooltip title={name}><Tag color="blue">{name}</Tag></Tooltip> : <Text type="secondary">N/A</Text>
      },
      { title: 'Ngày', dataIndex: 'appointmentDate', render: (date) => <Text>{dayjs(date).format('DD/MM/YYYY')}</Text> },
      { 
        title: 'Thời gian', 
        key: 'time',
        render: (_, record) => {
          const rangeStr = record.timeRange || `${convertMinutesToTimeStr(record.startTime)} - ${convertMinutesToTimeStr(record.endTime)}`;
          return <Text>{rangeStr}</Text>;
        },
      },
      { title: 'Tổng tiền', dataIndex: 'totalPrice',
        render: (p) => (
          <div style={{ textAlign: 'right', width: '100%' }}>
            <Text type="success" strong>{formatCurrency(p)}</Text>
          </div>
        ) 
      },
      { 
        title: 'Trạng thái', 
        dataIndex: 'appointmentStatus', 
        align: 'center',
        render: (status) => {
          const config = getStatusConfig(status);
          return <Tag color={config?.color}>{config?.label || status}</Tag>;
        } 
      }
    ];

    const actionCol = {
      title: 'Thao tác', 
      key: 'action',
      width: 100,
      align: 'center',
      render: (_, record) => {
        const items = [
          { key: 'view', label: 'Xem chi tiết', icon: <EyeOutlined style={{ color: '#1890ff' }}/>, onClick: () => { setRecordDetails(record); setIsDrawerOpen(true); } },
          { key: 'edit', label: 'Chỉnh sửa', icon: <EditOutlined />, onClick: () => handleEdit(record) },
          { type: 'divider' },
          { 
            key: 'status', label: 'Đổi trạng thái', icon: <SwapOutlined />,
            children: APPOINTMENT_STATUS.map(s => ({
              key: `s_${s.value}`,
              label: s.label,
              danger: s.value === 'Cancelled',
              onClick: () => handleUpdateStatus(record.id, s.value)
            }))
          },
          { type: 'divider' },
          { key: 'delete', label: 'Xóa', danger: true, icon: <DeleteOutlined />, onClick: () => handleDelete(record.id) },
        ];
        return (
          <Dropdown menu={{ items }} trigger={['click']} placement="bottomRight">
            <Button type="text" size="small" icon={<MoreOutlined />} />
          </Dropdown>
        );
      }
    };
    return [...baseCols, actionCol];
  }, [handleEdit, handleUpdateStatus, handleDelete]);

  const dateCellRender = (value) => {
    const stringValue = value.format('YYYY-MM-DD');
    const dataSource = Array.isArray(data) ? data : (data?.items || []);
    const listData = dataSource.filter(item => dayjs(item.appointmentDate).format('YYYY-MM-DD') === stringValue);
    
    return (
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {listData.map((item) => {
          const config = getStatusConfig(item.appointmentStatus);
          return (
            <Popover 
              key={item.id} title={`Lịch hẹn #${item.id}`}
              content={
                <div style={{ maxWidth: 220 }}>
                  <p><b>Khách:</b> {item.userName || 'N/A'}</p>
                  <p><b>Khu vực:</b> {item.wardName || 'N/A'}</p>
                  <p><b>Giờ:</b> {item.timeRange || `${convertMinutesToTimeStr(item.startTime)} - ${convertMinutesToTimeStr(item.endTime)}`}</p>
                  <p><b>Tổng:</b> {formatCurrency(item.totalPrice)}</p>
                  <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                    <Button size="small" onClick={(e) => { e.stopPropagation(); setRecordDetails(item); setIsDrawerOpen(true); }}>Chi tiết</Button>
                    <Button size="small" type="primary" onClick={(e) => { e.stopPropagation(); handleEdit(item); }}>Sửa</Button>
                  </Space>
                </div>
              }
            >
                <li style={{ marginBottom: '2px', cursor: 'pointer' }}>
                  <Badge 
                    status={config?.color || 'default'} 
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
      <div style={{ background: '#f9f9f9', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
        <Row gutter={[16, 16]} align="middle" justify="space-between">
          <Col>
             <Space size="middle">
               <Title level={4} style={{ margin: 0 }}>Quản lý lịch hẹn</Title>
               <Segmented value={viewMode} onChange={handleViewModeChange}
                 options={[
                   { value: 'table', label: 'Danh sách', icon: <TableOutlined /> },
                   { value: 'calendar', label: 'Lịch', icon: <CalendarOutlined /> },
                 ]}
               />
               <Button type="primary" icon={<PlusOutlined />} onClick={handleAddNew}>Tạo mới</Button>
             </Space>
          </Col>
        </Row>
        
        {viewMode === 'table' && (
          <Row gutter={[16, 16]} align="middle" style={{ marginTop: '16px' }}>
            <Col><Space><Text>Tìm kiếm:</Text><Input.Search placeholder="Tên khách, SĐT..." onSearch={(v) => handleFilterChange({ Keyword: v })} allowClear style={{ width: 200 }} /></Space></Col>
            <Col><Space><Text>Thời gian:</Text><RangePicker format="DD/MM/YYYY" onChange={(dates) => handleFilterChange({ FromDate: dates ? dates[0].format('YYYY-MM-DD') : undefined, ToDate: dates ? dates[1].format('YYYY-MM-DD') : undefined })} /></Space></Col>
            <Col><Space><Text>Trạng thái:</Text><Select value={filterStatus} style={{ width: 150 }} options={[{ label: 'Chọn trạng thái', value: 'All' }, ...APPOINTMENT_STATUS.map(s => ({ label: s.label, value: s.value }))]} onChange={(v) => { setFilterStatus(v); handleFilterChange({ Status: v === 'All' ? undefined : v }); }} /></Space></Col>
          </Row>
        )}
      </div>

      {viewMode === 'table' ? (
        <Table columns={columns} dataSource={Array.isArray(data) ? data : (data?.items || [])} loading={loading} rowKey="id" size="middle" onChange={handleTableChange} pagination={{ ...pagination, showSizeChanger: true, pageSizeOptions: ['5', '10', '20', '50'] }} />
      ) : (
        <div style={{ background: '#fff', padding: '12px', borderRadius: '8px', border: '1px solid #f0f0f0' }}>
          <Spin spinning={loading} tip="Đang tải lịch..."><Calendar fullscreen={true} cellRender={(current, info) => info.type === 'date' ? dateCellRender(current) : info.originNode} onPanelChange={() => runFetch()} onSelect={(date, {source}) => { if(source === 'date'){ handleAddNew(); form.setFieldsValue({ appointmentDate: date }); } }} /></Spin>
        </div>
      )}

      <Modal 
        title={isEdit ? "Sửa lịch hẹn" : "Tạo lịch hẹn"} open={isModalOpen} onOk={() => form.submit()} onCancel={() => setIsModalOpen(false)}
        width={750} destroyOnClose confirmLoading={actionLoading} okText="Lưu lại" cancelText="Hủy"
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} onValuesChange={handleValuesChange}>
           <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="appointmentDate" label="Ngày hẹn" rules={[{ required: true }]}>
                  <DatePicker style={{width:'100%'}} format="DD/MM/YYYY" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="startTime" label="Giờ bắt đầu" rules={[{ required: true }]}>
                  <TimePicker format="HH:mm" style={{width:'100%'}} minuteStep={15}/>
                </Form.Item>
              </Col>
           </Row>

           <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="userId" label="Khách hàng">
                  <Select showSearch placeholder="Chọn khách" allowClear options={customerList.map(c => ({ label: c.fullName || c.userName || c.FullName, value: c.id || c.Id }))} filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())} />
                </Form.Item>
              </Col>
              
              <Col span={12}>
                <Form.Item name="wardId" label="Khu vực (Phường/Xã)" rules={[{ required: true, message: 'Vui lòng chọn khu vực!' }]}>
                  {/* CẬP NHẬT: Disabled khi Sửa để Form vẫn giữ giá trị wardId, xử lý triệt để lỗi trống Select do key từ Backend */}
                  <Select 
                    showSearch 
                    disabled={isEdit}
                    placeholder="Chọn khu vực" 
                    suffixIcon={<EnvironmentOutlined />}
                    options={wardList.map(w => ({ 
                      label: w.name || w.wardName || w.WardName || w.title, 
                      value: w.id || w.wardId || w.WardId || w.value 
                    }))} 
                    filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                  />
                </Form.Item>
              </Col>
           </Row>

           <Form.Item name="serviceIds" label="Dịch vụ" rules={[{ required: true }]}>
              <Select mode="multiple" placeholder="Chọn dịch vụ" options={serviceList.map(s => ({ label: `${s.name || s.serviceName} (${s.duration}p - ${formatCurrency(s.price)})`, value: s.id || s.serviceId }))} />
           </Form.Item>

           <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Giờ kết thúc dự kiến">
                <TimePicker value={previewEndTime} format="HH:mm" disabled placeholder="Sẽ tự động tính..." style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Tổng tiền dự kiến">
                  <Input value={formatCurrency(estimatedTotal)} disabled />
              </Form.Item>
            </Col>
           </Row>

           <Form.Item name="staffId" label="Nhân viên phụ trách">
              <Select placeholder="Chọn nhân viên (Tùy chọn)" allowClear options={availableStaffs.map(s => ({ label: s.fullName || s.name || s.userName, value: s.id || s.staffId }))} />
           </Form.Item>
        </Form>
      </Modal>

      <Drawer title={`Chi tiết lịch hẹn #${recordDetails?.id || ''}`} placement="right" width={450} onClose={() => setIsDrawerOpen(false)} open={isDrawerOpen}>
        {recordDetails && (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Descriptions title="Thông tin chung" column={1} bordered size="small">
              <Descriptions.Item label="Khách hàng"><Text strong>{recordDetails.userName}</Text></Descriptions.Item>
              <Descriptions.Item label="Khu vực"><Tag color="blue">{recordDetails.wardName || 'Chưa cập nhật'}</Tag></Descriptions.Item>
              <Descriptions.Item label="Nhân viên">{recordDetails.staffName || 'Chưa phân công'}</Descriptions.Item>
              <Descriptions.Item label="Ngày hẹn">{dayjs(recordDetails.appointmentDate).format('DD/MM/YYYY')}</Descriptions.Item>
              <Descriptions.Item label="Khung giờ">{recordDetails.timeRange || `${convertMinutesToTimeStr(recordDetails.startTime)} - ${convertMinutesToTimeStr(recordDetails.endTime)}`}</Descriptions.Item>
              <Descriptions.Item label="Trạng thái"><Tag color={getStatusConfig(recordDetails?.appointmentStatus)?.color}>{getStatusConfig(recordDetails?.appointmentStatus)?.label}</Tag></Descriptions.Item>
            </Descriptions>
            <div>
              <Title level={5}>Dịch vụ đã chọn</Title>
              <List size="small" bordered dataSource={recordDetails.appointmentServices || []} renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta title={item.serviceName} description={`Thời gian: ${item.durationAtBooking} phút`} />
                  <Text strong>{formatCurrency(item.priceAtBooking)}</Text>
                </List.Item>
              )} />
              <div style={{ textAlign: 'right', marginTop: '16px' }}>
                <Text>Tổng cộng: </Text><Title level={4} type="danger" style={{ display: 'inline', margin: 0 }}>{formatCurrency(recordDetails.totalPrice)}</Title>
              </div>
            </div>
          </Space>
        )}
      </Drawer>
    </Card>
  );
};

export default AppointmentManager;
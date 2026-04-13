import React, { useEffect, useState } from 'react';
import { 
  Table, Tag, Button, Space, Modal, Card, Typography, 
  Select, Form, Row, Col, DatePicker, TimePicker, Radio,
  Calendar, Badge
} from 'antd';
import { 
  EditOutlined, PlusOutlined,
  CalendarOutlined, TableOutlined
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

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
};

const AppointmentManager = () => {
  const [viewMode, setViewMode] = useState('calendar');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  
  const [customerList, setCustomerList] = useState([]); 
  const [serviceList, setServiceList] = useState([]); 
  const [availableStaffs, setAvailableStaffs] = useState([]); 
  const [estimatedTotal, setEstimatedTotal] = useState(0);

  const [form] = Form.useForm();

  const { data, loading, runFetch } = usePagination(appointmentApi.getAll);
  const { execute } = useApiAction();

  // FIX 1: Chạy useEffect 1 lần duy nhất khi component mount
  useEffect(() => { 
    runFetch(); 
    fetchInitialData(); 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // FIX 2: Tách riêng từng luồng gọi API, lỗi cái nào bỏ qua cái đó không làm chết app
  const fetchInitialData = async () => {
    try {
      const userRes = await userApi.getAll();
      const allUsers = userRes?.items || userRes?.data || userRes || [];
      setCustomerList(allUsers.filter(u => u.role === 'Customer' || u.roleName === 'Customer'));
    } catch (error) { 
      console.error("Lỗi khi tải danh sách khách hàng:", error); 
    }

    try {
      const serviceRes = await serviceApi.getAll();
      setServiceList(serviceRes?.items || serviceRes?.data || serviceRes || []);
    } catch (error) {
      console.error("Lỗi khi tải danh sách dịch vụ:", error); 
    }
  };

  // --- Hàm Render Sự kiện cho Lịch Ant Design ---
  const getListData = (value) => {
    const list = Array.isArray(data) ? data : (data?.items || data?.data || []);
    return list.filter(item => dayjs(item.appointmentDate).isSame(value, 'day'));
  };

  const dateCellRender = (value) => {
    const listData = getListData(value);
    return (
      <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
        {listData.map((item) => {
          let statusColor = 'processing';
          if (item.appointmentStatus === 'Completed') statusColor = 'success';
          if (item.appointmentStatus === 'Cancelled') statusColor = 'error';
          if (item.appointmentStatus === 'Pending') statusColor = 'warning';

          const timeStr = convertMinutesToTimeStr(item.startTime);
          const customerName = item.userName || 'Khách lẻ';

          return (
            <li 
              key={item.id} 
              style={{ marginBottom: '4px', cursor: 'pointer' }}
              onClick={(e) => {
                e.stopPropagation(); 
                handleEdit(item);
              }}
            >
              <Badge 
                status={statusColor} 
                text={<span style={{ fontSize: '12px' }}>{timeStr} - {customerName}</span>} 
                style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}
              />
            </li>
          );
        })}
      </ul>
    );
  };

  const cellRender = (current, info) => {
    if (info.type === 'date') return dateCellRender(current);
    return info.originNode;
  };

  const handleDateSelect = (date, info) => {
    if (info.source === 'date') {
      handleAddNew();
      form.setFieldsValue({ appointmentDate: date });
    }
  };

  // --- Các hàm xử lý Form ---
  const handleAddNew = () => {
    setIsEdit(false);
    setSelectedAppointment(null);
    form.resetFields();
    setAvailableStaffs([]);
    setEstimatedTotal(0);
    setIsModalOpen(true);
  };

  const handleEdit = (record) => {
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
      // Nếu không có endTime, tạm cộng thêm 60 phút để api lấy staff hoạt động
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
  };

  const handleSubmit = async (values) => {
    const payload = {
      ...values,
      userId: values.userId ? Number(values.userId) : null,
      staffId: values.staffId ? Number(values.staffId) : null,
      appointmentDate: values.appointmentDate ? values.appointmentDate.format('YYYY-MM-DD') : null,
      startTime: values.startTime ? convertDayjsToMinutes(values.startTime) : null,
      // FIX 3: Cho phép null nếu không chọn EndTime
      endTime: values.endTime ? convertDayjsToMinutes(values.endTime) : null,
      totalPrice: estimatedTotal
    };
    
    const apiCall = isEdit ? () => appointmentApi.update(selectedAppointment.id, payload) : () => appointmentApi.createByAdmin(payload);
    const { success } = await execute(apiCall, isEdit ? "Cập nhật thành công!" : "Tạo thành công!");
    
    if (success) { 
      setIsModalOpen(false); 
      runFetch(); // Cập nhật lại list sau khi submit
    }
  };

  const tableDataSource = Array.isArray(data) ? data : (data?.items || data?.data || []);

  return (
    <Card bordered={false}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={3} style={{ margin: 0 }}>Quản lý lịch hẹn</Title>
        </Col>
        <Col>
          <Space>
            <Radio.Group value={viewMode} onChange={(e) => setViewMode(e.target.value)}>
              <Radio.Button value="calendar"><CalendarOutlined /> Lịch</Radio.Button>
              <Radio.Button value="table"><TableOutlined /> Danh sách</Radio.Button>
            </Radio.Group>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAddNew}>Tạo mới</Button>
          </Space>
        </Col>
      </Row>

      {viewMode === 'table' ? (
        <Table 
          dataSource={tableDataSource} 
          loading={loading} 
          rowKey="id" 
          columns={[
             { title: 'Mã LH', dataIndex: 'id' },
             { title: 'Khách hàng', dataIndex: 'userName', render: t => <Text strong>{t || 'N/A'}</Text> },
             { title: 'Ngày', dataIndex: 'appointmentDate' },
             { title: 'Thời gian', render: (_, r) => convertMinutesToTimeStr(r.startTime) },
             { title: 'Tổng tiền', dataIndex: 'totalPrice', render: p => <Text type="success">{formatCurrency(p)}</Text> },
             { 
               title: 'Trạng thái', 
               dataIndex: 'appointmentStatus', 
               render: (s) => {
                 const map = { "Pending": "warning", "Confirmed": "processing", "Completed": "success", "Cancelled": "error" };
                 return <Tag color={map[s] || 'default'}>{s}</Tag>;
               } 
             },
             { 
               title: 'Thao tác', 
               render: (_, r) => <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(r)} /> 
             }
          ]}
        />
      ) : (
        <div className="custom-calendar-wrapper">
          <Calendar 
            cellRender={cellRender} 
            onSelect={handleDateSelect}
          />
        </div>
      )}

      <Modal 
        title={isEdit ? "Sửa lịch hẹn" : "Tạo lịch hẹn"}
        open={isModalOpen}
        onOk={() => form.submit()}
        onCancel={() => setIsModalOpen(false)}
        width={750}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
           <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="appointmentDate" label="Ngày hẹn" rules={[{ required: true }]}>
                  <DatePicker style={{width:'100%'}} />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name="startTime" label="Giờ bắt đầu" rules={[{ required: true }]}>
                  <TimePicker format="HH:mm" style={{width:'100%'}} minuteStep={15}/>
                </Form.Item>
              </Col>
              <Col span={6}>
                {/* Đã bỏ required ở đây để không bắt buộc nhập EndTime */}
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
                placeholder="Chọn nhân viên" 
                allowClear
                options={availableStaffs.map(s => ({ label: s.fullName, value: s.id }))}
              />
           </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default AppointmentManager;
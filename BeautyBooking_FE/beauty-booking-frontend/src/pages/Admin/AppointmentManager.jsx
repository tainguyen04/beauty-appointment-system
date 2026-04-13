import React, { useEffect, useState, useCallback } from 'react';
import { 
  Table, Tag, Button, Space, Modal, Card, Typography, Drawer, 
  Descriptions, Select, Dropdown, Form, Row, Col, DatePicker, List, TimePicker, Spin, message, Alert
} from 'antd';
import { 
  EyeOutlined, EditOutlined, DeleteOutlined, 
  MoreOutlined, PlusOutlined, CheckCircleOutlined 
} from '@ant-design/icons';
import dayjs from 'dayjs';

// --- Imports Hooks & APIs ---
import { usePagination } from '../../hooks/usePagination';
import { useApiAction } from '../../hooks/useApiAction';
import appointmentApi from '../../api/appointmentApi';
import staffApi from '../../api/staffApi'; 
import userApi from '../../api/userApi'; 
import serviceApi from '../../api/serviceApi';

// --- Imports Helpers ---
import { convertMinutesToTimeStr, convertDayjsToMinutes } from '../../utils/apiHelper'; 

const { Title, Text } = Typography;
const { Option } = Select;

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
};

const AppointmentManager = () => {
  // --- States Modal & Drawer ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [openDetail, setOpenDetail] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false); 
  
  // --- States Lists ---
  const [customerList, setCustomerList] = useState([]); 
  const [serviceList, setServiceList] = useState([]); 
  const [availableStaffs, setAvailableStaffs] = useState([]); 
  
  // --- States Loading & Calculation ---
  const [loadingStaffData, setLoadingStaffData] = useState(false);
  const [calculatingTotal, setCalculatingTotal] = useState(false);
  const [estimatedTotal, setEstimatedTotal] = useState(0); // <-- State lưu tổng tiền

  const [form] = Form.useForm();
  const [statusForm] = Form.useForm();

  // --- Custom Hooks ---
  const { 
    data, 
    loading, 
    pagination = { current: 1, pageSize: 10, total: 0 }, 
    runFetch, 
    handleTableChange, 
    handleFilterChange 
  } = usePagination(appointmentApi.getAll);
  
  const { actionLoading, execute } = useApiAction();

  const fetchData = useCallback(() => { runFetch(); }, [runFetch]);
  
  useEffect(() => { 
    fetchData(); 
    fetchInitialData(); 
  }, [fetchData]);

  const fetchInitialData = async () => {
    try {
      const [userRes, serviceRes] = await Promise.all([
        userApi.getAll(),
        serviceApi.getAll() 
      ]);
      
      const allUsers = userRes?.items || userRes?.data || userRes || [];
      const customers = allUsers.filter(u => u.role === 'Customer' || u.roleName === 'Customer'); 
      setCustomerList(customers);

      setServiceList(serviceRes?.items || serviceRes?.data || serviceRes || []);
    } catch (error) {
      console.error("Lỗi lấy dữ liệu ban đầu:", error);
    }
  };

  // --- Lắng nghe thay đổi Form ---
  const handleValuesChange = async (changedValues, allValues) => {
    // 1. XỬ LÝ TỔNG TIỀN KHI CHỌN DỊCH VỤ
    if (changedValues.serviceIds) {
      const { serviceIds } = allValues;
      if (serviceIds && serviceIds.length > 0) {
        setCalculatingTotal(true);
        try {
          // Gọi API tính tổng tiền. (Lưu ý: Truyền payload theo đúng cấu trúc BE của bạn)
          const res = await serviceApi.calculateTotal(serviceIds);
          // Gán kết quả (Tùy thuộc BE trả về số trực tiếp hay object { total: ... })
          setEstimatedTotal(res?.totalPrice ?? res?.total ?? res?.data ?? res ?? 0);
        } catch (error) {
          console.error("Lỗi tính tổng tiền:", error);
          setEstimatedTotal(0);
        } finally {
          setCalculatingTotal(false);
        }
      } else {
        setEstimatedTotal(0);
      }
    }

    // 2. XỬ LÝ TÌM NHÂN VIÊN KHI ĐỔI THỜI GIAN
    if (changedValues.appointmentDate || changedValues.startTime || changedValues.endTime) {
      const { appointmentDate, startTime, endTime } = allValues;
      form.setFieldsValue({ staffId: null });

      if (appointmentDate && startTime && endTime) {
        const dateStr = appointmentDate.format('YYYY-MM-DD');
        const startMin = convertDayjsToMinutes(startTime);
        const endMin = convertDayjsToMinutes(endTime);

        if (startMin >= endMin) {
          message.warning("Giờ kết thúc phải sau giờ bắt đầu!");
          setAvailableStaffs([]);
          return;
        }

        setLoadingStaffData(true);
        try {
          const res = await staffApi.getAvailable(dateStr, startMin, endMin);
          const staffs = res?.items || res?.data || res || [];
          setAvailableStaffs(staffs);

          if (staffs.length === 0) {
            message.info("Không có nhân viên nào rảnh trong khung giờ này.");
          }
        } catch (error) {
          console.error("Lỗi tìm nhân viên:", error);
          setAvailableStaffs([]);
        } finally {
          setLoadingStaffData(false);
        }
      } else {
        setAvailableStaffs([]);
      }
    }
  };

  // --- Handlers: Thêm mới & Cập nhật ---
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
    
    const startTimeStr = convertMinutesToTimeStr(record.startTime); 
    const startTimeObj = startTimeStr ? dayjs().startOf('day').add(record.startTime, 'minute') : null;
    const endTimeStr = record.endTime ? convertMinutesToTimeStr(record.endTime) : null;
    const endTimeObj = endTimeStr ? dayjs().startOf('day').add(record.endTime, 'minute') : null;

    setEstimatedTotal(record.totalPrice || 0);

    form.setFieldsValue({
      userId: record.userId,
      appointmentDate: record.appointmentDate ? dayjs(record.appointmentDate) : null,
      startTime: startTimeObj,
      endTime: endTimeObj,
      serviceIds: record.appointmentServices?.map(s => s.serviceId) || [] 
    });

    if (record.appointmentDate && record.startTime && record.endTime) {
       staffApi.getAvailable(
         dayjs(record.appointmentDate).format('YYYY-MM-DD'), 
         record.startTime, 
         record.endTime
       ).then(res => {
         setAvailableStaffs(res?.items || res?.data || res || []);
         form.setFieldsValue({ staffId: record.staffId });
       });
    } else {
       form.setFieldsValue({ staffId: record.staffId });
    }
    
    setIsModalOpen(true);
  };

  const handleSubmit = async (values) => {
    const payload = {
      userId: values.userId ? Number(values.userId) : null,
      staffId: Number(values.staffId),
      appointmentDate: values.appointmentDate ? values.appointmentDate.format('YYYY-MM-DD') : null,
      startTime: convertDayjsToMinutes(values.startTime), 
      endTime: convertDayjsToMinutes(values.endTime), 
      serviceIds: values.serviceIds || [],
      totalPrice: estimatedTotal // Gửi kèm tổng tiền nếu BE yêu cầu
    };

    let apiCall = isEdit 
      ? () => appointmentApi.update(selectedAppointment.id, payload)
      : () => appointmentApi.createByAdmin(payload);
    
    let msg = isEdit ? "Cập nhật lịch hẹn thành công!" : "Tạo lịch hẹn mới thành công!";

    const { success } = await execute(apiCall, msg);
    if (success) {
      setIsModalOpen(false);
      fetchData();
    }
  };

  // --- Handlers: Trạng thái & Chi tiết ---
  const handleOpenUpdateStatus = (record) => {
    setSelectedAppointment(record);
    statusForm.setFieldsValue({ status: record.appointmentStatus });
    setIsStatusModalOpen(true);
  };

  const handleStatusSubmit = async (values) => {
    const jsonStringStatus = `"${values.status}"`; 
    const { success } = await execute(
      () => appointmentApi.updateStatus(selectedAppointment.id, jsonStringStatus), 
      "Cập nhật trạng thái thành công!"
    );
    if (success) {
      setIsStatusModalOpen(false);
      fetchData();
    }
  };

  const showDetail = async (id) => {
    setDetailLoading(true); 
    setOpenDetail(true);
    try {
      const res = await appointmentApi.getById(id);
      setSelectedAppointment(res);
    } catch (error) {
      console.log("Lỗi lấy chi tiết lịch hẹn:", error);
      setOpenDetail(false);
    } finally { 
      setDetailLoading(false); 
    }
  };

  // --- Columns Definition ---
  const columns = [
    { title: 'Mã LH', dataIndex: 'id', width: 80 },
    { title: 'Khách hàng', dataIndex: 'userName', render: (text) => <Text strong>{text || 'N/A'}</Text> },
    { 
      title: 'Dịch vụ', 
      key: 'services',
      render: (_, record) => {
        const services = record.appointmentServices;
        if (!services || services.length === 0) return <Text type="secondary">Chưa chọn DV</Text>;
        return (
          <Space direction="vertical" size={0}>
            {services.map(s => <Tag key={s.serviceId} color="blue">{s.serviceName}</Tag>)}
          </Space>
        );
      }
    },
    { 
      title: 'Thời gian hẹn', 
      key: 'time',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>{record.timeRange || convertMinutesToTimeStr(record.startTime) || 'N/A'}</Text>
          <Text type="secondary">{record.appointmentDate}</Text>
        </Space>
      )
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalPrice',
      render: (price) => (
        <Text type="success" strong>
          {formatCurrency(price)}
        </Text>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'appointmentStatus',
      render: (status) => {
        if (!status) return <Tag color="default">TRỐNG</Tag>;
        const statusMap = {
          "Pending": { color: 'gold', text: 'Chờ xác nhận' },
          "Confirmed": { color: 'blue', text: 'Đã xác nhận' },
          "Completed": { color: 'green', text: 'Hoàn thành' },
          "Cancelled": { color: 'red', text: 'Đã hủy' },
        };
        const config = statusMap[status] || { color: 'default', text: status };
        return <Tag color={config.color} style={{ fontWeight: '500' }}>{String(config.text).toUpperCase()}</Tag>;
      }
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 80,
      align: 'center',
      render: (_, record) => {
        const items = [
          { key: 'detail', label: 'Xem chi tiết', icon: <EyeOutlined />, onClick: () => showDetail(record.id) },
          { key: 'edit', label: 'Chỉnh sửa', icon: <EditOutlined />, onClick: () => handleEdit(record) },
          { key: 'status', label: 'Đổi trạng thái', icon: <CheckCircleOutlined />, onClick: () => handleOpenUpdateStatus(record) },
          { type: 'divider' },
          { 
            key: 'delete', label: 'Xóa lịch hẹn', icon: <DeleteOutlined />, danger: true,
            onClick: () => Modal.confirm({
              title: 'Xóa lịch hẹn?',
              content: 'Hành động này không thể hoàn tác.',
              okType: 'danger',
              onOk: async () => {
                const { success } = await execute(() => appointmentApi.delete(record.id), "Đã xóa lịch hẹn!");
                if (success) fetchData();
              }
            })
          },
        ];
        return (
          <Dropdown menu={{ items }} trigger={['click']} placement="bottomRight">
            <Button type="text" icon={<MoreOutlined style={{ fontSize: '18px' }} />} />
          </Dropdown>
        );
      }
    }
  ];

  // Khắc phục lỗi Data Source không map đúng chuẩn mảng
  const tableDataSource = Array.isArray(data) ? data : (data?.items || data?.data || []);

  return (
    <Card bordered={false}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>Quản lý lịch hẹn</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAddNew}>
          Tạo lịch hẹn mới
        </Button>
      </div>

      <div style={{ marginBottom: 16 }}>
        <Space size="middle">
          <Select
            placeholder="Lọc trạng thái"
            style={{ width: 180 }}
            allowClear
            onChange={(val) => handleFilterChange({ Status: val })}
          >
            <Option value="Pending">Chờ xác nhận</Option>
            <Option value="Confirmed">Đã xác nhận</Option>
            <Option value="Completed">Hoàn thành</Option>
            <Option value="Cancelled">Đã hủy</Option>
          </Select>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={tableDataSource} // <-- SỬ DỤNG MẢNG ĐÃ PARSE CHUẨN
        loading={loading}
        pagination={pagination ? { ...pagination, showSizeChanger: true, pageSizeOptions: ['10', '20', '50'] } : { current: 1, pageSize: 10, total: 0 }} 
        onChange={handleTableChange}
        rowKey="id"
        bordered
      />

      {/* MODAL CREATE / UPDATE */}
      <Modal
        title={isEdit ? "Chỉnh sửa lịch hẹn" : "Tạo lịch hẹn mới"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={actionLoading}
        width={750}
        destroyOnClose
      >
        <Form 
          form={form} 
          layout="vertical" 
          onFinish={handleSubmit}
          onValuesChange={handleValuesChange}
        >
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="userId" label="Khách hàng">
                <Select 
                  placeholder="Chọn khách hàng (có thể trống)" 
                  showSearch 
                  allowClear
                  optionFilterProp="children"
                >
                  {customerList.map(cus => (
                    <Option key={cus.id} value={cus.id}>
                      {cus.fullName || cus.name || cus.userName || `Khách hàng #${cus.id}`}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item 
                name="serviceIds" 
                label="Dịch vụ" 
                rules={[{ required: true, message: 'Vui lòng chọn ít nhất 1 dịch vụ' }]}
              >
                <Select 
                  mode="multiple"
                  placeholder="Chọn các dịch vụ khách muốn làm"
                  optionFilterProp="children"
                >
                  {serviceList.map(srv => (
                    <Option key={srv.id} value={srv.id}>{srv.name || srv.serviceName}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {/* HIỂN THỊ TỔNG TIỀN DỰ KIẾN */}
          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col span={24}>
              <Spin spinning={calculatingTotal} size="small">
                <Alert 
                  message={
                    <Text strong>
                      Tổng tiền dự kiến: <span style={{ color: '#52c41a', fontSize: '16px' }}>{formatCurrency(estimatedTotal)}</span>
                    </Text>
                  } 
                  type="success" 
                  showIcon 
                />
              </Spin>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item 
                name="appointmentDate" 
                label="Ngày hẹn" 
                rules={[{ required: true, message: 'Chọn ngày hẹn' }]}
              >
                <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item 
                name="startTime" 
                label="Giờ bắt đầu" 
                rules={[{ required: true, message: 'Chọn giờ bắt đầu' }]}
              >
                <TimePicker 
                  style={{ width: '100%' }} 
                  format="HH:mm" 
                  minuteStep={15} 
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item 
                name="endTime" 
                label="Giờ kết thúc (Dự kiến)" 
                rules={[{ required: true, message: 'Chọn giờ kết thúc để lọc nhân viên' }]}
              >
                <TimePicker 
                  style={{ width: '100%' }} 
                  format="HH:mm" 
                  minuteStep={15} 
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Spin spinning={loadingStaffData} tip="Đang tìm nhân viên rảnh...">
                <Form.Item 
                  name="staffId" 
                  label="Nhân viên phụ trách (Tự động lọc theo thời gian)" 
                  rules={[{ required: true, message: 'Bắt buộc chọn nhân viên' }]}
                >
                  <Select 
                    placeholder="Vui lòng chọn Ngày và Giờ để xem nhân viên rảnh" 
                    showSearch
                    disabled={availableStaffs.length === 0}
                    optionFilterProp="children"
                  >
                    {availableStaffs.map(staff => (
                      <Option key={staff.id} value={staff.id}>
                        {staff.fullName || staff.name || `Nhân viên #${staff.id}`}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Spin>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* MODAL TRẠNG THÁI */}
      <Modal
        title={`Cập nhật trạng thái lịch hẹn #${selectedAppointment?.id}`}
        open={isStatusModalOpen}
        onCancel={() => setIsStatusModalOpen(false)}
        onOk={() => statusForm.submit()}
        confirmLoading={actionLoading}
        width={400}
        destroyOnClose
      >
        <Form form={statusForm} layout="vertical" onFinish={handleStatusSubmit}>
          <Form.Item name="status" label="Trạng thái" rules={[{ required: true }]}>
            <Select placeholder="Chọn trạng thái">
              <Option value="Pending">Chờ xác nhận</Option>
              <Option value="Confirmed">Đã xác nhận</Option>
              <Option value="Completed">Hoàn thành</Option>
              <Option value="Cancelled">Đã hủy</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* DRAWER CHI TIẾT */}
      <Drawer
        title="Chi tiết lịch hẹn"
        width={450}
        onClose={() => setOpenDetail(false)}
        open={openDetail}
      >
        {detailLoading ? (
          <div style={{ textAlign: 'center', padding: '50px 0' }}>
            <Spin tip="Đang tải dữ liệu..." size="large" />
          </div>
        ) : (
          <>
            <Descriptions column={1} bordered size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="Mã lịch hẹn"><Text strong>{selectedAppointment?.id}</Text></Descriptions.Item>
              <Descriptions.Item label="Khách hàng">{selectedAppointment?.userName || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Nhân viên">{selectedAppointment?.staffName || 'Chưa xếp'}</Descriptions.Item>
              <Descriptions.Item label="Ngày hẹn">{selectedAppointment?.appointmentDate}</Descriptions.Item>
              <Descriptions.Item label="Giờ hẹn">{selectedAppointment?.timeRange || convertMinutesToTimeStr(selectedAppointment?.startTime)}</Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={selectedAppointment?.appointmentStatus === 'Completed' ? 'green' : 'blue'}>
                  {selectedAppointment?.appointmentStatus}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Tổng tiền">
                <Text type="success" strong>
                  {formatCurrency(selectedAppointment?.totalPrice)}
                </Text>
              </Descriptions.Item>
            </Descriptions>

            <Title level={5}>Dịch vụ đã đặt:</Title>
            <List
              bordered
              dataSource={selectedAppointment?.appointmentServices || []}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    title={item.serviceName}
                    description={`Thời lượng: ${item.durationAtBooking} phút`}
                  />
                  <Text strong>
                    {formatCurrency(item.priceAtBooking)}
                  </Text>
                </List.Item>
              )}
            />
          </>
        )}
      </Drawer>
    </Card>
  );
};

export default AppointmentManager;
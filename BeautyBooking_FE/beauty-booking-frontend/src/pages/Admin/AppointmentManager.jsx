import React, { useEffect, useState, useCallback } from 'react';
import { 
  Table, Tag, Button, Space, Modal, Card, Typography, Drawer, 
  Descriptions, Select, Dropdown, Form, Row, Col, DatePicker, Input, List
} from 'antd';
import { 
  EyeOutlined, EditOutlined, DeleteOutlined, 
  MoreOutlined, PlusOutlined, CheckCircleOutlined 
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { usePagination } from '../../hooks/usePagination';
import { useApiAction } from '../../hooks/useApiAction';
import appointmentApi from '../../api/appointmentApi';

const { Title, Text } = Typography;
const { Option } = Select;

const AppointmentManager = () => {
  // --- States ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [openDetail, setOpenDetail] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  
  const [form] = Form.useForm();
  const [statusForm] = Form.useForm();

  // --- Custom Hooks ---
  const { data, loading, pagination, runFetch, handleTableChange, handleFilterChange } = usePagination(appointmentApi.getAll);
  const { actionLoading, execute } = useApiAction();

  const fetchData = useCallback(() => {
    runFetch();
  }, [runFetch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- Handlers cho Create/Update ---
  const handleAddNew = () => {
    setIsEdit(false);
    setSelectedAppointment(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (record) => {
    setIsEdit(true);
    setSelectedAppointment(record);
    form.setFieldsValue({
      userId: record.userId,
      staffId: record.staffId,
      // Lưu ý: BE của bạn trả về DateOnly, FE dùng dayjs để map lên Form
      appointmentDate: record.appointmentDate ? dayjs(record.appointmentDate) : null,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (values) => {
    let apiCall;
    let msg = "";

    const payload = {
      ...values,
      appointmentDate: values.appointmentDate ? values.appointmentDate.format('YYYY-MM-DD') : null
    };

    if (isEdit) {
      apiCall = () => appointmentApi.update(selectedAppointment.id, payload);
      msg = "Cập nhật lịch hẹn thành công!";
    } else {
      apiCall = () => appointmentApi.createByAdmin(payload);
      msg = "Tạo lịch hẹn mới thành công!";
    }

    const { success } = await execute(apiCall, msg);

    if (success) {
      setIsModalOpen(false);
      fetchData();
    }
  };

  // --- Handler cho Cập nhật trạng thái ---
  const handleOpenUpdateStatus = (record) => {
    setSelectedAppointment(record);
    // Gán status dạng chữ (vd: "Pending", "Confirmed")
    statusForm.setFieldsValue({ status: record.appointmentStatus });
    setIsStatusModalOpen(true);
  };

  const handleStatusSubmit = async (values) => {
    // Vì BE dùng [FromBody] nên ở file api phải gửi giá trị dạng chuỗi JSON: '"Pending"'
    // File appointmentApi.js của bạn đã setup headers 'Content-Type': 'application/json'
    // Nên mình chỉ cần bọc values.status trong nháy kép để nó thành JSON string hợp lệ
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

  // --- Handlers khác ---
  const showDetail = async (id) => {
    setDetailLoading(true);
    setOpenDetail(true);
    try {
      const res = await appointmentApi.getById(id);
      setSelectedAppointment(res);
    } catch (error) {
      console.error("Lỗi chi tiết:", error);
      setOpenDetail(false);
    } finally { 
      setDetailLoading(false); 
    }
  };

  // --- Columns Definition ---
  const columns = [
    {
      title: 'Mã LH',
      dataIndex: 'id',
      width: 80,
    },
    { 
      title: 'Khách hàng', 
      dataIndex: 'userName', // Map đúng DTO mới
      render: (text) => <Text strong>{text || 'N/A'}</Text>
    },
    { 
      title: 'Dịch vụ', 
      key: 'services',
      // Dịch vụ là 1 list trong DTO mới, mình sẽ map và nối chuỗi tên DV lại
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
      // Kết hợp DateOnly và TimeRange từ C#
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>{record.timeRange || 'N/A'}</Text>
          <Text type="secondary">{record.appointmentDate}</Text>
        </Space>
      )
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalPrice',
      render: (price) => (
        <Text type="success" strong>
          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0)}
        </Text>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'appointmentStatus', // Dùng đúng tên biến từ C#
      render: (status) => {
        if (!status) return <Tag color="default">TRỐNG</Tag>;

        // BE trả thẳng chuỗi, ta map chuỗi ra tiếng Việt và màu sắc
        const statusMap = {
          "Pending": { color: 'gold', text: 'Chờ xác nhận' },
          "Confirmed": { color: 'blue', text: 'Đã xác nhận' },
          "Completed": { color: 'green', text: 'Hoàn thành' },
          "Cancelled": { color: 'red', text: 'Đã hủy' },
        };

        const config = statusMap[status] || { color: 'default', text: status };

        return (
          <Tag color={config.color} style={{ fontWeight: '500' }}>
            {String(config.text).toUpperCase()}
          </Tag>
        );
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
          { 
            key: 'status', 
            label: 'Đổi trạng thái', 
            icon: <CheckCircleOutlined />, 
            onClick: () => handleOpenUpdateStatus(record) 
          },
          { type: 'divider' },
          { 
            key: 'delete', 
            label: 'Xóa lịch hẹn', 
            icon: <DeleteOutlined />, 
            danger: true,
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

  return (
    <Card bordered={false}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>Quản lý lịch hẹn</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAddNew}>
          Tạo lịch hẹn mới
        </Button>
      </div>

      {/* Filter Options */}
      <div style={{ marginBottom: 16 }}>
        <Space size="middle">
          <Select
            placeholder="Lọc trạng thái"
            style={{ width: 180 }}
            allowClear
            onChange={(val) => handleFilterChange({ Status: val })}
          >
            {/* Lọc theo Enum chữ String từ BE */}
            <Option value="Pending">Chờ xác nhận</Option>
            <Option value="Confirmed">Đã xác nhận</Option>
            <Option value="Completed">Hoàn thành</Option>
            <Option value="Cancelled">Đã hủy</Option>
          </Select>
        </Space>
      </div>

      {/* Bảng Dữ Liệu */}
      <Table
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50'],
        }} 
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
        width={700}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="userId" label="ID Khách hàng" rules={[{ required: true }]}>
                <Input type="number" placeholder="Nhập ID khách hàng" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="staffId" label="ID Nhân viên (Tùy chọn)">
                <Input type="number" placeholder="Nhập ID nhân viên thực hiện" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="appointmentDate" label="Ngày hẹn" rules={[{ required: true }]}>
                <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* MODAL CẬP NHẬT TRẠNG THÁI */}
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
          <Form.Item 
            name="status" 
            label="Trạng thái" 
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
          >
            {/* Sử dụng Enum chữ thay cho số */}
            <Select placeholder="Chọn trạng thái mới">
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
        {detailLoading ? <p>Đang tải dữ liệu...</p> : (
          <>
            <Descriptions column={1} bordered size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="Mã lịch hẹn"><Text strong>{selectedAppointment?.id}</Text></Descriptions.Item>
              <Descriptions.Item label="Khách hàng">{selectedAppointment?.userName || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Nhân viên">{selectedAppointment?.staffName || 'Chưa xếp'}</Descriptions.Item>
              <Descriptions.Item label="Ngày hẹn">{selectedAppointment?.appointmentDate}</Descriptions.Item>
              <Descriptions.Item label="Giờ hẹn">{selectedAppointment?.timeRange}</Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={selectedAppointment?.appointmentStatus === 'Completed' ? 'green' : 'blue'}>
                  {selectedAppointment?.appointmentStatus}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Tổng tiền">
                <Text type="success" strong>
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedAppointment?.totalPrice || 0)}
                </Text>
              </Descriptions.Item>
            </Descriptions>

            {/* Hiển thị mảng AppointmentServices */}
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
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.priceAtBooking)}
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
import React, { useEffect, useState, useCallback } from 'react';
import { 
  Table, Tag, Button, Space, Modal, message, Card, 
  Input, Typography, Drawer, Descriptions, Avatar, Select,
  Dropdown, Form, Row, Col, Upload
} from 'antd';
import { 
  UserOutlined, EyeOutlined, FilterOutlined, KeyOutlined, 
  MoreOutlined, PlusOutlined, EditOutlined, UploadOutlined,
  DeleteOutlined, StopOutlined, CheckCircleOutlined 
} from '@ant-design/icons';
import { usePagination } from '../../hooks/usePagination';
import { useApiAction } from '../../hooks/useApiAction'; // MỚI: Import useApiAction
import userApi from '../../api/userApi';

const { Title, Text } = Typography;
const { Option } = Select;

const UserManager = () => {
  // --- States ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  // LƯU Ý: Đã xóa state submitLoading thủ công vì dùng actionLoading của useApiAction
  
  const [openDetail, setOpenDetail] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  
  const [form] = Form.useForm();

  // --- Custom Hooks ---
  const { data, loading, pagination, runFetch, handleTableChange, handleFilterChange } = usePagination(userApi.getAll);
  const { actionLoading, execute } = useApiAction(); // MỚI: Khởi tạo useApiAction

  // --- Sử dụng useCallback để ổn định hàm fetch dữ liệu (Tránh Warning) ---
  const fetchData = useCallback(() => {
    runFetch();
  }, [runFetch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- Handlers cho Create/Update ---
  const handleAddNew = () => {
    setIsEdit(false);
    setSelectedUser(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (record) => {
    setIsEdit(true);
    setSelectedUser(record);
    form.setFieldsValue({
      name: record.fullName,
      phone: record.phone,
      role: record.role
    });
    setIsModalOpen(true);
  };

  // MỚI: Cấu trúc lại handleSubmit gọn gàng bằng execute
  const handleSubmit = async (values) => {
    let apiCall;
    let msg = "";

    if (isEdit) {
      // 1. CẤU TRÚC CHO UPDATE
      const formData = new FormData();
      if (values.name) formData.append('Name', values.name);
      if (values.phone) formData.append('Phone', values.phone);
      if (values.avatar?.fileList?.length > 0) {
        formData.append('AvatarUrl', values.avatar.fileList[0].originFileObj);
      }
      
      apiCall = () => userApi.update(selectedUser.id, formData);
      msg = "Cập nhật người dùng thành công!";
    } else {
      // 2. CẤU TRÚC CHO CREATE
      const createData = {
        fullName: values.name,
        email: values.email,
        password: values.password,
        role: values.role,
        wardId: values.wardId ? parseInt(values.wardId) : null
      };

      apiCall = () => userApi.createUser(createData);
      msg = "Tạo tài khoản mới thành công!";
    }

    // Thực thi API thông qua hook
    const { success } = await execute(apiCall, msg);

    if (success) {
      setIsModalOpen(false);
      fetchData(); // Load lại bảng sau khi thành công
    }
  };

  // --- Các hàm hỗ trợ khác (Detail) ---
  const showDetail = async (id) => {
    setDetailLoading(true);
    setOpenDetail(true);
    try {
      const res = await userApi.getById(id);
      setSelectedUser(res);
    } catch (error) {
      message.error("Lỗi lấy chi tiết", error);
      setOpenDetail(false);
    } finally { 
      setDetailLoading(false); 
    }
  };

  // --- Columns Definition ---
  const columns = [
    {
      title: 'Họ tên',
      dataIndex: 'fullName',
      render: (text, record) => (
        <Space>
          <Avatar src={record.avatarUrl} icon={<UserOutlined />} />
          <Text strong>{text || 'N/A'}</Text>
        </Space>
      ),
    },
    { title: 'Email', dataIndex: 'email' },
    { title: 'Số điện thoại', dataIndex: 'phone' },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      render: (role) => {
        const roleConfig = {
          Admin: { color: 'volcano', text: 'Quản trị viên' },
          Staff: { color: 'blue', text: 'Nhân viên' },
          Customer: { color: 'green', text: 'Khách hàng' }
        };

        const config = roleConfig[role] || { color: 'default', text: role };

        return (
          <Tag color={config.color} style={{ fontWeight: '500' }}>
            {config.text.toUpperCase()}
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
            key: 'reset', 
            label: 'Reset mật khẩu', 
            icon: <KeyOutlined />, 
            // MỚI: Bọc Reset Password trong execute
            onClick: () => Modal.confirm({
                title: 'Reset mật khẩu?',
                content: 'Bạn có chắc chắn muốn đặt lại mật khẩu cho tài khoản này?',
                onOk: async () => {
                  await execute(() => userApi.resetPassword(record.id), "Đã reset mật khẩu thành công!");
                }
            }) 
          },
          { type: 'divider' },
          { 
            key: 'delete', 
            label: 'Xóa', 
            icon: <DeleteOutlined />, 
            danger: true,
            // MỚI: Bọc thao tác Xóa trong execute
            onClick: () => Modal.confirm({
              title: 'Xóa tài khoản này?',
              content: 'Hành động này không thể hoàn tác.',
              okType: 'danger',
              onOk: async () => {
                const { success } = await execute(() => userApi.delete(record.id), "Đã xóa tài khoản!");
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
      {/* Header Quản lý */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>Quản lý người dùng</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAddNew}>
          Thêm người dùng
        </Button>
      </div>

      {/* Filter & Search */}
      <div style={{ marginBottom: 16 }}>
        <Space size="middle">
          <Select
            placeholder="Lọc vai trò"
            style={{ width: 160 }}
            allowClear
            onChange={(val) => handleFilterChange({ Role: val })}
          >
            <Option value="Customer">Khách hàng</Option>
            <Option value="Staff">Nhân viên</Option>
            <Option value="Admin">Quản trị viên</Option>
          </Select>
          <Input.Search 
            placeholder="Tìm kiếm..." 
            onSearch={(val) => handleFilterChange({ Keyword: val })}
            style={{ width: 250 }}
            allowClear
          />
        </Space>
      </div>

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
        bordered
      />

      {/* MODAL CREATE / UPDATE */}
      <Modal
        title={isEdit ? "Chỉnh sửa tài khoản" : "Tạo tài khoản mới"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={actionLoading} // MỚI: Đồng bộ nút tải với actionLoading
        width={600}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="name" label="Họ tên" rules={[{ required: true, message: 'Nhập họ tên' }]}>
                <Input placeholder="Nguyễn Văn A" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="phone" label="Số điện thoại">
                <Input placeholder="090..." />
              </Form.Item>
            </Col>
          </Row>

          {!isEdit && (
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
                  <Input placeholder="email@gmail.com" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="password" label="Mật khẩu" rules={[{ required: true }]}>
                  <Input.Password placeholder="******" />
                </Form.Item>
              </Col>
            </Row>
          )}

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="role" label="Vai trò" rules={[{ required: true }]}>
                <Select placeholder="Chọn vai trò">
                  <Option value="Customer">Khách hàng</Option>
                  <Option value="Staff">Nhân viên</Option>
                  <Option value="Admin">Quản trị viên</Option>
                </Select>
              </Form.Item>
            </Col>
            {!isEdit && (
              <Col span={12}>
                <Form.Item name="wardId" label="Mã vùng (WardId)">
                  <Input type="number" />
                </Form.Item>
              </Col>
            )}
          </Row>

          {isEdit && (
            <Form.Item name="avatar" label="Thay đổi ảnh đại diện">
              <Upload maxCount={1} beforeUpload={() => false} listType="picture">
                <Button icon={<UploadOutlined />}>Chọn file ảnh</Button>
              </Upload>
            </Form.Item>
          )}
        </Form>
      </Modal>

      {/* DRAWER CHI TIẾT */}
      <Drawer
        title="Thông tin chi tiết"
        width={450}
        onClose={() => setOpenDetail(false)}
        open={openDetail}
      >
        {detailLoading ? <p>Đang tải...</p> : (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="Avatar">
              <Avatar size={64} src={selectedUser?.avatarUrl} icon={<UserOutlined />} />
            </Descriptions.Item>
            <Descriptions.Item label="Họ tên">{selectedUser?.fullName}</Descriptions.Item>
            <Descriptions.Item label="Email">{selectedUser?.email}</Descriptions.Item>
            <Descriptions.Item label="SĐT">{selectedUser?.phone}</Descriptions.Item>
            <Descriptions.Item label="Vai trò">{selectedUser?.role}</Descriptions.Item>
            <Descriptions.Item label="Ngày tạo">
              {selectedUser?.createdAt && new Date(selectedUser.createdAt).toLocaleDateString('vi-VN')}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>
    </Card>
  );
};

export default UserManager;
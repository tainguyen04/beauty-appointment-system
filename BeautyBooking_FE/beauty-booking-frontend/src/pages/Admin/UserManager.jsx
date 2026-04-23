import React, { useEffect, useState, useCallback } from 'react';
import { 
  Table, Tag, Button, Space, Modal, message, Card, 
  Input, Typography, Drawer, Descriptions, Avatar, Select,
  Dropdown, Form, Row, Col, Upload, Switch
} from 'antd';
import { 
  UserOutlined, EyeOutlined, KeyOutlined, 
  MoreOutlined, PlusOutlined, EditOutlined, UploadOutlined,
  DeleteOutlined, UserSwitchOutlined 
} from '@ant-design/icons';
import { usePagination } from '../../hooks/usePagination';
import { useApiAction } from '../../hooks/useApiAction'; 
import { USER_ROLE, getRoleConfig } from '../../utils/apiHelper';
import userApi from '../../api/userApi';
import wardApi from '../../api/wardApi';

const { Title, Text } = Typography;
const { Option } = Select;

const UserManager = () => {
  // --- States ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);

  const [openDetail, setOpenDetail] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  const [wards, setWards] = useState([]);
  const [loadingWards, setLoadingWards] = useState(false);
  
  const [form] = Form.useForm();
  const [roleForm] = Form.useForm();

  // --- Custom Hooks ---
  const { data, loading, pagination, runFetch, handleTableChange, handleFilterChange } = usePagination(userApi.getAll);
  const { actionLoading, execute } = useApiAction(); 

  useEffect(() => {
  const fetchWards = async () => {
    setLoadingWards(true);
    try {
      const res = await wardApi.getAll(); // Điều chỉnh tên hàm nếu API của bạn khác (vd: getList)
      const data = res?.data || res || [];
      setWards(data);
    } catch (error) {
      console.error("Lỗi khi tải danh sách phường:", error);
    } finally {
      setLoadingWards(false);
    }
  };

  if (isModalOpen) {
    fetchWards();
  }
}, [isModalOpen]);

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
      address: record.address,
      wardId: record.wardId || null,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (values) => {
    let apiCall;
    let msg = "";

    if (isEdit) {
      const formData = new FormData();
      if (values.name) formData.append('Name', values.name);
      if (values.phone) formData.append('Phone', values.phone);
      if(values.wardId) formData.append('WardId', values.wardId);
      if(values.address) formData.append('Address', values.address);
      if (values.avatar?.fileList?.length > 0) {
        formData.append('AvatarUrl', values.avatar.fileList[0].originFileObj);
      }
      
      apiCall = () => userApi.update(selectedUser.id, formData);
      msg = "Cập nhật người dùng thành công!";
    } else {
      const createData = {
        fullName: values.name,
        email: values.email,
        password: values.password,
        role: values.role,
        phone: values.phone,
        address: values.address,
        wardId: values.wardId ? parseInt(values.wardId) : null
      };

      apiCall = () => userApi.create(createData);
      msg = "Tạo tài khoản mới thành công!";
    }

    const { success } = await execute(apiCall, msg);

    if (success) {
      setIsModalOpen(false);
      fetchData(); 
    }
  };

  // --- Handler cho Change Role ---
  const handleOpenChangeRole = (record) => {
    setSelectedUser(record);
    roleForm.setFieldsValue({ role: record.role });
    setIsRoleModalOpen(true);
  };

  // ĐÃ FIX: Logic gọi API vẫn giữ nguyên vì params map chuẩn với api ở file userApi.js
  const handleChangeRoleSubmit = async (values) => {
    const { success } = await execute(
      () => userApi.changeRole(selectedUser.id, values.role), 
      "Đổi vai trò thành công!"
    );

    if (success) {
      setIsRoleModalOpen(false);
      fetchData(); 
    }
  };

  // --- Handler cho Cập nhật trạng thái (Block/Unblock) ---
  const handleToggleStatus = async (userId, currentStatus) => {
    const newStatus = !currentStatus;
    const { success } = await execute(
      () => userApi.updateStatus(userId, newStatus),
      newStatus ? "Đã mở khóa tài khoản!" : "Đã khóa tài khoản!"
    );
    if (success) fetchData();
  };

  // --- Các hàm hỗ trợ khác (Detail) ---
  const showDetail = async (id) => {
    setDetailLoading(true);
    setOpenDetail(true);
    try {
      const res = await userApi.getById(id);
      setSelectedUser(res?.data || res);
    } catch (error) {
      console.log("Lỗi lấy chi tiết user:", error);
      message.error("Lỗi lấy chi tiết");
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
      ellipsis: true,
      width: 100,
      render: (text, record) => (
        <Space>
          <Avatar src={record.avatarUrl} icon={<UserOutlined />} />
          <Text strong>{text || 'N/A'}</Text>
        </Space>
      ),
    },
    { title: 'Tên đăng nhập', dataIndex: 'email' ,width: 100, ellipsis: true},
    { title: 'Số điện thoại', dataIndex: 'phone', width: 100, ellipsis: true},
    {title: 'Địa chỉ', dataIndex: 'address', width: 100, ellipsis: true},
    {
      title: 'Vai trò',
      dataIndex: 'role',
      render: (role) => {
        if (!role) return <Tag color="default">KHÔNG RÕ</Tag>;
        const config = getRoleConfig(role);
        return (
          <Tag color={config.color} style={{ fontWeight: '500' }}>
            {config.label?.toUpperCase()}
          </Tag>
        );
      }
    },
    {
    title: 'Khu vực (Phường/Xã)',
    dataIndex: 'wardName', // Trỏ thẳng vào wardName do backend trả về
    key: 'wardName',
    width: 200,
    ellipsis: true,
    render: (wardName) => {
        return wardName ? (
          <span style={{ fontWeight: 500 }}>{wardName}</span>
        ) : (
          <span style={{ color: '#999' }}>Chưa cập nhật</span>
        );
      }
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      width: 120,
      render: (isActive, record) => (
        <Space>
          <Switch 
            size="small" 
            checked={!!isActive} 
            onChange={() => handleToggleStatus(record.id, isActive)}
            loading={actionLoading}
          />
          <Tag color={isActive ? 'green' : 'red'}>{isActive ? 'Hoạt động' : 'Đã khóa'}</Tag>
        </Space>
      )
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
            key: 'changeRole', 
            label: 'Phân quyền', 
            icon: <UserSwitchOutlined />, 
            onClick: () => handleOpenChangeRole(record) 
          },
          { 
            key: 'reset', 
            label: 'Reset mật khẩu', 
            icon: <KeyOutlined />, 
            onClick: () => Modal.confirm({
                title: 'Reset mật khẩu?',
                content: 'Bạn có chắc chắn muốn đặt lại mật khẩu(123456) cho tài khoản này?',
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
            {USER_ROLE.map(role => (
              <Option key={role.value} value={role.value}>
                <Tag color={role.color}>{role.label}</Tag>
              </Option>
            ))} 
          </Select>
          <Input.Search 
            placeholder="Tìm kiếm theo tên..." 
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
        confirmLoading={actionLoading} 
        width={600}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          
          {/* DÒNG 1: DÙNG CHUNG CHO CẢ TẠO VÀ SỬA */}
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
            <Col span={24}>
              <Form.Item name="address" label="Địa chỉ cụ thể">
                <Input placeholder="Số nhà, tên đường..." />
              </Form.Item>
            </Col>
          </Row>

          {/* DÒNG 2: CHỈ HIỂN THỊ KHI TẠO MỚI */}
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

          {/* DÒNG 3: KẾT HỢP CÁC TRƯỜNG */}
          <Row gutter={16}>
            {/* Vai trò: Chỉ dùng khi tạo mới */}
            {!isEdit && (
              <Col span={12}>
                <Form.Item name="role" label="Vai trò" rules={[{ required: true }]}>
                  <Select placeholder="Chọn vai trò">
                    {USER_ROLE.map(role => (
                      <Select.Option key={role.value} value={role.value}>
                        <Tag color={role.color}>{role.label}</Tag>
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            )}

            {/* Khu vực (wardId): Dùng cho cả tạo mới và cập nhật */}
            <Col span={12}>
              <Form.Item name="wardId" label="Khu vực (Phường/Xã)">
                <Select
                  showSearch 
                  placeholder="Chọn khu vực"
                  loading={loadingWards}
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  options={wards.map(w => ({
                    value: w.wardId || w.id, 
                    label: w.fullName || w.name 
                  }))}
                />
              </Form.Item>
            </Col>

            {/* Avatar: Chỉ dùng khi Cập nhật (ghép chung vào dòng 3 cho đẹp layout) */}
            {isEdit && (
              <Col span={12}>
                <Form.Item name="avatar" label="Thay đổi ảnh đại diện">
                  <Upload maxCount={1} beforeUpload={() => false} listType="picture">
                    <Button icon={<UploadOutlined />}>Chọn file ảnh</Button>
                  </Upload>
                </Form.Item>
              </Col>
            )}
          </Row>

        </Form>
      </Modal>

      {/* MODAL PHÂN QUYỀN (CHANGE ROLE) */}
      <Modal
        title={`Phân quyền cho: ${selectedUser?.fullName}`}
        open={isRoleModalOpen}
        onCancel={() => setIsRoleModalOpen(false)}
        onOk={() => roleForm.submit()}
        confirmLoading={actionLoading}
        width={400}
        destroyOnClose
      >
        <Form form={roleForm} layout="vertical" onFinish={handleChangeRoleSubmit}>
          <Form.Item 
            name="role" 
            label="Chọn vai trò mới" 
            rules={[{ required: true, message: 'Vui lòng chọn vai trò!' }]}
          >
            <Select placeholder="Chọn vai trò">
              {USER_ROLE.map(role => (
                <Option key={role.value} value={role.value}>
                  <Tag color={role.color}>{role.label}</Tag>
                </Option>
              ))}
            </Select>
          </Form.Item>
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
            <Descriptions.Item label="Địa chỉ">
              {selectedUser?.address || 'Chưa cập nhật'}
            </Descriptions.Item>
            <Descriptions.Item label="Khu vực">
                {selectedUser?.wardName ? (
                  <Tag color="blue">{selectedUser.wardName}</Tag>
                ) : (
                  <Tag color="default">Chưa cập nhật</Tag>
                )}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag color={selectedUser?.isActive ? 'green' : 'red'}>
                {selectedUser?.isActive ? 'Đang hoạt động' : 'Đã khóa'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Vai trò">
              <Tag color={getRoleConfig(selectedUser?.role)?.color}>
                {getRoleConfig(selectedUser?.role)?.label}
              </Tag>
            </Descriptions.Item>
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
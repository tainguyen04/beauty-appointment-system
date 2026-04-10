import React, { useEffect, useState } from 'react';
import { 
  Table, Tag, Button, Space, Modal, message, Card, 
  Input, Typography, Drawer, Descriptions, Avatar, Select,
  Dropdown, Form
} from 'antd';
import { 
  StopOutlined, CheckCircleOutlined, DeleteOutlined, 
  UserOutlined, EyeOutlined, FilterOutlined, KeyOutlined, 
  MoreOutlined, UserSwitchOutlined 
} from '@ant-design/icons';
import { usePagination } from '../../hooks/usePagination';
import userApi from '../../api/userApi';

const { Title, Text } = Typography;
const { Option } = Select;

const UserManager = () => {
  const [openDetail, setOpenDetail] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // State cho đổi Role
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [roleForm] = Form.useForm();

  const { 
    data, loading, pagination, runFetch, handleTableChange, handleFilterChange 
  } = usePagination(userApi.getAll);

  useEffect(() => {
    runFetch();
  }, [runFetch]);

  const showDetail = async (id) => {
    setDetailLoading(true);
    setOpenDetail(true);
    try {
      const res = await userApi.getById(id);
      setSelectedUser(res);
    } catch (error) {
      message.error("Không thể lấy thông tin chi tiết!", error.message);
      setOpenDetail(false);
    } finally {
      setDetailLoading(false);
    }
  };

  // Xử lý Thay đổi Role
  const handleChangeRole = async (values) => {
    try {
      setSubmitLoading(true);
      // Gửi request body khớp với ChangeRoleRequest { userId, newRole }
      await userApi.changeRole(selectedUser.id, values.newRole);
      message.success(`Đã cập nhật vai trò cho ${selectedUser.fullName}`);
      setIsRoleModalOpen(false);
      runFetch();
    } catch (error) {
      message.error("Thay đổi vai trò thất bại!", error.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleToggleBlock = async (id, currentStatus) => {
    const isBlocking = currentStatus === true;
    Modal.confirm({
      title: isBlocking ? 'Xác nhận khóa tài khoản?' : 'Xác nhận mở khóa?',
      content: isBlocking ? 'Người dùng này sẽ không thể đăng nhập.' : 'Người dùng có thể tiếp tục sử dụng dịch vụ.',
      onOk: async () => {
        try {
          await userApi.blockUser(id);
          message.success(isBlocking ? "Đã khóa tài khoản!" : "Đã mở khóa thành công!");
          runFetch();
        } catch (error) {
          message.error("Thao tác thất bại!", error.message);
        }
      }
    });
  };

  const columns = [
    {
      title: 'Họ tên',
      dataIndex: 'fullName',
      key: 'fullName',
      render: (text, record) => (
        <Space>
          <Avatar src={record.avatarUrl} icon={<UserOutlined />} />
          <Text strong>{text || 'N/A'}</Text>
        </Space>
      ),
    },
    { title: 'Email', dataIndex: 'email'},
    {title: 'Số điện thoại', dataIndex: 'phone'},
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      render: (role) => {
        const roleKey = role ? String(role).toLowerCase() : '';
        const roleConfig = {
          'customer': { color: 'green', label: 'KHÁCH HÀNG' },
          'admin': { color: 'volcano', label: 'ADMIN' },
          'staff': { color: 'blue', label: 'NHÂN VIÊN' }
        };
        const config = roleConfig[roleKey] || { color: 'default', label: role || 'UNKNOWN' };
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActived',
      key: 'isActived',
      render: (isActived) => (
        <Tag color={isActived ? 'green' : 'red'}>
          {isActived ? 'Hoạt động' : 'Bị khóa'}
        </Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 80,
      align: 'center',
      render: (_, record) => {
        const items = [
          {
            key: 'detail',
            label: 'Xem chi tiết',
            icon: <EyeOutlined />,
            onClick: () => showDetail(record.id),
          },
          {
            key: 'change-role',
            label: 'Đổi vai trò',
            icon: <UserSwitchOutlined />,
            onClick: () => {
              setSelectedUser(record);
              roleForm.setFieldsValue({ newRole: record.role });
              setIsRoleModalOpen(true);
            }
          },
          {
            key: 'reset-pwd',
            label: 'Reset mật khẩu',
            icon: <KeyOutlined />,
            onClick: () => {
              Modal.confirm({
                title: 'Reset mật khẩu?',
                content: `Mật khẩu của ${record.fullName} sẽ về mặc định(123456).`,
                onOk: async () => {
                  try {
                    await userApi.resetPassword(record.id);
                    message.success("Đã reset mật khẩu thành công!");
                  } catch {
                    message.error("Không thể reset mật khẩu.");
                  }
                }
              });
            },
          },
          {
            key: 'toggle-block',
            label: record.isActived ? 'Khóa tài khoản' : 'Mở khóa',
            icon: record.isActived ? <StopOutlined /> : <CheckCircleOutlined />,
            danger: record.isActived,
            onClick: () => handleToggleBlock(record.id, record.isActived),
          },
          { type: 'divider' },
          {
            key: 'delete',
            label: 'Xóa tài khoản',
            icon: <DeleteOutlined />,
            danger: true,
            onClick: () => {
              Modal.confirm({
                title: 'Xác nhận xóa?',
                content: 'Hành động này không thể hoàn tác.',
                okType: 'danger',
                onOk: async () => {
                  await userApi.delete(record.id);
                  message.success("Đã xóa người dùng");
                  runFetch();
                }
              });
            },
          },
        ];

        return (
          <Dropdown menu={{ items }} trigger={['click']} placement="bottomRight">
            <Button type="text" icon={<MoreOutlined style={{ fontSize: '18px' }} />} />
          </Dropdown>
        );
      },
    },
  ];

  return (
    <Card bordered={false}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: '16px' }}>
        <Title level={3} style={{ margin: 0 }}>Quản lý tài khoản</Title>
        <Space size="middle">
          <Select
            placeholder="Lọc vai trò"
            style={{ width: 160 }}
            allowClear
            onChange={(val) => handleFilterChange({ Role: val })}
            suffixIcon={<FilterOutlined />}
          >
            <Option value={0}>Khách hàng</Option>
            <Option value={1}>Admin</Option>
            <Option value={2}>Nhân viên</Option>
          </Select>
          <Input.Search 
            placeholder="Tìm tên, email..." 
            onSearch={(value) => handleFilterChange({ Keyword: value })}
            style={{ width: 280 }}
            allowClear
          />
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={{ ...pagination, showSizeChanger: true }}
        onChange={handleTableChange}
        rowKey="id"
        bordered
      />

      {/* Modal Thay đổi Role */}
      <Modal
        title="Thay đổi vai trò người dùng"
        open={isRoleModalOpen}
        onOk={() => roleForm.submit()}
        onCancel={() => setIsRoleModalOpen(false)}
        confirmLoading={submitLoading}
        destroyOnClose
      >
        <div style={{ marginBottom: 16 }}>
            <Text>Người dùng: </Text>
            <Text strong>{selectedUser?.fullName}</Text>
        </div>
        <Form form={roleForm} layout="vertical" onFinish={handleChangeRole}>
          <Form.Item 
            name="newRole" 
            label="Chọn vai trò mới" 
            rules={[{ required: true, message: 'Vui lòng chọn vai trò!' }]}
          >
            <Select placeholder="Chọn vai trò">
              <Option value="Customer">Khách hàng (Customer)</Option>
              <Option value="Staff">Nhân viên (Staff)</Option>
              <Option value="Admin">Quản trị viên (Admin)</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Drawer chi tiết hồ sơ */}
      <Drawer
        title="Hồ sơ chi tiết"
        width={500}
        onClose={() => setOpenDetail(false)}
        open={openDetail}
      >
        {detailLoading ? <Text>Đang tải...</Text> : selectedUser && (
          <div style={{ paddingBottom: 20 }}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <Avatar size={80} src={selectedUser.avatarUrl} icon={<UserOutlined />} />
              <Title level={4} style={{ marginTop: 12 }}>{selectedUser.fullName}</Title>
              <Text type="secondary">{selectedUser.email}</Text>
            </div>
            <Descriptions column={1} bordered size="middle">
              <Descriptions.Item label="ID">{selectedUser.id}</Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">{selectedUser.phone || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Vai trò">
                <Tag color="blue">{selectedUser.role?.toUpperCase()}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={selectedUser.isActived ? 'green' : 'red'}>
                  {selectedUser.isActived ? 'Hoạt động' : 'Bị khóa'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tham gia">
                {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Drawer>
    </Card>
  );
};

export default UserManager;
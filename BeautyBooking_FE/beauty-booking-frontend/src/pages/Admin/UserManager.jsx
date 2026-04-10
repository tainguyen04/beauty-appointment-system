import React, { useEffect, useState } from 'react';
import { 
  Table, Tag, Button, Space, Modal, message, Card, 
  Input, Typography, Drawer, Descriptions, Avatar, Select,
  Dropdown, Menu
} from 'antd';
import { 
  StopOutlined, CheckCircleOutlined, DeleteOutlined, 
  UserOutlined, EyeOutlined, FilterOutlined 
} from '@ant-design/icons';
import { usePagination } from '../../hooks/usePagination';
import userApi from '../../api/userApi';

const { Title, Text } = Typography;
const { Option } = Select;

const UserManager = () => {
  // State quản lý chi tiết User
  const [openDetail, setOpenDetail] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  /**
   * Sử dụng userApi.getAll thay vì getByRole để có thể load toàn bộ
   * Hook này sẽ tự động đính kèm params (pageNumber, pageSize, keyword, role...)
   */
  const { 
    data, loading, pagination, runFetch, handleTableChange, handleFilterChange 
  } = usePagination(userApi.getAll);

  useEffect(() => {
    runFetch();
  }, [runFetch]);

  // Lấy chi tiết người dùng
  const showDetail = async (id) => {
    setDetailLoading(true);
    setOpenDetail(true);
    try {
      const res = await userApi.getById(id);
      setSelectedUser(res);
    } catch (error) {
      message.error("Không thể lấy thông tin chi tiết!",error);
      setOpenDetail(false);
    } finally {
      setDetailLoading(false);
    }
  };

  // Xử lý Khóa/Mở khóa dựa trên thuộc tính isActived
  const handleToggleBlock = async (id, currentStatus) => {
    const isBlocking = currentStatus === true; // Nếu đang active thì là hành động khóa
    Modal.confirm({
      title: isBlocking ? 'Xác nhận khóa tài khoản?' : 'Xác nhận mở khóa?',
      content: isBlocking 
        ? 'Người dùng này sẽ không thể đăng nhập vào hệ thống.' 
        : 'Người dùng sẽ có thể tiếp tục sử dụng dịch vụ.',
      okText: 'Xác nhận',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await userApi.blockUser(id);
          message.success(isBlocking ? "Đã khóa tài khoản!" : "Đã mở khóa thành công!");
          runFetch();
        } catch {
          message.error("Thao tác thất bại!");
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
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Số điện thoại', dataIndex: 'phone', key: 'phone' },
    {
        title: 'Vai trò',
        dataIndex: 'role',
        key: 'role',
        render: (role) => {
            // Chuyển về chữ thường để so sánh cho chính xác
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
      width: 120,
      align: 'center',
      render: (_, record) => {
        // Định nghĩa các mục trong menu
        const items = [
          {
            key: 'detail',
            label: 'Xem chi tiết',
            icon: <EyeOutlined />,
            onClick: () => showDetail(record),
          },
          {
            key: 'reset-pwd',
            label: 'Reset mật khẩu',
            icon: <KeyOutlined />,
            onClick: () => {
              Modal.confirm({
                title: 'Reset mật khẩu?',
                content: `Mật khẩu của ${record.fullName} sẽ được đưa về mặc định.`,
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
          {
            type: 'divider',
          },
          {
            key: 'delete',
            label: 'Xóa tài khoản',
            icon: <DeleteOutlined />,
            danger: true,
            onClick: () => {
              Modal.confirm({
                title: 'Xác nhận xóa vĩnh viễn?',
                content: 'Hành động này không thể hoàn tác.',
                okText: 'Xóa',
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
          {/* Bộ lọc Role */}
          <Select
            placeholder="Lọc vai trò"
            style={{ width: 140 }}
            allowClear
            onChange={(val) => handleFilterChange({ Role: val })}
            suffixIcon={<FilterOutlined />}
          >
            <Option value={0}>Khách hàng</Option>
            <Option value={1}>Admin</Option>
            <Option value={2}>Nhân viên</Option>
          </Select>

          {/* Tìm kiếm */}
          <Input.Search 
            placeholder="Tìm tên, email, sđt..." 
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
        pagination={pagination}
        onChange={handleTableChange}
        rowKey="id"
        bordered
      />

      {/* Drawer chi tiết hồ sơ */}
      <Drawer
        title="Hồ sơ chi tiết"
        width={450}
        onClose={() => setOpenDetail(false)}
        open={openDetail}
        destroyOnClose
      >
        {detailLoading ? (
           <Text>Đang tải dữ liệu...</Text>
        ) : selectedUser && (
          <div style={{ paddingBottom: 20 }}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <Avatar size={80} src={selectedUser.avatarUrl} icon={<UserOutlined />} />
              <Title level={4} style={{ marginTop: 12, marginBottom: 4 }}>{selectedUser.fullName}</Title>
              <Text type="secondary">{selectedUser.email}</Text>
            </div>

            <Descriptions column={1} bordered size="middle">
              <Descriptions.Item label="ID">{selectedUser.id}</Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">{selectedUser.phone || 'Chưa cập nhật'}</Descriptions.Item>
              <Descriptions.Item label="Địa chỉ">
                {selectedUser.ward ? `${selectedUser.ward.name}, ${selectedUser.ward.districtName}` : 'Chưa cập nhật'}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={selectedUser.isActived ? 'green' : 'red'}>
                  {selectedUser.isActived ? 'Hoạt động' : 'Đang bị khóa'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tham gia">
                {new Date(selectedUser.createdAt).toLocaleDateString('vi-VN')}
              </Descriptions.Item>
              <Descriptions.Item label="Staff Profile">
                {selectedUser.staffProfileId ? <Tag color="orange">Đã có hồ sơ Staff</Tag> : 'Không có'}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Drawer>
    </Card>
  );
};

export default UserManager;
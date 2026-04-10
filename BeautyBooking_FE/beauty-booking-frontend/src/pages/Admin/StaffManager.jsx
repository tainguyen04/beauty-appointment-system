import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Card, Input, Typography, Modal, Form, Select, message, Tooltip, Avatar, Upload, Dropdown } from 'antd';
import { 
  EditOutlined, 
  DeleteOutlined, 
  UserAddOutlined, 
  UploadOutlined, 
  MoreOutlined, 
  SettingOutlined,
  UserOutlined 
} from '@ant-design/icons';
import { usePagination } from '../../hooks/usePagination';
import staffApi from '../../api/staffApi';
import userApi from '../../api/userApi';
import serviceApi from '../../api/serviceApi'; // Đảm bảo bạn có api này để lấy list dịch vụ

const { Title, Text } = Typography;

const StaffManager = () => {
  // 1. Pagination Hook
  const { data, loading, pagination, runFetch, handleTableChange, handleFilterChange } = usePagination(staffApi.getAll);

  // 2. States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState(null);
  
  const [users, setUsers] = useState([]); // Danh sách user để nâng cấp
  const [allServices, setAllServices] = useState([]); // Danh sách dịch vụ để gán
  const [fileList, setFileList] = useState([]);
  const [submitLoading, setSubmitLoading] = useState(false);

  const [form] = Form.useForm();
  const [serviceForm] = Form.useForm();

  // 3. Effects
  useEffect(() => {
    runFetch();
    loadInitialData();
  }, [runFetch]);

  const loadInitialData = async () => {
    try {
      const [userRes, serviceRes] = await Promise.all([
        userApi.getAll({ pageSize: 100 }), // Lấy user để làm staff
        serviceApi.getAll({ pageSize: 100 }) // Lấy dịch vụ để gán
      ]);
      setUsers(userRes.items || []);
      setAllServices(serviceRes.items || []);
    } catch (error) {
      console.error("Lỗi load dữ liệu bổ trợ:", error);
    }
  };

  // 4. Handlers
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFileList([]);
    form.resetFields();
  };

  const handleFinish = async (values) => {
    try {
      setSubmitLoading(true);
      const formData = new FormData();
      
      // Map đúng tên thuộc tính Backend (PascalCase hoặc camelCase tùy BE)
      formData.append('Bio', values.bio || '');
      
      if (!editingId) {
        formData.append('UserId', values.userId);
      }
      // 3. ServiceIds (Dựa theo hàm Update C# của bạn có xử lý trường này)
      if (values.serviceIds && values.serviceIds.length > 0) {
        values.serviceIds.forEach(id => {
          formData.append('ServiceIds', id); // C# nhận List<int> từ Form qua việc append nhiều lần cùng 1 key
        });
      }

      if (fileList.length > 0 && fileList[0].originFileObj) {
        // 'AvatarUrl' phải khớp với IFormFile AvatarUrl trong C# DTO
        formData.append('AvatarUrl', fileList[0].originFileObj);
      }
      

      if (editingId) {
        await staffApi.update(editingId, formData);
        message.success("Cập nhật hồ sơ thành công!");
      } else {
        await staffApi.create(formData);
        message.success("Tạo hồ sơ nhân viên thành công!");
      }

      handleCloseModal();
      runFetch();
    } catch (error) {
      message.error(error.response?.data?.message || "Thao tác thất bại");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleAssignServices = async (values) => {
    try {
      setSubmitLoading(true);
      await staffApi.assignServices(selectedStaff.id, values); // values là { serviceIds: [...] }
      message.success("Gán dịch vụ thành công!");
      setIsServiceModalOpen(false);
      runFetch();
    } catch (error) {
      message.error("Không thể gán dịch vụ", error);
    } finally {
      setSubmitLoading(false);
    }
  };

  // 5. Columns Configuration
  const columns = [
    {
      title: 'Nhân viên',
      key: 'staffInfo',
      render: (_, record) => (
        <Space>
          <Avatar src={record.user?.avatarUrl || record.avatarUrl} icon={<UserOutlined />} />
          <div>
            <Text strong>{record.user?.fullName || 'N/A'}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: '12px' }}>{record.user?.email}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Tiểu sử',
      dataIndex: 'bio',
      ellipsis: true,
      render: (bio) => <Tooltip title={bio}>{bio || <Text type="secondary" italic>Trống</Text>}</Tooltip>,
    },
    {
      title: 'Thao tác',
      width: 80,
      render: (_, record) => {
        const items = [
          {
            key: 'edit',
            label: 'Chỉnh sửa hồ sơ',
            icon: <EditOutlined />,
            onClick: () => {
              setEditingId(record.id);
              form.setFieldsValue({
                userId: record.userId,
                bio: record.bio
              });
              if (record.user?.avatarUrl) {
                setFileList([{ uid: '-1', url: record.user.avatarUrl, name: 'avatar.png' }]);
              }
              setIsModalOpen(true);
            }
          },
          {
            key: 'assign',
            label: 'Gán dịch vụ',
            icon: <SettingOutlined />,
            onClick: () => {
              setSelectedStaff(record);
              serviceForm.setFieldsValue({
                serviceIds: record.services?.map(s => s.id) || []
              });
              setIsServiceModalOpen(true);
            }
          },
          {
            key: 'delete',
            label: 'Xóa hồ sơ (Hạ cấp)',
            icon: <DeleteOutlined />,
            danger: true,
            onClick: () => {
              Modal.confirm({
                title: 'Hạ cấp nhân viên?',
                content: 'Hồ sơ nhân viên sẽ bị xóa, người dùng này sẽ quay lại vai trò khách hàng.',
                onOk: async () => {
                  await staffApi.delete(record.id);
                  message.success("Đã xóa hồ sơ");
                  runFetch();
                }
              });
            }
          }
        ];

        return (
          <Dropdown menu={{ items }} trigger={['click']}>
            <Button type="text" icon={<MoreOutlined />} />
          </Dropdown>
        );
      },
    },
  ];

  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <Title level={3}>Quản Lý Nhân Viên</Title>
        <Space>
          <Input.Search 
            placeholder="Tìm tên nhân viên..." 
            onSearch={(v) => handleFilterChange({ Keyword: v })} 
            style={{ width: 250 }}
          />
          <Button type="primary" icon={<UserAddOutlined />} onClick={() => setIsModalOpen(true)}>
            Thêm Nhân Viên
          </Button>
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
      />

      {/* MODAL THÊM / SỬA HỒ SƠ */}
      <Modal
        title={editingId ? "Cập nhật hồ sơ nhân viên" : "Thiết lập nhân viên mới"}
        open={isModalOpen}
        onOk={() => form.submit()}
        onCancel={handleCloseModal}
        confirmLoading={submitLoading}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleFinish}>
          <Form.Item 
            name="userId" 
            label="Chọn tài khoản người dùng" 
            rules={[{ required: true, message: 'Vui lòng chọn người dùng!' }]}
          >
            <Select
              disabled={!!editingId}
              showSearch
              placeholder="Tìm theo tên hoặc email"
              optionFilterProp="label"
              options={users.map(u => ({
                value: u.id,
                label: `${u.fullName} (${u.email})`
              }))}
            />
          </Form.Item>

          <Form.Item name="bio" label="Tiểu sử / Giới thiệu kỹ năng">
            <Input.TextArea rows={4} placeholder="Nhập mô tả kỹ năng, kinh nghiệm..." />
          </Form.Item>

          <Form.Item label="Hình ảnh hồ sơ">
            <Upload
              listType="picture-card"
              fileList={fileList}
              maxCount={1}
              beforeUpload={() => false}
              onChange={({ fileList }) => setFileList(fileList)}
            >
              {fileList.length < 1 && (
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>Tải ảnh</div>
                </div>
              )}
            </Upload>
          </Form.Item>
        </Form>
      </Modal>

      {/* MODAL GÁN DỊCH VỤ */}
      <Modal
        title={`Gán dịch vụ: ${selectedStaff?.user?.fullName}`}
        open={isServiceModalOpen}
        onOk={() => serviceForm.submit()}
        onCancel={() => setIsServiceModalOpen(false)}
        confirmLoading={submitLoading}
        destroyOnClose
      >
        <Form form={serviceForm} layout="vertical" onFinish={handleAssignServices}>
          <Form.Item 
            name="serviceIds" 
            label="Dịch vụ nhân viên có thể thực hiện"
            rules={[{ required: true, message: 'Chọn ít nhất 1 dịch vụ' }]}
          >
            <Select
              mode="multiple"
              placeholder="Chọn dịch vụ"
              style={{ width: '100%' }}
              optionFilterProp="label"
              options={allServices.map(s => ({
                value: s.id,
                label: s.name
              }))}
            />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default StaffManager;
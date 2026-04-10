import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Card, Input, Typography, Modal, Form, Select, message, Tooltip } from 'antd';
import { EditOutlined, DeleteOutlined, UserAddOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { usePagination } from '../../hooks/usePagination';
import staffApi from '../../api/staffApi';
import userApi from '../../api/userApi'; // Cần để lấy danh sách User chọn làm Staff

const { Title, Text } = Typography;

const StaffManager = () => {
  const { data, loading, pagination, runFetch, handleTableChange, handleFilterChange } = usePagination(staffApi.getAll);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [users, setUsers] = useState([]); // Lưu danh sách user để chọn
  const [form] = Form.useForm();
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    runFetch();
    loadUsers(); // Load danh sách user để sẵn trong Select
  }, [runFetch]);

  const loadUsers = async () => {
    try {
      // Lấy những người đang là Role 'User' (Customer) để chuyển thành Staff
      const res = await userApi.getByRole('Customer');
      setUsers(res.items || []);
    } catch (error) {
      console.error("Lỗi load users:", error);
    }
  };

  const handleFinish = async (values) => {
    try {
      setSubmitLoading(true);
      // Backend xử lý: Tạo StaffProfile sẽ tự đổi Role cho UserId tương ứng
      await staffApi.create(values); 
      message.success("Đã nâng cấp User lên thành Nhân viên!");
      setIsModalOpen(false);
      form.resetFields();
      runFetch();
    } catch (error) {
      message.error("Lỗi khi tạo hồ sơ nhân viên!",error.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  const columns = [
    {
      title: 'Nhân viên',
      key: 'staffInfo',
      render: (_, record) => (
        <div>
          <Text strong>{record.user?.fullName || record.fullName}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: '12px' }}>{record.user?.email}</Text>
        </div>
      ),
    },
    {
      title: 'Tiểu sử (Bio)',
      dataIndex: 'bio',
      ellipsis: true,
      render: (bio) => (
        <Tooltip title={bio}>
          {bio || <Text type="secondary" italic>Chưa có thông tin</Text>}
        </Tooltip>
      ),
    },
    {
      title: 'Thao tác',
      width: 110,
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => {
            form.setFieldsValue(record);
            setIsModalOpen(true);
          }} />
          <Button icon={<DeleteOutlined />} danger onClick={() => {
             Modal.confirm({
                title: 'Hạ cấp nhân viên?',
                content: 'Xóa hồ sơ Staff sẽ đưa người dùng này quay lại làm User thường.',
                onOk: async () => {
                  await staffApi.delete(record.id);
                  runFetch();
                  message.success("Đã xóa hồ sơ staff");
                }
             })
          }} />
        </Space>
      ),
    },
  ];

  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <Title level={3}>Quản Lý Nhân Viên</Title>
        <Space>
          <Input.Search 
            placeholder="Tìm tên..." 
            onSearch={(v) => handleFilterChange({ Keyword: v })} 
            style={{ width: 200 }}
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
        pagination={pagination} 
        onChange={handleTableChange}
        rowKey="id"
      />

      <Modal
        title="Thiết lập hồ sơ nhân viên"
        open={isModalOpen}
        onOk={() => form.submit()}
        onCancel={() => setIsModalOpen(false)}
        confirmLoading={submitLoading}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleFinish}>
          <Form.Item 
            name="userId" 
            label="Chọn người dùng" 
            rules={[{ required: true, message: 'Vui lòng chọn một người dùng!' }]}
          >
            <Select
              showSearch
              placeholder="Tìm theo tên hoặc email"
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={users.map(u => ({
                value: u.id,
                label: `${u.fullName} (${u.email})`
              }))}
            />
          </Form.Item>

          <Form.Item name="bio" label="Tiểu sử / Giới thiệu kỹ năng">
            <Input.TextArea rows={4} placeholder="Ví dụ: Chuyên viên massage 5 năm kinh nghiệm, chứng chỉ spa quốc tế..." />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default StaffManager;
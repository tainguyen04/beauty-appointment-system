import React, { useState, useEffect, useCallback } from 'react';
import { 
  Table, Tag,Tooltip, Button, Space, Card, Input, Typography, Modal, 
  Form, Select, message, Avatar, Upload, Dropdown 
} from 'antd';
import { 
  EditOutlined, DeleteOutlined, UserAddOutlined, 
  UploadOutlined, MoreOutlined, SettingOutlined,
  UserOutlined 
} from '@ant-design/icons';
import { usePagination } from '../../hooks/usePagination';
import staffApi from '../../api/staffApi';
import userApi from '../../api/userApi';
import serviceApi from '../../api/serviceApi';

const { Title, Text } = Typography;

const StaffManager = () => {
  const { data, loading, pagination, runFetch, handleTableChange, handleFilterChange } = usePagination(staffApi.getAll);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState(null);
  
  const [customers, setCustomers] = useState([]); 
  const [allServices, setAllServices] = useState([]); 
  const [fileList, setFileList] = useState([]);
  const [submitLoading, setSubmitLoading] = useState(false);

  const [form] = Form.useForm();
  const [serviceForm] = Form.useForm();

  const loadInitialData = useCallback(async () => {
    try {
      const [userRes, serviceRes] = await Promise.all([
        userApi.getAll({ pageSize: 100, Role: 'Customer' }), 
        serviceApi.getAll({ pageSize: 100 })
      ]);
      setCustomers(userRes.items || []);
      setAllServices(serviceRes.items || []);
    } catch (error) {
      console.error("Lỗi load dữ liệu:", error);
    }
  }, []);

  useEffect(() => {
    runFetch();
    loadInitialData();
  }, [runFetch, loadInitialData]);

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
      formData.append('Bio', values.bio || '');
      if (!editingId) formData.append('UserId', values.userId);

      if (fileList.length > 0 && fileList[0].originFileObj) {
        formData.append('AvatarUrl', fileList[0].originFileObj);
      }

      if (editingId) {
        await staffApi.update(editingId, formData);
        message.success("Cập nhật thành công!");
      } else {
        await staffApi.create(formData);
        message.success("Thêm nhân viên thành công!");
        loadInitialData(); 
      }
      handleCloseModal();
      runFetch();
    } catch (error) {
      message.error("Thao tác thất bại", error);
    } finally {
      setSubmitLoading(false);
    }
  };

  const columns = [
    {
      title: 'Nhân viên',
      key: 'staffInfo',
      render: (_, record) => (
        <Space>
          <Avatar size="small" src={record.avatarUrl} icon={<UserOutlined />} />
          <Text strong>{record.fullName || 'N/A'}</Text>
        </Space>
      ),
    },
    {
      title: 'Tiểu sử',
      dataIndex: 'bio',
      ellipsis: true,
      render: (bio) => <Text type="secondary" style={{ fontSize: '13px' }}>{bio || '...'}</Text>,
    },
    {
      title: 'Dịch vụ',
      dataIndex: 'serviceNames',
      key: 'serviceNames',
      width: 200,
      render: (services = []) => (
        <Space wrap size={[0, 4]}>
          {services.slice(0, 2).map(name => (
            <Tag color="blue" key={name} style={{ margin: 0, fontSize: '11px' }}>
              <Text style={{ maxWidth: 80, fontSize: '11px' }} ellipsis={{ tooltip: name }}>
                {name}
              </Text>
            </Tag>
          ))}
          {services.length > 2 && (
            <Tooltip title={services.slice(2).join(", ")}>
              <Tag borderless style={{ background: '#f5f5f5', fontSize: '11px' }}>
                +{services.length - 2}
              </Tag>
            </Tooltip>
          )}
        </Space>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 60,
      align: 'center',
      render: (_, record) => {
        const items = [
          { 
            key: 'edit', 
            label: 'Sửa hồ sơ', 
            icon: <EditOutlined />, 
            onClick: () => {
              setEditingId(record.id);
              setSelectedStaff(record); // Lưu record để lấy thông tin hiển thị
              form.setFieldsValue({ 
                userId: record.userId, 
                bio: record.bio 
              });
              setIsModalOpen(true);
            }
          },
          { 
            key: 'assign', 
            label: 'Gán dịch vụ', 
            icon: <SettingOutlined />, 
            onClick: () => {
              setSelectedStaff(record);
              // Lấy serviceIds hiện tại của Staff từ dữ liệu record
              // Đảm bảo dữ liệu API của bạn trả về một mảng object dịch vụ trong record.services
              const currentServiceIds = record.services?.map(s => s.id) || [];
              serviceForm.setFieldsValue({ serviceIds: currentServiceIds });
              setIsServiceModalOpen(true);
            }
          },
          { type: 'divider' },
          { 
            key: 'delete', 
            label: 'Xóa nhân viên', 
            icon: <DeleteOutlined />, 
            danger: true, 
            onClick: () => {
              Modal.confirm({
                title: 'Xác nhận xóa?',
                content: `Bạn có chắc muốn xóa nhân viên ${record.fullName}?`,
                okType: 'danger',
                onOk: async () => {
                  await staffApi.delete(record.id);
                  message.success("Đã xóa nhân viên");
                  runFetch();
                  loadInitialData();
                }
              });
            }
          }
        ];
        return (
          <Dropdown menu={{ items }} trigger={['click']} placement="bottomRight">
            <Button type="text" size="small" icon={<MoreOutlined />} />
          </Dropdown>
        );
      },
    },
  ];

  return (
    <Card bordered={false}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, alignItems: 'center' }}>
        <Title level={4} style={{ margin: 0 }}>Quản lý nhân viên</Title>
        <Space>
          <Input.Search 
            placeholder="Tìm kiếm..." 
            onSearch={(v) => handleFilterChange({ Keyword: v })} 
            style={{ width: 200 }}
            allowClear
          />
          <Button type="primary" icon={<UserAddOutlined />} onClick={() => setIsModalOpen(true)}>
            Thêm mới
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
        size="middle"
      />

      <Modal
        title={editingId ? "Sửa nhân viên" : "Thêm nhân viên"}
        open={isModalOpen}
        onOk={() => form.submit()}
        onCancel={handleCloseModal}
        confirmLoading={submitLoading}
        width={500}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleFinish} style={{ marginTop: 10 }}>
          <Form.Item label="Tài khoản nhân viên" required>
            {editingId ? (
              // Khi sửa: Chỉ hiện Tên - Email dạng Text cho sạch
              <div style={{ padding: '8px 12px', background: '#f5f5f5', borderRadius: '4px', border: '1px solid #d9d9d9' }}>
                <Text strong>{selectedStaff?.fullName}</Text>
                {selectedStaff?.email && <Text type="secondary"> — {selectedStaff.email}</Text>}
              </div>
            ) : (
              // Khi thêm mới: Hiện Select chọn Customer (Tên - Email)
              <Form.Item name="userId" noStyle rules={[{ required: true, message: 'Vui lòng chọn tài khoản!' }]}>
                <Select
                  showSearch
                  placeholder="Chọn khách hàng (Tên - Email)"
                  optionFilterProp="label"
                  options={customers.map(u => ({ 
                    value: u.id, 
                    label: `${u.fullName} - ${u.email}` 
                  }))}
                />
              </Form.Item>
            )}
          </Form.Item>

          <Form.Item name="bio" label="Tiểu sử">
            <Input.TextArea rows={3} placeholder="Mô tả ngắn về kinh nghiệm..." />
          </Form.Item>

          <Form.Item label="Ảnh hồ sơ">
            <Upload
              listType="picture-card"
              fileList={fileList}
              maxCount={1}
              beforeUpload={() => false}
              onChange={({ fileList }) => setFileList(fileList)}
            >
              {fileList.length < 1 && <UploadOutlined />}
            </Upload>
          </Form.Item>
        </Form>
      </Modal>

      {/* MODAL GÁN DỊCH VỤ - NÂNG CẤP */}
      <Modal
        title={<span><SettingOutlined /> Cập nhật kỹ năng nhân viên</span>}
        open={isServiceModalOpen}
        onOk={() => serviceForm.submit()}
        onCancel={() => setIsServiceModalOpen(false)}
        confirmLoading={submitLoading}
        destroyOnClose
        width={500}
      >
        <div style={{ marginBottom: 20 }}>
          <Text type="secondary">Nhân viên: </Text>
          <Text strong>{selectedStaff?.fullName}</Text>
        </div>

        {/* Hiển thị danh sách đang làm để đối chiếu */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ marginBottom: 8 }}>
            <Text italic style={{ fontSize: '13px', color: '#8c8c8c' }}>Danh sách dịch vụ đang đảm nhận:</Text>
          </div>
          <div style={{ padding: '12px', background: '#fafafa', borderRadius: '8px', border: '1px dashed #d9d9d9' }}>
            {selectedStaff?.serviceNames?.length > 0 ? (
              <Space wrap>
                {selectedStaff.serviceNames.map(name => (
                  <Tag color="blue" key={name} style={{ borderRadius: '4px' }}>{name}</Tag>
                ))}
              </Space>
            ) : (
              <Text type="secondary" style={{ fontSize: '12px' }}>Chưa có dịch vụ nào</Text>
            )}
          </div>
        </div>

        <Form 
          form={serviceForm} 
          layout="vertical" 
          onFinish={(values) => {
            setSubmitLoading(true);
            staffApi.assignServices(selectedStaff.id, values.serviceIds)
              .then(() => { 
                message.success("Cập nhật dịch vụ thành công!"); 
                setIsServiceModalOpen(false); 
                runFetch(); 
              })
              .catch(() => message.error("Lỗi khi gán dịch vụ"))
              .finally(() => setSubmitLoading(false));
          }}
        >
          <Form.Item 
            name="serviceIds" 
            label={<Text strong>Thay đổi / Gán thêm dịch vụ</Text>}
            extra="Chọn hoặc bỏ chọn các dịch vụ từ danh sách tổng hợp bên dưới."
            rules={[{ required: true, message: 'Vui lòng chọn ít nhất 1 dịch vụ!' }]}
          >
            <Select 
              mode="multiple" 
              placeholder="Tìm và chọn dịch vụ mới..." 
              style={{ width: '100%' }}
              allowClear
              maxTagCount="responsive"
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={allServices.map(s => ({ value: Number(s.id), label: s.name }))} 
            />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default StaffManager;
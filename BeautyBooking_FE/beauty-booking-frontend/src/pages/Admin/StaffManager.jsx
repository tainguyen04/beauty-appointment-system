import React, { useState, useEffect, useCallback } from 'react';
import { 
  Table, Tag, Tooltip, Button, Space, Card, Input, Typography, Modal, 
  Form, Select, Avatar, Upload, Dropdown 
} from 'antd';
import { 
  EditOutlined, DeleteOutlined, UserAddOutlined, 
  UploadOutlined, MoreOutlined, SettingOutlined,
  UserOutlined 
} from '@ant-design/icons';
import { usePagination } from '../../hooks/usePagination';
import { useApiAction } from '../../hooks/useApiAction'; // MỚI: Import useApiAction
import staffApi from '../../api/staffApi';
import userApi from '../../api/userApi';
import serviceApi from '../../api/serviceApi';

const { Title, Text } = Typography;

const StaffManager = () => {
  // --- Custom Hooks ---
  const { data, loading, pagination, runFetch, handleTableChange, handleFilterChange } = usePagination(staffApi.getAll);
  const { actionLoading, execute } = useApiAction(); // MỚI: Khởi tạo hook

  // --- States ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState(null);
  
  const [customers, setCustomers] = useState([]); 
  const [allServices, setAllServices] = useState([]); 
  const [fileList, setFileList] = useState([]);
  
  // LƯU Ý: Đã xóa bỏ submitLoading thủ công

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
    const initData = async () => {
      await loadInitialData();
    }
    runFetch();
    initData();
  }, [runFetch, loadInitialData]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFileList([]);
    form.resetFields();
  };

  // MỚI: Cấu trúc lại bằng execute cho Thêm/Sửa nhân viên
  const handleFinish = async (values) => {
    const formData = new FormData();
    formData.append('Bio', values.bio || '');
    if (!editingId) formData.append('UserId', values.userId);

    if (fileList.length > 0 && fileList[0].originFileObj) {
      formData.append('AvatarUrl', fileList[0].originFileObj);
    }

    const apiCall = editingId 
      ? () => staffApi.update(editingId, formData)
      : () => staffApi.create(formData);
      
    const msg = editingId ? "Cập nhật thành công!" : "Thêm nhân viên thành công!";

    const { success } = await execute(apiCall, msg);

    if (success) {
      if (!editingId) loadInitialData(); 
      handleCloseModal();
      runFetch();
    }
  };
  const handleAssignServices = async (values) => {
    const { success } = await execute(
      // Chú ý: values.serviceIds là mảng [1, 2, 3] khớp với DTO Backend
      () => staffApi.assignServices(selectedStaff.id, values.serviceIds),
      "Cập nhật dịch vụ thành công!"
    );
    if (success) {
      setIsServiceModalOpen(false);
      runFetch();
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
      title: 'Dịch vụ đảm nhận',
      dataIndex: 'services', // ĐÃ ĐỔI: từ serviceNames sang services
      key: 'services',
      width: 250,
      render: (services) => {
        const serviceList = services || [];
        if (serviceList.length === 0) return <Text type="secondary" style={{ fontSize: '12px' }}>Chưa gán</Text>;
        return (
          <Space wrap size={[0, 4]}>
            {serviceList.slice(0, 2).map((srv, idx) => (
              <Tag color="blue" key={idx} style={{ margin: 0, fontSize: '11px' }}>
                <Text style={{ maxWidth: 100, fontSize: '11px', color: '#1677ff' }} ellipsis={{ tooltip: srv.name }}>
                  {srv.name} {/* Trỏ vào srv.name */}
                </Text>
              </Tag>
            ))}
            {serviceList.length > 2 && (
              <Tooltip title={serviceList.slice(2).map(s => s.name).join(", ")}>
                <Tag borderless style={{ background: '#f5f5f5', fontSize: '11px' }}>
                  +{serviceList.length - 2}
                </Tag>
              </Tooltip>
            )}
          </Space>
        );
      },
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
              setSelectedStaff(record);
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
              // ĐÃ ĐỔI: Trực tiếp lấy danh sách ID từ mảng object services trả về sẵn
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
            // MỚI: Bọc chức năng xóa bằng execute
            onClick: () => {
              Modal.confirm({
                title: 'Xác nhận xóa?',
                content: `Bạn có chắc muốn xóa nhân viên ${record.fullName}?`,
                okType: 'danger',
                onOk: async () => {
                  const { success } = await execute(() => staffApi.delete(record.id), "Đã xóa nhân viên!");
                  if (success) {
                    runFetch();
                    loadInitialData();
                  }
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

      {/* MODAL THÊM / SỬA NHÂN VIÊN */}
      <Modal
        title={editingId ? "Sửa nhân viên" : "Thêm nhân viên"}
        open={isModalOpen}
        onOk={() => form.submit()}
        onCancel={handleCloseModal}
        confirmLoading={actionLoading} // MỚI: Đồng bộ loading
        width={500}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleFinish} style={{ marginTop: 10 }}>
          <Form.Item label="Tài khoản nhân viên" required>
            {editingId ? (
              <div style={{ padding: '8px 12px', background: '#f5f5f5', borderRadius: '4px', border: '1px solid #d9d9d9' }}>
                <Text strong>{selectedStaff?.fullName}</Text>
                {selectedStaff?.email && <Text type="secondary"> — {selectedStaff.email}</Text>}
              </div>
            ) : (
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
        confirmLoading={actionLoading} // MỚI: Đồng bộ loading
        destroyOnClose
        width={500}
      >
        <div style={{ marginBottom: 20 }}>
          <Text type="secondary">Nhân viên: </Text>
          <Text strong>{selectedStaff?.fullName}</Text>
        </div>

        <div style={{ marginBottom: 20 }}>
          <div style={{ marginBottom: 8 }}>
            <Text italic style={{ fontSize: '13px', color: '#8c8c8c' }}>Danh sách dịch vụ đang đảm nhận:</Text>
          </div>
          <div style={{ padding: '12px', background: '#fafafa', borderRadius: '8px', border: '1px dashed #d9d9d9' }}>
            {selectedStaff?.services?.length > 0 ? (
              <Space wrap>
                {selectedStaff.services.map(srv => (
                  // ĐÃ ĐỔI: Dùng srv.id làm key và hiển thị srv.name
                  <Tag color="blue" key={srv.id} style={{ borderRadius: '4px' }}>{srv.name}</Tag>
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
          // MỚI: Xử lý submit gán dịch vụ bằng execute
          onFinish={handleAssignServices}
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
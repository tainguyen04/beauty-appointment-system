import { useState, useEffect } from 'react';
import { Table, Button, Space, Typography, Modal, Form, 
  Input, InputNumber, Card, Tag, Select, Upload , Switch} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined, UploadOutlined } from '@ant-design/icons';
import { usePagination } from '../../hooks/usePagination';
import { useApiAction } from '../../hooks/useApiAction'; // MỚI: Import useApiAction
import serviceApi from '../../api/serviceApi';
import categoryApi from '../../api/categoryApi';

const { Title, Text } = Typography;

const ServiceManager = () => {
  // --- Custom Hooks ---
  const { 
    data: services,
    loading, 
    pagination, 
    runFetch, 
    handleTableChange,
    handleFilterChange
  } = usePagination(serviceApi.getAll);
  
  const { actionLoading, execute } = useApiAction(); // MỚI: Khởi tạo hook quản lý action

  // --- States ---
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [form] = Form.useForm();
  
  // LƯU Ý: Đã xóa state actionLoading thủ công

  // 1. Load danh mục (Chỉ gọi 1 lần khi mount)
  const fetchCategories = async () => {
    try {
      const res = await categoryApi.getAll();
      const list = res?.items || (Array.isArray(res) ? res : []);
      setCategories(list);
    } catch (error) {
      console.error("Lỗi lấy danh mục:", error);
    }
  };

  useEffect(() => {
    const initData = async () => {
      await fetchCategories(); // Load danh mục
    }
    runFetch(); // Load dịch vụ
    initData();
  }, [runFetch]);

// 1. MỚI: Khi mở Modal để sửa, cần set lại giá trị cho form
  useEffect(() => {
  if (editingService && categories.length > 0) {
    form.setFieldsValue({
      name: editingService.name,
      price: editingService.price,
      duration: editingService.duration,
      categoryId: Number(editingService.categoryId), // 👈 FIX CHÍNH
      imageFile: editingService.imageUrl
        ? [{
            uid: '-1',
            name: 'current_image',
            status: 'done',
            url: editingService.imageUrl
          }]
        : []
    });
  }
}, [editingService, categories, form]);
  // 2. MỚI: Cấu trúc lại xử lý Thêm/Sửa bằng execute
  const handleFinish = async (values) => {
    const formData = new FormData();
    formData.append('Name', values.name);
    formData.append('Price', values.price);
    formData.append('Duration', values.duration);

    if (values.imageFile && values.imageFile[0]?.originFileObj) {
      formData.append('ImageUrl', values.imageFile[0].originFileObj);
    }

    const apiCall = editingService
      ? () => serviceApi.update(editingService.id, formData)
      : () => serviceApi.create(formData);
      
    const msg = editingService ? "Cập nhật dịch vụ thành công!" : "Thêm dịch vụ mới thành công!";

    // Thực thi API thông qua hook
    const { success } = await execute(apiCall, msg);

    if (success) {
      setIsModalOpen(false);
      // Gọi lại trang hiện tại sau khi thao tác xong
      runFetch(pagination.current, pagination.pageSize);
    }
  };
  // 3. MỚI: Cấu trúc lại xử lý Toggle Status bằng execute
  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = !currentStatus;
    const { success } = await execute(
      () => serviceApi.updateStatus(id, newStatus),
      newStatus ? "Đã mở khóa dịch vụ!" : "Đã khóa dịch vụ!"
    );
    if (success) runFetch(pagination.current, pagination.pageSize);
  };

  // 3. MỚI: Cấu trúc lại xử lý Xóa bằng execute
  const handleDelete = (id) => {
    Modal.confirm({
      title: 'Xóa dịch vụ này?',
      content: 'Hành động này không thể hoàn tác.',
      okText: 'Xóa',
      okType: 'danger',
      onOk: async () => {
        const { success } = await execute(() => serviceApi.delete(id), "Đã xóa dịch vụ thành công!");
        if (success) {
          runFetch(pagination.current, pagination.pageSize);
        }
      }
    });
  };

  const columns = [
    {
      title: 'Ảnh',
      dataIndex: 'imageUrl',
      width: 80,
      render: (url) => (
        <img 
          src={url || 'https://via.placeholder.com/50'} 
          alt="img" 
          style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 4 }} 
        />
      )
    },
    { title: 'Tên dịch vụ', dataIndex: 'name', key: 'name', render: (t) => <Text strong>{t}</Text> },
    { 
      title: 'Danh mục', 
      dataIndex: 'categoryName', 
      render: (name) => <Tag color="geekblue">{name || 'Chưa phân loại'}</Tag> 
    },
    { 
      title: 'Giá', 
      dataIndex: 'price',
      width: 120,
      render: (p) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Text type="danger">
            {p?.toLocaleString('vi-VN')}đ
          </Text>
        </div>
      ) 
    },
    { title: 'Thời lượng', dataIndex: 'duration', align: 'center', render: (d) => `${d} phút` },
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
      title: 'Hành động',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button 
            icon={<EditOutlined />} 
            onClick={() => {
              setEditingService(record);
              setIsModalOpen(true);
            }} 
          />
          <Button icon={<DeleteOutlined />} danger onClick={() => handleDelete(record.id)} />
        </Space>
      )
    }
  ];

  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <Title level={3} style={{ margin: 0 }}>Quản Lý Dịch Vụ Beauty</Title>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => runFetch(pagination.current, pagination.pageSize)}>Làm mới</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => {
            setEditingService(null);
            form.resetFields();
            setIsModalOpen(true);
          }}>
            Thêm mới
          </Button>
        </Space>
      </div>
      <Space wrap>
          {/* MỚI: Ô Lọc theo danh mục */}
          <Select
            allowClear
            placeholder="Lọc theo danh mục"
            style={{ width: 200 }}
            onChange={(value) => {
              // Khi clear thì value sẽ là undefined, lúc đó gửi categoryId: null để bỏ lọc
              handleFilterChange({ categoryId: value || null }); 
            }}
            options={categories.map(c => ({ value: c.id, label: c.name }))}
            showSearch
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
          />
            {/* MỚI: Ô Tìm kiếm theo tên */}
          <Input.Search
            placeholder="Tìm kiếm dịch vụ..."
            onSearch={(value) => handleFilterChange({ keyword: value })}
            allowClear
            enterButton
          />
        </Space>

      <Table 
        dataSource={services} 
        columns={columns} 
        rowKey="id"
        loading={loading}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          pageSizeOptions: ['5', '10', '20'],
        }}
        onChange={handleTableChange}
      />

      <Modal
        title={editingService ? "Chỉnh sửa dịch vụ" : "Tạo dịch vụ mới"}
        open={isModalOpen}
        onOk={() => form.submit()}
        onCancel={() => setIsModalOpen(false)}
        destroyOnClose
        confirmLoading={actionLoading} // MỚI: Đồng bộ với hook
      >
        <Form form={form} layout="vertical" onFinish={handleFinish}>
          <Form.Item 
            name="categoryId" 
            label="Danh mục dịch vụ" 
            rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
          >
            <Select placeholder="Chọn danh mục" disabled={!!editingService}>
              {categories.map(c => (
                <Select.Option key={c.id} value={c.id}>{c.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item 
            name="name" 
            label="Tên dịch vụ" 
            rules={[{ required: true, message: 'Vui lòng nhập tên dịch vụ' }]}
          >
            <Input />
          </Form.Item>
          
          <Space size="large" style={{ display: 'flex' }}>
            <Form.Item name="price" label="Giá (VNĐ)" rules={[{ required: true }]}>
                <InputNumber style={{ width: 220 }} min={0} formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
            </Form.Item>
            <Form.Item name="duration" label="Thời lượng (phút)" rules={[{ required: true }]}>
                <InputNumber style={{ width: 220 }} min={1} />
            </Form.Item>
          </Space>

          <Form.Item 
            name="imageFile" 
            label="Ảnh dịch vụ"
            valuePropName="fileList"
            getValueFromEvent={(e) => Array.isArray(e) ? e : e?.fileList}
          >
            <Upload beforeUpload={() => false} listType="picture" maxCount={1}>
              <Button icon={<UploadOutlined />}>Chọn file ảnh</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default ServiceManager;
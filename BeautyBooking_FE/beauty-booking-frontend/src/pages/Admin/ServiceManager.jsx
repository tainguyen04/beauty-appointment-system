import { useState, useEffect } from 'react';
import { Table, Button, Space, Typography, message, Modal, Form, Input, InputNumber, Card, Tag, Select, Upload } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined, UploadOutlined } from '@ant-design/icons';
import serviceApi from '../../api/serviceApi';
import categoryApi from '../../api/categoryApi';

const { Title, Text } = Typography;

const ServiceManager = () => {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [form] = Form.useForm();

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });

  // 1. Load dữ liệu (Services & Categories)
  const fetchCategories = async () => {
  try {
    const res = await categoryApi.getAll();
    // Bóc tách items nếu BE bọc lại, nếu không lấy trực tiếp res
    const data = res?.items || (Array.isArray(res) ? res : []);
    setCategories(data);
  } catch (error) {
    console.error("Lỗi lấy danh mục:", error);
  }
};
  const fetchServices = async (page = 1, pageSize = 10) => {
  setLoading(true);
  try {
    const res = await serviceApi.getAll({ page, pageSize });

    if (res && res.items) {
      setServices(res.items);
      setPagination({
        current: res.currentPage || page,   // Ưu tiên từ BE, không có thì dùng page hiện tại
        pageSize: res.pageSize || pageSize,
        total: res.totalCount || 0,         // Rất quan trọng để hiện số trang
      });
    } else {
      setServices(Array.isArray(res) ? res : []);
    }
  } catch (error) {
    message.error("Không thể tải danh sách dịch vụ", error.message);
    setServices([]);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchCategories(); // Gọi 1 lần
    fetchServices();   // Gọi lần đầu trang 1
  }, []);
  // Xử lý phân trang (nếu BE hỗ trợ)
  const handleTableChange = (newPagination) => {
    // newPagination chứa: current, pageSize
    fetchServices(newPagination.current, newPagination.pageSize);
  };

  // 2. Xử lý Thêm/Sửa
  const handleFinish = async (values) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('Name', values.name);
      formData.append('Price', values.price);
      formData.append('Duration', values.duration);
      formData.append('CategoryId', values.categoryId);

      if (values.imageFile && values.imageFile[0]?.originFileObj) {
        formData.append('ImageUrl', values.imageFile[0].originFileObj);
      }

      if (editingService) {
        await serviceApi.update(editingService.id, formData);
        message.success("Cập nhật dịch vụ thành công!");
      } else {
        await serviceApi.create(formData);
        message.success("Thêm dịch vụ mới thành công!");
      }
      setIsModalOpen(false);
      fetchServices(pagination.current, pagination.pageSize);
    } catch (err) {
      message.error("Thao tác thất bại, vui lòng kiểm tra lại!", err.message);
    } finally {
      setLoading(false);
    }
  };

  // 3. Xử lý Xóa
  const handleDelete = (id) => {
    Modal.confirm({
      title: 'Xóa dịch vụ này?',
      content: 'Hành động này không thể hoàn tác.',
      okText: 'Xóa',
      okType: 'danger',
      onOk: async () => {
        try {
          await serviceApi.delete(id);
          message.success("Đã xóa!");
          fetchServices(pagination.current, pagination.pageSize);
        } catch {
          message.error("Xóa không thành công!");
        }
      }
    });
  };
  

  const columns = [
    {
      title: 'Ảnh',
      dataIndex: 'imageUrl',
      width: 100,
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
      render: (p) => <Text type="danger">{p?.toLocaleString()}đ</Text> 
    },
    { title: 'Thời lượng', dataIndex: 'duration', render: (d) => `${d} phút` },
    {
      title: 'Hành động',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button 
            icon={<EditOutlined />} 
            onClick={() => {
              setEditingService(record);
              form.setFieldsValue({
                ...record,
                imageFile: record.imageUrl ? [{ url: record.imageUrl, name: 'current_image' }] : []
              });
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
          <Button icon={<ReloadOutlined />} onClick={() => fetchServices(pagination.current, pagination.pageSize)}>Làm mới</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => {
            setEditingService(null);
            form.resetFields();
            setIsModalOpen(true);
          }}>
            Thêm mới
          </Button>
        </Space>
      </div>

      <Table 
        dataSource={Array.isArray(services) ? services : []} 
        columns={columns} 
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
        }}
        onChange={handleTableChange}    // Bắt buộc có dòng này
        loading={loading}
        rowKey="id"
      />

      <Modal
        title={editingService ? "Chỉnh sửa dịch vụ" : "Tạo dịch vụ mới"}
        open={isModalOpen}
        onOk={() => form.submit()}
        onCancel={() => setIsModalOpen(false)}
        destroyOnClose
        confirmLoading={loading}
      >
        <Form form={form} layout="vertical" onFinish={handleFinish}>
          <Form.Item 
            name="categoryId" 
            label="Danh mục dịch vụ" 
            rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
          >
            <Select placeholder="Chọn danh mục">
              {(Array.isArray(categories) ? categories : []).map(c => (
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
                <InputNumber style={{ width: 215 }} min={0} formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
            </Form.Item>
            <Form.Item name="duration" label="Thời lượng (phút)" rules={[{ required: true }]}>
                <InputNumber style={{ width: 215 }} min={1} />
            </Form.Item>
          </Space>

          <Form.Item 
            name="imageFile" 
            label="Ảnh dịch vụ (Chọn file mới để thay đổi)"
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
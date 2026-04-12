import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Typography, Card, Input, Modal, Form } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import { usePagination } from '../../hooks/usePagination';
import { useApiAction } from '../../hooks/useApiAction'; // MỚI: Import useApiAction
import categoryApi from '../../api/categoryApi';

const { Title } = Typography;

const CategoryManager = () => {
  // 1. Phân trang & Tìm kiếm (Dùng lại Hook)
  const { 
    data, loading, pagination, runFetch, handleTableChange, handleFilterChange 
  } = usePagination(categoryApi.getAll);

  // MỚI: Khởi tạo hook quản lý action
  const { actionLoading, execute } = useApiAction(); 

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form] = Form.useForm();

  // LƯU Ý: Đã xóa state submitLoading thủ công

  useEffect(() => {
    runFetch();
  }, [runFetch]);

  // 2. MỚI: Xử lý Thêm/Sửa bằng execute
  const handleFinish = async (values) => {
    const apiCall = editingCategory
      ? () => categoryApi.update(editingCategory.id, values)
      : () => categoryApi.create(values);
      
    const msg = editingCategory ? "Cập nhật thành công!" : "Thêm mới thành công!";

    const { success } = await execute(apiCall, msg);

    if (success) {
      setIsModalOpen(false);
      form.resetFields();
      runFetch(pagination.current, pagination.pageSize);
    }
  };

  // 3. MỚI: Xử lý Xóa bằng execute
  const handleDelete = (id) => {
    Modal.confirm({
      title: 'Xác nhận xóa?',
      content: 'Bạn có chắc chắn muốn xóa danh mục này không?',
      okText: 'Xóa',
      okType: 'danger',
      onOk: async () => {
        const { success } = await execute(() => categoryApi.delete(id), "Đã xóa danh mục!");
        if (success) {
          runFetch(pagination.current, pagination.pageSize);
        }
      }
    });
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 80 },
    { title: 'Tên danh mục', dataIndex: 'name', render: (t) => <b>{t}</b> },
    {
      title: 'Thao tác',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button 
            icon={<EditOutlined />} 
            onClick={() => {
              setEditingCategory(record);
              form.setFieldsValue(record);
              setIsModalOpen(true);
            }} 
          />
          <Button icon={<DeleteOutlined />} danger onClick={() => handleDelete(record.id)} />
        </Space>
      ),
    },
  ];

  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <Title level={3} style={{ margin: 0 }}>Quản Lý Danh Mục</Title>
        <Space>
          <Input.Search 
            placeholder="Tìm danh mục..." 
            onSearch={(value) => handleFilterChange({ Keyword: value })} 
            allowClear 
            style={{ width: 250 }} 
          />
          <Button icon={<ReloadOutlined />} onClick={() => runFetch(pagination.current, pagination.pageSize)}>Làm mới</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => {
            setEditingCategory(null);
            form.resetFields();
            setIsModalOpen(true);
          }}>
            Thêm mới
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          pageSizeOptions: ['5', '10', '20'],
        }}
        onChange={handleTableChange}
      />

      {/* Modal Thêm/Sửa */}
      <Modal
        title={editingCategory ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
        open={isModalOpen}
        onOk={() => form.submit()}
        onCancel={() => setIsModalOpen(false)}
        confirmLoading={actionLoading} // MỚI: Đồng bộ với hook
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleFinish}>
          <Form.Item 
            name="name" 
            label="Tên danh mục" 
            rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}
          >
            <Input placeholder="Ví dụ: Chăm sóc da, Làm nail..." />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default CategoryManager;
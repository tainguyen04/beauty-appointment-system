import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Typography, Card, Input, Modal, Form, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import { usePagination } from '../../hooks/usePagination';
import categoryApi from '../../api/categoryApi';

const { Title } = Typography;

const CategoryManager = () => {
  // 1. Phân trang & Tìm kiếm (Dùng lại Hook)
  const { 
    data, loading, pagination, runFetch, handleTableChange, handleFilterChange 
  } = usePagination(categoryApi.getAll);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form] = Form.useForm();
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    runFetch();
  }, [runFetch]);

  // 2. Xử lý Thêm/Sửa
  const handleFinish = async (values) => {
    try {
      setSubmitLoading(true);
      if (editingCategory) {
        await categoryApi.update(editingCategory.id, values);
        message.success("Cập nhật thành công!");
      } else {
        await categoryApi.create(values);
        message.success("Thêm mới thành công!");
      }
      setIsModalOpen(false);
      form.resetFields();
      runFetch(pagination.current, pagination.pageSize);
    } catch (error) {
      message.error("Có lỗi xảy ra, vui lòng thử lại!", error.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  // 3. Xử lý Xóa
  const handleDelete = (id) => {
    Modal.confirm({
      title: 'Xác nhận xóa?',
      content: 'Bạn có chắc chắn muốn xóa danh mục này không?',
      okText: 'Xóa',
      okType: 'danger',
      onOk: async () => {
        try {
          await categoryApi.delete(id);
          message.success("Đã xóa danh mục!");
          runFetch(pagination.current, pagination.pageSize);
        } catch (error) {
          message.error("Không thể xóa vì danh mục đang chứa dịch vụ!", error.message);
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
        confirmLoading={submitLoading}
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
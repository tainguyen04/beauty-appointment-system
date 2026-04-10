import React, { useEffect } from 'react';
import { Table, Button, Space, Typography, Card, Input, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { usePagination } from '../../hooks/usePagination';
import categoryApi from '../../api/categoryApi';

const { Title } = Typography;

const CategoryManager = () => {
  // 1. Sử dụng lại Hook thần thánh
  const { 
    data, // Đổi tên data thành services để dùng cho Table
    loading, 
    runFetch, 
    handleTableChange,
    handleFilterChange
  } = usePagination(categoryApi.getAll);

  useEffect(() => {
    runFetch();
  }, [runFetch]);

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 80,
    },
    {
      title: 'Tên danh mục',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <b>{text}</b>,
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      ellipsis: true, // Tự động ẩn nếu quá dài
    },
    {
      title: 'Thao tác',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => console.log('Sửa', record)} />
          <Button icon={<DeleteOutlined />} danger onClick={() => console.log('Xóa', record.id)} />
        </Space>
      ),
    },
  ];

  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <Title level={3}>Danh Mục Dịch Vụ</Title>
        <Space>
          <Input.Search 
            placeholder="Tìm danh mục..." 
            onSearch={handleFilterChange} 
            allowClear 
            style={{ width: 250 }}
          />
          <Button type="primary" icon={<PlusOutlined />}>Thêm danh mục</Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={data}
        loading={loading}
        onChange={handleTableChange}
        rowKey="id"
      />
    </Card>
  );
};

export default CategoryManager;
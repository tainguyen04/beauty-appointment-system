import React, { useEffect, useState, useCallback } from 'react';
import {
  Table, Button, Space, Modal, Form, Input,
  Popconfirm, Card, Switch, Row, Col, Empty
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined,
  CustomerServiceOutlined, FileTextOutlined, LinkOutlined
} from '@ant-design/icons';

import helpdeskContentApi from '../../api/helpdeskContentApi';
import helpdeskCatalogApi from '../../api/helpdeskCatalogApi';
import { useApiAction } from '../../hooks/useApiAction';

const HelpdeskCatalogManager = () => {
  const { actionLoading, execute } = useApiAction();

  // ================= STATES =================
  const [catalogs, setCatalogs] = useState([]);
  const [contents, setContents] = useState([]);
  const [selectedCatalog, setSelectedCatalog] = useState(null);

  const [isCatalogModalOpen, setIsCatalogModalOpen] = useState(false);
  const [isContentModalOpen, setIsContentModalOpen] = useState(false);

  const [editingCatalog, setEditingCatalog] = useState(null);
  const [editingContent, setEditingContent] = useState(null);

  const [catalogForm] = Form.useForm();
  const [contentForm] = Form.useForm();

  // ================= FETCH =================
  const fetchCatalogs = useCallback(async () => {
    const res = await execute(() => helpdeskCatalogApi.getAll());
    if (res.success) setCatalogs(res.data || []);
  }, [execute]);

  const fetchContentsByCatalog = useCallback(async (catalogId) => {
    const res = await execute(() => helpdeskCatalogApi.getById(catalogId));
    if (res.success) setContents(res.data?.contents || []);
  }, [execute]);

  useEffect(() => {
    const initData = async () => {
        await fetchCatalogs();
    };
    initData();
  }, [fetchCatalogs]);

  // ================= CATALOG =================
  const handleSaveCatalog = async (values) => {
    const apiCall = editingCatalog
      ? () => helpdeskCatalogApi.update(editingCatalog.catalogId, values)
      : () => helpdeskCatalogApi.create(values);

    const res = await execute(apiCall, "Lưu Catalog thành công!");

    if (res.success) {
      setIsCatalogModalOpen(false);
      setEditingCatalog(null);
      catalogForm.resetFields();
      fetchCatalogs();
    }
  };

  const handleDeleteCatalog = async (id) => {
    const res = await execute(() => helpdeskCatalogApi.delete(id), "Đã xóa catalog");
    if (res.success) fetchCatalogs();
  };

  const toggleCatalogStatus = async (record) => {
    const res = await execute(
      () => helpdeskCatalogApi.updateStatus(record.catalogId, !record.isActived),
      "Cập nhật trạng thái"
    );
    if (res.success) fetchCatalogs();
  };

  // ================= CONTENT =================
  const handleSaveContent = async (values) => {
    const apiCall = editingContent
      ? () => helpdeskContentApi.update(editingContent.contentId, values)
      : () => helpdeskContentApi.create(selectedCatalog.catalogId, values);

    const res = await execute(apiCall, "Lưu nội dung thành công!");

    if (res.success) {
      setIsContentModalOpen(false);
      setEditingContent(null);
      contentForm.resetFields();
      fetchContentsByCatalog(selectedCatalog.catalogId);
    }
  };

  const handleDeleteContent = async (id) => {
    const res = await execute(() => helpdeskContentApi.delete(id), "Đã xóa nội dung");
    if (res.success) fetchContentsByCatalog(selectedCatalog.catalogId);
  };

  // ================= COLUMNS =================
  const catalogColumns = [
    {
      title: 'Tên danh mục',
      dataIndex: 'nameVn',
      render: (text, record) => (
        <div
          onClick={() => {
            setSelectedCatalog(record);
            fetchContentsByCatalog(record.catalogId);
          }}
          style={{
            cursor: 'pointer',
            color: selectedCatalog?.catalogId === record.catalogId ? '#1890ff' : undefined,
            fontWeight: selectedCatalog?.catalogId === record.catalogId ? 'bold' : undefined
          }}
        >
          {text}
        </div>
      )
    },
    {
      title: 'Status',
      dataIndex: 'isActived',
      width: 90,
      render: (val, record) => (
        <Switch
          checked={val}
          onChange={() => toggleCatalogStatus(record)}
        />
      )
    },
    {
    title: 'Thao tác',
    width: 140,
    render: (_, record) => (
        <Space>
            <Button
                icon={<EditOutlined />}
                onClick={() => {
                setEditingCatalog(record);
                catalogForm.setFieldsValue(record);
                setIsCatalogModalOpen(true);
                }}
            />

            <Popconfirm
                title="Xóa catalog này?"
                okText="Xóa"
                cancelText="Hủy"
                onConfirm={() => handleDeleteCatalog(record.catalogId)}
            >
                <Button danger icon={<DeleteOutlined />} />
            </Popconfirm>
        </Space>
        )
    }
  ];

  const contentColumns = [
    {
      title: 'Nội dung',
      dataIndex: 'contentDetail'
    },
    {
      title: 'Thao tác',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              setEditingContent(record);
              contentForm.setFieldsValue(record);
              setIsContentModalOpen(true);
            }}
          />
          <Popconfirm
            title="Xóa nội dung?"
            onConfirm={() => handleDeleteContent(record.contentId)}
          >
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  // ================= UI =================
  return (
    <div style={{ padding: 16 }}>
      <Row gutter={16}>
        {/* CATALOG */}
        <Col span={8}>
          <Card
            title={<span><CustomerServiceOutlined /> Catalog</span>}
            extra={
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setEditingCatalog(null);
                  catalogForm.resetFields();
                  setIsCatalogModalOpen(true);
                }}
              />
            }
          >
            <Table
              dataSource={catalogs}
              columns={catalogColumns}
              rowKey="catalogId"
              pagination={false}
              loading={actionLoading}
            />
          </Card>
        </Col>

        {/* CONTENT */}
        <Col span={16}>
          <Card
            title={<span><FileTextOutlined /> Nội dung</span>}
            extra={
              <Button
                type="primary"
                disabled={!selectedCatalog}
                icon={<PlusOutlined />}
                onClick={() => {
                  setEditingContent(null);
                  contentForm.resetFields();
                  setIsContentModalOpen(true);
                }}
              >
                Thêm nội dung
              </Button>
            }
          >
            {selectedCatalog ? (
              <Table
                dataSource={contents}
                columns={contentColumns}
                rowKey="contentId"
                loading={actionLoading}
              />
            ) : (
              <Empty description="Chọn Catalog để xem nội dung" />
            )}
          </Card>
        </Col>
      </Row>

      {/* ================= MODAL CATALOG ================= */}
      <Modal
        title={editingCatalog ? "Sửa Catalog" : "Thêm Catalog"}
        open={isCatalogModalOpen}
        onOk={() => catalogForm.submit()}
        onCancel={() => setIsCatalogModalOpen(false)}
        destroyOnClose
      >
        <Form form={catalogForm} layout="vertical" onFinish={handleSaveCatalog}>
          <Form.Item name="keyCatalog" label="Key" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item name="nameVn" label="Tên VN" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item name="url" label="URL">
            <Input prefix={<LinkOutlined />} />
          </Form.Item>

          <Form.Item name="isActived" valuePropName="checked" initialValue={true}>
            <Switch />
          </Form.Item>
        </Form>
      </Modal>

      {/* ================= MODAL CONTENT ================= */}
      <Modal
        title={editingContent ? "Sửa nội dung" : "Thêm nội dung"}
        open={isContentModalOpen}
        onOk={() => contentForm.submit()}
        onCancel={() => setIsContentModalOpen(false)}
        destroyOnClose
      >
        <Form form={contentForm} layout="vertical" onFinish={handleSaveContent}>
          <Form.Item
            name="contentDetail"
            label="Nội dung"
            rules={[{ required: true }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default HelpdeskCatalogManager;
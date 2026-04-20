import React, { useEffect, useState, useCallback } from 'react';
import {
  Table, Button, Space, Modal, Form, Input,
  Popconfirm, Card, Switch, Row, Col, Empty, Divider, Typography
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined,
  CustomerServiceOutlined, FileTextOutlined, LinkOutlined
} from '@ant-design/icons';

import helpdeskContentApi from '../../api/helpdeskContentApi';
import helpdeskCatalogApi from '../../api/helpdeskCatalogApi';
import { useApiAction } from '../../hooks/useApiAction';
import TiptapEditor from '../../components/TiptapEditor';

const { Text } = Typography;

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
    const res = await execute(
      () => helpdeskCatalogApi.getAll(),
      null,
      "Lỗi tải danh mục"
    );
    if (res.success) setCatalogs(res.data || []);
  }, [execute]);

  const fetchContentsByCatalog = useCallback(async (catalogId) => {
    const res = await execute(
      () => helpdeskCatalogApi.getById(catalogId),
      null,
      "Lỗi tải nội dung chi tiết"
    );
    if (res.success && res.data) {
      setContents(res.data.contents || []);
      // Cập nhật lại selectedCatalog để đồng bộ dữ liệu mới nhất từ server
      setSelectedCatalog(res.data);
    }
  }, [execute]);

  useEffect(() => {
    fetchCatalogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ================= HANDLERS CATALOG =================
  const handleSaveCatalog = async (values) => {
    const payload = {
      ...values,
      // Lọc bỏ các dòng nội dung rỗng hoặc chỉ có thẻ <p></p>
      contents: values.contents?.filter(c => c && c !== "<p></p>") || []
    };

    const apiCall = editingCatalog
      ? () => helpdeskCatalogApi.update(editingCatalog.catalogId, payload)
      : () => helpdeskCatalogApi.create(payload);

    const res = await execute(apiCall, "Lưu Catalog thành công!");

    if (res.success) {
      setIsCatalogModalOpen(false);
      await fetchCatalogs(); // Đợi load xong mới tiếp tục
    }
  };

  const handleDeleteCatalog = async (id) => {
    const res = await execute(() => helpdeskCatalogApi.delete(id), "Đã xóa danh mục");
    if (res.success) {
      if (selectedCatalog?.catalogId === id) {
        setSelectedCatalog(null);
        setContents([]);
      }
      await fetchCatalogs();
    }
  };

  const toggleCatalogStatus = async (record) => {
    const res = await execute(
      () => helpdeskCatalogApi.updateStatus(record.catalogId, !record.isActived),
      "Cập nhật trạng thái thành công"
    );
    if (res.success) await fetchCatalogs();
  };

  // ================= HANDLERS CONTENT =================
  const handleSaveContent = async (values) => {
    if (!selectedCatalog) return;

    const apiCall = editingContent
      ? () => helpdeskContentApi.update(editingContent.contentId, values)
      : () => helpdeskContentApi.create(selectedCatalog.catalogId, values);

    const res = await execute(apiCall, "Lưu nội dung thành công!");

    if (res.success) {
      setIsContentModalOpen(false);
      setEditingContent(null);
      contentForm.resetFields();
      
      // Load lại cả 2 để đảm bảo tính nhất quán dữ liệu giữa bảng trái và bảng phải
      await fetchContentsByCatalog(selectedCatalog.catalogId);
      await fetchCatalogs();
    }
  };

  const handleDeleteContent = async (id) => {
    const res = await execute(() => helpdeskContentApi.delete(id), "Đã xóa nội dung");
    if (res.success) {
      await fetchContentsByCatalog(selectedCatalog.catalogId);
      await fetchCatalogs();
    }
  };

  // ================= COLUMNS =================
  const catalogColumns = [
    {
      title: 'Tên danh mục',
      dataIndex: 'nameVn',
      render: (text, record) => (
        <Space>
        <div
          onClick={() => fetchContentsByCatalog(record.catalogId)}
          style={{
            cursor: 'pointer',
            padding: '4px 0',
            color: selectedCatalog?.catalogId === record.catalogId ? '#1890ff' : 'inherit',
            fontWeight: selectedCatalog?.catalogId === record.catalogId ? '600' : 'normal'
          }}
        >
          {text}
          
        </div>
        {/* Nếu có URL thì hiện icon link, bấm vào mở tab mới */}
        {record.url && (
          <a href={record.url} target="_blank" rel="noopener noreferrer">
            <LinkOutlined style={{ color: '#52c41a' }} />
          </a>
        )}
        </Space>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActived',
      width: 90,
      align: 'center',
      render: (val, record) => (
        <Switch size="small" checked={val} onChange={() => toggleCatalogStatus(record)} />
      )
    },
    {
      title: 'Thao tác',
      width: 100,
      align: 'right',
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            type="text"
            icon={<EditOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              setEditingCatalog(record);
              const mapData = {
                ...record,
                contents: record.contents?.map(c => c.contentDetail) || [""]
              };
              catalogForm.setFieldsValue(mapData);
              setIsCatalogModalOpen(true);
            }}
          />
          <Popconfirm title="Xóa danh mục này?" onConfirm={() => handleDeleteCatalog(record.catalogId)}>
            <Button size="small" type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  const contentColumns = [
    { 
      title: 'Nội dung chi tiết', 
      dataIndex: 'contentDetail', 
      key: 'contentDetail',
      render: (text) => <Text style={{ whiteSpace: 'pre-wrap' }}>{text}</Text>
    },
    {
      title: 'Thao tác',
      width: 100,
      align: 'right',
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            type="text"
            icon={<EditOutlined />}
            onClick={() => {
              setEditingContent(record);
              contentForm.setFieldsValue(record);
              setIsContentModalOpen(true);
            }}
          />
          <Popconfirm title="Xóa dòng này?" onConfirm={() => handleDeleteContent(record.contentId)}>
            <Button size="small" type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: 20 }}>
      <Row gutter={24}>
        {/* CATALOG PANEL */}
        <Col span={9}>
          <Card
            title={<span><CustomerServiceOutlined /> Danh mục trợ giúp</span>}
            extra={
              <Button
                type="primary"
                size="small"
                icon={<PlusOutlined />}
                onClick={() => {
                  setEditingCatalog(null);
                  catalogForm.resetFields();
                  catalogForm.setFieldsValue({ contents: [""] });
                  setIsCatalogModalOpen(true);
                }}
              >
                Thêm mới
              </Button>
            }
          >
            <Table
              dataSource={catalogs}
              columns={catalogColumns}
              rowKey="catalogId"
              pagination={{ pageSize: 8 }}
              loading={actionLoading}
              size="middle"
            />
          </Card>
        </Col>

        {/* CONTENT PANEL */}
        <Col span={15}>
          <Card
            title={<span><FileTextOutlined /> Chi tiết: {selectedCatalog?.nameVn || '...'}</span>}
            extra={
              <Space>
                {/* Nút mở link URL của Catalog */}
                {selectedCatalog?.url && (
                  <Button 
                    type="default" 
                    icon={<LinkOutlined />} 
                    onClick={() => window.open(selectedCatalog.url, '_blank')}
                  >
                    Mở link tài liệu
                  </Button>
                )}
              <Button
                type="primary"
                size="small"
                disabled={!selectedCatalog}
                icon={<PlusOutlined />}
                onClick={() => {
                  setEditingContent(null);
                  contentForm.resetFields();
                  setIsContentModalOpen(true);
                }}
              >
                Thêm dòng nội dung
              </Button>
              </Space>
            }
          >
            {/* Nếu Catalog có URL, hiện một Alert nhỏ nhắc nhở */}
            {selectedCatalog?.url && (
              <div style={{ marginBottom: 16, padding: '8px 12px', background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 4 }}>
                <Text type="success">
                  <LinkOutlined /> Danh mục này có liên kết bên ngoài: 
                  <a href={selectedCatalog.url} target="_blank" rel="noreferrer" style={{ marginLeft: 8 }}>
                    {selectedCatalog.url}
                  </a>
                </Text>
              </div>
            )}
            {selectedCatalog ? (
              <Table
                dataSource={contents}
                columns={contentColumns}
                rowKey="contentId"
                loading={actionLoading}
                pagination={{ pageSize: 10 }}
              />
            ) : (
              <Empty description="Vui lòng chọn một danh mục bên trái" style={{ margin: '40px 0' }} />
            )}
          </Card>
        </Col>
      </Row>

      
      {/* MODAL CATALOG - Thêm Tiptap vào Form.List */}
      <Modal
        title={editingCatalog ? "Cập nhật Catalog" : "Tạo Catalog mới"}
        open={isCatalogModalOpen}
        onOk={() => catalogForm.submit()}
        onCancel={() => setIsCatalogModalOpen(false)}
        confirmLoading={actionLoading}
        width={800} // Tăng width vì Editor cần không gian
        destroyOnClose
      >
        <Form form={catalogForm} layout="vertical" onFinish={handleSaveCatalog}>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="keyCatalog" label="Mã (Key)"><Input disabled={!!editingCatalog} /></Form.Item></Col>
            <Col span={12}><Form.Item name="isActived" label="Kích hoạt" valuePropName="checked"><Switch /></Form.Item></Col>
          </Row>
          <Form.Item name="nameVn" label="Tên hiển thị" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item 
            name="url" 
            label="Đường dẫn liên kết (URL)"
            extra="Nếu dán link hướng dẫn đặt lịch vào đây, hệ thống sẽ ưu tiên dẫn khách đến link này."
            rules={[{ pattern: /^(\/|http:\/\/|https:\/\/).*/, message: 'Vui lòng nhập đúng định dạng link (http://...)' }]}
          >
            <Input prefix={<LinkOutlined />} placeholder="Ví dụ: https://youtube.com/watch?v=..." />
          </Form.Item>
          <Divider orientation="left">Nội dung khởi tạo</Divider>
          <Form.List name="contents">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }, index) => (
                  <Card key={key} size="small" style={{ marginBottom: 12 }} 
                    title={`Đoạn nội dung ${index + 1}`}
                    extra={fields.length > 1 && <DeleteOutlined onClick={() => remove(name)} style={{ color: 'red' }} />}
                  >
                    <Form.Item
                      {...restField}
                      name={name}
                      rules={[{ required: true, message: 'Nhập nội dung' }]}
                    >
                      {/* THAY THẾ INPUT BẰNG TIPTAP */}
                      <TiptapEditor />
                    </Form.Item>
                  </Card>
                ))}
                <Button type="dashed" onClick={() => add("<p></p>")} block icon={<PlusOutlined />}>Thêm đoạn mới</Button>
              </>
            )}
          </Form.List>
        </Form>
      </Modal>

      {/* MODAL CONTENT LẺ - Thêm Tiptap vào Editor đơn */}
      <Modal
        title={editingContent ? "Sửa nội dung" : "Thêm nội dung chi tiết"}
        open={isContentModalOpen}
        onOk={() => contentForm.submit()}
        onCancel={() => setIsContentModalOpen(false)}
        confirmLoading={actionLoading}
        width={800}
        destroyOnClose
      >
        <Form form={contentForm} layout="vertical" onFinish={handleSaveContent}>
          <Form.Item name="contentDetail" label="Nội dung chi tiết" rules={[{ required: true }]}>
             {/* THAY THẾ TEXTAREA BẰNG TIPTAP */}
            <TiptapEditor />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default HelpdeskCatalogManager;
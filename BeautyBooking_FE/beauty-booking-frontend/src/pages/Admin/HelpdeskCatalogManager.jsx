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
      // Đảm bảo lọc kỹ mảng contents để không gửi chuỗi rỗng lên API
      contents: values.contents?.filter(c => typeof c === 'string' && c.trim() !== "") || []
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
            }
          >
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

      {/* MODAL CATALOG */}
      <Modal
        title={editingCatalog ? "Cập nhật Danh mục" : "Tạo Danh mục mới"}
        open={isCatalogModalOpen}
        onOk={() => catalogForm.submit()}
        onCancel={() => setIsCatalogModalOpen(false)}
        confirmLoading={actionLoading}
        width={650}
        destroyOnClose
      >
        <Form form={catalogForm} layout="vertical" onFinish={handleSaveCatalog}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="keyCatalog" label="Mã (Key)" rules={[{ required: true, message: 'Không bỏ trống' }]}>
                <Input placeholder="VD: HELP_BOOKING" disabled={!!editingCatalog} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="isActived" label="Kích hoạt" valuePropName="checked" initialValue={true}>
                <Switch />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="nameVn" label="Tên hiển thị" rules={[{ required: true, message: 'Không bỏ trống' }]}>
            <Input placeholder="Nhập tên tiếng Việt" />
          </Form.Item>

          <Form.Item name="url" label="Đường dẫn liên kết (URL)">
            <Input prefix={<LinkOutlined />} placeholder="https://docs.spa.vn/..." />
          </Form.Item>

          <Divider orientation="left">Nội dung khởi tạo</Divider>
          
          <Form.List name="contents">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }, index) => (
                  <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                    <Form.Item
                      {...restField}
                      name={name}
                      rules={[{ required: true, message: 'Nhập nội dung' }]}
                      style={{ width: 540 }}
                    >
                      <Input placeholder={`Dòng nội dung ${index + 1}`} />
                    </Form.Item>
                    {fields.length > 1 && (
                      <DeleteOutlined onClick={() => remove(name)} style={{ color: '#ff4d4f' }} />
                    )}
                  </Space>
                ))}
                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                  Thêm dòng mới
                </Button>
              </>
            )}
          </Form.List>
        </Form>
      </Modal>

      {/* MODAL CONTENT LẺ */}
      <Modal
        title={editingContent ? "Sửa nội dung" : "Thêm nội dung chi tiết"}
        open={isContentModalOpen}
        onOk={() => contentForm.submit()}
        onCancel={() => setIsContentModalOpen(false)}
        confirmLoading={actionLoading}
        destroyOnClose
      >
        <Form form={contentForm} layout="vertical" onFinish={handleSaveContent}>
          <Form.Item name="contentDetail" label="Nội dung chi tiết" rules={[{ required: true, message: 'Vui lòng nhập' }]}>
            <Input.TextArea rows={5} placeholder="Nhập hướng dẫn..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default HelpdeskCatalogManager;
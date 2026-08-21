import { useState } from 'react';
import { Alert, Button, Card, Col, Form, Input, Modal, Row, Space, Typography } from 'antd';
import { BookOutlined, SyncOutlined } from '@ant-design/icons';
import aiApi from '../../api/aiApi';
import { useApiAction } from '../../hooks/useApiAction';

const { Paragraph, Title } = Typography;

const KnowledgeManager = () => {
  const [form] = Form.useForm();
  const [indexedCount, setIndexedCount] = useState(null);
  const { actionLoading, execute } = useApiAction();

  const handleCreateKnowledge = async (values) => {
    const { success } = await execute(
      () => aiApi.createKnowledge(values),
      'Đã thêm tài liệu kiến thức cho AI.',
      'Không thể thêm tài liệu kiến thức.',
    );
    if (success) form.resetFields();
  };

  const handleReindex = () => {
    Modal.confirm({
      title: 'Tạo lại dữ liệu RAG?',
      content: 'Hệ thống sẽ đọc lại policy, Helpdesk và các dịch vụ đang hoạt động, sau đó tạo lại chunks và embeddings.',
      okText: 'Reindex',
      cancelText: 'Hủy',
      icon: <SyncOutlined />,
      onOk: async () => {
        const { success, data } = await execute(
          () => aiApi.reindexKnowledge(),
          'Reindex dữ liệu AI thành công.',
          'Không thể reindex dữ liệu AI.',
        );
        if (success) setIndexedCount(data.documentsIndexed ?? data.DocumentsIndexed ?? 0);
      },
    });
  };

  return <Space direction="vertical" size="large" block>
    <div>
      <Title level={3}>Quản lý kiến thức AI</Title>
      <Paragraph type="secondary">Thêm nội dung tư vấn riêng hoặc tạo lại dữ liệu RAG từ thông tin hệ thống.</Paragraph>
    </div>

    {indexedCount !== null && <Alert
      type="success"
      showIcon
      closable
      onClose={() => setIndexedCount(null)}
      message={`Đã index ${indexedCount} tài liệu hệ thống.`}
    />}

    <Row gutter={[16, 16]}>
      <Col xs={24} lg={16}>
        <Card title={<Space><BookOutlined />Thêm tài liệu kiến thức</Space>}>
          <Form form={form} layout="vertical" onFinish={handleCreateKnowledge}>
            <Form.Item name="title" label="Tiêu đề" rules={[{ required: true, whitespace: true, message: 'Vui lòng nhập tiêu đề.' }]}>
              <Input placeholder="Ví dụ: Chính sách hủy lịch" maxLength={200} showCount />
            </Form.Item>
            <Form.Item name="content" label="Nội dung" rules={[{ required: true, whitespace: true, message: 'Vui lòng nhập nội dung.' }]}>
              <Input.TextArea placeholder="Nhập nội dung mà trợ lý AI được phép sử dụng khi tư vấn..." autoSize={{ minRows: 8, maxRows: 16 }} showCount />
            </Form.Item>
            <Button type="primary" htmlType="submit" loading={actionLoading} icon={<BookOutlined />}>
              Thêm vào knowledge
            </Button>
          </Form>
        </Card>
      </Col>

      <Col xs={24} lg={8}>
        <Card title={<Space><SyncOutlined />Reindex hệ thống</Space>}>
          <Paragraph>Dùng khi policy, Helpdesk, dịch vụ hoặc cấu hình chunk/embedding thay đổi.</Paragraph>
          <Paragraph type="secondary">Thao tác này gọi Gemini để tạo lại embedding và có thể mất một khoảng thời gian.</Paragraph>
          <Button block icon={<SyncOutlined />} loading={actionLoading} onClick={handleReindex}>
            Reindex knowledge
          </Button>
        </Card>
      </Col>
    </Row>
  </Space>;
};

export default KnowledgeManager;

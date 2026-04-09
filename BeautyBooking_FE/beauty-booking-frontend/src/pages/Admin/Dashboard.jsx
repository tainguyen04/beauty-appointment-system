import { Row, Col, Card, Statistic, Table, Tag } from 'antd';
import { CalendarOutlined, DollarOutlined, UserOutlined } from '@ant-design/icons';

const Dashboard = () => {
  // Dữ liệu giả (Mock data) tạm thời trước khi nối API với Backend C#
  const recentAppointments = [
    { key: '1', customer: 'Nguyễn Văn A', service: 'Cắt tóc nam', time: '14:00 - Hôm nay', status: 'Chờ xác nhận' },
    { key: '2', customer: 'Trần Thị B', service: 'Uốn tóc Hàn Quốc', time: '15:30 - Hôm nay', status: 'Đã xác nhận' },
    { key: '3', customer: 'Lê Văn C', service: 'Gội đầu dưỡng sinh', time: '16:00 - Hôm nay', status: 'Đã hoàn thành' },
  ];

  // Cấu hình các cột cho Bảng Ant Design
  const columns = [
    { title: 'Khách hàng', dataIndex: 'customer', key: 'customer' },
    { title: 'Dịch vụ', dataIndex: 'service', key: 'service' },
    { title: 'Thời gian', dataIndex: 'time', key: 'time' },
    { 
      title: 'Trạng thái', 
      dataIndex: 'status', 
      key: 'status',
      render: (status) => {
        // Đổi màu Tag dựa theo trạng thái
        let color = 'orange';
        if (status === 'Đã xác nhận') color = 'blue';
        if (status === 'Đã hoàn thành') color = 'green';
        return <Tag color={color}>{status}</Tag>;
      }
    },
  ];

  return (
    <div>
      <h2 style={{ marginBottom: 20 }}>Tổng quan hệ thống</h2>
      
      {/* Hàng chứa các thẻ thống kê */}
      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col span={8}>
          <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <Statistic title="Khách hàng mới" value={112} valueStyle={{ color: '#3f8600' }} prefix={<UserOutlined />} />
          </Card>
        </Col>
        <Col span={8}>
          <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <Statistic title="Lịch hẹn hôm nay" value={15} valueStyle={{ color: '#1890ff' }} prefix={<CalendarOutlined />} />
          </Card>
        </Col>
        <Col span={8}>
          <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <Statistic title="Doanh thu trong ngày" value={2500000} valueStyle={{ color: '#cf1322' }} prefix={<DollarOutlined />} suffix="VNĐ" />
          </Card>
        </Col>
      </Row>

      {/* Bảng danh sách lịch hẹn */}
      <Card title="Lịch hẹn sắp tới" bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        <Table dataSource={recentAppointments} columns={columns} pagination={false} />
      </Card>
    </div>
  );
};

export default Dashboard;
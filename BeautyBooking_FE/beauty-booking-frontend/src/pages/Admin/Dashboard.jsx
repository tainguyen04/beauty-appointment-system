import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Table, Tag, Spin, message } from 'antd';
import { CalendarOutlined, DollarOutlined, UserOutlined } from '@ant-design/icons';
import dashboardApi from '../../api/dashboardApi';
import { getStatusConfig } from '../../utils/apiHelper';

const Dashboard = () => {
  const [summary, setSummary] = useState({
    NewCustomers: 0,
    TodayAppointment: 0,
    TodayRevenue: 0
  });

  const [recentAppointments, setRecentAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = localStorage.getItem('user');
  const isAdmin = user ? JSON.parse(user).role === 'Admin' : false;
  // ================= FETCH =================
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        const [summaryRes, appointmentsRes] = await Promise.all([
          dashboardApi.getSummary(),
          dashboardApi.getUpcomingAppointments()
        ]);

        // 👇 đảm bảo không crash nếu API trả khác format
        setSummary(summaryRes?.data || summaryRes || {});
        setRecentAppointments(appointmentsRes?.data || appointmentsRes || []);

      } catch (error) {
        console.error("Lỗi tải dashboard:", error);
        message.error("Không thể tải dữ liệu dashboard");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // ================= COLUMNS =================
  const columns = [
    {
      title: 'Khách hàng',
      width: 120,
      key: 'customer',
      render: (_, record) => (
        <div>
          <strong>{record.customerName}</strong>
        </div>
      )
    },
    {
      title: 'Nhân viên phụ trách',
      width: 120,
      key: 'staff',
      render: (_, record) => (
        <div>
          <strong>{record.staffName || "Chưa phân công"}</strong>
        </div>
      )
    },
    {
      title: 'Dịch vụ',
      dataIndex: 'servicesName',
      key: 'servicesName',
      render: (services = []) => (
        <>
          {services.map((s, i) => (
            <Tag key={i} color="cyan" style={{ marginBottom: 4 }}>
              {s}
            </Tag>
          ))}
        </>
      )
    },
    {
      title: 'Thời gian',
      width: 120,
      key: 'time',
      render: (_, record) => (
        <div>
          <span style={{ fontWeight: 500 }}>{record.timeRange}</span><br />
          <span style={{ fontSize: 12, color: 'gray' }}>
            {new Date(record.appointmentDate).toLocaleDateString()}
          </span>
        </div>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const { label, color } = getStatusConfig(status);
        return <Tag color={color}>{label}</Tag>;
      }
    }
  ];

  // ================= UI =================
  return (
    <Spin spinning={loading} tip="Đang tải dữ liệu tổng quan...">
      <div style={{ padding: 24 }}>
        <h2 style={{ marginBottom: 20 }}>Tổng quan hệ thống</h2>
      {isAdmin && (
        <Row gutter={16} style={{ marginBottom: 20 }}>
          <Col span={8}>
            <Card bordered={false}>
              <Statistic
                title="Khách hàng mới"
                value={summary.newCustomers}
                prefix={<UserOutlined />}
              />
            </Card>
          </Col>

          <Col span={8}>
            <Card bordered={false}>
              <Statistic
                title="Lịch hẹn hôm nay"
                value={summary.TodayAppointment}
                prefix={<CalendarOutlined />}
              />
            </Card>
          </Col>

          <Col span={8}>
            <Card bordered={false}>
              <Statistic
                title="Doanh thu trong ngày"
                value={summary.TodayRevenue}
                prefix={<DollarOutlined />}
                suffix="VNĐ"
              />
            </Card>
          </Col>
        </Row>
      )}
        <Card title="Lịch hẹn sắp tới" bordered={false}>
          <Table
            dataSource={recentAppointments}
            columns={columns}
            pagination={false}
            rowKey="id"
          />
        </Card>
      </div>
    </Spin>
  );
};

export default Dashboard;


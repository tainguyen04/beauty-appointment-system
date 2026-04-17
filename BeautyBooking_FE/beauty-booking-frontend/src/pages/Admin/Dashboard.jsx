import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Table, Tag, Spin, message } from 'antd';
import { CalendarOutlined, DollarOutlined, UserOutlined } from '@ant-design/icons';
import dashboardApi from '../../api/dashboardApi';
import { getStatusConfig } from '../../utils/apiHelper';
import { GetUser } from '../../api/axiosClient';

const Dashboard = () => {
  const [summary, setSummary] = useState({
    newCustomers: 0,
    todayAppointments: 0,
    todayRevenue: 0,
  });

  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = GetUser(); // Lấy thông tin user từ LocalStorage/SessionStorage để xác định role
  const isAdmin = user ? user.role === 'Admin' : false;
  // ================= FETCH =================
  useEffect(() => {
    const loadData = async () => {
      if (isAdmin === undefined) return;
      setLoading(true);
      try {
        if (isAdmin) {
          const summaryRes = await dashboardApi.getSummary();
          setSummary(summaryRes);
        }

        const upcomingRes = await dashboardApi.getUpcomingAppointments();
        setUpcomingAppointments(upcomingRes);

      } catch (error) {
        console.log("URL lỗi:", error.response?.config?.url);
        console.log("Status:", error.response?.status);
        console.log("Data:", error.response?.data);

        message.error(
          error.response?.status === 403
            ? "Bạn không có quyền xem dữ liệu này"
            : "Lỗi tải dashboard"
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isAdmin]);

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
      {isAdmin && summary && (
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
                value={summary.todayAppointments}
                prefix={<CalendarOutlined />}
              />
            </Card>
          </Col>

          <Col span={8}>
            <Card bordered={false}>
              <Statistic
                title="Doanh thu trong ngày"
                value={summary.todayRevenue}
                prefix={<DollarOutlined />}
                suffix="VNĐ"
              />
            </Card>
          </Col>
        </Row>
      )}
        <Card title="Lịch hẹn sắp tới" bordered={false}>
          <Table
            dataSource={upcomingAppointments}
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


import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Table, Tag, Spin } from 'antd';
import { CalendarOutlined, DollarOutlined, UserOutlined } from '@ant-design/icons';
import dashboardApi from '../../api/dashboardApi';
import { useApiAction } from '../../hooks/useApiAction';
import { getStatusConfig } from '../../utils/apiHelper';

const Dashboard = () => {
  const { actionLoading, execute } = useApiAction();

  const [summary, setSummary] = useState({
    newCustomers: 0,
    todayAppointments: 0,
    todayRevenue: 0
  });

  const [recentAppointments, setRecentAppointments] = useState([]);

  // ================= FETCH =================
  useEffect(() => {
  const loadData = async () => {
    const res = await execute(
      async () => {
        const [summaryRes, appointmentsRes] = await Promise.all([
          dashboardApi.getSummary(),
          dashboardApi.getUpcomingAppointments()
        ]);

        return { summaryRes, appointmentsRes };
      },
      null,
      "Lỗi tải dashboard"
    );

    if (res?.success) {
      const { summaryRes, appointmentsRes } = res.data;

      if (summaryRes?.success) setSummary(summaryRes.data);
      if (appointmentsRes?.success) setRecentAppointments(appointmentsRes.data);
    }
  };

  loadData();
// eslint-disable-next-line react-hooks/exhaustive-deps
}, []); // 👈 QUAN TRỌNG: []

  // ================= COLUMNS =================
  const columns = [
    {
      title: 'Khách hàng',
      key: 'customer',
      render: (_, record) => (
        <div>
          <strong>{record.customerName}</strong><br />
          <span style={{ fontSize: 12, color: 'gray' }}>
            Thợ: {record.staffName}
          </span>
        </div>
      )
    },
    {
      title: 'Nhân viên phụ trách',
      key: 'staff',
      render: (_, record) => (
        <div>
          <strong>{record.staffName}</strong><br />
          <span style={{ fontSize: 12, color: 'gray' }}>
            Thợ: {record.staffName}
          </span>
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
    <Spin spinning={actionLoading} tip="Đang tải dữ liệu tổng quan...">
      <div style={{ padding: 24 }}>
        <h2 style={{ marginBottom: 20 }}>Tổng quan hệ thống</h2>

        <Row gutter={16} style={{ marginBottom: 20 }}>
          <Col span={8}>
            <Card bordered={false}>
              <Statistic title="Khách hàng mới" value={summary.newCustomers} prefix={<UserOutlined />} />
            </Card>
          </Col>

          <Col span={8}>
            <Card bordered={false}>
              <Statistic title="Lịch hẹn hôm nay" value={summary.todayAppointments} prefix={<CalendarOutlined />} />
            </Card>
          </Col>

          <Col span={8}>
            <Card bordered={false}>
              <Statistic title="Doanh thu trong ngày" value={summary.todayRevenue} prefix={<DollarOutlined />} suffix="VNĐ" />
            </Card>
          </Col>
        </Row>

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
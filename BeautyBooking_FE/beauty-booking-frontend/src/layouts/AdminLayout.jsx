import { useState } from 'react';
import { Layout, Menu, theme } from 'antd';
import { DashboardOutlined, UserOutlined, CalendarOutlined } from '@ant-design/icons';
import { Outlet, useNavigate } from 'react-router-dom';

const { Header, Sider, Content } = Layout;

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const { token: { colorBgContainer, borderRadiusLG } } = theme.useToken();

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
        <div style={{ height: 32, margin: 16, background: 'rgba(255, 255, 255, 0.2)', borderRadius: 6 }} />
        <Menu 
          theme="dark" 
          defaultSelectedKeys={['/admin']} 
          mode="inline" 
          onClick={(e) => navigate(e.key)}
          items={[
            { key: '/admin', icon: <DashboardOutlined />, label: 'Dashboard' },
            { key: '/admin/appointments', icon: <CalendarOutlined />, label: 'Quản lý Lịch hẹn' },
            { key: '/admin/users', icon: <UserOutlined />, label: 'Quản lý Người dùng' },
          ]}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer }} />
        <Content style={{ margin: '16px' }}>
          <div style={{ padding: 24, minHeight: 360, background: colorBgContainer, borderRadius: borderRadiusLG }}>
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};
export default AdminLayout;
import { useState, useEffect } from 'react';
import { Layout, Menu, theme, Dropdown, Avatar, Space, Typography, message } from 'antd';
import { 
  DashboardOutlined, 
  UserOutlined, 
  CalendarOutlined, 
  LogoutOutlined,
  DownOutlined,
  SettingOutlined,
  CustomerServiceOutlined 
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import authApi from '../api/AuthApi';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

// --- Tách các định nghĩa tĩnh ra ngoài Component để tránh Re-render lỗi ---
const sidebarItems = [
  { key: '/admin', icon: <DashboardOutlined />, label: 'Dashboard' },
  { key: '/admin/services', icon: <CustomerServiceOutlined />, label: 'Quản lý Dịch vụ' },
  { key: '/admin/appointments', icon: <CalendarOutlined />, label: 'Quản lý Lịch hẹn' },
  { key: '/admin/users', icon: <UserOutlined />, label: 'Quản lý Người dùng' },
];

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { token: { colorBgContainer, borderRadiusLG } } = theme.useToken();

useEffect(() => {
  const userString = localStorage.getItem('user');

  if (!userString) {
    setUser(null);
    navigate('/login', { replace: true });
    return;
  }

  try {
    const userData = JSON.parse(userString);

    if (!userData || typeof userData !== 'object') {
      throw new Error('Invalid user object');
    }

    setUser(userData);
  } catch (err) {
    console.error('Lỗi dữ liệu user:', err);

    localStorage.removeItem('user');
    setUser(null);

    message.error('Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.');

    navigate('/login', { replace: true });
  }
}, [navigate]);

  const handleLogout = async () => {
    try {
        await authApi.logout(); // Gọi API đăng xuất để xóa session trên server (nếu có)
    } catch {
        message.error('Có lỗi xảy ra khi đăng xuất.');
    }finally{
        localStorage.clear();
    navigate('/login', { replace: true });
    }
  };

  const userMenuItems = {
  items: [
    { key: 'profile', label: 'Thông tin cá nhân', icon: <UserOutlined /> },
    { key: 'settings', label: 'Cài đặt', icon: <SettingOutlined /> },
    { type: 'divider' },
    { key: 'logout', label: 'Đăng xuất', icon: <LogoutOutlined />, danger: true },
  ],
  onClick: async ({ key }) => {
    if (key === 'logout') {
      await handleLogout();
    }
  }
};

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
        <div style={{ 
          width: '100%',
          height: '120px',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          overflow: 'hidden',
          // Nếu bạn muốn logo sát mép trên, để padding: 0. 
          // Nếu muốn có chút khoảng cách với menu bên dưới, hãy dùng paddingBottom.
          paddingBottom: '10px' 
      }}>
        <img 
          src="https://res.cloudinary.com/dznt3hdyj/image/upload/v1775734398/logo_rajcbq.png"
          alt="logo"
          style={{ 
            width: '100%',      // Ép ảnh rộng bằng đúng chiều ngang sidebar
            height: '100%',     // Tự động tính chiều cao theo tỉ lệ ảnh
            display: 'block',   // Loại bỏ khoảng trống thừa dưới ảnh
            objectFit: 'cover', // Đảm bảo ảnh phủ kín không gian
            transition: 'all 0.2s'
          }}
        />
      </div>
        <Menu 
          theme="dark" 
          selectedKeys={[location.pathname]} 
          mode="inline" 
          onClick={(e) => navigate(e.key)}
          items={sidebarItems}
        />
      </Sider>
      <Layout>
        <Header style={{ 
          padding: '0 24px', 
          background: colorBgContainer, 
          display: 'flex', 
          justifyContent: 'flex-end', 
          alignItems: 'center',
          boxShadow: '0 1px 4px rgba(0,21,41,0.08)'
        }}>
          <Dropdown menu={userMenuItems} placement="bottomRight" arrow>
            <Space style={{ cursor: 'pointer' }}>
              <Avatar 
                src={user?.avatarUrl} 
                icon={!user?.avatarUrl && <UserOutlined />}
                />
              <Text strong>{user?.fullName || 'Admin'}</Text>
              <DownOutlined style={{ fontSize: '10px', color: '#8c8c8c' }} />
            </Space>
          </Dropdown>
        </Header>
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
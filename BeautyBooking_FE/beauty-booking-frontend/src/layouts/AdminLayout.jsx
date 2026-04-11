import React, {useCallback, useEffect, useState } from 'react';
import { Layout, Menu, theme, Dropdown, Avatar, Space, Typography, message } from 'antd';
import { 
  DashboardOutlined, UserOutlined, TeamOutlined, IdcardOutlined,
  CalendarOutlined, LogoutOutlined, DownOutlined, SettingOutlined,
  CustomerServiceOutlined, TagsOutlined, AppstoreAddOutlined,ScheduleOutlined, CoffeeOutlined
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import authApi from '../api/AuthApi';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const menuItems = [
  { key: '/admin', icon: <DashboardOutlined />, label: 'Dashboard' },
  {
    key: 'sub-services',
    icon: <CustomerServiceOutlined />,
    label: 'Quản lý Dịch vụ',
    children: [
      { key: '/admin/categories', icon: <TagsOutlined />, label: 'Danh mục' },
      { key: '/admin/services', icon: <AppstoreAddOutlined />, label: 'Dịch vụ' },
    ],
  },
  { key: '/admin/appointments', icon: <CalendarOutlined />, label: 'Quản lý Lịch hẹn' },
  {
    key: 'sub-users',
    icon: <TeamOutlined />,
    label: 'Quản lý Tài khoản',
    children: [
      { key: '/admin/users', icon: <UserOutlined />, label: 'Khách hàng' },
      { key: '/admin/staffs', icon: <IdcardOutlined />, label: 'Nhân viên' },
    ],
  },
  {
    key: 'sub-scheduling',
    icon: <CalendarOutlined />,
    label: 'Quản lý Lịch trình',
    children: [
      { 
        key: '/admin/work-schedules', 
        icon: <ScheduleOutlined />, // Thêm icon cho đồng bộ
        label: 'Lịch làm việc' 
      },
      { 
        key: '/admin/day-offs', 
        icon: <CoffeeOutlined />, // Icon mang tính chất nghỉ ngơi/thư giãn
        label: 'Nghỉ phép' 
      },
    ],
  },
];

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { token: { colorBgContainer, borderRadiusLG } } = theme.useToken();

  // Hàm load user từ localStorage
  const loadUser = useCallback(() => {
    const userString = localStorage.getItem('user');
    if (!userString) {
      setUser(null);
      navigate('/login', { replace: true });
      return;
    }
    try {
      const userData = JSON.parse(userString);
      setUser(userData);
    } catch {
      localStorage.removeItem('user');
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    loadUser();
    // Lắng nghe sự kiện thay đổi localStorage để cập nhật Avatar/Name ngay lập tức
    window.addEventListener('storage', loadUser);
    return () => window.removeEventListener('storage', loadUser);
  }, [loadUser]);

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
      message.error('Có lỗi xảy ra khi đăng xuất.');
    } finally {
      localStorage.clear();
      navigate('/login', { replace: true });
    }
  };

  // Gộp tất cả sự kiện click của User Dropdown vào đây
  const handleUserMenuClick = async ({ key }) => {
    switch (key) {
      case 'profile':
        navigate('/admin/profile');
        break;
      case 'logout':
        await handleLogout();
        break;
      case 'settings':
        message.info('Chức năng cài đặt đang phát triển');
        break;
      default:
        break;
    }
  };

  const userMenuItems = {
    items: [
      { key: 'profile', label: 'Thông tin cá nhân', icon: <UserOutlined /> },
      { key: 'settings', label: 'Cài đặt', icon: <SettingOutlined /> },
      { type: 'divider' },
      { key: 'logout', label: 'Đăng xuất', icon: <LogoutOutlined />, danger: true },
    ],
    onClick: handleUserMenuClick
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        collapsible 
        collapsed={collapsed} 
        onCollapse={(value) => setCollapsed(value)}
        breakpoint="lg"
      >
        <div style={{ 
          height: '64px', // Thu hẹp chiều cao logo cho cân đối
          margin: '16px',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          overflow: 'hidden',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '8px'
        }}>
          <img 
            src="https://res.cloudinary.com/dznt3hdyj/image/upload/v1775734398/logo_rajcbq.png"
            alt="logo"
            style={{ 
              height: '80%', // Thu nhỏ lại một chút để không chạm viền
              maxWidth: '100%',
              objectFit: 'contain', // Giữ tỉ lệ logo
              transition: 'all 0.2s'
            }}
          />
        </div>
        
        <Menu
          mode="inline"
          theme="dark"
          selectedKeys={[location.pathname]}
          // Tự động mở menu cha chứa đường dẫn hiện tại
          defaultOpenKeys={['sub-services', 'sub-users', 'sub-scheduling']} 
          onClick={(e) => navigate(e.key)}
          items={menuItems}
        />
      </Sider>

      <Layout>
        <Header style={{ 
          padding: '0 24px', 
          background: colorBgContainer, 
          display: 'flex', 
          justifyContent: 'flex-end', 
          alignItems: 'center',
          boxShadow: '0 1px 4px rgba(0,21,41,0.08)',
          zIndex: 1 // Đảm bảo header nằm trên content khi cuộn
        }}>
          <Dropdown menu={userMenuItems} placement="bottomRight" arrow>
            <Space style={{ cursor: 'pointer', padding: '4px 8px', borderRadius: '4px', transition: 'all 0.3s' }} className="user-dropdown-hover">
              <Avatar 
                src={user?.avatarUrl} 
                icon={!user?.avatarUrl && <UserOutlined />}
              />
              <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.2' }}>
                <Text strong>{user?.fullName || 'Admin'}</Text>
                <Text type="secondary" style={{ fontSize: '10px' }}>Quản trị viên</Text>
              </div>
              <DownOutlined style={{ fontSize: '10px', color: '#8c8c8c' }} />
            </Space>
          </Dropdown>
        </Header>

        <Content style={{ margin: '16px', overflow: 'initial' }}>
          <div style={{ 
            padding: 24, 
            minHeight: 'calc(100vh - 112px)', // Tự động tính chiều cao để footer không bị đẩy quá xa
            background: colorBgContainer, 
            borderRadius: borderRadiusLG 
          }}>
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
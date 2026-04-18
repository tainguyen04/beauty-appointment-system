import React, {useCallback, useEffect, useState } from 'react';
import { Layout, Menu, theme, Dropdown, Avatar, Space, Typography, message ,Spin} from 'antd';
import { 
  DashboardOutlined, UserOutlined, TeamOutlined, IdcardOutlined,
  CalendarOutlined, LogoutOutlined, DownOutlined, SettingOutlined,
  CustomerServiceOutlined, EnvironmentOutlined, AppstoreOutlined,ScheduleOutlined, CoffeeOutlined
  ,ScissorOutlined ,TagOutlined
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import authApi from '../api/AuthApi';
import { useApiAction } from '../hooks/useApiAction'; // MỚI: Import useApiAction
import { GetUser } from '../api/axiosClient';
const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const menuItems = [
  { key: '/admin', icon: <DashboardOutlined />, label: 'Dashboard' },
  { key: '/admin/appointments', icon: <CalendarOutlined />, label: 'Quản lý Lịch hẹn' },
  { key: '/admin/services', icon: <ScissorOutlined />, label: 'Quản lý Dịch vụ'},
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
    key: 'catalogs',
    icon: <AppstoreOutlined />, // Icon bánh răng siêu hợp
    label: 'Quản lý danh mục', 
    children: [
      {
        key: '/admin/helpdesk-catalogs',
        icon: <CustomerServiceOutlined />,
        label: 'Danh mục Helpdesk',
      },
      {
        key: '/admin/website-localizations',
        icon: <EnvironmentOutlined />,
        label: 'Khu vực & Địa lý', // API Ward, Province của bạn nằm ở đây
      },
      {
        key: '/admin/categories',
        icon: <TagOutlined />,
        label: 'Danh mục Dịch vụ',
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

  const { actionLoading, execute } = useApiAction(); // MỚI: Khởi tạo hook quản lý action

  // Hàm load user từ localStorage
  const loadUser = useCallback(() => {
    const user = GetUser();
    if (!user) {
      setUser(null);
      navigate('/login', { replace: true });
      return;
    }
    try {
      const userData = user; // Nếu GetUser đã xử lý parse, ta chỉ việc dùng luôn
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
      await execute(
        () => authApi.logout(), // Gọi API logout nếu có
        "Đăng xuất thành công!" // Tin nhắn thành công
      );
    } catch {
      message.error('Có lỗi xảy ra khi đăng xuất.');
    } finally {
      localStorage.clear();
      sessionStorage.clear();
      navigate('/login', { replace: true });
    }
  };

  // Gộp tất cả sự kiện click của User Dropdown vào đây
  const handleUserMenuClick = async ({ key }) => {
    switch (key) {
      case 'profile':
        // trang profile nẳm ở components/Profile.jsx, nên ta sẽ navigate đến đó
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
          height: '80px', // Thu hẹp chiều cao logo cho cân đối
          width: '100%',
          margin: '0 0 8px 0', // Thêm margin dưới logo để tách biệt với menu
          padding: '0',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          overflow: 'hidden',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '0'
        }}>
          <img 
            src="https://res.cloudinary.com/dznt3hdyj/image/upload/v1775734398/logo_rajcbq.png"
            alt="logo"
            style={{ 
              height: 'auto', // Thu nhỏ lại một chút để không chạm viền
              width: '100%',
              objectFit: 'cover', // Giữ tỉ lệ logo
              transition: 'all 0.2s',
              margin: '0',
              padding: '0' // Thêm padding để logo không bị dính sát vào viền
            }}
          />
        </div>
        
        <Menu
          mode="inline"
          theme="dark"
          selectedKeys={[location.pathname]}
          // Tự động mở menu cha chứa đường dẫn hiện tại
          defaultOpenKeys={['catalogs', 'sub-users', 'sub-scheduling']} 
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
          <Spin spinning={actionLoading} size="small" style={{ marginRight: 16 }}>
          <Dropdown menu={userMenuItems} placement="bottomRight" arrow>
            <Space style={{ cursor: 'pointer', padding: '4px 8px', borderRadius: '4px', transition: 'all 0.3s' }} className="user-dropdown-hover">
              <Avatar 
                src={user?.avatarUrl} 
                icon={!user?.avatarUrl && <UserOutlined />}
              />
              <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.2' }}>
                <Text strong>{user?.fullName || 'Admin'}</Text>
                <Text type="secondary" style={{ fontSize: '10px' }}>
                  {{
                    Admin: 'Quản trị viên',
                    Staff: 'Nhân viên'
                  }[user?.role] || 'Không xác định'}
                </Text>
              </div>
              <DownOutlined style={{ fontSize: '10px', color: '#8c8c8c' }} />
            </Space>
          </Dropdown>
          </Spin>
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
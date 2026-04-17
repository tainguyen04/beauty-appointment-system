import { Outlet, useNavigate, Link } from 'react-router-dom';
import { GetUser } from '../api/axiosClient';
import { Button, Avatar, Dropdown, Space } from 'antd';
import { UserOutlined, LogoutOutlined, DashboardOutlined } from '@ant-design/icons';

const ClientLayout = () => {
  const navigate = useNavigate();
  const user = GetUser(); // Lấy thông tin đã lưu ở Local/Session

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate('/login');
  };

  // Menu thả xuống khi click vào Avatar
  const menuItems = [
    { key: 'profile', label: 'Hồ sơ của tôi', icon: <UserOutlined /> },
    // Nếu là Admin/Staff thì hiện thêm nút quay lại trang quản trị
    ...(user?.role === 'Admin' || user?.role === 'Staff' 
      ? [{ key: 'admin', label: 'Vào Quản trị', icon: <DashboardOutlined />, onClick: () => navigate('/admin') }] 
      : []),
    { key: 'logout', label: 'Đăng xuất', icon: <LogoutOutlined />, onClick: handleLogout },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Header tinh tế hơn */}
      <header style={{ 
        padding: '10px 50px', 
        background: '#fff', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        position: 'sticky',
        top: 0,
        zIndex: 1000
      }}>
        <div style={{ fontWeight: 'bold', fontSize: '20px', color: '#ff69b4', cursor: 'pointer' }} onClick={() => navigate('/')}>
          ECO BEAUTY 🌸
        </div>

        <nav>
          <Space size="large">
            <Link to="/" style={{ color: '#333' }}>Trang chủ</Link>
            <Link to="/services" style={{ color: '#333' }}>Dịch vụ</Link>
            
            {user ? (
              <Dropdown menu={{ items: menuItems }} placement="bottomRight">
                <Space style={{ cursor: 'pointer' }}>
                  <Avatar src={user.avatar} icon={<UserOutlined />} />
                  <span>{user.fullName}</span>
                </Space>
              </Dropdown>
            ) : (
              <Button type="primary" shape="round" onClick={() => navigate('/login')}>
                Đăng nhập
              </Button>
            )}
          </Space>
        </nav>
      </header>

      {/* Nội dung thay đổi theo Route */}
      <main style={{ flex: 1, padding: '20px' }}>
        <Outlet />
      </main>

      <footer style={{ padding: '40px 50px', background: '#2c3e50', color: 'white', textAlign: 'center' }}>
        <p>© 2024 EcoBeauty Spa - Trải nghiệm vẻ đẹp tự nhiên</p>
      </footer>
    </div>
  );
};

export default ClientLayout;
import { Outlet, useNavigate, Link } from 'react-router-dom';
import { GetUser } from '../api/axiosClient';
import { Button, Avatar, Dropdown, Space,message, Spin} from 'antd';
import { UserOutlined, LogoutOutlined, DashboardOutlined } from '@ant-design/icons';
import { useApiAction } from '../hooks/useApiAction';
import authApi from '../api/AuthApi';
const ClientLayout = () => {
  const navigate = useNavigate();
  const user = GetUser(); // Lấy thông tin đã lưu ở Local/Session
  const { actionLoading, execute } = useApiAction(); // MỚI: Khởi tạo hook quản lý action

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

  // Menu thả xuống khi click vào Avatar
  const menuItems = [
    { key: 'profile', label: 'Hồ sơ của tôi', icon: <UserOutlined />, onClick: () => navigate('/profile') },
    // Nếu là Admin/Staff thì hiện thêm nút quay lại trang quản trị
    ...(user?.role === 'Admin' || user?.role === 'Staff' 
      ? [{ key: 'admin', label: 'Vào Quản trị', icon: <DashboardOutlined />, onClick: () => navigate('/admin') }] 
      : []),
    {key: 'appointments', label: 'Lịch hẹn của tôi', icon: <DashboardOutlined />, onClick: () => navigate('/my-appointments')},
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
            <Link to="/booking" style={{ color: '#333' }}>Đặt lịch</Link>
            
            {user ? (
              <Spin spinning={actionLoading}>
              <Dropdown menu={{ items: menuItems }} placement="bottomRight">
                <Space style={{ cursor: 'pointer' }}>
                  <Avatar src={user.avatarUrl} icon={<UserOutlined />} />
                  <span>{user.fullName}</span>
                </Space>
              </Dropdown>
              </Spin>          
            ) : (
              <Button type="primary" shape="round" onClick={() => navigate('/login')} style={{ background: '#eb2f96', border: 'none' }}>
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
        <p>© 2026 EcoBeauty Spa - Trải nghiệm vẻ đẹp tự nhiên</p>
      </footer>
    </div>
  );
};

export default ClientLayout;
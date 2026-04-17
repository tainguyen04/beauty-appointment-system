import { Navigate, Outlet } from 'react-router-dom';
import { message } from 'antd';
import { GetToken, GetUser } from '../api/axiosClient';

const ProtectedRoute = ({ allowedRoles }) => {
  const token = GetToken(); // Lấy token từ LocalStorage hoặc SessionStorage
  const user = GetUser(); // Lấy thông tin user từ LocalStorage hoặc SessionStorage

  // 1. Chốt chặn 1: Chưa đăng nhập (Không có Token)
  if (!token || !user) {
    message.warning('Vui lòng đăng nhập để tiếp tục!');
    return <Navigate to="/login" replace />;
  }

  // 2. Chốt chặn 2: Đã đăng nhập nhưng không đủ thẩm quyền (Sai Role)
  // Giả sử Backend của bạn trả về biến Role với chữ cái đầu viết hoa như 'Admin', 'Customer'
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    message.error('Bạn không có quyền truy cập vào trang này!');
    return <Navigate to="/" replace />; // Đá văng về trang chủ của khách
  }

  // 3. Cầm vé hợp lệ: Cho phép đi tiếp vào giao diện bên trong
  return <Outlet />;
};

export default ProtectedRoute;
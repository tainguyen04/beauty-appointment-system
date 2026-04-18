import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ClientLayout from './layouts/ClientLayout';
import AdminLayout from './layouts/AdminLayout';
import Home from './pages/Client/Home';
import Dashboard from './pages/Admin/Dashboard';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ServiceManager from './pages/Admin/ServiceManager';
import CategoryManager from './pages/Admin/CategoryManager';
import UserManager from './pages/Admin/UserManager';
import StaffManager from './pages/Admin/StaffManager';
import Profile from './pages/Admin/Profile';
import StaffDayOffManager from './pages/Admin/StaffDayOffManager';
import WorkScheduleManager from './pages/Admin/WorkScheduleManager';
import AppointmentManager from './pages/Admin/AppointmentManager';
import WebLocalizationManager from './pages/Admin/WebLocalizationManager';
import HelpdeskCatalogManager from './pages/Admin/HelpdeskCatalogManager';
import Booking from './pages/Client/Booking'; // Import trang Booking mới
// 1. Import ProtectedRoute vừa tạo
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* LUỒNG AUTH (Ai cũng vào được) */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* LUỒNG 1: KHÁCH HÀNG (Tạm thời ai cũng vào được) */}
        <Route path="/" element={<ClientLayout />}>
          <Route index element={<Home />} />
          {/* Nếu muốn khách phải đăng nhập mới được đặt lịch, dùng ProtectedRoute ở đây */}
          <Route element={<ProtectedRoute allowedRoles={['Customer', 'Admin', 'Staff']} />}>
            <Route path="booking" element={<Booking />} />
            <Route path="my-appointments" element={<div>Trang danh sách lịch hẹn của khách</div>} />
          </Route>
        </Route>

        {/* LUỒNG 2: ADMIN ĐÃ ĐƯỢC BẢO VỆ TẬN RĂNG */}
        {/* Chỉ những user có role là 'Admin' hoặc 'Staff' mới được đi qua thẻ này */}
        <Route element={<ProtectedRoute allowedRoles={['Admin', 'Staff']} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            {/* Các trang con của Admin sau này (Quản lý User, Lịch hẹn...) sẽ nằm ở đây và tự động được bảo vệ */}
            <Route path="services" element={<ServiceManager />} />
            <Route path="categories" element={<CategoryManager />} />
            <Route path="users" element={<UserManager />} />
            <Route path="staffs" element={<StaffManager />} />
            <Route path="profile" element={<Profile />} />
            <Route path="day-offs" element={<StaffDayOffManager />} />
            <Route path="work-schedules" element={<WorkScheduleManager />} />
            <Route path="appointments" element={<AppointmentManager />} />
            <Route path="website-localizations" element={<WebLocalizationManager />} />
            <Route path="helpdesk-catalogs" element={<HelpdeskCatalogManager />} />
          </Route>
        </Route>
        
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;
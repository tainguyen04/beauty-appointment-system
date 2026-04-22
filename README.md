# 💇 Beauty Appointment System

Hệ thống quản lý đặt lịch làm đẹp chuyên nghiệp, giúp tối ưu hóa quy trình kết nối giữa Khách hàng, Nhân viên (Staff) và Quản trị viên (Admin).

## 📖 Giới thiệu dự án
Dự án giải quyết bài toán đặt lịch dịch vụ làm đẹp tại các chi nhánh một cách thông minh. Hệ thống tự động điều phối dựa trên thời gian trống và đội ngũ nhân viên thực tế tại từng cơ sở.

### 👥 Đối tượng sử dụng
- **Khách hàng:** Tìm kiếm dịch vụ, chọn chi nhánh và nhân viên yêu thích để đặt lịch.
- **Nhân viên (Staff):** Theo dõi danh sách lịch hẹn cần thực hiện.
- **Quản trị viên (Admin):** Quản lý toàn bộ hệ thống gồm dịch vụ, chi nhánh, nhân viên và trạng thái các cuộc hẹn.

## 🏗️ Kiến trúc & Công nghệ (Tech Stack)

### 1. Backend (ASP.NET Core 8 Web API)
Áp dụng kiến trúc phân tầng chuyên nghiệp:
- **Repository Pattern & Interface:** Tách biệt logic truy vấn dữ liệu, giúp code dễ unit test và bảo trì (Nằm trong thư mục `Repository` và `Interface`).
- **Entity Framework Core (EF):** Quản lý Database SQL Server theo phương pháp Code-First.
- **DTO & MappingProfiles:** Sử dụng AutoMapper để chuyển đổi dữ liệu an toàn giữa Entities và Data Transfer Objects (DTO).
- **Security:** Xác thực JWT kết hợp Refresh Token lưu trong HttpOnly Cookie để bảo mật phiên đăng nhập.

### 2. Frontend (React.js + Vite)
- **UI Library:** Ant Design (antd) - Mang lại giao diện hiện đại, tinh tế và chuyên nghiệp.
- **State Management:** Sử dụng React Hooks và Custom Hooks để quản lý logic giao diện.
- **Axios API:** Tích hợp Interceptors xử lý Silent Refresh khi Access Token hết hạn.

## 🔄 Quy trình đặt lịch (Booking Workflow)
Để đảm bảo tính chính xác, quy trình đặt lịch được thiết kế theo các bước:
1. **Chọn dịch vụ:** Khách hàng chọn loại hình làm đẹp.
2. **Chọn chi nhánh:** Hệ thống lọc danh sách chi nhánh khả dụng.
3. **Chọn thời gian:** Khách chọn ngày/giờ mong muốn.
4. **Chọn Staff:** Dựa trên chi nhánh và thời gian đã chọn, hệ thống sẽ hiển thị các nhân viên có lịch trống để khách hàng lựa chọn.

## 📂 Cấu trúc mã nguồn chi tiết

### Backend (`/BeautyBooking`)
- `Controllers/`: Tiếp nhận và phản hồi Request.
- `Entities/`: Định nghĩa các bảng trong SQL Server (User, Appointment, Service, Branch, Staff...).
- `Infrastructure/`: Chứa các cấu hình cốt lõi của hệ thống.
- `Helper/`: Các hàm xử lý chung (Log, Format, Token...).

### Frontend (`/beauty-booking-frontend`)
- `src/api/`: Quản lý các hàm gọi API Axios.
- `src/components/`: Các UI components dùng chung từ Ant Design.
- `src/layouts/`: Định nghĩa khung giao diện cho Admin/User.
- `src/pages/`: Các trang nghiệp vụ chính (Booking, Dashboard, Login...).

## 🛠️ Hướng dẫn cài đặt

### 1. Backend
- Truy cập thư mục `BeautyBooking/`.
- Tạo file `appsettings.Development.json` và cấu hình `ConnectionStrings` tới SQL Server của bạn.
- Chạy lệnh: `dotnet run`

### 2. Frontend
- Truy cập thư mục `BeautyBooking_FE/beauty-booking-frontend/`.
- Chạy lệnh: `npm install` để cài đặt Ant Design và các thư viện liên quan.
- Chạy lệnh: `npm run dev`

## 🌐 Lưu ý triển khai Production (Render)
Cần cấu hình các Environment Variables:
- `ConnectionStrings__DefaultConnection`: Chuỗi kết nối DB SQL Server.
- `Jwt__Key`: Khóa bí mật JWT (32+ ký tự).
- Thiết lập CORS trỏ về URL của Frontend và bật `AllowCredentials` để hỗ trợ Cookie.

---
⭐ *Dự án được thực hiện bởi tainguyen04 - 2024*

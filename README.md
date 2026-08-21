# Beauty Appointment System

Beauty Appointment System là nền tảng đặt lịch dịch vụ làm đẹp, kết nối khách hàng, nhân viên và quản trị viên. Hệ thống bao gồm website React, ASP.NET Core Web API, SQL Server và trợ lý AI sử dụng Semantic Kernel, Gemini và RAG.

## Liên kết triển khai

- Frontend: [beauty-appointment-system-ui.onrender.com](https://beauty-appointment-system-ui.onrender.com)
- Backend API: [beauty-booking-7gd4.onrender.com](https://beauty-booking-7gd4.onrender.com)
- Swagger: [beauty-booking-7gd4.onrender.com/swagger](https://beauty-booking-7gd4.onrender.com/swagger)

## Chức năng chính

### Khách chưa đăng nhập

- Xem danh mục, dịch vụ, nhân viên và nội dung Helpdesk.
- Tìm nhân viên khả dụng theo địa điểm và thời gian.
- Chat với AI Assistant; lịch sử gần nhất chỉ được lưu trong `sessionStorage` của tab trình duyệt và không ghi vào database.

### Khách hàng

- Đăng ký, đăng nhập và cập nhật hồ sơ cá nhân.
- Chọn dịch vụ, địa điểm, ngày giờ và nhân viên để đặt lịch.
- Xem lịch hẹn của mình.
- Chat với AI Assistant và tiếp tục các cuộc hội thoại đã lưu.

### Nhân viên

- Xem dashboard và lịch hẹn liên quan.
- Theo dõi lịch làm việc.
- Tạo, xem và hủy yêu cầu nghỉ phép.
- Quản lý hồ sơ cá nhân.

### Quản trị viên

- Quản lý tài khoản, vai trò, nhân viên và hồ sơ nhân viên.
- Quản lý dịch vụ, danh mục dịch vụ và trạng thái hoạt động.
- Quản lý lịch hẹn, lịch làm việc và yêu cầu nghỉ phép.
- Quản lý Helpdesk, khu vực và phường/xã.
- Thêm tài liệu kiến thức cho AI và reindex dữ liệu RAG.

## Công nghệ sử dụng

### Backend

- .NET 8 và ASP.NET Core Web API.
- Entity Framework Core 8, SQL Server và Code First migrations.
- Repository pattern, dependency injection, Scrutor và AutoMapper.
- JWT Bearer Authentication, Refresh Token trong HttpOnly Cookie và phân quyền theo role.
- BCrypt để băm mật khẩu.
- Cloudinary để lưu ảnh.
- Swagger/OpenAPI.
- Semantic Kernel `1.79.0`.
- Semantic Kernel Google connector `1.79.0-alpha`.
- Gemini Chat Completion và Gemini Embedding.
- SQL Server vector type và `VECTOR_DISTANCE` cho tìm kiếm cosine.

### Frontend

- React `19`, React DOM và React Router.
- Vite `8`.
- Ant Design `6` và Ant Design Icons.
- Axios với interceptor gắn JWT và refresh access token.
- Tiptap cho nội dung Helpdesk.
- Leaflet và React Leaflet cho dữ liệu vị trí.

## Kiến trúc thư mục

```text
beauty-appointment-system/
├── BeautyBooking/                         # ASP.NET Core Web API
│   ├── AI/
│   │   ├── Configuration/                 # Gemini, context window và RAG options
│   │   ├── Controllers/                   # AIController
│   │   ├── DTO/
│   │   ├── Interfaces/
│   │   ├── Knowledge/                     # Policy Markdown
│   │   ├── Models/
│   │   ├── Prompt/
│   │   ├── Providers/                     # Gemini và provider Legacy
│   │   ├── Services/                      # Chat, summary, RAG, embedding, vector search
│   │   └── Tools/
│   ├── Controllers/                       # API nghiệp vụ
│   ├── DTO/
│   ├── EF/                                # DbContext và migrations
│   ├── Entities/
│   ├── Infrastructure/                    # EF configurations và repository
│   ├── Interface/
│   ├── MappingProfiles/
│   ├── Repository/
│   └── Services/
└── BeautyBooking_FE/
    └── beauty-booking-frontend/
        └── src/
            ├── api/                       # Axios client và API modules
            ├── components/                # Components dùng chung và AI chat popup
            ├── hooks/
            ├── layouts/                   # ClientLayout và AdminLayout
            └── pages/                     # Auth, Client và Admin pages
```

## AI Assistant và RAG

### Luồng chat

1. Frontend gửi câu hỏi đến `POST /api/AI/chat`.
2. Backend xác định người dùng từ JWT nếu request có access token hợp lệ.
3. Backend tạo embedding cho câu hỏi và tìm các knowledge chunks gần nhất trong SQL Server.
4. System prompt, summary, lịch sử gần nhất và RAG context được gửi đến Gemini qua Semantic Kernel.
5. Backend chờ Gemini tạo xong câu trả lời, lưu assistant message nếu người dùng đã đăng nhập, sau đó trả một JSON hoàn chỉnh cùng danh sách nguồn RAG.

AI Assistant hiện không sử dụng streaming. Frontend hiển thị trạng thái chờ trong lúc backend xử lý và chỉ render câu trả lời sau khi nhận response hoàn chỉnh. Cách này được chọn để giữ kiến trúc đơn giản: tiếp tục dùng Axios/JSON thông thường, tận dụng interceptor refresh access token bằng Refresh Token hiện có, xử lý lỗi bằng HTTP status và chỉ lưu message hoàn chỉnh. Streaming qua SSE hoặc NDJSON chưa cần thiết trong phạm vi hiện tại; nếu dùng native `fetch` để đọc stream thì phải tích hợp lại luồng refresh token đang nằm trong Axios interceptor, đồng thời xử lý hủy request và response bị ngắt giữa chừng.

Thành viên không truyền `conversationId` ở tin nhắn đầu tiên; backend tự tạo conversation gắn với tài khoản. Khi tiếp tục hội thoại, backend kiểm tra conversation thuộc đúng user hiện tại. Khách không được truyền `conversationId` và backend không lưu cuộc trò chuyện của khách.

### Context và summary

- Backend chỉ tải số lượng tin nhắn gần nhất theo cấu hình, không tải toàn bộ hội thoại cho mỗi request chat.
- Khi lịch sử vượt ngưỡng, các tin nhắn cũ được tóm tắt tăng dần và lưu trong `conversation_summaries`.
- Frontend giữ tối đa 20 tin nhắn gần nhất của khách trong `sessionStorage`.

### Knowledge và reindex

Knowledge hệ thống được tổng hợp từ:

- Các file Markdown trong `BeautyBooking/AI/Knowledge/`.
- Helpdesk đang hoạt động.
- Dịch vụ đang hoạt động.
- Tài liệu do Admin thêm qua `POST /api/AI/knowledge`.

RAG hiện sử dụng:

- `ChunkSize`: số ký tự tối đa của một chunk.
- `Overlap`: số ký tự được lặp lại giữa hai chunk liên tiếp.
- `TopK`: số chunk gần nhất được đưa vào context.
- Embedding 768 chiều, lưu trong cột SQL `vector(768)`.

Reindex xóa và tạo lại các tài liệu có prefix `system:` từ Markdown, Helpdesk và dịch vụ. Tài liệu Admin thêm thủ công không mang prefix này nên không bị xóa bởi reindex.

Cần reindex sau khi:

- Thay đổi `ChunkSize` hoặc `Overlap`.
- Thay đổi embedding model hoặc embedding dimensions.
- Cập nhật policy Markdown, Helpdesk hoặc dịch vụ dùng cho AI.

Admin có thể thực hiện tại `Quản lý danh mục → Kiến thức AI → Reindex knowledge`.

## AI API

| Method | Endpoint | Quyền | Mô tả |
|---|---|---|---|
| `POST` | `/api/AI/chat` | Public | Chat với AI; JWT là tùy chọn |
| `GET` | `/api/AI/conversations` | JWT | Lấy các conversation của user hiện tại |
| `GET` | `/api/AI/conversations/{id}/messages` | JWT | Lấy summary và messages sau khi kiểm tra ownership |
| `POST` | `/api/AI/knowledge` | Admin | Thêm tài liệu, chunks và embeddings |
| `POST` | `/api/AI/knowledge/reindex` | Admin | Tạo lại knowledge hệ thống |

Swagger cung cấp danh sách đầy đủ các API nghiệp vụ khác như Auth, Appointment, BeautyService, Category, User, StaffProfile, StaffDayOff, WorkSchedule, Helpdesk, Dashboard và địa điểm.

## Yêu cầu môi trường

- .NET SDK 8.
- Node.js tương thích với Vite 8 và npm.
- SQL Server/Azure SQL có hỗ trợ kiểu `vector` và hàm `VECTOR_DISTANCE` được dùng trong source hiện tại.
- Gemini API key và tên chat/embedding model hợp lệ.
- Cloudinary account nếu sử dụng chức năng upload ảnh.

## Cấu hình backend

Tạo hoặc cập nhật `BeautyBooking/appsettings.Development.json`. Không commit khóa thật vào Git.

```json
{
  "ConnectionStrings": {
    "DefaultConnection": ""
  },
  "Jwt": {
    "Key": "",
    "Issuer": "",
    "Audience": ""
  },
  "Gemini": {
    "ApiKey": "",
    "ChatModel": "",
    "EmbeddingModel": "",
    "EmbeddingDimensions": 768
  },
  "AI": {
    "ContextWindow": {
      "MaxMessages": 5,
      "RecentMessages": 2
    },
    "RAG": {
      "ChunkSize": 800,
      "Overlap": 100,
      "TopK": 3
    }
  },
  "CloudinarySettings": {
    "CloudName": "",
    "ApiKey": "",
    "ApiSecret": ""
  }
}
```

Gemini là provider đang được đăng ký trong dependency injection. Source OpenAI/Ollama được giữ làm Legacy để đối chiếu nhưng không được kích hoạt.

Trong môi trường production, ưu tiên secret manager hoặc environment variables. Ví dụ:

```text
Gemini__ApiKey
Gemini__ChatModel
Gemini__EmbeddingModel
ConnectionStrings__DefaultConnection
Jwt__Key
```

Backend có thể khởi động khi Gemini key/model còn trống, nhưng endpoint AI sẽ trả lỗi cấu hình có kiểm soát khi được gọi.

## Khởi chạy backend

```powershell
cd BeautyBooking
dotnet restore
dotnet ef database update
dotnet run
```

Các URL local theo launch profile:

- HTTP API: `http://localhost:5043`
- HTTPS API: `https://localhost:7254`
- Swagger: `http://localhost:5043/swagger`

Build riêng backend:

```powershell
dotnet build BeautyBooking/BeautyBooking.csproj
```

## Cấu hình và khởi chạy frontend

Frontend đọc API base URL từ biến môi trường Vite:

```text
VITE_API_BASE_URL
```

File `.env` đã được Git ignore. Không đặt secret trong biến có prefix `VITE_` vì giá trị này được đóng gói vào JavaScript phía trình duyệt. Mặc định dự án dùng backend production:

```dotenv
VITE_API_BASE_URL=https://beauty-booking-7gd4.onrender.com/api
```

```powershell
cd BeautyBooking_FE/beauty-booking-frontend
npm install
npm run dev
```

Vite mặc định phục vụ frontend tại `http://localhost:5173`; URL này đã nằm trong CORS policy của backend.

Để chạy backend và frontend local cùng nhau, mở hai terminal:

```powershell
# Terminal 1 - chạy từ thư mục gốc repository
dotnet run --project BeautyBooking/BeautyBooking.csproj --launch-profile https
```

```powershell
# Terminal 2
cd BeautyBooking_FE/beauty-booking-frontend
npm run dev
```

Để frontend gọi backend local, tạm đổi `.env` thành `VITE_API_BASE_URL=https://localhost:7254/api` trước khi chạy `npm run dev`. Sau khi sửa `.env`, cần khởi động lại Vite. Đổi lại URL production trước khi build/deploy. Nếu biến này bị thiếu, frontend sẽ báo lỗi cấu hình thay vì âm thầm dùng URL hard-code. Environment variable trên nền tảng triển khai vẫn có thể ghi đè giá trị trong file.

Nếu trình duyệt chưa tin cậy HTTPS development certificate của .NET, chạy `dotnet dev-certs https --trust` một lần trước khi khởi động backend.

Kiểm tra frontend:

```powershell
npm run lint
npm run build
```

## Authentication và phân quyền

Hệ thống có ba role:

| Role | Phạm vi chính |
|---|---|
| `Customer` | Đặt lịch, xem lịch cá nhân, hồ sơ và AI conversation |
| `Staff` | Dashboard, lịch hẹn, lịch làm việc, nghỉ phép và hồ sơ |
| `Admin` | Toàn bộ chức năng quản trị và quản lý knowledge AI |

Access token được gửi trong header `Authorization: Bearer <token>`. Refresh token được gửi bằng HttpOnly Cookie. Axios interceptor tự gắn access token và thử refresh khi API trả `401`.

## Database

EF Core quản lý schema bằng migrations trong `BeautyBooking/EF/Migrations/`. Các nhóm bảng chính gồm:

- Users, refresh tokens và staff profiles.
- Categories, services và staff-service relationships.
- Appointments và appointment services.
- Work schedules và staff day off.
- Website localizations, wards và Helpdesk.
- Conversations, messages và conversation summaries.
- Knowledge documents, knowledge chunks và vector embeddings.

Khi pull source có migration mới, chạy:

```powershell
dotnet ef database update --project BeautyBooking/BeautyBooking.csproj
```

Không tự động chạy reindex chỉ vì vừa apply migration. Chỉ reindex khi knowledge, cách chunk hoặc embedding model thay đổi.

## Docker backend

Backend có `BeautyBooking/Dockerfile` multi-stage cho .NET 8:

```powershell
docker build -t beauty-booking-api BeautyBooking
docker run --rm -p 8080:8080 beauty-booking-api
```

Cần truyền connection string, JWT, Gemini và Cloudinary secrets bằng environment variables hoặc secret của nền tảng triển khai.

## Lưu ý bảo mật

- Không commit API key, JWT signing key, database password hoặc Cloudinary secret.
- `appsettings.Development.json` chỉ phù hợp cho môi trường local và vẫn là file plaintext trên máy.
- Không gửi role `System` từ frontend guest chat; backend chỉ chấp nhận `User` và `Assistant` cho guest history.
- Các endpoint conversation luôn kiểm tra ownership tại backend.
- Reindex gọi Gemini Embedding API và thay đổi dữ liệu knowledge trong database.

---

Maintainer: [tainguyen04](https://github.com/tainguyen04) · 2026

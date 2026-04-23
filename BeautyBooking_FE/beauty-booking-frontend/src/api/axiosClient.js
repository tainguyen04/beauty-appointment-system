import axios from 'axios';
import queryString from 'query-string';

// Tạo một instance của axios với cấu hình mặc định
const axiosClient = axios.create({
  baseURL: 'https://beauty-booking-7gd4.onrender.com/api', // TẠM THỜI ĐỂ VẬY, bạn sẽ thay bằng Port thật của C# sau
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Cho phép gửi cookie nếu cần (nếu backend và frontend cùng domain hoặc đã cấu hình CORS đúng)
  paramsSerializer: (params) => queryString.stringify(params),
});



// Interceptor cho Request: Trực chờ ở cửa, thấy ai ra là nhét Token vào tay
axiosClient.interceptors.request.use(
  (config) => {
    const token = GetToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor cho Response: Xử lý lỗi tập trung
axiosClient.interceptors.response.use(
  (response) => {
    // Nếu thành công, chỉ lấy cái ruột data trả về, bỏ qua các thông tin rườm rà của HTTP
    if (response && response.data) {
      return response.data;
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    // Nếu lỗi 401 và KHÔNG PHẢI là request đăng nhập/đăng ký
    if (status === 401 && !originalRequest._retry && !originalRequest.url.includes('/Auth/login')) {
      originalRequest._retry = true; // Đánh dấu đã thử refresh để tránh lặp vô tận

      try {
        // Gọi API Refresh Token
        // Vì dùng withCredentials: true, trình duyệt sẽ tự đính kèm RefreshToken từ Cookie
        const res = await axios.post(
          'https://beauty-booking-7gd4.onrender.com/api/Auth/refresh-token', 
          {}, 
          { withCredentials: true }
        );

        if (res.data && res.data.accessToken) {
          const newAccessToken = res.data.accessToken;
          
          // 1. Lưu Access Token mới vào LocalStorage
          localStorage.setItem('accessToken', newAccessToken);

          // 2. Gắn token mới vào request cũ và chạy lại
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return axiosClient(originalRequest);
        }
      } catch (refreshError) {
        // Nếu refresh cũng lỗi (hết hạn hoàn toàn), xóa sạch và đá ra Login
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const GetToken = () => {
  return localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
};

export const GetUser = () => {
  const userString = localStorage.getItem('user') || sessionStorage.getItem('user');
  if (!userString) return null;
  try {
    return JSON.parse(userString);
  }catch {
    const storage = localStorage.getItem('user') ? localStorage : sessionStorage;
    storage.removeItem('user');
    storage.removeItem('accessToken'); // Xóa luôn token đi kèm
    return null;
  }
};

export default axiosClient;
import axios from 'axios';
import queryString from 'query-string';

// Tạo một instance của axios với cấu hình mặc định
const axiosClient = axios.create({
  baseURL: 'https://beauty-booking-7gd4.onrender.com/api', // TẠM THỜI ĐỂ VẬY, bạn sẽ thay bằng Port thật của C# sau
  headers: {
    'Content-Type': 'application/json',
  },
  paramsSerializer: (params) => queryString.stringify(params),
});

// Interceptor cho Request: Trực chờ ở cửa, thấy ai ra là nhét Token vào tay
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
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
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || '';
    // Nếu Backend trả về lỗi 401 (Hết hạn Token hoặc chưa đăng nhập)
    if (status === 401 && !url.includes('/Auth/login') && !url.includes('/Auth/register')) {
      localStorage.removeItem('token');
      window.location.href = '/login'; // Đá văng ra trang đăng nhập
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
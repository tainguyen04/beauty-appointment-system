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
    return response?.data ?? response;
  },
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    if (
      status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes('/Auth/login') &&
      !originalRequest.url.includes('/Auth/refresh-token')
    ) {
      originalRequest._retry = true;

      try {
        const res = await axiosClient.post('/Auth/refresh-token');

        if (res && res.accessToken) {
          const newAccessToken = res.accessToken;

          localStorage.setItem('accessToken', newAccessToken);

          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

          return axiosClient(originalRequest);
        }
      } catch (refreshError) {
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
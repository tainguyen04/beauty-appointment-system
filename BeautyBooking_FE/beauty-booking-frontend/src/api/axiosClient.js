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

// Biến toàn cục để quản lý trạng thái refresh token
let isRefreshing = false;
let refreshSubscribers = [];

const subscribeTokenRefresh = (cb) => {
  refreshSubscribers.push(cb);
};

const onRefreshed = (token) => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
};
// Interceptor cho Request: Trực chờ ở cửa, thấy ai ra là nhét Token vào tay
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

      // 👉 Nếu đang refresh thì chờ
      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeTokenRefresh((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(axiosClient(originalRequest));
          });
        });
      }

      isRefreshing = true;

      try {
        const res = await axios.post(
          'https://beauty-booking-7gd4.onrender.com/api/Auth/refresh-token',
          {},
          { withCredentials: true }
        );

        const newToken = res.data?.accessToken;

        if (!newToken) throw new Error('No token returned');

        // 👉 Lưu token mới
        localStorage.setItem('accessToken', newToken);

        // 👉 Đánh thức các request đang chờ
        onRefreshed(newToken);

        // 👉 Retry request hiện tại
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axiosClient(originalRequest);
      } catch (err) {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = '/login';
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
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
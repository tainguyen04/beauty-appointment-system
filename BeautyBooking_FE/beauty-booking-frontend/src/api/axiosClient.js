import axios from 'axios';
import queryString from 'query-string';
import { setToken } from '../utils/apiHelper';

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

    if (status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
            // DÙNG AXIOS GỐC (không dùng axiosClient) để tránh bị dính interceptor cũ
            const res = await axios.post(
                'https://beauty-booking-7gd4.onrender.com/api/Auth/refresh-token', 
                {}, 
                { withCredentials: true } // Quan trọng để gửi kèm Refresh Token trong Cookie
            );

            // Kiểm tra cấu trúc data trả về của bạn (thường axios gốc sẽ là res.data)
            const data = res.data; 

            if (data && data.accessToken) {
                const newAccessToken = data.accessToken;
                setToken(newAccessToken);
                
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return axios(originalRequest); // Gọi lại request gốc bằng axios thường
            }
        } catch (refreshError) {
            console.error("Refresh token failed, kicking out...");
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
  const sessionToken = sessionStorage.getItem('accessToken');
  if (sessionToken) return sessionToken;

  return localStorage.getItem('accessToken');
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
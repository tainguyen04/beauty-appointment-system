import axiosClient from './axiosClient';

const authApi = {
  // Hàm gọi API đăng nhập
  login: (data) => {
    const url = '/Auth/login'; // Đường dẫn api của BE (tùy vào controller của bạn)
    return axiosClient.post(url, data);
  },

  // Hàm gọi API đăng ký
  register: (data) => {
    const url = '/Auth/register';
    return axiosClient.post(url, data);
  },
  // Hàm gọi API đăng xuất
  logout: (data) => {
    const url = '/Auth/logout';
    return axiosClient.post(url, data);
  },
};

export default authApi;
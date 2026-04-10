// src/api/userApi.js
import axiosClient from './axiosClient';

const userApi = {
  // Lấy tất cả user
  getAll: (params) => {
    return axiosClient.get('/User', { params });
  },

  // Lấy danh sách theo Role (Ví dụ: 'Customer' hoặc 'Admin')
  getByRole: (role, params) => {
    return axiosClient.get(`/User/role/${role}`, { params });
  },

  // Khóa/Mở khóa tài khoản
  blockUser: (id) => {
    return axiosClient.post(`/User/${id}/block`);
  },

  // Cập nhật trạng thái (Active/Inactive)
  updateStatus: (id, status) => {
    return axiosClient.put(`/User/${id}/status`, { status });
  },

  // Xóa tài khoản
  delete: (id) => {
    return axiosClient.delete(`/User/${id}`);
  },

  // Reset mật khẩu về mặc định
  resetPassword: (id) => {
    return axiosClient.post(`/User/${id}/reset-password`);
  }
};

export default userApi;
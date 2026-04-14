// src/api/userApi.js
import axiosClient from './axiosClient';
import { cleanParams } from '../utils/apiHelper';

const userApi = {
  // Lấy tất cả user
  getAll: (params) => {
    return axiosClient.get('/User', { params: cleanParams(params) });
  },

  // Lấy danh sách theo Role (Ví dụ: 'Customer' hoặc 'Admin')
  getByRole: (role, params) => {
    return axiosClient.get(`/User/role/${role}`, { params: cleanParams(params) });
  },
  // Lấy chi tiết user theo ID
  getById: (id) => {
    return axiosClient.get(`/User/${id}`);
  },
  // Tạo mới user (Admin tạo cho khách hàng hoặc nhân viên)
  create: (data) => {
    return axiosClient.post('/User', data);
  },


  // Khóa/Mở khóa tài khoản
  blockUser: (id) => {
    return axiosClient.post(`/User/${id}/block`);
  },
  //Cap nhật thông tin user (Admin cập nhật cho khách hàng hoặc nhân viên)
  update: (id, data) => {
    return axiosClient.put(`/User/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  // Cập nhật trạng thái (Active/Inactive)
 updateStatus: (id, isActive) => {
    return axiosClient.put(`/User/${id}/status`, null, {
      params: { isActive }
    });
  },
  // Thay đổi Role (Sửa lại: Backend dùng [FromBody] ChangeRoleRequest)
  changeRole: (userId, newRole) => {
    return axiosClient.put('/User/role', { 
        userId: userId, 
        newRole: newRole 
    });
  },

  // Xóa tài khoản
  delete: (id) => {
    return axiosClient.delete(`/User/${id}`);
  },
  // Profile cá nhân
  getMyProfile: () => axiosClient.get('/User/me/profile'),
  // Cập nhật profile cá nhân (có hỗ trợ upload ảnh)
  updateMyProfile: (formData) => axiosClient.put('/User/me/profile', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),

  // Reset mật khẩu về mặc định
  resetPassword: (id) => {
    return axiosClient.post(`/User/${id}/reset-password`);
  },
  // Kiểm tra email có sẵn hay không (dành cho form đăng ký hoặc cập nhật email)
  checkEmail: (email) => axiosClient.get('/User/email-availability', { params: { email } }),
};

export default userApi;
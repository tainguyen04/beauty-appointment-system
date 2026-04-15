import axiosClient from './axiosClient';
import { cleanParams } from '../utils/apiHelper';

const userApi = {
  // ================= ADMIN & QUẢN LÝ USER =================

  // [GET] Lấy tất cả user (Có hỗ trợ filter, phân trang từ UserFilter)
  getAll: (params) => {
    return axiosClient.get('/User', { params: cleanParams(params) });
  },

  // [GET] Lấy chi tiết user theo ID
  getById: (id) => {
    return axiosClient.get(`/User/${id}`);
  },

  // [POST] Tạo mới user
  create: (data) => {
    return axiosClient.post('/User', data);
  },

  // [PUT] Cập nhật thông tin user (Admin cập nhật cho user khác)
  // Lưu ý: Backend dùng [FromForm] nên data phải là FormData
  update: (id, formData) => {
    return axiosClient.put(`/User/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  // [PUT] Cập nhật trạng thái (Active/Inactive)
  updateStatus: (id, isActive) => {
    return axiosClient.put(`/User/${id}/status`, null, {
      params: { isActive }
    });
  },

  // ĐÃ FIX: Thay đổi Role cập nhật theo Backend mới (Truyền id trên URL)
  // Backend Controller: [HttpPut("{id}/role")] public async Task<IActionResult> ChangeRole(int id, [FromBody] ChangeRoleRequest request)
  changeRole: (id, newRole) => {
    return axiosClient.put(`/User/${id}/role`, { 
      newRole: newRole 
    });
  },

  // [POST] Reset mật khẩu về mặc định (123456)
  resetPassword: (id) => {
    return axiosClient.post(`/User/${id}/reset-password`);
  },

  // [DELETE] Xóa tài khoản
  delete: (id) => {
    return axiosClient.delete(`/User/${id}`);
  },

  // ================= CÁ NHÂN (ME) =================

  // [GET] Profile cá nhân
  getMyProfile: () => {
    return axiosClient.get('/User/me/profile');
  },

  // [PUT] Cập nhật profile cá nhân (có hỗ trợ upload ảnh)
  // Lưu ý: Backend dùng [FromForm] nên data phải là FormData
  updateMyProfile: (formData) => {
    return axiosClient.put('/User/me/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  // [PUT] Đổi mật khẩu cá nhân
  changeMyPassword: (data) => {
    return axiosClient.put('/User/me/password', data);
  },

  // ================= TIỆN ÍCH (PUBLIC) =================

  // [GET] Kiểm tra email có sẵn hay không (Dành cho form đăng ký/cập nhật)
  checkEmailAvailability: (email) => {
    return axiosClient.get('/User/email-availability', { params: { email } });
  }
};

export default userApi;
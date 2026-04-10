// src/api/staffApi.js
import axiosClient from './axiosClient';

const staffApi = {
  // Lấy danh sách tất cả hồ sơ nhân viên (dùng cho StaffManager)
  getAll: (params) => {
    return axiosClient.get('/StaffProfile', { params });
  },

  // Lấy nhân viên đang rảnh (dùng cho việc gán lịch đặt chỗ)
  getAvailable: (params) => {
    return axiosClient.get('/StaffProfile/available', { params });
  },

  // Lấy chi tiết 1 nhân viên
  getById: (id) => {
    return axiosClient.get(`/StaffProfile/${id}`);
  },

  // Tạo mới hồ sơ nhân viên
  create: (data) => {
    return axiosClient.post('/StaffProfile', data);
  },

  // Cập nhật hồ sơ (Kinh nghiệm, kỹ năng...)
  update: (id, data) => {
    return axiosClient.put(`/StaffProfile/${id}`, data);
  },

  // Xóa hồ sơ nhân viên
  delete: (id) => {
    return axiosClient.delete(`/StaffProfile/${id}`);
  },

  // Lấy danh sách nhân viên làm được dịch vụ X (dùng khi khách chọn dịch vụ)
  getByService: (serviceId) => {
    return axiosClient.get(`/StaffProfile/service/${serviceId}`);
  }
};

export default staffApi;
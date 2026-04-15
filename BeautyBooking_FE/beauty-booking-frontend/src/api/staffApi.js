import axiosClient from './axiosClient';
import { cleanParams } from '../utils/apiHelper';

const staffApi = {
  // [GET] Lấy danh sách hồ sơ nhân viên (Có hỗ trợ filter)
  getAll: (params) => {
    return axiosClient.get('/StaffProfile', { params: cleanParams(params) });
  },

  // [GET] Lấy chi tiết hồ sơ theo ID
  getById: (id) => {
    return axiosClient.get(`/StaffProfile/${id}`);
  },

  // [GET] Lấy chi tiết hồ sơ theo UserId (Tài khoản)
  getByUserId: (userId) => {
    return axiosClient.get(`/StaffProfile/user/${userId}`);
  },

  // [GET] Lấy hồ sơ của chính nhân viên đang đăng nhập
  getMyProfile: () => {
    return axiosClient.get('/StaffProfile/me');
  },

  // [POST] Tạo mới hồ sơ nhân viên (Backend dùng [FromForm])
  create: (formData) => {
    return axiosClient.post('/StaffProfile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  // [PUT] Cập nhật hồ sơ nhân viên (Backend dùng [FromForm])
  update: (id, formData) => {
    return axiosClient.put(`/StaffProfile/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  // [POST] Phân công dịch vụ cho nhân viên
  assignServices: (id, serviceIds) => {
    // Backend dùng [FromBody] AssignServicesRequest
    return axiosClient.post(`/StaffProfile/${id}/services`, { serviceIds });
  },

  // [DELETE] Xóa hồ sơ nhân viên
  delete: (id) => {
    return axiosClient.delete(`/StaffProfile/${id}`);
  },

  // [GET] Lấy danh sách nhân viên khả dụng (rảnh)
  // params bao gồm: date, startTime, serviceIds (mảng), wardId
  getAvailable: (params) => {
    return axiosClient.get('/StaffProfile/available', { 
      params, 
      // paramsSerializer giúp biến mảng [1,2] thành ?serviceIds=1&serviceIds=2 
      // thay vì ?serviceIds[0]=1&serviceIds[1]=2 để C# đọc được
      paramsSerializer: { indexes: null } 
    });
  }
};

export default staffApi;
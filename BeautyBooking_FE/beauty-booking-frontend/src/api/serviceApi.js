import axiosClient from './axiosClient';
import { cleanParams } from '../utils/apiHelper';

const serviceApi = {
  // [GET] Lấy danh sách dịch vụ
  getAll: (params) => {
    return axiosClient.get('/BeautyService', { params: cleanParams(params) });
  },

  // [GET] Lấy chi tiết dịch vụ
  getById: (id) => {
    return axiosClient.get(`/BeautyService/${id}`);
  },

  // [GET] Lấy dịch vụ theo StaffId
  getByStaffId: (staffId) => {
    return axiosClient.get(`/BeautyService/staff/${staffId}`);
  },

  // [POST] Thêm mới dịch vụ
  create: (formData) => {
    return axiosClient.post('/BeautyService', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  // [PUT] Cập nhật dịch vụ
  update: (id, formData) => {
    return axiosClient.put(`/BeautyService/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  // [PATCH] Cập nhật trạng thái dịch vụ (Thêm mới theo Controller)
  updateStatus: (id, isActive) => {
    return axiosClient.patch(`/BeautyService/${id}/status`, null, {
      params: { isActive } // Truyền param lên URL (FromQuery)
    });
  },

  // [DELETE] Xóa dịch vụ
  delete: (id) => {
    return axiosClient.delete(`/BeautyService/${id}`);
  },

  // [POST] Tính tổng tiền
  calculateTotal: (serviceIds) => {
    return axiosClient.post('/BeautyService/calculate-total', serviceIds);
  }
};

export default serviceApi;
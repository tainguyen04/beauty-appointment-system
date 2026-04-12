import axiosClient from './axiosClient';
import { cleanParams } from '../utils/apiHelper';

const staffDayOffApi = {
  // Lấy tất cả danh sách (Admin dùng để xem toàn bộ, Staff dùng xem lịch chung)
  // Có thể truyền params: { pageNumber, pageSize, status, Keyword... }
  getAllWithStaff: (params) => {
    return axiosClient.get('/StaffDayOff', { params: cleanParams(params) });
  },

  // Tạo đơn xin nghỉ mới (Staff Only)
  create: (data) => {
    return axiosClient.post('/StaffDayOff', data);
  },

  // Phê duyệt đơn nghỉ (Admin Only)
  approve: (id) => {
    return axiosClient.post(`/StaffDayOff/${id}/approve`);
  },

  // Từ chối đơn nghỉ (Admin Only)
  reject: (id) => {
    return axiosClient.post(`/StaffDayOff/${id}/reject`);
  },

  // Hủy đơn nghỉ (Staff tự hủy đơn của mình)
  cancel: (id) => {
    return axiosClient.post(`/StaffDayOff/${id}/cancel`);
  },

  // Lấy chi tiết một đơn nghỉ
  getById: (id) => {
    return axiosClient.get(`/StaffDayOff/${id}`);
  },
  //Xóa đơn nghỉ (Chỉ Admin mới có quyền xóa)
  delete: (id) => {
    return axiosClient.delete(`/StaffDayOff/${id}`);
  },
};

export default staffDayOffApi;
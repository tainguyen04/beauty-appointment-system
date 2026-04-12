import axiosClient from './axiosClient'; // Đảm bảo đường dẫn này đúng với project của bạn
import { cleanParams } from '../utils/apiHelper'; // Hàm này giúp loại bỏ các tham số không cần thiết

const workScheduleApi = {
  // Lấy tất cả lịch làm việc (dành cho Admin/Staff có filter)
  getAll: (params) => {
    const cleanedParams = cleanParams(params);
    return axiosClient.get('/WorkSchedule', { params: cleanedParams });
  },

  // Lấy chi tiết lịch theo ID
  getById: (id) => {
    return axiosClient.get(`/WorkSchedule/${id}`);
  },

  // Admin tạo lịch làm việc
  create: (data) => {
    return axiosClient.post('/WorkSchedule', data);
  },

  // Admin cập nhật lịch làm việc
  update: (id, data) => {
    return axiosClient.put(`/WorkSchedule/${id}`, data);
  },

  // Admin xóa lịch làm việc
  delete: (id) => {
    return axiosClient.delete(`/WorkSchedule/${id}`);
  },

  // Staff lấy lịch của chính mình
  getMySchedule: () => {
    return axiosClient.get('/WorkSchedule/me');
  },

  // Staff lấy lịch của mình theo ngày trong tuần (0-6)
  getMyScheduleByDay: (dayOfWeek) => {
    return axiosClient.get(`/WorkSchedule/me/schedule/${dayOfWeek}`);
  },

  // Admin lấy lịch theo ngày trong tuần
  getByDayOfWeek: (dayOfWeek) => {
    return axiosClient.get(`/WorkSchedule/day/${dayOfWeek}`);
  },

  // Admin lấy lịch theo ID nhân viên
  getByStaffId: (staffId) => {
    return axiosClient.get(`/WorkSchedule/staff/${staffId}`);
  }
};

export default workScheduleApi;
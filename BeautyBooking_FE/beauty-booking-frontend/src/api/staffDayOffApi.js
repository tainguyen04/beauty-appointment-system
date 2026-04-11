import axiosClient from './axiosClient';

const staffDayOffApi = {
  // Lấy tất cả danh sách (Admin dùng để xem toàn bộ, Staff dùng xem lịch chung)
  // Có thể truyền params: { pageNumber, pageSize, status, Keyword... }
  getAllWithStaff: (params) => {
    return axiosClient.get('/StaffDayOff', { params });
  },

  // Lấy danh sách các đơn đang chờ duyệt (Dành cho thông báo hoặc tab chờ xử lý)
  getPending: () => {
    return axiosClient.get('/StaffDayOff/pending');
  },

  // Lấy danh sách theo tháng (Dùng cho giao diện Calendar)
  getByMonth: (month, year, status) => {
    return axiosClient.get('/StaffDayOff/month', {
      params: { month, year, status }
    });
  },

  // Lấy lịch sử nghỉ phép của chính mình (Dành cho Staff)
  getMyHistory: (status) => {
    return axiosClient.get('/StaffDayOff/my-history', {
      params: { status }
    });
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
  }
};

export default staffDayOffApi;
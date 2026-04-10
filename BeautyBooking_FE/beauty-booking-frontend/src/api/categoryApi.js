import axiosClient from './axiosClient';

const categoryApi = {
  // GET /api/Category
  getAll: (params) => {
    return axiosClient.get('/Category', { params });
  },
  // Các hàm khác nếu bạn muốn làm trang Quản lý Danh mục sau này
  create: (data) => axiosClient.post('/Category', data),
  getById: (id) => axiosClient.get(`/Category/${id}`),
  update: (id, data) => axiosClient.put(`/Category/${id}`, data),
  delete: (id) => axiosClient.delete(`/Category/${id}`),
};

export default categoryApi;
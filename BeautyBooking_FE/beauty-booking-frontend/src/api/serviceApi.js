import axiosClient from './axiosClient';
import { cleanParams } from '../utils/apiHelper';

const serviceApi = {
  // GET /api/BeautyService
  getAll: (params) => {
    return axiosClient.get('/BeautyService', { params: cleanParams(params) });
  },

  // POST /api/BeautyService
  create: (formData) => {
    return axiosClient.post('/BeautyService', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  // GET /api/BeautyService/{id}
  getById: (id) => {
    return axiosClient.get(`/BeautyService/${id}`);
  },

  // PUT /api/BeautyService/{id}
  update: (id, formData) => {
    return axiosClient.put(`/BeautyService/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  // DELETE /api/BeautyService/{id}
  delete: (id) => {
    return axiosClient.delete(`/BeautyService/${id}`);
  },

  // GET /api/BeautyService/staff/{staffId}
  getByStaffId: (staffId) => {
    return axiosClient.get(`/BeautyService/staff/${staffId}`);
  },

  // GET /api/BeautyService/category/{categoryId}
  getByCategoryId: (categoryId) => {
    return axiosClient.get(`/BeautyService/category/${categoryId}`);
  },

  // POST /api/BeautyService/calculate-total
  calculateTotal: (data) => {
    return axiosClient.post('/BeautyService/calculate-total', data);
  }
};

export default serviceApi;
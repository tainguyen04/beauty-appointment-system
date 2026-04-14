import axiosClient from './axiosClient';
import { cleanParams } from '../utils/apiHelper';

const staffApi = {
  getAll: (params) => axiosClient.get('/StaffProfile', { params: cleanParams(params) }),
  
  getById: (id) => axiosClient.get(`/StaffProfile/${id}`),

  // Cả Create và Update đều dùng FormData
  create: (formData) => axiosClient.post('/StaffProfile', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),

  update: (id, formData) => axiosClient.put(`/StaffProfile/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),

  delete: (id) => axiosClient.delete(`/StaffProfile/${id}`),
  
  // Các API bổ trợ
  getAvailable: (params) => {
    return axiosClient.get('/StaffProfile/available', { 
      params, 
      paramsSerializer: { indexes: null } 
    });
  },
  getByService: (serviceId) => axiosClient.get(`/StaffProfile/service/${serviceId}`),
  // Thêm hàm này vào object staffApi
  assignServices: (id, serviceIds) => {
  // request body thường là { serviceIds: [1, 2, 3] } dựa theo AssignServicesRequest của bạn
  return axiosClient.post(`/StaffProfile/${id}/services`, { serviceIds });
},
};

export default staffApi;
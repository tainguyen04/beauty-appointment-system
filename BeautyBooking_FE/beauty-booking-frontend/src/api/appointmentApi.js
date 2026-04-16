import axiosClient from './axiosClient';
import { cleanParams } from '../utils/apiHelper';

const appointmentApi = {
  // GET: /api/Appointment
  // Dùng chung cho Admin/Staff/Customer. 
  // Để lấy lịch của riêng ai đó, truyền { customerId: 123 } hoặc { staffId: 456, wardId: 7 } vào params
  getAll: (params) => {
    const cleaned = cleanParams(params);
    return axiosClient.get('/Appointment', { params: cleaned });
  },

  // GET: /api/Appointment/{id}
  // Trả về chi tiết Appointment (bao gồm cả wardId, wardName, details...)
  getById: (id) => {
    return axiosClient.get(`/Appointment/${id}`);
  },

  // POST: /api/Appointment 
  // [Authorize(Policy = "CustomerOrAdmin")] - Gộp chung lại không chia ra url admin/customer nữa
  create: (data) => {
    return axiosClient.post('/Appointment', data);
  },

  // PUT: /api/Appointment/admin/{id}
  // [Authorize(Policy = "AdminOnly")]
  update: (id, data) => {
    return axiosClient.put(`/Appointment/admin/${id}`, data);
  },

  // PATCH: /api/Appointment/{id}/status
  // Nhận vào 1 Enum/Int trực tiếp làm Body
  updateStatus: (id, status) => {
    return axiosClient.patch(`/Appointment/${id}/status`, status, {
      headers: { 'Content-Type': 'application/json' }
    });
  },

  // DELETE: /api/Appointment/{id}
  // [Authorize(Policy = "AdminOnly")]
  delete: (id) => {
    return axiosClient.delete(`/Appointment/${id}`);
  }
};

export default appointmentApi;
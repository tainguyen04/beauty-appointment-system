// src/api/appointmentApi.js
import axiosClient from './axiosClient'; // Giả định bạn đang dùng file config axios này
import { cleanParams } from '../utils/apiHelper';

const appointmentApi = {
  // GET: /api/Appointment?pageNumber=1&pageSize=10&... (Dùng cho Admin/Staff/Customer với các filter khác nhau)
  getAll: (params) => {
    const cleaned = cleanParams(params);
    return axiosClient.get('/api/Appointment', { params: cleaned });
  },

  // GET: /api/Appointment/{id}
  getById: (id) => {
    return axiosClient.get(`/api/Appointment/${id}`);
  },
  // GetMySchedule: /api/Appointment/my-schedule?staffId=123&date=2024-07-01 (Dành cho Staff)
  getMySchedule: (params) => {
    const cleaned = cleanParams(params);
    return axiosClient.get('/api/Appointment/my-schedule', { params: cleaned });
  },
  // GET: /api/Appointment/my-bookings?customerId=123&pageNumber=1&pageSize=10 (Dành cho Customer)
  getMyAppointments: (params) => {
    const cleaned = cleanParams(params);
    return axiosClient.get('/api/Appointment/my-bookings', { params: cleaned });
  },

  // POST: /api/Appointment/admin
  createByAdmin: (data) => {
    return axiosClient.post('/api/Appointment/admin', data);
  },
  // POST: /api/Appointment/customer
    createByCustomer: (data) => {
    return axiosClient.post('/api/Appointment/customer', data);
    },

  // PUT: /api/Appointment/admin/{id}
  update: (id, data) => {
    return axiosClient.put(`/api/Appointment/admin/${id}`, data);
  },

  // PATCH: /api/Appointment/{id}/status (Dành cho Admin)
  // Lưu ý: C# nhận [FromBody] AppointmentStatus (Enum), ta gửi thẳng giá trị lên
  updateStatus: (id, status) => {
    return axiosClient.patch(`/api/Appointment/${id}/status`, status, {
      headers: { 'Content-Type': 'application/json' }
    });
  },
  //PATCH: /api/Appointment/{id}/status/staff (Dành cho Staff)
  updateStatusByStaff: (id, status) => {
    return axiosClient.patch(`/api/Appointment/${id}/status/staff`, status, {
      headers: { 'Content-Type': 'application/json' }
    });
  },

  // DELETE: /api/Appointment/{id}
  delete: (id) => {
    return axiosClient.delete(`/api/Appointment/${id}`);
  },
  //DELETE: /api/Appointment/customer/{id} (Dành cho Customer)
  cancelByCustomer: (id) => {
    return axiosClient.delete(`/api/Appointment/${id}/cancel`);
  }
};

export default appointmentApi;
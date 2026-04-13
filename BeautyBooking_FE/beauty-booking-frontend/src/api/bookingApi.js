// src/api/bookingApi.js
import axiosClient from './axiosClient'; // Giả định bạn đang dùng file config axios này
import { cleanParams } from '../utils/apiHelper';

const bookingApi = {
  // GET: /api/Booking?pageNumber=1&pageSize=10&... (Dùng cho Admin/Staff)
  getAll: (params) => {
    const cleaned = cleanParams(params);
    return axiosClient.get('/api/Booking', { params: cleaned });
  },

  // GET: /api/Booking/{id}
  getById: (id) => {
    return axiosClient.get(`/api/Booking/${id}`);
  },
  // GetMySchedule: /api/Booking/my-schedule?staffId=123&date=2024-07-01 (Dành cho Staff)
  getMySchedule: (params) => {
    const cleaned = cleanParams(params);
    return axiosClient.get('/api/Booking/my-schedule', { params: cleaned });
  },
  // GET: /api/Booking/my-bookings?customerId=123&pageNumber=1&pageSize=10 (Dành cho Customer)
  getMyAppointments: (params) => {
    const cleaned = cleanParams(params);
    return axiosClient.get('/api/Booking/my-bookings', { params: cleaned });
  },

  // POST: /api/Booking/admin
  createByAdmin: (data) => {
    return axiosClient.post('/api/Booking/admin', data);
  },
  // POST: /api/Booking/customer
    createByCustomer: (data) => {
    return axiosClient.post('/api/Booking/customer', data);
    },

  // PUT: /api/Booking/admin/{id}
  update: (id, data) => {
    return axiosClient.put(`/api/Booking/admin/${id}`, data);
  },

  // PATCH: /api/Booking/{id}/status (Dành cho Admin)
  // Lưu ý: C# nhận [FromBody] AppointmentStatus (Enum), ta gửi thẳng giá trị lên
  updateStatus: (id, status) => {
    return axiosClient.patch(`/api/Booking/${id}/status`, status, {
      headers: { 'Content-Type': 'application/json' }
    });
  },
  //PATCH: /api/Booking/{id}/status/staff (Dành cho Staff)
  updateStatusByStaff: (id, status) => {
    return axiosClient.patch(`/api/Booking/${id}/status/staff`, status, {
      headers: { 'Content-Type': 'application/json' }
    });
  },

  // DELETE: /api/Booking/{id}
  delete: (id) => {
    return axiosClient.delete(`/api/Booking/${id}`);
  },
  //DELETE: /api/Booking/customer/{id} (Dành cho Customer)
  cancelByCustomer: (id) => {
    return axiosClient.delete(`/api/Booking/${id}/cancel`);
  }
};

export default bookingApi;
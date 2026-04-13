import axiosClient from './axiosClient'; // Giả định bạn đang dùng file config axios này
import { cleanParams } from '../utils/apiHelper'; // Hàm này sẽ loại bỏ các trường có giá trị null hoặc undefined khỏi params

const appointmentApi = {
  // GET: /Appointment?pageNumber=1&pageSize=10&... (Dùng cho Admin/Staff/Customer với các filter khác nhau)
  getAll: (params) => {
    const cleaned = cleanParams(params);
    return axiosClient.get('/Appointment', { params: cleaned });
  },

  // GET: /Appointment/{id}
  getById: (id) => {
    return axiosClient.get(`/Appointment/${id}`);
  },
  // GetMySchedule: /Appointment/my-schedule?staffId=123&date=2024-07-01 (Dành cho Staff)
  getMySchedule: (params) => {
    const cleaned = cleanParams(params);
    return axiosClient.get('/Appointment/my-schedule', { params: cleaned });
  },
  // GET: /Appointment/my-bookings?customerId=123&pageNumber=1&pageSize=10 (Dành cho Customer)
  getMyAppointments: (params) => {
    const cleaned = cleanParams(params);
    return axiosClient.get('/Appointment/my-bookings', { params: cleaned });
  },

  // POST: /Appointment/admin
  createByAdmin: (data) => {
    return axiosClient.post('/Appointment/admin', data);
  },
  // POST: /Appointment/customer
    createByCustomer: (data) => {
    return axiosClient.post('/Appointment/customer', data);
    },

  // PUT: /Appointment/admin/{id}
  update: (id, data) => {
    return axiosClient.put(`/Appointment/admin/${id}`, data);
  },

  // PATCH: /Appointment/{id}/status (Dành cho Admin)
  // Lưu ý: C# nhận [FromBody] AppointmentStatus (Enum), ta gửi thẳng giá trị lên
  updateStatus: (id, status) => {
    return axiosClient.patch(`/Appointment/${id}/status`, status, {
      headers: { 'Content-Type': 'application/json' }
    });
  },
  //PATCH: /Appointment/{id}/status/staff (Dành cho Staff)
  updateStatusByStaff: (id, status) => {
    return axiosClient.patch(`/Appointment/${id}/status/staff`, status, {
      headers: { 'Content-Type': 'application/json' }
    });
  },

  // DELETE: /Appointment/{id}
  delete: (id) => {
    return axiosClient.delete(`/Appointment/${id}`);
  },
  //DELETE: /Appointment/customer/{id} (Dành cho Customer)
  cancelByCustomer: (id) => {
    return axiosClient.delete(`/Appointment/${id}/cancel`);
  }
};

export default appointmentApi;
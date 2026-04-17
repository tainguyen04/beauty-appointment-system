import axiosClient from './axiosClient';
const dashboardApi = {
  //GET: /api/Dashboard/summary
  //Dùng chung cho Admin/Staff. Trả về các số liệu thống kê tổng quan như: tổng số khách hàng, số lịch hẹn hôm nay, doanh thu trong ngày...
  getSummary: () => {
    return axiosClient.get('/Dashboard/summary');
  },
  //GET: /api/Dashboard/upcoming-appointments
  //Dùng chung cho Admin/Staff. Trả về danh sách các lịch hẹn sắp tới (ví dụ trong 7 ngày tới) để hiển thị trên Dashboard.
  getUpcomingAppointments: () => {
    return axiosClient.get('/Dashboard/upcoming-appointments');
  }
};

export default dashboardApi;
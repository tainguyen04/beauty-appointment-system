/**
 * Hàm làm sạch params trước khi gửi lên Server
 * - Loại bỏ null, undefined, chuỗi rỗng
 * - Format ngày tháng nếu là đối tượng Dayjs
 * - Trim khoảng trắng cho chuỗi
 */
export const cleanParams = (params) => {
  if (!params || typeof params !== 'object') return {};

  return Object.fromEntries(
    Object.entries(params)
      .map(([key, value]) => {
        // 1. Trim chuỗi
        if (typeof value === 'string') return [key, value.trim()];
        
        // 2. Format Dayjs (Ant Design)
        if (value && typeof value.format === 'function') {
          return [key, value.format('YYYY-MM-DD')];
        }

        return [key, value];
      })
      .filter(([key, value]) => 
        // Loại bỏ các giá trị rác
        value !== undefined && 
        value !== null && 
        value !== "" &&
        // Quan trọng: Loại bỏ giá trị "All" (vì BE không hiểu status này)
        !(key === 'Status' && value === 'All') && 
        // Loại bỏ mảng rỗng
        !(Array.isArray(value) && value.length === 0)
      )
  );
};
// Hàm này tương tự cleanParams nhưng sẽ giữ lại các giá trị null/undefined/empty để phục vụ logic riêng (ví dụ: filter status = null để lấy các booking chưa xác định trạng thái)
export const cleanParamsForLogic = (params) => {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) =>
      value !== undefined &&
      value !== null &&
      value !== ""
    )
  );
};

/**
 * Chuyển đổi từ tổng số phút (int) sang chuỗi "HH:mm"
 * Ví dụ: 540 -> "09:00"
 */
export const convertMinutesToTimeStr = (totalMinutes) => {
  if (totalMinutes === null || totalMinutes === undefined) return '';
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

/**
 * Chuyển đổi từ Dayjs object sang tổng số phút
 * Ví dụ: 09:15 -> 555
 */
export const convertDayjsToMinutes = (dayjsObj) => {
  if (!dayjsObj) return 0;
  return dayjsObj.hour() * 60 + dayjsObj.minute();
};

/**
 * Danh sách các ngày trong tuần khớp với Enum của Backend
 */
export const DAYS_OF_WEEK = [
  { value: 'Monday', label: 'Thứ Hai', color: 'blue' },
  { value: 'Tuesday', label: 'Thứ Ba', color: 'cyan' },
  { value: 'Wednesday', label: 'Thứ Tư', color: 'geekblue' },
  { value: 'Thursday', label: 'Thứ Năm', color: 'purple' },
  { value: 'Friday', label: 'Thứ Sáu', color: 'magenta' },
  { value: 'Saturday', label: 'Thứ Bảy', color: 'orange' },
  { value: 'Sunday', label: 'Chủ Nhật', color: 'volcano' },
];
// Danh sách các vai trò người dùng khớp với Enum của Backend
export const USER_ROLE = [
  { value: 'Admin', label: 'Quản trị viên', color: 'volcano' },
  { value: 'Staff', label: 'Nhân viên', color: 'blue' },
  { value: 'Customer', label: 'Khách hàng', color: 'green' },
];

export const getRoleConfig = (role) =>
  USER_ROLE.find(r => r.value === role) || {
    label: role,
    color: 'default'
  };


/**
 * Danh sách các trạng thái cuộc hẹn khớp với Enum của Backend
 */
export const APPOINTMENT_STATUS = [
  { value: 'Pending', label: 'Chờ xử lý', color: 'warning' },
  { value: 'Confirmed', label: 'Đã xác nhận', color: 'processing' },
  { value: 'Completed', label: 'Hoàn thành', color: 'success' },
  { value: 'Cancelled', label: 'Đã hủy', color: 'error' },
];
/**
 * Hàm lấy config (label, color) cho trạng thái cuộc hẹn, dùng trong nhiều component để đảm bảo nhất quán
 */
export const getStatusConfig = (status) =>
  APPOINTMENT_STATUS.find(s => s.value === status) || {
    label: status,
    color: 'default'
  };
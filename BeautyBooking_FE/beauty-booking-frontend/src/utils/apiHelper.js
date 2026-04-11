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
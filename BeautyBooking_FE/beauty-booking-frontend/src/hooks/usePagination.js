import { useState, useCallback } from 'react';

// fetchFunction: Hàm gọi API từ service (ví dụ: serviceApi.getAll)
// initialPageSize: Số lượng dòng mặc định trên mỗi trang
export const usePagination = (fetchFunction, initialPageSize = 10) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: initialPageSize,
    total: 0,
  });

  // Hàm thực thi việc gọi dữ liệu
  const runFetch = useCallback(async (page = 1, pageSize = initialPageSize) => {
    setLoading(true);
    try {
      // Ở đây bạn dùng pageNumber hoặc page tùy theo Backend yêu cầu
      const res = await fetchFunction({ pageNumber: page, pageSize });

      if (res && res.items) {
        setData(res.items);
        setPagination({
          current: page,
          pageSize: pageSize,
          total: res.totalCount || 0,
        });
      }
    } catch (error) {
      console.error("Pagination Hook Error:", error);
    } finally {
      setLoading(false);
    }
  }, [fetchFunction, initialPageSize]);

  // Hàm bắt sự kiện thay đổi trên Ant Design Table
  const handleTableChange = (newPagination) => {
    runFetch(newPagination.current, newPagination.pageSize);
  };

  return {
    data,
    loading,
    pagination,
    runFetch,
    handleTableChange,
    setData
  };
};
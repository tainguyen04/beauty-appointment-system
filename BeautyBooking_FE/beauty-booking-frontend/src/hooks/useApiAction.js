import { useState } from 'react';
import { message } from 'antd';

export const useApiAction = () => {
  const [actionLoading, setActionLoading] = useState(false);

  // Hàm execute sẽ nhận vào 1 hàm gọi API (promise) và các câu thông báo
  const execute = async (apiCallFunction, successMessage = 'Thành công!', errorMessage = 'Thao tác thất bại!') => {
    setActionLoading(true);
    try {
      const result = await apiCallFunction();
      if (successMessage) {
        message.success(successMessage);
      }
      return { success: true, data: result }; // Trả về success: true để component biết mà đóng Modal
    } catch (error) {
      console.error(error);
      if (errorMessage) {
        message.error(errorMessage);
      }
      return { success: false, error };
    } finally {
      setActionLoading(false);
    }
  };

  return {
    actionLoading,
    execute,
  };
};
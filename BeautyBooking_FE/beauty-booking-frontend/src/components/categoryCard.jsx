import React from 'react';
import { Typography } from 'antd';
import { AppstoreOutlined } from '@ant-design/icons';

const { Text } = Typography;

const CategoryCard = ({ 
  name, 
  isActive, 
  onClick, 
  isAll = false 
}) => {
  const colorActive = '#eb2f96'; // Màu hồng đậm khi được chọn
  const colorInactive = '#555';  // Màu xám khi chưa chọn

  // 1. Nút "Tất cả"
  if (isAll) {
    return (
      <div 
        onClick={onClick} 
        style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}
      >
        <div style={{
          width: '60px', height: '60px', borderRadius: '50%',
          background: isActive ? '#fff0f6' : '#f5f5f5',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: isActive ? `2px solid ${colorActive}` : '2px solid transparent',
          transition: 'all 0.3s ease'
        }}>
          <AppstoreOutlined style={{ fontSize: '24px', color: isActive ? colorActive : colorInactive }} />
        </div>
        <Text style={{ 
          color: isActive ? colorActive : colorInactive, 
          fontWeight: isActive ? 600 : 400, 
          fontSize: '13px', textAlign: 'center' 
        }}>
          {name}
        </Text>
      </div>
    );
  }

  // 2. Các danh mục từ API
  const firstLetter = name ? name.charAt(0).toUpperCase() : '✨';

  return (
    <div 
      onClick={onClick} 
      style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}
    >
      <div style={{
        width: '60px', height: '60px', borderRadius: '50%',
        background: isActive ? '#fff0f6' : '#f9f9f9',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: isActive ? `2px solid ${colorActive}` : '2px solid transparent',
        transition: 'all 0.3s ease',
        color: isActive ? colorActive : colorInactive,
        fontSize: '22px', fontWeight: 'bold'
      }}>
        {firstLetter}
      </div>
      <Text style={{ 
        color: isActive ? colorActive : colorInactive, 
        fontWeight: isActive ? 600 : 400, 
        fontSize: '13px', 
        textAlign: 'center',
        lineHeight: '1.4',
        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
      }}>
        {name}
      </Text>
    </div>
  );
};

export default CategoryCard;
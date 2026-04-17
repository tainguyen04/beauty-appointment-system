import React from 'react';
import { Typography } from 'antd';
import { AppstoreOutlined } from '@ant-design/icons';

const { Text } = Typography;

const CategoryCard = ({ 
  name, 
  isActive, 
  onClick, 
  icon, 
  imageUrl, 
  isAll = false 
}) => {
  // Giao diện đặc biệt cho nút "Tất cả"
  if (isAll) {
    return (
      <div 
        onClick={onClick}
        style={{
          width: '100%', // Dàn đều trong ô lưới
          height: '100%', // Các card bằng chiều cao nhau
          padding: '16px',
          borderRadius: '16px',
          background: isActive ? '#111' : '#f5f5f5',
          color: isActive ? '#fff' : '#333',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s ease',
          border: isActive ? '2px solid #111' : '2px solid transparent',
        }}
      >
        <AppstoreOutlined style={{ fontSize: '28px', marginBottom: '8px' }} />
        <Text style={{ color: 'inherit', fontWeight: 600, textAlign: 'center' }}>{name}</Text>
      </div>
    );
  }

  // Giao diện cho các danh mục bình thường từ API
  const bgGradient = `linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)`; 

  return (
    <div 
      onClick={onClick}
      style={{
        width: '100%',
        height: '100%',
        padding: '16px',
        borderRadius: '16px',
        background: isActive ? '#fff0f6' : bgGradient,
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.3s ease',
        border: isActive ? '2px solid #ff85c0' : '2px solid transparent',
        boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
      }}
    >
      <div style={{ 
        width: '50px', 
        height: '50px', 
        borderRadius: '50%', 
        background: isActive ? '#ffadd2' : '#e6f7ff', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        marginBottom: '10px',
        fontSize: '20px',
        overflow: 'hidden'
      }}>
        {imageUrl ? (
          <img src={imageUrl} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          icon || '✨'
        )}
      </div>
      <Text style={{ 
        color: isActive ? '#eb2f96' : '#333', 
        fontWeight: isActive ? 700 : 500,
        textAlign: 'center',
        fontSize: '14px'
      }}>
        {name}
      </Text>
    </div>
  );
};

export default CategoryCard;
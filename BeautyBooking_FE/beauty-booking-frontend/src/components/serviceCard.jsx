import React from 'react';
import { Card, Button, Typography, Tag, Space } from 'antd';
import { ClockCircleOutlined, ArrowRightOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const ServiceCard = ({ service, onBookNow }) => {
  // Ảnh dự phòng khi ảnh từ Server bị lỗi hoặc không tồn tại
  const fallbackImage = "https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=500";

  return (
    <Card
      hoverable
      style={{ 
        borderRadius: 24, 
        overflow: 'hidden', 
        border: 'none', 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 10px 20px rgba(0,0,0,0.04)',
      }}
      bodyStyle={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}
      cover={
        <div style={{ height: 200, overflow: 'hidden', background: '#f5f5f5', position: 'relative' }}>
          <img
            alt={service.name}
            src={service.imageUrl || fallbackImage}
            onError={(e) => { e.target.src = fallbackImage }}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          {service.categoryName && (
            <Tag style={{ 
              position: 'absolute', top: 12, left: 12, borderRadius: '20px', 
              border: 'none', background: 'rgba(255, 255, 255, 0.9)', 
              color: '#eb2f96', fontWeight: 600, padding: '2px 12px' 
            }}>
              {service.categoryName}
            </Tag>
          )}
        </div>
      }
    >
      <div style={{ flex: 1 }}>
        <Title 
          level={5} 
          style={{ 
            margin: '0 0 10px 0', 
            fontSize: '17px', 
            fontWeight: 700,
            height: '48px', // Giữ các card đều nhau
          }} 
          ellipsis={{ rows: 2 }}
        >
          {service.name}
        </Title>

        <Space style={{ color: '#8c8c8c', fontSize: '14px', marginBottom: '20px' }}>
          <ClockCircleOutlined style={{ color: '#eb2f96' }} />
          <span>{service.duration || 60} phút</span>
        </Space>
      </div>

      <div style={{ 
        marginTop: 'auto', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        paddingTop: '16px', 
        borderTop: '1px solid #f5f5f5' 
      }}>
        <div>
          <div style={{ fontSize: '11px', color: '#bfbfbf', textTransform: 'uppercase' }}>Giá liệu trình</div>
          <Text style={{ fontSize: '19px', fontWeight: '800', color: '#eb2f96' }}>
            {service.price ? `${service.price.toLocaleString('vi-VN')}đ` : 'Liên hệ'}
          </Text>
        </div>

        {/* Nút chỉ có Icon, tuyệt đối không có text */}
        <Button 
          type="primary" 
          shape="circle" 
          icon={<ArrowRightOutlined />} 
          onClick={() => onBookNow(service)}
          style={{ 
            background: '#eb2f96', 
            borderColor: '#eb2f96', 
            width: '45px', 
            height: '45px',
            boxShadow: '0 4px 12px rgba(235, 47, 150, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        />
      </div>
    </Card>
  );
};

export default ServiceCard;
import React from 'react';
import { Card, Button, Typography, Tag, Space } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const ServiceCard = ({ service, onBookNow }) => {
  // Ảnh mặc định nếu Backend trả về imageUrl: null
  const fallbackImage = "https://images.unsplash.com/photo-1544161515-4ae6ce6ea858?w=500";

  return (
    <Card
      hoverable
      style={{ 
        borderRadius: 16, 
        overflow: 'hidden', 
        border: '1px solid #f0f0f0',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
      }}
      cover={
        <div style={{ position: 'relative' }}>
          <img
            alt={service.name}
            src={service.imageUrl || fallbackImage}
            style={{ height: 200, width: '100%', objectFit: 'cover' }}
          />
          {/* Tag Category góc trái ảnh */}
          {service.categoryName && (
            <Tag color="magenta" style={{ position: 'absolute', top: 12, left: 12, borderRadius: 4, border: 'none', background: 'rgba(255, 255, 255, 0.9)', color: '#eb2f96', fontWeight: 500 }}>
              {service.categoryName}
            </Tag>
          )}
        </div>
      }
      bodyStyle={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}
    >
      <div style={{ flex: 1 }}>
        <div style={{ marginBottom: '8px' }}>
          <Title level={5} style={{ margin: 0, fontSize: '16px', fontWeight: 600, lineHeight: '1.4' }} ellipsis={{ rows: 2 }}>
            {service.name}
          </Title>
        </div>

        {/* Chỉ hiển thị Thời lượng thực tế từ BE, đã xóa phần Đánh giá */}
        <Space style={{ color: '#888', fontSize: '13px', marginBottom: '16px' }}>
          <ClockCircleOutlined />
          <span>{service.duration ? `${service.duration} phút` : 'Chưa cập nhật'}</span>
        </Space>
      </div>

      <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f5f5f5', paddingTop: '16px' }}>
        <div>
          <Text style={{ fontSize: '18px', fontWeight: '700', color: '#111' }}>
            {service.price ? `${service.price.toLocaleString('vi-VN')}đ` : 'Liên hệ'}
          </Text>
        </div>
        <Button 
          type="primary" 
          shape="round" 
          onClick={() => onBookNow(service)}
          style={{ background: '#111', borderColor: '#111', fontWeight: 500 }}
        >
          Đặt lịch
        </Button>
      </div>
    </Card>
  );
};

export default ServiceCard;
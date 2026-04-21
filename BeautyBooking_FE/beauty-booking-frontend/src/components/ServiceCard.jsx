import React from 'react';
import { Card, Typography, Tag, Space,Button } from 'antd';
import { ClockCircleOutlined, CheckCircleFilled,EyeOutlined  } from '@ant-design/icons';

const { Title, Text } = Typography;

const ServiceCard = ({ service, isSelected, onSelect, onViewDetail }) => {
  const fallbackImage = "https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=500";

  return (
    <Card
      hoverable
      // Khi click vào bất kỳ đâu trên Card đều sẽ chọn/bỏ chọn
      onClick={() => onSelect(service)}
      style={{ 
        borderRadius: 24, 
        overflow: 'hidden', 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        // Đổi màu viền khi được chọn
        border: isSelected ? '2px solid #eb2f96' : '2px solid transparent',
        boxShadow: isSelected 
          ? '0 10px 25px rgba(235, 47, 150, 0.2)' 
          : '0 10px 20px rgba(0,0,0,0.04)',
        transform: isSelected ? 'translateY(-5px)' : 'none',
      }}
      bodyStyle={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}
      cover={
        <div style={{ height: 200, overflow: 'hidden', background: '#f5f5f5', position: 'relative' }}>
          <img
            alt={service.name}
            src={service.ImageUrl || fallbackImage}
            onError={(e) => { e.target.src = fallbackImage }}
            style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'cover',
                opacity: isSelected ? 0.6 : 1, // Làm mờ ảnh nhẹ khi đã chọn để hiện Icon check
                transition: 'opacity 0.3s'
            }}
          />
          
          {/* Overlay dấu tích khi dịch vụ được chọn */}
          {isSelected && (
            <div style={{ 
              position: 'absolute', 
              top: '50%', 
              left: '50%', 
              transform: 'translate(-50%, -50%)',
              zIndex: 2
            }}>
              <CheckCircleFilled style={{ fontSize: '50px', color: '#eb2f96' }} />
            </div>
          )}

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
            height: '48px',
            color: isSelected ? '#eb2f96' : '#262626' // Đổi màu chữ tiêu đề khi chọn
          }} 
          ellipsis={{ rows: 2 }}
        >
          {service.name}
        </Title>
          {/* 👇 DESCRIPTION */}
          <Text
            style={{
              fontSize: '13px',
              color: '#8c8c8c',
              display: 'block',
              height: '36px'
            }}
            ellipsis={{ rows: 2 }}
          >
            {service.description || 'Không có mô tả'}
          </Text>
        <Space style={{ color: '#8c8c8c', fontSize: '14px', marginBottom: '10px' }}>
          <ClockCircleOutlined style={{ color: isSelected ? '#eb2f96' : '#bfbfbf' }} />
          <span>{service.duration || 60} phút</span>
        </Space>
      </div>

      <div style={{ 
        marginTop: 'auto', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-end',
        paddingTop: '16px', 
        borderTop: '1px solid #f5f5f5' 
      }}>
        <div>
          <div style={{ fontSize: '11px', color: '#bfbfbf', textTransform: 'uppercase'}}>Giá liệu trình</div>
          <Text style={{ fontSize: '19px', fontWeight: '800', color: '#eb2f96' }}>
            {service.price ? `${service.price.toLocaleString('vi-VN')}đ` : 'Liên hệ'}
          </Text>
        </div>
        {/* NÚT XEM CHI TIẾT RIÊNG BIỆT */}
          <Button 
            type="text" 
            icon={<EyeOutlined />} 
            onClick={(e) => {
              e.stopPropagation(); // QUAN TRỌNG: Để không bị dính lệnh onSelect của Card cha
              onViewDetail(); // Gọi hàm mở Modal
            }}
            style={{ color: '#8c8c8c' }}
          >
            Chi tiết
          </Button>
        
        {/* Nút tròn cũ đã xóa để khách click chọn cả Card */}
      </div>
    </Card>
  );
};

export default ServiceCard;
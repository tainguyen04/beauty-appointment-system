import React from 'react';
import { Card, Typography, Tag, Space, Button } from 'antd';
import { CheckCircleFilled, EyeOutlined, EnvironmentOutlined, ToolOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const StaffProfileCard = ({ staff, isSelected, onSelect, onViewDetail }) => {
  // Dùng ảnh mặc định nếu nhân viên chưa cập nhật AvatarUrl
  const fallbackImage = "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=500";

  return (
    <Card
      hoverable
      onClick={() => onSelect(staff)}
      style={{ 
        borderRadius: 24, 
        overflow: 'hidden', 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        border: isSelected ? '2px solid #eb2f96' : '2px solid transparent',
        boxShadow: isSelected 
          ? '0 10px 25px rgba(235, 47, 150, 0.2)' 
          : '0 10px 20px rgba(0,0,0,0.04)',
        transform: isSelected ? 'translateY(-5px)' : 'none',
      }}
      bodyStyle={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}
      cover={
        <div style={{ height: 260, overflow: 'hidden', background: '#f5f5f5', position: 'relative' }}>
          <img
            alt={staff.fullName}
            src={staff.avatarUrl || fallbackImage}
            onError={(e) => { e.target.src = fallbackImage }}
            style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'cover',
                opacity: isSelected ? 0.7 : 1,
                transition: 'opacity 0.3s'
            }}
          />
          
          {isSelected && (
            <div style={{ 
              position: 'absolute', 
              top: '50%', 
              left: '50%', 
              transform: 'translate(-50%, -50%)',
              zIndex: 2
            }}>
              <CheckCircleFilled style={{ fontSize: '55px', color: '#eb2f96' }} />
            </div>
          )}

          {/* Thay thế Role bằng WardName (Khu vực) để khách biết thợ ở đâu */}
          {staff.wardName && (
            <Tag 
              icon={<EnvironmentOutlined />}
              style={{ 
                position: 'absolute', top: 12, left: 12, borderRadius: '20px', 
                border: 'none', background: 'rgba(255, 255, 255, 0.95)', 
                color: '#eb2f96', fontWeight: 600, padding: '4px 14px' 
            }}>
              {staff.wardName}
            </Tag>
          )}
        </div>
      }
    >
      <div style={{ flex: 1 }}>
        <Title 
          level={5} 
          style={{ 
            margin: '0 0 8px 0', 
            fontSize: '18px', 
            fontWeight: 700,
            color: isSelected ? '#eb2f96' : '#262626' 
          }} 
          ellipsis={{ rows: 1 }}
        >
          {staff.fullName}
        </Title>
        
        {/* Lời giới thiệu (Bio) khớp với public string? Bio */}
        <Text
          style={{
            fontSize: '13px',
            color: '#8c8c8c',
            display: 'block',
            height: '40px',
            marginBottom: '12px'
          }}
          ellipsis={{ rows: 2 }}
        >
          {staff.bio || 'Chưa có thông tin giới thiệu.'}
        </Text>
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
          <div style={{ fontSize: '11px', color: '#bfbfbf', textTransform: 'uppercase'}}>Chuyên môn</div>
          <Space style={{ color: '#595959', marginTop: '2px' }}>
            <ToolOutlined style={{ color: '#eb2f96' }} />
            <Text style={{ fontSize: '15px', fontWeight: '700', color: '#595959' }}>
              {/* Hiển thị số lượng dịch vụ thợ có thể làm dựa vào list Services */}
              {staff.services?.length ? `${staff.services.length} dịch vụ` : 'Chưa cập nhật'}
            </Text>
          </Space>
        </div>
        
        <Button 
          type="text" 
          icon={<EyeOutlined />} 
          onClick={(e) => {
            e.stopPropagation();
            onViewDetail(staff);
          }}
          style={{ color: '#eb2f96', fontWeight: 600, background: '#fff0f6', borderRadius: '8px' }}
        >
          Hồ sơ
        </Button>
      </div>
    </Card>
  );
};

export default StaffProfileCard;
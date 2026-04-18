import React, { useState } from 'react';
import { Typography, Space, Input, Button, Tag } from 'antd';
import { SearchOutlined, FireOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const HeroSearch = ({ 
  title = "Eco Beauty", 
  subTitle = "Đánh thức vẻ đẹp tiềm ẩn", 
  categories = [], 
  onSearch, 
  placeholder = "Bạn đang tìm kiếm liệu trình nào?" 
}) => {
  const [searchVal, setSearchVal] = useState('');

  const handleSearchTrigger = (value) => {
    if (onSearch) onSearch(value);
  };

  return (
    <section style={heroSectionStyle}>
      <Space direction="vertical" size={0} style={{ marginBottom: 32 }}>
        <Title level={1} style={mainTitleStyle}>
          {title} <span style={{ color: '#eb2f96' }}>Spa</span>
        </Title>
        <Text style={subTitleStyle}>{subTitle}</Text>
      </Space>

      {/* THANH TÌM KIẾM */}
      <div style={searchWrapperStyle}>
        <Input 
          placeholder={placeholder}
          variant="borderless"
          value={searchVal}
          onChange={(e) => setSearchVal(e.target.value)}
          onPressEnter={() => handleSearchTrigger(searchVal)}
          style={inputSearchStyle}
          suffix={
            <Button 
              type="primary" 
              icon={<SearchOutlined />} 
              style={btnSearchStyle}
              onClick={() => handleSearchTrigger(searchVal)}
            >
              Tìm ngay
            </Button>
          }
        />
      </div>
      
      {/* GỢI Ý TAGS */}
      {categories.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <Space size="middle" wrap align="center">
            <Space style={{ fontSize: '13px', color: '#8c8c8c', fontWeight: 500 }}>
              <FireOutlined style={{ color: '#ff4d4f' }} />
              <span>Gợi ý cho bạn:</span>
            </Space>

            {categories.slice(0, 5).map((cat) => (
              <Tag
                key={cat.id}
                onClick={() => {
                  setSearchVal(cat.name);
                  handleSearchTrigger(cat.name);
                }}
                style={tagStyle}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#eb2f96';
                  e.currentTarget.style.color = '#fff';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.6)';
                  e.currentTarget.style.color = '#eb2f96';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {cat.name}
              </Tag>
            ))}
          </Space>
        </div>
      )}
    </section>
  );
};

// --- STYLES (Copy từ phần bạn đã viết) ---
const heroSectionStyle = {
  textAlign: 'center',
  padding: '80px 20px',
  background: 'linear-gradient(135deg, #fff5f8 0%, #ffffff 100%)', // Nhẹ nhàng sang trọng
  borderRadius: '0 0 50px 50px',
  marginBottom: '40px'
};

const mainTitleStyle = { fontSize: '48px', marginBottom: 8, fontWeight: 800 };
const subTitleStyle = { fontSize: '18px', color: '#8c8c8c', letterSpacing: '1px' };

const searchWrapperStyle = {
  maxWidth: '700px',
  margin: '0 auto',
  background: '#fff',
  padding: '6px 6px 6px 20px',
  borderRadius: '40px',
  boxShadow: '0 10px 30px rgba(235, 47, 150, 0.1)',
  border: '1px solid #f0f0f0'
};

const inputSearchStyle = { height: '46px', fontSize: '16px' };

const btnSearchStyle = {
  borderRadius: '40px',
  height: '46px',
  padding: '0 28px',
  fontWeight: 600,
  fontSize: '15px',
  background: '#eb2f96'
};

const tagStyle = {
  cursor: 'pointer',
  padding: '4px 15px',
  borderRadius: '20px',
  border: '1px solid #ffadd2',
  background: 'rgba(255, 255, 255, 0.6)',
  color: '#eb2f96',
  fontSize: '13px',
  transition: 'all 0.3s ease',
};

export default HeroSearch;
import React, { useEffect, useState } from 'react';
import { 
  Row, 
  Col, 
  Typography, 
  Input, 
  Spin, 
  Empty, 
  Button, 
  Pagination, 
  Space, 
  ConfigProvider ,
  Tag
} from 'antd';
import { 
  SearchOutlined, 
  RocketOutlined, 
  HeartOutlined, 
  StarOutlined, 
  FireOutlined 
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

// Import APIs
import serviceApi from '../../api/serviceApi';
import categoryApi from '../../api/categoryApi';

// Import Components & Hooks
import ServiceCard from '../../components/ServiceCard';
import { usePagination } from '../../hooks/usePagination';

const { Title, Text, Paragraph } = Typography;

const Home = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [searchVal, setSearchVal] = useState('');

  // 1. Sử dụng Hook phân trang đã viết
  // Khởi tạo với pageSize = 8 (2 hàng x 4 cột trên Desktop)
  const { 
    data: services, 
    loading, 
    pagination, 
    runFetch, 
    handleFilterChange 
  } = usePagination(serviceApi.getAll, 8);


 // Hàm xử lý khi người dùng clicktrên card dịch vụ
  const handleBookNow = (service) => {
  navigate('/booking', { 
    state: { 
      selectedService: service, // Truyền nguyên object service
      autoNext: true            // Cờ để báo hiệu cho trang Booking biết cần nhảy bước
    } 
  });
};
  // 2. Load dữ liệu danh mục ban đầu
  useEffect(() => {
    const loadStaticData = async () => {
      try {
        const res = await categoryApi.getAll();
        setCategories(res.items || res.data || res || []);
      } catch (error) {
        console.error("Lỗi tải danh mục:", error);
      }
    };
    loadStaticData();
    
    // Gọi fetch dịch vụ lần đầu (Trang 1, Filter rỗng)
    runFetch(1, 8, { isActive: true });
  }, [runFetch]);

  // 3. Xử lý logic tìm kiếm
  const onSearch = (value) => {
    handleFilterChange({ Keyword: value, isActive: true });
  };

  // 4. Xử lý đổi danh mục
  const onCategoryChange = (categoryId) => {
    const filter = categoryId === 'all' 
      ? { CategoryId: undefined, isActive: true } 
      : { CategoryId: Number(categoryId), isActive: true };
    handleFilterChange(filter);
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#eb2f96',
          borderRadius: 12,
        },
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        
        {/* ===== PHẦN 1: HERO & THANH TÌM KIẾM SANG TRỌNG ===== */}
        <section style={heroSectionStyle}>
          <Space direction="vertical" size={0} style={{ marginBottom: 32 }}>
            <Title level={1} style={mainTitleStyle}>
              Eco Beauty <span style={{ color: '#eb2f96' }}>Spa</span>
            </Title>
            <Text style={subTitleStyle}>
              Đánh thức vẻ đẹp tiềm ẩn • Trải nghiệm dịch vụ 5 sao
            </Text>
          </Space>

          {/* THANH TÌM KIẾM DẠNG PILL (VIÊN THUỐC) */}
          <div style={searchWrapperStyle}>
            <Input 
              placeholder="Bạn đang tìm kiếm liệu trình nào?" 
              variant="borderless"
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              onPressEnter={() => onSearch(searchVal)}
              style={inputSearchStyle}
              suffix={
                <Button 
                  type="primary" 
                  icon={<SearchOutlined />} 
                  style={btnSearchStyle}
                  onClick={() => onSearch(searchVal)}
                >
                  Tìm ngay
                </Button>
              }
            />
          </div>
          
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
                    onSearch(cat.name);
                  }}
                  style={{
                    cursor: 'pointer',
                    padding: '4px 15px',
                    borderRadius: '20px', // Bo tròn hẳn cho mềm mại
                    border: '1px solid #ffadd2', // Viền hồng rất nhạt
                    background: 'rgba(255, 255, 255, 0.6)', // Trắng trong suốt để thấy nền gradient phía dưới
                    color: '#eb2f96',
                    fontSize: '13px',
                    transition: 'all 0.3s ease',
                    margin: '4px 0',
                  }}
                  // Hiệu ứng khi rê chuột vào
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
        </section>

        {/* ===== PHẦN 2: DANH MỤC DỊCH VỤ ===== */}
        <div style={{ marginBottom: '40px' }}>
          <div style={sectionHeaderStyle}>
            <HeartOutlined style={{ color: '#eb2f96', fontSize: '20px' }} />
            <Title level={4} style={{ margin: 0 }}>Danh mục dịch vụ</Title>
          </div>

          <div style={categoryGridStyle}>
            <div 
              onClick={() => onCategoryChange('all')}
              style={categoryBtnStyle(!pagination.currentFilters?.CategoryId)}
            >
              Tất cả
            </div>
            {categories.map(cat => (
              <div 
                key={cat.id}
                onClick={() => onCategoryChange(cat.id)}
                style={categoryBtnStyle(pagination.currentFilters?.CategoryId === cat.id)}
              >
                {cat.name}
              </div>
            ))}
          </div>
        </div>

        {/* ===== PHẦN 3: DANH SÁCH DỊCH VỤ & PHÂN TRANG ===== */}
        <div style={sectionHeaderStyle}>
          <StarOutlined style={{ color: '#faad14', fontSize: '20px' }} />
          <Title level={4} style={{ margin: 0 }}>Liệu trình dành cho bạn</Title>
        </div>

        <Spin spinning={loading} tip="Đang tải dữ liệu...">
          {services.length > 0 ? (
            <div style={{ minHeight: '400px' }}>
              <Row gutter={[24, 24]}>
                {services.map(service => (
                  <Col xs={24} sm={12} md={8} lg={6} key={service.id}>
                    <ServiceCard 
                      service={service} 
                      onBookNow={handleBookNow}
                    />
                  </Col>
                ))}
              </Row>

              {/* PHÂN TRANG CĂN GIỮA */}
              <div style={paginationContainerStyle}>
                <Pagination 
                  current={pagination.current}
                  pageSize={pagination.pageSize}
                  total={pagination.total}
                  onChange={(page) => runFetch(page, pagination.pageSize, pagination.currentFilters)}
                  showSizeChanger={false}
                />
              </div>
            </div>
          ) : (
            <Empty 
              image={Empty.PRESENTED_IMAGE_SIMPLE} 
              description="Không tìm thấy dịch vụ nào" 
              style={{ padding: '80px 0' }}
            />
          )}
        </Spin>

        {/* Nút Đặt lịch nhanh nổi lên (Floating Action Button) */}
        <Button
          type="primary"
          size="large"
          icon={<RocketOutlined />}
          onClick={() => navigate('/booking')}
          style={floatingBtnStyle}
        >
          ĐẶT LỊCH NGAY
        </Button>

        <div style={{ height: '100px' }} />
      </div>
    </ConfigProvider>
  );
};

// --- HỆ THỐNG STYLES ---

const heroSectionStyle = {
  padding: '80px 20px 60px',
  textAlign: 'center',
  background: 'linear-gradient(180deg, #fff0f6 0%, #ffffff 100%)',
  borderRadius: '0 0 50px 50px',
  marginBottom: '50px',
};

const mainTitleStyle = {
  fontSize: '48px',
  fontWeight: 800,
  margin: 0,
  letterSpacing: '-1.5px',
};

const subTitleStyle = {
  fontSize: '17px',
  color: '#8c8c8c',
  letterSpacing: '1px',
  textTransform: 'uppercase',
};

const searchWrapperStyle = {
  maxWidth: '600px',
  margin: '0 auto',
  background: '#fff',
  padding: '6px',
  borderRadius: '50px',
  boxShadow: '0 12px 30px rgba(235, 47, 150, 0.15)',
  border: '1px solid #ffe7f3',
  display: 'flex',
  alignItems: 'center',
};

const inputSearchStyle = {
  padding: '10px 20px',
  fontSize: '16px',
  width: '100%',
};

const btnSearchStyle = {
  borderRadius: '40px',
  height: '46px',
  padding: '0 28px',
  fontWeight: 600,
  fontSize: '15px',
};

const sectionHeaderStyle = {
  display: 'flex',
  alignItems: 'center',
  marginBottom: '24px',
  gap: '12px',
};

const categoryGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
  gap: '12px',
};

const categoryBtnStyle = (isActive) => ({
  textAlign: 'center',
  padding: '14px 10px',
  borderRadius: '12px',
  cursor: 'pointer',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  background: isActive ? '#eb2f96' : '#fff',
  color: isActive ? '#fff' : '#555',
  border: isActive ? '1px solid #eb2f96' : '1px solid #f0f0f0',
  fontWeight: isActive ? 600 : 400,
  boxShadow: isActive ? '0 4px 12px rgba(235, 47, 150, 0.3)' : 'none',
  fontSize: '14px',
});

const paginationContainerStyle = {
  display: 'flex',
  justifyContent: 'center',
  marginTop: '60px',
};

const floatingBtnStyle = {
  position: 'fixed',
  bottom: '30px',
  right: '30px',
  height: '54px',
  padding: '0 30px',
  borderRadius: '27px',
  boxShadow: '0 8px 24px rgba(235, 47, 150, 0.4)',
  zIndex: 100,
  fontWeight: 700,
  fontSize: '16px',
};

export default Home;
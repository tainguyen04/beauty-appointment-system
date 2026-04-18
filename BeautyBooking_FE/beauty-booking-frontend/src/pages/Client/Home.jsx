import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  Modal,
  ConfigProvider ,
  Tag,
  message, 
  Divider,
  Button as AntdButton
} from 'antd';
import { 
  SearchOutlined, 
  RocketOutlined, 
  HeartOutlined, 
  StarOutlined, 
  FireOutlined,
  ClockCircleOutlined,
  DollarOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

// Import APIs
import serviceApi from '../../api/serviceApi';
import categoryApi from '../../api/categoryApi';

// Import Components & Hooks
import ServiceCard from '../../components/tempCard';
import { usePagination } from '../../hooks/usePagination';
import HeroSearch from '../../components/HeroSearch';
import { useApiAction } from '../../hooks/useApiAction';
const { Title, Text, Paragraph } = Typography;

const Home = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  // 3. Hook quản lý hành động lấy chi tiết dịch vụ (GetById)
  const { actionLoading, execute } = useApiAction(); 
  const handleHomeSearch = (value) => {
   // Cập nhật URL để đồng bộ thanh địa chỉ
    setSearchParams(value ? { Keyword: value } : {});
    // Thực hiện lọc dữ liệu
    handleFilterChange({ Keyword: value });
  };
  const querySearch = searchParams.get('Keyword') || "";
  const [categories, setCategories] = useState([]);
  //Khai báo state lưu danh sách đã chọn
  const [selectedServices, setSelectedServices] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  // 1. Sử dụng Hook phân trang đã viết
  // Khởi tạo với pageSize = 8 (2 hàng x 4 cột trên Desktop)
  const { 
    data: services, 
    loading, 
    pagination, 
    runFetch, 
    handleFilterChange 
  } = usePagination(serviceApi.getAll, 8);

  //Hàm xử lý khi click vào Card (Toggle chọn/bỏ chọn)
  const toggleSelectService = (service) => {
    setSelectedServices(prev => {
      const isExisted = prev.find(item => item.id === service.id);
      if (isExisted) {
        // Nếu chọn rồi thì bỏ chọn
        return prev.filter(item => item.id !== service.id);
      } else {
        // Nếu chưa chọn thì thêm vào danh sách
        return [...prev, service];
      }
    });
  };

  //Hàm khi nhấn nút "ĐẶT LỊCH NGAY" (Floating Button)
  const handleFinalBooking = () => {
    if (selectedServices.length === 0) {
      return message.warning("Vui lòng chọn ít nhất một dịch vụ!");
    }
    
    navigate('/booking', { 
      state: { 
        selectedList: selectedServices, // Gửi nguyên mảng đi
        autoNext: true 
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
    runFetch(1, 8, { isActive: true, Keyword: querySearch });
  }, [runFetch, querySearch]);

  // 7. Hàm xử lý khi click vào một dịch vụ để xem chi tiết
    const handleViewDetail = async (serviceId) => {
      const result = await execute(
        () => serviceApi.getById(serviceId),
        null 
      );
      if (result) {
        setSelectedService(result.data || result);
        setIsModalOpen(true);
      }
    };
  // 4. Xử lý đổi danh mục
  const onCategoryChange = (categoryId) => {
    const filter = categoryId === 'all' 
      ? { CategoryId: undefined, isActive: true } 
      : { CategoryId: Number(categoryId), isActive: true };
    handleFilterChange(filter);
  };

  return (
    <>
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
        <HeroSearch 
          title="Eco Beauty"
          subTitle="Đánh thức vẻ đẹp tiềm ẩn • Trải nghiệm dịch vụ 5 sao"
          categories={categories} // Lấy từ API
          onSearch={handleHomeSearch}
          placeholder="Bạn muốn làm đẹp gì hôm nay?"
        />

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
                      isSelected={selectedServices.some(item => item.id === service.id)}
                      onSelect={() => toggleSelectService(service)}
                      onViewDetail={() => handleViewDetail(service.id)}
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
                  onChange={(page) => 
                    runFetch(page, pagination.pageSize, {
                      ...pagination.currentFilters,
                      Keyword: querySearch
                    })
                  }
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
          onClick={handleFinalBooking}
          style={floatingBtnStyle}
        >
          ĐẶT LỊCH NGAY
        </Button>

          <div style={{ height: '100px' }} />
        </div>
      </ConfigProvider>
      {/* MODAL CHI TIẾT DỊCH VỤ */}
      <Modal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={750}
        centered
        destroyOnClose
      >
        {actionLoading ? (
          <div style={{ padding: '50px', textAlign: 'center' }}><Spin /></div>
        ) : selectedService && (
          <div style={{ padding: '15px' }}>
            <Row gutter={[32, 24]}>
              <Col xs={24} md={10}>
                <img 
                  src={selectedService.image || 'https://via.placeholder.com/400x500'} 
                  alt={selectedService.name}
                  style={{ width: '100%', borderRadius: '16px', objectFit: 'cover', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}
                />
              </Col>
              <Col xs={24} md={14}>
                <Title level={3} style={{ color: '#eb2f96', marginTop: 0 }}>{selectedService.name}</Title>
                
                <Space size="large" style={{ marginBottom: 20 }}>
                  <Text><ClockCircleOutlined style={{ color: '#eb2f96' }} /> {selectedService.duration} phút</Text>
                  <Text strong style={{ color: '#eb2f96', fontSize: '20px' }}>
                    <DollarOutlined /> {selectedService.price?.toLocaleString()}đ
                  </Text>
                </Space>

                <div style={{ background: '#fefaff', padding: '15px', borderRadius: '12px', marginBottom: 25, border: '1px solid #fff0f6' }}>
                  <Text strong>Thông tin liệu trình:</Text>
                  <Paragraph style={{ marginTop: 8, color: '#595959', textAlign: 'justify' }}>
                    {selectedService.description || "Dịch vụ đang được cập nhật mô tả chi tiết. Vui lòng liên hệ hotline để được tư vấn kỹ hơn về liệu trình này."}
                  </Paragraph>
                </div>

                <Button 
                  type="primary" 
                  size="large" 
                  block 
                  style={{ background: '#eb2f96', height: '50px', borderRadius: '25px', fontWeight: 'bold', fontSize: '16px' }}
                  onClick={() => window.location.href = '/booking'}
                >
                  ĐẶT LỊCH NGAY
                </Button>
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </>
  );
};

// --- HỆ THỐNG STYLES ---
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
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Row, Col, Typography, Input, Spin, Empty, Button, 
  Pagination, Space, Modal, ConfigProvider, Tag, message, Divider 
} from 'antd';
import { 
  SearchOutlined, RocketOutlined, HeartOutlined, StarOutlined, 
  ClockCircleOutlined, DollarOutlined, TeamOutlined, EnvironmentOutlined, ToolOutlined
} from '@ant-design/icons';

// Import APIs
import serviceApi from '../../api/serviceApi';
import categoryApi from '../../api/categoryApi';
import staffApi from '../../api/staffApi'; // 👈 Import staffApi bạn vừa tạo

// Import Components & Hooks
import ServiceCard from '../../components/ServiceCard';
import StaffProfileCard from '../../components/StaffProfileCard'; // 👈 Import StaffCard
import HeroSearch from '../../components/HeroSearch';
import { usePagination } from '../../hooks/usePagination';
import { useApiAction } from '../../hooks/useApiAction';

const { Title, Text, Paragraph } = Typography;

const Home = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const querySearch = searchParams.get('Keyword') || "";
  
  const { actionLoading, execute } = useApiAction(); 

  // --- STATE DỊCH VỤ ---
  const [categories, setCategories] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [staffServices, setStaffServices] = useState(null); // MỚI: Dùng để lưu dịch vụ khi xem chi tiết thợ

  // --- STATE NHÂN VIÊN (MỚI) ---
  const [staffs, setStaffs] = useState([]); // Chứa danh sách nhân viên load lên Home
  const [selectedStaff, setSelectedStaff] = useState(null); // Chỉ chọn 1 thợ
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [selectedStaffDetail, setSelectedStaffDetail] = useState(null);

  // Hook phân trang cho Dịch vụ
  const { 
    data: services, loading, pagination, runFetch, handleFilterChange 
  } = usePagination(serviceApi.getAll, 8);

  const handleHomeSearch = (value) => {
    setSearchParams(value ? { Keyword: value } : {});
    handleFilterChange({ Keyword: value });
  };

  // --- XỬ LÝ CHỌN CARD ---
  const toggleSelectService = (service) => {
    setSelectedServices(prev => {
      const isExisted = prev.find(item => item.id === service.id);
      return isExisted 
        ? prev.filter(item => item.id !== service.id) 
        : [...prev, service];
    });
  };

  // 👈 Xử lý chọn Nhân viên
  const handleSelectStaff = async (staff) => {
    // Nếu click lại đúng nhân viên đang chọn thì bỏ chọn, ngược lại thì thay thế bằng nhân viên mới
    if (selectedStaff?.id === staff.id) {
      setSelectedStaff(null);
      setStaffServices(null); // Xóa dịch vụ liên quan đến thợ khi bỏ chọn
    } else {
      setSelectedStaff(staff);
      
      setStaffServices(staff.services || []); // Lưu dịch vụ liên quan đến thợ vào state
    }
  };

  // --- XỬ LÝ NÚT ĐẶT LỊCH ---
  const handleFinalBooking = () => {
    if (selectedServices.length === 0 && !selectedStaff) {
      return message.warning("Vui lòng chọn ít nhất một dịch vụ hoặc chuyên viên để đặt lịch!");
    }
    
    navigate('/appointments', { 
      state: { 
        selectedList: selectedServices, // Gửi mảng dịch vụ
        selectedStaff: selectedStaff,   // 👈 Gửi thêm thợ đã chọn
        autoNext: true 
      } 
    });
  };

  // --- LOAD DỮ LIỆU BAN ĐẦU ---
  useEffect(() => {
    const loadStaticData = async () => {
      try {
        // 👈 Gọi song song 2 API lấy Category và Staff (Top 8 nhân viên nổi bật)
        const [catRes, staffRes] = await Promise.all([
          categoryApi.getAll(),
          staffApi.getAll({ isActive: true, pageSize: 8 }) 
        ]);
        
        setCategories(catRes.items || catRes.data || catRes || []);
        setStaffs(staffRes.items || staffRes.data || staffRes || []);
      } catch (error) {
        console.error("Lỗi tải dữ liệu ban đầu:", error);
      }
    };
    
    loadStaticData();
    runFetch(1, 8, { isActive: true, Keyword: querySearch });
  }, [runFetch, querySearch]);

  // --- XEM CHI TIẾT ---
  const handleViewDetail = async (serviceId) => {
    const result = await execute(() => serviceApi.getById(serviceId), null);
    if (result) {
      setSelectedService(result.data || result);
      setIsModalOpen(true);
    }
  };

  // 👈 Xem chi tiết hồ sơ Nhân viên
  const handleViewStaffDetail = async (staff) => {
    const result = await execute(() => staffApi.getById(staff.id), null);
    if (result) {
      setSelectedStaffDetail(result.data || result);
      setIsStaffModalOpen(true);
    }
  };

  const onCategoryChange = (categoryId) => {
    const filter = categoryId === 'all' 
      ? { CategoryId: undefined, isActive: true } 
      : { CategoryId: Number(categoryId), isActive: true };
    handleFilterChange(filter);
  };

  const displayServices = staffServices || services; // Nếu đã chọn thợ và có dịch vụ liên quan thì hiển thị, ngược lại hiển thị tất cả

  return (
    <>
      <ConfigProvider theme={{ token: { colorPrimary: '#eb2f96', borderRadius: 12 } }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        
        <HeroSearch 
          title="Eco Beauty"
          subTitle="Đánh thức vẻ đẹp tiềm ẩn • Trải nghiệm dịch vụ 5 sao"
          categories={categories}
          onSearch={handleHomeSearch}
          placeholder="Bạn muốn làm đẹp gì hôm nay?"
        />

        {/* ===== 👈 PHẦN MỚI: ĐỘI NGŨ CHUYÊN GIA ===== */}
        <div style={{ marginBottom: '40px' }}>
          <div style={sectionHeaderStyle}>
            <TeamOutlined style={{ color: '#eb2f96', fontSize: '20px' }} />
            <Title level={4} style={{ margin: 0 }}>Đội ngũ chuyên gia</Title>
          </div>
           <Spin spinning={loading} tip="Đang tải dữ liệu...">
            {staffs.length > 0 ? (
              <div>
                <Row gutter={[24, 24]}>
                {staffs.map(staff => (
                  <Col xs={24} sm={12} md={8} lg={6} key={staff.id}>
                    <StaffProfileCard 
                      staff={staff} 
                      isSelected={selectedStaff?.id === staff.id}
                      onSelect={handleSelectStaff}
                      onViewDetail={() => handleViewStaffDetail(staff)}
                    />
                  </Col>
                ))}
              </Row>
              <div style={paginationContainerStyle}>
                    <Pagination 
                      current={pagination.current} pageSize={pagination.pageSize} total={pagination.total} showSizeChanger={false}
                      onChange={(page) => runFetch(page, pagination.pageSize, { ...pagination.currentFilters, Keyword: querySearch })}
                    />
                  </div>
            </div>
            
            ):(
              <Empty description="Không tìm thấy chuyên gia nào" style={{ padding: '80px 0' }} />
            )}
          </Spin>
        </div>

        {/* ... PHẦN DANH MỤC DỊCH VỤ (Giữ nguyên) ... */}
        <div style={{ marginBottom: '40px' }}>
          <div style={sectionHeaderStyle}>
            <HeartOutlined style={{ color: '#eb2f96', fontSize: '20px' }} />
            <Title level={4} style={{ margin: 0 }}>Danh mục dịch vụ</Title>
          </div>
          <div style={categoryGridStyle}>
            <div onClick={() => onCategoryChange('all')} style={categoryBtnStyle(!pagination.currentFilters?.CategoryId)}>Tất cả</div>
            {categories.map(cat => (
              <div key={cat.id} onClick={() => onCategoryChange(cat.id)} style={categoryBtnStyle(pagination.currentFilters?.CategoryId === cat.id)}>
                {cat.name}
              </div>
            ))}
          </div>
        </div>

        {/* ===== DANH SÁCH DỊCH VỤ ===== */}
        <div style={{ marginBottom: '60px' }}>
            <div style={sectionHeaderStyle}>
              <StarOutlined style={{ color: '#faad14', fontSize: '20px' }} />
              <Title level={4} style={{ margin: 0 }}>
                {selectedStaff ? `Dịch vụ của ${selectedStaff.fullName}` : 'Tất cả Dịch vụ'}
              </Title>
            </div>
            

            <Spin spinning={loading} tip="Đang tải dữ liệu...">
              {displayServices.length > 0 ? (
                <div>
                  <Row gutter={[24, 24]}>
                    {displayServices.map(service => (
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
                  <div style={paginationContainerStyle}>
                    <Pagination 
                      current={pagination.current} pageSize={pagination.pageSize} total={pagination.total} showSizeChanger={false}
                      onChange={(page) => runFetch(page, pagination.pageSize, { ...pagination.currentFilters, Keyword: querySearch })}
                    />
                  </div>
                </div>
              ) : (
                <Empty description="Không tìm thấy dịch vụ nào" style={{ padding: '80px 0' }} />
              )}
            </Spin>
        </div>

        {/* Nút Đặt lịch */}
        <Button
          type="primary" size="large" icon={<RocketOutlined />}
          onClick={handleFinalBooking} style={floatingBtnStyle}
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
                  src={selectedService.ImageUrl || 'https://via.placeholder.com/400x500'} 
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
                  onClick={() => navigate('/appointments')}
                >
                  ĐẶT LỊCH NGAY
                </Button>
              </Col>
            </Row>
          </div>
        )}
      </Modal>

      {/* 👈 MODAL CHI TIẾT NHÂN VIÊN */}
      <Modal
        open={isStaffModalOpen}
        onCancel={() => setIsStaffModalOpen(false)}
        footer={null}
        width={700}
        centered
        destroyOnClose
      >
        {actionLoading ? (
          <div style={{ padding: '50px', textAlign: 'center' }}><Spin /></div>
        ) : selectedStaffDetail && (
          <div style={{ padding: '15px' }}>
            <Row gutter={[32, 24]}>
              <Col xs={24} md={10}>
                <img 
                  src={selectedStaffDetail.avatarUrl || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=500'} 
                  alt={selectedStaffDetail.fullName}
                  style={{ width: '100%', borderRadius: '16px', objectFit: 'cover', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}
                />
              </Col>
              <Col xs={24} md={14}>
                <Title level={3} style={{ color: '#eb2f96', marginTop: 0 }}>{selectedStaffDetail.fullName}</Title>
                
                <Space style={{ marginBottom: 20 }}>
                  <Tag icon={<EnvironmentOutlined />} color="magenta">
                    {selectedStaffDetail.wardName || 'Chi nhánh trung tâm'}
                  </Tag>
                </Space>

                <div style={{ background: '#fefaff', padding: '15px', borderRadius: '12px', marginBottom: 25, border: '1px solid #fff0f6' }}>
                  <Text strong>Tiểu sử chuyên môn:</Text>
                  <Paragraph style={{ marginTop: 8, color: '#595959', textAlign: 'justify' }}>
                    {selectedStaffDetail.bio || "Chuyên gia tận tâm với nhiều năm kinh nghiệm trong lĩnh vực làm đẹp."}
                  </Paragraph>
                </div>
                <div style={{ marginBottom: 20 }}>
                  <Text strong><ToolOutlined /> Dịch vụ đảm nhận ({selectedStaffDetail.services?.length || 0}):</Text>
                  <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {selectedStaffDetail.services?.map(srv => (
                      <Tag key={srv.id} style={{ borderRadius: '16px', padding: '4px 10px' }}>
                        {srv.name}
                      </Tag>
                    ))}
                  </div>
                </div>

                <Button 
                  type="primary" size="large" block 
                  style={{ background: '#eb2f96', height: '50px', borderRadius: '25px', fontWeight: 'bold' }}
                  onClick={() => {
                    handleSelectStaff(selectedStaffDetail); // Tự động chọn thợ này
                    setIsStaffModalOpen(false); // Đóng modal
                    message.success(`Đã chọn chuyên viên ${selectedStaffDetail.fullName}`);
                  }}
                >
                  CHỌN CHUYÊN VIÊN NÀY
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
import React, { useEffect, useState } from 'react';
import { Row, Col, Typography, Input, Spin, Empty, Select, message } from 'antd';
import { SearchOutlined, EnvironmentOutlined } from '@ant-design/icons';
import serviceApi from '../../api/serviceApi';
import categoryApi from '../../api/categoryApi';
import wardApi from '../../api/wardApi';
import ServiceCard from '../../components/ServiceCard';
import CategoryCard from '../../components/CategoryCard';

const { Title, Text } = Typography;

const Home = () => {
  // --- 1. STATE QUẢN LÝ DỮ LIỆU VÀ GIAO DIỆN ---
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [wards, setWards] = useState([]);
  
  // State phục vụ cho việc lọc/tìm kiếm
  const [searchKey, setSearchKey] = useState('');
  const [selectedWard, setSelectedWard] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');

  // --- 2. LOAD DỮ LIỆU TĨNH (Chạy 1 lần) ---
  useEffect(() => {
    const loadStaticData = async () => {
      try {
        const [resCategories, resWards] = await Promise.all([
          categoryApi.getAll(),
          wardApi.getAll()
        ]);
        
        setCategories(resCategories.items || resCategories.data || resCategories || []);
        setWards(resWards.items || resWards.data || resWards || []);
      } catch (error) {
        console.error("Lỗi tải danh mục/chi nhánh:", error);
      }
    };
    loadStaticData();
  }, []);

  // --- 3. LOAD DỊCH VỤ (Chạy mỗi khi đổi danh mục hoặc gõ tìm kiếm) ---
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const params = {
          isActive: true,
          pageSize: 50 // Giới hạn số lượng load cho Phase 1
        };

        if (activeCategory !== 'all') {
          params.CategoryId = Number(activeCategory);
        }

        if (searchKey.trim() !== '') {
          params.Keyword = searchKey;
        }

        const res = await serviceApi.getAll(params);
        setServices(res.items || res.data || res || []);
      } catch (error) {
        console.error("Lỗi tải dịch vụ:", error);
        setServices([]);
      } finally {
        setLoading(false);
      }
    };

    // Debounce 500ms chống spam API khi gõ
    const timeoutId = setTimeout(fetchServices, 500);
    return () => clearTimeout(timeoutId);
  }, [activeCategory, searchKey]);

  // --- 4. HÀM XỬ LÝ ĐẶT LỊCH ---
  const handleBookNow = (service) => {
    if (!selectedWard) {
      message.warning('Vui lòng chọn chi nhánh ở thanh tìm kiếm trước khi đặt lịch!');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    // Tạm thời log ra Console, sau này sẽ chuyển hướng sang trang Booking
    console.log("Chuẩn bị sang trang Booking với Dịch vụ:", service.id, "và Chi nhánh:", selectedWard);
    message.success(`Đang chuyển đến trang đặt lịch cho ${service.name}...`);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
      
      {/* ===== PHẦN 1: HERO TÌM KIẾM ===== */}
      <section style={{ 
        padding: '50px 0', 
        textAlign: 'center',
        marginBottom: '30px'
      }}>
        <Title level={1} style={{ fontWeight: 800 }}>Eco Beauty Spa</Title>
        <Text type="secondary" style={{ fontSize: '16px' }}>Đặt lịch dễ dàng - Trải nghiệm hoàn hảo</Text>
        
        <div style={{ 
          maxWidth: '700px', 
          margin: '24px auto 0', 
          display: 'flex', 
          boxShadow: '0 8px 24px rgba(0,0,0,0.08)', 
          borderRadius: '50px', 
          background: '#fff',
          border: '1px solid #f0f0f0'
        }}>
          <Input 
            placeholder="Tìm tên dịch vụ..." 
            prefix={<SearchOutlined style={{ color: '#bfbfbf', fontSize: '18px', marginRight: '8px' }}/>}
            bordered={false}
            style={{ flex: 2, padding: '16px 24px', fontSize: '15px' }}
            value={searchKey}
            onChange={(e) => setSearchKey(e.target.value)}
          />
          <div style={{ width: '1px', background: '#f0f0f0', margin: '12px 0' }} />
          <Select
            placeholder="Chọn chi nhánh"
            bordered={false}
            suffixIcon={<EnvironmentOutlined style={{ fontSize: '16px' }} />}
            style={{ flex: 1, padding: '0 10px', height: 'auto', display: 'flex', alignItems: 'center' }}
            allowClear
            value={selectedWard}
            onChange={(value) => setSelectedWard(value)}
            options={wards.map(w => ({ label: w.name, value: w.id }))}
          />
        </div>
      </section>

      {/* ===== PHẦN 2: DANH MỤC DỊCH VỤ (GOM VÀO 1 KHỐI LỚN, CHIA 5 Ô TỰ RỚT DÒNG) ===== */}
      <div style={{ marginBottom: '40px' }}>
        
        {/* ĐÂY LÀ KHỐI LỚN BỌC NGOÀI */}
        <div style={{
          background: '#fff',
          padding: '24px',
          borderRadius: '16px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.04)', // Đổ bóng nhẹ cho khối nổi lên
          border: '1px solid #f0f0f0'
        }}>
          
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            <Title level={5} style={{ margin: 0, fontWeight: 700 }}>Danh mục dịch vụ</Title>
            <Text type="secondary" style={{ fontSize: '13px' }}>
              {categories.length + 1} danh mục
            </Text>
          </div>

          {/* LƯỚI GRID BÊN TRONG: Cứ đủ 5 ô là tự rớt xuống hàng 2 */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(5, 1fr)', // Ép cứng 5 phần bằng nhau mỗi hàng
            gap: '12px' // Khoảng cách giữa các ô
          }}>
            
            {/* Nút "Tất cả" */}
            <div 
              onClick={() => setActiveCategory('all')}
              style={{
                textAlign: 'center',
                padding: '12px 8px',
                borderRadius: '8px',
                background: activeCategory === 'all' ? '#fff0f6' : '#f5f5f5',
                color: activeCategory === 'all' ? '#eb2f96' : '#333',
                fontWeight: activeCategory === 'all' ? 600 : 500,
                cursor: 'pointer',
                transition: 'all 0.2s',
                border: activeCategory === 'all' ? '1px solid #ff85c0' : '1px solid transparent',
                fontSize: '14px'
              }}
            >
              Tất cả
            </div>
            
            {/* Vòng lặp đổ danh mục từ API */}
            {categories.map(cat => {
              const isActive = activeCategory === String(cat.id);
              return (
                <div 
                  key={cat.id}
                  onClick={() => setActiveCategory(String(cat.id))}
                  style={{
                    textAlign: 'center',
                    padding: '12px 8px',
                    borderRadius: '8px',
                    background: isActive ? '#fff0f6' : '#f9f9f9',
                    color: isActive ? '#eb2f96' : '#555',
                    fontWeight: isActive ? 600 : 400,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    border: isActive ? '1px solid #ff85c0' : '1px solid transparent',
                    fontSize: '14px',
                    // Nếu tên quá dài, ép nằm trên 1 dòng và hiện 3 chấm (...)
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                  title={cat.name} // Rê chuột vào sẽ hiện tên đầy đủ (Tooltip)
                >
                  {cat.name}
                </div>
              );
            })}
            
          </div>
        </div>
      </div>

      {/* ===== PHẦN 3: LƯỚI DỊCH VỤ ===== */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Spin size="large" tip="Đang tìm dịch vụ..." />
        </div>
      ) : services.length > 0 ? (
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
      ) : (
        <Empty 
          description="Không tìm thấy dịch vụ nào phù hợp" 
          style={{ padding: '60px 0', background: '#fafafa', borderRadius: '16px' }}
        />
      )}

      <div style={{ height: '80px' }} />
    </div>
  );
};

export default Home;
import React, { useEffect, useState } from 'react';
import { Row, Col, Typography, Input, Spin, Empty, Select } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

import serviceApi from '../../api/serviceApi';
import categoryApi from '../../api/categoryApi';

import ServiceCard from '../../components/ServiceCard';
import CategoryCard from '../../components/CategoryCard';

const { Title, Text } = Typography;

const Home = () => {
  // ================= STATE =================
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);

  const [searchKey, setSearchKey] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  // ================= LOAD INIT DATA =================
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const resCategories = await categoryApi.getAll();
        setCategories(resCategories.items || resCategories.data || resCategories || []);
      } catch (error) {
        console.error('Lỗi load categories:', error);
      }
    };

    loadInitialData();
  }, []);

  // ================= LOAD SERVICES =================
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);

        const params = {
          isActive: true,
          pageSize: 50,
        };

        // filter category
        if (activeCategory !== 'all') {
          params.CategoryId = Number(activeCategory);
        }

        // search keyword
        if (searchKey.trim()) {
          params.Keyword = searchKey;
        }

        const res = await serviceApi.getAll(params);

        setServices(res.items || res.data || res || []);
      } catch (error) {
        console.error('Lỗi load services:', error);
      } finally {
        setLoading(false);
      }
    };

    const timeout = setTimeout(fetchServices, 400); // debounce
    return () => clearTimeout(timeout);
  }, [searchKey, activeCategory]);

  // ================= UI =================
  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>

      {/* ================= HEADER ================= */}
      <section style={{ padding: '60px 0', textAlign: 'center' }}>
        <Title level={1}>Eco Beauty Spa</Title>
        <Text type="secondary">
          Tìm kiếm dịch vụ làm đẹp nhanh chóng
        </Text>

        <div
          style={{
            maxWidth: 700,
            margin: '30px auto',
            display: 'flex',
            border: '1px solid #eee',
            borderRadius: 40,
            overflow: 'hidden',
          }}
        >
          <Input
            placeholder="Tìm dịch vụ bạn cần..."
            prefix={<SearchOutlined />}
            bordered={false}
            value={searchKey}
            onChange={(e) => setSearchKey(e.target.value)}
            style={{ padding: '12px 20px' }}
          />
        </div>
      </section>

      {/* ================= CATEGORY ================= */}
      <section style={{ marginBottom: 30 }}>
        <Title level={4}>Danh mục dịch vụ</Title>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: 16,
          }}
        >
          <CategoryCard
            isAll
            name="Tất cả"
            isActive={activeCategory === 'all'}
            onClick={() => setActiveCategory('all')}
          />

          {categories.map((cat) => (
            <CategoryCard
              key={cat.id}
              name={cat.name}
              imageUrl={cat.imageUrl}
              isActive={activeCategory === String(cat.id)}
              onClick={() => setActiveCategory(String(cat.id))}
            />
          ))}
        </div>
      </section>

      {/* ================= SERVICE LIST ================= */}
      <section style={{ marginTop: 20 }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Spin size="large" />
          </div>
        ) : services.length > 0 ? (
          <Row gutter={[24, 24]}>
            {services.map((service) => (
              <Col xs={24} sm={12} md={8} lg={6} key={service.id}>
                <ServiceCard service={service} />
              </Col>
            ))}
          </Row>
        ) : (
          <Empty description="Không tìm thấy dịch vụ nào" />
        )}
      </section>

      <div style={{ height: 80 }} />
    </div>
  );
};

export default Home;
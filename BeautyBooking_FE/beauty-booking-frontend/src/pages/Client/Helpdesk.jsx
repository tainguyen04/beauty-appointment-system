import React, { useState, useEffect } from 'react';
import { Layout, Menu, Typography, Card, Spin, Empty, Breadcrumb } from 'antd';
import { 
  QuestionCircleOutlined, 
  BookOutlined, 
  CustomerServiceOutlined,
  RightOutlined ,LinkOutlined  
} from '@ant-design/icons';
import helpdeskCatalogApi from '../../api/helpdeskCatalogApi';
import { TiptapContent } from '../../components/TipTapContent';
import { useNavigate } from 'react-router-dom';
const { Sider, Content } = Layout;
const { Title, Text } = Typography;

const Helpdesk = () => {
  const navigate = useNavigate();
  const [catalogs, setCatalogs] = useState([]);
  const [selectedCatalog, setSelectedCatalog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await helpdeskCatalogApi.getAll();
      const data = res?.data || res || [];
      
      // Lọc các Catalog đang hoạt động
      const activeData = data.filter(c => c.isActived || c.IsActived);
      setCatalogs(activeData);

      // Mặc định chọn mục đầu tiên
      if (activeData.length > 0) {
        setSelectedCatalog(activeData[0]);
      }
    } catch (error) {
      console.error("Fetch Helpdesk Error:", error);
    } finally {
      setLoading(false);
    }
  };
  // Xử lý khi click vào menu Catalog hoặc khi click vào link URL của Catalog
  const handleMenuClick = ({ key }) => {
    const target = catalogs.find(c => (c.catalogId || c.CatalogId).toString() === key);
    if (target) {
    if (target.url.startsWith('/')) {
        navigate(target.url); // Điều hướng nội bộ nếu URL bắt đầu bằng "/"
    }else{
        // Nếu URL không phải là đường dẫn nội bộ, mở tab mới
        window.open(target.url, '_blank');
    }
      
    } else {
      // 3. Nếu không có URL, cập nhật state để hiển thị nội dung Tiptap
      setSelectedCatalog(target);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '100px' }}><Spin size="large" tip="Đang tải hỗ trợ..." /></div>;

  return (
    <div style={{ background: '#f5f7fa', minHeight: '100vh', padding: '40px 20px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        
        {/* Header trang */}
        <div style={{ marginBottom: 32 }}>
          <Breadcrumb items={[{ title: 'Trang chủ' }, { title: 'Trung tâm hỗ trợ' }]} />
          <Title level={2} style={{ marginTop: 16 }}>
            <CustomerServiceOutlined style={{ color: '#eb2f96', marginRight: 12 }} />
            Chúng tôi có thể giúp gì cho bạn?
          </Title>
        </div>

        <Layout style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
          <Sider width={300} style={{ background: '#fff', borderRight: '1px solid #f0f0f0' }} breakpoint="lg" collapsedWidth="0">
            <Menu
                mode="inline"
                onClick={handleMenuClick}
                items={catalogs.map(c => ({
                    key: c.catalogId.toString(),
                    label: (
                    <span>
                        {c.nameVn} {c.url && <LinkOutlined style={{ marginLeft: 8, fontSize: 12 }} />}
                    </span>
                    ),
                }))}
            />
          </Sider>

          <Content style={{ padding: '40px', minHeight: 600 }}>
            {selectedCatalog ? (
              <div>
                <Title level={3}>{selectedCatalog.nameVn || selectedCatalog.NameVn}</Title>
                <hr style={{ border: 'none', borderTop: '1px solid #f0f0f0', margin: '24px 0' }} />
                
                {/* Render danh sách Contents lồng bên trong Catalog */}
                {(selectedCatalog.contents || selectedCatalog.Contents)?.length > 0 ? (
                  (selectedCatalog.contents || selectedCatalog.Contents).map((item) => (
                    <div key={item.contentId || item.ContentId} style={{ marginBottom: 40 }}>
                      <TiptapContent html={item.contentDetail || item.ContentDetail} />
                    </div>
                  ))
                ) : (
                  <Empty description="Chưa có nội dung cho mục này" />
                )}
              </div>
            ) : (
              <Empty description="Vui lòng chọn một danh mục hỗ trợ" />
            )}
          </Content>
        </Layout>
      </div>

      {/* Thêm CSS này để nội dung Tiptap hiện ra đúng định dạng */}
<style>{`
  .tiptap-view-wrapper .tiptap {
    outline: none !important;
    font-size: 16px;
    line-height: 1.8;
    color: #434343;
    font-family: sans-serif;
  }
  .tiptap-view-wrapper .tiptap p { margin-bottom: 12px; }
  .tiptap-view-wrapper .tiptap ul { list-style-type: disc; padding-left: 25px; margin-bottom: 12px; }
  .tiptap-view-wrapper .tiptap ol { list-style-type: decimal; padding-left: 25px; margin-bottom: 12px; }
  .tiptap-view-wrapper .tiptap strong { font-weight: bold; }
  .tiptap-view-wrapper .tiptap h1, .tiptap-view-wrapper .tiptap h2 { margin-top: 24px; margin-bottom: 12px; }
`}</style>
    </div>
  );
};

export default Helpdesk;
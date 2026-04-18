const BookingSummary = ({ data }) => {
  // Logic xử lý hiển thị nhân viên
  const renderStaff = () => {
    if (!data.staffId || data.staffId === 0) {
      return (
        <Space>
          <Text strong>Bất kỳ ai</Text>
          <Tag color="blue">Hệ thống tự sắp xếp</Tag>
        </Space>
      );
    }
    return <Text strong>{data.staffName || "Đã chọn nhân viên"}</Text>;
  };

  return (
    <div style={{ padding: '10px 0' }}>
      <Alert
        message="Vui lòng kiểm tra kỹ thông tin trước khi xác nhận"
        type="info"
        showIcon
        style={{ marginBottom: 20 }}
      />
      
      <div style={{ background: '#fff0f6', padding: '20px', borderRadius: '12px', border: '1px solid #ffadd2' }}>
        <Title level={4} style={{ marginBottom: 20, color: '#c41d7f' }}>Tóm tắt lịch hẹn</Title>
        
        <Row gutter={[0, 16]}>
          <Col span={24} style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Text type="secondary">Dịch vụ:</Text>
            <Text strong>{data.serviceName || "Chưa chọn"}</Text>
          </Col>
          
          <Col span={24} style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Text type="secondary">Chi nhánh:</Text>
            <Text strong>{data.branchName || "Chưa chọn"}</Text>
          </Col>

          <Col span={24} style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Text type="secondary">Ngày giờ:</Text>
            <Text strong>{data.date} lúc {data.time}</Text>
          </Col>

          <Col span={24} style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Text type="secondary">Kỹ thuật viên:</Text>
            {renderStaff()}
          </Col>

          <Col span={24}>
             <div style={{ borderTop: '1px dashed #ffadd2', margin: '10px 0', paddingTop: '10px', display: 'flex', justifyContent: 'space-between' }}>
                <Text strong style={{ fontSize: '16px' }}>Tổng thanh toán:</Text>
                <Text style={{ fontSize: '20px', color: '#eb2f96', fontWeight: 'bold' }}>
                  {data.price?.toLocaleString()}đ
                </Text>
             </div>
          </Col>
        </Row>
      </div>
    </div>
  );
};
export default BookingSummary;
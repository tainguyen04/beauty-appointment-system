import { Alert, Col, Row, Space, Tag, Typography } from 'antd';
import { convertMinutesToTimeStr } from '../utils/apiHelper';
const { Title, Text } = Typography;
const BookingSummary = ({ data }) => {
    console.log("BookingSummary data:", data); // Debug: Kiểm tra dữ liệu nhận vào
  // data ở đây nên chứa: { selectedServices: [], branchName, date, time, staffId, staffName }

  const renderStaff = () => {
    if (!data.staffId || data.staffId === 0) {
      return (
        <Space>
          <Text strong>Bất kỳ ai</Text>
          <Tag color="blue">Hệ thống tự sắp xếp</Tag>
        </Space>
      );
    }
    return <Text strong>{data.staffName || "Đã chọn kỹ thuật viên"}</Text>;
  };

  // Tính tổng tiền từ mảng dịch vụ
  const totalAmount = data.selectedServices?.reduce((sum, item) => sum + (item.price || 0), 0) || 0;
  // Tính THòi gian kết thúc dự kiến
  const expectedEndTime = convertMinutesToTimeStr((data.startTime || 0) + (data.duration || 0));
  return (
    <div style={{ padding: '10px 0' }}>
      <Alert
        message="Vui lòng kiểm tra kỹ thông tin trước khi xác nhận"
        type="info"
        showIcon
        style={{ marginBottom: 20 }}
      />
      
      <div style={{ background: '#fefaff', padding: '20px', borderRadius: '12px', border: '1px solid #ffadd2' }}>
        <Title level={4} style={{ marginBottom: 20, color: '#c41d7f' }}>Tóm tắt lịch hẹn</Title>
        
        <Row gutter={[0, 16]}>
          {/* HIỂN THỊ DANH SÁCH DỊCH VỤ */}
          <Col span={24}>
            <Text type="secondary" block style={{ marginBottom: 8 }}>Dịch vụ đã chọn:</Text>
            <div style={{ background: '#fff', padding: '10px', borderRadius: '8px', border: '1px solid #fff0f6' }}>
              {data.selectedServices && data.selectedServices.length > 0 ? (
                data.selectedServices.map((svc, index) => (
                  <div key={index} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text>• {svc.name}</Text>
                    <Text type="secondary">{svc.price?.toLocaleString()}đ</Text>
                  </div>
                ))
              ) : (
                <Text type="danger">Chưa chọn dịch vụ</Text>
              )}
            </div>
          </Col>
          <Col span={24} style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Text type="secondary">Thời lượng:</Text>
            <Text strong>{data.duration || 0} phút</Text>
          </Col>
          
          <Col span={24} style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Text type="secondary">Chi nhánh:</Text>
            <Text strong>{data.wardName || "Chưa chọn chi nhánh"}</Text>
          </Col>

          <Col span={24} style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Text type="secondary">Ngày và giờ bắt đầu:</Text>
            <Text strong>{data.appointmentDate || "---"} lúc {convertMinutesToTimeStr(data.startTime) || "---"}</Text>
          </Col>
          <Col span={24} style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Text type="secondary">Giờ kết thúc dự kiến:</Text>
            <Text strong>{expectedEndTime || '---'}</Text>
          </Col>

          <Col span={24} style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Text type="secondary">Kỹ thuật viên:</Text>
            {renderStaff()}
          </Col>

          {/* TỔNG TIỀN THANH TOÁN */}
          <Col span={24}>
             <div style={{ borderTop: '2px dashed #ffadd2', margin: '15px 0 0', paddingTop: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text strong style={{ fontSize: '16px' }}>Tổng thanh toán:</Text>
                <Text style={{ fontSize: '22px', color: '#eb2f96', fontWeight: 'bold' }}>
                  {totalAmount.toLocaleString()}đ
                </Text>
             </div>
          </Col>
        </Row>
      </div>
    </div>
  );
};
export default BookingSummary;
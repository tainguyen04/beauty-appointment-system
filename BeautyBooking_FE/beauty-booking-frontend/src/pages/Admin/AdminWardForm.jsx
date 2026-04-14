import React, { useState, useRef, useMemo } from 'react';
import { Form, Input, InputNumber, Button, Select, Row, Col, Card, Switch } from 'antd';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Fix lỗi icon marker mặc định của Leaflet khi dùng chung với Webpack/React
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconAnchor: [12, 41] // Căn chỉnh mũi nhọn của icon xuống đúng tọa độ
});
L.Marker.prototype.options.icon = DefaultIcon;

const AdminWardForm = () => {
  const [form] = Form.useForm();
  // Tọa độ mặc định (Ví dụ: Trung tâm TP.HCM)
  const [position, setPosition] = useState({ lat: 10.762622, lng: 106.660172 });
  const markerRef = useRef(null);

  // Sự kiện khi kéo thả marker xong
  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const { lat, lng } = marker.getLatLng();
          setPosition({ lat, lng });
          
          // ✨ MAGIC: Tự động điền tọa độ vào Form của Ant Design
          form.setFieldsValue({
            latitude: lat,
            longitude: lng,
          });
        }
      },
    }),
    [form]
  );

  const onFinish = (values) => {
    console.log('Dữ liệu gửi lên API (Payload):', values);
    // Gọi API updateWards ở đây...
  };

  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={24}>
        {/* CỘT BÊN TRÁI: FORM NHẬP LIỆU */}
        <Col span={8}>
          <Card title="Thêm / Sửa Phường Xã (Ward)" bordered={false} className="shadow-sm">
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              initialValues={{
                isActived: true,
                latitude: position.lat,
                longitude: position.lng,
              }}
            >
              <Form.Item label="Thuộc Tỉnh / Thành" name="keyLocalization" rules={[{ required: true }]}>
                <Select placeholder="-- Chọn Tỉnh / Thành phố --">
                  <Select.Option value="79">Hồ Chí Minh</Select.Option>
                  <Select.Option value="01">Hà Nội</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item label="Tên Phường (Tiếng Việt)" name="name" rules={[{ required: true }]}>
                <Input placeholder="VD: Phường Bến Nghé" />
              </Form.Item>

              <Form.Item label="Tên Phường (Tiếng Anh)" name="nameEn">
                <Input placeholder="VD: Ben Nghe Ward" />
              </Form.Item>

              <Row gutter={12}>
                <Col span={12}>
                  {/* Ô Vĩ độ - Khóa lại không cho gõ tay để tránh sai */}
                  <Form.Item label="Vĩ độ (Latitude)" name="latitude">
                    <InputNumber style={{ width: '100%' }} disabled />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  {/* Ô Kinh độ - Khóa lại */}
                  <Form.Item label="Kinh độ (Longitude)" name="longitude">
                    <InputNumber style={{ width: '100%' }} disabled />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item label="Trạng thái hoạt động" name="isActived" valuePropName="checked">
                <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" block size="large">
                  Lưu Thông Tin
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        {/* CỘT BÊN PHẢI: BẢN ĐỒ */}
        <Col span={16}>
          <Card title="Kéo thả Ghim để chọn vị trí" bordered={false} className="shadow-sm" style={{ height: '100%' }}>
            {/* Vùng chứa bản đồ */}
            <MapContainer 
              center={[position.lat, position.lng]} 
              zoom={13} 
              style={{ height: '600px', width: '100%', borderRadius: '8px' }}
            >
              {/* Nền bản đồ miễn phí từ OpenStreetMap */}
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              {/* Ghim vị trí có thể kéo thả */}
              <Marker
                draggable={true}
                eventHandlers={eventHandlers}
                position={position}
                ref={markerRef}
              >
                <Popup>Kéo thả tôi đến đúng vị trí của Phường/Chi nhánh!</Popup>
              </Marker>
            </MapContainer>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminWardForm;
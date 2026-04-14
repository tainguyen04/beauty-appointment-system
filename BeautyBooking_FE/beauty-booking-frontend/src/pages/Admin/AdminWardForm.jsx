import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Form, Input, InputNumber, Button, Select, Row, Col, Card, Switch, Popconfirm, Space, Spin } from 'antd';
import { DeleteOutlined, PlusOutlined, SaveOutlined } from '@ant-design/icons';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

import websitelocalizationApi from '../../api/websitelocalizationApi';
import { useApiAction } from '../../hooks/useApiAction'; // Giả sử bạn lưu hook ở đây

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const AdminWardForm = ({ editKey, onSuccess, onCancel }) => {
  const [form] = Form.useForm();
  const markerRef = useRef(null);
  const [initialLoading, setInitialLoading] = useState(false); // Dành riêng cho lúc mới tải data
  const [activeWardIndex, setActiveWardIndex] = useState(0);
  const [position, setPosition] = useState({ lat: 10.762622, lng: 106.660172 });

  // 🚀 Sử dụng Custom Hook của bạn
  const { actionLoading, execute } = useApiAction();

  // ================= 1. LOAD DỮ LIỆU (GET) =================
  useEffect(() => {
    if (!editKey) {
      form.resetFields();
      return;
    }

    const fetchData = async () => {
      setInitialLoading(true);
      try {
        const res = await websitelocalizationApi.getById(editKey);
        const data = res?.data || res;

        form.setFieldsValue({
          keyLocalization: data.keyLocalization,
          localization: data.localization,
          isActived: data.isActived,
          wards: data.wards || []
        });

        if (data.wards?.length > 0) {
          setPosition({
            lat: data.wards[0].latitude || 10.762622,
            lng: data.wards[0].longitude || 106.660172
          });
        }
      } catch (error) {
        console.error(error); // Hook của bạn chỉ lo action (mutate), phần get data mình vẫn giữ try catch
      } finally {
        setInitialLoading(false);
      }
    };
    fetchData();
  }, [editKey, form]);

  // ================= 2. BẢN ĐỒ (Kéo thả) =================
  const eventHandlers = useMemo(() => ({
    dragend() {
      const marker = markerRef.current;
      if (!marker) return;
      const { lat, lng } = marker.getLatLng();
      setPosition({ lat, lng });

      const wards = form.getFieldValue('wards') || [];
      if (wards.length > activeWardIndex) {
        wards[activeWardIndex] = { ...wards[activeWardIndex], latitude: lat, longitude: lng };
        form.setFieldsValue({ wards });
      }
    }
  }), [form, activeWardIndex]);

  // ================= 3. CÁC HÀM XỬ LÝ API BẰNG HOOK =================

  const mapWardToDTO = (w) => ({
    wardPid: w.wardPid || 0,
    name: w.name || '',
    nameEn: w.nameEn || '',
    fullName: w.fullName || '',
    fullNameEn: w.fullNameEn || '',
    latitude: w.latitude || 0,
    longitude: w.longitude || 0
  });

  // LUỒNG A: TẠO MỚI TOÀN BỘ
  const handleCreateAll = async () => {
    const values = await form.validateFields();
    const payload = {
      keyLocalization: values.keyLocalization,
      localization: values.localization,
      isActived: values.isActived,
      wards: (values.wards || []).map(mapWardToDTO)
    };

    // ✨ Code gọn hơn hẳn: Không cần try...catch hay message nữa
    const { success } = await execute(
      () => websitelocalizationApi.create(payload),
      'Tạo mới khu vực thành công!',
      'Lỗi khi tạo mới!'
    );
    if (success && onSuccess) onSuccess();
  };

  // LUỒNG B1: UPDATE INFO
  const handleUpdateInfoOnly = async () => {
    const values = await form.validateFields(['localization', 'isActived']);
    await execute(
      () => websitelocalizationApi.update(editKey, {
        localization: values.localization,
        isActived: values.isActived
      }),
      'Cập nhật thông tin khu vực thành công!',
      'Cập nhật thông tin thất bại!'
    );
  };

  // LUỒNG B2: TOGGLE ACTIVE
  const handleToggleActive = async (checked) => {
    if (!editKey) return;
    
    const { success } = await execute(
      () => websitelocalizationApi.toggleActive(editKey),
      `Đã ${checked ? 'bật' : 'tắt'} trạng thái!`,
      'Lỗi khi thay đổi trạng thái!'
    );
    
    // Nếu lỗi thì hoàn tác lại cái Switch trên UI
    if (!success) {
      form.setFieldValue('isActived', !checked); 
    }
  };

  // LUỒNG B3: UPDATE WARDS
  const handleUpdateWardsOnly = async () => {
    const values = await form.validateFields(['wards']);
    const wardsPayload = (values.wards || []).map(mapWardToDTO);
    
    await execute(
      () => websitelocalizationApi.updateWards(editKey, wardsPayload),
      'Cập nhật danh sách Phường/Xã thành công!',
      'Cập nhật Phường/Xã thất bại!'
    );
  };

  // LUỒNG B4: XÓA 1 WARD
  const handleRemoveWard = async (removeFn, fieldName) => {
    const currentWards = form.getFieldValue('wards');
    const wardToDelete = currentWards[fieldName];

    if (editKey && wardToDelete?.wardId) {
      const { success } = await execute(
        () => websitelocalizationApi.deleteWards(editKey, [wardToDelete.wardId]),
        'Đã xóa Ward khỏi hệ thống!',
        'Xóa Ward thất bại!'
      );
      if (success) removeFn(fieldName); // Gọi API thành công mới cho bay màu ở UI
    } else {
      removeFn(fieldName); // Ward ảo chưa có ID, xóa thẳng trên UI
    }
  };

  // LUỒNG B5: XÓA LOCALIZATION
  const handleDeleteLocalization = async () => {
    const { success } = await execute(
      () => websitelocalizationApi.delete(editKey),
      'Đã xóa dữ liệu khu vực này!',
      'Xóa thất bại!'
    );
    if (success && onSuccess) onSuccess();
  };

  return (
    <Spin spinning={initialLoading}>
      <Row gutter={24}>
        <Col span={10}>
          <Form form={form} layout="vertical" initialValues={{ isActived: true }}>
            
            {/* THÔNG TIN CHUNG */}
            <Card 
              title="Thông tin Khu vực" 
              extra={
                 editKey ? (
                   <Space>
                     {/* Gắn actionLoading vào nút bấm */}
                     <Button type="primary" loading={actionLoading} onClick={handleUpdateInfoOnly} icon={<SaveOutlined />}>Lưu Info</Button>
                     <Popconfirm title="Xóa toàn bộ khu vực này?" onConfirm={handleDeleteLocalization} okText="Xóa" cancelText="Hủy">
                       <Button danger loading={actionLoading} icon={<DeleteOutlined />} />
                     </Popconfirm>
                   </Space>
                 ) : null
              }
              className="mb-4"
            >
              {/* ... (Các Input của Info giữ nguyên như cũ) ... */}
              <Row gutter={12}>
                <Col span={8}>
                  <Form.Item name="keyLocalization" label="Mã (Key)" rules={[{ required: true }]}>
                    <Input disabled={!!editKey} />
                  </Form.Item>
                </Col>
                <Col span={16}>
                  <Form.Item name="localization" label="Tên Khu vực" rules={[{ required: true }]}>
                    <Input />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item name="isActived" label="Trạng thái" valuePropName="checked">
                <Switch checkedChildren="Hoạt động" unCheckedChildren="Tạm ẩn" onChange={handleToggleActive} />
              </Form.Item>
            </Card>

            {/* DANH SÁCH WARDS */}
            <Card 
              title="Danh sách Phường / Xã" 
              extra={editKey ? <Button type="primary" loading={actionLoading} style={{backgroundColor: '#52c41a'}} onClick={handleUpdateWardsOnly} icon={<SaveOutlined />}>Lưu Wards</Button> : null}
            >
              <Form.List name="wards">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map((field, index) => (
                      <Card
                        key={field.key}
                        size="small"
                        style={{ marginBottom: 16, border: activeWardIndex === index ? '2px solid #1890ff' : '1px solid #d9d9d9' }}
                        title={<a onClick={() => setActiveWardIndex(index)}>Phường/Xã #{index + 1} {activeWardIndex === index && '(Đang chọn)'}</a>}
                        extra={
                          <Popconfirm title="Xóa Ward này?" onConfirm={() => handleRemoveWard(remove, field.name)}>
                            {/* Chặn nút xóa khi đang gọi API */}
                            <Button type="text" danger disabled={actionLoading} icon={<DeleteOutlined />}>Xóa</Button>
                          </Popconfirm>
                        }
                      >
                        {/* ... (Các trường Input của Ward giữ nguyên) ... */}
                         <Form.Item name={[field.name, 'wardId']} hidden><Input /></Form.Item>
                        <Row gutter={12}>
                          <Col span={24}><Form.Item name={[field.name, 'wardPid']} label="WardPid"><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
                          <Col span={12}><Form.Item name={[field.name, 'name']} label="Tên (VN)" rules={[{required: true}]}><Input /></Form.Item></Col>
                          <Col span={12}><Form.Item name={[field.name, 'nameEn']} label="Tên (EN)"><Input /></Form.Item></Col>
                          <Col span={12}><Form.Item name={[field.name, 'fullName']} label="Full Tên (VN)" rules={[{required: true}]}><Input /></Form.Item></Col>
                          <Col span={12}><Form.Item name={[field.name, 'fullNameEn']} label="Full Tên (EN)"><Input /></Form.Item></Col>
                        </Row>
                        <Row gutter={12}>
                          <Col span={12}><Form.Item name={[field.name, 'latitude']} label="Vĩ độ (Lat)"><InputNumber readOnly style={{ width: '100%', backgroundColor: '#f5f5f5' }} /></Form.Item></Col>
                          <Col span={12}><Form.Item name={[field.name, 'longitude']} label="Kinh độ (Lng)"><InputNumber readOnly style={{ width: '100%', backgroundColor: '#f5f5f5' }} /></Form.Item></Col>
                        </Row>
                      </Card>
                    ))}
                    <Button type="dashed" disabled={actionLoading} onClick={() => add({ latitude: position.lat, longitude: position.lng, isActived: true })} block icon={<PlusOutlined />}>
                      Thêm Phường / Xã mới
                    </Button>
                  </>
                )}
              </Form.List>
            </Card>

            {/* SUBMIT FORM CREATE ALL */}
            {!editKey && (
              <Space style={{ width: '100%', marginTop: 16 }}>
                <Button type="primary" size="large" block loading={actionLoading} onClick={handleCreateAll}>
                  Tạo mới Dữ liệu
                </Button>
                {onCancel && <Button size="large" disabled={actionLoading} block onClick={onCancel}>Hủy</Button>}
              </Space>
            )}

          </Form>
        </Col>

        {/* BẢN ĐỒ */}
        <Col span={14}>
          <Card title={`Bản đồ (Kéo ghim để lấy tọa độ cho Phường #${activeWardIndex + 1})`} style={{ height: '100%' }}>
            <MapContainer center={[position.lat, position.lng]} zoom={13} style={{ height: 'calc(100vh - 200px)', borderRadius: 8 }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker draggable position={position} ref={markerRef} eventHandlers={eventHandlers}>
                <Popup>Kéo thả để cập nhật tọa độ</Popup>
              </Marker>
            </MapContainer>
          </Card>
        </Col>
      </Row>
    </Spin>
  );
};

export default AdminWardForm;
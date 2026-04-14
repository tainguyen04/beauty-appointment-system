import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { Form, Input, InputNumber, Button, Row, Col, Card, Switch, Popconfirm, Space, Spin, Divider, Typography } from 'antd';
import { DeleteOutlined, PlusOutlined, SaveOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import websitelocalizationApi from '../../api/websitelocalizationApi';
import { useApiAction } from '../../hooks/useApiAction';

const { Title, Text } = Typography;

// Fix icon Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({ iconUrl: icon, shadowUrl: iconShadow, iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

const AdminWardForm = ({ editKey, onSuccess }) => {
  const [form] = Form.useForm();
  const markerRef = useRef(null);
  const { actionLoading, execute } = useApiAction();
  
  const [initialLoading, setInitialLoading] = useState(false);
  const [activeWardIndex, setActiveWardIndex] = useState(0);
  const [position, setPosition] = useState({ lat: 10.762622, lng: 106.660172 });

  const isEditMode = !!editKey;

  // ================= 1. LOAD DATA (GET) =================
  useEffect(() => {
    if (!isEditMode) {
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
          const firstWard = data.wards[0];
          setPosition({ lat: firstWard.latitude || 10.7, lng: firstWard.longitude || 106.6 });
        }
      } catch (error) {
        console.error("Lỗi tải data:", error);
      } finally {
        setInitialLoading(false);
      }
    };
    fetchData();
  }, [editKey, form, isEditMode]);

  // ================= 2. LOGIC CẬP NHẬT (UPDATE) =================

  // Update 1: Chỉ cập nhật thông tin chung (Tên, Trạng thái) - API PUT
  const handleUpdateGeneralInfo = async () => {
    const values = await form.validateFields(['localization', 'isActived']);
    await execute(
      () => websitelocalizationApi.update(editKey, {
        localization: values.localization,
        isActived: values.isActived
      }),
      'Cập nhật thông tin chung thành công!'
    );
  };

  // Update 2: Cập nhật danh sách Wards - API PUT /wards
  const handleUpdateWardsList = async () => {
    const values = await form.validateFields(['wards']);
    const payload = (values.wards || []).map(w => ({
      wardPid: w.wardPid || 0,
      name: w.name || '',
      nameEn: w.nameEn || '',
      fullName: w.fullName || '',
      fullNameEn: w.fullNameEn || '',
      latitude: w.latitude || 0,
      longitude: w.longitude || 0
    }));

    await execute(
      () => websitelocalizationApi.updateWards(editKey, payload),
      'Cập nhật danh sách Phường/Xã thành công!'
    );
  };

  // Update 3: Toggle nhanh trạng thái - API PATCH
  const handleToggleActive = async (checked) => {
    if (!isEditMode) return;
    const { success } = await execute(
      () => websitelocalizationApi.toggleActive(editKey),
      `Đã ${checked ? 'Bật' : 'Tắt'} trạng thái!`
    );
    if (!success) form.setFieldValue('isActived', !checked);
  };

  // ================= 3. LOGIC XÓA (DELETE) =================

  // Delete 1: Xóa trắng toàn bộ Localization - API DELETE
  const handleDeleteFullLocalization = async () => {
    const { success } = await execute(
      () => websitelocalizationApi.delete(editKey),
      'Đã xóa toàn bộ khu vực!'
    );
    if (success && onSuccess) onSuccess();
  };

  // Delete 2: Xóa một Ward cụ thể - API DELETE /wards (gửi list IDs)
  const handleRemoveSingleWard = async (removeFn, fieldName) => {
    const wards = form.getFieldValue('wards');
    const targetWard = wards[fieldName];

    // Nếu ward này đã có trong DB (có WardPid hoặc ID từ BE trả về)
    if (isEditMode && targetWard?.wardPid) {
      const { success } = await execute(
        () => websitelocalizationApi.deleteWards(editKey, [targetWard.wardPid]),
        'Đã xóa Phường/Xã khỏi hệ thống!'
      );
      if (success) removeFn(fieldName);
    } else {
      // Nếu là ward mới thêm tay trên UI, chưa lưu thì chỉ cần xóa khỏi Form
      removeFn(fieldName);
    }
  };

  // ================= 4. MAP & COORDINATES =================


  const updateCoordinatesInForm = (lat, lng, index) => {
    setPosition({ lat, lng });
    const wards = form.getFieldValue('wards') || [];
    if (wards[index]) {
      wards[index].latitude = lat;
      wards[index].longitude = lng;
      form.setFieldsValue({ wards });
    }
  };
    const handleMapDrag = useMemo(() => ({
    dragend() {
      const marker = markerRef.current;
      if (!marker) return;
      const { lat, lng } = marker.getLatLng();
      updateCoordinatesInForm(lat, lng, activeWardIndex);
    }
  }), [activeWardIndex, updateCoordinatesInForm]);

  // ================= RENDER =================
  return (
    <Spin spinning={initialLoading}>
      <Row gutter={24}>
        <Col span={10}>
          <Form form={form} layout="vertical">
            
            {/* CARD 1: THÔNG TIN CHUNG (CÓ UPDATE & DELETE CHA) */}
            <Card 
              title={<Title level={5}>Thông tin Khu vực</Title>}
              extra={isEditMode && (
                <Space>
                  <Button type="primary" icon={<SaveOutlined />} onClick={handleUpdateGeneralInfo} loading={actionLoading}>
                    Lưu thông tin
                  </Button>
                  <Popconfirm 
                    title="Xóa vĩnh viễn khu vực này?" 
                    onConfirm={handleDeleteFullLocalization}
                    icon={<ExclamationCircleOutlined style={{ color: 'red' }} />}
                  >
                    <Button danger icon={<DeleteOutlined />} loading={actionLoading} />
                  </Popconfirm>
                </Space>
              )}
              className="m-4"
            >
              <Row gutter={12}>
                <Col span={8}>
                  <Form.Item name="keyLocalization" label="Mã Key">
                    <Input disabled />
                  </Form.Item>
                </Col>
                <Col span={16}>
                  <Form.Item name="localization" label="Tên Khu vực" rules={[{required: true}]}>
                    <Input placeholder="VD: Hồ Chí Minh" />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item name="isActived" label="Trạng thái" valuePropName="checked">
                <Switch checkedChildren="Hoạt động" unCheckedChildren="Tạm ẩn" onChange={handleToggleActive} />
              </Form.Item>
            </Card>

            {/* CARD 2: DANH SÁCH PHƯỜNG (CÓ UPDATE & DELETE CON) */}
            <Card 
              title={<Title level={5}>Phường / Xã trực thuộc</Title>}
              extra={isEditMode && (
                <Button 
                  style={{ backgroundColor: '#52c41a', color: '#fff' }} 
                  icon={<SaveOutlined />} 
                  onClick={handleUpdateWardsList}
                  loading={actionLoading}
                >
                  Cập nhật danh sách
                </Button>
              )}
            >
              <Form.List name="wards">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map((field, index) => (
                      <Card
                        key={field.key}
                        size="small"
                        className="m-4"
                        style={{ borderLeft: activeWardIndex === index ? '4px solid #1890ff' : '1px solid #d9d9d9' }}
                        title={<Text strong onClick={() => setActiveWardIndex(index)} style={{ cursor: 'pointer' }}>Phường #{index + 1}</Text>}
                        extra={
                          <Popconfirm title="Xóa phường này?" onConfirm={() => handleRemoveSingleWard(remove, field.name)}>
                            <Button type="text" danger icon={<DeleteOutlined />} />
                          </Popconfirm>
                        }
                      >
                        <Row gutter={8}>
                          <Col span={12}>
                            <Form.Item name={[field.name, 'name']} label="Tên VN"><Input /></Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item name={[field.name, 'nameEn']} label="Tên EN"><Input /></Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item name={[field.name, 'latitude']} label="Vĩ độ">
                              <InputNumber style={{width: '100%'}} onChange={(v) => updateCoordinatesInForm(v, position.lng, index)} />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item name={[field.name, 'longitude']} label="Kinh độ">
                              <InputNumber style={{width: '100%'}} onChange={(v) => updateCoordinatesInForm(position.lat, v, index)} />
                            </Form.Item>
                          </Col>
                        </Row>
                      </Card>
                    ))}
                    <Button type="dashed" block icon={<PlusOutlined />} onClick={() => add({ latitude: position.lat, longitude: position.lng })}>
                      Thêm Phường mới
                    </Button>
                  </>
                )}
              </Form.List>
            </Card>

            {/* NÚT TẠO MỚI (CHỈ HIỆN KHI CHƯA CÓ KEY) */}
            {!isEditMode && (
              <Button type="primary" block size="large" style={{ marginTop: 20 }} loading={actionLoading} onClick={async () => {
                const values = await form.validateFields();
                await execute(() => websitelocalizationApi.create(values), 'Tạo mới thành công!');
                if (onSuccess) onSuccess();
              }}>
                TẠO MỚI TOÀN BỘ KHU VỰC
              </Button>
            )}
          </Form>
        </Col>

        {/* BẢN ĐỒ */}
        <Col span={14}>
          <div style={{ position: 'sticky', top: 20 }}>
            <MapContainer center={[position.lat, position.lng]} zoom={13} style={{ height: '80vh', borderRadius: 8 }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker draggable position={position} ref={markerRef} eventHandlers={handleMapDrag}>
                <Popup>Di chuyển để lấy tọa độ Phường #{activeWardIndex + 1}</Popup>
              </Marker>
            </MapContainer>
          </div>
        </Col>
      </Row>
    </Spin>
  );
};

export default AdminWardForm;
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Form, Input, InputNumber, Button, Select, Row, Col, Card, Switch, Space, Popconfirm } from 'antd';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

import websitelocalizationApi from '../../api/websitelocalizationApi';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const AdminWardForm = ({ editKey }) => {
  const [form] = Form.useForm();
  const markerRef = useRef(null);

  const [mode, setMode] = useState('create');
  const [position, setPosition] = useState({
    lat: 10.762622,
    lng: 106.660172
  });

  // ================= LOAD DATA =================
  useEffect(() => {
    if (!editKey) return;

    const fetchData = async () => {
      const res = await websitelocalizationApi.getById(editKey);
      const data = res?.data || res;

      form.setFieldsValue({
        keyLocalization: data.keyLocalization,
        localization: data.localization,
        isActived: data.isActived,
        wards: data.wards
      });

      if (data.wards?.length > 0) {
        setPosition({
          lat: data.wards[0].latitude,
          lng: data.wards[0].longitude
        });
      }

      setMode('edit-localization');
    };

    fetchData();
  }, [editKey, form]);

  // ================= MAP DRAG =================
  const eventHandlers = useMemo(() => ({
    dragend() {
      const marker = markerRef.current;
      if (!marker) return;

      const { lat, lng } = marker.getLatLng();
      setPosition({ lat, lng });

      const wards = form.getFieldValue('wards') || [];

      if (wards.length > 0) {
        wards[0] = {
          ...wards[0],
          latitude: lat,
          longitude: lng
        };

        form.setFieldsValue({ wards });
      }
    }
  }), [form]);

  // ================= SUBMIT =================
  const onFinish = async (values) => {

    // CREATE
    if (mode === 'create') {
      const payload = {
        keyLocalization: values.keyLocalization,
        localization: values.localization,
        isActived: values.isActived,
        wards: values.wards || []
      };

      await websitelocalizationApi.create(payload);
      return;
    }

    // UPDATE LOCALIZATION ONLY
    if (mode === 'edit-localization') {
      const payload = {
        localization: values.localization,
        isActived: values.isActived
      };

      await websitelocalizationApi.update(editKey, payload);
      return;
    }

    // UPDATE WARDS ONLY
    if (mode === 'edit-wards') {
      await websitelocalizationApi.updateWards(editKey, values.wards || []);
      return;
    }
  };

  // ================= DELETE =================
  const handleDelete = async () => {
    await websitelocalizationApi.delete(editKey);
  };

  return (
    <Row gutter={24}>

      {/* ================= FORM ================= */}
      <Col span={8}>
        <Card
          title="Localization Manager"
          extra={
            editKey && (
              <Space>
                <Button onClick={() => setMode('edit-localization')}>
                  Edit Info
                </Button>
                <Button onClick={() => setMode('edit-wards')}>
                  Edit Wards
                </Button>
                <Popconfirm title="Delete?" onConfirm={handleDelete}>
                  <Button danger>Delete</Button>
                </Popconfirm>
              </Space>
            )
          }
        >

          <Form form={form} layout="vertical" onFinish={onFinish}>

            <Form.Item
              name="keyLocalization"
              label="Key"
              rules={[{ required: true }]}
            >
              <Input disabled={mode !== 'create'} />
            </Form.Item>

            <Form.Item
              name="localization"
              label="Localization"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="isActived"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>

            {/* ================= WARDS ================= */}
            <Form.List name="wards">
              {(fields) => (
                <>
                  {fields.map((field) => (
                    <Card key={field.key} size="small" style={{ marginBottom: 10 }}>

                      <Form.Item name={[field.name, 'wardPid']} label="WardPid">
                        <InputNumber style={{ width: '100%' }} />
                      </Form.Item>

                      <Form.Item name={[field.name, 'name']} label="Name">
                        <Input />
                      </Form.Item>

                      <Form.Item name={[field.name, 'nameEn']} label="Name EN">
                        <Input />
                      </Form.Item>

                      <Form.Item name={[field.name, 'fullName']} label="Full Name">
                        <Input />
                      </Form.Item>

                      <Form.Item name={[field.name, 'fullNameEn']} label="Full Name EN">
                        <Input />
                      </Form.Item>

                      <Row gutter={8}>
                        <Col span={12}>
                          <Form.Item name={[field.name, 'latitude']} label="Lat">
                            <InputNumber disabled style={{ width: '100%' }} />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item name={[field.name, 'longitude']} label="Lng">
                            <InputNumber disabled style={{ width: '100%' }} />
                          </Form.Item>
                        </Col>
                      </Row>

                    </Card>
                  ))}
                </>
              )}
            </Form.List>

            <Button type="primary" htmlType="submit" block>
              Save
            </Button>

          </Form>

        </Card>
      </Col>

      {/* ================= MAP ================= */}
      <Col span={16}>
        <Card title="Map Picker">

          <MapContainer
            center={[position.lat, position.lng]}
            zoom={13}
            style={{ height: 600 }}
          >
            <TileLayer
              attribution='&copy; OpenStreetMap'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <Marker
              draggable
              position={position}
              ref={markerRef}
              eventHandlers={eventHandlers}
            >
              <Popup>Drag to update ward location</Popup>
            </Marker>

          </MapContainer>

        </Card>
      </Col>

    </Row>
  );
};

export default AdminWardForm;
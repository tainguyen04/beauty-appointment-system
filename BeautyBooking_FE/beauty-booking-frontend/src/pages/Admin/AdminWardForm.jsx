import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Form, Input, InputNumber, Button, Select, Row, Col, Card, Switch } from 'antd';
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

  const [position, setPosition] = useState({
    lat: 10.762622,
    lng: 106.660172
  });

  const isEdit = !!editKey;

  // ================= LOAD EDIT (ONLY INFO) =================
  useEffect(() => {
    if (!editKey) return;

    const fetchData = async () => {
      const res = await websitelocalizationApi.getById(editKey);
      const data = res?.data || res;

      form.setFieldsValue({
        keyLocalization: data.keyLocalization,
        localization: data.localization,
        isActived: data.isActived
      });

      if (data.wards?.length > 0) {
        setPosition({
          lat: data.wards[0].latitude,
          lng: data.wards[0].longitude
        });
      }
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
    }
  }), []);

  // ================= SUBMIT =================
  const onFinish = async (values) => {

    // ================= CREATE =================
    if (!isEdit) {
      const payload = {
        keyLocalization: values.keyLocalization,
        localization: values.localization,
        isActived: values.isActived,

        // CREATE luôn wards
        wards: [
          {
            wardPid: values.wardPid || 0,
            name: values.name,
            nameEn: values.nameEn,
            fullName: values.fullName,
            fullNameEn: values.fullNameEn,
            latitude: position.lat,
            longitude: position.lng
          }
        ]
      };

      await websitelocalizationApi.create(payload);
      return;
    }

    // ================= UPDATE (KHÔNG UPDATE WARDS) =================
    const payload = {
      localization: values.localization,
      isActived: values.isActived
    };

    await websitelocalizationApi.update(editKey, payload);
  };

  return (
    <Row gutter={24}>

      {/* FORM */}
      <Col span={8}>
        <Card title={isEdit ? "Update Localization" : "Create Localization"}>

          <Form form={form} layout="vertical" onFinish={onFinish}>

            <Form.Item
              name="keyLocalization"
              label="Key Localization"
              rules={[{ required: true }]}
            >
              <Input disabled={isEdit} />
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

            {/* ONLY FOR CREATE */}
            {!isEdit && (
              <>
                <Form.Item label="WardPid" name="wardPid">
                  <InputNumber style={{ width: '100%' }} />
                </Form.Item>

                <Form.Item label="Name" name="name">
                  <Input />
                </Form.Item>

                <Form.Item label="Name EN" name="nameEn">
                  <Input />
                </Form.Item>

                <Form.Item label="Full Name" name="fullName">
                  <Input />
                </Form.Item>

                <Form.Item label="Full Name EN" name="fullNameEn">
                  <Input />
                </Form.Item>

                <Row gutter={8}>
                  <Col span={12}>
                    <Form.Item label="Latitude">
                      <InputNumber value={position.lat} disabled style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Longitude">
                      <InputNumber value={position.lng} disabled style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                </Row>
              </>
            )}

            <Button type="primary" htmlType="submit" block>
              {isEdit ? "Update" : "Create"}
            </Button>

          </Form>

        </Card>
      </Col>

      {/* MAP */}
      <Col span={16}>
        <Card title="Select Location">

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
              <Popup>Drag to set ward location</Popup>
            </Marker>

          </MapContainer>

        </Card>
      </Col>

    </Row>
  );
};

export default AdminWardForm;
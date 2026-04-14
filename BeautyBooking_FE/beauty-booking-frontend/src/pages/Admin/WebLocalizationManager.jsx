import React, { useEffect, useState, useCallback } from 'react';
import { 
  Form, Table, Button, Input, InputNumber, Segmented, Switch,
  Spin, Space, Card, Popconfirm, Modal, Row, Col, Drawer, Descriptions, Tooltip 
} from 'antd';
import { 
  EditOutlined, DeleteOutlined, PlusOutlined, 
  TableOutlined, GlobalOutlined, SaveOutlined, ArrowLeftOutlined, EyeOutlined, SettingOutlined 
} from '@ant-design/icons';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import websitelocalizationApi from '../../api/websitelocalizationApi';
import { useApiAction } from '../../hooks/useApiAction';

// Fix Marker Icon Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({ iconUrl: icon, shadowUrl: iconShadow, iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

const MapBoundsCompleter = ({ wards }) => {
  const map = useMap();
  useEffect(() => {
    if (wards?.length > 0) {
      const points = wards.filter(w => w.latitude && w.longitude).map(w => [w.latitude, w.longitude]);
      if (points.length > 0) map.fitBounds(L.latLngBounds(points), { padding: [50, 50] });
    }
  }, [wards, map]);
  return null;
};

const AdminWardForm = ({ editKey, mode, onSuccess, onCancel }) => {
  const [formMain] = Form.useForm();
  const [formModal] = Form.useForm();
  const { actionLoading, execute } = useApiAction();
  
  const [view, setView] = useState('table');
  const [loading, setLoading] = useState(false);
  const [wards, setWards] = useState([]); 
  const [tempWards, setTempWards] = useState([]); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWard, setEditingWard] = useState(null); 

  const isEditWardsOnly = mode === 'edit_wards';
  const isEditLocalizationOnly = mode === 'edit_localization';

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await websitelocalizationApi.getById(editKey);
      let data = res?.data || res;
      if (Array.isArray(data)) data = data[0];
      if (data) {
        formMain.setFieldsValue(data);
        setWards(data.wards || []);
      }
    } finally { setLoading(false); }
  }, [editKey, formMain]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const onUpdateLocalization = async () => {
    try {
      const values = await formMain.validateFields();
      const res = await execute(() => websitelocalizationApi.update(editKey, values), "Cập nhật địa giới thành công!");
      if (res.success && onSuccess) onSuccess();
    } catch (err) { console.log(err); }
  };

  const handleSaveModal = async () => {
    try {
      const values = await formModal.validateFields();
      if (editingWard) {
        const payload = [{ ...values, wardPid: Number(values.wardPid) }];
        const res = await execute(() => websitelocalizationApi.updateWards(editKey, payload), "Cập nhật phường thành công!");
        if (res.success) { setIsModalOpen(false); fetchData(); if (onSuccess) onSuccess(); }
      } else {
        const newWard = { ...values, _tempId: `new_${Date.now()}` };
        setTempWards([...tempWards, newWard]);
        formModal.resetFields(['wardPid', 'name', 'nameEn', 'fullName', 'fullNameEn', 'latitude', 'longitude', 'status']);
      }
    } catch (err) { console.log(err); }
  };

  const handleConfirmBatchAdd = async () => {
    const payload = tempWards.map((item) => {
      const { _tempId, ...rest } = item; 
      return { ...rest, wardPid: Number(rest.wardPid) };
    });
    const res = await execute(() => websitelocalizationApi.updateWards(editKey, payload), "Thêm mới thành công!");
    if (res.success) { setTempWards([]); setIsModalOpen(false); fetchData(); if (onSuccess) onSuccess(); }
  };

  return (
    <Spin spinning={loading || actionLoading}>
      <Card title={isEditLocalizationOnly ? "Địa giới" : "Quản lý Phường/Xã"} extra={<Button icon={<ArrowLeftOutlined />} onClick={onCancel}>Quay lại</Button>}>
        <Form form={formMain} layout="vertical">
          <Row gutter={16} align="bottom">
            <Col span={8}><Form.Item name="localization" label="Tỉnh/Thành" rules={[{required: true}]}><Input disabled={isEditWardsOnly}/></Form.Item></Col>
            <Col span={6}><Form.Item name="keyLocalization" label="Mã Key"><Input disabled/></Form.Item></Col>
            <Col span={4}><Form.Item name="status" label="Trạng thái" valuePropName="checked"><Switch checkedChildren="Mở" unCheckedChildren="Khóa" /></Form.Item></Col>
            {isEditLocalizationOnly && (
              <Col span={6} style={{ paddingBottom: '24px' }}>
                <Button type="primary" icon={<SaveOutlined />} onClick={onUpdateLocalization} block>Lưu thay đổi</Button>
              </Col>
            )}
          </Row>
        </Form>

        {!isEditLocalizationOnly && (
          <div style={{ marginTop: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <Segmented value={view} onChange={setView} options={[{label:'Bảng', value:'table', icon:<TableOutlined/>}, {label:'Bản đồ', value:'map', icon:<GlobalOutlined/>}]} />
              <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingWard(null); setIsModalOpen(true); formModal.resetFields(); }}>Thêm Phường</Button>
            </div>
            {view === 'table' ? (
              <Table dataSource={wards} rowKey="wardId" bordered size="small" columns={[
                { title: 'PID', dataIndex: 'wardPid', width: 90 },
                { title: 'Tên ngắn', dataIndex: 'name' },
                { title: 'Tên VN', dataIndex: 'fullName' },
                { title: 'Trạng thái', dataIndex: 'status', render: (s) => (s ? 'Hoạt động' : 'Khóa') },
                { title: 'Thao tác', align: 'center', width: 120, render: (_, r) => (
                  <Space>
                    <Button type="text" icon={<EditOutlined/>} onClick={() => { setEditingWard(r); formModal.setFieldsValue(r); setIsModalOpen(true); }} />
                    <Popconfirm title="Xóa?" onConfirm={() => execute(() => websitelocalizationApi.deleteWard(editKey, r.wardPid), "Đã xóa!").then(fetchData)}><Button type="text" danger icon={<DeleteOutlined/>} /></Popconfirm>
                  </Space>
                )}
              ]} />
            ) : (
              <div style={{ height: 450, border: '1px solid #eee' }}>
                <MapContainer center={[10.7, 106.6]} zoom={11} style={{ height: '100%' }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <MapBoundsCompleter wards={wards} />
                  {wards.map(w => <Marker key={w.wardId} position={[w.latitude, w.longitude]}><Popup>{w.fullName}</Popup></Marker>)}
                </MapContainer>
              </div>
            )}
          </div>
        )}
      </Card>

      <Modal title={editingWard ? "Sửa Phường" : "Thêm hàng chờ"} open={isModalOpen} width={800} onCancel={() => setIsModalOpen(false)}
        footer={[
          <Button key="c" onClick={() => setIsModalOpen(false)}>Đóng</Button>,
          editingWard ? <Button key="u" type="primary" onClick={handleSaveModal}>Cập nhật</Button> 
          : <Button key="s" type="primary" disabled={tempWards.length === 0} onClick={handleConfirmBatchAdd}>Lưu {tempWards.length} dòng</Button>
        ]}
      >
        <Form form={formModal} layout="vertical" initialValues={{ status: true }}>
          <Row gutter={12}>
            <Col span={8}><Form.Item name="wardPid" label="Ward PID" rules={[{required: true}]}><InputNumber style={{width:'100%'}} disabled={!!editingWard}/></Form.Item></Col>
            <Col span={8}><Form.Item name="name" label="Tên VN" rules={[{required: true}]}><Input/></Form.Item></Col>
            <Col span={8}><Form.Item name="nameEn" label="Tên EN"><Input/></Form.Item></Col>
          </Row>
          <Row gutter={12}>
            <Col span={10}><Form.Item name="fullName" label="Tên đầy đủ VN" rules={[{required: true}]}><Input/></Form.Item></Col>
            <Col span={10}><Form.Item name="fullNameEn" label="Tên đầy đủ EN"><Input/></Form.Item></Col>
            <Col span={4}><Form.Item name="status" label="Trạng thái" valuePropName="checked"><Switch /></Form.Item></Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}><Form.Item name="latitude" label="Vĩ độ"><InputNumber style={{width:'100%'}}/></Form.Item></Col>
            <Col span={12}><Form.Item name="longitude" label="Kinh độ"><InputNumber style={{width:'100%'}}/></Form.Item></Col>
          </Row>
          {!editingWard && <Button type="dashed" block icon={<PlusOutlined />} onClick={handleSaveModal} style={{marginBottom: 16}}>Đưa vào hàng chờ</Button>}
        </Form>
        {!editingWard && <Table dataSource={tempWards} rowKey="_tempId" size="small" pagination={false} columns={[{title:'PID', dataIndex:'wardPid'}, {title:'Tên', dataIndex:'fullName'}]} />}
      </Modal>
    </Spin>
  );
};
const WebLocalizationManager = () => {
  const [currentView, setCurrentView] = useState('list');
  const [editKey, setEditKey] = useState(null);
  const [formMode, setFormMode] = useState('edit_localization'); 
  const [listData, setListData] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const { actionLoading, execute } = useApiAction();
  const [detailData, setDetailData] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const fetchList = useCallback(async () => {
    setIsFetching(true);
    try {
      const res = await websitelocalizationApi.getAll();
      setListData(res?.data || res || []);
    } finally { setIsFetching(false); }
  }, []);

  useEffect(() => { fetchList(); }, [fetchList]);

  const columns = [
    { title: 'Mã Vùng', dataIndex: 'keyLocalization', width: 100 },
    { title: 'Tỉnh/Thành', dataIndex: 'localization' },
    { title: 'Trạng thái', dataIndex: 'status', render: (s) => (s ? 'Đang mở' : 'Tạm khóa') },
    { title: 'Thao tác', align: 'center', width: 250, render: (_, r) => (
      <Space>
        <Tooltip title="Chi tiết"><Button shape="circle" icon={<EyeOutlined />} onClick={async () => { 
             setIsFetching(true); 
             const res = await websitelocalizationApi.getById(r.keyLocalization);
             setDetailData(Array.isArray(res) ? res[0] : res?.data || res);
             setIsDrawerOpen(true);
             setIsFetching(false);
        }} /></Tooltip>
        <Button icon={<SettingOutlined />} onClick={() => { setEditKey(r.keyLocalization); setFormMode('edit_localization'); setCurrentView('form'); }} />
        <Button type="primary" size="small" icon={<EditOutlined />} onClick={() => { setEditKey(r.keyLocalization); setFormMode('edit_wards'); setCurrentView('form'); }}>Phường</Button>
        <Popconfirm title="Xóa?" onConfirm={() => execute(() => websitelocalizationApi.delete(r.keyLocalization), "Đã xóa!").then(fetchList)}>
          <Button danger size="small" icon={<DeleteOutlined />} />
        </Popconfirm>
      </Space>
    )}
  ];

  return (
    <div style={{ padding: 24, background: '#f5f5f5', minHeight: '100vh' }}>
      {currentView === 'list' ? (
        <Card title="Quản lý địa giới">
          <Table dataSource={listData} rowKey="keyLocalization" loading={isFetching || actionLoading} columns={columns} bordered />
        </Card>
      ) : (
        <AdminWardForm editKey={editKey} mode={formMode} onSuccess={fetchList} onCancel={() => setCurrentView('list')} />
      )}

      <Drawer title="Chi tiết địa giới" width={750} open={isDrawerOpen} onClose={() => setIsDrawerOpen(false)}>
        {detailData && (
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="Khu vực">{detailData.localization}</Descriptions.Item>
              <Descriptions.Item label="Trạng thái">{detailData.status ? 'Hoạt động' : 'Khóa'}</Descriptions.Item>
            </Descriptions>
            <div style={{ height: 350, border: '1px solid #eee' }}>
              <MapContainer center={[detailData.wards?.[0]?.latitude || 10.7, detailData.wards?.[0]?.longitude || 106.6]} zoom={11} style={{ height: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <MapBoundsCompleter wards={detailData.wards} />
                {detailData.wards?.map(w => <Marker key={w.wardId} position={[w.latitude, w.longitude]}><Popup>{w.fullName}</Popup></Marker>)}
              </MapContainer>
            </div>
            <Table dataSource={detailData.wards} size="small" bordered rowKey="wardId" columns={[
                {title:'PID', dataIndex:'wardPid', width:80},
                {title:'Tên VN', dataIndex:'fullName'},
                {title:'Trạng thái', dataIndex:'status', render: (s) => (s ? 'Bật' : 'Tắt')}
            ]} pagination={{pageSize: 5}}/>
          </Space>
        )}
      </Drawer>
    </div>
  );
};

export default WebLocalizationManager;
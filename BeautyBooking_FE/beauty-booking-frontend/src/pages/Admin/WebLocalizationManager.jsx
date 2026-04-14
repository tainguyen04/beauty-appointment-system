import React, { useEffect, useState, useCallback } from 'react';
import { 
  Form, Table, Button, Input, InputNumber, Switch, Segmented, 
  Spin, Space, Card, Popconfirm, Modal, message, Row, Col, Tag, Drawer, Descriptions, Tooltip 
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

// ==========================================
// 1. COMPONENT: ADMIN WARD FORM
// ==========================================
const AdminWardForm = ({ editKey, mode, onSuccess, onCancel }) => {
  const [formMain] = Form.useForm();
  const [formModal] = Form.useForm();
  const { actionLoading, execute } = useApiAction();
  
  const [view, setView] = useState('table');
  const [loading, setLoading] = useState(false);
  const [wards, setWards] = useState([]); 
  const [tempWards, setTempWards] = useState([]); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWard, setEditingWard] = useState(null); // NULL = Thêm mới, NOT NULL = Sửa

  const isEditWardsOnly = mode === 'edit_wards';
  const isEditLocalizationOnly = mode === 'edit_localization';

  const fetchData = useCallback(async () => {
    if (mode === 'create') return;
    setLoading(true);
    try {
      const res = await websitelocalizationApi.getById(editKey);
      let data = res?.data || res;
      if (Array.isArray(data)) data = data[0];
      if (data) {
        formMain.setFieldsValue(data);
        const list = (data.wards || []).map((w, i) => ({ 
          ...w, 
          wardPid: w.wardPid || w.id || 0,
          _tempId: `old_${i}_${w.wardPid || w.id}` 
        }));
        setWards(list);
      }
    } finally { setLoading(false); }
  }, [editKey, formMain, mode]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Mở modal thêm mới
  const openAddModal = () => {
    setEditingWard(null);
    setTempWards([]);
    formModal.resetFields();
    setIsModalOpen(true);
  };

  // Mở modal cập nhật
  const openEditModal = (record) => {
    setEditingWard(record);
    formModal.setFieldsValue(record);
    setIsModalOpen(true);
  };

  // Xử lý lưu trong Modal (Hỗ trợ cả Thêm vào hàng chờ và Cập nhật trực tiếp)
  const handleSaveModal = async () => {
    try {
      const values = await formModal.validateFields();
      
      if (editingWard) {
        // CHẾ ĐỘ CẬP NHẬT: Gọi API update ngay lập tức
        const payload = [{
          ...values,
          wardPid: Number(values.wardPid)
        }];
        const res = await execute(() => websitelocalizationApi.updateWards(editKey, payload), "Cập nhật thành công!");
        if (res.success) {
          setIsModalOpen(false);
          fetchData();
        }
      } else {
        // CHẾ ĐỘ THÊM: Đưa vào hàng chờ (chưa gọi API)
        const newWard = {
          ...values,
          wardPid: Number(values.wardPid) || 0,
          _tempId: `new_${Date.now()}_${Math.random()}`
        };
        setTempWards([...tempWards, newWard]);
        formModal.resetFields(['wardPid', 'name', 'nameEn', 'fullName', 'fullNameEn']);
      }
    } catch (err) { console.log(err); }
  };

  // Lưu toàn bộ hàng chờ (Dành cho thêm mới hàng loạt)
  const handleConfirmBatchAdd = async () => {
    if (tempWards.length === 0) return;
    const payload = tempWards.map(w => ({
      wardPid: Number(w.wardPid),
      name: w.name,
      nameEn: w.nameEn || "",
      fullName: w.fullName,
      fullNameEn: w.fullNameEn || "",
      latitude: Number(w.latitude) || 0,
      longitude: Number(w.longitude) || 0
    }));

    const res = await execute(
      () => websitelocalizationApi.updateWards(editKey, payload), 
      `Đã thêm thành công ${tempWards.length} phường!`
    );

    if (res.success) {
      setTempWards([]);
      setIsModalOpen(false);
      fetchData();
    }
  };

  const handleDeleteWard = async (record) => {
    const res = await execute(() => websitelocalizationApi.deleteWard(editKey, record.wardPid), "Đã xóa thành công!");
    if (res.success) fetchData();
  };

  const onUpdateLocalization = async () => {
    const values = await formMain.validateFields();
    const res = await execute(() => websitelocalizationApi.update(editKey, values), "Cập nhật thành công!");
    if (res.success) onSuccess();
  };

  return (
    <Spin spinning={loading || actionLoading}>
      <Card 
        title={isEditLocalizationOnly ? "Sửa thông tin địa giới" : "Quản lý Phường/Xã"} 
        extra={<Button icon={<ArrowLeftOutlined />} onClick={onCancel}>Quay lại</Button>}
      >
        <Form form={formMain} layout="vertical">
          <Row gutter={16}>
            <Col span={6}><Form.Item name="keyLocalization" label="Mã Key"><Input disabled/></Form.Item></Col>
            <Col span={12}><Form.Item name="localization" label="Tỉnh/Thành"><Input disabled={isEditWardsOnly}/></Form.Item></Col>
            <Col span={6}>
              <Form.Item name="isActived" label="Kích hoạt" valuePropName="checked">
                <Switch disabled={isEditWardsOnly}/>
              </Form.Item>
            </Col>
          </Row>
          {isEditLocalizationOnly && (
            <Button type="primary" icon={<SaveOutlined />} onClick={onUpdateLocalization}>Lưu địa giới</Button>
          )}
        </Form>

        {!isEditLocalizationOnly && (
          <div style={{ marginTop: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <Segmented value={view} onChange={setView} options={[{label:'Bảng', value:'table', icon:<TableOutlined/>}, {label:'Bản đồ', value:'map', icon:<GlobalOutlined/>}]} />
              <Button type="primary" icon={<PlusOutlined />} onClick={openAddModal}>Thêm mới Phường</Button>
            </div>

            {view === 'table' ? (
              <Table dataSource={wards} rowKey="_tempId" size="small" bordered columns={[
                { title: 'PID', dataIndex: 'wardPid', width: 90 },
                { title: 'Tên VN', dataIndex: 'fullName' },
                { title: 'Tên EN', dataIndex: 'fullNameEn' },
                { title: 'Thao tác', align: 'center', width: 120, render: (_, r) => (
                  <Space>
                    <Button type="text" icon={<EditOutlined/>} onClick={() => openEditModal(r)} />
                    <Popconfirm title="Xóa phường?" onConfirm={() => handleDeleteWard(r)}>
                      <Button type="text" danger icon={<DeleteOutlined/>} />
                    </Popconfirm>
                  </Space>
                )}
              ]} />
            ) : (
              <div style={{ height: 450, border: '1px solid #eee' }}>
                <MapContainer center={[10.7, 106.6]} zoom={11} style={{ height: '100%' }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <MapBoundsCompleter wards={wards} />
                  {wards.map(w => <Marker key={w._tempId} position={[w.latitude, w.longitude]}><Popup>{w.fullName}</Popup></Marker>)}
                </MapContainer>
              </div>
            )}
          </div>
        )}
      </Card>

      <Modal 
        title={editingWard ? "Cập nhật thông tin Phường" : "Thêm Phường/Xã vào hàng chờ"} 
        open={isModalOpen} 
        width={800}
        onCancel={() => setIsModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setIsModalOpen(false)}>Hủy</Button>,
          editingWard ? (
            <Button key="update" type="primary" icon={<SaveOutlined />} onClick={handleSaveModal}>Cập nhật ngay</Button>
          ) : (
            <Button key="save" type="primary" icon={<SaveOutlined />} disabled={tempWards.length === 0} onClick={handleConfirmBatchAdd}>
              Lưu {tempWards.length} phường vào DB
            </Button>
          )
        ]}
      >
        <Form form={formModal} layout="vertical">
          <Row gutter={12}>
            <Col span={8}>
              <Form.Item name="wardPid" label="Ward PID" rules={[{required: true}]}>
                <InputNumber style={{width:'100%'}} disabled={!!editingWard} placeholder="0"/>
              </Form.Item>
            </Col>
            <Col span={8}><Form.Item name="name" label="Tên VN" rules={[{required: true}]}><Input/></Form.Item></Col>
            <Col span={8}><Form.Item name="nameEn" label="Tên EN"><Input/></Form.Item></Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}><Form.Item name="fullName" label="Tên đầy đủ VN" rules={[{required: true}]}><Input/></Form.Item></Col>
            <Col span={12}><Form.Item name="fullNameEn" label="Tên đầy đủ EN"><Input/></Form.Item></Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}><Form.Item name="latitude" label="Vĩ độ"><InputNumber style={{width:'100%'}}/></Form.Item></Col>
            <Col span={12}><Form.Item name="longitude" label="Kinh độ"><InputNumber style={{width:'100%'}}/></Form.Item></Col>
          </Row>
          
          {!editingWard && (
            <Button type="dashed" block icon={<PlusOutlined />} onClick={handleSaveModal} style={{ marginBottom: 16 }}>
              Đưa vào hàng chờ
            </Button>
          )}
        </Form>

        {!editingWard && (
          <Table 
            dataSource={tempWards} rowKey="_tempId" size="small" pagination={false} scroll={{ y: 200 }}
            columns={[
              { title: 'PID', dataIndex: 'wardPid', width: 80 },
              { title: 'Tên', dataIndex: 'fullName' },
              { title: '', render: (_, __, i) => (
                <Button type="text" danger icon={<DeleteOutlined/>} onClick={() => setTempWards(tempWards.filter((_, idx) => idx !== i))} />
              )}
            ]}
          />
        )}
      </Modal>
    </Spin>
  );
};

// ==========================================
// 2. COMPONENT CHÍNH (WebLocalizationManager giữ nguyên như cũ)
// ==========================================
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
    { title: 'Tên Tỉnh/Thành', dataIndex: 'localization' },
    { title: 'Trạng thái', width: 100, render: (v) => <Tag color={v.isActived ? 'green' : 'red'}>{v.isActived ? 'Bật' : 'Tắt'}</Tag> },
    { title: 'Thao tác', align: 'center', width: 250, render: (_, r) => (
      <Space>
        <Tooltip title="Xem chi tiết"><Button shape="circle" icon={<EyeOutlined />} onClick={async () => { 
           setIsFetching(true); 
           const res = await websitelocalizationApi.getById(r.keyLocalization);
           setDetailData(Array.isArray(res) ? res[0] : res?.data || res);
           setIsDrawerOpen(true);
           setIsFetching(false);
        }} /></Tooltip>

        <Tooltip title="Sửa Địa Giới">
            <Button icon={<SettingOutlined />} onClick={() => { 
                setEditKey(r.keyLocalization); 
                setFormMode('edit_localization');
                setCurrentView('form'); 
            }} />
        </Tooltip>

        <Button type="primary" size="small" icon={<EditOutlined />} onClick={() => { 
            setEditKey(r.keyLocalization); 
            setFormMode('edit_wards');
            setCurrentView('form'); 
        }}>Sửa Phường</Button>

        <Popconfirm title="Xóa khu vực này?" onConfirm={async () => { 
            const res = await execute(() => websitelocalizationApi.delete(r.keyLocalization), "Đã xóa"); 
            if(res.success) fetchList(); 
        }}>
          <Button danger size="small" icon={<DeleteOutlined />} />
        </Popconfirm>
      </Space>
    ) }
  ];

  return (
    <div style={{ padding: 24, background: '#f5f5f5', minHeight: '100vh' }}>
      {currentView === 'list' ? (
        <Card title="Quản lý địa giới" extra={<Button type="primary" icon={<PlusOutlined/>} onClick={() => message.info("Chức năng thêm mới tỉnh/thành")}>Thêm mới Khu vực</Button>}>
          <Table dataSource={listData} rowKey="keyLocalization" loading={isFetching || actionLoading} columns={columns} bordered />
        </Card>
      ) : (
        <AdminWardForm 
          editKey={editKey} 
          mode={formMode} 
          onSuccess={() => { setCurrentView('list'); fetchList(); }} 
          onCancel={() => setCurrentView('list')} 
        />
      )}

      <Drawer title="Chi tiết địa giới" width={750} open={isDrawerOpen} onClose={() => setIsDrawerOpen(false)}>
        {detailData && (
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="Khu vực">{detailData.localization}</Descriptions.Item>
              <Descriptions.Item label="Mã vùng">{detailData.keyLocalization}</Descriptions.Item>
              <Descriptions.Item label="Số lượng phường" span={2}>{(detailData.wards || []).length}</Descriptions.Item>
            </Descriptions>
            <div style={{ height: 350, border: '1px solid #eee' }}>
              <MapContainer center={[detailData.wards?.[0]?.latitude || 10.7, detailData.wards?.[0]?.longitude || 106.6]} zoom={11} style={{ height: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <MapBoundsCompleter wards={detailData.wards} />
                {detailData.wards?.map((w, i) => <Marker key={i} position={[w.latitude, w.longitude]}><Popup>{w.fullName}</Popup></Marker>)}
              </MapContainer>
            </div>
            <Table dataSource={detailData.wards} size="small" bordered rowKey="wardId" columns={[
                {title:'PID', dataIndex:'wardPid', width:80},
                {title:'Tên (VN)', dataIndex:'fullName'},
                {title:'Tên (EN)', dataIndex:'fullNameEn'}
            ]} pagination={{pageSize: 5}}/>
          </Space>
        )}
      </Drawer>
    </div>
  );
};

export default WebLocalizationManager;
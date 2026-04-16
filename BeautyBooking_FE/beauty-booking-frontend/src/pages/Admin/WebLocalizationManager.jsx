import React, { useEffect, useState, useCallback } from 'react';
import { 
  Form, Table, Button, Input, InputNumber, Segmented, Switch,
  Spin, Space, Card, Popconfirm, Modal, Row, Col, Drawer, Descriptions, Tooltip, Tag 
} from 'antd';
import { 
  EditOutlined, DeleteOutlined, PlusOutlined, 
  TableOutlined, GlobalOutlined, SaveOutlined, ArrowLeftOutlined, EyeOutlined, SettingOutlined 
} from '@ant-design/icons';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import websitelocalizationApi from '../../api/websitelocalizationApi';
import wardApi from '../../api/wardApi'; 
import { useApiAction } from '../../hooks/useApiAction';

// Fix Marker Icon Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({ iconUrl: icon, shadowUrl: iconShadow, iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

// Tự động căn chỉnh Map theo danh sách Phường
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
// 1. COMPONENT: ADMIN WARD FORM (SỬA/THÊM ĐỊA GIỚI & PHƯỜNG)
// ==========================================
const AdminWardForm = ({ editKey, mode, onSuccess, onCancel }) => {
  const [formMain] = Form.useForm();
  const [formModal] = Form.useForm();
  const { actionLoading, execute } = useApiAction();
  
  const [view, setView] = useState('table');
  const [loading, setLoading] = useState(false);
  const [wards, setWards] = useState([]); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWard, setEditingWard] = useState(null); 

  const isCreate = mode === 'create';
  const isEditWardsOnly = mode === 'edit_wards';
  const isEditLocalizationOnly = mode === 'edit_localization';

  const fetchData = useCallback(async () => {
    if (isCreate) {
      formMain.resetFields();
      setWards([]);
      return;
    }
    setLoading(true);
    try {
      const res = await websitelocalizationApi.getById(editKey);
      const data = Array.isArray(res) ? res[0] : (res?.data || res);
      if (data) {
        formMain.setFieldsValue({ ...data, IsActived: !!data.IsActived });
        setWards(data.wards || []);
      }
    } finally { setLoading(false); }
  }, [editKey, formMain, isCreate]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Lưu form chính (Tạo mới hoặc Cập nhật Tỉnh/Thành)
  const onSaveMain = async () => {
    try {
      const values = await formMain.validateFields();
      if (isCreate) {
        // Tạo mới: Gửi kèm danh sách wards đã thêm ở local
        const payload = { ...values, wards: wards };
        const res = await execute(() => websitelocalizationApi.create(payload), "Tạo mới địa giới thành công!");
        if (res) {
          if (onSuccess) onSuccess();
          onCancel();
        }
      } else {
        // Cập nhật Tỉnh/Thành
        const res = await execute(() => websitelocalizationApi.update(editKey, values), "Cập nhật địa giới thành công!");
        if (res && onSuccess) onSuccess();
      }
    } catch (err) { console.error(err); }
  };

  // Lưu phường (Thêm vào local nếu Create, gọi API nếu Edit)
  const handleSaveModal = async () => {
    try {
      const values = await formModal.validateFields();
      const payload = { ...values, wardPid: Number(values.wardPid) }; 

      if (isCreate) {
        // Đang ở mode tạo mới -> Chỉ lưu vào state local (chưa gọi API)
        if (editingWard) {
          setWards(wards.map(w => w._tempId === editingWard._tempId ? { ...payload, _tempId: w._tempId } : w));
        } else {
          setWards([...wards, { ...payload, _tempId: Date.now() }]);
        }
        setIsModalOpen(false);
      } else {
        // Đang ở mode sửa -> Gọi API ngay lập tức
        payload.keyLocalization = editKey;
        if (editingWard) {
          const res = await execute(() => wardApi.update(editingWard.wardId || editingWard.id, payload), "Cập nhật phường thành công!");
          if (res) { setIsModalOpen(false); fetchData(); }
        } else {
          const res = await execute(() => wardApi.create(payload), "Thêm phường thành công!");
          if (res) { setIsModalOpen(false); fetchData(); }
        }
      }
    } catch (err) { console.error(err); }
  };

  return (
    <Spin spinning={loading || actionLoading}>
      <Card 
        title={isCreate ? "Thêm mới Tỉnh/Thành" : (isEditLocalizationOnly ? "Thông tin địa giới" : "Danh sách Phường/Xã")} 
        extra={
          <Space>
            {(isEditLocalizationOnly || isCreate) && (
              <Button type="primary" icon={<SaveOutlined />} onClick={onSaveMain}>
                {isCreate ? 'Lưu tạo mới' : 'Lưu thay đổi'}
              </Button>
            )}
            <Button icon={<ArrowLeftOutlined />} onClick={onCancel}>Quay lại</Button>
          </Space>
        }
      >
        <Form form={formMain} layout="vertical" initialValues={{ IsActived: true }}>
          <Row gutter={16} align="bottom">
            <Col span={8}>
              <Form.Item name="localization" label="Tỉnh/Thành" rules={[{required: true}]}>
                <Input disabled={isEditWardsOnly}/>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="keyLocalization" label="Mã Key" rules={[{required: true}]}>
                {/* Chỉ cho nhập Mã Key khi tạo mới */}
                <Input disabled={!isCreate}/>
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item name="IsActived" label="Trạng thái" valuePropName="checked">
                <Switch checkedChildren="Mở" unCheckedChildren="Khóa" disabled={isEditWardsOnly} />
              </Form.Item>
            </Col>
          </Row>
        </Form>

        {/* Hiển thị bảng Phường nếu: Đang ở mode 'edit_wards' 
          HOẶC đang ở mode 'create' (để cho phép thêm phường cùng lúc tạo mới)
        */}
        {(!isEditLocalizationOnly || isCreate) && (
          <div style={{ marginTop: 24, borderTop: '1px solid #f0f0f0', paddingTop: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <Segmented value={view} onChange={setView} options={[
                {label:'Bảng', value:'table', icon:<TableOutlined/>}, 
                {label:'Bản đồ', value:'map', icon:<GlobalOutlined/>}
              ]} />
              <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingWard(null); setIsModalOpen(true); formModal.resetFields(); }}>
                Thêm Phường
              </Button>
            </div>

            {view === 'table' ? (
              <Table dataSource={wards} rowKey={r => r.wardId || r._tempId} bordered size="small" columns={[
                { title: 'PID', dataIndex: 'wardPid', width: 90 },
                { title: 'Tên VN', dataIndex: 'fullName' },
                { title: 'Tên EN', dataIndex: 'fullNameEn' },
                { title: 'Thao tác', align: 'center', width: 120, render: (_, r) => (
                  <Space>
                    <Button type="text" icon={<EditOutlined/>} onClick={() => { setEditingWard(r); formModal.setFieldsValue(r); setIsModalOpen(true); }} />
                    <Popconfirm title="Xóa phường?" onConfirm={() => {
                      if (isCreate) {
                        // Nếu tạo mới, xóa khỏi state
                        setWards(wards.filter(w => w._tempId !== r._tempId));
                      } else {
                        // Nếu edit, gọi API
                        execute(() => wardApi.delete(r.wardId || r.id), "Đã xóa!").then(fetchData);
                      }
                    }}>
                      <Button type="text" danger icon={<DeleteOutlined/>} />
                    </Popconfirm>
                  </Space>
                )}
              ]} />
            ) : (
              <div style={{ height: 400, border: '1px solid #eee', borderRadius: 8, overflow: 'hidden' }}>
                <MapContainer center={[10.7, 106.6]} zoom={11} style={{ height: '100%' }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <MapBoundsCompleter wards={wards} />
                  {wards.map(w => <Marker key={w.wardId || w._tempId} position={[w.latitude, w.longitude]}><Popup>{w.fullName}</Popup></Marker>)}
                </MapContainer>
              </div>
            )}
          </div>
        )}
      </Card>

      <Modal 
        title={editingWard ? "Sửa thông tin phường" : "Thêm phường mới"} 
        open={isModalOpen} width={750} onCancel={() => setIsModalOpen(false)}
        footer={[
          <Button key="c" onClick={() => setIsModalOpen(false)}>Đóng</Button>,
          <Button key="s" type="primary" onClick={handleSaveModal}>{editingWard ? "Cập nhật" : (isCreate ? "Lưu vào danh sách" : "Lưu phường")}</Button> 
        ]}
      >
        <Form form={formModal} layout="vertical">
          <Row gutter={12}>
            <Col span={8}><Form.Item name="wardPid" label="Ward PID" rules={[{required: true}]}><InputNumber style={{width:'100%'}} disabled={!!editingWard}/></Form.Item></Col>
            <Col span={8}><Form.Item name="name" label="Tên ngắn" rules={[{required: true}]}><Input/></Form.Item></Col>
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
        </Form>
      </Modal>
    </Spin>
  );
};

// ==========================================
// 2. COMPONENT CHÍNH: QUẢN LÝ DANH SÁCH ĐỊA GIỚI
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
    { title: 'Tỉnh/Thành', dataIndex: 'localization' },
    { 
      title: 'Trạng thái', 
      dataIndex: 'IsActived', 
      width: 120, 
      align: 'center',
      render: (IsActived) => (
        <Tag color={IsActived ? 'green' : 'red'} style={{ margin: 0 }}>
          {IsActived ? 'Mở' : 'Khóa'}
        </Tag>
      )
    },
    { title: 'Thao tác', align: 'center', width: 250, render: (_, r) => (
      <Space>
        <Tooltip title="Xem chi tiết">
          <Button shape="circle" icon={<EyeOutlined />} onClick={async () => { 
             setIsFetching(true); 
             const res = await websitelocalizationApi.getById(r.keyLocalization);
             const data = Array.isArray(res) ? res[0] : (res?.data || res);
             setDetailData(data);
             setIsDrawerOpen(true);
             setIsFetching(false);
          }} />
        </Tooltip>
        <Button 
          icon={<SettingOutlined />} 
          onClick={() => { setEditKey(r.keyLocalization); setFormMode('edit_localization'); setCurrentView('form'); }} 
        />
        <Button 
          type="primary" 
          size="small" 
          icon={<EditOutlined />} 
          onClick={() => { setEditKey(r.keyLocalization); setFormMode('edit_wards'); setCurrentView('form'); }}
        >
          Phường
        </Button>
        <Popconfirm title="Xóa địa giới?" onConfirm={() => execute(() => websitelocalizationApi.delete(r.keyLocalization), "Đã xóa!").then(fetchList)}>
          <Button danger size="small" icon={<DeleteOutlined />} />
        </Popconfirm>
      </Space>
    )}
  ];

  return (
    <div style={{ padding: 24, background: '#f5f5f5', minHeight: '100vh' }}>
      {currentView === 'list' ? (
        <Card 
          title="Quản lý địa giới hành chính (Website Localization)"
          extra={
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={() => { 
                setEditKey(null); 
                setFormMode('create'); 
                setCurrentView('form'); 
              }}
            >
              Thêm mới
            </Button>
          }
        >
          <Table 
            dataSource={listData} 
            rowKey="keyLocalization" 
            loading={isFetching || actionLoading} 
            columns={columns} 
            bordered 
          />
        </Card>
      ) : (
        <AdminWardForm 
          editKey={editKey} 
          mode={formMode} 
          onSuccess={fetchList} 
          onCancel={() => setCurrentView('list')} 
        />
      )}

      {/* DRAWER XEM CHI TIẾT KÈM BẢN ĐỒ */}
      <Drawer title="Chi tiết địa giới" width={850} open={isDrawerOpen} onClose={() => setIsDrawerOpen(false)}>
        {detailData && (
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="Khu vực">{detailData.localization}</Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={detailData.IsActived ? 'green' : 'red'}>{detailData.isActive ? 'Đang hoạt động' : 'Đã khóa'}</Tag>
              </Descriptions.Item>
            </Descriptions>

            <div style={{ height: 350, border: '1px solid #eee', borderRadius: 8, overflow: 'hidden' }}>
              <MapContainer center={[10.7, 106.6]} zoom={11} style={{ height: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <MapBoundsCompleter wards={detailData.wards} />
                {detailData.wards?.filter(w => w.latitude && w.longitude).map(w => (
                  <Marker key={w.wardId} position={[w.latitude, w.longitude]}>
                    <Popup><strong>{w.name}</strong><br/>{w.fullName}</Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>

            <Table 
              dataSource={detailData.wards} 
              size="small" 
              bordered 
              rowKey="wardId" 
              columns={[
                {title:'PID', dataIndex:'wardPid', width:80},
                {title:'Tên ngắn', dataIndex:'name'},
                {title:'Tên VN', dataIndex:'fullName'},
                {title:'Tên EN', dataIndex:'fullNameEn'}
              ]} 
              pagination={{pageSize: 5}}
            />
          </Space>
        )}
      </Drawer>
    </div>
  );
};

export default WebLocalizationManager;
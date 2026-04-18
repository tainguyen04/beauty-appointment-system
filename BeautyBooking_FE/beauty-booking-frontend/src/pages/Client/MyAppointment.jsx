import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Table, Tag, Card, Typography, Space, Button, Modal, 
  Descriptions, Tooltip, Radio, Input, Calendar, Badge 
} from 'antd';
import { 
  ClockCircleOutlined, EyeOutlined, ExclamationCircleOutlined,
  TableOutlined, CalendarOutlined, SearchOutlined 
} from '@ant-design/icons';
import dayjs from 'dayjs';

// Import Hooks & API
import appointmentApi from '../../api/appointmentApi';
import { usePagination } from '../../hooks/usePagination';
import { useApiAction } from '../../hooks/useApiAction';
import { getStatusConfig } from '../../utils/apiHelper'; 

const { Title, Text } = Typography;

const MyAppointment = () => {
  // --- 1. STATE QUẢN LÝ GIAO DIỆN ---
  const [viewMode, setViewMode] = useState('table'); // 'table' hoặc 'calendar'
  const [searchText, setSearchText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState(null);

  // --- 2. HÀM BỌC API (Để khớp với Object params của usePagination) ---
  const fetchAppointments = useCallback(async ({ pageNumber, pageSize }) => {
    // Chuyển đổi từ object {pageNumber, pageSize} sang tham số rời (page, size) cho API
    return await appointmentApi.getAll(pageNumber, pageSize);
  }, []);

  // --- 3. KHỞI TẠO HOOKS ---
  const { 
    data: appointments, // Đây là mảng items đã được Hook setData(res.items)
    loading, 
    pagination, 
    runFetch,
    handleFilterChange 
  } = usePagination(fetchAppointments, 10);

  const { actionLoading, execute } = useApiAction();

  // --- 4. VÒNG ĐỜI (LIFECYCLE) ---
  useEffect(() => {
    runFetch(1, 10);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Chỉ chạy 1 lần khi mount để tránh loop

  // --- 5. LOGIC XỬ LÝ DỮ LIỆU ---
  
  // Hàm chuyển đổi chế độ xem
  const handleViewModeChange = useCallback((e) => {
    const mode = e.target.value;
    setViewMode(mode);
    if (mode === 'calendar') {
      // Khi sang lịch, load 100 bản ghi để thấy đủ các ngày trong tháng
      handleFilterChange({ pageSize: 100, pageNumber: 1 });
    } else {
      // Khi về bảng, quay lại 10 bản ghi
      handleFilterChange({ pageSize: 10, pageNumber: 1 });
    }
  }, [handleFilterChange]);

  // Tìm kiếm dữ liệu (Lọc local dựa trên mảng đã fetch về)
  const filteredData = useMemo(() => {
    const data = appointments || [];
    if (!searchText) return data;
    const lowerSearch = searchText.toLowerCase();
    return data.filter(item => 
      item.id.toString().includes(lowerSearch) || 
      item.staffName?.toLowerCase().includes(lowerSearch)
    );
  }, [appointments, searchText]);

  // Hàm lấy chi tiết
  const handleViewDetail = async (id) => {
    const result = await execute(() => appointmentApi.getById(id));
    if (result) {
      setSelectedDetail(result.data || result);
      setIsModalOpen(true);
    }
  };

  // --- 6. RENDER CALENDAR CELLS ---
  const dateCellRender = (value) => {
    const dayAppointments = filteredData.filter(item => 
      dayjs(item.appointmentDate).isSame(value, 'day')
    );

    return (
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {dayAppointments.map((item) => {
          const config = getStatusConfig(item.appointmentStatus);
          return (
            <li key={item.id} style={{ marginBottom: '2px' }}>
              <Tooltip title={`${item.timeRange}: ${item.staffName}`}>
                <Badge 
                  status={config?.color === 'green' ? 'success' : 'processing'} 
                  text={
                    <span style={{ fontSize: '10px', whiteSpace: 'nowrap' }}>
                      {item.timeRange.split(' - ')[0]} {item.staffName.split(' ').pop()}
                    </span>
                  } 
                />
              </Tooltip>
            </li>
          );
        })}
      </ul>
    );
  };

  // --- 7. ĐỊNH NGHĨA CỘT BẢNG ---
  const columns = [
    {
      title: 'Mã lịch',
      dataIndex: 'id',
      key: 'id',
      width: 100,
      render: (id) => <Text strong>#{id}</Text>,
    },
    { 
      title: 'Nhân viên', 
      dataIndex: 'staffName', 
      render: (name) => <Text strong>{name || 'Hệ thống sắp xếp'}</Text> 
    },
    {
      title: 'Ngày', 
      dataIndex: 'appointmentDate', 
      render: (date) => dayjs(date).format('DD/MM/YYYY') 
    },
    { title: 'Thời gian', dataIndex: 'timeRange' },
    { 
      title: 'Chi nhánh', 
      dataIndex: 'wardName', 
      ellipsis: true,
      render: (name) => <Tooltip title={name}><Tag color="blue">{name}</Tag></Tooltip>
    },
    { 
      title: 'Trạng thái', 
      dataIndex: 'appointmentStatus', 
      align: 'center',
      render: (status) => {
        const config = getStatusConfig(status);
        return <Tag color={config?.color}>{config?.label || status}</Tag>;
      } 
    },
    {
      title: 'Thao tác',
      key: 'action',
      align: 'center',
      render: (_, record) => (
        <Button 
          type="primary" ghost icon={<EyeOutlined />} 
          onClick={() => handleViewDetail(record.id)}
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '30px auto', padding: '0 20px' }}>
      {/* THANH ĐIỀU KHIỂN (TOOLBAR) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Title level={3} style={{ margin: 0 }}>
          <ClockCircleOutlined style={{ marginRight: 10, color: '#eb2f96' }} />
          Lịch sử hẹn của tôi
        </Title>
        
        <Space size="middle">
          <Input 
            placeholder="Tìm mã lịch hoặc nhân viên..." 
            prefix={<SearchOutlined />} 
            style={{ width: 280 }}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
          />
          <Radio.Group 
            value={viewMode} 
            onChange={handleViewModeChange} 
            buttonStyle="solid"
          >
            <Radio.Button value="table"><TableOutlined /> Danh sách</Radio.Button>
            <Radio.Button value="calendar"><CalendarOutlined /> Lịch biểu</Radio.Button>
          </Radio.Group>
        </Space>
      </div>

      {/* NỘI DUNG CHÍNH */}
      <Card 
        style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
        bodyStyle={{ padding: viewMode === 'calendar' ? '10px' : '24px' }}
      >
        {viewMode === 'table' ? (
          <Table
            columns={columns}
            dataSource={filteredData}
            loading={loading}
            rowKey="id"
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              onChange: (page, pageSize) => runFetch(page, pageSize),
              showSizeChanger: false,
              position: ['bottomCenter']
            }}
          />
        ) : (
          <Calendar 
            loading={loading}
            cellRender={(current, info) => {
              if (info.type === 'date') return dateCellRender(current);
              return info.originNode;
            }} 
          />
        )}
      </Card>

      {/* MODAL CHI TIẾT */}
      <Modal
        title={<Title level={4}>Chi tiết lịch đặt #{selectedDetail?.id}</Title>}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        loading={actionLoading}
        footer={[<Button key="close" type="primary" onClick={() => setIsModalOpen(false)}>Đóng</Button>]}
        width={650}
      >
        {selectedDetail && (
          <Descriptions bordered column={1} size="small" style={{ marginTop: 10 }}>
            <Descriptions.Item label="Khách hàng">{selectedDetail.userName}</Descriptions.Item>
            <Descriptions.Item label="Nhân viên">{selectedDetail.staffName}</Descriptions.Item>
            <Descriptions.Item label="Thời gian">
              {dayjs(selectedDetail.appointmentDate).format('DD/MM/YYYY')} ({selectedDetail.timeRange})
            </Descriptions.Item>
            <Descriptions.Item label="Chi nhánh">{selectedDetail.wardName}</Descriptions.Item>
            <Descriptions.Item label="Dịch vụ">
              <ul style={{ paddingLeft: 20, marginBottom: 0 }}>
                {selectedDetail.appointmentServices?.map((item, index) => (
                  <li key={index}>
                    <Text strong>{item.serviceName}</Text> - 
                    <Text type="danger"> {item.priceAtBooking?.toLocaleString()}đ</Text>
                  </li>
                ))}
              </ul>
            </Descriptions.Item>
            <Descriptions.Item label="Tổng hóa đơn">
               <Text strong style={{ fontSize: 18, color: '#eb2f96' }}>
                  {selectedDetail.totalPrice?.toLocaleString()}đ
               </Text>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      <div style={{ marginTop: 20 }}>
        <Space>
          <ExclamationCircleOutlined style={{ color: '#faad14' }} />
          <Text type="secondary">Mẹo: Bạn có thể chuyển sang chế độ Lịch biểu để xem tổng quan các ngày trong tháng.</Text>
        </Space>
      </div>
    </div>
  );
};

export default MyAppointment;
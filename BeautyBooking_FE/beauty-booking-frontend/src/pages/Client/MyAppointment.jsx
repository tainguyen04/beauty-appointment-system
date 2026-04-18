import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Table, Tag, Card, Typography, Space, Button, Modal, 
  Descriptions, Tooltip, Radio, Input, Calendar, Badge , message,Popconfirm,Drawer,Spin
} from 'antd';
import { 
  ClockCircleOutlined, EyeOutlined, ExclamationCircleOutlined,
  TableOutlined, CalendarOutlined, SearchOutlined ,CloseCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

// Import Hooks & API
import appointmentApi from '../../api/appointmentApi';
import { usePagination } from '../../hooks/usePagination';
import { useApiAction } from '../../hooks/useApiAction';
import { getStatusConfig } from '../../utils/apiHelper'; 
import { APPOINTMENT_STATUS } from '../../utils/apiHelper';

const { Title, Text } = Typography;

const MyAppointment = () => {
  // --- 1. STATE QUẢN LÝ GIAO DIỆN ---
  const [viewMode, setViewMode] = useState('table'); // 'table' hoặc 'calendar'
  const [searchText, setSearchText] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
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
  const handleViewDetail = async (record) => {
  // 1. Mở Drawer ra ngay lập tức để hiện hiệu ứng loading (Spin)
  setIsDrawerOpen(true);
  setSelectedDetail(null); // Xóa dữ liệu cũ để tránh hiện nhầm lịch cũ

  try {
    const result = await execute(() => appointmentApi.getById(record.id));
    if (result) {
      const apiData = result.data || result;
      
      // 2. Gộp dữ liệu: Lấy chi tiết dịch vụ từ API, lấy tên từ record của bảng
      setSelectedDetail({
        ...apiData,
      });
    }
  } catch (error) {
    console.log("Lỗi khi tải chi tiết lịch hẹn:", error);
    message.error("Không thể tải chi tiết lịch hẹn");
    setIsDrawerOpen(false); // Lỗi thì đóng drawer
  }
};

  const handleCancelAppointment = async (id) => {
  try {
    // Lấy giá trị 'Cancelled' từ mảng config đã có của bạn
    const cancelValue = APPOINTMENT_STATUS.find(s => s.label === 'Đã hủy')?.value || 'Cancelled';

    // Gọi API updateStatus
    // Lưu ý: Nếu BE nhận số (0, 1, 2, 3) mà value của bạn là chữ, hãy truyền số 3
    execute(() => appointmentApi.updateStatus(id, cancelValue), "Lịch hẹn đã được hủy thành công!");
    // Refresh lại dữ liệu bảng/lịch
    runFetch(pagination.current, pagination.pageSize);
  } catch (error) {
    console.error("Lỗi khi hủy lịch:", error);
    message.error('Không thể hủy lịch lúc này. Vui lòng thử lại sau!');
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
  width: 200, // Tùy chỉnh độ rộng cột đủ để chứa 2 nút (khoảng 200px là đẹp)
  render: (_, record) => {
    // Chỉ hiện nút hủy khi trạng thái là Pending hoặc Confirmed
    const canCancel = record.appointmentStatus === 'Pending' || record.appointmentStatus === 'Confirmed';

    return (
      // Dùng Space để tạo khoảng cách đều giữa các nút, ngăn chúng dính vào nhau
      <Space size="small">
        <Button 
          type="primary" 
          ghost 
          size="small" // Dùng size small để nút thanh mảnh hơn, vừa vặn với table
          icon={<EyeOutlined />} 
          onClick={() => handleViewDetail(record)}
        >
          Chi tiết
        </Button>

        {canCancel && (
          <Popconfirm
            title="Xác nhận hủy"
            description="Bạn có chắc chắn muốn hủy lịch hẹn này?"
            onConfirm={() => handleCancelAppointment(record.id)}
            okText="Có"
            cancelText="Không"
            placement="topRight"
          >
            <Button 
              danger 
              size="small" // Dùng size small cho đồng bộ
              icon={<CloseCircleOutlined />}
            >
              Hủy
            </Button>
          </Popconfirm>
        )}
      </Space>
    );
  },
}
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

      <Drawer
  title={`Chi tiết lịch đặt #${selectedDetail?.id || ''}`}
  placement="right"
  width={600}
  onClose={() => setIsDrawerOpen(false)} // Quan trọng: Phải có hàm đóng
  open={isDrawerOpen} // Kiểm tra đúng tên biến state này
>
  <Spin spinning={actionLoading}>
    {selectedDetail ? (
      <Descriptions bordered column={1} size="small">
        <Descriptions.Item label="Nhân viên">
          {selectedDetail.staffName}
        </Descriptions.Item>
        <Descriptions.Item label="Chi nhánh">
          {selectedDetail.wardName}
        </Descriptions.Item>
        <Descriptions.Item label="Thời gian">
          {dayjs(selectedDetail.appointmentDate).format('DD/MM/YYYY')} ({selectedDetail.timeRange})
        </Descriptions.Item>
        <Descriptions.Item label="Dịch vụ">
          <ul style={{ paddingLeft: 20 }}>
            {selectedDetail.appointmentServices?.map((item, index) => (
              <li key={index}>
                {item.serviceName} - {item.priceAtBooking?.toLocaleString()}đ
              </li>
            ))}
          </ul>
        </Descriptions.Item>
        <Descriptions.Item label="Tổng hóa đơn">
           <Text strong type="danger" style={{ fontSize: 18 }}>
              {selectedDetail.totalPrice?.toLocaleString()}đ
           </Text>
        </Descriptions.Item>
      </Descriptions>
    ) : (
      <div style={{ textAlign: 'center', padding: '50px' }}>
         {!actionLoading && "Không có dữ liệu"}
      </div>
    )}
  </Spin>
</Drawer>

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
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Table, Tag, Card, Typography, Space, Button, Drawer, Popover,
  Descriptions, Tooltip, Radio, Input, Calendar, Badge , 
  Row, Col, Select, DatePicker, Spin ,Popconfirm
} from 'antd';
import { 
  ClockCircleOutlined, EyeOutlined, ExclamationCircleOutlined,
  TableOutlined, CalendarOutlined, SearchOutlined ,TagOutlined
} from '@ant-design/icons';

import dayjs from 'dayjs';

// Import Hooks & API
import appointmentApi from '../../api/appointmentApi';
import { usePagination } from '../../hooks/usePagination';
import { useApiAction } from '../../hooks/useApiAction';
import { getStatusConfig,convertMinutesToTimeStr,APPOINTMENT_STATUS } from '../../utils/apiHelper'; 

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
};

const MyAppointment = () => {
  const navigate = useNavigate();
  // --- 1. STATE QUẢN LÝ GIAO DIỆN ---
  const [viewMode, setViewMode] = useState('table'); // 'table' hoặc 'calendar'
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [filterStatus, setFilterStatus] = useState('All');

  // --- 2. HÀM BỌC API (Để khớp với Object params của usePagination) ---
  const fetchAppointments = useCallback(async ({ pageNumber, pageSize, ...filters }) => {
  return await appointmentApi.getAll({
    pageNumber,
    pageSize,
    ...filters
  });
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
  const handleRebook = (record) => {
    navigate('/appointments', {
      state: {
        selectedStaff: {
          id: record.staffId,
          fullName: record.staffName,
          wardId: record.wardId,
          wardName: record.wardName
        },
        selectedList: record.appointmentServices?.map(s => ({
          id: s.serviceId,
          name: s.serviceName,
          duration: s.duration
        })),
        autoNext: true
      }
    });
  };


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

  const canCancelAppointment = (record) => {
  if (!record?.appointmentDate) return false;
  if (record.appointmentStatus === APPOINTMENT_STATUS.Pending) return true;

  const now = dayjs();

  // Ngày + giờ bắt đầu
  const appointmentDateTime = dayjs(record.appointmentDate)
    .hour(Math.floor(record.startTime / 60))
    .minute(record.startTime % 60);

  return now.isBefore(appointmentDateTime.subtract(24, 'hour'));
};

const handleCancel = async (record) => {
  try {
    await execute(() => appointmentApi.updateStatus(record.id, 'Cancelled'));
    // Sau khi hủy thành công, làm mới lại danh sách
    runFetch(pagination.current, pagination.pageSize);
  } catch (error) {
    // Lỗi đã được handle trong useApiAction, có thể thêm xử lý riêng nếu cần
    console.log('Lỗi khi hủy lịch:', error);
  }
};

const appointmentMap = useMemo(() => {
  const map = {};

  appointments?.forEach(item => {
    const key = dayjs(item.appointmentDate).format('YYYY-MM-DD');
    if (!map[key]) map[key] = [];
    map[key].push(item);
  });

  return map;
}, [appointments]);
  // --- 6. RENDER CALENDAR CELLS ---
  const dateCellRender = (value) => {
    const dayAppointments = appointmentMap[value.format('YYYY-MM-DD')] || [];

        return (
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {dayAppointments.map((item) => {
          const config = getStatusConfig(item.appointmentStatus);
          return (
            <Popover 
              key={item.id} title={`Lịch hẹn #${item.id}`}
              content={
                <div style={{ maxWidth: 220 }}>
                  <p><b>Khách:</b> {item.userName || 'N/A'}</p>
                  <p><b>Khu vực:</b> {item.wardName || 'N/A'}</p>
                  <p><b>Giờ:</b> {item.timeRange || ''}</p>
                  <p><b>Tổng:</b> {formatCurrency(item.totalPrice)}</p>
                  <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                    <Button size="small" onClick={(e) => { e.stopPropagation(); setSelectedDetail(item); setIsDrawerOpen(true); }}>Chi tiết</Button>
                  </Space>
                </div>
              }
            >
                <li style={{ marginBottom: '2px', cursor: 'pointer' }}>
                  <Badge 
                    status={config?.color || 'default'} 
                    text={<span style={{ fontSize: '11px' }}>{convertMinutesToTimeStr(item.startTime)} - {item.userName || 'Khách'}</span>} 
                    style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}
                  />
                </li>
            </Popover>
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
      width: 200,
      render: (_, record) => {
        const canCancel = canCancelAppointment(record);
        const isCancelled = record.appointmentStatus === 'Cancelled';
        return (
          <Space>
            <Button 
              type="primary" 
              ghost 
              icon={<EyeOutlined />} 
              onClick={() => {
                setSelectedDetail(record);
                setIsDrawerOpen(true);
              }}
              size="small"
            >
              Chi tiết
            </Button>

            {isCancelled ? (
        <Button
          type="primary"
          size="small"
          onClick={() => handleRebook(record)}
        >
          Đặt lại
        </Button>
      ) : (
        /* Nếu chưa hủy → hiện Hủy */
        <Popconfirm
          title="Hủy lịch hẹn"
          description="Bạn có chắc muốn hủy lịch này không?"
          onConfirm={() => handleCancel(record)}
          okText="Hủy lịch"
          cancelText="Không"
        >
          <Button
            danger
            disabled={!canCancel}
            size="small"
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
      {/* HEADER */}
  <div style={{
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
    gap: 16
  }}>

    {/* TITLE */}
    <Title level={3} style={{ margin: 0 }}>
      <ClockCircleOutlined style={{ marginRight: 10, color: '#eb2f96' }} />
      Lịch sử hẹn của tôi
    </Title>

    {/* RIGHT TOOLBAR */}
    <Space direction="vertical" size={12} style={{ alignItems: 'flex-end' }}>

      {/* FILTER ROW */}
      <Row gutter={[12, 12]} align="middle" justify="end">

        <Col>
          <Space>
            <Text>Tìm kiếm:</Text>
            <Input.Search
              placeholder="Tên khách, SĐT..."
              onSearch={(v) => handleFilterChange({ Keyword: v })}
              allowClear
              style={{ width: 200 }}
            />
          </Space>
        </Col>

        <Col>
          <Space>
            <Text>Thời gian:</Text>
            <DatePicker.RangePicker
              format="DD/MM/YYYY"
              onChange={(dates) =>
                handleFilterChange({
                  FromDate: dates ? dates[0].format('YYYY-MM-DD') : undefined,
                  ToDate: dates ? dates[1].format('YYYY-MM-DD') : undefined
                })
              }
            />
          </Space>
        </Col>

        <Col>
          <Space>
            <Text>Trạng thái:</Text>
            <Select
              value={filterStatus}
              style={{ width: 150 }}
              options={[
                { label: 'Tất cả', value: 'All' },
                ...APPOINTMENT_STATUS.map(s => ({
                  label: s.label,
                  value: s.value
                }))
              ]}
              onChange={(v) => {
                setFilterStatus(v);
                handleFilterChange({
                  Status: v === 'All' ? undefined : v
                });
              }}
            />
          </Space>
        </Col>

      </Row>

      {/* VIEW TOGGLE */}
      <Radio.Group
        value={viewMode}
        onChange={handleViewModeChange}
        buttonStyle="solid"
      >
        <Radio.Button value="table">
          <TableOutlined /> Danh sách
        </Radio.Button>
        <Radio.Button value="calendar">
          <CalendarOutlined /> Lịch biểu
        </Radio.Button>
      </Radio.Group>

    </Space>
  </div>

  {/* CONTENT */}
  <Card
    style={{
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
    }}
    bodyStyle={{
      padding: viewMode === 'calendar' ? '10px' : '24px'
    }}
  >
    {viewMode === 'table' ? (
      <Table
        columns={columns}
        dataSource={appointments}
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
  title={<Title level={4}>Chi tiết lịch đặt #{selectedDetail?.id}</Title>}
  open={isDrawerOpen}
  onClose={() => setIsDrawerOpen(false)}
  width={500}   // Drawer thường hẹp hơn modal
  placement="right"
  loading={actionLoading}
>
  {selectedDetail && (
    <Descriptions bordered column={1} size="small" style={{ marginTop: 10 }}>
      <Descriptions.Item label="Khách hàng">
        {selectedDetail.userName}
      </Descriptions.Item>

      <Descriptions.Item label="Nhân viên">
        {selectedDetail.staffName}
      </Descriptions.Item>

      <Descriptions.Item label="Thời gian">
        {dayjs(selectedDetail.appointmentDate).format('DD/MM/YYYY')} ({selectedDetail.timeRange})
      </Descriptions.Item>

      <Descriptions.Item label="Chi nhánh">
        {selectedDetail.wardName}
      </Descriptions.Item>

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
      <Descriptions.Item label="Trạng thái">
        <Tag color={getStatusConfig(selectedDetail.appointmentStatus)?.color}>
          {getStatusConfig(selectedDetail.appointmentStatus)?.label || selectedDetail.appointmentStatus}
        </Tag>
      </Descriptions.Item>

      <Descriptions.Item label="Tổng hóa đơn">
        <Text strong style={{ fontSize: 18, color: '#eb2f96' }}>
          {selectedDetail.totalPrice?.toLocaleString()}đ
        </Text>
      </Descriptions.Item>
    </Descriptions>
  )}
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
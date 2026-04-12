import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Table, Button, Space, Card, Typography, Modal, Form, Select, 
  message, Popconfirm, TimePicker, Tag, Tooltip, Input, Segmented, Spin // MỚI: Thêm Spin
} from 'antd';
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, ClockCircleOutlined, 
  SearchOutlined, TableOutlined, CalendarOutlined 
} from '@ant-design/icons';
import dayjs from 'dayjs';

// Import helpers và hooks
import { convertMinutesToTimeStr, convertDayjsToMinutes, DAYS_OF_WEEK } from '../../utils/apiHelper';
import workScheduleApi from '../../api/workScheduleApi';
import staffApi from '../../api/staffApi';
import { usePagination } from '../../hooks/usePagination';
import { useApiAction } from '../../hooks/useApiAction'; // MỚI: Import custom hook

const { Title, Text } = Typography;

const WorkScheduleManager = () => {
  const userStr = localStorage.getItem('user');
  let userRole = null;
  if (userStr) {
    try {
      const userObj = JSON.parse(userStr);
      userRole = userObj.role; 
    } catch (error) {
      console.error('Lỗi parse thông tin user từ localStorage:', error);
    }
  }
  const isAdmin = userRole === 'Admin'; 

  // --- 1. ĐỊNH NGHĨA HÀM FETCH CHO HOOK ---
  const fetchSchedulesApi = useCallback(async (params) => {
    if (isAdmin) {
      return await workScheduleApi.getAll(params); 
    } else {
      const response = await workScheduleApi.getMySchedule();
      const dataArray = response?.items || response?.data || response || [];
      return {
        items: dataArray,
        totalCount: dataArray.length
      };
    }
  }, [isAdmin]);

  // --- 2. SỬ DỤNG CUSTOM HOOK ---
  const { data: schedules, loading, pagination, runFetch, handleTableChange } = usePagination(fetchSchedulesApi, 10);
  
  // MỚI: Khởi tạo hook quản lý loading cho thao tác Thêm/Sửa/Xóa
  const { actionLoading, execute } = useApiAction(); 

  const [staffList, setStaffList] = useState([]);
  const [viewMode, setViewMode] = useState('Table'); 
  
  const [searchText, setSearchText] = useState('');
  const [filterDay, setFilterDay] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form] = Form.useForm();

  const fetchStaffList = useCallback(async () => {
    if (isAdmin) {
      try {
        const response = await staffApi.getAll({ pageSize: 100 });
        setStaffList(response?.items || response?.data || []);
      } catch (error) {
        message.error('Không thể tải danh sách nhân viên!', error);
      }
    }
  }, [isAdmin]);

  useEffect(() => {
    const initData = async () => {
      fetchStaffList();
    };
    runFetch(1);
    initData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredData = useMemo(() => {
    return schedules.filter(item => {
      const matchName = item.staffName?.toLowerCase().includes(searchText.toLowerCase());
      const matchDay = filterDay ? item.dayOfWeek === filterDay : true;
      return matchName && matchDay;
    });
  }, [schedules, searchText, filterDay]);

  const handleOpenModal = (record = null, defaultDay = null) => {
    if (record) {
      setEditingId(record.id);
      const timeRange = [
        dayjs(convertMinutesToTimeStr(record.startTime), 'HH:mm'), 
        dayjs(convertMinutesToTimeStr(record.endTime), 'HH:mm')
      ];
      form.setFieldsValue({ ...record, timeRange });
    } else {
      setEditingId(null);
      form.resetFields();
      if (defaultDay) {
        form.setFieldsValue({ dayOfWeek: defaultDay }); 
      } else if (filterDay) {
        form.setFieldsValue({ dayOfWeek: filterDay }); 
      }
    }
    setIsModalOpen(true);
  };

  // MỚI: Viết lại handleFinish siêu gọn gàng bằng hook useApiAction
  const handleFinish = async (values) => {
    const payload = {
      ...values,
      startTime: convertDayjsToMinutes(values.timeRange[0]),
      endTime: convertDayjsToMinutes(values.timeRange[1]),
    };
    
    const apiCall = editingId 
      ? () => workScheduleApi.update(editingId, payload) 
      : () => workScheduleApi.create(payload);

    const { success } = await execute(apiCall, editingId ? 'Cập nhật thành công!' : 'Thêm mới thành công!');

    if (success) {
      setIsModalOpen(false);
      runFetch(pagination.current, pagination.pageSize); 
    }
  };

  const columns = [
    isAdmin && { title: 'Nhân viên', dataIndex: 'staffName' },
    {
      title: 'Ngày làm việc',
      dataIndex: 'dayOfWeek',
      render: (val) => {
        const d = DAYS_OF_WEEK.find(i => i.value === val);
        return <Tag color={d?.color}>{d?.label || val}</Tag>;
      }
    },
    {
      title: 'Giờ làm việc',
      render: (_, r) => `${convertMinutesToTimeStr(r.startTime)} - ${convertMinutesToTimeStr(r.endTime)}`
    },
    isAdmin && {
      title: 'Thao tác',
      render: (_, record) => (
        <Space>
          <Tooltip title="Chỉnh sửa">
            <Button type="text" icon={<EditOutlined style={{ color: '#1890ff' }} />} onClick={() => handleOpenModal(record)} />
          </Tooltip>
          <Tooltip title="Xóa lịch">
            {/* MỚI: Bọc thao tác Xóa trong execute */}
            <Popconfirm 
              title="Xóa lịch này?" 
              onConfirm={async () => {
                const { success } = await execute(() => workScheduleApi.delete(record.id), 'Đã xóa lịch!');
                if (success) runFetch(pagination.current, pagination.pageSize);
              }}
            >
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Tooltip>
        </Space>
      )
    }
  ].filter(Boolean);

  const renderWeeklyTimetable = () => (
    // MỚI: Bọc Spin xung quanh Lịch tuần để hiện trạng thái loading khi đang tải
    <Spin spinning={loading} tip="Đang tải dữ liệu...">
      <div style={{ display: 'flex', overflowX: 'auto', gap: '12px', paddingBottom: '16px', minHeight: '400px' }}>
        {DAYS_OF_WEEK.map(day => {
          const daySchedules = filteredData.filter(s => s.dayOfWeek === day.value);
          return (
            <div key={day.value} style={{ flex: 1, minWidth: '160px', backgroundColor: '#fafafa', borderRadius: '8px', border: '1px solid #f0f0f0', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid', borderBottomColor: day.color || '#d9d9d9', backgroundColor: '#fff', borderRadius: '8px 8px 0 0' }}>
                <Text strong style={{ display: 'block', marginBottom: 8 }}>{day.label}</Text>
                {isAdmin && (
                  <Button size="small" type="dashed" icon={<PlusOutlined />} onClick={() => handleOpenModal(null, day.value)}>
                    Thêm
                  </Button>
                )}
              </div>
              <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
                {daySchedules.length > 0 ? (
                  daySchedules.map(item => (
                    <Card key={item.id} size="small" hoverable styles={{ body: { padding: '10px' } }} style={{ borderLeft: `4px solid ${day.color || '#1890ff'}` }}>
                      {isAdmin && <div style={{ fontWeight: 'bold', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.staffName}</div>}
                      <div style={{ color: '#595959', fontSize: '13px' }}>
                        <ClockCircleOutlined style={{ marginRight: 4 }} />
                        {convertMinutesToTimeStr(item.startTime)} - {convertMinutesToTimeStr(item.endTime)}
                      </div>
                      {isAdmin && (
                        <div style={{ marginTop: 8, display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
                          <Button type="text" size="small" icon={<EditOutlined style={{ color: '#1890ff' }} />} onClick={() => handleOpenModal(item)} />
                          {/* MỚI: Bọc thao tác Xóa ở chế độ Lịch Tuần trong execute */}
                          <Popconfirm 
                            title="Xóa?" 
                            onConfirm={async () => {
                              const { success } = await execute(() => workScheduleApi.delete(item.id), 'Đã xóa lịch!');
                              if (success) runFetch(pagination.current, pagination.pageSize);
                            }}
                          >
                            <Button type="text" size="small" danger icon={<DeleteOutlined />} />
                          </Popconfirm>
                        </div>
                      )}
                    </Card>
                  ))
                ) : (
                  <Text type="secondary" style={{ textAlign: 'center', display: 'block', fontSize: 12, marginTop: 20 }}>Không có ca làm</Text>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Spin>
  );

  return (
    <Card bordered={false}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <Space size="large">
          <Title level={4} style={{ margin: 0 }}>Lịch Trình Công Việc</Title>
          <Segmented
            options={[
              { label: 'Dạng Bảng', value: 'Table', icon: <TableOutlined /> },
              { label: 'Lịch Tuần', value: 'Timetable', icon: <CalendarOutlined /> },
            ]}
            value={viewMode}
            onChange={setViewMode}
          />
        </Space>

        <Space>
          {isAdmin && <Input placeholder="Tìm nhân viên..." prefix={<SearchOutlined />} onChange={e => setSearchText(e.target.value)} allowClear />}
          {viewMode === 'Table' && (
             <Select placeholder="Lọc theo thứ" options={DAYS_OF_WEEK} style={{ width: 150 }} value={filterDay} onChange={setFilterDay} allowClear />
          )}
          {isAdmin && <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal()}>Thêm Lịch</Button>}
        </Space>
      </div>

      {viewMode === 'Table' ? (
        <Table 
          columns={columns} 
          dataSource={filteredData} 
          rowKey="id" 
          loading={loading} 
          pagination={{
            ...pagination,
            showSizeChanger: true,
            pageSizeOptions: ['5', '10', '20'],
          }} 
          onChange={handleTableChange}
        />
      ) : (
        renderWeeklyTimetable()
      )}

      {/* MỚI: Thêm confirmLoading={actionLoading} vào Modal để block nút Lưu */}
      <Modal 
        title={editingId ? "Sửa lịch" : "Thêm lịch mới"} 
        open={isModalOpen} 
        onOk={() => form.submit()} 
        onCancel={() => setIsModalOpen(false)}
        confirmLoading={actionLoading} 
      >
        <Form form={form} layout="vertical" onFinish={handleFinish}>
          {isAdmin && (
            <Form.Item name="staffId" label="Nhân viên" rules={[{required: true, message: 'Vui lòng chọn nhân viên'}]}>
                <Select showSearch optionFilterProp="label" options={staffList.map(s => ({ value: s.id, label: s.fullName }))} />
            </Form.Item>
          )}
          <Form.Item name="dayOfWeek" label="Thứ trong tuần" rules={[{required: true, message: 'Vui lòng chọn ngày'}]}>
             <Select options={DAYS_OF_WEEK} />
          </Form.Item>
          <Form.Item name="timeRange" label="Thời gian ca làm" rules={[{required: true, message: 'Vui lòng chọn giờ làm'}]}>
             <TimePicker.RangePicker format="HH:mm" style={{ width: '100%' }} minuteStep={15} />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default WorkScheduleManager;
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Steps, Button, Typography, Card, List, Checkbox, 
  Badge, Row, Col, message, Divider, Space, Spin, 
  DatePicker, TimePicker, Avatar, Result ,Modal, Tag
} from 'antd';
import { 
  EnvironmentOutlined, ClockCircleOutlined, DollarOutlined, 
  UserOutlined, CheckCircleOutlined, SmileOutlined 
} from '@ant-design/icons';
import dayjs from 'dayjs';

// --- Imports API & Hooks ---
import { GetUser } from '../../api/axiosClient';
import serviceApi from '../../api/serviceApi';
import wardApi from '../../api/wardApi';
import staffApi from '../../api/staffApi';
import appointmentApi from '../../api/appointmentApi';
import { useApiAction } from '../../hooks/useApiAction'; // Import hook của bạn
import BookingSummary from '../../components/BookingSummary';

const { Title, Text } = Typography;

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
};

const convertDayjsToMinutes = (timeObj) => {
  if (!timeObj) return null;
  return timeObj.hour() * 60 + timeObj.minute();
};

const Appointment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false); 

  // 1. Cập nhật state và hàm mở Profile (trong Component chính)
  const [isProfileModalVisible, setIsProfileModalVisible] = useState(false);
  const [viewingStaff, setViewingStaff] = useState(null);
  
  // State quản lý Loading
  const [loadingInitial, setLoadingInitial] = useState(false);
  const [loadingStaff, setLoadingStaff] = useState(false);

  // Khởi tạo useApiAction cho thao tác Submit
  const { actionLoading, execute } = useApiAction();

  // State lưu trữ Form đặt lịch
  const currentUser = GetUser();
  const [bookingData, setBookingData] = useState({
    userId: currentUser ? currentUser.id : null,
    serviceIds: [],
    selectedServices: [], // Mảng lưu trữ chi tiết dịch vụ đã chọn
    wardId: null,
    wardName: null,
    appointmentDate: null, 
    startTime: null,
    duration: null,
    previewEndTime: null,       
    startTimeObj: null,    
    staffId: null,
    staffName: null,         
  });

  const [serviceData, setServiceData] = useState([]);
  const [wardData, setWardData] = useState([]);
  const [availableStaffs, setAvailableStaffs] = useState([]);

 // ================== 1. XỬ LÝ DỮ LIỆU KHỞI TẠO VÀ TRUYỀN DỮ LIỆU GIỮA CÁC TRANG ==================
    useEffect(() => {
      console.log("Toàn bộ State nhận được:", location.state);
      // 1. Kiểm tra dữ liệu (selectedList nếu chọn nhiều, hoặc selectedService nếu chọn 1)
      const serviceFromHome = location.state?.selectedService || location.state?.selectedList;
      const shouldAutoNext = location.state?.autoNext;

      if (serviceFromHome) {
        // Đảm bảo dữ liệu luôn là mảng để dễ xử lý (nếu từ Home chỉ gửi 1 cái thì bọc nó vào [])
        const servicesArray = Array.isArray(serviceFromHome) ? serviceFromHome : [serviceFromHome];

        // Tính toán tổng thời gian liệu trình (duration)
        const totalDuration = servicesArray.reduce((sum, s) => sum + (s.duration || 0), 0);

        // 2. Cập nhật dữ liệu vào Booking Data
        setBookingData(prev => ({
          ...prev,
          // 1. Lưu danh sách ID để gửi API sau này
          serviceIds: servicesArray.map(s => s.id),
          
          // 2. Lưu nguyên mảng Object để lấy Tên, Giá hiển thị ở Summary
          selectedServices: servicesArray, 
          
          // 3. Lưu tổng thời gian để lát nữa tính previewEndTime
          duration: totalDuration

        }));

        // 3. Nhảy bước (Dùng setTimeout 0ms là mẹo để thoát khỏi luồng render hiện tại, fix lỗi React)
        if (shouldAutoNext && currentStep === 0) {
          setTimeout(() => {
            setCurrentStep(1);
          }, 0);
        }

        // 4. Quan trọng: Xóa state của location để khi F5 trang không bị nhảy bước vô lý
        window.history.replaceState({}, document.title);
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.state]); // Chỉ chạy 1 lần khi trang Booking vừa load xong


  const handleViewProfile = (e, staff) => {
    e.stopPropagation(); // Không cho chọn nhân viên khi chỉ muốn xem profile
    setViewingStaff(staff);
    setIsProfileModalVisible(true);
};
  // --- 1. Gọi API Lấy Danh sách ban đầu ---
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoadingInitial(true);
      try {
        const [serviceRes, wardRes] = await Promise.all([
          serviceApi.getAll({ pageSize: 100 }),
          wardApi.getAll()
        ]);
        if (serviceRes && serviceRes.items) setServiceData(serviceRes.items);
        if (Array.isArray(wardRes)) setWardData(wardRes);
        else if (wardRes?.items) setWardData(wardRes.items);
      } catch (error) {
        console.log(error);
        message.error('Lỗi khi tải dữ liệu. Vui lòng thử lại!');
      } finally {
        setLoadingInitial(false);
      }
    };
    fetchInitialData();
  }, []);

  const selectedServices = serviceData.filter(s => bookingData.serviceIds.includes(s.id));
  const totalMoney = selectedServices.reduce((sum, s) => sum + s.price, 0);
  const totalTime = selectedServices.reduce((sum, s) => sum + s.duration, 0);
  const previewEndTime = bookingData.startTimeObj && totalTime > 0
    ? bookingData.startTimeObj.add(totalTime, 'minute')
    : null;
  const handleServiceChange = (id) => {

    const newIds = bookingData.serviceIds.includes(id)
      ? bookingData.serviceIds.filter(item => item !== id)
      : [...bookingData.serviceIds, id];

    const newSelectedObjects = serviceData.filter(s => newIds.includes(s.id));
    // 3. Tính toán các thông số từ danh sách mới
    const newTotalDuration = newSelectedObjects.reduce((sum, s) => sum + (s.duration || 0), 0);

    setBookingData({ ...bookingData, 
      serviceIds: newIds,
      selectedServices: newSelectedObjects,
      duration: newTotalDuration
     });
  };

  const fetchAvailableStaffForStep4 = async () => {
  // 1. Kiểm tra nhanh xem người dùng đã chọn đủ thông tin chưa
  if (!bookingData.appointmentDate || !bookingData.startTime || !bookingData.wardId) {
    message.warning("Vui lòng chọn đầy đủ ngày, giờ và chi nhánh!");
    return;
  }

  if (bookingData.serviceIds.length === 0) {
    message.warning("Vui lòng chọn ít nhất một dịch vụ!");
    return;
  }

  setLoadingStaff(true);
  try {
    // 2. Chuẩn bị Params đúng chuẩn Swagger yêu cầu
    const params = {
      date: bookingData.appointmentDate, // Định dạng YYYY-MM-DD
      startTime: Number(bookingData.startTime),
      wardId: Number(bookingData.wardId),
      // Mảng serviceIds sẽ được staffApi.js xử lý qua paramsSerializer
      serviceIds: bookingData.serviceIds.map(id => Number(id)), 
    };

    console.log("🔍 Đang gọi API Staff với Params:", params);

    // 3. Gọi API (Kết quả sẽ được tự động xử lý mảng nhờ config của bạn)
    const res = await staffApi.getAvailable(params);
    
    // 4. Lưu dữ liệu vào state (đề phòng các trường hợp bọc data khác nhau của API)
    const staffList = res?.items || res?.data || res || [];
    setAvailableStaffs(staffList);
    if (staffList.length === 0) {
      message.info("Không có chuyên viên nào rảnh vào khung giờ này.");
    }

  } catch (error) {
    console.error("❌ Lỗi khi lấy danh sách nhân viên:", error);
    // Log chi tiết lỗi từ server để dễ debug
    if (error.response) {
      console.log("Chi tiết lỗi từ Backend:", error.response.data);
    }
    message.error("Không thể tải danh sách nhân viên. Vui lòng thử lại!");
  } finally {
    setLoadingStaff(false);
  }
};

  const next = async () => {
    if (!bookingData.userId) return message.error('Vui lòng đăng nhập để đặt lịch!');

    if (currentStep === 0 && bookingData.serviceIds.length === 0) return message.warning('Chọn ít nhất 1 dịch vụ');
    if (currentStep === 1 && !bookingData.wardId) return message.warning('Chọn chi nhánh');
    if (currentStep === 2) {
      if (!bookingData.appointmentDate || !bookingData.startTimeObj) {
        return message.warning('Vui lòng chọn đầy đủ Ngày và Giờ!');
      }
      await fetchAvailableStaffForStep4();
    }
    setCurrentStep(currentStep + 1);
  };

  const prev = () => setCurrentStep(currentStep - 1);

  // --- 3. Logic Đặt Lịch (ÁP DỤNG useApiAction) ---
  const handleSubmitBooking = async () => {
    const payload = {
      userId: bookingData.userId,
      wardId: bookingData.wardId,
      appointmentDate: bookingData.appointmentDate,
      startTime: bookingData.startTime,
      serviceIds: bookingData.serviceIds,
      staffId: bookingData.staffId,
    };

    // Truyền hàm gọi API và message vào execute cực kỳ gọn gàng
    const { success } = await execute(
      () => appointmentApi.create(payload),
      'Đặt lịch thành công! Cảm ơn bạn.',
      'Có lỗi xảy ra khi đặt lịch. Vui lòng kiểm tra lại!'
    );

    if (success) {
      setIsSuccess(true);
    }
  };

  // ================= CÁC COMPONENT BƯỚC =================
  const ServiceStep = () => {
  // 1. Nhóm dữ liệu theo CategoryName
  const groupedServices = serviceData.reduce((acc, service) => {
    const category = service.categoryName || 'Dịch vụ khác';
    if (!acc[category]) acc[category] = [];
    acc[category].push(service);
    return acc;
  }, {});

  return (
    <Spin spinning={loadingInitial}>
      <div style={{ marginBottom: '20px' }}>
        <Text type="secondary">Vui lòng chọn các dịch vụ bạn muốn trải nghiệm (có thể chọn nhiều)</Text>
      </div>

      {/* Hiển thị theo từng nhóm Category */}
      {Object.keys(groupedServices).map((category) => (
        <div key={category} style={{ marginBottom: '24px' }}>
          <Title level={5} style={{ borderLeft: '4px solid #eb2f96', paddingLeft: '10px', marginBottom: '15px' }}>
            {category}
          </Title>
          
          <Row gutter={[16, 16]}>
            {groupedServices[category].map((item) => {
              const isSelected = bookingData.serviceIds.includes(item.id);
              return (
                <Col xs={24} sm={12} key={item.id}>
                  <Card
                    hoverable
                    onClick={() => handleServiceChange(item.id)}
                    style={{
                      borderRadius: '12px',
                      transition: 'all 0.3s',
                      border: isSelected ? '2px solid #eb2f96' : '1px solid #f0f0f0',
                      background: isSelected ? '#fff0f6' : '#fff',
                    }}
                    bodyStyle={{ padding: '15px' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <Text strong style={{ fontSize: '15px', display: 'block' }}>{item.name}</Text>
                        <Space size="small" style={{ marginTop: '5px' }}>
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            <ClockCircleOutlined /> {item.duration}p
                          </Text>
                          <Text type="danger" strong>{formatCurrency(item.price)}</Text>
                        </Space>
                      </div>
                      <Checkbox checked={isSelected} />
                    </div>
                  </Card>
                </Col>
              );
            })}
          </Row>
        </div>
      ))}

      {/* Thanh tổng kết "Sticky" khi có chọn dịch vụ */}
      {bookingData.serviceIds.length > 0 && (
        <div style={{
          position: 'sticky',
          bottom: '-24px', // Dính sát mép dưới card cha
          margin: '0 -24px -24px -24px',
          padding: '15px 24px',
          background: '#fff',
          borderTop: '1px solid #f0f0f0',
          boxShadow: '0 -4px 12px rgba(0,0,0,0.05)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottomLeftRadius: '12px',
          borderBottomRightRadius: '12px',
          zIndex: 10
        }}>
          <div>
            <Text>Đã chọn: <Badge count={bookingData.serviceIds.length} showZero color="#eb2f96" /></Text>
            <Divider type="vertical" />
            <Text type="secondary">Tổng thời gian: <b>{totalTime} phút</b></Text>
          </div>
          <div>
            <Text style={{ marginRight: '10px' }}>Tổng cộng:</Text>
            <Text type="danger" style={{ fontSize: '20px' }} strong>{formatCurrency(totalMoney)}</Text>
          </div>
        </div>
      )}
    </Spin>
  );
};

  const WardStep = () => (
  <Spin spinning={loadingInitial}>
    <div style={{ marginBottom: '20px' }}>
      <Text type="secondary">Vui lòng chọn cơ sở gần bạn nhất để chúng tôi phục vụ tốt nhất</Text>
    </div>
    
    <Row gutter={[16, 16]}>
      {wardData.map((ward) => {
        const id = ward.id || ward.wardId;
        const isSelected = bookingData.wardId === id;
        
        return (
          <Col xs={24} sm={12} key={id}>
            <Card
              hoverable
              onClick={() => setBookingData({ ...bookingData, wardId: id,wardName: ward.name || ward.wardName })}
              style={{
                borderRadius: '12px',
                transition: 'all 0.3s',
                border: isSelected ? '2px solid #eb2f96' : '1px solid #f0f0f0',
                background: isSelected ? '#fff0f6' : '#fff',
                height: '100%',
                position: 'relative',
                overflow: 'hidden'
              }}
              bodyStyle={{ padding: '20px' }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ 
                    background: isSelected ? '#eb2f96' : '#f5f5f5', 
                    padding: '8px', 
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <EnvironmentOutlined style={{ fontSize: '20px', color: isSelected ? '#fff' : '#eb2f96' }} />
                  </div>
                  {isSelected && (
                    <Badge status="success" text={<Text strong style={{ color: '#eb2f96' }}>Đang chọn</Text>} />
                  )}
                </div>

                <div>
                  <Title level={5} style={{ margin: 0, fontSize: '16px' }}>
                    {ward.name || ward.wardName}
                  </Title>
                  <Text type="secondary" style={{ fontSize: '13px', marginTop: '4px', display: 'block', lineHeight: '1.4' }}>
                    {ward.fullName || 'Địa chỉ chi nhánh hệ thống Spa'}
                  </Text>
                </div>

                <div style={{ 
                  marginTop: '10px', 
                  paddingTop: '10px', 
                  borderTop: '1px solid #f0f0f0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                </div>
              </div>

              {/* Hiệu ứng Check mờ ở góc Card cho pro */}
              {isSelected && (
                <CheckCircleOutlined style={{ 
                  position: 'absolute', 
                  right: '-10px', 
                  bottom: '-10px', 
                  fontSize: '60px', 
                  color: '#eb2f96', 
                  opacity: 0.1 
                }} />
              )}
            </Card>
          </Col>
        );
      })}
    </Row>
  </Spin>
);

  const disabledDate = (current) => current && current < dayjs().startOf('day');
  const TimeStep = () => (
    <div style={{ padding: '10px' }}>
      <Row gutter={[32, 32]}>
        <Col span={24} md={12}>
          <Title level={5}>1. Chọn ngày đến</Title>
          <DatePicker 
            style={{ width: '100%', padding: '10px', borderRadius: '8px' }}
            disabledDate={disabledDate} value={bookingData.appointmentDate ? dayjs(bookingData.appointmentDate) : null}
            onChange={(date, dateString) => setBookingData({ ...bookingData, appointmentDate: dateString })}
            format="YYYY-MM-DD" placeholder="Nhấp để chọn ngày"
          />
        </Col>
        <Col span={24} md={12}>
          <Title level={5}>2. Chọn giờ bắt đầu</Title>
          <TimePicker 
            style={{ width: '100%', padding: '10px', borderRadius: '8px' }}
            format="HH:mm" minuteStep={15} placeholder="Nhấp để chọn giờ" value={bookingData.startTimeObj}
            onChange={(timeObj) => setBookingData({ ...bookingData, startTimeObj: timeObj, startTime: convertDayjsToMinutes(timeObj) })}
          />
        </Col>
      </Row>
      {bookingData.appointmentDate && bookingData.startTimeObj && (
        <Card style={{ marginTop: '30px', background: '#f6ffed', borderColor: '#b7eb8f' }}>
          <Space direction="vertical" size="small">
            <Text>📅 Ngày: <b>{dayjs(bookingData.appointmentDate).format('DD/MM/YYYY')}</b></Text>
            <Text>⏰ Thời gian làm: <Text type="success" strong>{bookingData.startTimeObj.format('HH:mm')}</Text> đến <Text type="danger" strong>{previewEndTime?.format('HH:mm')}</Text></Text>
          </Space>
        </Card>
      )}
    </div>
  );

  const StaffStep = () => (
  <Spin spinning={loadingStaff}>
    <Row gutter={[16, 16]}>
      {/* Thẻ Bất kỳ ai */}
      <Col xs={24} sm={12} md={8}>
        <Card 
          hoverable 
          onClick={() => setBookingData({ ...bookingData, staffId: null })}
          style={{ 
            borderColor: bookingData.staffId === null ? '#eb2f96' : '#f0f0f0', 
            background: bookingData.staffId === null ? '#fff0f6' : '#fff', 
            textAlign: 'center', borderRadius: '12px', height: '100%'
          }}
        >
          <Avatar size={80} icon={<SmileOutlined />} style={{ backgroundColor: '#eb2f96', marginBottom: 15 }} />
          <br /><Text strong style={{ fontSize: '16px' }}>Bất kỳ ai</Text>
          <br /><Text type="secondary" style={{ fontSize: '12px' }}>Hệ thống tự sắp xếp</Text>
        </Card>
      </Col>

      {/* Render từ dữ liệu API của bạn */}
      {availableStaffs.map((staff) => {
        const isSelected = bookingData.staffId === staff.id;
        return (
          <Col xs={24} sm={12} md={8} key={staff.id}>
            <Card 
              hoverable 
              onClick={() => setBookingData({ ...bookingData, staffId: staff.id ,staffName: staff.fullName})}
              style={{ 
                borderColor: isSelected ? '#eb2f96' : '#f0f0f0', 
                background: isSelected ? '#fff0f6' : '#fff', 
                textAlign: 'center', borderRadius: '12px', position: 'relative'
              }}
            >
              <Button 
                type="primary" size="small" shape="round"
                icon={<UserOutlined />}
                style={{ position: 'absolute', right: 10, top: 10, fontSize: '11px', background: '#faad14' }}
                onClick={(e) => handleViewProfile(e, staff)}
              >
                Hồ sơ
              </Button>

              <Avatar size={80} src={staff.avatarUrl} style={{ marginBottom: 15, border: '2px solid #fff' }} />
              <br /><Text strong style={{ fontSize: '16px' }}>{staff.fullName}</Text>
              <br />
              <Text type="secondary" style={{ fontSize: '12px' }} italic>
                "{staff.bio || 'Chuyên viên Spa chuyên nghiệp'}"
              </Text>
            </Card>
          </Col>
        );
      })}
    </Row>

    {/* Modal Hồ Sơ Chi Tiết (Khớp với StaffResponse) */}
    <Modal
      title={<Title level={4} style={{ margin: 0 }}>Hồ sơ Chuyên viên</Title>}
      open={isProfileModalVisible}
      onCancel={() => setIsProfileModalVisible(false)}
      width={500}
      footer={[
        <Button key="close" onClick={() => setIsProfileModalVisible(false)}>Đóng</Button>,
        <Button key="select" type="primary" style={{ background: '#eb2f96' }} onClick={() => {
          setBookingData({ ...bookingData, staffId: viewingStaff.id });
          setIsProfileModalVisible(false);
        }}>Chọn chuyên viên này</Button>
      ]}
    >
      {viewingStaff && (
        <div style={{ textAlign: 'center' }}>
          <Avatar size={120} src={viewingStaff.avatarUrl} style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
          <Title level={3} style={{ marginTop: 15, marginBottom: 5 }}>{viewingStaff.fullName}</Title>
          <Text type="secondary"><EnvironmentOutlined /> {viewingStaff.wardName}</Text>
          
          <div style={{ marginTop: 15, padding: '10px', background: '#fafafa', borderRadius: '8px' }}>
            <Text italic>"{viewingStaff.bio}"</Text>
          </div>

          <Divider orientation="left" style={{ fontSize: '14px' }}>Dịch vụ chuyên trách</Divider>
          <div style={{ textAlign: 'left', maxHeight: '200px', overflowY: 'auto', paddingRight: '5px' }}>
            {viewingStaff.services && viewingStaff.services.map(s => (
              <Tag key={s.id} color="pink" style={{ marginBottom: '8px', borderRadius: '4px' }}>
                {s.name}
              </Tag>
            ))}
          </div>
        </div>
      )}
    </Modal>
  </Spin>
);

  const steps = [
    { title: 'Dịch vụ', content: <ServiceStep /> },
    { title: 'Chi nhánh', content: <WardStep /> },
    { title: 'Thời gian', content: <TimeStep /> },
    { title: 'Nhân viên', content: <StaffStep /> },
    { title: 'Xác nhận', content: <BookingSummary data={bookingData}/> },
  ];

  if (isSuccess) {
    return (
      <Result
        status="success"
        title="Đặt lịch thành công!"
        subTitle="Cảm ơn bạn đã tin tưởng dịch vụ của chúng tôi. Vui lòng đến đúng giờ để có trải nghiệm tốt nhất."
        extra={[
          <Button type="primary" key="home" onClick={() => navigate('/')}>Về trang chủ</Button>,
          <Button key="history" onClick={() => navigate('/my-appointments')}>Xem lịch hẹn</Button>
        ]}
      />
    );
  }

  return (
    <div style={{ maxWidth: '900px', margin: '20px auto', padding: '0 20px' }}>
        <Title level={3} style={{ textAlign: 'center', marginBottom: '20px', color: '#eb2f96' }}>
        ĐẶT LỊCH HẸN
        </Title>
        
        <Steps 
        current={currentStep} 
        items={steps.map(s => ({ title: s.title }))} 
        style={{ marginBottom: '20px' }} 
        size="small"
        />
        
        <Card 
        style={{ 
            borderRadius: '12px', 
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            overflow: 'hidden', // Quan trọng để bo góc không bị vỡ
            display: 'flex',
            flexDirection: 'column',
            height: '70vh', // Chiếm 70% chiều cao màn hình (có thể chỉnh thành 600px nếu muốn cố định)
        }}
        bodyStyle={{ 
            display: 'flex', 
            flexDirection: 'column', 
            height: '100%', 
            padding: 0 // Xóa padding mặc định để tự chia vùng
        }}
        >
        {/* VÙNG 1: NỘI DUNG CÓ THỂ CUỘN (Scrollable) */}
        <div style={{ 
            flex: 1, 
            overflowY: 'auto', 
            padding: '24px',
            background: '#fff' 
        }}>
            {steps[currentStep].content}
        </div>

        {/* VÙNG 2: THANH ĐIỀU HƯỚNG CỐ ĐỊNH (Sticky Footer) */}
        <div style={{ 
            padding: '16px 24px', 
            borderTop: '1px solid #f0f0f0', 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            background: '#fff',
            boxShadow: '0 -4px 10px rgba(0,0,0,0.03)' // Đổ bóng nhẹ lên trên
        }}>
            {currentStep > 0 ? (
            <Button size="large" onClick={prev}>Quay lại</Button>
            ) : (
            <div /> 
            )}
            
            {currentStep < steps.length - 1 && (
            <Button 
                type="primary" 
                size="large" 
                onClick={next} 
                style={{ background: '#eb2f96', borderColor: '#eb2f96', minWidth: '120px' }}
            >
                Tiếp tục
            </Button>
            )}
            
            {currentStep === steps.length - 1 && (
            <Button 
                type="primary" 
                size="large" 
                onClick={handleSubmitBooking} 
                loading={actionLoading}
                style={{ background: '#52c41a', borderColor: '#52c41a', minWidth: '150px' }}
            >
                Xác nhận Đặt lịch
            </Button>
            )}
        </div>
        </Card>
    </div>
    );
};

export default Appointment;
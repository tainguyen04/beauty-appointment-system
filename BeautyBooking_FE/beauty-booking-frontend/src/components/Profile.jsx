import React, { useCallback, useEffect, useState } from 'react';
import { 
  Card, Tabs, Avatar, Button, Upload, 
  Form, Input, message, Tag, Row, Col, Typography, Divider ,Select
} from 'antd';
import { 
  UserOutlined, UploadOutlined, LockOutlined, 
  MailOutlined, PhoneOutlined, SafetyCertificateOutlined , EnvironmentOutlined 
} from '@ant-design/icons';
import { useApiAction } from '../hooks/useApiAction'; // MỚI: Import useApiAction
import userApi from '../api/userApi';
import wardApi from '../api/wardApi';
const { Title, Text } = Typography;

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

    const [wards, setWards] = useState([]);
    const [loadingWards, setLoadingWards] = useState(false);
  
  // MỚI: Khởi tạo hook quản lý action
  const { actionLoading, execute } = useApiAction(); 
  
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();

  // 1. Lấy thông tin cá nhân từ Token (GetMyProfile)
  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const res = await userApi.getMyProfile();
      setUser(res);
      form.setFieldsValue({
        fullName: res.fullName,
        phone: res.phone,
        wardId: res.wardId,
        address: res.address
      });
    } catch (error) {
      console.log(error);
      message.error("Không thể tải thông tin hồ sơ");
    } finally {
      setLoading(false);
    }
  }, [form]);

  useEffect(() => {
  const fetchWards = async () => {
    setLoadingWards(true);
    try {
      const res = await wardApi.getAll(); // Điều chỉnh tên hàm nếu API của bạn khác (vd: getList)
      const data = res?.data || res || [];
      setWards(data);
    } catch (error) {
      console.error("Lỗi khi tải danh sách phường:", error);
    } finally {
      setLoadingWards(false);
    }
  };
    fetchWards();
}, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // 2. MỚI: Xử lý cập nhật Profile bằng execute
  const onUpdateProfile = async (values) => {
    const formData = new FormData();
    formData.append('FullName', values.fullName);
    formData.append('Phone', values.phone);
    if(values.wardId) formData.append('WardId', values.wardId);
    if(values.address) formData.append('Address', values.address);

    // Xử lý file từ Ant Design Upload
    if (values.avatarUrl && values.avatarUrl.fileList && values.avatarUrl.fileList.length > 0) {
      formData.append('AvatarUrl', values.avatarUrl.fileList[0].originFileObj);
    }

    const { success } = await execute(
      () => userApi.updateMyProfile(formData),
      "Cập nhật hồ sơ thành công!"
    );

    if (success) {
      await fetchProfile(); // Load lại dữ liệu để cập nhật UI
    }
  };

  // 3. MỚI: Xử lý đổi mật khẩu bằng execute
  const onChangePassword = async (values) => {
    const { success } = await execute(
      () => userApi.changeMyPassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword
      }),
      "Đổi mật khẩu thành công!"
    );

    if (success) {
      passwordForm.resetFields();
    }
  };

  const getRoleColor = (role) => {
    if (role?.toLowerCase() === 'admin') return 'volcano';
    if (role?.toLowerCase() === 'staff') return 'blue';
    return 'green';
  };

  return (
    <div style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>
      <Row gutter={24}>
        {/* CỘT TRÁI: THÔNG TIN TỔNG QUAN */}
        <Col xs={24} md={8}>
          <Card bordered={false} className="text-center" style={{ textAlign: 'center' }} loading={loading}>
            <Avatar 
              size={120} 
              src={user?.avatarUrl} 
              icon={<UserOutlined />} 
              style={{ border: '4px solid #fff', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
            />
            <Title level={4} style={{ marginTop: 16, marginBottom: 4 }}>{user?.fullName}</Title>
            <Tag color={getRoleColor(user?.role)}>{user?.role?.toUpperCase()}</Tag>
            
            <Divider />
            
            <div style={{ textAlign: 'left' }}>
              <p><MailOutlined /> <Text strong> Email:</Text> {user?.email}</p>
              <p><PhoneOutlined /> <Text strong> SĐT:</Text> {user?.phone || user?.phoneNumber || 'N/A'}</p>
              <p><EnvironmentOutlined /> <Text strong> Địa chỉ:</Text> {user?.address || 'N/A'}</p>
              <p><SafetyCertificateOutlined /> <Text strong> Trạng thái:</Text> <Tag color="green">Hoạt động</Tag></p>
            </div>
          </Card>
        </Col>

        {/* CỘT PHẢI: FORM CHỈNH SỬA */}
        <Col xs={24} md={16}>
          <Card bordered={false}>
            <Tabs defaultActiveKey="1">
              <Tabs.TabPane tab="Chỉnh sửa thông tin" key="1">
                <Form 
                  form={form} 
                  layout="vertical" 
                  onFinish={onUpdateProfile}
                  initialValues={{ fullName: user?.fullName, phone: user?.phone, wardId: user?.wardId, address: user?.address }}
                >
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item 
                        name="fullName" 
                        label="Họ và tên" 
                        rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
                      >
                        <Input placeholder="Nhập họ tên" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="phone" label="Số điện thoại">
                        <Input placeholder="Nhập số điện thoại" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="address" label="Địa chỉ">
                        <Input placeholder="Nhập địa chỉ" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="wardId" label="Khu vực (Phường/Xã)">
                        <Select
                          showSearch 
                          placeholder="Chọn khu vực quản lý"
                          loading={loadingWards}
                          optionFilterProp="children"
                          filterOption={(input, option) =>
                            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                          }
                          options={wards.map(w => ({
                            value: w.wardId || w.id, 
                            label: w.fullName || w.name 
                          }))}
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item name="avatarUrl" label="Thay đổi ảnh đại diện">
                    <Upload 
                      listType="picture-card"
                      maxCount={1} 
                      beforeUpload={() => false}
                    >
                      <div>
                        <UploadOutlined />
                        <div style={{ marginTop: 8 }}>Chọn ảnh</div>
                      </div>
                    </Upload>
                  </Form.Item>

                  <Button type="primary" htmlType="submit" loading={actionLoading}>
                    Lưu thay đổi
                  </Button>
                </Form>
              </Tabs.TabPane>

              <Tabs.TabPane tab="Bảo mật & Mật khẩu" key="2">
                <Form 
                  form={passwordForm} 
                  layout="vertical" 
                  onFinish={onChangePassword}
                >
                  <Form.Item 
                    name="currentPassword" 
                    label="Mật khẩu hiện tại" 
                    rules={[{ required: true, message: 'Nhập mật khẩu hiện tại' }]}
                  >
                    <Input.Password prefix={<LockOutlined />} />
                  </Form.Item>

                  <Form.Item 
                    name="newPassword" 
                    label="Mật khẩu mới" 
                    rules={[
                      { required: true, message: 'Nhập mật khẩu mới' },
                      { min: 6, message: 'Mật khẩu phải từ 6 ký tự' }
                    ]}
                  >
                    <Input.Password prefix={<LockOutlined />} />
                  </Form.Item>

                  <Form.Item 
                    name="confirmPassword" 
                    label="Xác nhận mật khẩu mới" 
                    dependencies={['newPassword']}
                    rules={[
                      { required: true, message: 'Xác nhận lại mật khẩu' },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || getFieldValue('newPassword') === value) {
                            return Promise.resolve();
                          }
                          return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                        },
                      }),
                    ]}
                  >
                    <Input.Password prefix={<LockOutlined />} />
                  </Form.Item>

                  <Button type="primary" danger htmlType="submit" loading={actionLoading}>
                    Đổi mật khẩu
                  </Button>
                </Form>
              </Tabs.TabPane>
            </Tabs>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Profile;
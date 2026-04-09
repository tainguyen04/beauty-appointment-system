import { Form, Input, Button, Card, Typography, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import authApi from '../../api/AuthApi';

const { Title } = Typography;

const Login = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    try {
      // 1. Gọi API
      const response = await authApi.login({
        email: values.email,
        password: values.password,
      });

      // 2. Lấy dữ liệu từ Backend trả về 
      // (Lưu ý: C# .NET 8 mặc định sẽ đổi tên biến thành viết thường chữ cái đầu camelCase)
      console.log("Dữ liệu từ BE:", response);
      const token = response.token;
      const userInfo = response.user; // Thay "userResponse" bằng đúng tên trường BE trả về nếu khác

      // 3. Lưu vào LocalStorage
      localStorage.setItem('token', token); 
      localStorage.setItem('user', JSON.stringify(userInfo)); // Ép Object thành String để lưu

      message.success(`Đăng nhập thành công! Chào mừng ${userInfo.fullName || 'bạn'}.`);

      // 4. CHUYỂN HƯỚNG THÔNG MINH DỰA VÀO QUYỀN (ROLE)
      // Giả sử trong UserResponse của bạn có trường role (hoặc RoleName)
      if (userInfo.role === 'Admin' || userInfo.role === 'Staff') {
        navigate('/admin'); // Trực chỉ trang Quản trị
      } else {
        navigate('/'); // Khách hàng thì ra trang chủ đặt lịch
      }

    } catch (error) {
      message.error(error.response?.data?.message || 'Đăng nhập thất bại. Kiểm tra lại thông tin!');
      console.log('Lỗi chi tiết:', error);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f0f2f5' }}>
      <Card style={{ width: 400, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', borderRadius: 8 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={3} style={{ margin: 0 }}>Đăng Nhập</Title>
          <p style={{ color: 'gray', marginTop: 8 }}>Hệ thống Beauty Booking</p>
        </div>

        <Form form={form} name="login_form" onFinish={onFinish} layout="vertical" size="large">
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Vui lòng nhập Email!' },
              { type: 'email', message: 'Email không đúng định dạng!' }
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="Email của bạn" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Vui lòng nhập Mật khẩu!' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Đăng nhập
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center' }}>
            Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Login;
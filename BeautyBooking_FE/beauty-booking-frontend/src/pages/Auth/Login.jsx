import { Form, Input, Button, Card, Typography } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { useApiAction } from '../../hooks/useApiAction'; // MỚI: Import useApiAction
import authApi from '../../api/AuthApi';

const { Title } = Typography;

const Login = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  
  // MỚI: Khởi tạo hook quản lý action
  const { actionLoading, execute } = useApiAction();

  const onFinish = async (values) => {
    // 1. Thực thi API qua hook. Lấy về trạng thái success và dữ liệu response
    const { success, data: response } = await execute(
      () => authApi.login({
        email: values.email,
        password: values.password,
      }),
      "Đăng nhập thành công!"
    );

    // 2. Nếu thành công, tiến hành lưu token và điều hướng
    if (success && response) {
      const token = response.token;
      const userInfo = response.user; // Thay bằng đúng tên trường BE trả về nếu khác

      // Lưu vào LocalStorage
      localStorage.setItem('token', token); 
      localStorage.setItem('user', JSON.stringify(userInfo));

      // 3. CHUYỂN HƯỚNG THÔNG MINH DỰA VÀO QUYỀN (ROLE)
      if (userInfo.role === 'Admin' || userInfo.role === 'Staff') {
        navigate('/admin'); // Trực chỉ trang Quản trị
      } else {
        navigate('/'); // Khách hàng thì ra trang chủ đặt lịch
      }
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f0f2f5' }}>
      <Card style={{ width: 400, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', borderRadius: 8 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={3} style={{ margin: 0 }}>Đăng Nhập</Title>
          <p style={{ color: 'gray', marginTop: 8 }}>Hệ thống EcoBeauty</p>
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
            <Button type="primary" htmlType="submit" block loading={actionLoading}>
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
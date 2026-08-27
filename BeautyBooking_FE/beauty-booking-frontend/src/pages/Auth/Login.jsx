import { Form, Input, Button, Card, Typography, Checkbox, Divider, message } from 'antd';
import { UserOutlined, LockOutlined,HomeOutlined } from '@ant-design/icons';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useApiAction } from '../../hooks/useApiAction'; // MỚI: Import useApiAction
import authApi from '../../api/authApi';
import { useEffect } from 'react';

const { Title } = Typography;

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from =  location.state?.from || '/'; // Lấy đường dẫn trước đó hoặc mặc định về trang chủ sau khi đăng nhập thành công
  const [form] = Form.useForm();
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      form.setFieldsValue({ email: rememberedEmail, remember: true });
    }
  }, [form]);

  // MỚI: Khởi tạo hook quản lý action
  const { actionLoading, execute } = useApiAction();

  const handleLoginSuccess = (response, remember, rememberedEmail = null) => {
    const token = response.accessToken;
    const userInfo = response.user;

    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('user');

    if (remember) {
      localStorage.setItem('remember', 'true');
      localStorage.setItem('accessToken', token);
      localStorage.setItem('user', JSON.stringify(userInfo));
      if (rememberedEmail) {
        localStorage.setItem('rememberedEmail', rememberedEmail);
      } else {
        localStorage.removeItem('rememberedEmail');
      }
    } else {
      sessionStorage.setItem('accessToken', token);
      sessionStorage.setItem('user', JSON.stringify(userInfo));
      localStorage.removeItem('rememberedEmail');
      localStorage.removeItem('remember');
    }

    if (userInfo.role === 'Admin' || userInfo.role === 'Staff') {
      navigate('/admin');
    } else {
      navigate(from, { replace: true });
    }
  };

  const onFinish = async (values) => {
    // 1. Thực thi API qua hook. Lấy về trạng thái success và dữ liệu response
    const { success, data: response } = await execute(
      () => authApi.login({
        email: values.email,
        password: values.password,
      }),
      "Đăng nhập thành công!",
      "Sai tài khoản hoặc mật khẩu"
    );

    if (success && response) {
      handleLoginSuccess(response, values.remember, values.email);
    }
  };

  const handleGoogleSuccess = async ({ credential }) => {
    if (!credential) {
      message.error('Google không trả về thông tin đăng nhập.');
      return;
    }

    const { success, data: response } = await execute(
      () => authApi.signInGoogle(credential),
      'Đăng nhập Google thành công!',
      'Không thể đăng nhập bằng Google.',
    );

    if (success && response) {
      handleLoginSuccess(response, form.getFieldValue('remember') ?? true);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f0f2f5' }}>
      <Card style={{ width: 400, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', borderRadius: 8 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={3} style={{ margin: 0 }}>Đăng Nhập</Title>
          <p style={{ color: 'gray', marginTop: 8 }}>Hệ thống EcoBeauty</p>
        </div>

        <Form form={form} 
        name="login_form" 
        onFinish={onFinish} 
        layout="vertical" 
        size="large"
        initialValues={{remember: true}}>
          <Form.Item
            name="email"  
            rules={[
              { required: true, message: 'Vui lòng nhập Tài khoản!' },
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="Email của bạn" autoComplete='username'/>
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Vui lòng nhập Mật khẩu!' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" autoComplete='current-password' />
          </Form.Item>
            <Form.Item name="remember" valuePropName="checked">
            <Checkbox>Nhớ đăng nhập của tôi</Checkbox>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={actionLoading} style={{ backgroundColor: '#eb2f96', borderColor: '#eb2f96' }}>
              Đăng nhập
            </Button>
          </Form.Item>
          <Divider plain>Hoặc</Divider>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => message.error('Không thể mở đăng nhập Google.')}
              text="signin_with"
              shape="rectangular"
              width="350"
            />
          </div>
          <div style={{ textAlign: 'center', marginTop: 10 }}>
            <Link to="/" style={{ color: '#eb2f96' }}>
              <HomeOutlined /> Về trang chủ
            </Link>
          </div>
          <div style={{ textAlign: 'center', marginTop: 10 }}>
            Chưa có tài khoản? <Link to="/register" style={{ color: '#eb2f96' }}>Đăng ký ngay</Link>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Login;

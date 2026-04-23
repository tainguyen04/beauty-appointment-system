import { Form, Input, Button, Card, Typography } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined,HomeOutlined   } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { useApiAction } from '../../hooks/useApiAction'; // MỚI: Import custom hook
import authApi from '../../api/authApi'; // MỚI: Import api

const { Title } = Typography;

const Register = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  
  // MỚI: Khởi tạo hook quản lý action
  const { actionLoading, execute } = useApiAction();

  const onFinish = async (values) => {
    // 1. Thực thi API qua hook (gửi fullName, email, password)
    // Lưu ý: confirmPassword chỉ dùng để validate ở frontend, không cần gửi lên BE
    const { success } = await execute(
      () => authApi.register({
        fullName: values.fullName,
        email: values.email,
        password: values.password
      }),
      'Đăng ký thành công! Vui lòng đăng nhập.'
    );

    // 2. Chuyển hướng nếu đăng ký thành công
    if (success) {
      navigate('/login');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f0f2f5' }}>
      <Card style={{ width: 450, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', borderRadius: 8 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={3} style={{ margin: 0 }}>Đăng Ký Tài Khoản</Title>
        </div>

        <Form form={form} name="register_form" onFinish={onFinish} layout="vertical" size="large">
          <Form.Item
            name="fullName"
            rules={[{ required: true, message: 'Vui lòng nhập Họ và Tên!' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Họ và Tên" />
          </Form.Item>

          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Vui lòng nhập Tên đăng nhập!' }
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="Tên đăng nhập" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'Vui lòng nhập Mật khẩu!' },
              { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
            ]}
            hasFeedback
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" />
          </Form.Item>

          {/* Rule check mật khẩu nhập lại cực hay của Ant Design */}
          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
            hasFeedback
            rules={[
              { required: true, message: 'Vui lòng xác nhận Mật khẩu!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Mật khẩu nhập lại không khớp!'));
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Nhập lại Mật khẩu" />
          </Form.Item>

          <Form.Item>
            {/* MỚI: Gắn trạng thái loading vào nút submit */}
            <Button type="primary" htmlType="submit" block loading={actionLoading}style={{ backgroundColor: '#eb2f96', borderColor: '#eb2f96' }}>
              Đăng ký
            </Button>
          </Form.Item>
          <div style={{ textAlign: 'center', marginTop: 10 }}>
            <Link to="/" style={{ color: '#eb2f96' }}>
              <HomeOutlined /> Về trang chủ
            </Link>
          </div>
          <div style={{ textAlign: 'center' }}>
            Đã có tài khoản? <Link to="/login" style={{ color: '#eb2f96' }}>Đăng nhập</Link>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Register;
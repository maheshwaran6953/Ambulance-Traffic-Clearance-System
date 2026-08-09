import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';
import { Card, Form, Input, Button, Alert, Typography, Divider, message } from 'antd';
import { UserOutlined, LockOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { Siren, ShieldCheck, Ambulance } from 'lucide-react';

const { Title, Text } = Typography;

export const Login: React.FC = () => {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form] = Form.useForm();

  const handleSubmit = async (values: { username: string; password: string }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.login(values.username, values.password);
      login(response);
      message.success(`Welcome back, ${response.entityName || response.username}!`);
    } catch (err: unknown) {
      console.error(err);
      setError('Invalid username or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (user: string) => {
    form.setFieldsValue({
      username: user,
      password: 'Password123!',
    });
    form.submit();
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at top, #1f293d 0%, #0b0f19 100%)',
      padding: '24px'
    }}>
      <Card className="glass-card" style={{ width: '100%', maxWidth: '460px', borderRadius: '20px', padding: '12px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #ef4444, #b91c1c)',
            boxShadow: '0 0 30px rgba(239,68,68,0.6)',
            marginBottom: '16px'
          }}>
            <Siren color="#fff" size={32} className="siren-badge" />
          </div>

          <Title level={3} style={{ color: '#fff', marginBottom: '4px' }}>
            Emergency Corridor Sign-In
          </Title>
          <Text type="secondary" style={{ color: '#9ca3af', fontSize: '13px' }}>
            Ambulance Crew | Traffic Police | Admin System
          </Text>
        </div>

        {error && (
          <Alert message={error} type="error" showIcon style={{ marginBottom: '20px', borderRadius: '8px' }} />
        )}

        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label={<Text style={{ color: '#d1d5db' }}>Username</Text>}
            name="username"
            rules={[{ required: true, message: 'Please enter your username' }]}
          >
            <Input
              prefix={<UserOutlined style={{ color: '#9ca3af' }} />}
              placeholder="Username"
              size="large"
              style={{ background: '#111827', borderColor: '#374151', color: '#fff' }}
            />
          </Form.Item>

          <Form.Item
            label={<Text style={{ color: '#d1d5db' }}>Password</Text>}
            name="password"
            rules={[{ required: true, message: 'Please enter your password' }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#9ca3af' }} />}
              placeholder="Password"
              size="large"
              style={{ background: '#111827', borderColor: '#374151', color: '#fff' }}
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              loading={loading}
              style={{
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                borderColor: '#ef4444',
                height: '48px',
                fontWeight: 700,
                fontSize: '16px',
                borderRadius: '10px',
                boxShadow: '0 4px 14px rgba(239, 68, 68, 0.4)'
              }}
            >
              LOG IN TO DASHBOARD
            </Button>
          </Form.Item>
        </Form>

        <Divider style={{ borderColor: 'rgba(255,255,255,0.1)', color: '#6b7280', fontSize: '12px' }}>
          DEMO QUICK LOGIN ACCOUNTS
        </Divider>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Button
            block
            icon={<Ambulance size={16} />}
            onClick={() => handleQuickLogin('ambulance1')}
            style={{ background: 'rgba(239, 68, 68, 0.15)', borderColor: '#ef4444', color: '#fca5a5', height: '38px', borderRadius: '8px' }}
          >
            Ambulance 1 Crew (KA-01-EQ-9901)
          </Button>

          <Button
            block
            icon={<ShieldCheck size={16} />}
            onClick={() => handleQuickLogin('police1')}
            style={{ background: 'rgba(59, 130, 246, 0.15)', borderColor: '#3b82f6', color: '#93c5fd', height: '38px', borderRadius: '8px' }}
          >
            Police Officer 1 (Signal-1: Central Hospital Junction)
          </Button>

          <Button
            block
            icon={<ShieldCheck size={16} />}
            onClick={() => handleQuickLogin('police2')}
            style={{ background: 'rgba(59, 130, 246, 0.15)', borderColor: '#3b82f6', color: '#93c5fd', height: '38px', borderRadius: '8px' }}
          >
            Police Officer 2 (Signal-2: Ring Road Cross)
          </Button>

          <Button
            block
            icon={<SafetyCertificateOutlined />}
            onClick={() => handleQuickLogin('admin')}
            style={{ background: 'rgba(139, 92, 246, 0.15)', borderColor: '#8b5cf6', color: '#c4b5fd', height: '38px', borderRadius: '8px' }}
          >
            Admin Control Center
          </Button>
        </div>
      </Card>
    </div>
  );
};

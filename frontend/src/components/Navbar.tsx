import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Button, Tag, Typography } from 'antd';
import { LogoutOutlined, SafetyCertificateOutlined, UserOutlined } from '@ant-design/icons';
import { Siren } from 'lucide-react';

const { Text } = Typography;

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

  if (!user) return null;

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Ambulance': return 'red';
      case 'Police': return 'blue';
      case 'Admin': return 'purple';
      default: return 'default';
    }
  };

  return (
    <header style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '14px 28px',
      background: 'rgba(11, 15, 25, 0.95)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      backdropFilter: 'blur(10px)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          background: 'linear-gradient(135deg, #ef4444, #dc2626)',
          padding: '8px',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          boxShadow: '0 0 15px rgba(239,68,68,0.5)'
        }}>
          <Siren color="#fff" size={24} className="siren-badge" />
        </div>
        <div>
          <Text strong style={{ fontSize: '18px', color: '#fff', letterSpacing: '0.5px' }}>
            SMART AMBULANCE CLEARANCE
          </Text>
          <Text type="secondary" style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: '#9ca3af' }}>
            Real-Time Emergency Corridor Response System
          </Text>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ textAlign: 'right' }}>
          <Text strong style={{ color: '#f3f4f6', display: 'block' }}>
            <UserOutlined style={{ marginRight: '6px' }} />
            {user.entityName || user.username}
          </Text>
          {user.signalLocation && (
            <Text type="secondary" style={{ fontSize: '12px', color: '#9ca3af' }}>
              📍 {user.signalLocation}
            </Text>
          )}
        </div>

        <Tag color={getRoleColor(user.role)} icon={<SafetyCertificateOutlined />} style={{ padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 700 }}>
          {user.role.toUpperCase()}
        </Tag>

        <Button
          type="primary"
          danger
          icon={<LogoutOutlined />}
          onClick={logout}
          style={{ borderRadius: '8px' }}
        >
          Logout
        </Button>
      </div>
    </header>
  );
};

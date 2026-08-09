import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Login } from './pages/Login';
import { AmbulanceDashboard } from './pages/AmbulanceDashboard';
import { PoliceDashboard } from './pages/PoliceDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { ConfigProvider, theme } from 'antd';

const AppContent: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <Login />;
  }

  const renderDashboard = () => {
    switch (user.role) {
      case 'Ambulance':
        return <AmbulanceDashboard />;
      case 'Police':
        return <PoliceDashboard />;
      case 'Admin':
        return <AdminDashboard />;
      default:
        return <Login />;
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0b0f19' }}>
      <Navbar />
      <main style={{ paddingBottom: '40px' }}>
        {renderDashboard()}
      </main>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#ef4444',
          borderRadius: 10,
          colorBgContainer: '#111827',
          colorBgElevated: '#1f293d',
          fontFamily: "'Inter', system-ui, sans-serif",
        },
      }}
    >
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ConfigProvider>
  );
};

export default App;

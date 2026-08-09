import React, { useState, useEffect } from 'react';
import { adminService } from '../services/api';
import { signalRService } from '../services/signalrService';
import type { AdminStatsDto, PoliceOfficerDto, NotificationResponse } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { Card, Row, Col, Typography, Table, Tag, Spin, Badge, Space } from 'antd';
import { Activity, Siren, Shield, CheckCircle, Radio, Clock } from 'lucide-react';

const { Title, Text } = Typography;

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminStatsDto | null>(null);
  const [officers, setOfficers] = useState<PoliceOfficerDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsData, officersData] = await Promise.all([
        adminService.getStats(),
        adminService.getOfficers(),
      ]);
      setStats(statsData);
      setOfficers(officersData);
    } catch (err) {
      console.error('Error loading admin dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();

    // Real-time updates via SignalR
    signalRService.onEmergencyNotification(() => {
      fetchAdminData();
    });

    signalRService.onStatusUpdated(() => {
      fetchAdminData();
    });

    signalRService.onTripCancelled(() => {
      fetchAdminData();
    });
  }, []);

  if (loading || !stats) {
    return (
      <div style={{ textAlign: 'center', padding: '80px' }}>
        <Spin size="large" tip="Connecting to Admin Control Room..." />
      </div>
    );
  }

  const activeTripColumns = [
    {
      title: 'Trip ID',
      dataIndex: 'id',
      key: 'id',
      render: (id: number) => <Tag color="volcano">#{id}</Tag>,
    },
    {
      title: 'Ambulance Reg No',
      dataIndex: 'ambulanceRegNo',
      key: 'ambulanceRegNo',
      render: (text: string, record: { driverName: string }) => (
        <div>
          <Text strong style={{ color: '#fff' }}>{text}</Text>
          <Text type="secondary" style={{ display: 'block', fontSize: '12px' }}>Driver: {record.driverName}</Text>
        </div>
      ),
    },
    {
      title: 'Route (From -> To)',
      key: 'route',
      render: (_: unknown, record: { fromLocation: string; toLocation: string }) => (
        <Text style={{ color: '#d1d5db' }}>
          {record.fromLocation} ➔ {record.toLocation}
        </Text>
      ),
    },
    {
      title: 'Started At',
      dataIndex: 'startedAt',
      key: 'startedAt',
      render: (date: string) => (
        <Text type="secondary" style={{ fontSize: '13px' }}>
          <Clock size={14} style={{ display: 'inline', marginRight: '4px' }} />
          {new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </Text>
      ),
    },
    {
      title: 'Active Signal Junctions Status',
      key: 'notifications',
      render: (_: unknown, record: { notifications: NotificationResponse[] }) => (
        <Space direction="vertical" style={{ width: '100%' }}>
          {record.notifications.map((n) => (
            <div key={n.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
              <Text style={{ color: '#9ca3af', width: '200px' }}>{n.signalLocation}:</Text>
              <StatusBadge status={n.status} />
            </div>
          ))}
        </Space>
      ),
    },
  ];

  const officerColumns = [
    {
      title: 'Officer Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: { badgeNo: string }) => (
        <div>
          <Text strong style={{ color: '#fff' }}>{name}</Text>
          <Text type="secondary" style={{ display: 'block', fontSize: '12px' }}>Badge: {record.badgeNo}</Text>
        </div>
      ),
    },
    {
      title: 'Assigned Signal Location',
      dataIndex: 'signalLocation',
      key: 'signalLocation',
      render: (loc: string) => <Tag color="blue">📍 {loc}</Tag>,
    },
    {
      title: 'Contact',
      dataIndex: 'contactNumber',
      key: 'contactNumber',
      render: (num: string) => <Text style={{ color: '#9ca3af' }}>{num}</Text>,
    },
    {
      title: 'System Status',
      dataIndex: 'currentStatus',
      key: 'currentStatus',
      render: () => <Badge status="processing" text={<Text style={{ color: '#10b981' }}>Monitoring Live</Text>} />,
    },
  ];

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px' }}>
      {/* Title Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <div style={{ background: '#8b5cf6', padding: '10px', borderRadius: '12px' }}>
          <Radio color="#fff" size={24} />
        </div>
        <div>
          <Title level={3} style={{ color: '#fff', margin: 0 }}>
            ADMIN EMERGENCY CONTROL ROOM
          </Title>
          <Text type="secondary" style={{ color: '#9ca3af', fontSize: '13px' }}>
            System-Wide Emergency Corridor Analytics & Traffic Police Signal Monitoring
          </Text>
        </div>
      </div>

      {/* Metrics Cards */}
      <Row gutter={[20, 20]} style={{ marginBottom: '28px' }}>
        <Col xs={12} sm={6}>
          <Card className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text type="secondary" style={{ fontSize: '12px', textTransform: 'uppercase' }}>Active Emergency Trips</Text>
                <Title level={2} style={{ color: '#ef4444', margin: '4px 0 0 0' }}>{stats.activeTripsCount}</Title>
              </div>
              <Siren color="#ef4444" size={32} className="siren-badge" />
            </div>
          </Card>
        </Col>

        <Col xs={12} sm={6}>
          <Card className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text type="secondary" style={{ fontSize: '12px', textTransform: 'uppercase' }}>Cleared Junctions</Text>
                <Title level={2} style={{ color: '#10b981', margin: '4px 0 0 0' }}>{stats.clearedJunctionsCount}</Title>
              </div>
              <CheckCircle color="#10b981" size={32} />
            </div>
          </Card>
        </Col>

        <Col xs={12} sm={6}>
          <Card className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text type="secondary" style={{ fontSize: '12px', textTransform: 'uppercase' }}>Monitored Officers</Text>
                <Title level={2} style={{ color: '#3b82f6', margin: '4px 0 0 0' }}>{stats.totalOfficersCount}</Title>
              </div>
              <Shield color="#3b82f6" size={32} />
            </div>
          </Card>
        </Col>

        <Col xs={12} sm={6}>
          <Card className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text type="secondary" style={{ fontSize: '12px', textTransform: 'uppercase' }}>Completed Emergency Trips</Text>
                <Title level={2} style={{ color: '#8b5cf6', margin: '4px 0 0 0' }}>{stats.completedTripsCount}</Title>
              </div>
              <Activity color="#8b5cf6" size={32} />
            </div>
          </Card>
        </Col>
      </Row>

      {/* Active Trips Live Monitoring */}
      <Card className="glass-card" style={{ marginBottom: '24px' }}>
        <Title level={4} style={{ color: '#fff', marginBottom: '16px' }}>
          🚨 REAL-TIME ACTIVE EMERGENCY TRIPS
        </Title>
        <Table
          dataSource={stats.activeTrips}
          columns={activeTripColumns}
          rowKey="id"
          pagination={false}
          locale={{ emptyText: 'No active emergency trips in progress.' }}
        />
      </Card>

      {/* Police Officers Signal Station Matrix */}
      <Card className="glass-card">
        <Title level={4} style={{ color: '#fff', marginBottom: '16px' }}>
          👮 TRAFFIC POLICE OFFICER SIGNAL MATRIX
        </Title>
        <Table
          dataSource={officers}
          columns={officerColumns}
          rowKey="id"
          pagination={false}
        />
      </Card>
    </div>
  );
};

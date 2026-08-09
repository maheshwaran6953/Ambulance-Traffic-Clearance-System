import React, { useState, useEffect } from 'react';
import { policeService } from '../services/api';
import { signalRService } from '../services/signalrService';
import { audioService } from '../services/audioService';
import type { NotificationResponse, NotificationStatus } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { Card, Button, Typography, Row, Col, Tag, Modal, Spin, message, Space } from 'antd';
import { Shield, Siren, CheckCircle, CarFront, Volume2, VolumeX, PhoneCall, MapPin, Clock } from 'lucide-react';
import { CheckOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

export const PoliceDashboard: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(audioService.getIsMuted());
  const [incomingAlert, setIncomingAlert] = useState<NotificationResponse | null>(null);

  const fetchOfficerNotifications = async () => {
    setLoading(true);
    try {
      const data = await policeService.getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error('Error fetching officer notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOfficerNotifications();

    // Listen for real-time incoming emergency alerts directed to this officer's signal
    signalRService.onEmergencyNotification((newNotification: NotificationResponse) => {
      setNotifications((prev) => [newNotification, ...prev.filter((n) => n.id !== newNotification.id)]);
      setIncomingAlert(newNotification);

      // Play real-time audio siren sound chime
      audioService.playSirenChime();
    });

    // Listen for real-time status updates
    signalRService.onStatusUpdated((updatedNotification: NotificationResponse) => {
      setNotifications((prev) =>
        prev.map((n) => (n.id === updatedNotification.id ? updatedNotification : n))
      );
    });

    signalRService.onTripCancelled(() => {
      fetchOfficerNotifications();
    });
  }, []);

  const handleToggleSound = () => {
    const muted = audioService.toggleMute();
    setIsAudioMuted(muted);
    message.info(muted ? '🔇 Siren Audio Muted' : '🔔 Siren Audio Enabled');
  };

  const handleUpdateStatus = async (notificationId: number, status: NotificationStatus) => {
    try {
      const updated = await policeService.updateStatus(notificationId, status);
      setNotifications((prev) => prev.map((n) => (n.id === notificationId ? updated : n)));
      message.success(`Signal junction status updated to ${status}!`);

      if (incomingAlert && incomingAlert.id === notificationId) {
        setIncomingAlert(null);
      }
    } catch (err) {
      console.error('Failed to update status:', err);
      message.error('Failed to update clearance status.');
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px' }}>
        <Spin size="large" tip="Loading Officer Junction Control Station..." />
      </div>
    );
  }

  const activeApproaching = notifications.filter((n) => n.status !== 'Passed');

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
      {/* Header bar with Officer controls & Sound toggle */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: '#3b82f6', padding: '10px', borderRadius: '12px' }}>
            <Shield color="#fff" size={24} />
          </div>
          <div>
            <Title level={3} style={{ color: '#fff', margin: 0 }}>
              POLICE SIGNAL JUNCTION DASHBOARD
            </Title>
            <Text type="secondary" style={{ color: '#9ca3af', fontSize: '13px' }}>
              Real-Time Emergency Corridor Clearance Control
            </Text>
          </div>
        </div>

        <Button
          type={isAudioMuted ? 'default' : 'primary'}
          icon={isAudioMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          onClick={handleToggleSound}
          style={{
            borderRadius: '10px',
            background: isAudioMuted ? 'rgba(255,255,255,0.08)' : '#3b82f6',
            borderColor: isAudioMuted ? '#4b5563' : '#3b82f6',
            height: '42px',
            fontWeight: 600
          }}
        >
          {isAudioMuted ? 'Siren Muted' : 'Siren Sound On'}
        </Button>
      </div>

      {/* Real-time Emergency Pop-up Modal when new notification arrives */}
      <Modal
        open={!!incomingAlert}
        onCancel={() => setIncomingAlert(null)}
        footer={null}
        centered
        width={500}
        styles={{ body: { background: '#111827', border: '2px solid #ef4444', borderRadius: '20px' } }}
      >
        {incomingAlert && (
          <div style={{ textAlign: 'center', padding: '12px' }}>
            <div style={{
              display: 'inline-flex',
              padding: '16px',
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.2)',
              marginBottom: '16px'
            }}>
              <Siren color="#ef4444" size={40} className="siren-badge" />
            </div>

            <Title level={3} style={{ color: '#ef4444', marginTop: 0 }}>
              🚨 EMERGENCY AMBULANCE APPROACHING!
            </Title>

            <Text style={{ fontSize: '16px', color: '#fff', display: 'block', marginBottom: '12px' }}>
              Ambulance <Text strong style={{ color: '#fca5a5' }}>{incomingAlert.ambulanceRegNo}</Text> is approaching your signal location:
            </Text>

            <Tag color="volcano" style={{ fontSize: '14px', padding: '6px 16px', borderRadius: '8px', fontWeight: 700, marginBottom: '20px' }}>
              📍 {incomingAlert.signalLocation}
            </Tag>

            <div style={{ background: 'rgba(31, 41, 55, 0.8)', padding: '16px', borderRadius: '12px', textAlign: 'left', marginBottom: '20px' }}>
              <Text style={{ color: '#d1d5db', display: 'block' }}>Route: {incomingAlert.fromLocation} ➔ {incomingAlert.toLocation}</Text>
              <Text style={{ color: '#d1d5db', display: 'block' }}>Distance: {incomingAlert.distanceKm} km away</Text>
              <Text style={{ color: '#d1d5db', display: 'block' }}>ETA: {new Date(incomingAlert.estimatedArrival).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
              <Text style={{ color: '#d1d5db', display: 'block' }}>Driver Contact: {incomingAlert.driverContact}</Text>
            </div>

            <Space size="middle">
              <Button
                type="primary"
                size="large"
                style={{ background: '#10b981', borderColor: '#10b981', height: '48px', fontWeight: 700, borderRadius: '10px' }}
                onClick={() => handleUpdateStatus(incomingAlert.id, 'Cleared')}
              >
                MARK ROUTE CLEARED
              </Button>
              <Button size="large" onClick={() => setIncomingAlert(null)} style={{ height: '48px', borderRadius: '10px' }}>
                Dismiss
              </Button>
            </Space>
          </div>
        )}
      </Modal>

      {/* Main List of Junction Notifications */}
      {activeApproaching.length === 0 ? (
        <Card className="glass-card" style={{ textAlign: 'center', padding: '60px' }}>
          <CheckCircle size={48} color="#10b981" style={{ marginBottom: '16px' }} />
          <Title level={4} style={{ color: '#fff' }}>
            Signal Junction Clear
          </Title>
          <Text type="secondary">
            No emergency vehicles approaching your signal junction at this moment.
          </Text>
        </Card>
      ) : (
        <Row gutter={[24, 24]}>
          {activeApproaching.map((notif) => (
            <Col xs={24} key={notif.id}>
              <Card
                className={`glass-card ${notif.status === 'Pending' ? 'glass-card-emergency' : 'glass-card-cleared'}`}
                style={{ borderRadius: '16px' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      <StatusBadge status={notif.status} />
                      <Tag color="geekblue" style={{ borderRadius: '12px', fontSize: '12px' }}>
                        Trip #{notif.emergencyTripId}
                      </Tag>
                    </div>

                    <Title level={3} style={{ color: '#fff', margin: '4px 0 8px 0' }}>
                      Ambulance {notif.ambulanceRegNo}
                    </Title>

                    <Space direction="vertical" size={2}>
                      <Text style={{ color: '#d1d5db', fontSize: '14px' }}>
                        <MapPin size={16} color="#ef4444" style={{ display: 'inline', marginRight: '6px' }} />
                        Route: <Text strong style={{ color: '#fff' }}>{notif.fromLocation}</Text> ➔ <Text strong style={{ color: '#fff' }}>{notif.toLocation}</Text>
                      </Text>

                      <Text style={{ color: '#d1d5db', fontSize: '14px' }}>
                        <Clock size={16} color="#f59e0b" style={{ display: 'inline', marginRight: '6px' }} />
                        Simulated Distance: <Text strong style={{ color: '#f59e0b' }}>{notif.distanceKm} km away</Text> | ETA: <Text strong style={{ color: '#f59e0b' }}>{new Date(notif.estimatedArrival).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                      </Text>

                      <Text style={{ color: '#9ca3af', fontSize: '13px' }}>
                        <PhoneCall size={14} style={{ display: 'inline', marginRight: '6px' }} />
                        Driver: {notif.driverName} ({notif.driverContact})
                      </Text>
                    </Space>
                  </div>

                  {/* Quick Clearance Action Controls */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '200px' }}>
                    {notif.status === 'Pending' && (
                      <Button
                        type="primary"
                        size="large"
                        icon={<CheckOutlined />}
                        onClick={() => handleUpdateStatus(notif.id, 'Cleared')}
                        style={{
                          background: 'linear-gradient(135deg, #10b981, #059669)',
                          borderColor: '#10b981',
                          height: '46px',
                          fontWeight: 700,
                          borderRadius: '10px',
                          boxShadow: '0 0 15px rgba(16,185,129,0.4)'
                        }}
                      >
                        MARK ROUTE CLEARED
                      </Button>
                    )}

                    {notif.status === 'Cleared' && (
                      <Button
                        type="primary"
                        size="large"
                        icon={<CarFront size={18} />}
                        onClick={() => handleUpdateStatus(notif.id, 'Passed')}
                        style={{
                          background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                          borderColor: '#3b82f6',
                          height: '46px',
                          fontWeight: 700,
                          borderRadius: '10px'
                        }}
                      >
                        MARK AMBULANCE PASSED
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

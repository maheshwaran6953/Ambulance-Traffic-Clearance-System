import React, { useState, useEffect } from 'react';
import { ambulanceService } from '../services/api';
import { signalRService } from '../services/signalrService';
import type { TripResponse, RouteOption, NotificationResponse } from '../types';
import { RouteProgressTimeline } from '../components/RouteProgressTimeline';
import { Card, Form, Select, Button, Typography, Row, Col, Alert, Spin, Tag, message } from 'antd';
import { Siren, Navigation, CheckCircle, XCircle } from 'lucide-react';

const { Title, Text } = Typography;
const { Option } = Select;

export const AmbulanceDashboard: React.FC = () => {
  const [activeTrips, setActiveTrips] = useState<TripResponse[]>([]);
  const [routes, setRoutes] = useState<RouteOption[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const [form] = Form.useForm();

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [tripsData, routesData] = await Promise.all([
        ambulanceService.getActiveTrips(),
        ambulanceService.getRoutes(),
      ]);
      setActiveTrips(tripsData);
      setRoutes(routesData);
    } catch (err) {
      console.error('Error fetching ambulance dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Listen to real-time status update broadcasts from Police Officers
    signalRService.onStatusUpdated((updatedNotification: NotificationResponse) => {
      setActiveTrips((prevTrips) =>
        prevTrips.map((trip) => {
          if (trip.id === updatedNotification.emergencyTripId) {
            const updatedNotifs = trip.notifications.map((n) =>
              n.id === updatedNotification.id ? updatedNotification : n
            );
            return { ...trip, notifications: updatedNotifs };
          }
          return trip;
        })
      );
      message.info(`Signal Alert: Officer ${updatedNotification.officerName} marked ${updatedNotification.signalLocation} as ${updatedNotification.status}!`);
    });

    signalRService.onTripCancelled((tripId: number) => {
      setActiveTrips((prev) => prev.filter((t) => t.id !== tripId));
    });
  }, []);

  const handleStartTrip = async (values: { routeIndex: number }) => {
    setSubmitting(true);
    try {
      const selectedRoute = routes[values.routeIndex];
      const newTrip = await ambulanceService.createTrip(selectedRoute.from, selectedRoute.to);
      setActiveTrips([newTrip]);
      message.success('🚨 EMERGENCY TRIP STARTED! Notifications pushed to signal police officers.');
      form.resetFields();
    } catch (err) {
      console.error('Failed to start trip:', err);
      message.error('Failed to initiate emergency trip. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelTrip = async (tripId: number) => {
    try {
      await ambulanceService.cancelTrip(tripId);
      setActiveTrips((prev) => prev.filter((t) => t.id !== tripId));
      message.warning('Emergency trip cancelled.');
    } catch (err) {
      console.error('Failed to cancel trip:', err);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px' }}>
        <Spin size="large" tip="Connecting to Real-time Dispatch System..." />
      </div>
    );
  }

  const currentTrip = activeTrips.find((t) => t.isActive);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
      <Row gutter={[24, 24]}>
        {/* Left Side: Create Trip / Trip Control Panel */}
        <Col xs={24} lg={10}>
          <Card className="glass-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ background: '#ef4444', padding: '10px', borderRadius: '10px' }}>
                <Siren color="#fff" size={24} className="siren-badge" />
              </div>
              <div>
                <Title level={4} style={{ color: '#fff', margin: 0 }}>
                  EMERGENCY TRIP DISPATCH
                </Title>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  Select route to push real-time signal clearance alerts
                </Text>
              </div>
            </div>

            {currentTrip ? (
              <Alert
                message="EMERGENCY TRIP ACTIVE"
                description={`Heading from ${currentTrip.fromLocation} to ${currentTrip.toLocation}`}
                type="warning"
                showIcon
                icon={<Siren color="#ef4444" size={20} className="siren-badge" />}
                style={{ borderRadius: '12px', background: 'rgba(239, 68, 68, 0.15)', borderColor: '#ef4444' }}
              />
            ) : (
              <Form form={form} layout="vertical" onFinish={handleStartTrip}>
                <Form.Item
                  label={<Text style={{ color: '#d1d5db' }}>Select Pre-mapped Route</Text>}
                  name="routeIndex"
                  rules={[{ required: true, message: 'Please select an emergency route' }]}
                >
                  <Select
                    placeholder="Choose From -> To Route"
                    size="large"
                    style={{ width: '100%' }}
                  >
                    {routes.map((r, idx) => (
                      <Option key={idx} value={idx}>
                        🚀 {r.from} ➔ {r.to} ({r.signalLocations.length} Signals)
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    danger
                    htmlType="submit"
                    size="large"
                    block
                    loading={submitting}
                    icon={<Navigation size={18} />}
                    style={{
                      height: '52px',
                      fontWeight: 800,
                      fontSize: '16px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                      boxShadow: '0 0 20px rgba(239, 68, 68, 0.5)'
                    }}
                  >
                    START EMERGENCY TRIP
                  </Button>
                </Form.Item>
              </Form>
            )}
          </Card>
        </Col>

        {/* Right Side: Active Trip Live Visualizer & Signal Timeline */}
        <Col xs={24} lg={14}>
          {currentTrip ? (
            <div>
              <Card className="glass-card glass-card-emergency" style={{ borderRadius: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <Tag color="red" style={{ fontSize: '13px', padding: '4px 12px', fontWeight: 700, borderRadius: '8px' }}>
                      🚨 ACTIVE EMERGENCY CORRIDOR #{currentTrip.id}
                    </Tag>
                    <Title level={3} style={{ color: '#fff', marginTop: '12px', marginBottom: '4px' }}>
                      {currentTrip.fromLocation} ➔ {currentTrip.toLocation}
                    </Title>
                    <Text type="secondary" style={{ fontSize: '13px', color: '#9ca3af' }}>
                      Vehicle: <Text strong style={{ color: '#f3f4f6' }}>{currentTrip.ambulanceRegNo}</Text> | Driver: <Text strong style={{ color: '#f3f4f6' }}>{currentTrip.driverName}</Text>
                    </Text>
                  </div>

                  <Button
                    danger
                    icon={<XCircle size={16} />}
                    onClick={() => handleCancelTrip(currentTrip.id)}
                    style={{ borderRadius: '8px' }}
                  >
                    Cancel Trip
                  </Button>
                </div>

                <RouteProgressTimeline
                  fromLocation={currentTrip.fromLocation}
                  toLocation={currentTrip.toLocation}
                  notifications={currentTrip.notifications}
                />
              </Card>
            </div>
          ) : (
            <Card className="glass-card" style={{ textAlign: 'center', padding: '40px' }}>
              <CheckCircle size={48} color="#10b981" style={{ marginBottom: '16px' }} />
              <Title level={4} style={{ color: '#fff' }}>
                No Active Emergency Trips
              </Title>
              <Text type="secondary">
                Ready for emergency dispatch. Select a route on the left to initiate a trip.
              </Text>
            </Card>
          )}
        </Col>
      </Row>
    </div>
  );
};

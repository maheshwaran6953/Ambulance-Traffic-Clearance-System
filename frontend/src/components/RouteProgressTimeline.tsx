import React from 'react';
import { Timeline, Typography, Card } from 'antd';
import { CheckCircleTwoTone, ClockCircleTwoTone, EnvironmentFilled } from '@ant-design/icons';
import type { NotificationResponse } from '../types';

const { Text, Title } = Typography;

interface RouteProgressTimelineProps {
  fromLocation: string;
  toLocation: string;
  notifications: NotificationResponse[];
}

export const RouteProgressTimeline: React.FC<RouteProgressTimelineProps> = ({
  fromLocation,
  toLocation,
  notifications,
}) => {
  const getTimelineDot = (status: string) => {
    if (status === 'Cleared' || status === 'Passed') {
      return <CheckCircleTwoTone twoToneColor="#10b981" style={{ fontSize: '20px' }} />;
    }
    return <ClockCircleTwoTone twoToneColor="#ef4444" style={{ fontSize: '20px' }} />;
  };

  return (
    <Card className="glass-card" style={{ marginTop: '16px' }}>
      <Title level={5} style={{ color: '#9ca3af', marginBottom: '16px' }}>
        <EnvironmentFilled style={{ color: '#ef4444', marginRight: '8px' }} />
        LIVE ROUTE SIGNAL TIMELINE
      </Title>

      <Timeline
        mode="left"
        items={[
          {
            color: 'green',
            children: (
              <div>
                <Text strong style={{ color: '#10b981', fontSize: '15px' }}>
                  START: {fromLocation}
                </Text>
                <br />
                <Text type="secondary" style={{ fontSize: '12px' }}>Emergency Dispatch Origin</Text>
              </div>
            ),
          },
          ...notifications.map((n) => ({
            dot: getTimelineDot(n.status),
            children: (
              <div style={{ background: 'rgba(31,41,55,0.4)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text strong style={{ color: '#f3f4f6' }}>{n.signalLocation}</Text>
                  <Text style={{
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: 700,
                    background: n.status === 'Cleared' ? '#065f46' : n.status === 'Passed' ? '#1e3a8a' : '#991b1b',
                    color: '#fff'
                  }}>
                    {n.status}
                  </Text>
                </div>
                <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginTop: '4px' }}>
                  Officer: {n.officerName} | Dist: {n.distanceKm} km | ETA: {new Date(n.estimatedArrival).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </div>
            ),
          })),
          {
            color: 'red',
            children: (
              <div>
                <Text strong style={{ color: '#ef4444', fontSize: '15px' }}>
                  DESTINATION: {toLocation}
                </Text>
                <br />
                <Text type="secondary" style={{ fontSize: '12px' }}>Hospital Emergency Ward</Text>
              </div>
            ),
          },
        ]}
      />
    </Card>
  );
};

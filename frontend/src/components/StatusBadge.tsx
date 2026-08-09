import React from 'react';
import { Tag } from 'antd';
import { ClockCircleOutlined, CheckCircleOutlined, CarOutlined } from '@ant-design/icons';
import type { NotificationStatus } from '../types';

interface StatusBadgeProps {
  status: NotificationStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  switch (status) {
    case 'Pending':
      return (
        <Tag color="error" icon={<ClockCircleOutlined />} className="siren-badge" style={{ padding: '4px 12px', borderRadius: '20px', fontWeight: 600 }}>
          TRAFFIC CLEARANCE PENDING
        </Tag>
      );
    case 'Cleared':
      return (
        <Tag color="success" icon={<CheckCircleOutlined />} style={{ padding: '4px 12px', borderRadius: '20px', fontWeight: 600, background: 'rgba(16,185,129,0.2)', border: '1px solid #10b981' }}>
          ROUTE CLEARED
        </Tag>
      );
    case 'Passed':
      return (
        <Tag color="processing" icon={<CarOutlined />} style={{ padding: '4px 12px', borderRadius: '20px', fontWeight: 600, background: 'rgba(59,130,246,0.2)', border: '1px solid #3b82f6' }}>
          VEHICLE PASSED
        </Tag>
      );
    default:
      return <Tag>{status}</Tag>;
  }
};

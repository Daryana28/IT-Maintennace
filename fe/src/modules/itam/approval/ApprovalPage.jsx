import React, { useState } from 'react';
import { Card, Typography, Tabs, Table, Tag, Space, Button } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

const { Title } = Typography;

export default function ApprovalPage() {
  const [activeTab, setActiveTab] = useState('maintenance');

  // Dummy data
  const maintenanceColumns = [
    { title: 'ID Request', dataIndex: 'id', key: 'id' },
    { title: 'Aset', dataIndex: 'asset', key: 'asset' },
    { title: 'Jenis Maintenance', dataIndex: 'type', key: 'type' },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (status) => <Tag color="orange">{status}</Tag> },
    { title: 'Aksi', key: 'action', render: () => (
      <Space>
        <Button type="primary" size="small" icon={<CheckCircleOutlined />}>Setuju</Button>
        <Button danger size="small" icon={<CloseCircleOutlined />}>Tolak</Button>
      </Space>
    )}
  ];

  const maintenanceData = [
    { key: 1, id: 'REQ-MN-001', asset: 'Server Utama', type: 'Perbaikan Rutin', status: 'Pending Approval' }
  ];

  const items = [
    {
      key: 'maintenance',
      label: 'Maintenance',
      children: <Table columns={maintenanceColumns} dataSource={maintenanceData} pagination={false} />
    },
    {
      key: 'purchase',
      label: 'Purchase',
      children: <p>Daftar persetujuan pembelian aset akan muncul di sini.</p>
    },
    {
      key: 'disposal',
      label: 'Disposal',
      children: <p>Daftar persetujuan pemusnahan aset akan muncul di sini.</p>
    },
    {
      key: 'history',
      label: 'History',
      children: <p>Riwayat semua persetujuan yang telah diproses.</p>
    }
  ];

  return (
    <div className="page-shell">
      <Card>
        <Title level={4} style={{ marginBottom: 24 }}>Approval Center</Title>
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab} 
          items={items} 
          type="card"
        />
      </Card>
    </div>
  );
}

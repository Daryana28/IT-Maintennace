import React from 'react';
import { Card, Typography, Table, Tag } from 'antd';

const { Title, Text } = Typography;

// Dummy logs
const logs = [
  { key: '1', time: '2026-05-19 15:40:02', ip: '192.168.1.15', action: 'Update Theme ke Light Mode', module: 'System Style', status: 'Success' },
  { key: '2', time: '2026-05-19 14:50:11', ip: '192.168.1.15', action: 'Membuat Jadwal Maintenance Baru AST004', module: 'Maintenance', status: 'Success' },
  { key: '3', time: '2026-05-19 13:30:45', ip: '192.168.1.15', action: 'Akses Halaman Depreciation List', module: 'Asset Management', status: 'Success' },
  { key: '4', time: '2026-05-19 09:12:00', ip: '192.168.1.15', action: 'Login Sukses', module: 'Authentication', status: 'Success' },
  { key: '5', time: '2026-05-18 17:05:22', ip: '192.168.1.15', action: 'Mengubah Detail Profil', module: 'Account Management', status: 'Success' },
];

const columns = [
  { title: 'Waktu & Tanggal', dataIndex: 'time', key: 'time', width: 180 },
  { title: 'Modul', dataIndex: 'module', key: 'module', width: 160, render: (m) => <Tag color="blue">{m}</Tag> },
  { title: 'Aktivitas', dataIndex: 'action', key: 'action' },
  { title: 'IP Address', dataIndex: 'ip', key: 'ip', width: 140 },
  { title: 'Status', dataIndex: 'status', key: 'status', width: 120, render: (s) => <Tag color="success">{s}</Tag> },
];

export default function ActivityLogPage() {
  return (
    <div className="page-shell">
      <Card bordered={false} style={{ borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }} title="Log Aktivitas Akun">
        <Text type="secondary" style={{ display: 'block', marginBottom: 20 }}>
          Daftar audit log aktivitas terbaru yang dilakukan oleh akun Anda untuk transparansi keamanan.
        </Text>
        <Table columns={columns} dataSource={logs} pagination={{ pageSize: 10 }} />
      </Card>
    </div>
  );
}

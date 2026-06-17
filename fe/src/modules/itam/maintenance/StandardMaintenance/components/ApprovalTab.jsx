import React from 'react';
import { Card, Typography, Table, Tag, Space, Button } from 'antd';

const { Title, Text } = Typography;

export default function ApprovalTab() {
  return (
    <Card bordered={false} className="main-card">
      <div style={{ marginBottom: 20 }}>
        <Title level={5} style={{ color: "#1e293b", margin: 0 }}>Persetujuan Pembaruan Standard</Title>
        <Text type="secondary">Pembaruan standard tahunan atau penambahan item baru memerlukan validasi Dept Head dan Div Head.</Text>
      </div>
      
      <Table 
        size="middle"
        dataSource={[
          { key: 1, pengaju: 'Section Head', tipe: 'Pembaruan Tahunan', kategori: 'Utama', perangkat: 'Rack Server', diajukan: '01 Jun 2026', dept: 'Pending', div: 'Pending' },
          { key: 2, pengaju: 'Section Head', tipe: 'Item Baru', kategori: 'Client', perangkat: 'Printer Laser', diajukan: '05 Jun 2026', dept: 'Approved', div: 'Pending' }
        ]}
        columns={[
          { title: 'Diajukan Oleh', dataIndex: 'pengaju', render: t => <Text strong>{t}</Text> },
          { title: 'Tipe Pembaruan', dataIndex: 'tipe' },
          { title: 'Kategori', dataIndex: 'kategori' },
          { title: 'Perangkat', dataIndex: 'perangkat' },
          { title: 'Tanggal', dataIndex: 'diajukan' },
          { 
            title: 'Approval Dept Head', 
            dataIndex: 'dept', 
            render: t => <Tag color={t === 'Approved' ? 'success' : 'processing'}>{t}</Tag> 
          },
          { 
            title: 'Approval Div Head', 
            dataIndex: 'div', 
            render: t => <Tag color={t === 'Approved' ? 'success' : 'processing'}>{t}</Tag> 
          },
          { 
            title: 'Aksi', 
            render: (_, record) => (
              <Space>
                <Button type="primary" size="small" style={{ background: '#52c41a' }}>Approve</Button>
                <Button danger size="small" type="text">Reject</Button>
              </Space>
            )
          }
        ]}
        pagination={false}
      />
    </Card>
  );
}

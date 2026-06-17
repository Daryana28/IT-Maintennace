import React, { useEffect, useCallback } from 'react';
import { Card, Typography, Row, Col, Form, Input, Button, Avatar, Divider, Tag, Skeleton } from 'antd';
import { UserOutlined, SaveOutlined, EditOutlined, MailOutlined } from '@ant-design/icons';
import toast from 'react-hot-toast';

import { useAuthStore } from "@/modules/auth/store/authStore";

const { Title, Text } = Typography;

export default function ProfilePage() {
  const [form] = Form.useForm();
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        fullName: user.fullName || user.username || '',
        email: user.email || '',
        phone: user.phone || '',
        location: user.location || '',
      });
    }
  }, [user, form]);

  const handleFinish = useCallback(async (values) => {
    try {
      // Simulate API call for saving profile
      console.log('Saved profile values:', values);
      toast.success('Profil berhasil diperbarui');
    } catch (error) {
      toast.error('Gagal memperbarui profil');
    }
  }, []);

  const getRoleName = useCallback(() => {
    if (!user) return 'Role';
    if (Array.isArray(user.roles)) return user.roles[0]?.name || user.roles[0] || 'Role';
    return user.role || 'Role';
  }, [user]);

  const getInitials = useCallback(() => {
    const name = user?.fullName || user?.username || 'User';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }, [user]);

  if (!user) {
    return (
      <div className="page-shell">
        <div style={{ padding: 'var(--space-6)' }}>
          <Skeleton active avatar paragraph={{ rows: 6 }} />
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      {/* PAGE HEADER */}
      <div className="dashboard-page-head" style={{ marginBottom: 'var(--space-6)' }}>
        <div>
          <h1 className="dashboard-page-title">Profil Saya</h1>
          <div className="dashboard-page-subtitle">Kelola informasi profil dan akun Anda</div>
        </div>
        <div className="dashboard-actions">
          <div className="dashboard-status-badge">
            <span className="status-dot" />
            {getRoleName()}
          </div>
        </div>
      </div>

      <Row gutter={[24, 24]}>
        {/* LEFT SIDE: Avatar & Bio */}
        <Col xs={24} lg={8}>
          <Card bordered={false} className="card-interactive" style={{ textAlign: 'center', padding: 'var(--space-4) 0' }}>
            <Avatar
              size={104}
              style={{
                background: 'var(--brand-gradient, linear-gradient(135deg, #1aa8ff, #52d0ff))',
                color: '#ffffff',
                fontSize: 36,
                fontWeight: 700,
                marginBottom: 'var(--space-4)',
                border: '3px solid var(--surface)',
                boxShadow: 'var(--shadow)',
              }}
            >
              {getInitials()}
            </Avatar>

            <Title level={4} style={{ margin: 0, color: 'var(--heading)' }}>
              {user?.fullName || user?.username || 'User'}
            </Title>
            <Tag color="blue" style={{ marginTop: 'var(--space-2)', borderRadius: 'var(--radius-pill)', fontWeight: 600 }}>
              {getRoleName()}
            </Tag>

          </Card>
        </Col>

        {/* RIGHT SIDE: Form details */}
        <Col xs={24} lg={16}>
          <Card
            bordered={false}
            title={<span><EditOutlined style={{ marginRight: 8, color: 'var(--primary)' }} />Edit Informasi Profil</span>}
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={handleFinish}
              requiredMark="optional"
            >
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="fullName"
                    label="Nama Lengkap"
                    rules={[{ required: true, message: 'Nama lengkap wajib diisi' }]}
                    tooltip="Nama lengkap sesuai dengan identitas resmi"
                  >
                    <Input
                      prefix={<UserOutlined style={{ color: 'var(--muted)' }} />}
                      placeholder="Masukkan nama lengkap"
                      style={{ borderRadius: 'var(--radius-sm)' }}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="email"
                    label="Alamat Email"
                    rules={[{ required: true, type: 'email', message: 'Email tidak valid' }]}
                    tooltip="Gunakan email aktif untuk notifikasi"
                  >
                    <Input
                      prefix={<MailOutlined style={{ color: 'var(--muted)' }} />}
                      placeholder="Masukkan alamat email"
                      style={{ borderRadius: 'var(--radius-sm)' }}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Divider style={{ borderColor: 'var(--line)', marginBottom: 'var(--space-5)' }} />

              <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SaveOutlined />}
                  size="large"
                  style={{
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--primary-gradient, linear-gradient(135deg, #1677ff, #4096ff))',
                    border: 'none',
                    boxShadow: 'var(--shadow-sm)',
                    fontWeight: 600,
                  }}
                >
                  Simpan Perubahan
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Input, Button, Form, Upload, Tag, Space, Alert, message } from 'antd';
import { UserOutlined, PhoneOutlined, MailOutlined, KeyOutlined, UploadOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import profileService from '../services/profileService';

const { Title, Text } = Typography;

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();

  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await profileService.getProfile();
      if (res.success) {
        setProfile(res.data);
        profileForm.setFieldsValue({
          full_name: res.data.full_name,
          phone: res.data.phone,
        });
      }
    } catch (err) {
      console.error(err);
      message.error("Gagal memuat profil user");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleUpdateProfile = async (values) => {
    setSavingProfile(true);
    try {
      const res = await profileService.updateProfile(values);
      if (res.success) {
        message.success("Profil berhasil diperbarui");
        setProfile(prev => ({ ...prev, ...res.data }));
      }
    } catch (err) {
      message.error(err.response?.data?.message || "Gagal memperbarui profil");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleUpdatePassword = async (values) => {
    setSavingPassword(true);
    try {
      const res = await profileService.updatePassword(values);
      if (res.success) {
        message.success("Password berhasil diganti");
        passwordForm.resetFields();
      }
    } catch (err) {
      message.error(err.response?.data?.message || "Gagal mengganti password");
    } finally {
      setSavingPassword(false);
    }
  };

  const handleUploadPicture = async ({ file }) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error("Hanya file gambar yang diperbolehkan");
      return;
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error("Ukuran gambar tidak boleh melebihi 2MB");
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    const hide = message.loading("Mengunggah foto profil...", 0);
    try {
      const res = await profileService.updatePicture(formData);
      if (res.success) {
        message.success("Foto profil berhasil diperbarui");
        setProfile(prev => ({ ...prev, profile_picture: res.data.profile_picture }));
      }
    } catch (err) {
      message.error(err.response?.data?.message || "Gagal mengunggah foto profil");
    } finally {
      hide();
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <Text type="secondary">Memuat profil...</Text>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <Row gutter={[24, 24]}>
        {/* SISI KIRI: PROFILE SUMMARY CARD */}
        <Col xs={24} md={8}>
          <Card 
            bordered={false} 
            style={{ 
              textAlign: 'center', 
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              borderRadius: 12 
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px 0' }}>
              <div 
                style={{ 
                  position: 'relative',
                  width: 120,
                  height: 120,
                  borderRadius: '50%',
                  overflow: 'hidden',
                  marginBottom: 16,
                  border: '3px solid #f1f5f9',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.05)'
                }}
              >
                {profile?.profile_picture ? (
                  <img 
                    src={profile.profile_picture} 
                    alt="Avatar" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#e2e8f0' }}>
                    <UserOutlined style={{ fontSize: 48, color: '#94a3b8' }} />
                  </div>
                )}
              </div>

              <Upload
                customRequest={handleUploadPicture}
                showUploadList={false}
                beforeUpload={() => true}
              >
                <Button icon={<UploadOutlined />} size="small" style={{ marginBottom: 20 }}>
                  Ganti Foto
                </Button>
              </Upload>

              <Title level={4} style={{ margin: 0 }}>{profile?.full_name}</Title>
              <Text type="secondary" style={{ marginBottom: 16 }}>@{profile?.username}</Text>

              <div style={{ width: '100%', borderTop: '1px solid #f1f5f slate', marginTop: 16, paddingTop: 16 }}>
                <Space direction="vertical" style={{ width: '100%', textAlign: 'left' }} size="small">
                  <div>
                    <Text type="secondary">Departemen:</Text>
                    <div style={{ fontWeight: '500' }}>{profile?.department || 'IT Operations'}</div>
                  </div>
                  <div>
                    <Text type="secondary">Role Akses:</Text>
                    <div style={{ marginTop: 4 }}>
                      {profile?.roles?.map(r => (
                        <Tag color="blue" key={r}>{r}</Tag>
                      )) || <Tag color="orange">USER</Tag>}
                    </div>
                  </div>
                </Space>
              </div>
            </div>
          </Card>
        </Col>

        {/* SISI KANAN: EDIT FORMS */}
        <Col xs={24} md={16}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            {/* CARD 1: INFORMASI PROFIL */}
            <Card 
              title={<span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><UserOutlined /> Informasi Profil</span>}
              bordered={false}
              style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)', borderRadius: 12 }}
            >
              <Form
                form={profileForm}
                layout="vertical"
                onFinish={handleUpdateProfile}
              >
                <Row gutter={16}>
                  <Col span={24}>
                    <Form.Item
                      label="Nama Lengkap"
                      name="full_name"
                      rules={[{ required: true, message: 'Nama lengkap wajib diisi' }]}
                    >
                      <Input prefix={<UserOutlined />} placeholder="Masukkan nama lengkap Anda" size="large" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label="Alamat Email (Readonly)"
                      name="email"
                    >
                      <Input prefix={<MailOutlined />} size="large" value={profile?.email} disabled />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label="No. Telepon"
                      name="phone"
                    >
                      <Input prefix={<PhoneOutlined />} placeholder="Contoh: 08123456789" size="large" />
                    </Form.Item>
                  </Col>
                </Row>
                <Form.Item style={{ margin: 0, textAlign: 'right' }}>
                  <Button type="primary" htmlType="submit" loading={savingProfile} size="large">
                    Simpan Perubahan
                  </Button>
                </Form.Item>
              </Form>
            </Card>

            {/* CARD 2: GANTI PASSWORD */}
            <Card 
              title={<span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><KeyOutlined /> Keamanan - Ganti Password</span>}
              bordered={false}
              style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)', borderRadius: 12 }}
            >
              <Form
                form={passwordForm}
                layout="vertical"
                onFinish={handleUpdatePassword}
              >
                <Form.Item
                  label="Password Lama"
                  name="current_password"
                  rules={[{ required: true, message: 'Password lama wajib diisi' }]}
                >
                  <Input.Password prefix={<KeyOutlined />} placeholder="Masukkan password saat ini" size="large" />
                </Form.Item>
                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label="Password Baru"
                      name="new_password"
                      rules={[
                        { required: true, message: 'Password baru wajib diisi' },
                        { min: 6, message: 'Password minimal 6 karakter' }
                      ]}
                    >
                      <Input.Password prefix={<SafetyCertificateOutlined />} placeholder="Masukkan password baru" size="large" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label="Konfirmasi Password Baru"
                      name="confirm_password"
                      rules={[
                        { required: true, message: 'Konfirmasi password baru wajib diisi' },
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            if (!value || getFieldValue('new_password') === value) {
                              return Promise.resolve();
                            }
                            return Promise.reject(new Error('Password baru tidak cocok'));
                          },
                        }),
                      ]}
                    >
                      <Input.Password prefix={<SafetyCertificateOutlined />} placeholder="Ketik ulang password baru" size="large" />
                    </Form.Item>
                  </Col>
                </Row>
                <Form.Item style={{ margin: 0, textAlign: 'right' }}>
                  <Button type="primary" htmlType="submit" loading={savingPassword} danger size="large">
                    Perbarui Password
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </Space>
        </Col>
      </Row>
    </div>
  );
}

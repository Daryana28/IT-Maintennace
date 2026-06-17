import React from 'react';
import { Card, Form, Input, Button, Switch, Divider, Typography, Row, Col, Alert } from 'antd';
import { KeyOutlined, SafetyCertificateOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

export default function SecurityPage() {
  const [form] = Form.useForm();

  const handleUpdatePassword = (values) => {
    console.log('Update password values:', values);
  };

  return (
    <div className="page-shell">
      <Row gutter={24}>
        {/* Left Side: Change Password */}
        <Col xs={24} md={16}>
          <Card bordered={false} style={{ borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }} title={<span><KeyOutlined style={{ marginRight: 8, color: '#1677ff' }} />Ubah Password</span>}>
            <Form form={form} layout="vertical" onFinish={handleUpdatePassword}>
              <Form.Item name="currentPassword" label="Password Sekarang" rules={[{ required: true, message: 'Password sekarang wajib diisi' }]}>
                <Input.Password />
              </Form.Item>

              <Form.Item name="newPassword" label="Password Baru" rules={[{ required: true, message: 'Password baru wajib diisi' }]}>
                <Input.Password />
              </Form.Item>

              <Form.Item
                name="confirmNewPassword"
                label="Konfirmasi Password Baru"
                dependencies={['newPassword']}
                rules={[
                  { required: true, message: 'Konfirmasi password baru wajib diisi' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('newPassword') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Password baru tidak cocok!'));
                    },
                  }),
                ]}
              >
                <Input.Password />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" style={{ background: '#1677ff' }}>
                  Update Password
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        {/* Right Side: Extras like 2FA */}
        <Col xs={24} md={8}>
          <Card bordered={false} style={{ borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }} title={<span><SafetyCertificateOutlined style={{ marginRight: 8, color: '#52c41a' }} />Keamanan Akun</span>}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <Text style={{ fontWeight: 600, display: 'block' }}>Autentikasi Dua Faktor (2FA)</Text>
                <Text type="secondary" style={{ fontSize: 12 }}>Amankan akun Anda menggunakan kode OTP tambahan.</Text>
              </div>
              <Switch checked={false} />
            </div>

            <Divider />

            <Alert
              message="Tips Keamanan"
              description="Pastikan password Anda minimal terdiri dari 8 karakter, mengandung huruf besar, huruf kecil, angka, dan karakter spesial."
              type="info"
              showIcon
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}

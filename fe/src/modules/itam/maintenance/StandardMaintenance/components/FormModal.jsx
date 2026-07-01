import React, { useState } from 'react';
import { Card, Form, Row, Col, Select, Input, Divider, Typography, message, Button, Space } from 'antd';
import standardMaintenanceService from '../../services/standardMaintenanceService';

const { Title } = Typography;

export default function StandardForm({
  isModalOpen,
  setIsModalOpen,
  form,
  level1Categories,
  formSubKategoriOptions,
  formNamaPerangkatOptions,
  formTipePerangkatOptions,
  handleKategoriChange,
  handleSubKategoriChange,
  handleNamaPerangkatChange,
  selectedKategoriName,
  selectedSubKategoriName,
  selectedNamaPerangkatName,
  onSave,
  yearly_standard_id
}) {
  const [loading, setLoading] = useState(false);

  if (!isModalOpen) return null;

  const handleSave = () => {
    form.validateFields().then(async (values) => {
      try {
        setLoading(true);
        const payload = { ...values, yearly_standard_id };
        await standardMaintenanceService.create(payload);
        message.success("Standard Maintenance berhasil ditambahkan");
        setIsModalOpen(false);
        form.resetFields();
        if (onSave) onSave();
      } catch (err) {
        message.error("Gagal menyimpan Standard Maintenance");
      } finally {
        setLoading(false);
      }
    });
  };

  return (
    <Card 
      title={<Title level={4} style={{ margin: 0 }}>Form Standard Maintenance</Title>} 
      className="mb-4"
      style={{ marginBottom: 24, borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
      extra={
        <Button onClick={() => {
          setIsModalOpen(false);
          form.resetFields();
        }}>
          Batal / Tutup
        </Button>
      }
    >
      <Form form={form} layout="vertical">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="kategori" label="Kategori" rules={[{ required: true, message: 'Silakan pilih Kategori' }]}>
              <Select
                showSearch
                allowClear
                options={level1Categories.map(c => ({ value: c.category_name, label: c.category_name }))}
                onChange={handleKategoriChange}
                placeholder="Pilih Kategori"
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="subKategori" label="Sub Kategori" rules={[{ required: true, message: 'Silakan pilih Sub Kategori' }]}>
              <Select
                showSearch
                allowClear
                options={formSubKategoriOptions}
                onChange={handleSubKategoriChange}
                placeholder="Pilih Sub Kategori"
                disabled={!selectedKategoriName}
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="namaPerangkat" label="Nama Perangkat" rules={[{ required: true, message: 'Silakan pilih Nama Perangkat' }]}>
              <Select
                showSearch
                allowClear
                options={formNamaPerangkatOptions}
                onChange={handleNamaPerangkatChange}
                placeholder="Pilih Nama Perangkat"
                disabled={!selectedSubKategoriName}
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="tipePerangkat" label="Tipe Perangkat" rules={[{ required: true, message: 'Silakan pilih Tipe Perangkat' }]}>
              <Select
                showSearch
                allowClear
                options={formTipePerangkatOptions}
                placeholder="Pilih Tipe Perangkat"
                disabled={!selectedNamaPerangkatName}
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="subPerangkat" label="Sub Perangkat">
              <Input placeholder="Masukkan Sub Perangkat (Opsional)" />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Divider orientation="left" style={{ margin: '12px 0', borderColor: '#d9d9d9' }}>
              <span style={{ fontWeight: 600, color: '#1890ff' }}>Detail Maintenance</span>
            </Divider>

            <Form.List name="maintenanceDetails">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }, index) => (
                    <div
                      key={key}
                      style={{
                        border: '1px solid #f0f0f0',
                        borderRadius: 8,
                        padding: 16,
                        marginBottom: 16,
                        backgroundColor: '#fafafa',
                        position: 'relative'
                      }}
                    >
                      <div style={{ position: 'absolute', top: 16, right: 16 }}>
                        {fields.length > 1 && (
                          <Typography.Link type="danger" onClick={() => remove(name)}>
                            Hapus Kelompok
                          </Typography.Link>
                        )}
                      </div>
                      <div style={{ fontWeight: 600, marginBottom: 16 }}>Kelompok {index + 1}</div>

                      <Row gutter={16}>
                        <Col span={12}>
                          <Form.Item {...restField} name={[name, 'fungsi']} label="Fungsi" rules={[{ required: true, message: 'Masukkan Fungsi' }]}>
                            <Input placeholder="Masukkan Fungsi" />
                          </Form.Item>
                        </Col>
                        <Col span={24}>
                          <Form.Item {...restField} name={[name, 'deskripsi']} label="Deskripsi">
                            <Input.TextArea rows={2} placeholder="Masukkan Deskripsi Maintenance" />
                          </Form.Item>
                        </Col>
                        <Col span={24}>
                          <div style={{ fontWeight: 600, marginBottom: 8, marginTop: 8 }}>Pengecekan & Periodik</div>
                          <Form.List name={[name, 'pengecekanList']}>
                            {(pengecekanFields, { add: addPengecekan, remove: removePengecekan }) => (
                              <div style={{ backgroundColor: '#fff', padding: 12, borderRadius: 6, border: '1px solid #e8e8e8' }}>
                                {pengecekanFields.map(({ key: pKey, name: pName, ...pRestField }, pIndex) => (
                                  <div key={pKey} style={{ borderBottom: pIndex < pengecekanFields.length - 1 ? '1px dashed #d9d9d9' : 'none', paddingBottom: 12, marginBottom: 12, position: 'relative' }}>
                                    <div style={{ position: 'absolute', top: 0, right: 0, zIndex: 10 }}>
                                      {pengecekanFields.length > 1 && (
                                        <Typography.Link type="danger" onClick={() => removePengecekan(pName)}>Hapus Pengecekan</Typography.Link>
                                      )}
                                    </div>
                                    <Row gutter={16} style={{ marginBottom: 8, marginTop: 8 }}>
                                      <Col span={8}>
                                        <Form.Item {...pRestField} name={[pName, 'pengecekan']} label="Pengecekan" rules={[{ required: true, message: 'Wajib diisi' }]}>
                                          <Input placeholder="Detail Pengecekan" />
                                        </Form.Item>
                                      </Col>
                                      <Col span={8}>
                                        <Form.Item {...pRestField} name={[pName, 'standard']} label="Standard" rules={[{ required: true, message: 'Wajib diisi' }]}>
                                          <Input placeholder="Nilai Standard" />
                                        </Form.Item>
                                      </Col>
                                      <Col span={8}>
                                        <Form.Item {...pRestField} name={[pName, 'periodik']} label="Periodik" rules={[{ required: true, message: 'Wajib diisi' }]}>
                                            <Select placeholder="Pilih Periodik" allowClear>
                                              <Select.Option value="DAILY">Daily</Select.Option>
                                              <Select.Option value="1X/MINGGU">1X/Minggu</Select.Option>
                                              <Select.Option value="2X/MINGGU">2X/Minggu</Select.Option>
                                              <Select.Option value="1X/BULAN">1X/Bulan</Select.Option>
                                              <Select.Option value="3X/BULAN">3X/Bulan</Select.Option>
                                              <Select.Option value="6X/BULAN">6X/Bulan</Select.Option>
                                              <Select.Option value="1X/TAHUN">1X/Tahun</Select.Option>
                                            </Select>
                                        </Form.Item>
                                      </Col>
                                    </Row>
                                    <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 13, color: '#595959' }}>Standard Prosedur</div>
                                    <Row gutter={16}>
                                      <Col span={8}>
                                        <Form.Item {...pRestField} name={[pName, 'bagian']} label="Bagian">
                                          <Input placeholder="Bagian" />
                                        </Form.Item>
                                      </Col>
                                      <Col span={8}>
                                        <Form.Item {...pRestField} name={[pName, 'metode']} label="Metode">
                                          <Input placeholder="Metode" />
                                        </Form.Item>
                                      </Col>
                                      <Col span={8}>
                                        <Form.Item {...pRestField} name={[pName, 'alat']} label="Alat">
                                          <Input placeholder="Alat" />
                                        </Form.Item>
                                      </Col>
                                    </Row>
                                  </div>
                                ))}
                                <Typography.Link onClick={() => addPengecekan()} style={{ display: 'inline-block', marginTop: 8 }}>
                                  + Tambah Pengecekan
                                </Typography.Link>
                              </div>
                            )}
                          </Form.List>
                        </Col>
                      </Row>
                    </div>
                  ))}
                  <Form.Item>
                    <Typography.Link onClick={() => add()} style={{ display: 'block', textAlign: 'center', padding: '8px 0', border: '1px dashed #d9d9d9', borderRadius: 8, backgroundColor: '#fafafa' }}>
                      + Tambah Kelompok Detail Maintenance
                    </Typography.Link>
                  </Form.Item>
                </>
              )}
            </Form.List>
          </Col>
        </Row>
        
        <Divider />
        <Row justify="end">
          <Space>
            <Button onClick={() => {
              setIsModalOpen(false);
              form.resetFields();
            }}>
              Batal
            </Button>
            <Button type="primary" onClick={handleSave} loading={loading}>
              Simpan & Ajukan
            </Button>
          </Space>
        </Row>
      </Form>
    </Card>
  );
}


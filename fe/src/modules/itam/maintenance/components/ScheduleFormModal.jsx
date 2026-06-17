import React from 'react';
import { Modal, Form, Select, DatePicker, Row, Col, Button, Checkbox } from 'antd';
import { PlusOutlined, StopOutlined } from '@ant-design/icons';

export default function ScheduleFormModal({
  open,
  onCancel,
  onOk,
  form,
  isEditMode,
  isSplitMode,
  setIsSplitMode,
  selectedAssetIds,
  setSelectedAssetIds,
  assets,
  viewMode,
  standards,
  isReadOnly
}) {
  return (
    <Modal
      title={isReadOnly ? "Detail Jadwal Maintenance" : (isEditMode ? "Ubah Jadwal Maintenance" : "Tambah Jadwal Maintenance Manual")}
      open={open}
      onCancel={onCancel}
      onOk={onOk}
      okText="Simpan"
      cancelText={isReadOnly ? "Tutup" : "Batal"}
      okButtonProps={{ style: { display: isReadOnly ? 'none' : 'inline-block' } }}
    >
      <Form form={form} layout="vertical">
        <Form.Item 
          name="asset_ids" 
          label={
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
              <span>Pilih Asset (Bisa lebih dari 1)</span>
              {!isReadOnly && assets.length > 0 && (
                <a 
                  onClick={() => {
                    const allIds = assets.map(a => a.asset_id);
                    form.setFieldsValue({ asset_ids: allIds });
                    setSelectedAssetIds(allIds);
                    if (allIds.length > 1) setIsSplitMode(false);
                  }}
                  style={{ fontSize: 12 }}
                >
                  Pilih Semua Asset
                </a>
              )}
            </div>
          } 
          rules={[{ required: true, message: "Pilih minimal 1 asset" }]}
        >
          <Select 
            mode="multiple" 
            showSearch 
            optionFilterProp="children" 
            placeholder="Pilih asset yang akan di-maintenance"
            disabled={isReadOnly}
            onChange={(val) => {
              setSelectedAssetIds(val);
              if (val.length <= 1) setIsSplitMode(false);
            }}
          >
            {assets.map(a => (
              <Select.Option key={a.asset_id} value={a.asset_id}>
                {a.asset_name} ({a.hostname}){a.owner_name ? ` - ${a.owner_name}` : ''}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <div style={{ marginBottom: 16 }}>
          <Checkbox 
            checked={isSplitMode} 
            disabled={isReadOnly}
            onChange={(e) => setIsSplitMode(e.target.checked)}
          >
            Split jadwal ke berbagai kelompok tanggal/jam
          </Checkbox>
        </div>

        {isSplitMode && (
          <div style={{ background: '#f9fafb', padding: 16, borderRadius: 8, marginBottom: 16, border: '1px solid #e5e7eb' }}>
            <div style={{ marginBottom: 12, fontWeight: 600, color: '#374151' }}>Kelompok Jadwal</div>
            <Form.List name="split_groups">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }, index) => {
                    return (
                      <div key={key} style={{ marginBottom: 16, borderBottom: '1px dashed #d9d9d9', paddingBottom: 12 }}>
                        <Row gutter={8} align="middle" style={{ marginBottom: 8 }}>
                          <Col span={22}>
                            <Form.Item
                              {...restField}
                              name={[name, 'date_range']}
                              rules={[{ required: true, message: "Pilih rentang tanggal dan jam" }]}
                              style={{ marginBottom: 0 }}
                            >
                              <DatePicker.RangePicker showTime={{ format: 'HH:mm' }} format="YYYY-MM-DD HH:mm" style={{ width: '100%' }} placeholder={["Mulai", "Selesai"]} disabled={isReadOnly} />
                            </Form.Item>
                          </Col>
                          <Col span={2}>
                            {!isReadOnly && <Button danger type="text" icon={<StopOutlined />} onClick={() => remove(name)} />}
                          </Col>
                        </Row>
                        <Row>
                          <Col span={24}>
                            <Form.Item
                              {...restField}
                              name={[name, 'asset_ids']}
                              rules={[{ required: true, message: "Pilih asset untuk kelompok ini" }]}
                              style={{ marginBottom: 0 }}
                            >
                              <Select 
                                mode="multiple" 
                                placeholder="Pilih asset..."
                                disabled={isReadOnly}
                                maxTagCount="responsive"
                              >
                                {assets.filter(a => selectedAssetIds.includes(a.asset_id)).map(a => (
                                  <Select.Option key={a.asset_id} value={a.asset_id}>
                                    {a.asset_name} ({a.hostname})
                                  </Select.Option>
                                ))}
                              </Select>
                            </Form.Item>
                          </Col>
                        </Row>
                      </div>
                    );
                  })}
                  {!isReadOnly && (
                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />} style={{ marginTop: 8 }}>
                      Tambah Kelompok
                    </Button>
                  )}
                </>
              )}
            </Form.List>
          </div>
        )}

        {(!isSplitMode || isEditMode) && (
          <Form.Item name="next_maintenance_date_range" label="Waktu Pelaksanaan" rules={[{ required: true, message: "Pilih rentang tanggal dan jam maintenance" }]}>
            <DatePicker.RangePicker showTime={{ format: 'HH:mm' }} format="YYYY-MM-DD HH:mm" style={{ width: '100%' }} placeholder={["Mulai", "Selesai"]} disabled={isReadOnly} />
          </Form.Item>
        )}
        
        <div style={{ display: 'none' }}>
          <Form.Item name="standard_maintenance_id">
            <Select showSearch optionFilterProp="children">
              {standards.map(sm => (
                <Select.Option key={sm.id} value={sm.id}>
                  {sm.kategori} - {sm.namaPerangkat} ({sm.subPerangkat})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="periodik">
            <Select>
              <Select.Option value="1 Hari">1 Hari</Select.Option>
              <Select.Option value="1 Minggu">1 Minggu</Select.Option>
              <Select.Option value="2 Minggu">2 Minggu</Select.Option>
              <Select.Option value="1 Bulan">1 Bulan</Select.Option>
              <Select.Option value="3 Bulan">3 Bulan</Select.Option>
              <Select.Option value="6 Bulan">6 Bulan</Select.Option>
              <Select.Option value="1 Tahun">1 Tahun</Select.Option>
            </Select>
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
}

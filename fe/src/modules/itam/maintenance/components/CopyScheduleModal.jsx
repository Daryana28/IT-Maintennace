import React from 'react';
import { Modal, Form, Radio, Select, Typography } from 'antd';

const { Text } = Typography;

export default function CopyScheduleModal({
  open,
  onCancel,
  handleCopySchedule,
  loading,
  copyTargetLevel,
  setCopyTargetLevel,
  copyTargetValue,
  setCopyTargetValue,
  copySourceSMId,
  standards
}) {
  return (
    <Modal
      title="Copy Schedule ke Jenis Perangkat Lain"
      open={open}
      onCancel={onCancel}
      onOk={handleCopySchedule}
      okText="Copy Schedule"
      cancelText="Batal"
      confirmLoading={loading}
    >
      <div style={{ marginBottom: 16 }}>
        <Text type="secondary">
          Pilih level perangkat tujuan. Jadwal (tanggal) dari perangkat sumber akan disalin, dan asset dari target akan didistribusikan secara merata ke tanggal-tanggal tersebut.
        </Text>
      </div>
      <Form layout="vertical">
        <Form.Item label="Level Tujuan" required>
          <Radio.Group value={copyTargetLevel} onChange={e => {
            setCopyTargetLevel(e.target.value);
            setCopyTargetValue(null);
          }}>
            <Radio value="jenis">Jenis Perangkat</Radio>
            <Radio value="perangkat">Perangkat</Radio>
            <Radio value="subkategori">Sub Kategori</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item label="Pilih Tujuan" required>
          <Select 
            showSearch 
            optionFilterProp="children" 
            placeholder={`Pilih ${copyTargetLevel} tujuan`}
            value={copyTargetValue}
            onChange={(val) => setCopyTargetValue(val)}
          >
            {copyTargetLevel === 'jenis' && standards.filter(sm => sm.id !== copySourceSMId).map(sm => (
              <Select.Option key={sm.id} value={sm.id}>
                {sm.kategori} {sm.subKategori !== "-" ? `- ${sm.subKategori}` : ""} - {sm.namaPerangkat} ({sm.subPerangkat})
              </Select.Option>
            ))}
            {copyTargetLevel === 'perangkat' && [...new Set(standards.map(sm => sm.namaPerangkat))].filter(p => p && p !== "-").map(p => (
              <Select.Option key={p} value={p}>{p}</Select.Option>
            ))}
            {copyTargetLevel === 'subkategori' && [...new Set(standards.map(sm => sm.subKategori))].filter(sk => sk && sk !== "-").map(sk => (
              <Select.Option key={sk} value={sk}>{sk}</Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
}

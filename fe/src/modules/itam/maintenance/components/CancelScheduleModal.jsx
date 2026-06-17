import React from 'react';
import { Modal } from 'antd';
import { StopOutlined } from '@ant-design/icons';

export default function CancelScheduleModal({
  open,
  cancelModalData,
  setCancelModal,
  handleCancelSchedule,
  loading
}) {
  return (
    <Modal
      title={
        <span style={{ color: '#cf1322' }}>
          <StopOutlined style={{ marginRight: 8 }} />
          Batalkan Jadwal Maintenance
        </span>
      }
      open={open}
      onCancel={() => setCancelModal({ open: false, scheduleId: null, reason: '' })}
      onOk={handleCancelSchedule}
      okText="Ya, Batalkan"
      okButtonProps={{ danger: true, loading }}
      cancelText="Tidak"
      width={420}
    >
      <p style={{ marginBottom: 16, color: '#374151' }}>
        Jadwal ini akan ditandai sebagai <strong style={{ color: '#cf1322' }}>DIBATALKAN</strong> dan tidak dapat dieksekusi. Data tetap tersimpan.
      </p>
      <div>
        <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>
          Alasan pembatalan (opsional)
        </label>
        <textarea
          rows={3}
          style={{
            width: '100%',
            border: '1px solid #d1d5db',
            borderRadius: 8,
            padding: '8px 12px',
            fontSize: 14,
            resize: 'vertical',
            outline: 'none',
            fontFamily: 'inherit',
          }}
          placeholder="Contoh: Perangkat sedang dalam perbaikan lain..."
          value={cancelModalData.reason}
          onChange={(e) => setCancelModal(prev => ({ ...prev, reason: e.target.value }))}
        />
      </div>
    </Modal>
  );
}

import React from 'react';
import { Modal, Form, Row, Col, DatePicker, Input, Select, Button, Table, Typography } from 'antd';
import dayjs from 'dayjs';

const { Title } = Typography;

export default function HolidayModal({
  open,
  onCancel,
  holidayForm,
  handleAddHoliday,
  holidayLoading,
  holidays,
  handleDeleteHoliday
}) {
  return (
    <Modal
      title="Pengaturan Hari Libur & Cuti Bersama"
      open={open}
      onCancel={onCancel}
      footer={null}
      width={700}
    >
      <div style={{ marginBottom: 24, padding: 16, backgroundColor: '#f8fafc', borderRadius: 8 }}>
        <Title level={5} style={{ marginTop: 0, marginBottom: 16 }}>Tambah Hari Libur Baru</Title>
        <Form
          form={holidayForm}
          layout="vertical"
          onFinish={handleAddHoliday}
        >
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="holiday_date" label="Tanggal Libur" rules={[{ required: true, message: 'Pilih tanggal!' }]}>
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={10}>
              <Form.Item name="description" label="Keterangan" rules={[{ required: true, message: 'Isi keterangan!' }]}>
                <Input placeholder="Contoh: Idul Fitri" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="holiday_type" label="Jenis" initialValue="NATIONAL_HOLIDAY">
                <Select>
                  <Select.Option value="NATIONAL_HOLIDAY">Libur Nasional</Select.Option>
                  <Select.Option value="COLLECTIVE_LEAVE">Cuti Bersama</Select.Option>
                  <Select.Option value="OTHER">Lainnya</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <div style={{ textAlign: 'right' }}>
            <Button type="primary" htmlType="submit" loading={holidayLoading}>Tambah Libur</Button>
          </div>
        </Form>
      </div>

      <Table
        size="small"
        loading={holidayLoading}
        dataSource={holidays}
        rowKey="id"
        pagination={{ pageSize: 5 }}
        columns={[
          {
            title: "Tanggal",
            dataIndex: "holiday_date",
            key: "holiday_date",
            render: (t) => dayjs(t).format('DD MMM YYYY')
          },
          {
            title: "Keterangan",
            dataIndex: "description",
            key: "description"
          },
          {
            title: "Jenis",
            dataIndex: "holiday_type",
            key: "holiday_type",
            render: (t) => (
              <span style={{ 
                color: t === 'NATIONAL_HOLIDAY' ? '#cf1322' : '#d46b08',
                background: t === 'NATIONAL_HOLIDAY' ? '#fff1f0' : '#fff7e6',
                padding: '2px 8px', borderRadius: 4, fontSize: 12
              }}>
                {t === 'NATIONAL_HOLIDAY' ? 'Libur Nasional' : t === 'COLLECTIVE_LEAVE' ? 'Cuti Bersama' : 'Lainnya'}
              </span>
            )
          },
          {
            title: "Aksi",
            key: "action",
            align: "center",
            width: 80,
            render: (_, record) => (
              <Button size="small" danger type="text" onClick={() => handleDeleteHoliday(record.id)}>Hapus</Button>
            )
          }
        ]}
      />
    </Modal>
  );
}

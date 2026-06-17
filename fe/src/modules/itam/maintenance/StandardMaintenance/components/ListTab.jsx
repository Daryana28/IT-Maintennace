import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Space, Input, Select, Button, Table, Typography, Tag, Tooltip, Form, message, Modal } from 'antd';
import { SearchOutlined, ReloadOutlined, PlusOutlined, EditOutlined, DeleteOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons';
import standardMaintenanceService from '../../services/standardMaintenanceService';
import Swal from 'sweetalert2';
import ExpandedSubKategoriTable from './ListTabComponents/ExpandedSubKategoriTable';

const { Text } = Typography;

export default function ListTab({ categories = [], sortedData, onSave, yearlyStandardId }) {
  const [data, setData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);
  const [modalForm] = Form.useForm();

  useEffect(() => {
    setData(sortedData || []);
  }, [sortedData]);

  const level1Categories = categories.filter(c => !c.parent_id);
  const filterKategoriOptions = [
    { value: '', label: 'Semua Kategori' },
    ...level1Categories.map(c => ({ value: c.category_name, label: c.category_name }))
  ];

  const subKategoriOptionsGrouped = level1Categories.map(parent => {
    const children = categories.filter(c => c.parent_id === parent.category_id);
    return {
      label: parent.category_name,
      options: children.map(child => ({ value: child.category_name, label: child.category_name }))
    };
  }).filter(group => group.options.length > 0);

  const filterSubKategoriOptions = [
    { value: '', label: 'Semua Sub Kategori' },
    ...subKategoriOptionsGrouped
  ];

  // Removed form logic because ListTab is no longer an editable table

  // Logic for Modal Form (Adding new parent)
  const modalSelectedKategoriName = Form.useWatch('kategori', modalForm);
  const modalSelectedSubKategoriName = Form.useWatch('subKategori', modalForm);
  const modalSelectedTipePerangkatName = Form.useWatch('tipePerangkat', modalForm);
  const modalSelectedJenisPerangkatName = Form.useWatch('jenisPerangkat', modalForm);

  const modalSelectedKategori = categories.find(c => !c.parent_id && c.category_name === modalSelectedKategoriName);
  const modalFormSubKategoriOptions = modalSelectedKategori
    ? categories.filter(c => c.parent_id === modalSelectedKategori.category_id).map(c => ({ value: c.category_name, label: c.category_name }))
    : [];

  const modalSelectedSubKategori = categories.find(c => c.category_name === modalSelectedSubKategoriName && c.parent_id === modalSelectedKategori?.category_id);
  const modalFormTipePerangkatOptions = modalSelectedSubKategori
    ? categories.filter(c => c.parent_id === modalSelectedSubKategori.category_id).map(c => ({ value: c.category_name, label: c.category_name }))
    : [];

  const modalSelectedTipePerangkat = categories.find(c => c.category_name === modalSelectedTipePerangkatName && c.parent_id === modalSelectedSubKategori?.category_id);
  const modalFormNamaPerangkatOptions = modalSelectedTipePerangkat
    ? categories.filter(c => c.parent_id === modalSelectedTipePerangkat.category_id).map(c => ({ value: c.category_name, label: c.category_name }))
    : [];

  const modalSelectedNamaPerangkatName = Form.useWatch('namaPerangkat', modalForm);
  const modalSelectedNamaPerangkat = categories.find(c => c.category_name === modalSelectedNamaPerangkatName && c.parent_id === modalSelectedTipePerangkat?.category_id);
  const modalFormJenisPerangkatOptions = modalSelectedNamaPerangkat
    ? categories.filter(c => c.parent_id === modalSelectedNamaPerangkat.category_id).map(c => ({ value: c.category_name, label: c.category_name }))
    : [];

  const handleParentSubmit = () => {
    modalForm.validateFields().then(async (values) => {
      try {
        await standardMaintenanceService.create({
          yearly_standard_id: yearlyStandardId,
          kategori: values.kategori,
          subKategori: values.subKategori,
          tipePerangkat: values.tipePerangkat || "",
          namaPerangkat: values.namaPerangkat || "",
          subPerangkat: values.jenisPerangkat || ""
        });
        message.success("Perangkat berhasil ditambahkan ke database");
        setIsModalOpen(false);
        modalForm.resetFields();
        if (onSave) onSave();
      } catch (err) {
        message.error("Gagal menambahkan perangkat");
      }
    });
  };

  const handleAddNode = (initialValues) => {
    modalForm.setFieldsValue(initialValues);
    setIsModalOpen(true);
  };

  // Level 1 actions are removed since editing is done at lower levels

  const handleDeleteParent = async (record) => {
    // Only remove locally if it's a new unsaved record
    if (record.key.startsWith('parent-new')) {
      setData(data.filter(item => item.key !== record.key));
      return;
    }
    // We disable full deletion from Level 1 to prevent accidental cascade deletes.
    message.warning("Penghapusan Kategori tidak diizinkan dari level ini. Hapus Jenis Perangkat di level terdalam.");
  };

  const handleGlobalExpand = (expanded, record) => {
    if (expanded) setExpandedRowKeys(prev => [...prev, record.key]);
    else setExpandedRowKeys(prev => prev.filter(k => k !== record.key));
  };

  const columns = [
    {
      title: "Aksi",
      key: "aksi",
      width: 100,
      align: 'center',
      render: (_, record) => (
        <Space size={4}>
          <Tooltip title="Hapus Lokal">
            <Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleDeleteParent(record)} />
          </Tooltip>
        </Space>
      )
    },
    {
      title: "Kategori",
      dataIndex: "kategori",
      key: "kategori",
      render: (kat) => {
        const color = kat?.toLowerCase() === 'utama' ? 'blue' : 'cyan';
        return kat ? <Tag color={color}>{kat}</Tag> : '-';
      }
    }
  ];

  return (
    <Card variant="borderless" className="main-card">
      {/* FILTER SECTION */}
      <Row justify="space-between" align="middle" className="filter-section" style={{ marginBottom: 16 }}>
        <Col>
          <Space size="middle" wrap>
            <Input placeholder="Cari perangkat..." prefix={<SearchOutlined />} allowClear style={{ width: 250 }} />
            <Select defaultValue="" options={filterKategoriOptions} style={{ width: 180 }} />
            <Select defaultValue="" options={filterSubKategoriOptions} style={{ width: 200 }} />
          </Space>
        </Col>
        <Col>
          <Space>
            <Button icon={<ReloadOutlined />} onClick={() => onSave && onSave()}>Refresh</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>Tambah Data Perangkat</Button>
          </Space>
        </Col>
      </Row>

      {/* MASTER TABLE */}
      <Table
        bordered
        columns={columns}
        dataSource={data}
        pagination={{ pageSize: 10, showSizeChanger: true }}
        size="middle"
        rowClassName={() => 'custom-table-row'}
        expandable={{
          expandedRowKeys,
          onExpand: handleGlobalExpand,
          expandedRowRender: (record) => (
            <ExpandedSubKategoriTable 
              parentRecord={record} 
              subKategoriList={record.subKategoriList} 
              onSave={onSave} 
              yearlyStandardId={yearlyStandardId} 
              categories={categories}
              globalExpandedRowKeys={expandedRowKeys}
              onGlobalExpand={handleGlobalExpand}
              onAddNode={handleAddNode}
            />
          ),
        }}
      />

      <Modal
        title="Tambah Hierarki Perangkat Baru"
        open={isModalOpen}
        onOk={handleParentSubmit}
        onCancel={() => { setIsModalOpen(false); modalForm.resetFields(); }}
        okText="Tambah ke Daftar"
        cancelText="Batal"
      >
        <Form form={modalForm} layout="vertical">
          <Form.Item name="kategori" label="Kategori" rules={[{ required: true }]}>
            <Select showSearch allowClear options={level1Categories.map(c => ({ value: c.category_name, label: c.category_name }))} 
              onChange={() => modalForm.setFieldsValue({ subKategori: undefined, tipePerangkat: undefined, namaPerangkat: undefined, jenisPerangkat: undefined })}
            />
          </Form.Item>
          <Form.Item name="subKategori" label="Sub Kategori" rules={[{ required: true }]}>
            <Select showSearch allowClear options={modalFormSubKategoriOptions} disabled={!modalSelectedKategoriName}
              onChange={() => modalForm.setFieldsValue({ tipePerangkat: undefined, namaPerangkat: undefined, jenisPerangkat: undefined })}
            />
          </Form.Item>
          <Form.Item name="tipePerangkat" label="Tipe Perangkat">
            <Select showSearch allowClear options={modalFormTipePerangkatOptions} disabled={!modalSelectedSubKategoriName} 
              onChange={() => modalForm.setFieldsValue({ namaPerangkat: undefined, jenisPerangkat: undefined })}
            />
          </Form.Item>
          <Form.Item name="namaPerangkat" label="Nama Perangkat">
            <Select showSearch allowClear options={modalFormNamaPerangkatOptions} disabled={!modalSelectedTipePerangkatName} 
              onChange={() => modalForm.setFieldsValue({ jenisPerangkat: undefined })}
            />
          </Form.Item>
          <Form.Item name="jenisPerangkat" label="Jenis Perangkat">
            <Select showSearch allowClear options={modalFormJenisPerangkatOptions} disabled={!modalSelectedNamaPerangkatName} />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}

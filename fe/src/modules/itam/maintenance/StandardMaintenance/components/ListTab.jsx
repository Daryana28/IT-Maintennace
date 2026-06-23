import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Space, Input, Select, Button, Table, Typography, Tag, Tooltip, Form, message, Modal } from 'antd';
import { SearchOutlined, ReloadOutlined, PlusOutlined, EditOutlined, DeleteOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons';
import standardMaintenanceService from '../../services/standardMaintenanceService';
import Swal from 'sweetalert2';

export default function ListTab({ categories = [], sortedData, onSave, yearlyStandardId, overrideCategory }) {
  const [data, setData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailRecord, setDetailRecord] = useState(null);
  const [modalForm] = Form.useForm();

  useEffect(() => {
    setData(sortedData || []);
  }, [sortedData]);

  const categoryMap = {
    hardware: ["hardware"],
    "software-hardware": ["hardware"],
    application: ["software"],
    software: ["software"],
    network: ["networking"],
    networking: ["networking"],
    cyber: ["cyber"],
    "cyber-security": ["cyber"],
    "network-cyber": ["networking", "cyber"],
  };
  const activeCategoryList = categoryMap[overrideCategory] || (overrideCategory ? [overrideCategory] : []);

  const level1Categories = categories.filter(c => !c.parent_id);
  const filteredLevel1Categories = activeCategoryList.length > 0
    ? level1Categories.filter(c => activeCategoryList.includes(c.category_name?.toLowerCase()))
    : level1Categories;

  const filterKategoriOptions = [
    { value: '', label: 'Semua Kategori' },
    ...filteredLevel1Categories.map(c => ({ value: c.category_name, label: c.category_name }))
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



  const columns = [
    {
      title: "Nama Kategori",
      dataIndex: "category_name",
      key: "category_name",
      render: (text) => <Typography.Text strong>{text}</Typography.Text>,
    },
    {
      title: "Level",
      dataIndex: "level_no",
      key: "level_no",
      width: 120,
      align: 'center',
      render: (level) => <Tag color="blue">Level {level}</Tag>,
    },
    {
      title: "Status Maintenance",
      key: "status",
      width: 180,
      align: 'center',
      render: (_, record) => {
        const count = record.maintenanceItems?.length || 0;
        if (count > 0) {
          return (
            <Tag color="green" style={{ cursor: 'pointer' }} onClick={() => {
              setDetailRecord(record);
              setDetailModalOpen(true);
            }}>
              {count} Setup
            </Tag>
          );
        }
        return <Tag color="default">Belum ada</Tag>;
      }
    },
    {
      title: "Aksi",
      key: "aksi",
      width: 120,
      align: 'center',
      render: (_, record) => (
        <Space size={4}>
          <Tooltip title="Tambah / Edit Maintenance">
            <Button type="primary" size="small" icon={<EditOutlined />} onClick={() => handleAddNode(record)} />
          </Tooltip>
        </Space>
      )
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
        pagination={{ pageSize: 50, showSizeChanger: true }}
        size="middle"
        rowClassName={() => 'custom-table-row'}
      />

      <Modal
        title={`Data Standard Maintenance: ${detailRecord?.category_name || ''}`}
        open={detailModalOpen}
        onCancel={() => setDetailModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalOpen(false)}>Tutup</Button>
        ]}
      >
        {detailRecord?.maintenanceItems && detailRecord.maintenanceItems.length > 0 ? (
          <ul>
            {detailRecord.maintenanceItems.map(item => (
              <li key={item.id}>
                {item.namaPerangkat || item.subPerangkat || item.tipePerangkat || "Setup"} 
                ({item.formattedDetails?.length || 0} fungsi/detail)
              </li>
            ))}
          </ul>
        ) : (
          <Typography.Text type="secondary">Tidak ada data maintenance.</Typography.Text>
        )}
        <Button size="small" style={{ marginTop: 8 }} onClick={() => message.info("Fitur edit detail maintenance akan disesuaikan")}>
          Edit Detail
        </Button>
      </Modal>

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
            <Select showSearch allowClear options={filteredLevel1Categories.map(c => ({ value: c.category_name, label: c.category_name }))} 
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

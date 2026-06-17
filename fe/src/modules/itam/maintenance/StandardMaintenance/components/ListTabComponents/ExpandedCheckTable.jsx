import React, { useState, useEffect } from 'react';
import { Space, Button, Table, Typography, Tag, Tooltip, Form, message, Modal, Select, Input } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SaveOutlined, CloseOutlined, SwapOutlined } from '@ant-design/icons';
import standardMaintenanceService from '../../../services/standardMaintenanceService';
import Swal from 'sweetalert2';
import EditableCell from './EditableCell';

const { Text } = Typography;

const ExpandedCheckTable = ({ parentRecord, subKatRecord, namaRecord, jenisRecord, detailRecord, pengecekanList, onSave, yearlyStandardId, categories }) => {
  const [form] = Form.useForm();
  const [data, setData] = useState(pengecekanList || []);
  const [editingKey, setEditingKey] = useState('');
  const [movingRecord, setMovingRecord] = useState(null);
  const [targetNamaPerangkat, setTargetNamaPerangkat] = useState('');
  const [targetJenisPerangkat, setTargetJenisPerangkat] = useState('');
  const [targetFungsi, setTargetFungsi] = useState('');

  useEffect(() => {
    setData(pengecekanList || []);
  }, [pengecekanList]);

  const isEditing = (record) => record.key === editingKey;

  const edit = (record) => {
    form.setFieldsValue({
      pengecekan: '', standard: '', periodik: '', bagian: '', metode: '', alat: '',
      ...record,
    });
    setEditingKey(record.key);
  };

  const cancel = () => {
    setEditingKey('');
    if (editingKey.startsWith('new')) {
      setData(data.filter(item => item.key !== editingKey));
    }
  };

  const save = async (key) => {
    try {
      const row = await form.validateFields();
      const newData = [...data];
      const index = newData.findIndex((item) => key === item.key);
      const item = newData[index];

      const payload = {
        yearly_standard_id: yearlyStandardId,
        cekId: item.cekId, // null if 'new'
        kategori: parentRecord.kategori,
        subKategori: subKatRecord.subKategori,
        namaPerangkat: namaRecord.namaPerangkat,
        subPerangkat: jenisRecord.jenisPerangkat, // This is Jenis Perangkat in UI
        fungsi: detailRecord.fungsi,
        deskripsi: detailRecord.deskripsi,
        ...row
      };

      await standardMaintenanceService.saveFlat(payload);
      message.success("Pengecekan berhasil disimpan");
      setEditingKey('');
      if (onSave) onSave();
    } catch (errInfo) {
      console.log('Validate Failed:', errInfo);
    }
  };

  const handleDelete = async (record) => {
    if (record.key.startsWith('new')) {
      setData(data.filter(item => item.key !== record.key));
      return;
    }

    if (!record.cekId) {
      setData(data.filter(item => item.key !== record.key));
      return;
    }

    const confirm = await Swal.fire({
      title: 'Hapus Pengecekan?',
      text: 'Data pengecekan ini akan dihapus permanen.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, Hapus!'
    });

    if (confirm.isConfirmed) {
      try {
        await standardMaintenanceService.deleteFlat(record.cekId);
        Swal.fire('Terhapus!', 'Data pengecekan berhasil dihapus.', 'success');
        if (onSave) onSave();
      } catch (error) {
        Swal.fire('Gagal!', 'Terjadi kesalahan saat menghapus data.', 'error');
      }
    }
  };

  const showMoveModal = (record) => {
    setMovingRecord(record);
    setTargetNamaPerangkat(namaRecord.namaPerangkat);
    setTargetJenisPerangkat(jenisRecord.jenisPerangkat);
    setTargetFungsi(detailRecord.fungsi);
  };

  const handleMoveSubmit = async () => {
    if (!targetNamaPerangkat || !targetJenisPerangkat || !targetFungsi) {
      message.error("Silakan lengkapi Nama Perangkat, Jenis Perangkat, dan Fungsi tujuan");
      return;
    }
    try {
      const payload = {
        cekId: movingRecord.cekId,
        yearly_standard_id: yearlyStandardId,
        kategori: parentRecord.kategori,
        subKategori: subKatRecord.subKategori,
        namaPerangkat: targetNamaPerangkat,
        subPerangkat: targetJenisPerangkat,
        fungsi: targetFungsi,
        pengecekan: movingRecord.pengecekan,
        standard: movingRecord.standard,
        periodik: movingRecord.periodik,
        bagian: movingRecord.bagian,
        metode: movingRecord.metode,
        alat: movingRecord.alat,
      };
      await standardMaintenanceService.saveFlat(payload);
      message.success(`Pengecekan berhasil dipindahkan`);
      setMovingRecord(null);
      if (onSave) onSave();
    } catch (error) {
      message.error("Gagal memindahkan Pengecekan");
      console.error(error);
    }
  };

  // Options for Target Nama Perangkat
  const parentCat = categories?.find(c => c.category_name === parentRecord?.kategori);
  const selectedSubKategori = categories?.find(c => c.category_name === subKatRecord?.subKategori && (!parentCat || c.parent_id === parentCat.category_id));
  const targetNamaPerangkatOptionsFromCat = selectedSubKategori
    ? categories?.filter(c => c.parent_id === selectedSubKategori.category_id).map(c => c.category_name) || []
    : [];
  const existingNamaPerangkat = (subKatRecord?.namaPerangkatList || []).map(np => np.namaPerangkat);
  const targetNamaPerangkatOptions = Array.from(new Set([...targetNamaPerangkatOptionsFromCat, ...existingNamaPerangkat]))
    .map(name => ({ value: name, label: name }));

  // Options for Target Jenis Perangkat
  const selectedTargetNama = categories?.find(c => c.category_name === targetNamaPerangkat && (!selectedSubKategori || c.parent_id === selectedSubKategori.category_id));
  const targetJenisPerangkatOptionsFromCat = selectedTargetNama
    ? categories?.filter(c => c.parent_id === selectedTargetNama.category_id).map(c => c.category_name) || []
    : [];
  const targetNamaInFlat = subKatRecord?.namaPerangkatList?.find(np => np.namaPerangkat === targetNamaPerangkat);
  const existingJenisPerangkat = (targetNamaInFlat?.jenisPerangkatList || []).map(jp => jp.jenisPerangkat);
  const targetJenisPerangkatOptions = Array.from(new Set([...targetJenisPerangkatOptionsFromCat, ...existingJenisPerangkat]))
    .map(name => ({ value: name, label: name }));

  // Options for Target Fungsi
  const targetJenisInFlat = targetNamaInFlat?.jenisPerangkatList?.find(jp => jp.jenisPerangkat === targetJenisPerangkat);
  const existingFungsi = (targetJenisInFlat?.details || []).map(d => d.fungsi);
  const targetFungsiOptions = Array.from(new Set([...existingFungsi]))
    .map(name => ({ value: name, label: name }));

  const handleAdd = () => {
    if (editingKey !== '') {
      message.warning("Selesaikan proses edit terlebih dahulu");
      return;
    }
    const newKey = `new-${Date.now()}`;
    const newRecord = {
      key: newKey,
      pengecekan: '', standard: '', periodik: '', bagian: '', metode: '', alat: '',
    };
    setData([newRecord, ...data]);
    form.setFieldsValue({ ...newRecord });
    setEditingKey(newKey);
  };

  const columns = [
    {
      title: "Aksi",
      key: "aksi",
      align: 'center',
      width: 100,
      render: (_, record) => {
        const editable = isEditing(record);
        return editable ? (
          <Space size={4}>
            <Tooltip title="Simpan">
              <Button type="text" icon={<SaveOutlined />} onClick={() => save(record.key)} style={{ color: '#52c41a' }} />
            </Tooltip>
            <Tooltip title="Batal">
              <Button type="text" icon={<CloseOutlined />} onClick={cancel} />
            </Tooltip>
          </Space>
        ) : (
          <Space size={4}>
            <Tooltip title="Edit">
              <Button type="text" icon={<EditOutlined />} onClick={() => edit(record)} disabled={editingKey !== ''} />
            </Tooltip>
            {!record.key.startsWith('new') && (
              <Tooltip title="Pindah">
                <Button type="text" icon={<SwapOutlined />} onClick={() => showMoveModal(record)} disabled={editingKey !== ''} style={{ color: '#1890ff' }} />
              </Tooltip>
            )}
            <Tooltip title="Hapus">
              <Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record)} disabled={editingKey !== ''} />
            </Tooltip>
          </Space>
        );
      },
    },
    {
      title: "Pengecekan",
      dataIndex: "pengecekan",
      key: "pengecekan",
      width: 250,
      editable: true,
      render: (text) => text ? <Tag bordered={false} color="processing">{text}</Tag> : '-'
    },
    { title: "Standard", dataIndex: "standard", key: "standard", width: 200, editable: true },
    { title: "Bagian", dataIndex: "bagian", key: "bagian", width: 150, editable: true },
    { title: "Metode", dataIndex: "metode", key: "metode", width: 150, editable: true },
    { title: "Alat", dataIndex: "alat", key: "alat", width: 150, editable: true },
    {
      title: "Periodik",
      dataIndex: "periodik",
      key: "periodik",
      width: 150,
      align: 'center',
      editable: true,
      inputType: 'periodik',
      render: (text) => text ? <Tag color="purple">{text}</Tag> : '-'
    },
  ];

  const mergedColumns = columns.map((col) => {
    if (!col.editable) return col;
    return {
      ...col,
      onCell: (record) => ({
        record,
        inputType: col.inputType || 'text',
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });

  return (
    <div style={{ padding: '16px 24px', backgroundColor: '#f9f9f9', border: '1px dashed #d9d9d9', borderRadius: '4px', maxWidth: '100%', overflowX: 'auto' }}>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-start', gap: '16px', alignItems: 'center' }}>
        <Text strong type="secondary">Detail Pengecekan</Text>
        <Button type="dashed" icon={<PlusOutlined />} onClick={handleAdd} size="small">Tambah Pengecekan Baru</Button>
      </div>
      <Form form={form} component={false}>
        <div style={{ minWidth: 1150 }}>
          <Table
            components={{ body: { cell: EditableCell } }}
            bordered
            size="small"
            columns={mergedColumns}
            dataSource={data}
            pagination={false}
            rowClassName={() => 'custom-table-row'}
          />
        </div>
      </Form>

      <Modal
        title="Pindah Detail Pengecekan"
        open={!!movingRecord}
        onOk={handleMoveSubmit}
        onCancel={() => setMovingRecord(null)}
        okText="Pindahkan"
        cancelText="Batal"
      >
        <p>Pindahkan Pengecekan <strong>{movingRecord?.pengecekan}</strong> ke:</p>
        
        <div style={{ marginBottom: 16 }}>
          <Text strong>Nama Perangkat Tujuan:</Text>
          <Select
            showSearch
            style={{ width: '100%', marginTop: 8 }}
            placeholder="Pilih Nama Perangkat"
            optionFilterProp="label"
            value={targetNamaPerangkat || undefined}
            onChange={(val) => { setTargetNamaPerangkat(val); setTargetJenisPerangkat(''); setTargetFungsi(''); }}
            options={targetNamaPerangkatOptions}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <Text strong>Jenis Perangkat Tujuan:</Text>
          <Select
            showSearch
            style={{ width: '100%', marginTop: 8 }}
            placeholder="Pilih Jenis Perangkat"
            optionFilterProp="label"
            value={targetJenisPerangkat || undefined}
            onChange={(val) => { setTargetJenisPerangkat(val); setTargetFungsi(''); }}
            options={targetJenisPerangkatOptions}
            disabled={!targetNamaPerangkat}
          />
        </div>

        <div>
          <Text strong>Fungsi Tujuan:</Text>
          <Select
            showSearch
            style={{ width: '100%', marginTop: 8 }}
            placeholder="Ketik atau pilih Fungsi"
            optionFilterProp="label"
            value={targetFungsi || undefined}
            onChange={(val) => setTargetFungsi(val)}
            options={targetFungsiOptions}
            disabled={!targetJenisPerangkat}
            mode="tags"
            maxCount={1}
          />
        </div>
      </Modal>
    </div>
  );
};

export default ExpandedCheckTable;

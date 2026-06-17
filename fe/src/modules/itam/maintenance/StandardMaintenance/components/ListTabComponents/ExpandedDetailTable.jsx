import React, { useState, useEffect } from 'react';
import { Space, Button, Table, Typography, Tooltip, Form, message, Modal, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SaveOutlined, CloseOutlined, SwapOutlined } from '@ant-design/icons';
import standardMaintenanceService from '../../../services/standardMaintenanceService';
import Swal from 'sweetalert2';
import EditableCell from './EditableCell';
import ExpandedCheckTable from './ExpandedCheckTable';

const { Text } = Typography;

const ExpandedDetailTable = ({ parentRecord, subKatRecord, namaRecord, jenisRecord, details, onSave, yearlyStandardId, globalExpandedRowKeys, onGlobalExpand, categories }) => {
  const [form] = Form.useForm();
  const [data, setData] = useState(details || []);
  const [editingKey, setEditingKey] = useState('');
  const [movingRecord, setMovingRecord] = useState(null);
  const [targetNamaPerangkat, setTargetNamaPerangkat] = useState('');
  const [targetJenisPerangkat, setTargetJenisPerangkat] = useState('');

  useEffect(() => {
    setData(details || []);
  }, [details]);

  const isEditing = (record) => record.key === editingKey;

  // Options for target Nama Perangkat
  const parentCat = categories?.find(c => c.category_name === parentRecord?.kategori);
  const selectedSubKategori = categories?.find(c => c.category_name === subKatRecord?.subKategori && (!parentCat || c.parent_id === parentCat.category_id));
  const targetNamaPerangkatOptionsFromCat = selectedSubKategori
    ? categories.filter(c => c.parent_id === selectedSubKategori.category_id).map(c => c.category_name)
    : [];
  const existingNamaPerangkat = (subKatRecord?.namaPerangkatList || []).map(np => np.namaPerangkat);
  const targetNamaPerangkatOptions = Array.from(new Set([...targetNamaPerangkatOptionsFromCat, ...existingNamaPerangkat]))
    .map(name => ({ value: name, label: name }));

  // Options for target Jenis Perangkat (based on selected Target Nama Perangkat)
  const selectedTargetNama = categories?.find(c => c.category_name === targetNamaPerangkat && (!selectedSubKategori || c.parent_id === selectedSubKategori.category_id));
  const targetJenisPerangkatOptionsFromCat = selectedTargetNama
    ? categories.filter(c => c.parent_id === selectedTargetNama.category_id).map(c => c.category_name)
    : [];
  
  // Find the selected target Nama Perangkat in the flat data to get existing Jenis Perangkat
  const targetNamaInFlat = subKatRecord?.namaPerangkatList?.find(np => np.namaPerangkat === targetNamaPerangkat);
  const existingJenisPerangkat = (targetNamaInFlat?.jenisPerangkatList || []).map(jp => jp.jenisPerangkat);
  
  const targetJenisPerangkatOptions = Array.from(new Set([...targetJenisPerangkatOptionsFromCat, ...existingJenisPerangkat]))
    .map(name => ({ value: name, label: name }));

  const edit = (record) => {
    form.setFieldsValue({
      fungsi: '', deskripsi: '',
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
        detailId: item.detailId,
        yearly_standard_id: yearlyStandardId,
        kategori: parentRecord.kategori,
        subKategori: subKatRecord.subKategori,
        namaPerangkat: namaRecord.namaPerangkat,
        subPerangkat: jenisRecord.jenisPerangkat, // This is Jenis Perangkat in UI
        fungsi: row.fungsi,
        deskripsi: row.deskripsi,
      };

      await standardMaintenanceService.saveFlat(payload);
      message.success("Fungsi & Deskripsi berhasil disimpan");
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

    const confirm = await Swal.fire({
      title: 'Hapus Deskripsi?',
      text: 'Semua pengecekan di bawah deskripsi ini akan ikut terhapus.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, Hapus!'
    });

    if (confirm.isConfirmed) {
      try {
        if (record.detailId) {
          await standardMaintenanceService.deleteDetail(record.detailId);
        }
        Swal.fire('Terhapus!', 'Deskripsi berhasil dihapus.', 'success');
        if (onSave) onSave();
      } catch (error) {
        Swal.fire('Gagal!', 'Terjadi kesalahan saat menghapus data.', 'error');
      }
    }
  };

  const showMoveModal = (record) => {
    setMovingRecord(record);
    setTargetNamaPerangkat(namaRecord.namaPerangkat);
    setTargetJenisPerangkat('');
  };

  const handleMoveSubmit = async () => {
    if (!targetNamaPerangkat || !targetJenisPerangkat) {
      message.error("Silakan pilih Nama Perangkat dan Jenis Perangkat tujuan");
      return;
    }
    try {
      const payload = {
        detailId: movingRecord.detailId,
        yearly_standard_id: yearlyStandardId,
        kategori: parentRecord.kategori,
        subKategori: subKatRecord.subKategori,
        namaPerangkat: targetNamaPerangkat,
        subPerangkat: targetJenisPerangkat,
        fungsi: movingRecord.fungsi,
        deskripsi: movingRecord.deskripsi,
      };
      await standardMaintenanceService.saveFlat(payload);
      message.success(`Fungsi berhasil dipindahkan`);
      setMovingRecord(null);
      if (onSave) onSave();
    } catch (error) {
      message.error("Gagal memindahkan Fungsi");
      console.error(error);
    }
  };

  const handleAdd = () => {
    if (editingKey !== '') {
      message.warning("Selesaikan proses edit terlebih dahulu");
      return;
    }
    const newKey = `new-${Date.now()}`;
    const newRecord = {
      key: newKey,
      fungsi: '', deskripsi: '', pengecekanList: []
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
    { title: "Fungsi", dataIndex: "fungsi", key: "fungsi", width: 250, editable: true },
    { title: "Deskripsi", dataIndex: "deskripsi", key: "deskripsi", editable: true, inputType: 'deskripsi' },
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
    <div style={{ padding: '8px 24px 16px 24px', backgroundColor: '#e6f7ff', border: '1px dashed #91d5ff', borderRadius: '4px', maxWidth: '100%', overflowX: 'auto' }}>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-start', gap: '16px', alignItems: 'center' }}>
        <Text strong style={{ color: '#096dd9' }}>Fungsi & Deskripsi Perangkat</Text>
        <Button type="primary" ghost icon={<PlusOutlined />} onClick={handleAdd} size="small">Tambah Deskripsi</Button>
      </div>
      <Form form={form} component={false}>
        <Table
          components={{ body: { cell: EditableCell } }}
          bordered
          size="small"
          columns={mergedColumns}
          dataSource={data}
          pagination={false}
          rowClassName={() => 'custom-table-row'}
          expandable={{
            expandedRowKeys: globalExpandedRowKeys,
            onExpand: onGlobalExpand,
            expandedRowRender: (detailRecord) => (
              <ExpandedCheckTable 
                parentRecord={parentRecord} 
                subKatRecord={subKatRecord}
                namaRecord={namaRecord}
                jenisRecord={jenisRecord}
                detailRecord={detailRecord}
                pengecekanList={detailRecord.pengecekanList} 
                onSave={onSave} 
                yearlyStandardId={yearlyStandardId} 
                categories={categories}
              />
            ),
          }}
        />
      </Form>

      <Modal
        title="Pindah Fungsi"
        open={!!movingRecord}
        onOk={handleMoveSubmit}
        onCancel={() => setMovingRecord(null)}
        okText="Pindahkan"
        cancelText="Batal"
      >
        <p>Pindahkan Fungsi <strong>{movingRecord?.fungsi}</strong> ke:</p>
        
        <div style={{ marginBottom: 16 }}>
          <Text strong>Nama Perangkat Tujuan:</Text>
          <Select
            showSearch
            style={{ width: '100%', marginTop: 8 }}
            placeholder="Pilih Nama Perangkat"
            optionFilterProp="label"
            value={targetNamaPerangkat || undefined}
            onChange={(val) => { setTargetNamaPerangkat(val); setTargetJenisPerangkat(''); }}
            options={targetNamaPerangkatOptions}
          />
        </div>

        <div>
          <Text strong>Jenis Perangkat Tujuan:</Text>
          <Select
            showSearch
            style={{ width: '100%', marginTop: 8 }}
            placeholder="Pilih Jenis Perangkat"
            optionFilterProp="label"
            value={targetJenisPerangkat || undefined}
            onChange={(val) => setTargetJenisPerangkat(val)}
            options={targetJenisPerangkatOptions}
            disabled={!targetNamaPerangkat}
          />
        </div>
      </Modal>
    </div>
  );
};

export default ExpandedDetailTable;

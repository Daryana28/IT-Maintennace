import React, { useState, useEffect } from 'react';
import { Space, Button, Table, Typography, Tag, Tooltip, Form, message, AutoComplete, Modal, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SaveOutlined, CloseOutlined, SwapOutlined } from '@ant-design/icons';
import standardMaintenanceService from '../../../services/standardMaintenanceService';
import Swal from 'sweetalert2';
import ExpandedDetailTable from './ExpandedDetailTable';

const { Text } = Typography;

const ExpandedJenisPerangkatTable = ({ parentRecord, subKatRecord, namaRecord, jenisPerangkatList, onSave, yearlyStandardId, categories, globalExpandedRowKeys, onGlobalExpand }) => {
  const [form] = Form.useForm();
  const [data, setData] = useState(jenisPerangkatList || []);
  const [editingKey, setEditingKey] = useState('');
  const [movingRecord, setMovingRecord] = useState(null);
  const [targetNamaPerangkat, setTargetNamaPerangkat] = useState('');

  useEffect(() => {
    setData(jenisPerangkatList || []);
  }, [jenisPerangkatList]);

  // Options for jenisPerangkat Select/AutoComplete
  const parentCat = categories.find(c => c.category_name === parentRecord?.kategori);
  const selectedSubKategori = categories.find(c => c.category_name === subKatRecord?.subKategori && (!parentCat || c.parent_id === parentCat.category_id));
  const selectedNamaPerangkat = categories.find(c => c.category_name === namaRecord?.namaPerangkat && (!selectedSubKategori || c.parent_id === selectedSubKategori.category_id)); 

  const formJenisPerangkatOptions = selectedNamaPerangkat
    ? categories.filter(c => c.parent_id === selectedNamaPerangkat.category_id).map(c => ({ value: c.category_name, label: c.category_name }))
    : [];

  const targetNamaPerangkatOptionsFromCat = selectedSubKategori
    ? categories.filter(c => c.parent_id === selectedSubKategori.category_id).map(c => c.category_name)
    : [];
  
  const existingNamaPerangkat = (subKatRecord?.namaPerangkatList || []).map(np => np.namaPerangkat);
  
  const targetNamaPerangkatOptions = Array.from(new Set([...targetNamaPerangkatOptionsFromCat, ...existingNamaPerangkat]))
    .map(name => ({ value: name, label: name }));

  const isEditing = (record) => record.key === editingKey;

  const edit = (record) => {
    form.setFieldsValue({
      jenisPerangkat: '',
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
        kategori: parentRecord.kategori,
        subKategori: subKatRecord.subKategori,
        namaPerangkat: namaRecord.namaPerangkat,
        subPerangkat: row.jenisPerangkat, // This is the Jenis Perangkat mapped to subPerangkat
      };

      if (item.id) {
        await standardMaintenanceService.updateParent(item.id, payload);
        message.success("Jenis Perangkat berhasil diperbarui");
      } else {
        await standardMaintenanceService.create(payload);
        message.success("Jenis Perangkat berhasil ditambahkan.");
      }

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
      title: 'Hapus Jenis Perangkat?',
      text: 'Semua fungsi dan pengecekan di bawah jenis perangkat ini akan ikut terhapus permanen.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, Hapus!'
    });

    if (confirm.isConfirmed) {
      try {
        if (record.id) {
          await standardMaintenanceService.deleteParent(record.id, 'jenisPerangkat');
        }
        Swal.fire('Terhapus!', 'Jenis Perangkat berhasil dihapus.', 'success');
        if (onSave) onSave();
      } catch (error) {
        Swal.fire('Gagal!', 'Terjadi kesalahan saat menghapus data.', 'error');
      }
    }
  };

  const showMoveModal = (record) => {
    setMovingRecord(record);
    setTargetNamaPerangkat('');
  };

  const handleMoveSubmit = async () => {
    if (!targetNamaPerangkat) {
      message.error("Silakan pilih Nama Perangkat tujuan");
      return;
    }
    try {
      const payload = {
        yearly_standard_id: yearlyStandardId,
        kategori: parentRecord.kategori,
        subKategori: subKatRecord.subKategori,
        namaPerangkat: targetNamaPerangkat,
        subPerangkat: movingRecord.jenisPerangkat,
      };
      await standardMaintenanceService.updateParent(movingRecord.id, payload);
      message.success(`Jenis Perangkat berhasil dipindahkan ke ${targetNamaPerangkat}`);
      setMovingRecord(null);
      if (onSave) onSave();
    } catch (error) {
      message.error("Gagal memindahkan Jenis Perangkat");
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
      jenisPerangkat: '', details: []
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
      title: "Jenis Perangkat", 
      dataIndex: "jenisPerangkat", 
      key: "jenisPerangkat", 
      editable: true,
      render: (text) => <Tag color="geekblue">{text || '-'}</Tag>
    },
  ];

  const mergedColumns = columns.map((col) => {
    if (!col.editable) return col;
    return {
      ...col,
      onCell: (record) => ({
        record,
        inputType: 'jenisPerangkat',
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });

  const JenisPerangkatEditableCell = ({ editing, dataIndex, title, inputType, record, index, children, ...restProps }) => {
    let inputNode = <AutoComplete options={formJenisPerangkatOptions} placeholder="Pilih atau ketik manual..." filterOption={(inputValue, option) => option.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1} />;
    
    return (
      <td {...restProps}>
        {editing ? (
          <Form.Item name={dataIndex} style={{ margin: 0 }} rules={[{ required: true, message: 'Wajib diisi!' }]}>
            {inputNode}
          </Form.Item>
        ) : (
          children
        )}
      </td>
    );
  };

  return (
    <div style={{ padding: '8px 24px 16px 24px', backgroundColor: '#fffbe6', border: '1px dashed #ffe58f', borderRadius: '4px', maxWidth: '100%', overflowX: 'auto' }}>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-start', gap: '16px', alignItems: 'center' }}>
        <Text strong style={{ color: '#d48806' }}>Jenis Perangkat</Text>
        <Button type="primary" style={{ backgroundColor: '#faad14', borderColor: '#faad14' }} icon={<PlusOutlined />} onClick={handleAdd} size="small">Tambah Jenis Perangkat</Button>
      </div>
      <Form form={form} component={false}>
        <Table
          components={{ body: { cell: JenisPerangkatEditableCell } }}
          bordered
          size="small"
          columns={mergedColumns}
          dataSource={data}
          pagination={false}
          rowClassName={() => 'custom-table-row'}
          expandable={{
            expandedRowKeys: globalExpandedRowKeys,
            onExpand: onGlobalExpand,
            expandedRowRender: (jenisRecord) => (
              <ExpandedDetailTable 
                parentRecord={parentRecord} 
                subKatRecord={subKatRecord}
                namaRecord={namaRecord}
                jenisRecord={jenisRecord}
                details={jenisRecord.details} 
                onSave={onSave} 
                yearlyStandardId={yearlyStandardId} 
                categories={categories}
                globalExpandedRowKeys={globalExpandedRowKeys}
                onGlobalExpand={onGlobalExpand}
              />
            ),
          }}
        />
      </Form>

      <Modal
        title="Pindah Jenis Perangkat"
        open={!!movingRecord}
        onOk={handleMoveSubmit}
        onCancel={() => setMovingRecord(null)}
        okText="Pindahkan"
        cancelText="Batal"
      >
        <p>Pindahkan <strong>{movingRecord?.jenisPerangkat}</strong> ke Nama Perangkat:</p>
        <Select
          showSearch
          style={{ width: '100%' }}
          placeholder="Pilih Nama Perangkat Tujuan"
          optionFilterProp="label"
          value={targetNamaPerangkat || undefined}
          onChange={(val) => setTargetNamaPerangkat(val)}
          options={targetNamaPerangkatOptions}
        />
      </Modal>
    </div>
  );
};

export default ExpandedJenisPerangkatTable;

import { Table, Typography, Button, Space, Tooltip, message } from 'antd';
import { PlusOutlined, UpOutlined, DownOutlined } from '@ant-design/icons';
import ExpandedNamaPerangkatTable from './ExpandedNamaPerangkatTable';
import assetService from '../../../../assetManagement/services/assetService';

const { Text } = Typography;

const ExpandedSubKategoriTable = ({ parentRecord, subKategoriList, onSave, yearlyStandardId, categories, globalExpandedRowKeys, onGlobalExpand, onAddNode }) => {

  const handleMove = async (index, direction) => {
    const newList = [...subKategoriList];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (swapIndex < 0 || swapIndex >= newList.length) return;

    const temp = newList[index];
    newList[index] = newList[swapIndex];
    newList[swapIndex] = temp;

    const parentCat = categories.find(p => p.category_name === parentRecord.kategori);

    try {
      const updatePromises = newList.map((item, i) => {
        const cat = categories.find(c => c.category_name === item.subKategori && (!parentCat || c.parent_id === parentCat.category_id));
        if (cat) {
          return assetService.updateCategory(cat.category_id, { sort_no: i + 1 });
        }
        return Promise.resolve();
      });

      await Promise.all(updatePromises);
      message.success("Urutan berhasil diperbarui");
      if (onSave) onSave();
    } catch (err) {
      message.error("Gagal mengubah urutan");
    }
  };

  const columns = [
    {
      title: "Aksi",
      key: "aksi",
      align: 'center',
      width: 100,
      render: (_, record, index) => (
        <Space size={4}>
          <Tooltip title="Naik">
            <Button 
              type="text" 
              icon={<UpOutlined />} 
              onClick={() => handleMove(index, 'up')} 
              disabled={index === 0} 
            />
          </Tooltip>
          <Tooltip title="Turun">
            <Button 
              type="text" 
              icon={<DownOutlined />} 
              onClick={() => handleMove(index, 'down')} 
              disabled={index === subKategoriList.length - 1} 
            />
          </Tooltip>
        </Space>
      ),
    },
    { 
      title: "Sub Kategori", 
      dataIndex: "subKategori", 
      key: "subKategori", 
      render: (text) => <Text strong>{text || '-'}</Text>
    },
  ];

  return (
    <div style={{ padding: '8px 24px 16px 24px', backgroundColor: '#f0f5ff', border: '1px dashed #adc6ff', borderRadius: '4px', maxWidth: '100%', overflowX: 'auto' }}>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-start', gap: '16px', alignItems: 'center' }}>
        <Text strong style={{ color: '#1d39c4' }}>Sub Kategori</Text>
        <Button 
          type="primary" 
          ghost 
          icon={<PlusOutlined />} 
          size="small" 
          onClick={() => onAddNode && onAddNode({ kategori: parentRecord.kategori })}
        >
          Tambah Sub Kategori
        </Button>
      </div>
      <Table
        bordered
        size="small"
        columns={columns}
        dataSource={subKategoriList}
        pagination={false}
        rowClassName={() => 'custom-table-row'}
        expandable={{
          expandedRowKeys: globalExpandedRowKeys,
          onExpand: onGlobalExpand,
          expandedRowRender: (subKatRecord) => (
            <ExpandedNamaPerangkatTable 
              parentRecord={parentRecord} 
              subKatRecord={subKatRecord}
              namaPerangkatList={subKatRecord.namaPerangkatList} 
              onSave={onSave} 
              yearlyStandardId={yearlyStandardId} 
              categories={categories}
              globalExpandedRowKeys={globalExpandedRowKeys}
              onGlobalExpand={onGlobalExpand}
              onAddNode={onAddNode}
            />
          ),
        }}
      />
    </div>
  );
};

export default ExpandedSubKategoriTable;

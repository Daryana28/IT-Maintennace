import React, { useState } from 'react';
import { Card, Typography, Button, Upload, Alert, Space, Steps, Result, Spin, message } from 'antd';
import { DownloadOutlined, UploadOutlined, FileExcelOutlined, CheckCircleOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title, Text, Paragraph } = Typography;

const getApiCategory = (routeCategory) => {
  const c = (routeCategory || '').toLowerCase().trim();
  if (c === 'hardware') return 'HARDWARE';
  if (c === 'software-hardware' || c === 'software_hw') return 'SOFTWARE_HW';
  if (c === 'application' || c === 'software') return 'APPLICATION';
  if (c === 'network-cyber' || c === 'networking' || c === 'cyber') return 'NETWORK_CYBER';
  return 'HARDWARE'; // fallback
};

export default function ImportTab({ overrideCategory, yearlyStandardId, onImportSuccess }) {
  const pathParts = window.location.pathname.split('/');
  const routeCategory = overrideCategory || pathParts[3] || 'hardware';
  const apiCategory = getApiCategory(routeCategory);

  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);

  const downloadTemplate = () => {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    const url = `${baseUrl}/standard-maintenance/template/${apiCategory.toLowerCase()}`;
    window.open(url, '_blank');
    message.success(`Template ${apiCategory} berhasil di-download`);
  };

  const handleUpload = async () => {
    if (fileList.length === 0) {
      message.error('Silakan pilih file Excel terlebih dahulu');
      return;
    }

    const formData = new FormData();
    formData.append('file', fileList[0]);
    formData.append('kategori', apiCategory);
    formData.append('yearly_standard_id', yearlyStandardId);

    setUploading(true);
    try {
      const response = await axios.post('/api/standard-maintenance/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        setImportResult(response.data.data);
        setCurrentStep(2);
        message.success('Data standard maintenance berhasil di-import');
        if (onImportSuccess) onImportSuccess();
      } else {
        message.error(response.data.message || 'Gagal mengimpor data');
      }
    } catch (error) {
      console.error(error);
      message.error(error.response?.data?.message || 'Terjadi kesalahan sistem saat mengimpor data');
    } finally {
      setUploading(false);
    }
  };

  const uploadProps = {
    onRemove: () => {
      setFileList([]);
    },
    beforeUpload: (file) => {
      const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || file.name.endsWith('.xlsx');
      if (!isExcel) {
        message.error(`${file.name} bukan file Excel (.xlsx)`);
        return Upload.LIST_IGNORE;
      }
      setFileList([file]);
      setCurrentStep(1);
      return false; // Prevent automatic upload
    },
    fileList,
    maxCount: 1,
  };

  const resetImport = () => {
    setFileList([]);
    setImportResult(null);
    setCurrentStep(0);
  };

  return (
    <Card variant="borderless" style={{ maxWidth: 800, margin: '0 auto', padding: '24px 0' }}>
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <Title level={4}>Import Standard Maintenance via Excel</Title>
        <Text type="secondary">Unggah konfigurasi standard maintenance secara bulk dengan file template Excel.</Text>
      </div>

      <Steps
        current={currentStep}
        style={{ marginBottom: 40 }}
        items={[
          { title: 'Download Template', description: 'Gunakan format standard' },
          { title: 'Pilih & Review File', description: 'Unggah file excel Anda' },
          { title: 'Selesai', description: 'Data tersimpan ke database' },
        ]}
      />

      {currentStep === 0 && (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <Alert
            message="Petunjuk Penggunaan Import Excel"
            description={
              <Paragraph style={{ margin: 0, textAlign: 'left', marginTop: 8 }}>
                <ul>
                  <li>Download template Excel khusus kategori <strong>{apiCategory}</strong> di bawah.</li>
                  <li>Isi kolom perangkat, fungsi, item pengecekan, standar normal, dan periodik.</li>
                  <li>Jangan mengubah tata letak baris header (Baris 1 s.d. 8) agar file dapat dibaca sistem.</li>
                  <li>Data duplikat secara otomatis akan di-skip oleh sistem.</li>
                </ul>
              </Paragraph>
            }
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
          <Alert
            message="PENTING: Aturan Penyesuaian Jadwal (Plan Resync)"
            description={
              <div style={{ textAlign: 'left', marginTop: 8 }}>
                Jika Anda mengimpor data standard maintenance baru di tengah periode berjalan, sistem akan menyinkronkan ulang jadwal:
                <ul>
                  <li>Hanya jadwal yang masih berstatus <strong>Plan (□)</strong> yang akan diperbarui/digeser tanggalnya berdasarkan parameter Excel baru.</li>
                  <li>Catatan pengecekan yang sudah berstatus <strong>Normal (✓)</strong> atau <strong>Abnormal (✗)</strong> tidak akan diubah atau dihapus untuk menjaga keutuhan riwayat audit.</li>
                </ul>
              </div>
            }
            type="warning"
            showIcon
            style={{ marginBottom: 24 }}
          />
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            size="large"
            onClick={downloadTemplate}
            style={{ backgroundColor: '#107c41', borderColor: '#107c41' }}
          >
            Download Template Excel ({apiCategory})
          </Button>
          <div style={{ marginTop: 24 }}>
            <Upload {...uploadProps}>
              <Button icon={<UploadOutlined />} size="large">Pilih File Excel untuk Di-import</Button>
            </Upload>
          </div>
        </div>
      )}

      {currentStep === 1 && (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24 }}>
            <FileExcelOutlined style={{ fontSize: 64, color: '#107c41', marginBottom: 16 }} />
            <Text strong style={{ fontSize: 16 }}>{fileList[0]?.name}</Text>
            <Text type="secondary">Kategori Target: {apiCategory}</Text>
          </div>

          <Alert
            message="Siap Di-import"
            description="Pastikan semua baris data telah diisi dengan benar. Proses ini akan menulis data secara aman ke database."
            type="warning"
            showIcon
            style={{ marginBottom: 24, textAlign: 'left' }}
          />

          <Space size="large">
            <Button onClick={resetImport} disabled={uploading}>Kembali</Button>
            <Button
              type="primary"
              onClick={handleUpload}
              loading={uploading}
              style={{ backgroundColor: '#107c41', borderColor: '#107c41' }}
            >
              Mulai Import Excel
            </Button>
          </Space>
        </div>
      )}

      {currentStep === 2 && importResult && (
        <Result
          status="success"
          title="Import Data Berhasil!"
          subTitle="Sistem telah berhasil membaca dan memetakan data Excel Anda."
          extra={[
            <Card key="summary" size="small" style={{ maxWidth: 400, margin: '0 auto 24px auto', textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text type="secondary">Total Baris Terproses:</Text>
                <Text strong>{importResult.total_rows}</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text type="secondary">Data Baru Di-import:</Text>
                <Text strong style={{ color: '#52c41a' }}>{importResult.imported}</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text type="secondary">Data Di-skip (Duplikat):</Text>
                <Text strong style={{ color: '#faad14' }}>{importResult.skipped}</Text>
              </div>
            </Card>,
            <Button key="back" type="primary" onClick={resetImport}>Import File Lain</Button>
          ]}
        />
      )}

      {uploading && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.7)', zIndex: 10 }}>
          <Spin size="large" tip="Sedang membaca dan memetakan Excel..." />
        </div>
      )}
    </Card>
  );
}

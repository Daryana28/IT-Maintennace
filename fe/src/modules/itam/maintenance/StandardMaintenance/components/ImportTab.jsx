import React, { useState, useEffect } from 'react';
import { Card, Typography, Button, Upload, Alert, Space, Steps, Result, Spin, message, Modal } from 'antd';
import { DownloadOutlined, UploadOutlined, FileExcelOutlined, EditOutlined, WarningOutlined, ReloadOutlined } from '@ant-design/icons';
import axios from '@/shared/services/apiClient';
import PreviewGrid from './PreviewGrid';

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

  const [checkingExistence, setCheckingExistence] = useState(true);
  const [hasExisting, setHasExisting] = useState(false);
  const [existingData, setExistingData] = useState([]);
  
  const [targetYear, setTargetYear] = useState(new Date().getFullYear());
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [parsedChecks, setParsedChecks] = useState([]);
  const [currentStep, setCurrentStep] = useState(0); // 0: Import/Select, 1: Preview Grid, 2: Success
  const [syncStatus, setSyncStatus] = useState(null);

  // Check if standard maintenance already exists for this year and category
  const checkMaintenanceExistence = async () => {
    setCheckingExistence(true);
    try {
      // 1. Fetch Year number
      const yearRes = await axios.get(`/standard-maintenance/years/${yearlyStandardId}`);
      if (yearRes.data?.success && yearRes.data?.data) {
        setTargetYear(yearRes.data.data.tahun);
      }

      // 2. Fetch standard maintenance data
      const res = await axios.get('/standard-maintenance', {
        params: {
          yearly_standard_id: yearlyStandardId,
          kategori: apiCategory
        }
      });

      if (res.data?.success && res.data?.data && res.data.data.length > 0) {
        setHasExisting(true);
        setExistingData(res.data.data);
      } else {
        setHasExisting(false);
        setExistingData([]);
      }
    } catch (err) {
      console.error(err);
      message.error("Gagal memeriksa data standard maintenance yang ada");
    } finally {
      setCheckingExistence(false);
    }
  };

  useEffect(() => {
    if (yearlyStandardId) {
      checkMaintenanceExistence();
    } else {
      setCheckingExistence(false);
    }
  }, [yearlyStandardId, apiCategory]);

  const downloadTemplate = () => {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    const url = `${baseUrl}/standard-maintenance/template/${apiCategory.toLowerCase()}`;
    window.open(url, '_blank');
    message.success(`Template ${apiCategory} berhasil di-download`);
  };

  // Reset standard maintenance on backend (Wipe checks and schedules)
  const handleResetMaintenance = () => {
    Modal.confirm({
      title: 'Reset Standard Maintenance?',
      icon: <WarningOutlined style={{ color: '#d9363e' }} />,
      content: 'Tindakan ini akan menghapus semua konfigurasi standard maintenance beserta seluruh jadwal schedule & actual matrix yang sudah tergenerate untuk kategori ini di tahun berjalan. Rapor logsheet abnormal yang terkait juga akan disesuaikan. Apakah Anda yakin?',
      okText: 'Ya, Reset Semua',
      okType: 'danger',
      cancelText: 'Batal',
      onOk: async () => {
        setUploading(true);
        try {
          const res = await axios.post('/standard-maintenance/reset', {
            yearly_standard_id: yearlyStandardId,
            kategori: apiCategory
          });
          if (res.data?.success) {
            message.success("Standard maintenance berhasil di-reset");
            setHasExisting(false);
            setExistingData([]);
            setFileList([]);
            setParsedChecks([]);
            setCurrentStep(0);
          } else {
            message.error(res.data?.message || "Gagal mereset data");
          }
        } catch (err) {
          message.error(err.response?.data?.message || "Terjadi kesalahan sistem saat mereset");
        } finally {
          setUploading(false);
        }
      }
    });
  };

  // Parse Excel buffer
  const handleUpload = async () => {
    if (fileList.length === 0) {
      message.error('Silakan pilih file Excel terlebih dahulu');
      return;
    }

    const formData = new FormData();
    formData.append('file', fileList[0]);
    formData.append('kategori', apiCategory);

    setUploading(true);
    try {
      const response = await axios.post('/standard-maintenance/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        setParsedChecks(response.data.data || []);
        setCurrentStep(1); // Go to grid mapping step
        message.success('Excel berhasil dibaca, silakan petakan tanggal rencana (plan)');
      } else {
        message.error(response.data.message || 'Gagal membaca file Excel');
      }
    } catch (error) {
      console.error(error);
      message.error(error.response?.data?.message || 'Terjadi kesalahan sistem saat membaca Excel');
    } finally {
      setUploading(false);
    }
  };

  // Submit preview changes to backend to save and sync schedule
  const handleSaveAndGenerate = async (checksList) => {
    setUploading(true);
    try {
      const response = await axios.post('/standard-maintenance/save-and-generate', {
        yearly_standard_id: yearlyStandardId,
        kategori: apiCategory,
        checks: checksList
      }, {
        timeout: 10 * 60 * 1000
      });

      if (response.data.success) {
        setSyncStatus(response.data.data);
        setCurrentStep(2); // Go to success step
        message.success('Jadwal maintenance berhasil disimpan dan disinkronkan');
        if (onImportSuccess) onImportSuccess();
      } else {
        message.error(response.data.message || 'Gagal menyimpan konfigurasi');
      }
    } catch (error) {
      console.error(error);
      message.error(error?.message || error?.response?.data?.message || 'Terjadi kesalahan saat men-generate schedule');
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
      return false; // Prevent automatic upload
    },
    fileList,
    maxCount: 1,
  };

  const handleCancelPreview = () => {
    Modal.confirm({
      title: 'Batalkan Rencana?',
      content: 'Perubahan pemetaan tanggal yang belum disimpan akan hilang. Apakah Anda yakin ingin kembali?',
      okText: 'Ya',
      cancelText: 'Tidak',
      onOk: () => {
        setFileList([]);
        setParsedChecks([]);
        setCurrentStep(0);
        checkMaintenanceExistence();
      }
    });
  };

  const handleEditCurrent = () => {
    setParsedChecks(existingData);
    setCurrentStep(1); // Open preview grid directly
  };

  if (checkingExistence) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <Spin size="large" tip="Memeriksa status konfigurasi..." />
      </div>
    );
  }

  // STEP 1: PREVIEW GRID MAPPING
  if (currentStep === 1) {
    return (
      <PreviewGrid
        initialChecks={parsedChecks}
        year={targetYear}
        categoryName={apiCategory}
        loading={uploading}
        onSave={handleSaveAndGenerate}
        onCancel={handleCancelPreview}
      />
    );
  }

  // STEP 2: SUCCESS STATUS
  if (currentStep === 2) {
    return (
      <Card variant="borderless" style={{ maxWidth: 700, margin: '0 auto', padding: '24px' }}>
        <Result
          status="success"
          title="Schedule Berhasil Di-generate!"
          subTitle={`Proses sinkronisasi standard maintenance dan matrix schedule untuk tahun ${targetYear} telah selesai.`}
          extra={[
            <Card key="summary" size="small" style={{ maxWidth: 450, margin: '0 auto 24px auto', textAlign: 'left', background: '#f6ffed', border: '1px solid #b7eb8f' }}>
              <div style={{ display: 'flex', justify: 'space-between', marginBottom: 8 }}>
                <Text type="secondary">Kategori:</Text>
                <Text strong>{apiCategory}</Text>
              </div>
              <div style={{ display: 'flex', justify: 'space-between', marginBottom: 8 }}>
                <Text type="secondary">Tahun Rencana:</Text>
                <Text strong>{targetYear}</Text>
              </div>
              <div style={{ display: 'flex', justify: 'space-between' }}>
                <Text type="secondary">Perangkat Disinkronkan:</Text>
                <Text strong style={{ color: '#52c41a' }}>{syncStatus?.schedules_synced || 0} Assets</Text>
              </div>
            </Card>,
            <Button key="back" type="primary" onClick={() => {
              setCurrentStep(0);
              checkMaintenanceExistence();
            }}>
              Kembali ke Menu Utama
            </Button>
          ]}
        />
      </Card>
    );
  }

  // STEP 0: SELECTION / UPLOADER
  return (
    <Card variant="borderless" style={{ maxWidth: 800, margin: '0 auto', padding: '24px 0' }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <Title level={4}>Standard Maintenance - Import & Konfigurasi</Title>
        <Text type="secondary">Atur item pengecekan standar dan petakan tanggal rencana pemeliharaan (schedule plan).</Text>
      </div>

      {hasExisting ? (
        // STATE: Standard maintenance already exists
        <div style={{ padding: '20px 0' }}>
          <Alert
            message="Standard Maintenance Sudah Terkonfigurasi"
            description={
              <div style={{ marginTop: 8 }}>
                Jadwal standard maintenance untuk kategori <strong>{apiCategory}</strong> di tahun <strong>{targetYear}</strong> sudah dikonfigurasi dan schedules sudah tergenerate.
                <Paragraph style={{ marginTop: 12, marginBottom: 0 }}>
                  Pilihlah salah satu aksi di bawah untuk memodifikasi jadwal:
                </Paragraph>
              </div>
            }
            type="success"
            showIcon
            style={{ marginBottom: 24 }}
          />

          <Card style={{ marginBottom: 24, background: '#fafafa' }} size="small">
            <Paragraph strong style={{ marginBottom: 8 }}>Pilihan Tindakan:</Paragraph>
            <ul style={{ paddingLeft: 20, marginBottom: 0 }}>
              <li><strong>Edit Current Standard Maintenance Schedule</strong>: Membuka editor Preview Grid menggunakan data yang ada di database untuk menggeser plan atau menambah item pengecekan.</li>
              <li><strong>Reset</strong>: Menghapus seluruh data standard maintenance dan schedule matrix kategori ini pada tahun {targetYear} agar Anda bisa mengimpor template Excel baru dari awal.</li>
            </ul>
          </Card>

          <Space size="middle" style={{ width: '100%', justifyContent: 'center' }}>
            <Button
              type="primary"
              icon={<EditOutlined />}
              size="large"
              onClick={handleEditCurrent}
              style={{ minWidth: 200 }}
            >
              Edit Current Schedule
            </Button>
            <Button
              danger
              icon={<ReloadOutlined />}
              size="large"
              onClick={handleResetMaintenance}
              style={{ minWidth: 200 }}
            >
              Reset / Import Ulang
            </Button>
          </Space>
        </div>
      ) : (
        // STATE: No standard maintenance exists, show uploader
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <Alert
            message="Petunjuk Penggunaan Import Excel"
            description={
              <Paragraph style={{ margin: 0, textAlign: 'left', marginTop: 8 }}>
                <ol>
                  <li>Download template Excel khusus kategori <strong>{apiCategory}</strong> di bawah.</li>
                  <li>Isi kolom perangkat, fungsi, item pengecekan, standar normal, dan periodik. (Kolom tanggal sengaja dihilangkan karena pemetaan tanggal dilakukan secara visual di web setelah upload).</li>
                  <li>Unggah file Excel yang telah diisi. Sistem akan membaca konfigurasi baris pengecekan.</li>
                  <li>Di halaman selanjutnya, lakukan pemetaan rencana pengecekan (plan) di calendar preview grid.</li>
                </ol>
              </Paragraph>
            }
            type="info"
            showIcon
            style={{ marginBottom: 20 }}
          />

          <Alert
            message="Integrasi & Validasi Rencana (Schedule Integrity)"
            description={
              <div style={{ textAlign: 'left', marginTop: 8 }}>
                Saat memetakan tanggal rencana di preview grid, pastikan Anda memenuhi batas minimum periodic pengecekan (misal: 1X/W wajib ditaro minimal 1 plan di setiap ISO week).
              </div>
            }
            type="warning"
            showIcon
            style={{ marginBottom: 24 }}
          />

          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              size="large"
              onClick={downloadTemplate}
              style={{ backgroundColor: '#107c41', borderColor: '#107c41', minWidth: 280 }}
            >
              Download Template Excel ({apiCategory})
            </Button>

            <div style={{ border: '2px dashed #d9d9d9', borderRadius: 8, padding: 32, marginTop: 16 }}>
              <Upload {...uploadProps}>
                <Button icon={<UploadOutlined />} size="large">Pilih File Excel Anda</Button>
              </Upload>
              {fileList.length > 0 && (
                <div style={{ marginTop: 24 }}>
                  <Button
                    type="primary"
                    onClick={handleUpload}
                    loading={uploading}
                    size="large"
                    style={{ backgroundColor: '#107c41', borderColor: '#107c41', minWidth: 200 }}
                  >
                    Lanjut ke Grid Mapping
                  </Button>
                </div>
              )}
            </div>
          </Space>
        </div>
      )}

      {uploading && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.7)', zIndex: 10 }}>
          <Spin size="large" tip="Sedang memproses data..." />
        </div>
      )}
    </Card>
  );
}

// fe/src/modules/itam/assets/pages/AssetDetailPage.jsx

import { useEffect, useMemo, useState, useCallback } from "react";
import { useLocation, useParams } from "react-router-dom";

import {
 Button,
 Card,
 Col,
 Descriptions,
 Row,
 Space,
 Spin,
 Statistic,
 Tabs,
 Tag,
 Timeline,
 Typography,
 message,
 Divider,
} from "antd";

import {
 EditOutlined,
 QrcodeOutlined,
 ReloadOutlined,
 SwapOutlined,
 EnvironmentOutlined,
} from "@ant-design/icons";

import assetService from "../services/assetService";
import useAssetActions from "../hooks/useAssetActions";
import useCmdb from "../../cmdb/hooks/useCmdb";
import { usePageHeader } from "@/layouts/MainLayout/MainLayout";

import { safeText, safeCurrency } from "@/shared/utils/safeRender";

const { Title } = Typography;

export default function AssetDetailPage() {
 const { pathname } = useLocation();
 const { id: paramId } = useParams();

 const id = useMemo(
  () => paramId || pathname.split("/").filter(Boolean).pop(),
  [pathname, paramId]
 );

 const { setHeaderTitle, setHeaderSubtitle } = usePageHeader() || {};

 const [asset, setAsset] = useState(null);
 const [lifecycle, setLifecycle] = useState([]);
 const [loading, setLoading] = useState(false);

 const [modalOpen, setModalOpen] = useState(false);
 const [modalType, setModalType] = useState(null);

 const cmdb = useCmdb(asset?.asset_id);

 const actions = useAssetActions({
  reload: () => {
   loadAsset();
   loadLifecycle();
  },
 });

 const loadAsset = useCallback(async () => {
  if (!id) return;

  setLoading(true);

  try {
   const res = await assetService.getById(id);

   const data =
    res?.data?.data ||
    res?.data ||
    res;

   setAsset(data || null);
  } catch (e) {
   console.error(e);
   message.error("Gagal memuat data aset");
  } finally {
   setLoading(false);
  }
 }, [id]);

 const loadLifecycle = useCallback(async () => {
  try {
   const res = await assetService.getLifecycle(id);
   setLifecycle(res || []);
  } catch {
   setLifecycle([]);
  }
 }, [id]);

 useEffect(() => {
  loadAsset();
  loadLifecycle();
 }, [loadAsset, loadLifecycle]);

 useEffect(() => {
  if (setHeaderTitle) setHeaderTitle("Detail Aset");
  if (setHeaderSubtitle) setHeaderSubtitle("Informasi detail, riwayat, dan relasi aset IT Anda.");
 }, [setHeaderTitle, setHeaderSubtitle]);

 const openModal = (type) => {
  setModalType(type);
  setModalOpen(true);
 };

 const closeModal = () => {
  setModalOpen(false);
  setModalType(null);
 };

 const handleSubmit = async (values) => {
  try {
   const assetId = asset?.asset_id;

   if (!assetId) {
    message.error("ID Aset tidak ditemukan");
    return;
   }

   if (modalType === "EDIT_ASSET") {
    await assetService.update(assetId, values);
   }

   if (modalType === "TRANSFER_OWNER") {
    await assetService.transferOwner(assetId, values);
   }

   if (modalType === "MOVE_LOCATION") {
    await assetService.moveLocation(assetId, values);
   }

   message.success("Operasi berhasil disimpan");

   closeModal();
   loadAsset();
   loadLifecycle();
  } catch (err) {
   console.error(err);
   message.error("Operasi gagal");
  }
 };

 if (loading || !asset) return (
  <div style={{ textAlign: 'center', padding: '50px' }}>
   <Spin size="large" tip="Memuat Detail Aset..." />
  </div>
 );

 const tabItems = [
  {
   key: "overview",
   label: "Ringkasan",
   children: (
    <Descriptions bordered column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }} size="middle">
     <Descriptions.Item label="Nama Aset">
      {safeText(asset?.asset_name)}
     </Descriptions.Item>

     <Descriptions.Item label="Kategori">
      {safeText(asset?.category?.category_name)}
     </Descriptions.Item>

     <Descriptions.Item label="Lokasi">
      {safeText(asset?.location?.location_name)}
     </Descriptions.Item>

     <Descriptions.Item label="Pemilik / Pengguna">
      {safeText(asset?.owner_name)}
     </Descriptions.Item>
    </Descriptions>
   ),
  },

  {
   key: "lifecycle",
   label: "Siklus Hidup",
   children: (
    <Timeline
     mode="left"
     items={(lifecycle || []).map((x, i) => ({
      key: i,
      label: x?.created_at,
      children: (
       <>
        <strong>{x?.action_name}</strong>
        <div style={{ color: '#666', marginTop: 4 }}>{x?.notes}</div>
       </>
      ),
     }))}
    />
   ),
  },

  {
   key: "cmdb",
   label: "CMDB",
   children: (
    <div style={{ padding: '8px 0' }}>
     <Title level={5}>Relasi Aset</Title>
     {(cmdb?.relations || []).length > 0 ? (
      <Row gutter={[16, 16]}>
       {(cmdb?.relations || []).map((r, i) => (
        <Col span={8} key={i}>
         <Card size="small" bordered style={{ borderColor: '#e8e8e8' }}>
          <Tag color="cyan">{safeText(r?.type)}</Tag>
          <div style={{ marginTop: 8, fontWeight: '500' }}>{safeText(r?.target_name)}</div>
         </Card>
        </Col>
       ))}
      </Row>
     ) : (
      <Typography.Text type="secondary">Belum ada relasi CMDB untuk aset ini.</Typography.Text>
     )}

     <Title level={5} style={{ marginTop: 24 }}>Dampak Gangguan (Impact)</Title>
     <Card size="small" style={{ background: '#f9f9f9', border: '1px dashed #d9d9d9' }}>
      <pre style={{ fontSize: 12, margin: 0 }}>
       {JSON.stringify(cmdb?.impact || {}, null, 2)}
      </pre>
     </Card>
    </div>
   ),
  },
  {
   key: "warranty",
   label: "Garansi / Kontrak",
   children: (
    <Descriptions bordered column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }} size="middle">
     <Descriptions.Item label="Vendor">
      {safeText(asset?.vendor)}
     </Descriptions.Item>

     <Descriptions.Item label="Mulai Garansi">
      {safeText(asset?.warranty_start)}
     </Descriptions.Item>

     <Descriptions.Item label="Akhir Garansi">
      {safeText(asset?.warranty_end)}
     </Descriptions.Item>

     <Descriptions.Item label="Nomor Kontrak">
      {safeText(asset?.contract_number)}
     </Descriptions.Item>

     <Descriptions.Item label="Level SLA">
      {safeText(asset?.sla_level)}
     </Descriptions.Item>
    </Descriptions>
   ),
  },
 ];

 return (
  <div className="workspace-page">
   <Space orientation="vertical" size="large" style={{ width: "100%", padding: '0 8px' }}>
    <Card 
     bordered={false} 
     style={{ borderRadius: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
    >
     <Row justify="space-between" align="middle" wrap gutter={[16, 16]}>
      <Col>
       <Title level={4} style={{ margin: 0, marginBottom: 8 }}>
        {safeText(asset?.asset_name)}
       </Title>
       <Space wrap>
        <Tag color="blue" style={{ padding: '2px 8px', fontSize: '13px' }}>
         {safeText(asset?.asset_code)}
        </Tag>
        <Tag color={asset?.status === 'ACTIVE' ? 'green' : 'orange'} style={{ padding: '2px 8px', fontSize: '13px' }}>
         {safeText(asset?.status)}
        </Tag>
       </Space>
      </Col>

      <Col>
       <Space wrap size="small">
        <Button
         icon={<ReloadOutlined />}
         onClick={() => {
          loadAsset();
          loadLifecycle();
          cmdb?.reload?.();
         }}
        >
         Refresh
        </Button>
        <Divider type="vertical" />
        <Button
         icon={<QrcodeOutlined />}
         onClick={() => actions?.generateQr?.(asset)}
        >
         QR Code
        </Button>
        <Button
         type="primary"
         icon={<EditOutlined />}
         onClick={() => openModal("EDIT_ASSET")}
        >
         Edit
        </Button>
        <Button 
         icon={<SwapOutlined />} 
         onClick={() => openModal("TRANSFER_OWNER")}
        >
         Transfer
        </Button>
        <Button 
         icon={<EnvironmentOutlined />} 
         onClick={() => openModal("MOVE_LOCATION")}
        >
         Pindah Lokasi
        </Button>
       </Space>
      </Col>
     </Row>
    </Card>

    <Row gutter={[16, 16]}>
     <Col xs={24} sm={12}>
      <Card bordered={false} style={{ borderRadius: '10px' }}>
       <Statistic title="Total Tiket IT" value={0} valueStyle={{ color: '#1890ff' }} />
      </Card>
     </Col>
     <Col xs={24} sm={12}>
      <Card bordered={false} style={{ borderRadius: '10px' }}>
       <Statistic title="Total Work Orders" value={0} valueStyle={{ color: '#52c41a' }} />
      </Card>
     </Col>
    </Row>

    <Card bordered={false} style={{ borderRadius: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
     <Tabs items={tabItems} size="large" />
    </Card>
   </Space>
  </div>
 );
}
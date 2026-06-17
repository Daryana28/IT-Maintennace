import React, { useState } from "react";
import { Typography, Row, Col, Tabs, Form } from "antd";
import "./StandardMaintenancePage.css";
import assetService from "../../assetManagement/services/assetService";

import ListTab from "./components/ListTab";
import ReviewTab from "./components/ReviewTab";
import ApprovalTab from "./components/ApprovalTab";

const { Title } = Typography;

import standardMaintenanceService from "../services/standardMaintenanceService";
import maintenanceScheduleService from "../services/maintenanceScheduleService";
import { message, Button } from "antd";
import { useSearchParams } from "react-router-dom";

export default function StandardMaintenancePage() {
  const [searchParams] = useSearchParams();
  const yearlyStandardId = searchParams.get("yearly_id");
  const [headerData, setHeaderData] = useState(null);
  const [activeTab, setActiveTab] = useState("list");
  const [categories, setCategories] = useState([]);
  const [maintenanceData, setMaintenanceData] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      try {
        const catData = await assetService.getCategories({ all: true });
        setCategories(Array.isArray(catData) ? catData : []);
      } catch (error) {
        console.error("Failed to load categories", error);
      }

      if (yearlyStandardId) {
        const header = await standardMaintenanceService.getYearlyById(yearlyStandardId);
        setHeaderData(header);
      }

      const result = await standardMaintenanceService.getAll(yearlyStandardId);

      // Group data hierarchically for 6-Level Table
      const groupedData = [];
      result.forEach((item) => {
        // Level 1: Kategori
        let katP = groupedData.find(p => p.kategori === item.kategori);
        if (!katP) {
          katP = {
            key: `kat-${item.kategori}`,
            id: item.id, // Primary ID for the first one found
            kategori: item.kategori,
            subKategoriList: [] // Level 2
          };
          groupedData.push(katP);
        }

        // Level 2: Sub Kategori
        let subKatP = katP.subKategoriList.find(sp => sp.subKategori === item.subKategori);
        if (!subKatP) {
          subKatP = {
            key: `subkat-${item.kategori}-${item.subKategori}`,
            id: item.id,
            kategori: item.kategori,
            subKategori: item.subKategori,
            namaPerangkatList: [] // Level 3
          };
          katP.subKategoriList.push(subKatP);
        }

        // Level 3: Nama Perangkat (mapped to namaPerangkat)
        let namaP = subKatP.namaPerangkatList.find(np => np.namaPerangkat === item.namaPerangkat);
        if (!namaP) {
          namaP = {
            key: `nama-${item.id}-${item.namaPerangkat}`,
            id: item.id,
            kategori: item.kategori,
            subKategori: item.subKategori,
            namaPerangkat: item.namaPerangkat,
            jenisPerangkatList: [] // Level 4
          };
          subKatP.namaPerangkatList.push(namaP);
        }

        // Level 4: Jenis Perangkat (mapped to subPerangkat)
        let jenisP = namaP.jenisPerangkatList.find(jp => jp.jenisPerangkat === item.subPerangkat);
        if (!jenisP) {
          jenisP = {
            key: `jenis-${item.id}-${item.subPerangkat}`,
            id: item.id,
            kategori: item.kategori,
            subKategori: item.subKategori,
            namaPerangkat: item.namaPerangkat,
            jenisPerangkat: item.subPerangkat,
            details: [] // Level 5
          };
          namaP.jenisPerangkatList.push(jenisP);
        }

        const parsedDetails = item.details || [];
        const formattedDetails = parsedDetails.map((detail) => {
          return {
            key: `detail-${detail.id || item.id + '-' + detail.fungsi}`, // Globally unique key
            detailId: detail.id,
            fungsi: detail.fungsi,
            deskripsi: detail.deskripsi,
            pengecekanList: (detail.pengecekanList || []).map((cek) => ({
              key: `cek-${cek.id || item.id + '-' + detail.id + '-' + cek.pengecekan}`,
              cekId: cek.id,
              pengecekan: cek.pengecekan,
              standard: cek.standard,
              periodik: cek.periodik,
              bagian: cek.bagian,
              metode: cek.metode,
              alat: cek.alat,
            }))
          };
        });

        // Add details to this jenisPerangkat
        jenisP.details.push(...formattedDetails);
      });

      setMaintenanceData(groupedData);
    } catch (err) {
      message.error("Gagal memuat data standard maintenance");
    }
  };

  React.useEffect(() => {
    loadData();
  }, []);



  const tabItems = [
    { key: "list", label: "List" },
    { key: "review", label: "Review" },
    { key: "approval", label: "Approval" },
  ];

  const sortedData = [...maintenanceData].map(kat => {
    // Sort subKategoriList deeply
    const sortedSubKat = [...(kat.subKategoriList || [])].sort((a, b) => {
      const getCat = (name, parentName) => {
         if (!parentName) return categories.find(c => c.category_name === name);
         const parent = categories.find(c => c.category_name === parentName);
         if (!parent) return null;
         return categories.find(c => c.category_name === name && c.parent_id === parent.category_id);
      };
      
      const subA = getCat(a.subKategori, kat.kategori);
      const subB = getCat(b.subKategori, kat.kategori);
      const orderSubA = subA?.sort_no || 0;
      const orderSubB = subB?.sort_no || 0;
      
      return orderSubA - orderSubB || (a.subKategori || "").localeCompare(b.subKategori || "");
    });
    
    return { ...kat, subKategoriList: sortedSubKat };
  }).sort((a, b) => {
    const getCat = (name, parentName) => {
       if (!parentName) return categories.find(c => c.category_name === name);
       const parent = categories.find(c => c.category_name === parentName);
       if (!parent) return null;
       return categories.find(c => c.category_name === name && c.parent_id === parent.category_id);
    };

    const katA = getCat(a.kategori);
    const katB = getCat(b.kategori);
    const orderKatA = katA?.sort_no || 0;
    const orderKatB = katB?.sort_no || 0;
    
    if (a.kategori !== b.kategori) {
       return orderKatA - orderKatB || (a.kategori || "").localeCompare(b.kategori || "");
    }
    
    return 0;
  });

  return (
    <div className="page-shell">
      {/* HEADER SECTION */}
      <div className="header-section">
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={3} className="header-title">
              {headerData ? `${headerData.judul} ${headerData.tahun}` : 'Standard Maintenance Detail'}
            </Title>
            <div className="header-breadcrumb">
              Maintenance &gt; Yearly Standard Configuration &gt; Detail
            </div>
          </Col>
          <Col>
            <Button 
              type="primary" 
              onClick={async () => {
                try {
                  const res = await maintenanceScheduleService.generateSchedule(yearlyStandardId);
                  message.success(res.message || "Berhasil generate schedule");
                } catch (e) {
                  message.error(e.response?.data?.message || "Gagal generate schedule");
                }
              }}
            >
              Generate Schedule
            </Button>
          </Col>
        </Row>

        {/* TABS */}
        <div style={{ marginTop: 24 }}>
          <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
        </div>
      </div>

      {activeTab === "list" && (
        <ListTab
          categories={categories}
          sortedData={sortedData}
          onSave={loadData}
          yearlyStandardId={yearlyStandardId}
        />
      )}

      {activeTab === "review" && <ReviewTab sortedData={sortedData} headerTitle={headerData ? `${headerData.judul} ${headerData.tahun}` : 'Standard Maintenance Detail'} />}

      {activeTab === "approval" && <ApprovalTab />}
    </div>
  );
}

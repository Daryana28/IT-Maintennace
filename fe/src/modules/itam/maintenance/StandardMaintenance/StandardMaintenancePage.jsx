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

export default function StandardMaintenancePage({ overrideCategory, overrideYearlyId }) {
  const [searchParams] = useSearchParams();
  const yearlyStandardId = overrideYearlyId || searchParams.get("yearly_id");
  // Ambil kategori dari path atau prop overrideCategory
  const pathParts = window.location.pathname.split('/');
  const routeCategory = overrideCategory || pathParts[3];
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
  const activeCategories = categoryMap[routeCategory] || (routeCategory ? [routeCategory] : []);
  
  const [headerData, setHeaderData] = useState(null);
  const [activeTab, setActiveTab] = useState("list");
  const [categories, setCategories] = useState([]);
  const [maintenanceData, setMaintenanceData] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const catData = await assetService.getCategories({ all: true });
      const categories = Array.isArray(catData) ? catData : [];
      setCategories(categories);

      if (yearlyStandardId) {
        const header = await standardMaintenanceService.getYearlyById(yearlyStandardId);
        setHeaderData(header);
      }
      
      // Ambil semua data
      let result = await standardMaintenanceService.getAll(yearlyStandardId);
      
      // Filter berdasarkan kategori aktif
      if (activeCategories.length > 0) {
        result = result.filter(item => activeCategories.includes(item.kategori?.toLowerCase()));
      }

      // 3. Bangun struktur tree dari categories
      const map = {};
      const roots = [];

      categories.forEach((node) => {
        map[node.category_id] = { ...node, key: String(node.category_id), children: [], maintenanceItems: [] };
      });

      // Bind maintenance data ke node kategori yang sesuai
      result.forEach((item) => {
        // Cari node berdasarkan nama (mulai dari yang terdalam)
        const names = [item.subPerangkat, item.namaPerangkat, item.tipePerangkat, item.subKategori, item.kategori].filter(Boolean);
        let targetNode = categories.find(c => c.category_name === names[0]);
        
        if (!targetNode) {
          targetNode = categories.find(c => c.category_name === item.kategori);
        }
        
        if (targetNode && map[targetNode.category_id]) {
          // Format details
          const formattedDetails = (item.details || []).map((detail) => ({
            key: `detail-${detail.id || item.id + '-' + detail.fungsi}`,
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
          }));
          
          item.formattedDetails = formattedDetails;
          map[targetNode.category_id].maintenanceItems.push(item);
        }
      });

      categories.forEach((node) => {
        const mappedNode = map[node.category_id];
        if (node.parent_id && map[node.parent_id]) {
          map[node.parent_id].children.push(mappedNode);
        } else {
          roots.push(mappedNode);
        }
      });

      const cleanEmptyChildren = (nodes) => {
        nodes.forEach((node) => {
          if (node.children.length === 0) {
            delete node.children;
          } else {
            node.children.sort((a, b) => (a.sort_no || 0) - (b.sort_no || 0));
            cleanEmptyChildren(node.children);
          }
        });
      };

      let finalTree = roots;
      if (activeCategories.length === 1) {
        finalTree = roots.filter(r => r.category_name?.toLowerCase() === activeCategories[0]);
      }

      finalTree.sort((a, b) => (a.sort_no || 0) - (b.sort_no || 0));
      cleanEmptyChildren(finalTree);

      setMaintenanceData(finalTree);
      
    } catch (err) {
      message.error("Gagal memuat data standard maintenance");
    } finally {
      setLoading(false);
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

  const sortedData = maintenanceData;

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
          overrideCategory={overrideCategory}
        />
      )}

      {activeTab === "review" && <ReviewTab sortedData={sortedData} headerTitle={headerData ? `${headerData.judul} ${headerData.tahun}` : 'Standard Maintenance Detail'} />}

      {activeTab === "approval" && <ApprovalTab />}
    </div>
  );
}

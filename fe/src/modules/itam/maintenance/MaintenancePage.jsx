import React, { useState, useEffect } from "react";
import { Typography, Row, Col, Tabs } from "antd";
import { useSearchParams, useLocation } from "react-router-dom";
import StandardMaintenancePage from "./StandardMaintenance/StandardMaintenancePage";
import MaintenanceSchedulePage from "./MaintenanceSchedulePage";
import MaintenanceLogSheetPage from "./MaintenanceLogSheetPage";
import "./StandardMaintenance/StandardMaintenancePage.css";

const { Title } = Typography;

export default function MaintenancePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const path = location.pathname;

  // Determine category from path or query
  let defaultCategory = "hardware";
  if (path.includes("/hardware")) defaultCategory = "hardware";
  else if (path.includes("/software-hardware")) defaultCategory = "software-hardware";
  else if (path.includes("/application")) defaultCategory = "application";
  else if (path.includes("/network")) defaultCategory = "network";
  else if (path.includes("/cyber-security")) defaultCategory = "cyber-security";

  // Determine tab from path or query
  let defaultTab = "standard";
  if (path.includes("/yearly-standard") || path.includes("/standard")) defaultTab = "standard";
  else if (path.includes("/schedule")) defaultTab = "schedule";
  else if (path.includes("/logsheet")) defaultTab = "abnormal";

  const category = searchParams.get("category") || defaultCategory;
  const tab = searchParams.get("tab") || defaultTab;
  const yearlyStandardId = searchParams.get("yearly_id");

  const handleCategoryChange = (key) => {
    setSearchParams({ category: key, tab, ...(yearlyStandardId ? { yearly_id: yearlyStandardId } : {}) });
  };

  const handleTabChange = (key) => {
    setSearchParams({ category, tab: key, ...(yearlyStandardId ? { yearly_id: yearlyStandardId } : {}) });
  };

  const categoryItems = [
    { key: "hardware", label: "Hardware" },
    { key: "software-hardware", label: "Software HW" },
    { key: "application", label: "Application" },
    { key: "network", label: "Network" },
    { key: "cyber-security", label: "Cybersecurity" }
  ];

  const tabItems = [
    { key: "standard", label: "Standard Maintenance" },
    { key: "schedule", label: "Schedule" },
    { key: "abnormal", label: "Sheet Abnormal" }
  ];

  return (
    <div className="page-shell">
      {/* Category Tabs (Top Level) */}
      <div className="header-tabs-wrapper" style={{ background: "#fff", padding: "16px 24px 0 24px", borderBottom: "1px solid #f0f0f0" }}>
        <Tabs 
          activeKey={category} 
          onChange={handleCategoryChange} 
          items={categoryItems} 
          style={{ marginBottom: 0 }}
        />
      </div>

      {/* Main Container */}
      <div style={{ padding: "24px" }}>
        {/* Child Tab Navigation */}
        <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Tabs 
            activeKey={tab} 
            onChange={handleTabChange} 
            items={tabItems} 
            type="card"
          />
        </div>

        {/* Dynamic View rendering */}
        <div className="tab-content-container">
          {tab === "standard" && (
            <StandardMaintenancePage 
              overrideCategory={category} 
              overrideYearlyId={yearlyStandardId}
            />
          )}
          {tab === "schedule" && (
            <MaintenanceSchedulePage 
              overrideCategory={category} 
              overrideYearlyId={yearlyStandardId}
            />
          )}
          {tab === "abnormal" && (
            <MaintenanceLogSheetPage 
              overrideCategory={category} 
              overrideYearlyId={yearlyStandardId}
            />
          )}
        </div>
      </div>
    </div>
  );
}

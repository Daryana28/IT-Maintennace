import React from "react";
import { LoadingOutlined } from "@ant-design/icons";

export default function PageLoader() {
  return (
    <div className="page-loader-container">
      <div className="page-loader-spinner-wrapper">
        <div className="page-loader-ring"></div>
        <LoadingOutlined className="page-loader-icon" />
      </div>
      <div className="page-loader-text">Memuat Data...</div>
    </div>
  );
}

import { Button, Upload, Space } from "antd";
import {
 DownloadOutlined,
 UploadOutlined,
 PrinterOutlined,
 FileExcelOutlined
} from "@ant-design/icons";

export default function AssetToolbar({
 onTemplate,
 onImport,
 onExport,
 onPrintLabels,
}) {
 return (
  <Space wrap size="small">
   <Button onClick={onTemplate} icon={<FileExcelOutlined />}>
    Template Excel
   </Button>

   <Upload
    accept=".xlsx,.xls"
    showUploadList={false}
    beforeUpload={onImport}
   >
    <Button icon={<UploadOutlined />}>
     Import Excel
    </Button>
   </Upload>

   <Button
    icon={<DownloadOutlined />}
    onClick={onExport}
   >
    Export Excel
   </Button>

   <Button
    icon={<PrinterOutlined />}
    onClick={onPrintLabels}
   >
    Cetak Label
   </Button>
  </Space>
 );
}
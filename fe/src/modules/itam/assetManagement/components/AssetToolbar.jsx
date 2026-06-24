import { Button, Upload, Space, Popconfirm } from "antd";
import {
 DownloadOutlined,
 UploadOutlined,
 PrinterOutlined,
 FileExcelOutlined,
 DeleteOutlined,
} from "@ant-design/icons";

export default function AssetToolbar({
 onTemplate,
 onImport,
 onExport,
 onPrintLabels,
 onDeleteAll,
 deleteAllLabel = "Delete All",
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

   {onDeleteAll && (
    <Popconfirm
     title={`Hapus semua data ${deleteAllLabel}?`}
     description="Data di tab aktif akan dihapus permanen."
     onConfirm={onDeleteAll}
     okText="Hapus"
     cancelText="Batal"
    >
     <Button danger icon={<DeleteOutlined />}>
      Delete All
     </Button>
    </Popconfirm>
   )}
  </Space>
 );
}

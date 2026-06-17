import React, { useState } from "react";
import { Table, Card, Button, Input, Space, Typography, Tag, Select, Row, Col, Modal, Form, Popconfirm, InputNumber, Upload, message } from "antd";
import { 
  SearchOutlined, 
  DownloadOutlined, 
  PlusOutlined,
  FilterOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined
} from "@ant-design/icons";
import * as XLSX from "xlsx";
import axios from "axios";
import "./AssetBudgetPage.css";

const { Title, Text } = Typography;
const { Option } = Select;

export default function AssetBudgetPage() {
  const [searchText, setSearchText] = useState("");
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const [data, setData] = useState([
    {
      key: "1",
      budgetCode: "BDG-2026-001",
      subject: "IT Infrastructure",
      initialPlan: 500000000,
      review: "Approved",
      itemNo: "IT-001",
      itemName: "Laptop Managerial",
      qty: 5,
      purchasePrice: 15000000,
      rate: "1:15000",
      initialBudget: 75000000,
      poDate: "2026-01-15",
      shipDate: "2026-02-01",
      estimationDate: "2026-02-15",
      paymentDate: "2026-02-20",
      paymentAmount1: 75000000,
    },
    {
      key: "2",
      budgetCode: "BDG-2026-002",
      subject: "Security System",
      initialPlan: 200000000,
      review: "Pending",
      itemNo: "SEC-002",
      itemName: "CCTV Camera",
      qty: 10,
      purchasePrice: 5000000,
      rate: "1:15000",
      initialBudget: 50000000,
      poDate: "2026-02-10",
      shipDate: "2026-03-01",
      estimationDate: "2026-03-10",
      paymentDate: "2026-03-15",
      paymentAmount1: 50000000,
    }
  ]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [editingKey, setEditingKey] = useState(null);
  const [form] = Form.useForm();

  const downloadTemplate = () => {
    const headers = [
      "No.Budget", "Subject", "Initial Plan", "Review", "Item No", "Items", 
      "Qty", "Purchase Price", "Rate", "Budget", "PO Date", "Ship Date", 
      "Estimation Date", "Tanggal Pembayaran", "Jumlah Pembayaran 1"
    ];
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([headers]);
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "Template_Budget_Asset.xlsx");
  };

  const handleImport = (file) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      
      const formattedData = jsonData.map((item) => ({
        budget_code: item['No.Budget'],
        subject: item['Subject'],
        initial_plan: item['Initial Plan'],
        review: item['Review'],
        item_no: item['Item No'],
        item_name: item['Items'],
        qty: item['Qty'],
        purchase_price: item['Purchase Price'],
        rate: item['Rate'],
        budget: item['Budget'],
        po_date: item['PO Date'] || null,
        ship_date: item['Ship Date'] || null,
        estimation_date: item['Estimation Date'] || null,
        payment_date: item['Tanggal Pembayaran'] || null,
        payment_amount_1: item['Jumlah Pembayaran 1'],
      }));
      
      try {
        await axios.post(`${import.meta.env.VITE_API_URL}/asset-budgets/import`, formattedData);
        message.success("Berhasil import data");
        const newData = formattedData.map((item, index) => ({
            ...item,
            key: Date.now() + index,
            budgetCode: item.budget_code,
            itemName: item.item_name,
            initialBudget: item.budget,
            paymentAmount1: item.payment_amount_1
        }));
        setData((prevData) => [...newData, ...prevData]);
      } catch (error) {
        message.error("Gagal import data: " + error.message);
      }
    };
    reader.readAsArrayBuffer(file);
    return false; // Prevent auto-upload
  };

  const handleOpenModal = (mode, record = null) => {
    setModalMode(mode);
    if (mode === "edit" && record) {
      setEditingKey(record.key);
      form.setFieldsValue(record);
    } else {
      setEditingKey(null);
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleSubmit = (values) => {
    if (modalMode === "create") {
      const newRecord = {
        key: Date.now().toString(),
        ...values,
      };
      setData([newRecord, ...data]);
    } else {
      setData(data.map(item => item.key === editingKey ? { ...item, ...values } : item));
    }
    handleCloseModal();
  };

  const handleDelete = (key) => {
    setData(data.filter(item => item.key !== key));
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const columns = [
    { title: "No Budget", dataIndex: "budgetCode", key: "budgetCode", width: 120 },
    { title: "Subject", dataIndex: "subject", key: "subject", width: 150 },
    { title: "Initial Plan", dataIndex: "initialPlan", key: "initialPlan", width: 120, align: "right", render: (val) => formatCurrency(val) },
    { title: "Review", dataIndex: "review", key: "review", width: 100 },
    { title: "Item No", dataIndex: "itemNo", key: "itemNo", width: 100 },
    { title: "Items", dataIndex: "itemName", key: "itemName", width: 200 },
    { title: "Qty", dataIndex: "qty", key: "qty", width: 80 },
    { title: "Purchase Price", dataIndex: "purchasePrice", key: "purchasePrice", width: 150, align: "right", render: (val) => formatCurrency(val) },
    { title: "Rate", dataIndex: "rate", key: "rate", width: 100 },
    { title: "Budget", dataIndex: "initialBudget", key: "initialBudget", width: 150, align: "right", render: (val) => formatCurrency(val) },
    { title: "PO Date", dataIndex: "poDate", key: "poDate", width: 120 },
    { title: "Ship Date", dataIndex: "shipDate", key: "shipDate", width: 120 },
    { title: "Estimation Date", dataIndex: "estimationDate", key: "estimationDate", width: 120 },
    { title: "Tanggal Pembayaran", dataIndex: "paymentDate", key: "paymentDate", width: 150 },
    { title: "Jumlah Pembayaran 1", dataIndex: "paymentAmount1", key: "paymentAmount1", width: 150, align: "right", render: (val) => formatCurrency(val) },
    {
      title: "Aksi",
      key: "action",
      fixed: "right",
      width: 100,
      align: "center",
      render: (_, record) => (
        <Space size="small">
          <Button type="primary" ghost icon={<EditOutlined />} size="small" onClick={() => handleOpenModal("edit", record)} />
          <Popconfirm title="Hapus?" onConfirm={() => handleDelete(record.key)} okText="Ya" cancelText="Batal">
            <Button type="primary" danger ghost icon={<DeleteOutlined />} size="small" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="budget-asset-page">
      <div className="page-header">
        <div>
          <Title level={3} style={{ margin: 0 }}>Budget Asset</Title>
          <Text type="secondary">Kelola dan pantau alokasi budget aset tahunan</Text>
        </div>
        <Space>
          <Button icon={<DownloadOutlined />} onClick={downloadTemplate}>Download Template</Button>
          <Upload beforeUpload={handleImport} showUploadList={false}>
            <Button icon={<UploadOutlined />}>Import Excel</Button>
          </Upload>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal("create")}>Tambah Budget</Button>
        </Space>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={24}>
          <Card bordered={false} style={{ borderRadius: '8px' }}>
            <Text type="secondary">Silakan tambahkan data budget aset.</Text>
          </Card>
        </Col>
      </Row>

      <Card className="budget-card" bordered={false}>
        <div className="table-toolbar">
          <Space>
            <Input
              placeholder="Cari budget code / item..."
              prefix={<SearchOutlined className="text-gray-400" />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 300 }}
              allowClear
            />
            <Select 
              value={selectedYear} 
              onChange={setSelectedYear} 
              style={{ width: 120 }}
            >
              <Option value={currentYear - 1}>{currentYear - 1}</Option>
              <Option value={currentYear}>{currentYear}</Option>
              <Option value={currentYear + 1}>{currentYear + 1}</Option>
            </Select>
            <Button icon={<FilterOutlined />}>Filter Lanjutan</Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={data}
          scroll={{ x: 2200, y: 600 }}
          pagination={{
            total: data.length,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} item`,
          }}
          bordered
          size="middle"
          className="budget-table"
        />
      </Card>

      <Modal
        title={modalMode === "create" ? "Tambah Budget Aset" : "Edit Budget Aset"}
        open={isModalVisible}
        onCancel={handleCloseModal}
        onOk={() => form.submit()}
        okText="Simpan"
        cancelText="Batal"
        destroyOnClose
        width={800}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col xs={24} md={12}><Form.Item name="budgetCode" label="No Budget"><Input /></Form.Item></Col>
            <Col xs={24} md={12}><Form.Item name="subject" label="Subject"><Input /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} md={12}><Form.Item name="initialPlan" label="Initial Plan"><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
            <Col xs={24} md={12}><Form.Item name="review" label="Review"><Input /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} md={12}><Form.Item name="itemNo" label="Item No"><Input /></Form.Item></Col>
            <Col xs={24} md={12}><Form.Item name="itemName" label="Items"><Input /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} md={8}><Form.Item name="qty" label="Qty"><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
            <Col xs={24} md={8}><Form.Item name="purchasePrice" label="Purchase Price"><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
            <Col xs={24} md={8}><Form.Item name="rate" label="Rate"><Input /></Form.Item></Col>
          </Row>
          <Form.Item name="initialBudget" label="Budget"><InputNumber style={{ width: '100%' }} /></Form.Item>
          <Row gutter={16}>
            <Col xs={24} md={8}><Form.Item name="poDate" label="PO Date"><Input /></Form.Item></Col>
            <Col xs={24} md={8}><Form.Item name="shipDate" label="Ship Date"><Input /></Form.Item></Col>
            <Col xs={24} md={8}><Form.Item name="estimationDate" label="Estimation Date"><Input /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} md={12}><Form.Item name="paymentDate" label="Tanggal Pembayaran"><Input /></Form.Item></Col>
            <Col xs={24} md={12}><Form.Item name="paymentAmount1" label="Jumlah Pembayaran 1"><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
}

import React, { useState } from "react";
import { Table, Card, Button, Input, Space, Typography, Select, Row, Col, Modal, Form, Popconfirm, InputNumber, Upload, message } from "antd";
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

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAssetBudgets = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/asset-budgets`);
      if (response.data.success) {
        const fetchedData = response.data.data.map((item) => ({
          key: item.id,
          budgetCode: item.budget_code,
          subject: item.subject,
          initialPlan: item.initial_plan,
          review: item.review,
          itemNo: item.item_no,
          itemName: item.item_name,
          factory: item.factory,
          vehicleType: item.vehicle_type,
          qty: item.qty,
          purpose: item.purpose,
          sale: item.sale,
          currency: item.currency,
          pricePengajuan: item.price_pengajuan,
          purchasePrice: item.purchase_price,
          rate: item.rate,
          initialBudget: item.budget,
          poDate: item.po_date,
          shipDate: item.ship_date,
          acceptanceMonth: item.acceptance_month,
          paymentCondition: item.payment_condition,
          paymentDate1: item.payment_date_1,
          paymentRate1: item.payment_rate_1,
          paymentAmount1: item.payment_amount_1,
          paymentDate2: item.payment_date_2,
          paymentRate2: item.payment_rate_2,
          paymentAmount2: item.payment_amount_2,
          paymentDate3: item.payment_date_3,
          paymentRate3: item.payment_rate_3,
          paymentAmount3: item.payment_amount_3,
          massProTiming: item.mass_pro_timing,
          capitalizedMonth: item.capitalized_month,
        }));
        setData(fetchedData);
      }
    } catch (error) {
      message.error("Gagal mengambil data budget: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchAssetBudgets();
  }, []);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [editingKey, setEditingKey] = useState(null);
  const [form] = Form.useForm();

  const downloadTemplate = () => {
    const headers = [
      ["予算№\nNo.Budget", "設備予算件名\nSubject", "当初計画\nInitial plan (IDR)", "見直し\nReview (IDR)", "Item\nNo.", "個別ｱｲﾃﾑ\nItems", "Factory", "Vehicle Type", "数量\nQty", "目的区分\nPurpose", "売却\nSale", "通貨\ncurrency", "購入金額\nPrice (PENGAJUAN)", "購入金額\nPrice (APPROVED)", "為替\nレート\nRate", "個別予算\nBudget (IDR)", "発注月\nPO Date (YYYYMM)", "納入月\n(出荷月)\nShip Date (YYYYMM)", "検収月\n(YYYYMM)", "支払条件\nPayment Conditions", "支払日①\nPay 1 (YYYYMM)", "Rate 1", "Amount 1", "支払日②\nPay 2 (YYYYMM)", "Rate 2", "Amount 2", "支払日③\nPay 3 (YYYYMM)", "Rate 3", "Amount 3", "量産運用\n開始月\nMass Pro Timing (YYYYMM)", "資産\n計上月\nCapitalized month (YYYYMM)"]
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(headers);

    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "Template_Budget_Asset.xlsx");
  };

  const handleImport = (file) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      
      const allFormattedData = [];
      const ignoredSheets = ["Sheet1", "Category", "目的区分 Purpose"];
      
      const parseNumber = (val) => {
        if (val === null || val === undefined || val === "" || val === "-") return null;
        const num = Number(val);
        return isNaN(num) ? null : num;
      };

      for (const sheetName of workbook.SheetNames) {
        if (ignoredSheets.includes(sheetName)) continue;
        
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });
        
        let currentBudgetCode = "";
        let currentSubject = "";
        let currentInitialPlan = null;
        let currentReview = null;

        let budgetIdx = 14;
        let rateIdx = 13;
        
        for (let r = 4; r <= 6; r++) {
          if (!jsonData[r]) continue;
          for (let c = 12; c <= 18; c++) {
            const val = String(jsonData[r][c] || "").toLowerCase();
            if ((val.includes("budget") || val.includes("個別予算")) && !val.includes("no") && val.includes("idr")) budgetIdx = c;
            else if ((val.includes("budget") || val.includes("個別予算")) && !val.includes("no")) budgetIdx = c;
            if (val.includes("rate") || val.includes("レート")) rateIdx = c;
          }
        }
        
        let base = budgetIdx;

        for (let i = 0; i < jsonData.length; i++) {
          const row = jsonData[i];
          if (!row) continue;
          
          if (row[0] && String(row[0]).trim() !== "") {
            const row0Str = String(row[0]).trim();
            if (
              row0Str.includes("No.Budget") || 
              row0Str.includes("No.Budet") || 
              row0Str.startsWith("[") || 
              row0Str.startsWith("【") || 
              row0Str === "全体予算" || 
              row0Str === "計画" || 
              row0Str.includes("予算№") || 
              row0Str.includes("設備投資")
            ) {
              // Ignore headers
            } else {
              currentBudgetCode = row[0];
              currentSubject = row[1];
              currentInitialPlan = parseNumber(row[2]);
              currentReview = parseNumber(row[3]);
            }
          }

          if (row[4] && row[5] && !String(row[5]).includes("個別ｱｲﾃﾑ")) {
            const paymentCond = [row[base + 4], row[base + 5]].filter(Boolean).join(" ");
            
            allFormattedData.push({
              budget_code: String(currentBudgetCode || "").substring(0, 100),
              subject: String(currentSubject || "").substring(0, 255),
              initial_plan: currentInitialPlan,
              review: currentReview,
              item_no: String(row[4] || "").substring(0, 100),
              item_name: String(row[5] || "").substring(0, 255),
              factory: String(row[6] || "").substring(0, 100),
              vehicle_type: String(row[7] || "").substring(0, 100),
              qty: parseNumber(row[8]),
              purpose: String(row[9] || "").substring(0, 100),
              sale: String(row[10] || "").substring(0, 100),
              currency: String(row[11] || "IDR").substring(0, 50),
              price_pengajuan: parseNumber(row[12]),
              purchase_price: parseNumber(row[rateIdx - 1] || row[12]),
              rate: String(row[rateIdx] || "").substring(0, 50),
              budget: parseNumber(row[base]),
              po_date: String(row[base + 1] || "").substring(0, 10),
              ship_date: String(row[base + 2] || "").substring(0, 10),
              acceptance_month: String(row[base + 3] || "").substring(0, 10),
              payment_condition: paymentCond.substring(0, 255),
              payment_date_1: String(row[base + 6] || "").substring(0, 10),
              payment_rate_1: String(row[base + 7] || "").substring(0, 50),
              payment_amount_1: parseNumber(row[base + 8]),
              payment_date_2: String(row[base + 9] || "").substring(0, 10),
              payment_rate_2: String(row[base + 10] || "").substring(0, 50),
              payment_amount_2: parseNumber(row[base + 11]),
              payment_date_3: String(row[base + 12] || "").substring(0, 10),
              payment_rate_3: String(row[base + 13] || "").substring(0, 50),
              payment_amount_3: parseNumber(row[base + 14]),
              mass_pro_timing: String(row[base + 15] || "").substring(0, 10),
              capitalized_month: String(row[base + 16] || "").substring(0, 10),
            });
          }
        }
      }
      
      const formattedData = allFormattedData.filter(item => item.budget_code);
      console.log("DEBUG: Total data to import:", formattedData.length);

      try {
        await axios.post(`${import.meta.env.VITE_API_URL}/asset-budgets/import`, formattedData);
        message.success("Berhasil import data");
        const newData = formattedData.map((item, index) => ({
          key: Date.now() + index,
          budgetCode: item.budget_code,
          subject: item.subject,
          initialPlan: item.initial_plan,
          review: item.review,
          itemNo: item.item_no,
          itemName: item.item_name,
          factory: item.factory,
          vehicleType: item.vehicle_type,
          qty: item.qty,
          purpose: item.purpose,
          sale: item.sale,
          currency: item.currency,
          pricePengajuan: item.price_pengajuan,
          purchasePrice: item.purchase_price,
          rate: item.rate,
          initialBudget: item.budget,
          poDate: item.po_date,
          shipDate: item.ship_date,
          acceptanceMonth: item.acceptance_month,
          paymentCondition: item.payment_condition,
          paymentDate1: item.payment_date_1,
          paymentRate1: item.payment_rate_1,
          paymentAmount1: item.payment_amount_1,
          paymentDate2: item.payment_date_2,
          paymentRate2: item.payment_rate_2,
          paymentAmount2: item.payment_amount_2,
          paymentDate3: item.payment_date_3,
          paymentRate3: item.payment_rate_3,
          paymentAmount3: item.payment_amount_3,
          massProTiming: item.mass_pro_timing,
          capitalizedMonth: item.capitalized_month,
        }));
        setData((prevData) => [...newData, ...prevData]);
      } catch (error) {
        message.error("Gagal import data: " + (error.response?.data?.message || error.message));
      }
    };
    reader.readAsArrayBuffer(file);
    return false; 
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

  const renderMergedCell = (customRender = (val) => val) => (value, row, index) => {
    const obj = {
      children: customRender(value, row, index),
      props: {},
    };
    
    if (index > 0 && data[index - 1].budgetCode === row.budgetCode) {
      obj.props.rowSpan = 0;
    } else {
      let rowSpan = 1;
      for (let i = index + 1; i < data.length; i++) {
        if (data[i].budgetCode === row.budgetCode) {
          rowSpan++;
        } else {
          break;
        }
      }
      obj.props.rowSpan = rowSpan;
    }
    return obj;
  };

  const columns = [
    { title: <div>予算№<br />No.Budget</div>, dataIndex: "budgetCode", key: "budgetCode", width: 120, fixed: "left", render: renderMergedCell() },
    { title: <div>設備予算件名<br />Subject</div>, dataIndex: "subject", key: "subject", width: 150, fixed: "left", render: renderMergedCell() },
    { 
      title: <div>当初計画<br />Initial plan</div>,
      children: [
        { title: <div>申請額<br />Budget<br />(IDR)</div>, dataIndex: "initialPlan", key: "initialPlan", width: 120, align: "right", render: renderMergedCell((val) => val ? formatCurrency(val) : "-") }
      ]
    },
    { 
      title: <div>見直し<br />Review</div>,
      children: [
        { title: <div>申請額<br />Budget<br />(IDR)</div>, dataIndex: "review", key: "review", width: 120, align: "right", render: renderMergedCell((val) => !isNaN(val) && val !== null ? formatCurrency(val) : val) }
      ]
    },
    { title: <div>Item<br />No.</div>, dataIndex: "itemNo", key: "itemNo", width: 100 },
    { title: <div>個別ｱｲﾃﾑ<br />Items</div>, dataIndex: "itemName", key: "itemName", width: 200 },
    { title: <div>1:1工場<br />2:2工場<br />0:共用</div>, dataIndex: "factory", key: "factory", width: 100 },
    { title: <div>2:2輪用 2:2W<br />4:4輪用 4:4W<br />0:汎用 0:2W&4W</div>, dataIndex: "vehicleType", key: "vehicleType", width: 150 },
    { title: <div>数量<br />Qty</div>, dataIndex: "qty", key: "qty", width: 80 },
    { title: <div>目的区分<br />Purpose</div>, dataIndex: "purpose", key: "purpose", width: 120 },
    { title: <div>売却<br />Sale</div>, dataIndex: "sale", key: "sale", width: 100 },
    {
      title: "当初計画 Initial Plan",
      children: [
        {
          title: <div>購入金額<br />Purchase Price</div>,
          children: [
            { title: <div>通貨<br />currency</div>, dataIndex: "currency", key: "currency", width: 100 },
            { title: <div>購入金額<br />Price<br />(PENGAJUAN)</div>, dataIndex: "pricePengajuan", key: "pricePengajuan", width: 150, align: "right", render: (val) => val ? formatCurrency(val) : "-" },
            { title: <div>購入金額<br />Price<br />(APPROVED)</div>, dataIndex: "purchasePrice", key: "purchasePrice", width: 150, align: "right", render: (val) => val ? formatCurrency(val) : "-" }
          ]
        },
        { title: <div>為替<br />レート<br />Rate</div>, dataIndex: "rate", key: "rate", width: 100 },
        { title: <div>個別予算<br />Budget<br />(IDR)</div>, dataIndex: "initialBudget", key: "initialBudget", width: 150, align: "right", render: (val) => val ? formatCurrency(val) : "-" }
      ]
    },
    { title: <div>発注月<br />PO Date<br />(YYYYMM)</div>, dataIndex: "poDate", key: "poDate", width: 120 },
    { title: <div>納入月<br />(出荷月)<br />T1/Ship Date<br />(YYYYMM)</div>, dataIndex: "shipDate", key: "shipDate", width: 150 },
    { title: <div>検収月<br />(YYYYMM)</div>, dataIndex: "acceptanceMonth", key: "acceptanceMonth", width: 120 },
    {
      title: "支払条件 Payment Conditions",
      children: [
        { title: <div>条件<br />Condition</div>, dataIndex: "paymentCondition", key: "paymentCondition", width: 120 },
        { title: <div>支払日①<br />Pay 1<br />(YYYYMM)</div>, dataIndex: "paymentDate1", key: "paymentDate1", width: 120 },
        { title: "Rate", dataIndex: "paymentRate1", key: "paymentRate1", width: 100 },
        { title: <div>Amount of<br />Payment1</div>, dataIndex: "paymentAmount1", key: "paymentAmount1", width: 150, align: "right", render: (val) => val ? formatCurrency(val) : "-" },
        { title: <div>支払日②<br />Pay 2<br />(YYYYMM)</div>, dataIndex: "paymentDate2", key: "paymentDate2", width: 120 },
        { title: "Rate", dataIndex: "paymentRate2", key: "paymentRate2", width: 100 },
        { title: <div>Amount of<br />Payment2</div>, dataIndex: "paymentAmount2", key: "paymentAmount2", width: 150, align: "right", render: (val) => val ? formatCurrency(val) : "-" },
        { title: <div>支払日③<br />Pay 3<br />(YYYYMM)</div>, dataIndex: "paymentDate3", key: "paymentDate3", width: 120 },
        { title: "Rate", dataIndex: "paymentRate3", key: "paymentRate3", width: 100 },
        { title: <div>Amount of<br />Payment3</div>, dataIndex: "paymentAmount3", key: "paymentAmount3", width: 150, align: "right", render: (val) => val ? formatCurrency(val) : "-" }
      ]
    },
    { title: <div>量産運用<br />開始月<br />Mass Pro<br />Timing<br />(YYYYMM)</div>, dataIndex: "massProTiming", key: "massProTiming", width: 150 },
    { title: <div>資産<br />計上月<br />Capitalized month<br />(YYYYMM)</div>, dataIndex: "capitalizedMonth", key: "capitalizedMonth", width: 150 },
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

  const wrapColumnKeys = new Set(["itemName", "factory", "vehicleType"]);
  const columnWidthOverrides = {
    itemName: 280,
    factory: 110,
    vehicleType: 150,
  };

  const enhanceColumns = (items) =>
    items.map((column) => {
      const nextColumn = { ...column };

      if (nextColumn.children) {
        nextColumn.children = enhanceColumns(nextColumn.children);
      }

      if (wrapColumnKeys.has(nextColumn.dataIndex)) {
        const originalRender = nextColumn.render;
        nextColumn.width = columnWidthOverrides[nextColumn.dataIndex] || nextColumn.width;
        nextColumn.className = [nextColumn.className, "budget-table__cell--wrap"].filter(Boolean).join(" ");
        nextColumn.render = (value, record, index) => {
          const rendered = originalRender ? originalRender(value, record, index) : value;

          if (rendered && typeof rendered === "object" && "props" in rendered && "children" in rendered) {
            return {
              ...rendered,
              children: <div className="budget-table__text-wrap">{rendered.children || "-"}</div>,
            };
          }

          return <div className="budget-table__text-wrap">{rendered || "-"}</div>;
        };
      }

      return nextColumn;
    });

  const displayColumns = enhanceColumns(columns);

  return (
    <div className="budget-asset-page">
      <div className="page-header">
        <div>
          <Title level={3} style={{ fontWeight: 700 }}>Asset Budget</Title>
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

      <Card className="budget-card" variant="borderless">
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
          columns={displayColumns}
          dataSource={data}
          loading={loading}
          scroll={{ x: 3800, y: 600 }}
          sticky
          pagination={{
            total: data.length,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} item`,
          }}
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
        destroyOnHidden
        width={800}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col xs={24} md={12}><Form.Item name="budgetCode" label="No Budget"><Input /></Form.Item></Col>
            <Col xs={24} md={12}><Form.Item name="subject" label="Subject"><Input /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} md={12}><Form.Item name="initialPlan" label="Initial Plan (IDR)"><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
            <Col xs={24} md={12}><Form.Item name="review" label="Review (IDR)"><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} md={8}><Form.Item name="itemNo" label="Item No"><Input /></Form.Item></Col>
            <Col xs={24} md={16}><Form.Item name="itemName" label="Items"><Input /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} md={8}><Form.Item name="factory" label="Factory"><Input /></Form.Item></Col>
            <Col xs={24} md={8}><Form.Item name="vehicleType" label="Vehicle Type"><Input /></Form.Item></Col>
            <Col xs={24} md={8}><Form.Item name="qty" label="Qty"><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} md={8}><Form.Item name="purpose" label="Purpose"><Input /></Form.Item></Col>
            <Col xs={24} md={8}><Form.Item name="sale" label="Sale"><Input /></Form.Item></Col>
            <Col xs={24} md={8}><Form.Item name="currency" label="Currency"><Input /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} md={12}><Form.Item name="pricePengajuan" label="Price Pengajuan"><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
            <Col xs={24} md={12}><Form.Item name="purchasePrice" label="Purchase Price"><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} md={12}><Form.Item name="rate" label="Rate"><Input /></Form.Item></Col>
            <Col xs={24} md={12}><Form.Item name="initialBudget" label="Budget (IDR)"><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} md={8}><Form.Item name="poDate" label="PO Date (YYYYMM)"><Input /></Form.Item></Col>
            <Col xs={24} md={8}><Form.Item name="shipDate" label="Ship Date (YYYYMM)"><Input /></Form.Item></Col>
            <Col xs={24} md={8}><Form.Item name="acceptanceMonth" label="Acceptance Month (YYYYMM)"><Input /></Form.Item></Col>
          </Row>
          <Form.Item name="paymentCondition" label="Payment Condition"><Input /></Form.Item>
          <Row gutter={16}>
            <Col xs={24} md={8}><Form.Item name="paymentDate1" label="Pay 1 (YYYYMM)"><Input /></Form.Item></Col>
            <Col xs={24} md={8}><Form.Item name="paymentRate1" label="Rate 1"><Input /></Form.Item></Col>
            <Col xs={24} md={8}><Form.Item name="paymentAmount1" label="Amount 1"><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} md={8}><Form.Item name="paymentDate2" label="Pay 2 (YYYYMM)"><Input /></Form.Item></Col>
            <Col xs={24} md={8}><Form.Item name="paymentRate2" label="Rate 2"><Input /></Form.Item></Col>
            <Col xs={24} md={8}><Form.Item name="paymentAmount2" label="Amount 2"><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} md={8}><Form.Item name="paymentDate3" label="Pay 3 (YYYYMM)"><Input /></Form.Item></Col>
            <Col xs={24} md={8}><Form.Item name="paymentRate3" label="Rate 3"><Input /></Form.Item></Col>
            <Col xs={24} md={8}><Form.Item name="paymentAmount3" label="Amount 3"><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} md={12}><Form.Item name="massProTiming" label="Mass Pro Timing (YYYYMM)"><Input /></Form.Item></Col>
            <Col xs={24} md={12}><Form.Item name="capitalizedMonth" label="Capitalized Month (YYYYMM)"><Input /></Form.Item></Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
}

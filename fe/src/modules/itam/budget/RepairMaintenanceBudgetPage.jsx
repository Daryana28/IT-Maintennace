import React, { useState, useEffect } from "react";
import { Table, Card, Row, Col, Typography, Space, Button, DatePicker, Modal, Form, Input, InputNumber, Select, Popconfirm } from "antd";
import { DownloadOutlined, PrinterOutlined, PlusOutlined, EditOutlined, DeleteOutlined, WalletOutlined, ArrowUpOutlined, ArrowDownOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import "./AssetBudgetPage.css"; 

const { Title, Text } = Typography;

export default function RepairMaintenanceBudgetPage() {
  const [selectedMonth, setSelectedMonth] = useState(dayjs());
  const [data, setData] = useState([]);
  
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [editingKey, setEditingKey] = useState(null);
  const [form] = Form.useForm();

  const formatCurrency = (value) => {
    if (value === null || value === undefined || value === "") return "-";
    return new Intl.NumberFormat("id-ID", {
      minimumFractionDigits: 0,
    }).format(value);
  };

  // Simulasi data berubah secara dinamis berdasarkan bulan yang dipilih
  const generateMockData = (month) => {
    const selectedYear = month.year();
    const selectedMonthIdx = month.month(); 
    
    let currentBalance = 177037987;
    for (let i = 0; i < selectedMonthIdx; i++) {
        const monthlySpend = 4000000 + (i * 500000); 
        currentBalance -= monthlySpend;
        if ((i + 1) % 3 === 0) {
            currentBalance += 15000000;
        }
    }

    const records = [
      {
        key: "opening",
        isOpening: true,
        no: "",
        date: "",
        voucherPo: "",
        description: "OPENING",
        transferIn: null,
        transferOut: null,
        addBudget: null,
        decrease: null,
        balance: currentBalance,
      }
    ];

    const numTransactions = (selectedMonthIdx % 4) + 2; 
    let runningBalance = currentBalance;
    const maintenanceTasks = [
      "Maintenance Server Rutin",
      "Perbaikan Jalur Jaringan Area Timur",
      "Penggantian Part AC Ruang Server",
      "Service Kendaraan Operasional",
      "Kalibrasi Alat Sensor",
      "Perbaikan UPS Baterai",
    ];

    for (let i = 1; i <= numTransactions; i++) {
      const day = String(i * 5 + (selectedMonthIdx % 3)).padStart(2, '0');
      const dateStr = `${selectedYear}-${String(selectedMonthIdx + 1).padStart(2, '0')}-${day}`;
      
      const isAddBudget = (i === 3 && selectedMonthIdx % 2 === 0);
      const isTransferIn = (i === 4 && selectedMonthIdx % 3 === 0);
      
      let transferIn = null;
      let transferOut = null;
      let addBudget = null;
      let decrease = null;
      let description = "";

      if (isAddBudget) {
        addBudget = 10000000 + (selectedMonthIdx * 1000000);
        runningBalance += addBudget;
        description = "Penambahan Alokasi Budget Operasional Kuartal";
      } else if (isTransferIn) {
        transferIn = 5000000 + (i * 500000);
        runningBalance += transferIn;
        description = "Transfer in Budget dari Proyek IT-01";
      } else {
        transferOut = 1500000 + (i * 750000) + (selectedMonthIdx * 100000);
        runningBalance -= transferOut;
        description = maintenanceTasks[(i + selectedMonthIdx) % maintenanceTasks.length];
      }

      records.push({
        key: String(i),
        no: String(i),
        date: dateStr,
        voucherPo: `PO/${selectedYear}/${String(selectedMonthIdx + 1).padStart(2, '0')}/${String(i * 3).padStart(3, '0')}`,
        description,
        transferIn,
        transferOut,
        addBudget,
        decrease,
        balance: runningBalance,
      });
    }

    return records;
  };

  useEffect(() => {
    setData(generateMockData(selectedMonth));
  }, [selectedMonth]);

  const recalculateBalances = (records) => {
    let currentBalance = records[0]?.balance || 0; 
    return records.map((record, index) => {
      if (index === 0) return record; 
      
      const inAmount = (record.transferIn || 0) + (record.addBudget || 0);
      const outAmount = (record.transferOut || 0) + (record.decrease || 0);
      
      currentBalance = currentBalance + inAmount - outAmount;
      return { ...record, balance: currentBalance };
    });
  };

  const handleOpenModal = (mode, record = null) => {
    setModalMode(mode);
    if (mode === "edit" && record) {
      setEditingKey(record.key);
      let type = "transferOut";
      let amount = record.transferOut;
      if (record.transferIn) { type = "transferIn"; amount = record.transferIn; }
      else if (record.addBudget) { type = "addBudget"; amount = record.addBudget; }
      else if (record.decrease) { type = "decrease"; amount = record.decrease; }

      form.setFieldsValue({
        date: dayjs(record.date),
        voucherPo: record.voucherPo,
        description: record.description,
        type,
        amount
      });
    } else {
      setEditingKey(null);
      form.resetFields();
      form.setFieldsValue({ date: dayjs(), type: "transferOut" });
    }
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleSubmit = (values) => {
    const { date, voucherPo, description, type, amount } = values;
    const newRecord = {
      date: date.format("YYYY-MM-DD"),
      voucherPo,
      description,
      transferIn: type === "transferIn" ? amount : null,
      transferOut: type === "transferOut" ? amount : null,
      addBudget: type === "addBudget" ? amount : null,
      decrease: type === "decrease" ? amount : null,
    };

    let newData = [...data];
    if (modalMode === "create") {
      newRecord.key = Date.now().toString();
      newRecord.no = String(newData.length);
      newData.push(newRecord);
    } else {
      newData = newData.map(item => item.key === editingKey ? { ...item, ...newRecord } : item);
    }
    
    // Sort by date keeping opening at top
    const opening = newData[0];
    const rest = newData.slice(1).sort((a, b) => new Date(a.date) - new Date(b.date));
    const sortedData = [opening, ...rest];

    // Re-index 'no'
    const finalData = sortedData.map((item, idx) => {
      if (idx === 0) return item;
      return { ...item, no: String(idx) };
    });

    setData(recalculateBalances(finalData));
    handleCloseModal();
  };

  const handleDelete = (key) => {
    let newData = data.filter(item => item.key !== key);
    // Re-index 'no'
    newData = newData.map((item, idx) => {
      if (idx === 0) return item;
      return { ...item, no: String(idx) };
    });
    setData(recalculateBalances(newData));
  };

  const columns = [
    {
      title: "No",
      dataIndex: "no",
      key: "no",
      width: 60,
      align: "center",
      render: (text, record, index) => {
        if (record.isOpening) return "";
        return text;
      }
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      width: 120,
    },
    {
      title: "Purchase voucher/PO",
      dataIndex: "voucherPo",
      key: "voucherPo",
      width: 200,
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      width: 300,
      render: (text, record) => {
        if (record.isOpening) return <Text strong>{text}</Text>;
        return text;
      }
    },
    {
      title: "Transfer in",
      dataIndex: "transferIn",
      key: "transferIn",
      align: "right",
      width: 150,
      render: (val) => val ? formatCurrency(val) : "-",
    },
    {
      title: "Transfer out",
      dataIndex: "transferOut",
      key: "transferOut",
      align: "right",
      width: 150,
      render: (val) => val ? formatCurrency(val) : "-",
    },
    {
      title: "Add. Budget",
      dataIndex: "addBudget",
      key: "addBudget",
      align: "right",
      width: 150,
      render: (val) => val ? formatCurrency(val) : "-",
    },
    {
      title: "Decrease",
      dataIndex: "decrease",
      key: "decrease",
      align: "right",
      width: 150,
      render: (val) => val ? formatCurrency(val) : "-",
    },
    {
      title: "Balance",
      dataIndex: "balance",
      key: "balance",
      align: "right",
      width: 180,
      fixed: "right",
      render: (val, record) => (
        <Text strong style={{ color: record.isOpening ? '#1694d1' : 'inherit' }}>
          {formatCurrency(val)}
        </Text>
      )
    },
    {
      title: "Aksi",
      key: "action",
      align: "center",
      fixed: "right",
      width: 100,
      render: (_, record) => {
        if (record.isOpening) return null;
        return (
          <Space size="small">
            <Button type="primary" ghost icon={<EditOutlined />} size="small" onClick={() => handleOpenModal("edit", record)} />
            <Popconfirm
              title="Hapus transaksi?"
              onConfirm={() => handleDelete(record.key)}
              okText="Ya"
              cancelText="Batal"
            >
              <Button type="primary" danger ghost icon={<DeleteOutlined />} size="small" />
            </Popconfirm>
          </Space>
        );
      }
    }
  ];

  const openingBalance = data[0]?.balance || 0;
  const currentBalance = data[data.length - 1]?.balance || 0;
  const totalPengeluaran = data.reduce((acc, curr) => acc + (curr.transferOut || 0) + (curr.decrease || 0), 0);

  return (
    <div className="budget-asset-page">
      <div className="page-header">
        <div>
          <Title level={3} style={{ margin: 0 }}>Budget Control</Title>
          <Text type="secondary">Repair & Maintenance Budget Tracking</Text>
        </div>
        <Space>
          <DatePicker 
            picker="month" 
            value={selectedMonth}
            onChange={(date) => setSelectedMonth(date || dayjs())}
            allowClear={false}
            format="MMMM YYYY"
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal("create")}>Tambah Transaksi</Button>
          <Button icon={<PrinterOutlined />}>Print</Button>
          <Button icon={<DownloadOutlined />}>Export</Button>
        </Space>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={8}>
          <Card bordered={false} style={{ background: '#94a3b8', borderRadius: '8px', color: '#1e293b' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Saldo Awal (Opening)</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '4px' }}>{formatCurrency(openingBalance)}</div>
                <div style={{ fontSize: '12px', opacity: 0.85 }}>Periode {selectedMonth.format("MMM YYYY")}</div>
              </div>
              <div style={{ fontSize: '40px', color: '#334155' }}>
                <WalletOutlined />
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card bordered={true} style={{ borderRadius: '8px', borderColor: '#e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: '#1e293b' }}>Total Pengeluaran</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '4px', color: '#e11d48' }}>{formatCurrency(totalPengeluaran)}</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>Transfer Out & Decrease</div>
              </div>
              <div style={{ fontSize: '40px', color: '#fda4af' }}>
                <ArrowDownOutlined />
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card bordered={true} style={{ borderRadius: '8px', borderColor: '#e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: '#1e293b' }}>Saldo Akhir (Current)</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '4px', color: '#059669' }}>{formatCurrency(currentBalance)}</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>Sisa budget saat ini</div>
              </div>
              <div style={{ fontSize: '40px', color: '#6ee7b7' }}>
                <ArrowUpOutlined />
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Card className="budget-card" bordered={false} bodyStyle={{ padding: 0 }}>
        <Table
          columns={columns}
          dataSource={data}
          scroll={{ x: 1400 }}
          pagination={false}
          bordered
          size="middle"
          rowClassName={(record) => record.isOpening ? 'table-row-light' : ''}
          className="budget-table"
        />
      </Card>

      <Modal
        title={modalMode === "create" ? "Tambah Transaksi" : "Edit Transaksi"}
        open={isModalVisible}
        onCancel={handleCloseModal}
        onOk={() => form.submit()}
        okText="Simpan"
        cancelText="Batal"
        destroyOnClose
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item name="date" label="Tanggal" rules={[{ required: true, message: 'Tanggal wajib diisi' }]}>
                <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="voucherPo" label="Voucher / PO" rules={[{ required: true, message: 'Voucher/PO wajib diisi' }]}>
                <Input placeholder="Nomor dokumen" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="description" label="Deskripsi" rules={[{ required: true, message: 'Deskripsi wajib diisi' }]}>
            <Input.TextArea rows={2} placeholder="Deskripsi transaksi" />
          </Form.Item>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item name="type" label="Jenis Transaksi" rules={[{ required: true, message: 'Pilih jenis transaksi' }]}>
                <Select>
                  <Select.Option value="transferOut">Transfer Out</Select.Option>
                  <Select.Option value="transferIn">Transfer In</Select.Option>
                  <Select.Option value="addBudget">Add Budget</Select.Option>
                  <Select.Option value="decrease">Decrease</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="amount" label="Nominal" rules={[{ required: true, message: 'Nominal wajib diisi' }]}>
                <InputNumber
                  style={{ width: "100%" }}
                  placeholder="Masukkan nominal"
                  formatter={(value) => `Rp ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
                  parser={(value) => value.replace(/\Rp\s?|(\.*)/g, "")}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
}

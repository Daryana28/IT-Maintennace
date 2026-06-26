import React, { useState } from "react";
import { Table, Card, Row, Col, Typography, Space, Button, Modal, Form, Input, InputNumber, Popconfirm } from "antd";
import { DownloadOutlined, PrinterOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import "./OperationalBudgetPage.css";

const { Title, Text } = Typography;

export default function OperationalBudgetPage() {
  const [data, setData] = useState([
    {
      key: "1",
      budgetCode: "OP-2026-001",
      costCode: "CC-01",
      acctBudget: "AB-100",
      largeAccount: "LA-01",
      costCode1: "CC1-A",
      deptSect: "IT Dept",
      accNo: "5001",
      accDesc: "Software License",
      itemName: "Microsoft 365",
      reason: "Yearly Subscription",
      initialBudgetPlan: 120000000,
      initialBudgetActual: 110000000,
      janPlan: 10000000, janActual: 9000000,
      febPlan: 10000000, febActual: 10000000,
      marPlan: 10000000, marActual: 8000000,
      aprPlan: 10000000, aprActual: 11000000,
      mayPlan: 10000000, mayActual: 10000000,
      junPlan: 10000000, junActual: 10000000,
      julPlan: 10000000, julActual: 9000000,
      augPlan: 10000000, augActual: 10000000,
      sepPlan: 10000000, sepActual: 10000000,
      octPlan: 10000000, octActual: 12000000,
      novPlan: 10000000, novActual: 10000000,
      decPlan: 10000000, decActual: 10000000,
    },
    {
      key: "2",
      budgetCode: "OP-2026-002",
      costCode: "CC-02",
      acctBudget: "AB-101",
      largeAccount: "LA-02",
      costCode1: "CC1-B",
      deptSect: "IT Infrastructure",
      accNo: "5002",
      accDesc: "Cloud Services",
      itemName: "AWS Hosting",
      reason: "Monthly Server Hosting",
      initialBudgetPlan: 60000000,
      initialBudgetActual: 55500000,
      janPlan: 5000000, janActual: 4500000,
      febPlan: 5000000, febActual: 4800000,
      marPlan: 5000000, marActual: 5000000,
      aprPlan: 5000000, aprActual: 5200000,
      mayPlan: 5000000, mayActual: 5000000,
      junPlan: 5000000, junActual: 5100000,
      julPlan: 5000000, julActual: 4900000,
      augPlan: 5000000, augActual: 5000000,
      sepPlan: 5000000, sepActual: 4800000,
      octPlan: 5000000, octActual: 5500000,
      novPlan: 5000000, novActual: 5200000,
      decPlan: 5000000, decActual: 500000,
    },
    {
      key: "3",
      budgetCode: "OP-2026-003",
      costCode: "CC-01",
      acctBudget: "AB-102",
      largeAccount: "LA-01",
      costCode1: "CC1-C",
      deptSect: "IT Support",
      accNo: "5003",
      accDesc: "Telecommunication",
      itemName: "Internet ISP",
      reason: "Fiber Optic 1Gbps Dedicated",
      initialBudgetPlan: 36000000,
      initialBudgetActual: 33000000,
      janPlan: 3000000, janActual: 3000000,
      febPlan: 3000000, febActual: 3000000,
      marPlan: 3000000, marActual: 3000000,
      aprPlan: 3000000, aprActual: 3000000,
      mayPlan: 3000000, mayActual: 3000000,
      junPlan: 3000000, junActual: 3000000,
      julPlan: 3000000, julActual: 3000000,
      augPlan: 3000000, augActual: 3000000,
      sepPlan: 3000000, sepActual: 3000000,
      octPlan: 3000000, octActual: 3000000,
      novPlan: 3000000, novActual: 3000000,
      decPlan: 3000000, decActual: 0,
    }
  ]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [editingKey, setEditingKey] = useState(null);
  const [form] = Form.useForm();

  const formatCurrency = (value) => {
    if (!value) return "-";
    return new Intl.NumberFormat("id-ID", {
      minimumFractionDigits: 0,
    }).format(value);
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
    const newRecord = { ...values };

    if (modalMode === "create") {
      newRecord.key = Date.now().toString();
      setData([newRecord, ...data]);
    } else {
      setData(data.map(item => item.key === editingKey ? { ...item, ...newRecord } : item));
    }
    handleCloseModal();
  };

  const handleDelete = (key) => {
    setData(data.filter(item => item.key !== key));
  };

  const tableData = [];
  data.forEach((item) => {
    tableData.push({
      ...item,
      isPlanRow: true,
      rowSpan: 2,
      tableKey: `${item.key}-plan`
    });
    tableData.push({
      ...item,
      isPlanRow: false,
      rowSpan: 0,
      tableKey: `${item.key}-actual`
    });
  });

  const mergedCellRender = (text, record) => ({
    children: text,
    props: { rowSpan: record.rowSpan }
  });

  const createMonthCol = (m) => ({
    title: m,
    key: m.toLowerCase(),
    width: 120,
    align: "right",
    render: (_, record) => {
      const val = record.isPlanRow ? record[`${m.toLowerCase()}Plan`] : record[`${m.toLowerCase()}Actual`];
      return record.isPlanRow ? <Text className="budget-val-plan">{formatCurrency(val)}</Text> : <Text className="budget-val-actual">{formatCurrency(val)}</Text>;
    }
  });

  const quarterColumns = [
    {
      title: "Q1",
      children: [
        ...["Jan", "Feb", "Mar"].map(createMonthCol),
        {
          title: "計1",
          key: "q1_total",
          width: 120,
          align: "right",
          render: (_, record) => {
            const total = record.isPlanRow
              ? (record.janPlan || 0) + (record.febPlan || 0) + (record.marPlan || 0)
              : (record.janActual || 0) + (record.febActual || 0) + (record.marActual || 0);
            return record.isPlanRow ? <Text className="budget-val-plan" strong>{formatCurrency(total)}</Text> : <Text className="budget-val-actual" strong>{formatCurrency(total)}</Text>;
          }
        }
      ]
    },
    {
      title: "Q2",
      children: [
        ...["Apr", "May", "Jun"].map(createMonthCol),
        {
          title: "計1",
          key: "q2_total",
          width: 120,
          align: "right",
          render: (_, record) => {
            const total = record.isPlanRow
              ? (record.aprPlan || 0) + (record.mayPlan || 0) + (record.junPlan || 0)
              : (record.aprActual || 0) + (record.mayActual || 0) + (record.junActual || 0);
            return record.isPlanRow ? <Text className="budget-val-plan" strong>{formatCurrency(total)}</Text> : <Text className="budget-val-actual" strong>{formatCurrency(total)}</Text>;
          }
        }
      ]
    },
    {
      title: "Q3",
      children: [
        ...["Jul", "Aug", "Sep"].map(createMonthCol),
        {
          title: "計1",
          key: "q3_total",
          width: 120,
          align: "right",
          render: (_, record) => {
            const total = record.isPlanRow
              ? (record.julPlan || 0) + (record.augPlan || 0) + (record.sepPlan || 0)
              : (record.julActual || 0) + (record.augActual || 0) + (record.sepActual || 0);
            return record.isPlanRow ? <Text className="budget-val-plan" strong>{formatCurrency(total)}</Text> : <Text className="budget-val-actual" strong>{formatCurrency(total)}</Text>;
          }
        }
      ]
    },
    {
      title: "Q4",
      children: [
        ...["Oct", "Nov", "Dec"].map(createMonthCol),
        {
          title: "計1",
          key: "q4_total",
          width: 120,
          align: "right",
          render: (_, record) => {
            const total = record.isPlanRow
              ? (record.octPlan || 0) + (record.novPlan || 0) + (record.decPlan || 0)
              : (record.octActual || 0) + (record.novActual || 0) + (record.decActual || 0);
            return record.isPlanRow ? <Text className="budget-val-plan" strong>{formatCurrency(total)}</Text> : <Text className="budget-val-actual" strong>{formatCurrency(total)}</Text>;
          }
        }
      ]
    }
  ];

  const columns = [
    { title: "Budget Code", dataIndex: "budgetCode", key: "budgetCode", width: 140, fixed: "left", render: mergedCellRender },
    { title: "Cost Code", dataIndex: "costCode", key: "costCode", width: 100, render: mergedCellRender },
    { title: "Acct Budget", dataIndex: "acctBudget", key: "acctBudget", width: 100, render: mergedCellRender },
    { title: "Large Account", dataIndex: "largeAccount", key: "largeAccount", width: 120, render: mergedCellRender },
    { title: "Cost Code 1", dataIndex: "costCode1", key: "costCode1", width: 100, render: mergedCellRender },
    { title: "Dept/Sect", dataIndex: "deptSect", key: "deptSect", width: 120, render: mergedCellRender },
    { title: "Acc No", dataIndex: "accNo", key: "accNo", width: 80, render: mergedCellRender },
    { title: "Acc Desc", dataIndex: "accDesc", key: "accDesc", width: 150, render: mergedCellRender },
    { title: "Item Name", dataIndex: "itemName", key: "itemName", width: 150, render: mergedCellRender },
    { title: "Reason for Application", dataIndex: "reason", key: "reason", width: 200, render: mergedCellRender },
    {
      title: "Type",
      key: "type",
      width: 80,
      align: "center",
      render: (_, record) => record.isPlanRow ? <span className="type-tag-plan">Plan</span> : <span className="type-tag-actual">Actual</span>
    },
    {
      title: "Initial Budget",
      key: "initialBudget",
      width: 140,
      align: "right",
      render: (_, record) => {
        const val = record.isPlanRow ? record.initialBudgetPlan : record.initialBudgetActual;
        return record.isPlanRow ? <Text className="budget-val-plan" strong>{formatCurrency(val)}</Text> : <Text className="budget-val-actual" strong>{formatCurrency(val)}</Text>;
      }
    },
    ...quarterColumns,
    {
      title: "Action",
      key: "action",
      align: "center",
      fixed: "right",
      width: 100,
      render: (_, record) => ({
        children: (
          <Space size="small">
            <Button type="primary" ghost icon={<EditOutlined />} size="small" onClick={() => handleOpenModal("edit", record)} />
            <Popconfirm title="Hapus?" onConfirm={() => handleDelete(record.key)} okText="Ya" cancelText="Batal">
              <Button type="primary" danger ghost icon={<DeleteOutlined />} size="small" />
            </Popconfirm>
          </Space>
        ),
        props: { rowSpan: record.rowSpan }
      })
    }
  ];

  return (
    <div className="op-budget-page">
      <div className="op-budget-header">
        <div>
          <Title className="op-budget-title">Operational Budget</Title>
          <Text className="op-budget-subtitle">Alokasi dan perencanaan pengeluaran operasional tahunan</Text>
        </div>
        <Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal("create")}>Tambah Budget</Button>
          <Button icon={<PrinterOutlined />}>Print</Button>
          <Button icon={<DownloadOutlined />}>Export</Button>
        </Space>
      </div>

      <Card className="op-budget-card" bordered={false} bodyStyle={{ padding: 0 }}>
        <Table
          columns={columns}
          dataSource={tableData}
          rowKey="tableKey"
          rowClassName={(record) => record.isPlanRow ? 'plan-row' : 'actual-row'}
          className="op-budget-table"
          scroll={{ x: 2600, y: 600 }}
          pagination={false}
          bordered
          size="middle"
          className="budget-table"
        />
      </Card>

      <Modal
        title={modalMode === "create" ? "Tambah Budget Operasional" : "Edit Budget Operasional"}
        open={isModalVisible}
        onCancel={handleCloseModal}
        onOk={() => form.submit()}
        okText="Simpan"
        cancelText="Batal"
        destroyOnClose
        width={900}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col span={8}><Form.Item name="budgetCode" label="Budget Code"><Input /></Form.Item></Col>
            <Col span={8}><Form.Item name="costCode" label="Cost Code"><Input /></Form.Item></Col>
            <Col span={8}><Form.Item name="acctBudget" label="Acct Budget"><Input /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}><Form.Item name="largeAccount" label="Large Account"><Input /></Form.Item></Col>
            <Col span={8}><Form.Item name="costCode1" label="Cost Code 1"><Input /></Form.Item></Col>
            <Col span={8}><Form.Item name="deptSect" label="Dept/Sect"><Input /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}><Form.Item name="accNo" label="Acc No"><Input /></Form.Item></Col>
            <Col span={8}><Form.Item name="accDesc" label="Acc Desc"><Input /></Form.Item></Col>
            <Col span={8}><Form.Item name="itemName" label="Item Name"><Input /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col span={16}><Form.Item name="reason" label="Reason for Application"><Input /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="initialBudgetPlan" label="Initial Budget (Plan)"><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={12}><Form.Item name="initialBudgetActual" label="Initial Budget (Actual)"><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
          </Row>
          <Typography.Text strong style={{ display: 'block', marginBottom: '16px' }}>Alokasi Bulanan</Typography.Text>
          <Row gutter={16}>
            {["jan", "feb", "mar", "apr", "may", "jun"].map(m => (
              <Col span={4} key={m}><Form.Item name={m} label={m.toUpperCase()}><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
            ))}
          </Row>
          <Row gutter={16}>
            {["jul", "aug", "sep", "oct", "nov", "dec"].map(m => (
              <Col span={4} key={m}><Form.Item name={m} label={m.toUpperCase()}><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
            ))}
          </Row>
        </Form>
      </Modal>
    </div>
  );
}

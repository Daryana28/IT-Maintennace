import React, { useEffect, useMemo, useState } from "react";
import { Table, Card, Row, Col, Typography, Space, Button, Modal, Form, Input, InputNumber, Popconfirm, Upload, message } from "antd";
import { DownloadOutlined, PrinterOutlined, PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined } from "@ant-design/icons";
import * as XLSX from "xlsx";
import "./OperationalBudgetPage.css";

const { Title, Text } = Typography;

const STORAGE_KEY = "itam.operationalBudget.items.v2";
const MONTHS = [
  { key: "jan", label: "JAN", quarter: "Q1" },
  { key: "feb", label: "FEB", quarter: "Q1" },
  { key: "mar", label: "MAR", quarter: "Q1" },
  { key: "apr", label: "APR", quarter: "Q2" },
  { key: "may", label: "MAY", quarter: "Q2" },
  { key: "jun", label: "JUN", quarter: "Q2" },
  { key: "jul", label: "JUL", quarter: "Q3" },
  { key: "aug", label: "AUG", quarter: "Q3" },
  { key: "sep", label: "SEP", quarter: "Q3" },
  { key: "oct", label: "OCT", quarter: "Q4" },
  { key: "nov", label: "NOV", quarter: "Q4" },
  { key: "dec", label: "DEC", quarter: "Q4" }
];
const QUARTERS = [
  { key: "Q1", label: "1st quarter", months: ["jan", "feb", "mar"], totalLabel: "SUB1" },
  { key: "Q2", label: "2nd quarter", months: ["apr", "may", "jun"], totalLabel: "SUB2" },
  { key: "Q3", label: "3rd quarter", months: ["jul", "aug", "sep"], totalLabel: "SUB3" },
  { key: "Q4", label: "4th quarter", months: ["oct", "nov", "dec"], totalLabel: "SUB4" }
];

const toNumber = (value) => Number(value || 0);

function buildMonthValues(amounts) {
  return MONTHS.reduce((acc, month) => {
    acc[`${month.key}Plan`] = toNumber(amounts?.[`${month.key}Plan`]);
    acc[`${month.key}Actual`] = toNumber(amounts?.[`${month.key}Actual`]);
    return acc;
  }, {});
}

function createDefaultItems() {
  return [
    {
      key: "1",
      budgetCode: "744003 - Internet Charge",
      costCode: "CC-01",
      acctBudget: "AB-100",
      largeAccount: "LA-01",
      costCode1: "CC1-A",
      deptSect: "IT Dept",
      accNo: "5001",
      accDesc: "Telecommunication",
      itemName: "INTERNET CORPORATE & VSAT",
      reason: "Biaya internet tahunan",
      initialBudgetPlan: 231600000,
      initialBudgetActual: 115800000,
      ...buildMonthValues({
        julPlan: 19300000,
        augPlan: 19300000,
        sepPlan: 19300000,
        octPlan: 19300000,
        novPlan: 19300000,
        decPlan: 19300000
      })
    },
    {
      key: "2",
      budgetCode: "744003 - Internet Charge",
      costCode: "CC-01",
      acctBudget: "AB-100",
      largeAccount: "LA-01",
      costCode1: "CC1-B",
      deptSect: "IT Dept",
      accNo: "5002",
      accDesc: "Telecommunication",
      itemName: "EMAIL CORPORATE",
      reason: "Biaya email corporate",
      initialBudgetPlan: 179833500,
      initialBudgetActual: 85635000,
      ...buildMonthValues({
        julPlan: 14986125,
        augPlan: 14986125,
        sepPlan: 14986125,
        octPlan: 14986125,
        novPlan: 14986125,
        decPlan: 14986125
      })
    },
    {
      key: "3",
      budgetCode: "749003 - R&M IT Hardware",
      costCode: "CC-02",
      acctBudget: "AB-101",
      largeAccount: "LA-02",
      costCode1: "CC1-C",
      deptSect: "SISA",
      accNo: "5003",
      accDesc: "Maintenance",
      itemName: "MAINTENANCE SERVER DEVICE (ICT)",
      reason: "Preventive maintenance server",
      initialBudgetPlan: 135000000,
      initialBudgetActual: 56250000,
      ...buildMonthValues({
        julPlan: 11250000,
        augPlan: 11250000,
        sepPlan: 11250000,
        octPlan: 11250000,
        novPlan: 11250000,
        decPlan: 11250000
      })
    }
  ];
}

function loadStoredItems() {
  if (typeof window === "undefined") return createDefaultItems();

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultItems();

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return createDefaultItems();

    return parsed.map((item, index) => ({
      key: item.key || String(index + 1),
      budgetCode: item.budgetCode || "",
      costCode: item.costCode || "",
      acctBudget: item.acctBudget || "",
      largeAccount: item.largeAccount || "",
      costCode1: item.costCode1 || "",
      deptSect: item.deptSect || "",
      accNo: item.accNo || "",
      accDesc: item.accDesc || "",
      itemName: item.itemName || "",
      reason: item.reason || "",
      initialBudgetPlan: toNumber(item.initialBudgetPlan),
      initialBudgetActual: toNumber(item.initialBudgetActual),
      ...buildMonthValues(item)
    }));
  } catch {
    return createDefaultItems();
  }
}

function getRowAnnualTotal(item, type) {
  return MONTHS.reduce((sum, month) => sum + toNumber(item[`${month.key}${type}`]), 0);
}

function getQuarterTotal(item, quarter, type) {
  return quarter.months.reduce((sum, month) => sum + toNumber(item[`${month}${type}`]), 0);
}

function buildTableRows(items) {
  const grouped = new Map();

  items.forEach((item) => {
    const groupKey = item.budgetCode || "-";
    const existing = grouped.get(groupKey) || [];
    existing.push(item);
    grouped.set(groupKey, existing);
  });

  const rows = [];

  grouped.forEach((groupItems, budgetCode) => {
    const itemRowCount = groupItems.length * 2;
    const totalRows = 2;
    const budgetRowSpan = itemRowCount + totalRows;

    groupItems.forEach((item, itemIndex) => {
      const budgetRowSpanForFirstItem = itemIndex === 0 ? budgetRowSpan : 0;

      rows.push({
        ...item,
        tableKey: `${item.key}-plan`,
        rowType: "plan",
        rowLabel: "PLAN 2026",
        budgetRowSpan: budgetRowSpanForFirstItem,
        itemRowSpan: 2
      });

      rows.push({
        ...item,
        tableKey: `${item.key}-actual`,
        rowType: "actual",
        rowLabel: "ACTUAL 2026",
        budgetRowSpan: 0,
        itemRowSpan: 0
      });
    });

    const totals = groupItems.reduce((acc, item) => {
      const next = { ...acc };
      MONTHS.forEach((month) => {
        next[`${month.key}Plan`] += toNumber(item[`${month.key}Plan`]);
        next[`${month.key}Actual`] += toNumber(item[`${month.key}Actual`]);
      });
      next.initialBudgetPlan += toNumber(item.initialBudgetPlan);
      next.initialBudgetActual += toNumber(item.initialBudgetActual);
      return next;
    }, MONTHS.reduce((acc, month) => {
      acc[`${month.key}Plan`] = 0;
      acc[`${month.key}Actual`] = 0;
      return acc;
    }, { initialBudgetPlan: 0, initialBudgetActual: 0 }));

    rows.push({
      key: `summary-plan-${budgetCode}`,
      tableKey: `summary-plan-${budgetCode}`,
      budgetCode,
      itemName: "",
      rowType: "summary-plan",
      rowLabel: "TOTAL PLAN 2026",
      budgetRowSpan: 0,
      itemRowSpan: 1,
      isSummary: true,
      ...totals
    });

    rows.push({
      key: `summary-actual-${budgetCode}`,
      tableKey: `summary-actual-${budgetCode}`,
      budgetCode,
      itemName: "",
      rowType: "summary-actual",
      rowLabel: "TOTAL ACTUAL 2026",
      budgetRowSpan: 0,
      itemRowSpan: 1,
      isSummary: true,
      ...totals
    });
  });

  return rows;
}

function buildExportRows(items) {
  return items.map((item) => ({
    budgetCode: item.budgetCode || "",
    costCode: item.costCode || "",
    acctBudget: item.acctBudget || "",
    largeAccount: item.largeAccount || "",
    costCode1: item.costCode1 || "",
    deptSect: item.deptSect || "",
    accNo: item.accNo || "",
    accDesc: item.accDesc || "",
    itemName: item.itemName || "",
    reason: item.reason || "",
    initialBudgetPlan: toNumber(item.initialBudgetPlan),
    initialBudgetActual: toNumber(item.initialBudgetActual),
    ...MONTHS.reduce((acc, month) => {
      acc[`${month.key}Plan`] = toNumber(item[`${month.key}Plan`]);
      acc[`${month.key}Actual`] = toNumber(item[`${month.key}Actual`]);
      return acc;
    }, {})
  }));
}

function buildOperationalSheetRows(items, includeSample = false) {
  const headerTop = [
    "BUDGET CODE",
    "ITEM NAME",
    "INITIAL BUDGET",
    "1ST QUARTER",
    "",
    "",
    "",
    "2ND QUARTER",
    "",
    "",
    "",
    "3RD QUARTER",
    "",
    "",
    "",
    "4TH QUARTER",
    "",
    "",
    "",
    "TOTAL"
  ];

  const headerBottom = [
    "",
    "",
    "",
    "JAN",
    "FEB",
    "MAR",
    "SUB1",
    "APR",
    "MAY",
    "JUN",
    "SUB2",
    "JUL",
    "AUG",
    "SEP",
    "SUB3",
    "OCT",
    "NOV",
    "DEC",
    "SUB4",
    "TOTAL"
  ];

  const sourceItems = includeSample
    ? [
        {
          budgetCode: "744003 - Internet Charge",
          itemName: "INTERNET CORPORATE & VSAT",
          rowLabel: "PLAN 2026",
          initialBudgetPlan: 0,
          ...MONTHS.reduce((acc, month) => {
            acc[`${month.key}Plan`] = 0;
            return acc;
          }, {})
        },
        {
          budgetCode: "744003 - Internet Charge",
          itemName: "INTERNET CORPORATE & VSAT",
          rowLabel: "ACTUAL 2026",
          initialBudgetActual: 0,
          ...MONTHS.reduce((acc, month) => {
            acc[`${month.key}Actual`] = 0;
            return acc;
          }, {})
        }
      ]
    : items.flatMap((item) => [
        {
          ...item,
          rowLabel: "PLAN 2026"
        },
        {
          ...item,
          rowLabel: "ACTUAL 2026"
        }
      ]);

  const dataRows = sourceItems.map((item) => {
    const isActualRow = item.rowLabel === "ACTUAL 2026";
    const suffix = isActualRow ? "Actual" : "Plan";
    const quarterTotals = QUARTERS.map((quarter) =>
      quarter.months.reduce((sum, monthKey) => sum + toNumber(item[`${monthKey}${suffix}`]), 0)
    );
    const annualTotal = MONTHS.reduce((sum, month) => sum + toNumber(item[`${month.key}${suffix}`]), 0);

    return [
      item.budgetCode || "",
      item.itemName || "",
      item.rowLabel,
      ...QUARTERS.flatMap((quarter, quarterIndex) => [
        ...quarter.months.map((monthKey) => toNumber(item[`${monthKey}${suffix}`])),
        quarterTotals[quarterIndex]
      ]),
      annualTotal
    ];
  });

  return [headerTop, headerBottom, ...dataRows];
}

function buildOperationalWorksheet(items, includeSample = false) {
  const sheetRows = buildOperationalSheetRows(items, includeSample);
  const worksheet = XLSX.utils.aoa_to_sheet(sheetRows);

  worksheet["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 1, c: 0 } },
    { s: { r: 0, c: 1 }, e: { r: 1, c: 1 } },
    { s: { r: 0, c: 2 }, e: { r: 1, c: 2 } },
    { s: { r: 0, c: 3 }, e: { r: 0, c: 6 } },
    { s: { r: 0, c: 7 }, e: { r: 0, c: 10 } },
    { s: { r: 0, c: 11 }, e: { r: 0, c: 14 } },
    { s: { r: 0, c: 15 }, e: { r: 0, c: 18 } },
    { s: { r: 0, c: 19 }, e: { r: 1, c: 19 } }
  ];

  worksheet["!cols"] = [
    { wch: 24 },
    { wch: 34 },
    { wch: 18 },
    ...Array.from({ length: 16 }, () => ({ wch: 12 })),
    { wch: 14 }
  ];

  return worksheet;
}

export default function OperationalBudgetPage() {
  const [data, setData] = useState(() => loadStoredItems());
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [editingKey, setEditingKey] = useState(null);
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  }, [data]);

  const formatCurrency = (value) => {
    if (!value) return "0";
    return new Intl.NumberFormat("id-ID", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const handleOpenModal = (mode, record = null) => {
    setModalMode(mode);

    if (mode === "edit" && record) {
      setEditingKey(record.key);
      form.setFieldsValue({
        ...record,
        ...MONTHS.reduce((acc, month) => {
          acc[`${month.key}Plan`] = toNumber(record[`${month.key}Plan`]);
          acc[`${month.key}Actual`] = toNumber(record[`${month.key}Actual`]);
          return acc;
        }, {})
      });
    } else {
      setEditingKey(null);
      form.resetFields();
      form.setFieldsValue(MONTHS.reduce((acc, month) => {
        acc[`${month.key}Plan`] = 0;
        acc[`${month.key}Actual`] = 0;
        return acc;
      }, { initialBudgetPlan: 0, initialBudgetActual: 0 }));
    }

    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleSubmit = (values) => {
    const normalized = {
      ...values,
      key: modalMode === "create" ? Date.now().toString() : editingKey,
      initialBudgetPlan: toNumber(values.initialBudgetPlan),
      initialBudgetActual: toNumber(values.initialBudgetActual),
      ...MONTHS.reduce((acc, month) => {
        acc[`${month.key}Plan`] = toNumber(values[`${month.key}Plan`]);
        acc[`${month.key}Actual`] = toNumber(values[`${month.key}Actual`]);
        return acc;
      }, {})
    };

    if (modalMode === "create") {
      setData((current) => [normalized, ...current]);
      messageApi.success("Budget operasional berhasil ditambahkan.");
    } else {
      setData((current) => current.map((item) => (item.key === editingKey ? normalized : item)));
      messageApi.success("Budget operasional berhasil diperbarui.");
    }

    handleCloseModal();
  };

  const handleDelete = (key) => {
    setData((current) => current.filter((item) => item.key !== key));
    messageApi.success("Budget operasional berhasil dihapus.");
  };

  const handleDeleteAll = () => {
    setData([]);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
    }
    messageApi.success("Semua budget operasional berhasil dihapus.");
  };

  const downloadTemplate = () => {
    const worksheet = buildOperationalWorksheet([], true);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Operational Budget");
    XLSX.writeFile(workbook, "Template_Operational_Budget.xlsx");
  };

  const handleImport = (file) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const workbook = XLSX.read(new Uint8Array(event.target.result), { type: "array" });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const sheetRows = XLSX.utils.sheet_to_json(firstSheet, { header: 1, defval: "" });
        const dataRows = sheetRows.slice(2).filter((row) => row.some((cell) => String(cell || "").trim() !== ""));

        if (!dataRows.length) {
          messageApi.warning("File import kosong.");
          return;
        }

        const parsedMap = new Map();

        dataRows.forEach((row, index) => {
          const budgetCode = String(row[0] || "").trim();
          const itemName = String(row[1] || "").trim();
          const rowLabel = String(row[2] || "").trim().toUpperCase();

          if (!budgetCode && !itemName) return;
          if (rowLabel !== "PLAN 2026" && rowLabel !== "ACTUAL 2026") return;

          const itemKey = `${budgetCode}__${itemName || index}`;
          const current =
            parsedMap.get(itemKey) ||
            {
              key: `${Date.now()}-${index}`,
              budgetCode,
              costCode: "",
              acctBudget: "",
              largeAccount: "",
              costCode1: "",
              deptSect: "",
              accNo: "",
              accDesc: "",
              itemName,
              reason: "",
              initialBudgetPlan: 0,
              initialBudgetActual: 0,
              ...MONTHS.reduce((acc, month) => {
                acc[`${month.key}Plan`] = 0;
                acc[`${month.key}Actual`] = 0;
                return acc;
              }, {})
            };

          const monthValues = [
            { month: "jan", col: 3 },
            { month: "feb", col: 4 },
            { month: "mar", col: 5 },
            { month: "apr", col: 7 },
            { month: "may", col: 8 },
            { month: "jun", col: 9 },
            { month: "jul", col: 11 },
            { month: "aug", col: 12 },
            { month: "sep", col: 13 },
            { month: "oct", col: 15 },
            { month: "nov", col: 16 },
            { month: "dec", col: 17 }
          ];

          if (rowLabel === "PLAN 2026") {
            current.initialBudgetPlan = monthValues.reduce((sum, entry) => sum + toNumber(row[entry.col]), 0);
            monthValues.forEach((entry) => {
              current[`${entry.month}Plan`] = toNumber(row[entry.col]);
            });
          }

          if (rowLabel === "ACTUAL 2026") {
            current.initialBudgetActual = monthValues.reduce((sum, entry) => sum + toNumber(row[entry.col]), 0);
            monthValues.forEach((entry) => {
              current[`${entry.month}Actual`] = toNumber(row[entry.col]);
            });
          }

          parsedMap.set(itemKey, current);
        });

        const importedItems = Array.from(parsedMap.values()).filter((item) => item.budgetCode || item.itemName);

        setData(importedItems);
        messageApi.success(`Berhasil import ${importedItems.length} budget operasional.`);
      } catch (error) {
        messageApi.error(`Gagal import file: ${error.message}`);
      }
    };

    reader.readAsArrayBuffer(file);
    return false;
  };

  const handleExport = () => {
    const worksheet = buildOperationalWorksheet(buildExportRows(data), false);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Operational Budget");
    XLSX.writeFile(workbook, "Operational_Budget.xlsx");
  };

  const tableData = useMemo(() => buildTableRows(data), [data]);

  const renderBudgetCodeCell = (_, record) => ({
    children: record.budgetRowSpan > 0 ? <div className="budget-code-cell">{record.budgetCode || "-"}</div> : null,
    props: { rowSpan: record.budgetRowSpan }
  });

  const renderItemNameCell = (_, record) => ({
    children: record.itemRowSpan > 0 ? (
      <div className="item-name-cell">
        <div className="item-name-main">{record.itemName || "-"}</div>
        {record.accDesc ? <div className="item-name-meta">{record.accDesc}</div> : null}
      </div>
    ) : null,
    props: { rowSpan: record.itemRowSpan }
  });

  const renderInitialBudgetLabel = (_, record) => (
    <span className={`row-label row-label--${record.rowType}`}>{record.rowLabel}</span>
  );

  const renderMonthValue = (monthKey, record) => {
    const suffix = record.rowType.includes("actual") ? "Actual" : "Plan";

    return (
      <Text className={`budget-val budget-val--${record.rowType}`}>
        {formatCurrency(record[`${monthKey}${suffix}`])}
      </Text>
    );
  };

  const createMonthCol = (monthKey, label) => ({
    title: label,
    key: monthKey,
    width: 120,
    align: "right",
    render: (_, record) => renderMonthValue(monthKey, record)
  });

  const quarterColumns = QUARTERS.map((quarter) => ({
    title: quarter.label,
    children: [
      ...quarter.months.map((monthKey) => {
        const month = MONTHS.find((item) => item.key === monthKey);
        return createMonthCol(monthKey, month?.label || monthKey.toUpperCase());
      }),
      {
        title: quarter.totalLabel,
        key: `${quarter.key}-total`,
        width: 120,
        align: "right",
        render: (_, record) => {
          const suffix = record.rowType.includes("actual") ? "Actual" : "Plan";
          return (
            <Text className={`budget-val budget-val--${record.rowType}`} strong>
              {formatCurrency(getQuarterTotal(record, quarter, suffix))}
            </Text>
          );
        }
      }
    ]
  }));

  const columns = [
    {
      title: "Budget code",
      dataIndex: "budgetCode",
      key: "budgetCode",
      width: 220,
      fixed: "left",
      render: renderBudgetCodeCell
    },
    {
      title: "Item Name",
      dataIndex: "itemName",
      key: "itemName",
      width: 320,
      fixed: "left",
      render: renderItemNameCell
    },
    {
      title: "Initial Budget",
      dataIndex: "rowLabel",
      key: "rowLabel",
      width: 170,
      fixed: "left",
      render: renderInitialBudgetLabel
    },
    ...quarterColumns,
    {
      title: "TOTAL",
      key: "annualTotal",
      width: 140,
      align: "right",
      fixed: "right",
      render: (_, record) => {
        const suffix = record.rowType.includes("actual") ? "Actual" : "Plan";
        return (
          <Text className={`budget-val budget-val--${record.rowType}`} strong>
            {formatCurrency(record.isSummary ? record[`initialBudget${suffix}`] : getRowAnnualTotal(record, suffix))}
          </Text>
        );
      }
    },
    {
      title: "Action",
      key: "action",
      align: "center",
      fixed: "right",
      width: 110,
      render: (_, record) => ({
        children: record.isSummary ? null : (
          <Space size="small">
            <Button type="primary" ghost icon={<EditOutlined />} size="small" onClick={() => handleOpenModal("edit", record)} />
            <Popconfirm title="Hapus data budget ini?" onConfirm={() => handleDelete(record.key)} okText="Ya" cancelText="Batal">
              <Button type="primary" danger ghost icon={<DeleteOutlined />} size="small" />
            </Popconfirm>
          </Space>
        ),
        props: { rowSpan: record.itemRowSpan }
      })
    }
  ];

  return (
    <div className="op-budget-page">
      {contextHolder}
      <div className="op-budget-header">
        <div>
          <Title className="op-budget-title">Operational Budget</Title>
          {/* <Text className="op-budget-subtitle">Form input sudah disesuaikan ke pola Excel: plan, actual, subtotal quarter, dan total tahunan.</Text> */}
        </div>
        <Space>
          <Button icon={<DownloadOutlined />} onClick={downloadTemplate}>Download Template</Button>
          <Upload beforeUpload={handleImport} showUploadList={false}>
            <Button icon={<UploadOutlined />}>Import</Button>
          </Upload>
          <Popconfirm
            title="Hapus semua budget operasional?"
            description="Semua data operational budget akan dihapus. Lanjutkan?"
            okText="Hapus Semua"
            cancelText="Batal"
            okButtonProps={{ danger: true }}
            onConfirm={handleDeleteAll}
          >
            <Button danger icon={<DeleteOutlined />}>Delete All</Button>
          </Popconfirm>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal("create")}>Tambah Budget</Button>
          <Button icon={<PrinterOutlined />} onClick={() => window.print()}>Print</Button>
          <Button icon={<DownloadOutlined />} onClick={handleExport}>Export</Button>
        </Space>
      </div>

      <Card className="op-budget-card" bordered={false} bodyStyle={{ padding: 0 }}>
        <Table
          columns={columns}
          dataSource={tableData}
          rowKey="tableKey"
          rowClassName={(record) => `budget-row budget-row--${record.rowType}`}
          className="op-budget-table"
          scroll={{ x: 2400, y: 620 }}
          pagination={false}
          bordered
          size="middle"
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
        width={1280}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col xs={24} md={8}><Form.Item name="budgetCode" label="Budget Code" rules={[{ required: true, message: "Budget code wajib diisi" }]}><Input /></Form.Item></Col>
            <Col xs={24} md={8}><Form.Item name="costCode" label="Cost Code"><Input /></Form.Item></Col>
            <Col xs={24} md={8}><Form.Item name="acctBudget" label="Acct Budget"><Input /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} md={8}><Form.Item name="largeAccount" label="Large Account"><Input /></Form.Item></Col>
            <Col xs={24} md={8}><Form.Item name="costCode1" label="Cost Code 1"><Input /></Form.Item></Col>
            <Col xs={24} md={8}><Form.Item name="deptSect" label="Dept/Sect"><Input /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} md={8}><Form.Item name="accNo" label="Acc No"><Input /></Form.Item></Col>
            <Col xs={24} md={8}><Form.Item name="accDesc" label="Acc Desc"><Input /></Form.Item></Col>
            <Col xs={24} md={8}><Form.Item name="itemName" label="Item Name" rules={[{ required: true, message: "Item name wajib diisi" }]}><Input /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}><Form.Item name="reason" label="Reason for Application"><Input /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} md={12}><Form.Item name="initialBudgetPlan" label="Initial Budget Total (Plan)"><InputNumber min={0} style={{ width: "100%" }} formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".")} parser={(value) => value?.replace(/\./g, "")} /></Form.Item></Col>
            <Col xs={24} md={12}><Form.Item name="initialBudgetActual" label="Initial Budget Total (Actual)"><InputNumber min={0} style={{ width: "100%" }} formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".")} parser={(value) => value?.replace(/\./g, "")} /></Form.Item></Col>
          </Row>

          <div className="op-budget-form-section">
            <Typography.Text strong>Alokasi Bulanan Sesuai Excel</Typography.Text>
            <div className="op-budget-month-grid">
              {MONTHS.map((month) => (
                <div className="op-budget-month-card" key={month.key}>
                  <div className="op-budget-month-card__title">{month.label}</div>
                  <Form.Item name={`${month.key}Plan`} label="Plan" className="op-budget-month-card__field">
                    <InputNumber min={0} style={{ width: "100%" }} formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".")} parser={(value) => value?.replace(/\./g, "")} />
                  </Form.Item>
                  <Form.Item name={`${month.key}Actual`} label="Actual" className="op-budget-month-card__field">
                    <InputNumber min={0} style={{ width: "100%" }} formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".")} parser={(value) => value?.replace(/\./g, "")} />
                  </Form.Item>
                </div>
              ))}
            </div>
          </div>
        </Form>
      </Modal>
    </div>
  );
}



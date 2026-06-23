import React, { useEffect, useMemo, useState } from "react";
import { Typography, Space, Select, Button, Table, Input, Modal, Form, InputNumber, Popconfirm } from "antd";
import { FilterOutlined, DownloadOutlined, CalendarOutlined, SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import "./AssetBudgetSchedulePage.css";

const { Title, Text } = Typography;
const { Option } = Select;

const MONTH_START = 3;
const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const STAGE_OPTIONS = ["All", "Quotation", "PV", "PO", "Delivery", "Implementation", "Completion", "Invoice"];
const EDIT_STAGE_OPTIONS = STAGE_OPTIONS.filter((stage) => stage !== "All");
const STAGE_SHORT_LABELS = {
  Quotation: "QUO",
  PV: "PV",
  PO: "PO",
  Delivery: "DLV",
  Implementation: "IMP",
  Completion: "CMP",
  Invoice: "INV",
};

const INITIAL_ITEMS = [
  {
    key: "1",
    no: 1,
    budgetCode: "26F06",
    subject: "DX Project 2026",
    itemName: "SMART ADMINISTRATION: NETWORKING (WLAN) : DADANG",
    budgetAmount: 2250000000,
    poTime: "202605",
    allocation: "Normal",
    budgetYear: "2026",
    currentStage: "All",
    stages: {
      Quotation: {
        plan: { start: "2026-03-W2", end: "2026-03-W3" },
        actual: { start: "2026-03-W3", end: "2026-03-W4" },
      },
      PV: {
        plan: { start: "2026-04-W1", end: "2026-04-W1" },
        actual: { start: "2026-04-W2", end: "2026-04-W2" },
      },
      PO: {
        plan: { start: "2026-04-W3", end: "2026-04-W3" },
        actual: { start: "2026-05-W1", end: "2026-05-W1" },
      },
      Delivery: {
        plan: { start: "2026-05-W2", end: "2026-05-W3" },
        actual: { start: "2026-05-W3", end: "2026-05-W4" },
      },
      Implementation: {
        plan: { start: "2026-06-W1", end: "2026-06-W2" },
        actual: { start: "2026-06-W2", end: "2026-06-W3" },
      },
      Completion: {
        plan: { start: "2026-06-W4", end: "2026-06-W4" },
        actual: { start: "2026-07-W1", end: "2026-07-W1" },
      },
      Invoice: {
        plan: { start: "2026-07-W2", end: "2026-07-W2" },
        actual: { start: "", end: "" },
      },
    },
  },
  {
    key: "2",
    no: 2,
    budgetCode: "26F07",
    subject: "DX Project 2026",
    itemName: "SMART ADMINISTRATION: SERVER MODERNIZATION",
    budgetAmount: 1600000000,
    poTime: "202607",
    allocation: "Normal",
    budgetYear: "2026",
    currentStage: "Delivery",
    stages: {
      Quotation: {
        plan: { start: "2026-04-W2", end: "2026-04-W3" },
        actual: { start: "2026-04-W4", end: "2026-04-W4" },
      },
      PV: {
        plan: { start: "2026-05-W1", end: "2026-05-W1" },
        actual: { start: "2026-05-W2", end: "2026-05-W2" },
      },
      PO: {
        plan: { start: "2026-05-W3", end: "2026-05-W3" },
        actual: { start: "2026-06-W1", end: "2026-06-W1" },
      },
      Delivery: {
        plan: { start: "2026-06-W2", end: "2026-06-W3" },
        actual: { start: "2026-07-W1", end: "2026-07-W2" },
      },
      Implementation: {
        plan: { start: "2026-07-W3", end: "2026-07-W4" },
        actual: { start: "", end: "" },
      },
      Completion: {
        plan: { start: "2026-08-W1", end: "2026-08-W1" },
        actual: { start: "", end: "" },
      },
      Invoice: {
        plan: { start: "2026-08-W2", end: "2026-08-W2" },
        actual: { start: "", end: "" },
      },
    },
  },
  {
    key: "3",
    no: 3,
    budgetCode: "26F08",
    subject: "Smart Production",
    itemName: "DIGITALISASI ANDON",
    budgetAmount: 350000000,
    poTime: "202604",
    allocation: "Normal",
    budgetYear: "2026",
    currentStage: "Quotation",
    stages: {
      Quotation: {
        plan: { start: "2026-06-W1", end: "2026-06-W2" },
        actual: { start: "", end: "" },
      },
      PV: {
        plan: { start: "2026-06-W3", end: "2026-06-W3" },
        actual: { start: "", end: "" },
      },
      PO: {
        plan: { start: "2026-06-W4", end: "2026-06-W4" },
        actual: { start: "", end: "" },
      },
      Delivery: {
        plan: { start: "2026-07-W1", end: "2026-07-W2" },
        actual: { start: "", end: "" },
      },
      Implementation: {
        plan: { start: "2026-08-W1", end: "2026-08-W2" },
        actual: { start: "", end: "" },
      },
      Completion: {
        plan: { start: "2026-08-W3", end: "2026-08-W3" },
        actual: { start: "", end: "" },
      },
      Invoice: {
        plan: { start: "2026-09-W1", end: "2026-09-W1" },
        actual: { start: "", end: "" },
      },
    },
  },
];

function createWeekKey(year, month, week) {
  if (!year || !month || !week) return "";
  return `${year}-${String(month).padStart(2, "0")}-${week}`;
}

function createWeekKeyFromMonthValue(monthValue, week) {
  if (!monthValue || !week) return "";
  const [year, month] = String(monthValue).split("-");
  return createWeekKey(year, Number(month), week);
}

function parseWeekKey(value = "") {
  const match = /^(\d{4})-(\d{2})-(W[1-4])$/.exec(value);
  if (!match) return {};
  return {
    year: match[1],
    month: Number(match[2]),
    week: match[3],
  };
}

function buildMonthGroups(year) {
  return Array.from({ length: 12 }, (_, index) => {
    const monthNumber = ((MONTH_START - 1 + index) % 12) + 1;
    const yearOffset = MONTH_START - 1 + index >= 12 ? 1 : 0;
    const resolvedYear = String(Number(year) + yearOffset);
    return {
      year: resolvedYear,
      monthNumber,
      label: `${MONTH_LABELS[monthNumber - 1]}-${resolvedYear.slice(-2)}`,
      weeks: ["W1", "W2", "W3", "W4"],
    };
  });
}

function formatCurrency(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(Number(value || 0));
}

function getAutomaticStatus(item) {
  if (item.currentStage === "All") return "Overall Progress";
  const range = item.stages?.[item.currentStage]?.actual;
  if (range?.start && range?.end) {
    return item.currentStage === "Invoice" ? "Completed" : `${item.currentStage} Actual`;
  }
  return `${item.currentStage} Plan`;
}

function getStageKeysForView(selectedStage) {
  return selectedStage === "All" ? EDIT_STAGE_OPTIONS : [selectedStage];
}

export default function AssetBudgetSchedulePage() {
  const [year, setYear] = useState("2026");
  const [searchText, setSearchText] = useState("");
  const [items, setItems] = useState(INITIAL_ITEMS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItemKey, setEditingItemKey] = useState("");
  const [editingStage, setEditingStage] = useState("Quotation");
  const [editingRowType, setEditingRowType] = useState("plan");
  const [form] = Form.useForm();
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [itemModalMode, setItemModalMode] = useState("add");
  const [itemEditingKey, setItemEditingKey] = useState("");
  const [itemForm] = Form.useForm();

  const monthGroups = useMemo(() => buildMonthGroups(year), [year]);

  const yearWeekKeys = useMemo(
    () =>
      monthGroups.flatMap((group) =>
        group.weeks.map((week) => createWeekKey(group.year, group.monthNumber, week))
      ),
    [monthGroups]
  );

  const yearWeekIndexMap = useMemo(
    () => Object.fromEntries(yearWeekKeys.map((key, index) => [key, index])),
    [yearWeekKeys]
  );

  const editingItem = useMemo(
    () => items.find((item) => item.key === editingItemKey) || null,
    [items, editingItemKey]
  );
  const itemEditing = useMemo(
    () => items.find((item) => item.key === itemEditingKey) || null,
    [items, itemEditingKey]
  );

  const filteredItems = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    return items.filter((item) => {
      const matchesYear = item.budgetYear === year;
      const matchesQuery =
        !query ||
        [item.budgetCode, item.subject, item.itemName].some((field) =>
          String(field).toLowerCase().includes(query)
        );
      return matchesYear && matchesQuery;
    });
  }, [items, searchText, year]);

  const tableRows = useMemo(
    () =>
      filteredItems.flatMap((item) => [
        { ...item, rowType: "plan", rowKey: `${item.key}-plan` },
        { ...item, rowType: "actual", rowKey: `${item.key}-actual` },
      ]),
    [filteredItems]
  );

  useEffect(() => {
    if (!editingItem) return;
    const stageData = editingItem.stages?.[editingStage] || { plan: {}, actual: {} };
    const planStart = parseWeekKey(stageData.plan?.start);
    const planEnd = parseWeekKey(stageData.plan?.end);
    const actualStart = parseWeekKey(stageData.actual?.start);
    const actualEnd = parseWeekKey(stageData.actual?.end);

    form.setFieldsValue({
      budgetYear: editingItem.budgetYear,
      budgetAmount: editingItem.budgetAmount,
      currentStage: editingItem.currentStage,
      stageToEdit: editingStage,
      planStartMonth:
        planStart.year && planStart.month ? `${planStart.year}-${String(planStart.month).padStart(2, "0")}` : undefined,
      planStartWeek: planStart.week,
      planEndMonth:
        planEnd.year && planEnd.month ? `${planEnd.year}-${String(planEnd.month).padStart(2, "0")}` : undefined,
      planEndWeek: planEnd.week,
      actualStartMonth:
        actualStart.year && actualStart.month ? `${actualStart.year}-${String(actualStart.month).padStart(2, "0")}` : undefined,
      actualStartWeek: actualStart.week,
      actualEndMonth:
        actualEnd.year && actualEnd.month ? `${actualEnd.year}-${String(actualEnd.month).padStart(2, "0")}` : undefined,
      actualEndWeek: actualEnd.week,
    });
  }, [editingItem, editingStage, form]);

  const openUpdateModal = (item, preferredStage = EDIT_STAGE_OPTIONS[0], rowType = "plan") => {
    setEditingItemKey(item.key);
    setEditingStage(preferredStage);
    setEditingRowType(rowType);
    setIsModalOpen(true);
  };

  const closeUpdateModal = () => {
    setIsModalOpen(false);
    setEditingItemKey("");
    setEditingStage(EDIT_STAGE_OPTIONS[0]);
    setEditingRowType("plan");
    form.resetFields();
  };

  const openItemModal = (mode, item = null) => {
    setItemModalMode(mode);
    setItemEditingKey(item?.key || "");
    setIsItemModalOpen(true);

    if (mode === "edit" && item) {
      itemForm.setFieldsValue({
        budgetCode: item.budgetCode,
        subject: item.subject,
        itemName: item.itemName,
        budgetAmount: item.budgetAmount,
        poTime: item.poTime,
        allocation: item.allocation,
        budgetYear: item.budgetYear,
        currentStage: item.currentStage,
      });
      return;
    }

    itemForm.setFieldsValue({
      budgetCode: "",
      subject: "",
      itemName: "",
      budgetAmount: 0,
      poTime: year,
      allocation: "Normal",
      budgetYear: year,
      currentStage: "All",
    });
  };

  const closeItemModal = () => {
    setIsItemModalOpen(false);
    setItemEditingKey("");
    itemForm.resetFields();
  };

  const handleStageViewChange = (itemKey, stage) => {
    setItems((current) =>
      current.map((item) => (item.key === itemKey ? { ...item, currentStage: stage } : item))
    );
  };

  const handleUpdateSave = async () => {
    const values = await form.validateFields();

    setItems((current) =>
      current.map((item) => {
        if (item.key !== editingItemKey) return item;

        return {
          ...item,
          budgetYear: values.budgetYear,
          budgetAmount: values.budgetAmount,
          currentStage: values.currentStage,
          stages: {
            ...item.stages,
            [values.stageToEdit]: {
              plan: {
                start: createWeekKeyFromMonthValue(values.planStartMonth, values.planStartWeek),
                end: createWeekKeyFromMonthValue(values.planEndMonth, values.planEndWeek),
              },
              actual: {
                start: createWeekKeyFromMonthValue(values.actualStartMonth, values.actualStartWeek),
                end: createWeekKeyFromMonthValue(values.actualEndMonth, values.actualEndWeek),
              },
            },
          },
        };
      })
    );

    closeUpdateModal();
  };

  const handleDeleteStageBlock = () => {
    setItems((current) =>
      current.map((item) => {
        if (item.key !== editingItemKey) return item;

        return {
          ...item,
          stages: {
            ...item.stages,
            [editingStage]: {
              ...item.stages[editingStage],
              [editingRowType]: {
                start: "",
                end: "",
              },
            },
          },
        };
      })
    );

    closeUpdateModal();
  };

  const handleItemSave = async () => {
    const values = await itemForm.validateFields();

    if (itemModalMode === "edit" && itemEditing) {
      setItems((current) =>
        current.map((item) =>
          item.key === itemEditing.key
            ? {
                ...item,
                budgetCode: values.budgetCode,
                subject: values.subject,
                itemName: values.itemName,
                budgetAmount: values.budgetAmount,
                poTime: values.poTime,
                allocation: values.allocation,
                budgetYear: values.budgetYear,
                currentStage: values.currentStage,
              }
            : item
        )
      );
    } else {
      setItems((current) => [
        ...current,
        {
          key: String(Date.now()),
          no: current.length + 1,
          budgetCode: values.budgetCode,
          subject: values.subject,
          itemName: values.itemName,
          budgetAmount: values.budgetAmount,
          poTime: values.poTime,
          allocation: values.allocation,
          budgetYear: values.budgetYear,
          currentStage: values.currentStage,
          stages: Object.fromEntries(
            EDIT_STAGE_OPTIONS.map((stage) => [
              stage,
              { plan: { start: "", end: "" }, actual: { start: "", end: "" } },
            ])
          ),
        },
      ]);
    }

    closeItemModal();
  };

  const handleDeleteItem = (itemKey) => {
    setItems((current) =>
      current
        .filter((item) => item.key !== itemKey)
        .map((item, index) => ({ ...item, no: index + 1 }))
    );
  };

  const buildSegmentsForRow = (record) => {
    const stageKeys = getStageKeysForView(record.currentStage);
    const mode = record.rowType;

    return stageKeys
      .map((stage) => {
        const range = record.stages?.[stage]?.[mode];
        if (!range?.start || !range?.end) return null;

        const startIndex = yearWeekIndexMap[range.start];
        const endIndex = yearWeekIndexMap[range.end];
        if (startIndex === undefined || endIndex === undefined) return null;

        const planRange = record.stages?.[stage]?.plan || {};
        const isOnTime =
          mode === "actual"
            ? !!range.start &&
              !!range.end &&
              range.start === planRange.start &&
              range.end === planRange.end
            : false;

        return {
          stage,
          startIndex: Math.min(startIndex, endIndex),
          endIndex: Math.max(startIndex, endIndex),
          timingState: mode === "actual" ? (isOnTime ? "on-time" : "off-time") : "plan",
        };
      })
      .filter(Boolean);
  };

  const renderTimelineCell = (record, cellKey) => {
    const currentIndex = yearWeekIndexMap[cellKey];
    const segments = buildSegmentsForRow(record);

    const matchingSegment = segments.find(
      (segment) => currentIndex >= segment.startIndex && currentIndex <= segment.endIndex
    );

    const preferredStage =
      matchingSegment?.stage ||
      (record.currentStage !== "All" ? record.currentStage : EDIT_STAGE_OPTIONS[0]);

    if (!matchingSegment) {
      return (
        <button
          type="button"
          className="budget-monitoring__week-button"
          onClick={() => openUpdateModal(record, preferredStage, record.rowType)}
        >
          <div className="budget-monitoring__week-cell" />
        </button>
      );
    }

    const isStart = currentIndex === matchingSegment.startIndex;
    const isEnd = currentIndex === matchingSegment.endIndex;

    return (
      <button
        type="button"
        className="budget-monitoring__week-button"
        onClick={() => openUpdateModal(record, preferredStage, record.rowType)}
      >
        <div
          className={`budget-monitoring__week-cell budget-monitoring__week-cell--active budget-monitoring__week-cell--${record.rowType}${
            matchingSegment.timingState ? ` budget-monitoring__week-cell--${matchingSegment.timingState}` : ""
          }${
            isStart ? " budget-monitoring__week-cell--start" : ""
          }${isEnd ? " budget-monitoring__week-cell--end" : ""}`}
        >
          <span className="budget-monitoring__week-label">
            {STAGE_SHORT_LABELS[matchingSegment.stage] || matchingSegment.stage.slice(0, 3).toUpperCase()}
          </span>
        </div>
      </button>
    );
  };

  const renderMergedText = (value, className = "") => (
    <div className={`budget-monitoring__cell-text ${className}`.trim()}>{value || ""}</div>
  );

  const mergeTopOnly = (value, row, index, className = "") => ({
    children: index % 2 === 0 ? renderMergedText(value, className) : "",
    props: { rowSpan: index % 2 === 0 ? 2 : 0 },
  });

  const columns = [
    {
      title: "No",
      dataIndex: "no",
      key: "no",
      width: 58,
      fixed: "left",
      align: "center",
      render: (value, row, index) => ({
        children: index % 2 === 0 ? value : "",
        props: { rowSpan: index % 2 === 0 ? 2 : 0 },
      }),
    },
    {
      title: "Num Budget",
      dataIndex: "budgetCode",
      key: "budgetCode",
      width: 110,
      fixed: "left",
      render: (value, row, index) => mergeTopOnly(value, row, index, "budget-monitoring__cell-text--nowrap"),
    },
    {
      title: "Subject",
      dataIndex: "subject",
      key: "subject",
      width: 150,
      fixed: "left",
      render: mergeTopOnly,
    },
    {
      title: "Nama Aset",
      dataIndex: "itemName",
      key: "itemName",
      width: 260,
      fixed: "left",
      render: (value, row, index) => ({
        children: index % 2 === 0 ? <div className="budget-monitoring__item">{value || ""}</div> : "",
        props: { rowSpan: index % 2 === 0 ? 2 : 0 },
      }),
    },
    {
      title: "Budget",
      dataIndex: "budgetAmount",
      key: "budgetAmount",
      width: 130,
      fixed: "left",
      align: "right",
      onHeaderCell: () => ({ style: { textAlign: "center" } }),
      render: (value, row, index) => ({
        children: index % 2 === 0 ? <span className="budget-monitoring__money">{formatCurrency(value)}</span> : "",
        props: { rowSpan: index % 2 === 0 ? 2 : 0 },
      }),
    },
    {
      title: "PO Time",
      dataIndex: "poTime",
      key: "poTime",
      width: 92,
      fixed: "left",
      align: "center",
      render: (value, row, index) => mergeTopOnly(value, row, index, "budget-monitoring__cell-text--nowrap"),
    },
    {
      title: "Stage",
      dataIndex: "currentStage",
      key: "currentStage",
      width: 150,
      fixed: "left",
      align: "center",
      render: (value, record, index) => ({
        children:
          index % 2 === 0 ? (
            <Select
              size="small"
              value={value}
              className="budget-monitoring__stage-select"
              onChange={(nextStage) => handleStageViewChange(record.key, nextStage)}
              options={STAGE_OPTIONS.map((stage) => ({ label: stage, value: stage }))}
            />
          ) : (
            ""
          ),
        props: { rowSpan: index % 2 === 0 ? 2 : 0 },
      }),
    },
    {
      title: "Type",
      dataIndex: "rowType",
      key: "rowType",
      width: 80,
      fixed: "left",
      align: "center",
      render: (value) => <span className={`budget-monitoring__type budget-monitoring__type--${value}`}>{value.toUpperCase()}</span>,
    },
    {
      title: "Alokasi",
      dataIndex: "allocation",
      key: "allocation",
      width: 90,
      fixed: "left",
      align: "center",
      render: (value, row, index) => mergeTopOnly(value, row, index, "budget-monitoring__cell-text--nowrap"),
    },
    {
      title: "Status",
      key: "status",
      width: 140,
      fixed: "left",
      align: "center",
      render: (_, record, index) => ({
        children: index % 2 === 0 ? <span className="budget-monitoring__status">{getAutomaticStatus(record)}</span> : "",
        props: { rowSpan: index % 2 === 0 ? 2 : 0 },
      }),
    },
    {
      title: "Budget Year",
      dataIndex: "budgetYear",
      key: "budgetYear",
      width: 100,
      fixed: "left",
      align: "center",
      render: (value, row, index) => mergeTopOnly(value, row, index, "budget-monitoring__cell-text--nowrap"),
    },
    {
      title: "Action",
      key: "action",
      width: 120,
      align: "center",
      fixed: "left",
      render: (_, record, index) => ({
        children:
          index % 2 === 0 ? (
            <Space size={4}>
              <Button size="small" icon={<EditOutlined />} onClick={() => openItemModal("edit", record)} />
              <Popconfirm
                title="Hapus grafik ini?"
                onConfirm={() => handleDeleteItem(record.key)}
                okText="Hapus"
                cancelText="Batal"
              >
                <Button size="small" danger icon={<DeleteOutlined />} />
              </Popconfirm>
            </Space>
          ) : (
            ""
          ),
        props: { rowSpan: index % 2 === 0 ? 2 : 0 },
      }),
    },
    ...monthGroups.map((group) => ({
      title: group.label,
      children: group.weeks.map((week) => {
        const cellKey = createWeekKey(group.year, group.monthNumber, week);
        return {
          title: week,
          key: cellKey,
          dataIndex: cellKey,
          width: 50,
          align: "center",
          className: "budget-monitoring__week-col",
          render: (_, record) => renderTimelineCell(record, cellKey),
        };
      }),
    })),
  ];

  return (
    <div className="budget-schedule-page">
      <div className="schedule-header">
        <div className="schedule-header__title">
          <div className="schedule-header__icon">
            <CalendarOutlined />
          </div>
          <div>
            <Title level={3} className="schedule-title">Control Progress Aset IT</Title>
            {/* <Text type="secondary">Timeline hanya 2 baris: plan dan actual. Stage bisa pilih all atau per tahap.</Text> */}
          </div>
        </div>

        <Space size="middle" wrap>
          <Input
            placeholder="Cari budget / aset..."
            prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 260 }}
          />
          <Select value={year} onChange={setYear} style={{ width: 110 }}>
            <Option value="2025">2025</Option>
            <Option value="2026">2026</Option>
            <Option value="2027">2027</Option>
          </Select>
          <Button icon={<PlusOutlined />} onClick={() => openItemModal("add")}>Add</Button>
          <Button icon={<FilterOutlined />}>Filter</Button>
          <Button type="primary" icon={<DownloadOutlined />}>Export</Button>
        </Space>
      </div>

      <div className="timeline-table-card">
        <Table
          columns={columns}
          dataSource={tableRows}
          rowKey="rowKey"
          pagination={false}
          scroll={{ x: 3400, y: 800 }}
          bordered
          size="small"
          className="timeline-table timeline-table--excel"
          rowClassName={(record) => `budget-monitoring__row budget-monitoring__row--${record.rowType}`}
        />
      </div>

      <Modal
        title={`Update Tanggal Stage ${editingRowType.toUpperCase()}`}
        open={isModalOpen}
        onCancel={closeUpdateModal}
        onOk={handleUpdateSave}
        okText="Simpan"
        cancelText="Batal"
        destroyOnHidden
        width={760}
        footer={(_, { OkBtn, CancelBtn }) => (
          <>
            <Button danger onClick={handleDeleteStageBlock}>
              Delete {editingRowType.toUpperCase()}
            </Button>
            <CancelBtn />
            <OkBtn />
          </>
        )}
      >
        <Form form={form} layout="vertical">
          <div className="budget-monitoring__form-grid">
            <Form.Item name="budgetYear" label="Budget Year" rules={[{ required: true, message: "Wajib isi tahun budget" }]}>
              <Select options={["2025", "2026", "2027", "2028"].map((option) => ({ label: option, value: option }))} />
            </Form.Item>
            <Form.Item name="budgetAmount" label="Budget (IDR)" rules={[{ required: true, message: "Wajib isi budget" }]}>
              <InputNumber style={{ width: "100%" }} min={0} />
            </Form.Item>
            <Form.Item name="currentStage" label="Stage Yang Ditampilkan" rules={[{ required: true, message: "Pilih stage" }]}>
              <Select options={STAGE_OPTIONS.map((stage) => ({ label: stage, value: stage }))} />
            </Form.Item>
            <Form.Item name="stageToEdit" label="Stage Yang Diupdate" rules={[{ required: true, message: "Pilih stage update" }]}>
              <Select
                options={EDIT_STAGE_OPTIONS.map((stage) => ({ label: stage, value: stage }))}
                onChange={(value) => setEditingStage(value)}
              />
            </Form.Item>
          </div>

          <div className="budget-monitoring__form-section">
            <h4>Plan</h4>
            <div className="budget-monitoring__form-grid">
              <Form.Item name="planStartMonth" label="Start Month" rules={[{ required: true, message: "Wajib isi start month plan" }]}>
                <Select options={monthGroups.map((group) => ({ label: group.label, value: `${group.year}-${String(group.monthNumber).padStart(2, "0")}` }))} />
              </Form.Item>
              <Form.Item name="planStartWeek" label="Start Week" rules={[{ required: true, message: "Wajib isi start week plan" }]}>
                <Select options={["W1", "W2", "W3", "W4"].map((week) => ({ label: week, value: week }))} />
              </Form.Item>
              <Form.Item name="planEndMonth" label="End Month" rules={[{ required: true, message: "Wajib isi end month plan" }]}>
                <Select options={monthGroups.map((group) => ({ label: group.label, value: `${group.year}-${String(group.monthNumber).padStart(2, "0")}` }))} />
              </Form.Item>
              <Form.Item name="planEndWeek" label="End Week" rules={[{ required: true, message: "Wajib isi end week plan" }]}>
                <Select options={["W1", "W2", "W3", "W4"].map((week) => ({ label: week, value: week }))} />
              </Form.Item>
            </div>
          </div>

          <div className="budget-monitoring__form-section">
            <h4>Actual</h4>
            <div className="budget-monitoring__form-grid">
              <Form.Item name="actualStartMonth" label="Start Month">
                <Select allowClear options={monthGroups.map((group) => ({ label: group.label, value: `${group.year}-${String(group.monthNumber).padStart(2, "0")}` }))} />
              </Form.Item>
              <Form.Item name="actualStartWeek" label="Start Week">
                <Select allowClear options={["W1", "W2", "W3", "W4"].map((week) => ({ label: week, value: week }))} />
              </Form.Item>
              <Form.Item name="actualEndMonth" label="End Month">
                <Select allowClear options={monthGroups.map((group) => ({ label: group.label, value: `${group.year}-${String(group.monthNumber).padStart(2, "0")}` }))} />
              </Form.Item>
              <Form.Item name="actualEndWeek" label="End Week">
                <Select allowClear options={["W1", "W2", "W3", "W4"].map((week) => ({ label: week, value: week }))} />
              </Form.Item>
            </div>
          </div>
        </Form>
      </Modal>

      <Modal
        title={itemModalMode === "edit" ? "Edit Budget Item" : "Add Budget Item"}
        open={isItemModalOpen}
        onCancel={closeItemModal}
        onOk={handleItemSave}
        okText="Simpan"
        cancelText="Batal"
        destroyOnHidden
        width={760}
      >
        <Form form={itemForm} layout="vertical">
          <div className="budget-monitoring__form-grid">
            <Form.Item name="budgetCode" label="Num Budget" rules={[{ required: true, message: "Wajib isi num budget" }]}>
              <Input />
            </Form.Item>
            <Form.Item name="budgetYear" label="Budget Year" rules={[{ required: true, message: "Wajib isi budget year" }]}>
              <Select options={["2025", "2026", "2027", "2028"].map((option) => ({ label: option, value: option }))} />
            </Form.Item>
            <Form.Item name="subject" label="Subject" rules={[{ required: true, message: "Wajib isi subject" }]}>
              <Input />
            </Form.Item>
            <Form.Item name="itemName" label="Nama Aset" rules={[{ required: true, message: "Wajib isi nama aset" }]}>
              <Input />
            </Form.Item>
            <Form.Item name="budgetAmount" label="Budget (IDR)" rules={[{ required: true, message: "Wajib isi budget" }]}>
              <InputNumber style={{ width: "100%" }} min={0} />
            </Form.Item>
            <Form.Item name="poTime" label="PO Time" rules={[{ required: true, message: "Wajib isi PO time" }]}>
              <Input />
            </Form.Item>
            <Form.Item name="allocation" label="Alokasi" rules={[{ required: true, message: "Wajib isi alokasi" }]}>
              <Input />
            </Form.Item>
            <Form.Item name="currentStage" label="Stage Default" rules={[{ required: true, message: "Pilih stage" }]}>
              <Select options={STAGE_OPTIONS.map((stage) => ({ label: stage, value: stage }))} />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  );
}

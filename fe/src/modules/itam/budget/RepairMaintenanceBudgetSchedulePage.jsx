import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Typography, Space, Select, Button, Table, Input, Modal, Form, InputNumber, Popconfirm, DatePicker, Popover, message } from "antd";
import { FilterOutlined, DownloadOutlined, CalendarOutlined, SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined, InfoCircleOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import "./AssetBudgetSchedulePage.css";

const { Title } = Typography;
const { Option } = Select;

const MONTH_START = 1;
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

const OPERATIONAL_BUDGET_SCHEDULE_STORAGE_KEY = "itam.operationalBudgetSchedule.items.v1";
const OPERATIONAL_BUDGET_STORAGE_KEY = "itam.operationalBudget.items.v2";
const MONTH_PICKER_FORMAT = "MM/YYYY";

const INITIAL_ITEMS = [
  {
    key: "1",
    no: 1,
    budgetCode: "OP-2026-001",
    subject: "Operational Support 2026",
    itemName: "Microsoft 365 License",
    budgetPlanAmount: 30000000,
    actualBudgetAmount: 0,
    borrowedFromBudgetCode: "",
    borrowedAmount: 0,
    transferDate: "",
    borrowPurpose: "",
    borrowRemark: "",
    poTime: "202604",
    allocation: "Normal",
    budgetYear: "2026",
    currentStage: "All",
    stages: {
      Quotation: { plan: { start: "2026-03-W1", end: "2026-03-W1" }, actual: { start: "2026-03-W1", end: "2026-03-W1" } },
      PV: { plan: { start: "2026-03-W2", end: "2026-03-W2" }, actual: { start: "2026-03-W2", end: "2026-03-W2" } },
      PO: { plan: { start: "2026-03-W3", end: "2026-03-W3" }, actual: { start: "2026-03-W3", end: "2026-03-W3" } },
      Delivery: { plan: { start: "2026-04-W1", end: "2026-04-W1" }, actual: { start: "2026-04-W1", end: "2026-04-W1" } },
      Implementation: { plan: { start: "2026-04-W2", end: "2026-04-W2" }, actual: { start: "2026-04-W2", end: "2026-04-W2" } },
      Completion: { plan: { start: "2026-04-W3", end: "2026-04-W3" }, actual: { start: "2026-04-W3", end: "2026-04-W3" } },
      Invoice: { plan: { start: "2026-04-W4", end: "2026-04-W4" }, actual: { start: "2026-04-W4", end: "2026-04-W4" } },
    },
  },
  {
    key: "2",
    no: 2,
    budgetCode: "OP-2026-002",
    subject: "Infrastructure Service",
    itemName: "AWS Hosting",
    budgetPlanAmount: 14800000,
    actualBudgetAmount: 0,
    borrowedFromBudgetCode: "",
    borrowedAmount: 0,
    transferDate: "",
    borrowPurpose: "",
    borrowRemark: "",
    poTime: "202605",
    allocation: "Normal",
    budgetYear: "2026",
    currentStage: "All",
    stages: {
      Quotation: { plan: { start: "2026-04-W2", end: "2026-04-W2" }, actual: { start: "2026-04-W3", end: "2026-04-W3" } },
      PV: { plan: { start: "2026-04-W4", end: "2026-04-W4" }, actual: { start: "2026-05-W1", end: "2026-05-W1" } },
      PO: { plan: { start: "2026-05-W2", end: "2026-05-W2" }, actual: { start: "", end: "" } },
      Delivery: { plan: { start: "2026-05-W4", end: "2026-05-W4" }, actual: { start: "", end: "" } },
      Implementation: { plan: { start: "2026-06-W1", end: "2026-06-W1" }, actual: { start: "", end: "" } },
      Completion: { plan: { start: "2026-06-W2", end: "2026-06-W2" }, actual: { start: "", end: "" } },
      Invoice: { plan: { start: "2026-06-W3", end: "2026-06-W3" }, actual: { start: "", end: "" } },
    },
  },
  {
    key: "3",
    no: 3,
    budgetCode: "OP-2026-003",
    subject: "Connectivity",
    itemName: "Internet ISP Dedicated",
    budgetPlanAmount: 9000000,
    actualBudgetAmount: 0,
    borrowedFromBudgetCode: "",
    borrowedAmount: 0,
    transferDate: "",
    borrowPurpose: "",
    borrowRemark: "",
    poTime: "202603",
    allocation: "Normal",
    budgetYear: "2026",
    currentStage: "All",
    stages: {
      Quotation: { plan: { start: "2026-03-W1", end: "2026-03-W1" }, actual: { start: "2026-03-W1", end: "2026-03-W1" } },
      PV: { plan: { start: "2026-03-W2", end: "2026-03-W2" }, actual: { start: "2026-03-W2", end: "2026-03-W2" } },
      PO: { plan: { start: "2026-03-W3", end: "2026-03-W3" }, actual: { start: "2026-03-W4", end: "2026-03-W4" } },
      Delivery: { plan: { start: "2026-04-W1", end: "2026-04-W2" }, actual: { start: "", end: "" } },
      Implementation: { plan: { start: "2026-04-W3", end: "2026-04-W3" }, actual: { start: "", end: "" } },
      Completion: { plan: { start: "2026-04-W4", end: "2026-04-W4" }, actual: { start: "", end: "" } },
      Invoice: { plan: { start: "2026-05-W1", end: "2026-05-W1" }, actual: { start: "", end: "" } },
    },
  },
];

function createWeekKey(year, month, week) {
  if (!year || !month || !week) return "";
  return `${year}-${String(month).padStart(2, "0")}-${week}`;
}

function normalizePoTimeValue(value) {
  if (!value) return "";

  const raw = String(value).trim();
  if (/^\d{6}$/.test(raw)) {
    return `${raw.slice(0, 4)}-${raw.slice(4, 6)}`;
  }
  if (/^\d{4}-\d{2}$/.test(raw)) {
    return raw;
  }
  if (/^\d{2}\/\d{4}$/.test(raw)) {
    const [month, year] = raw.split("/");
    return `${year}-${month}`;
  }

  const parsed = dayjs(raw);
  return parsed.isValid() ? parsed.format("YYYY-MM") : "";
}

function formatPoTime(value) {
  const normalized = normalizePoTimeValue(value);
  if (!normalized) return "";
  const parsed = dayjs(`${normalized}-01`);
  return parsed.isValid() ? parsed.format(MONTH_PICKER_FORMAT) : normalized;
}

function shiftMonthValue(monthValue, offset) {
  const normalized = normalizePoTimeValue(monthValue);
  if (!normalized) return "";
  const parsed = dayjs(`${normalized}-01`);
  return parsed.isValid() ? parsed.add(offset, "month").format("YYYY-MM") : "";
}

function createWeekKeyFromMonthValue(monthValue, week) {
  if (!monthValue || !week) return "";
  const [year, month] = String(monthValue).split("-");
  return createWeekKey(year, Number(month), week);
}

function buildAutomaticStages(poTime) {
  const normalizedPoTime = normalizePoTimeValue(poTime);
  if (!normalizedPoTime) {
    return Object.fromEntries(
      EDIT_STAGE_OPTIONS.map((stage) => [
        stage,
        { plan: { start: "", end: "" }, actual: { start: "", end: "" } },
      ])
    );
  }

  const quoMonth = shiftMonthValue(normalizedPoTime, -2);
  const pvMonth = shiftMonthValue(normalizedPoTime, -1);
  const poMonth = normalizedPoTime;
  const dlvMonth = shiftMonthValue(normalizedPoTime, 2);
  const invMonth = shiftMonthValue(normalizedPoTime, 3);

  return {
    Quotation: {
      plan: { start: createWeekKeyFromMonthValue(quoMonth, "W1"), end: createWeekKeyFromMonthValue(quoMonth, "W1") },
      actual: { start: "", end: "" },
    },
    PV: {
      plan: { start: createWeekKeyFromMonthValue(pvMonth, "W1"), end: createWeekKeyFromMonthValue(pvMonth, "W1") },
      actual: { start: "", end: "" },
    },
    PO: {
      plan: { start: createWeekKeyFromMonthValue(poMonth, "W1"), end: createWeekKeyFromMonthValue(poMonth, "W1") },
      actual: { start: "", end: "" },
    },
    Delivery: {
      plan: { start: createWeekKeyFromMonthValue(dlvMonth, "W1"), end: createWeekKeyFromMonthValue(dlvMonth, "W1") },
      actual: { start: "", end: "" },
    },
    Implementation: {
      plan: { start: "", end: "" },
      actual: { start: "", end: "" },
    },
    Completion: {
      plan: { start: "", end: "" },
      actual: { start: "", end: "" },
    },
    Invoice: {
      plan: { start: createWeekKeyFromMonthValue(invMonth, "W1"), end: createWeekKeyFromMonthValue(invMonth, "W1") },
      actual: { start: "", end: "" },
    },
  };
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

function hasRangeFilled(range) {
  return Boolean(range?.start && range?.end);
}

function getEffectiveActualAmount(item) {
  return Number(item?.actualBudgetAmount || 0) + Number(item?.borrowedAmount || 0);
}

function isItemClosed(item) {
  return EDIT_STAGE_OPTIONS.every((stage) => {
    const planRange = item.stages?.[stage]?.plan;
    const actualRange = item.stages?.[stage]?.actual;
    if (!hasRangeFilled(planRange)) return true;
    return hasRangeFilled(actualRange);
  });
}

function getAutomaticStatus(item) {
  if (isItemClosed(item)) return "Close";
  if (item.currentStage === "All") return "Progress";
  const range = item.stages?.[item.currentStage]?.actual;
  if (range?.start && range?.end) {
    return `${item.currentStage} Actual`;
  }
  return `${item.currentStage} Plan`;
}

function detectOperationalBudgetYear(entry) {
  const budgetCode = String(entry?.budgetCode || "").trim().toUpperCase();
  const subject = String(entry?.subject || "");
  const reason = String(entry?.reason || "");
  const subjectYearMatch = subject.match(/\b(20\d{2})\b/);
  if (subjectYearMatch) return subjectYearMatch[1];
  const reasonYearMatch = reason.match(/\b(20\d{2})\b/);
  if (reasonYearMatch) return reasonYearMatch[1];

  const operationalCodeYearMatch = budgetCode.match(/(?:^|[^0-9])(20\d{2})(?:[^0-9]|$)/);
  if (operationalCodeYearMatch) return operationalCodeYearMatch[1];

  const budgetCodeYearMatch = budgetCode.match(/^(\d{2})[A-Z]/);
  if (budgetCodeYearMatch) return `20${budgetCodeYearMatch[1]}`;

  return "2026";
}

function getStageKeysForView(selectedStage) {
  return selectedStage === "All" ? EDIT_STAGE_OPTIONS : [selectedStage];
}

function createDefaultOperationalItems() {
  return INITIAL_ITEMS.map((item) => ({
    ...item,
    budgetPlanAmount: Number(item.budgetPlanAmount ?? item.budgetAmount ?? 0),
    actualBudgetAmount: Number(item.actualBudgetAmount ?? 0),
    borrowedFromBudgetCode: String(item.borrowedFromBudgetCode || "").trim(),
    borrowedAmount: Number(item.borrowedAmount ?? 0),
    transferDate: String(item.transferDate || ""),
    borrowPurpose: String(item.borrowPurpose || ""),
    borrowRemark: String(item.borrowRemark || ""),
    stages: Object.fromEntries(
      Object.entries(item.stages || {}).map(([stage, value]) => [
        stage,
        {
          plan: { ...(value?.plan || {}) },
          actual: { ...(value?.actual || {}) },
        },
      ])
    ),
  }));
}

function loadStoredOperationalItems() {
  if (typeof window === "undefined") {
    return createDefaultOperationalItems();
  }

  try {
    const raw = window.localStorage.getItem(OPERATIONAL_BUDGET_SCHEDULE_STORAGE_KEY);
    if (!raw) return createDefaultOperationalItems();

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return createDefaultOperationalItems();

    return parsed.map((item, index) => ({
      ...item,
      no: index + 1,
      key: String(item.key || index + 1),
      budgetPlanAmount: Number(item.budgetPlanAmount ?? item.budgetAmount ?? 0),
      actualBudgetAmount: Number(item.actualBudgetAmount ?? 0),
      borrowedFromBudgetCode: String(item.borrowedFromBudgetCode || "").trim(),
      borrowedAmount: Number(item.borrowedAmount ?? 0),
      transferDate: String(item.transferDate || ""),
      borrowPurpose: String(item.borrowPurpose || ""),
      borrowRemark: String(item.borrowRemark || ""),
      stages: Object.fromEntries(
        EDIT_STAGE_OPTIONS.map((stage) => [
          stage,
          {
            plan: {
              start: item?.stages?.[stage]?.plan?.start || "",
              end: item?.stages?.[stage]?.plan?.end || "",
            },
            actual: {
              start: item?.stages?.[stage]?.actual?.start || "",
              end: item?.stages?.[stage]?.actual?.end || "",
            },
          },
        ])
      ),
    }));
  } catch {
    return createDefaultOperationalItems();
  }
}

function buildOperationalBudgetCatalog(rows = []) {
  const grouped = new Map();

  rows.forEach((row) => {
    const budgetCode = String(row?.budgetCode || "").trim();
    const itemName = String(row?.itemName || "").trim();
    if (!budgetCode) return;

    const current = grouped.get(budgetCode) || {
      budgetCode,
      subject: "",
      budgetYear: "",
      budgetPlanAmount: 0,
      items: [],
    };

    const subject = String(row?.reason || row?.accDesc || row?.itemName || "").trim();
    const monthlyPlanTotal = MONTH_LABELS.reduce((sum, _, monthIndex) => {
      const monthKey = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"][monthIndex];
      return sum + Number(row?.[`${monthKey}Plan`] || 0);
    }, 0);
    const itemBudgetAmount = Number(row?.initialBudgetPlan || monthlyPlanTotal || 0);
    const budgetYear = String(
      row?.budgetYear ??
      row?.budget_year ??
      detectOperationalBudgetYear({ budgetCode, subject })
    ).trim();

    if (!current.subject && subject) current.subject = subject;
    if (!current.budgetYear && budgetYear) current.budgetYear = budgetYear;
    current.budgetPlanAmount += itemBudgetAmount;

    if (itemName) {
      const existingItem = current.items.find((item) => item.itemName === itemName);
      if (!existingItem) {
        current.items.push({
          itemName,
          subject: subject || itemName,
          budgetPlanAmount: itemBudgetAmount,
        });
      }
    }

    grouped.set(budgetCode, current);
  });

  return Array.from(grouped.values()).sort((left, right) => left.budgetCode.localeCompare(right.budgetCode));
}

function loadOperationalBudgetCatalog() {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(OPERATIONAL_BUDGET_STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return buildOperationalBudgetCatalog(parsed);
  } catch {
    return [];
  }
}

export default function OperationalBudgetSchedulePage() {
  const [year, setYear] = useState("2026");
  const [searchText, setSearchText] = useState("");
  const [items, setItems] = useState(() => loadStoredOperationalItems());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItemKey, setEditingItemKey] = useState("");
  const [editingStage, setEditingStage] = useState("Quotation");
  const [editingRowType, setEditingRowType] = useState("plan");
  const [form] = Form.useForm();
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [itemModalMode, setItemModalMode] = useState("add");
  const [itemEditingKey, setItemEditingKey] = useState("");
  const [itemForm] = Form.useForm();
  const [operationalBudgetCatalog, setOperationalBudgetCatalog] = useState(() => loadOperationalBudgetCatalog());
  const selectedBudgetCode = Form.useWatch("budgetCode", itemForm);
  const selectedBudgetYear = Form.useWatch("budgetYear", itemForm);

  const monthGroups = useMemo(() => buildMonthGroups(year), [year]);
  const operationalBudgetCatalogMap = useMemo(
    () => Object.fromEntries(operationalBudgetCatalog.map((entry) => [entry.budgetCode, entry])),
    [operationalBudgetCatalog]
  );
  const budgetCodeOptions = useMemo(
    () =>
      operationalBudgetCatalog
        .filter((entry) => !selectedBudgetYear || String(entry.budgetYear || "") === String(selectedBudgetYear))
        .map((entry) => ({
          label: entry.budgetCode,
          value: entry.budgetCode,
        })),
    [operationalBudgetCatalog, selectedBudgetYear]
  );
  const selectedBudgetCatalog = useMemo(
    () => operationalBudgetCatalogMap[selectedBudgetCode] || null,
    [operationalBudgetCatalogMap, selectedBudgetCode]
  );

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
  const borrowedIncomingTotalsByCode = useMemo(
    () =>
      items.reduce((acc, item) => {
        const budgetCode = String(item.budgetCode || "").trim();
        if (!budgetCode) return acc;
        acc[budgetCode] = Number(acc[budgetCode] || 0) + Number(item.borrowedAmount || 0);
        return acc;
      }, {}),
    [items]
  );
  const borrowedOutgoingTotalsByCode = useMemo(
    () =>
      items.reduce((acc, item) => {
        const sourceBudgetCode = String(item.borrowedFromBudgetCode || "").trim();
        if (!sourceBudgetCode) return acc;
        acc[sourceBudgetCode] = Number(acc[sourceBudgetCode] || 0) + Number(item.borrowedAmount || 0);
        return acc;
      }, {}),
    [items]
  );
  const outgoingTransferDetailsByCode = useMemo(
    () =>
      items.reduce((acc, item) => {
        const sourceBudgetCode = String(item.borrowedFromBudgetCode || "").trim();
        if (!sourceBudgetCode || Number(item.borrowedAmount || 0) <= 0) return acc;

        if (!acc[sourceBudgetCode]) acc[sourceBudgetCode] = [];
        acc[sourceBudgetCode].push({
          targetBudgetCode: String(item.budgetCode || "").trim(),
          amount: Number(item.borrowedAmount || 0),
          transferDate: item.transferDate || "",
          remark: item.borrowRemark || "",
        });
        return acc;
      }, {}),
    [items]
  );
  const actualBudgetTotalsByCode = useMemo(
    () =>
      items.reduce((acc, item) => {
        const budgetCode = String(item.budgetCode || "").trim();
        if (!budgetCode) return acc;
        acc[budgetCode] = Number(acc[budgetCode] || 0) + getEffectiveActualAmount(item);
        return acc;
      }, {}),
    [items]
  );
  const borrowSourceOptions = useMemo(
    () =>
      operationalBudgetCatalog
        .filter((entry) => entry.budgetCode !== editingItem?.budgetCode)
        .map((entry) => ({
          label: entry.budgetCode,
          value: entry.budgetCode,
        })),
    [editingItem, operationalBudgetCatalog]
  );
  const getBudgetPlanAmountByCode = useCallback(
    (budgetCode, fallbackAmount = 0) =>
      Number(operationalBudgetCatalogMap[budgetCode]?.budgetPlanAmount ?? fallbackAmount ?? 0),
    [operationalBudgetCatalogMap]
  );
  const getBudgetBalanceByCode = useCallback(
    (budgetCode, fallbackAmount = 0) =>
      getBudgetPlanAmountByCode(budgetCode, fallbackAmount) +
      Number(borrowedIncomingTotalsByCode[budgetCode] || 0) -
      Number(actualBudgetTotalsByCode[budgetCode] || 0) -
      Number(borrowedOutgoingTotalsByCode[budgetCode] || 0),
    [actualBudgetTotalsByCode, borrowedIncomingTotalsByCode, borrowedOutgoingTotalsByCode, getBudgetPlanAmountByCode]
  );

  const buildBudgetUsageMapsExcludingItem = (excludedItemKey = "") =>
    items.reduce(
      (acc, item) => {
        if (item.key === excludedItemKey) return acc;

        const budgetCode = String(item.budgetCode || "").trim();
        const sourceBudgetCode = String(item.borrowedFromBudgetCode || "").trim();

        if (budgetCode) {
          acc.actual[budgetCode] = Number(acc.actual[budgetCode] || 0) + Number(item.actualBudgetAmount || 0);
          acc.incoming[budgetCode] = Number(acc.incoming[budgetCode] || 0) + Number(item.borrowedAmount || 0);
        }

        if (sourceBudgetCode) {
          acc.outgoing[sourceBudgetCode] = Number(acc.outgoing[sourceBudgetCode] || 0) + Number(item.borrowedAmount || 0);
        }

        return acc;
      },
      { actual: {}, incoming: {}, outgoing: {} }
    );

  const validateActualBudgetChange = ({
    itemKey,
    targetBudgetCode,
    targetFallbackPlanAmount,
    nextActualAmount,
    requestedFromBudgetCode,
    requestedAmount,
  }) => {
    const usageMaps = buildBudgetUsageMapsExcludingItem(itemKey);
    const normalizedTargetBudgetCode = String(targetBudgetCode || "").trim();
    const normalizedSourceBudgetCode = String(requestedFromBudgetCode || "").trim();
    const normalizedRequestedAmount = Number(requestedAmount || 0);
    const normalizedActualAmount = Number(nextActualAmount || 0);
    const normalizedEffectiveActualAmount = normalizedActualAmount + normalizedRequestedAmount;
    const targetPlanAmount = getBudgetPlanAmountByCode(normalizedTargetBudgetCode, targetFallbackPlanAmount);

    const targetBalanceAfter =
      targetPlanAmount +
      Number(usageMaps.incoming[normalizedTargetBudgetCode] || 0) +
      normalizedRequestedAmount -
      Number(usageMaps.actual[normalizedTargetBudgetCode] || 0) -
      normalizedEffectiveActualAmount -
      Number(usageMaps.outgoing[normalizedTargetBudgetCode] || 0);

    if (targetBalanceAfter < 0) {
      return {
        ok: false,
        message: "Budget tidak cukup. Actual hanya bisa disimpan jika saldo cukup atau ada TF / minta budget dari budget lain.",
      };
    }

    if (normalizedRequestedAmount > 0) {
      const sourcePlanAmount = getBudgetPlanAmountByCode(normalizedSourceBudgetCode, 0);
      const sourceBalanceAfter =
        sourcePlanAmount +
        Number(usageMaps.incoming[normalizedSourceBudgetCode] || 0) -
        Number(usageMaps.actual[normalizedSourceBudgetCode] || 0) -
        Number(usageMaps.outgoing[normalizedSourceBudgetCode] || 0) -
        normalizedRequestedAmount;

      if (sourceBalanceAfter < 0) {
        return {
          ok: false,
          message: `Budget sumber ${normalizedSourceBudgetCode} tidak cukup untuk TF / permintaan budget ini.`,
        };
      }
    }

    return { ok: true };
  };

  const filteredItems = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    return items
      .map((item, originalIndex) => ({ item, originalIndex }))
      .filter(({ item }) => {
        const matchesYear = item.budgetYear === year;
        const matchesQuery =
          !query ||
          [item.budgetCode, item.subject, item.itemName].some((field) =>
            String(field).toLowerCase().includes(query)
          );
        return matchesYear && matchesQuery;
      })
      .sort((left, right) => {
        const budgetCodeCompare = String(left.item.budgetCode || "").localeCompare(String(right.item.budgetCode || ""), undefined, {
          numeric: true,
          sensitivity: "base",
        });

        if (budgetCodeCompare !== 0) return budgetCodeCompare;
        return left.originalIndex - right.originalIndex;
      })
      .map(({ item }) => item);
  }, [items, searchText, year]);

  const templateCatalogRows = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    return operationalBudgetCatalog
      .filter((entry) => String(entry.budgetYear || "") === String(year))
      .filter((entry) => {
        if (!query) return true;
        return [entry.budgetCode, entry.subject].some((field) =>
          String(field || "").toLowerCase().includes(query)
        );
      })
      .map((entry, index) => ({
        key: `template-${entry.budgetCode}`,
        no: index + 1,
        budgetCode: entry.budgetCode,
        subject: entry.subject,
        itemName: "",
        poTime: "",
        allocation: "",
        budgetYear: "",
        currentStage: "All",
        budgetPlanAmount: 0,
        actualBudgetAmount: 0,
        balanceAmount: 0,
        borrowedFromBudgetCode: "",
        borrowedAmount: 0,
        transferDate: "",
        borrowPurpose: "",
        borrowRemark: "",
        rowType: "plan",
        isTemplateRow: true,
        stages: {},
      }));
  }, [operationalBudgetCatalog, searchText, year]);

  const tableRows = useMemo(() => {
    if (filteredItems.length === 0) {
      return templateCatalogRows.flatMap((item) => [
        { ...item, rowType: "plan", rowKey: `${item.key}-plan` },
        { ...item, rowType: "actual", rowKey: `${item.key}-actual` },
      ]);
    }

    return filteredItems.flatMap((item) => [
      { ...item, rowType: "plan", rowKey: `${item.key}-plan` },
      { ...item, rowType: "actual", rowKey: `${item.key}-actual` },
    ]);
  }, [filteredItems, templateCatalogRows]);

  const budgetGroupMeta = useMemo(() => {
    const meta = {};
    let groupNumber = 0;

    for (let index = 0; index < tableRows.length; index += 1) {
      const currentRow = tableRows[index];
      const previousRow = tableRows[index - 1];
      if (currentRow?.isSummaryRow) continue;

      const isGroupStart =
        index === 0 ||
        previousRow?.isSummaryRow ||
        previousRow?.budgetCode !== currentRow?.budgetCode;

      if (!isGroupStart) continue;

      groupNumber += 1;
      let rowSpan = 1;
      for (let cursor = index + 1; cursor < tableRows.length; cursor += 1) {
        if (tableRows[cursor]?.isSummaryRow || tableRows[cursor]?.budgetCode !== currentRow?.budgetCode) break;
        rowSpan += 1;
      }

      meta[currentRow.rowKey] = {
        rowSpan,
        groupNumber,
      };
    }

    return meta;
  }, [tableRows]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      window.localStorage.setItem(
        OPERATIONAL_BUDGET_SCHEDULE_STORAGE_KEY,
        JSON.stringify(items)
      );
    } catch {
      // Ignore persistence issues and keep UI functional.
    }
  }, [items]);

  useEffect(() => {
    if (!selectedBudgetCatalog) return;

    itemForm.setFieldsValue({
      subject: selectedBudgetCatalog.subject || "",
      budgetPlanAmount: selectedBudgetCatalog.budgetPlanAmount || 0,
    });
  }, [itemForm, selectedBudgetCatalog]);

  useEffect(() => {
    const currentBudgetCode = itemForm.getFieldValue("budgetCode");
    if (!currentBudgetCode) return;

    const matchedBudget = operationalBudgetCatalog.find((entry) => entry.budgetCode === currentBudgetCode);
    if (!matchedBudget || String(matchedBudget.budgetYear || "") === String(selectedBudgetYear || "")) return;

    itemForm.setFieldsValue({
      budgetCode: undefined,
      subject: "",
      itemName: "",
      budgetPlanAmount: 0,
    });
  }, [itemForm, operationalBudgetCatalog, selectedBudgetYear]);

  useEffect(() => {
    if (!editingItem) return;
    const stageData = editingItem.stages?.[editingStage] || { plan: {}, actual: {} };
    const planStart = parseWeekKey(stageData.plan?.start);
    const planEnd = parseWeekKey(stageData.plan?.end);
    const actualStart = parseWeekKey(stageData.actual?.start);
    const actualEnd = parseWeekKey(stageData.actual?.end);

    form.setFieldsValue({
      budgetYear: editingItem.budgetYear,
      planBudgetAmount: editingItem.budgetPlanAmount,
      actualBudgetAmount: editingItem.actualBudgetAmount,
      borrowedFromBudgetCode: editingItem.borrowedFromBudgetCode || undefined,
      borrowedAmount: editingItem.borrowedAmount || 0,
      transferDate: editingItem.transferDate || "",
      borrowPurpose: editingItem.borrowPurpose || "",
      borrowRemark: editingItem.borrowRemark || "",
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
    setOperationalBudgetCatalog(loadOperationalBudgetCatalog());
    setItemModalMode(mode);
    setItemEditingKey(item?.key || "");
    setIsItemModalOpen(true);

    if (mode === "edit" && item) {
      itemForm.setFieldsValue({
        budgetCode: item.budgetCode,
        subject: item.subject,
        itemName: item.itemName,
        budgetPlanAmount: item.budgetPlanAmount,
        poTime: normalizePoTimeValue(item.poTime) ? dayjs(`${normalizePoTimeValue(item.poTime)}-01`) : null,
        allocation: item.allocation,
        budgetYear: item.budgetYear,
        currentStage: item.currentStage,
      });
      return;
    }

    itemForm.setFieldsValue({
      budgetCode: item?.budgetCode || "",
      subject: item?.subject || "",
      itemName: "",
      budgetPlanAmount: 0,
      poTime: dayjs(`${year}-01-01`),
      allocation: "Normal",
      budgetYear: item?.budgetYear || year,
      currentStage: "All",
    });
  };

  const closeItemModal = () => {
    setIsItemModalOpen(false);
    setItemEditingKey("");
    itemForm.resetFields();
  };

  const handleUpdateSave = async () => {
    const values = await form.validateFields();

    if (editingRowType === "actual" && editingItem) {
      const validation = validateActualBudgetChange({
        itemKey: editingItem.key,
        targetBudgetCode: editingItem.budgetCode,
        targetFallbackPlanAmount: editingItem.budgetPlanAmount,
        nextActualAmount: values.actualBudgetAmount,
        requestedFromBudgetCode: values.borrowedFromBudgetCode,
        requestedAmount: values.borrowedAmount,
      });

      if (!validation.ok) {
        message.error(validation.message);
        return;
      }
    }

    setItems((current) =>
      current.map((item) => {
        if (item.key !== editingItemKey) return item;

        return {
          ...item,
          budgetYear: values.budgetYear,
          actualBudgetAmount:
            editingRowType === "actual"
              ? Number(values.actualBudgetAmount || 0)
              : item.actualBudgetAmount,
          borrowedFromBudgetCode:
            editingRowType === "actual"
              ? String(values.borrowedFromBudgetCode || "").trim()
              : item.borrowedFromBudgetCode,
          borrowedAmount:
            editingRowType === "actual"
              ? Number(values.borrowedAmount || 0)
              : item.borrowedAmount,
          transferDate:
            editingRowType === "actual"
              ? (Number(values.borrowedAmount || 0) > 0 ? dayjs().format("DD/MM/YYYY") : "")
              : item.transferDate,
          borrowPurpose:
            editingRowType === "actual"
              ? String(values.borrowPurpose || "")
              : item.borrowPurpose,
          borrowRemark:
            editingRowType === "actual"
              ? String(values.borrowRemark || "")
              : item.borrowRemark,
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
          actualBudgetAmount:
            editingRowType === "actual"
              ? 0
              : item.actualBudgetAmount,
          borrowedFromBudgetCode:
            editingRowType === "actual"
              ? ""
              : item.borrowedFromBudgetCode,
          borrowedAmount:
            editingRowType === "actual"
              ? 0
              : item.borrowedAmount,
          transferDate:
            editingRowType === "actual"
              ? ""
              : item.transferDate,
          borrowPurpose:
            editingRowType === "actual"
              ? ""
              : item.borrowPurpose,
          borrowRemark:
            editingRowType === "actual"
              ? ""
              : item.borrowRemark,
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
    const normalizedPoTime = values.poTime ? dayjs(values.poTime).format("YYYY-MM") : "";
    const automaticStages = buildAutomaticStages(normalizedPoTime);
    const budgetMeta = operationalBudgetCatalogMap[values.budgetCode] || null;
    const resolvedSubject = budgetMeta?.subject || values.subject;
    const resolvedBudgetPlanAmount = Number(budgetMeta?.budgetPlanAmount ?? values.budgetPlanAmount ?? 0);

    if (itemModalMode === "edit" && itemEditing) {
      setItems((current) =>
        current.map((item) =>
          item.key === itemEditing.key
            ? {
                ...item,
                budgetCode: values.budgetCode,
                subject: resolvedSubject,
                itemName: values.itemName,
                budgetPlanAmount: resolvedBudgetPlanAmount,
                poTime: normalizedPoTime,
                allocation: values.allocation,
                budgetYear: values.budgetYear,
                currentStage: "All",
                actualBudgetAmount: item.actualBudgetAmount,
                borrowedFromBudgetCode: item.borrowedFromBudgetCode || "",
                borrowedAmount: Number(item.borrowedAmount || 0),
                transferDate: item.transferDate || "",
                borrowPurpose: item.borrowPurpose || "",
                borrowRemark: item.borrowRemark || "",
                stages: {
                  ...automaticStages,
                  ...Object.fromEntries(
                    EDIT_STAGE_OPTIONS.map((stage) => [
                      stage,
                      {
                        plan: automaticStages[stage]?.plan || { start: "", end: "" },
                        actual: item.stages?.[stage]?.actual || { start: "", end: "" },
                      },
                    ])
                  ),
                },
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
          subject: resolvedSubject,
          itemName: values.itemName,
          budgetPlanAmount: resolvedBudgetPlanAmount,
          actualBudgetAmount: 0,
          borrowedFromBudgetCode: "",
          borrowedAmount: 0,
          transferDate: "",
          borrowPurpose: "",
          borrowRemark: "",
          poTime: normalizedPoTime,
          allocation: values.allocation,
          budgetYear: values.budgetYear,
          currentStage: "All",
          stages: automaticStages,
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
          timingState:
            mode === "actual"
              ? isOnTime
                ? "on-time"
                : startIndex < (yearWeekIndexMap[planRange.start] ?? Number.MAX_SAFE_INTEGER)
                  ? "advance"
                  : "delay"
              : "plan",
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
    <div className={`budget-monitoring__cell-text budget-monitoring__cell-text--merged ${className}`.trim()}>{value || ""}</div>
  );

  const renderSummaryAmount = (label, value) => (
    <div className="budget-monitoring__summary-line">
      <span>{label}</span>
      <strong>{formatCurrency(value)}</strong>
    </div>
  );

  const mergeTopOnly = (value, row, index, className = "") => {
    if (row.isSummaryRow) {
      return {
        children: <div className={`budget-monitoring__cell-text budget-monitoring__summary-text ${className}`.trim()}>{value || ""}</div>,
        props: { rowSpan: 1 },
      };
    }

    return {
      children: index % 2 === 0 ? renderMergedText(value, className) : "",
      props: { rowSpan: index % 2 === 0 ? 2 : 0 },
    };
  };

  const mergeBudgetGroupCell = (record, value, className = "") => {
    if (record.isSummaryRow) {
      return {
        children: <div className={`budget-monitoring__cell-text budget-monitoring__summary-text ${className}`.trim()}>{value || ""}</div>,
        props: { rowSpan: 1 },
      };
    }

    const meta = budgetGroupMeta[record.rowKey];
    if (!meta) {
      return {
        children: "",
        props: { rowSpan: 0 },
      };
    }

    return {
      children: renderMergedText(value, className),
      props: { rowSpan: meta.rowSpan },
    };
  };

  const renderTransferBudgetInfo = (record) => {
    if (!(Number(record.borrowedAmount || 0) > 0)) return null;

    return (
      <Popover
        trigger={["hover", "click"]}
        placement="topRight"
        content={(
          <div className="budget-monitoring__transfer-popover">
            <div><strong>TF/Minta dari:</strong> {record.borrowedFromBudgetCode || "-"}</div>
            <div><strong>Nominal:</strong> {formatCurrency(record.borrowedAmount)}</div>
            <div><strong>Tanggal:</strong> {record.transferDate || "-"}</div>
            <div><strong>Untuk:</strong> {record.borrowPurpose || "-"}</div>
            <div><strong>Remark:</strong> {record.borrowRemark || "-"}</div>
          </div>
        )}
      >
        <button type="button" className="budget-monitoring__transfer-trigger" aria-label="Lihat detail transfer budget">
          <InfoCircleOutlined />
        </button>
      </Popover>
    );
  };

  const renderSourceTransferInfo = (budgetCode) => {
    const transferDetails = outgoingTransferDetailsByCode[budgetCode] || [];
    if (!transferDetails.length) return null;

    return (
      <Popover
        trigger={["hover", "click"]}
        placement="topRight"
        content={(
          <div className="budget-monitoring__transfer-popover">
            {transferDetails.map((detail, index) => (
              <div key={`${detail.targetBudgetCode}-${detail.amount}-${index}`} className="budget-monitoring__transfer-popover-item">
                <div><strong>Diambil/TF ke:</strong> {detail.targetBudgetCode || "-"}</div>
                <div><strong>Nominal:</strong> {formatCurrency(detail.amount)}</div>
                <div><strong>Tanggal:</strong> {detail.transferDate || "-"}</div>
                <div><strong>Remark:</strong> {detail.remark || "-"}</div>
              </div>
            ))}
          </div>
        )}
      >
        <button type="button" className="budget-monitoring__transfer-trigger" aria-label="Lihat riwayat transfer budget">
          <InfoCircleOutlined />
        </button>
      </Popover>
    );
  };

  const columns = [
    {
      title: "No",
      dataIndex: "no",
      key: "no",
      width: 58,
      fixed: "left",
      align: "center",
      render: (_, record) =>
        mergeBudgetGroupCell(
          record,
          record.isSummaryRow ? "" : budgetGroupMeta[record.rowKey]?.groupNumber || "",
          "budget-monitoring__cell-text--center"
        ),
    },
    {
      title: "No Budget",
      dataIndex: "budgetCode",
      key: "budgetCode",
      width: 110,
      fixed: "left",
      render: (value, record) =>
        mergeBudgetGroupCell(
          record,
          record.isSummaryRow ? (record.isGrandTotalRow ? "GRAND TOTAL" : `TOTAL ${value}`) : value,
          "budget-monitoring__cell-text--nowrap"
        ),
    },
    {
      title: "Subject",
      dataIndex: "subject",
      key: "subject",
      width: 150,
      fixed: "left",
      render: (value, record) => mergeBudgetGroupCell(record, record.isSummaryRow ? "" : value),
    },
    {
      title: "Items",
      dataIndex: "itemName",
      key: "itemName",
      width: 260,
      fixed: "left",
      render: (value, row, index) => ({
        children:
          row.isSummaryRow ? (
            <div className="budget-monitoring__item budget-monitoring__summary-text">
              {row.isGrandTotalRow ? "Total keseluruhan seluruh No Budget" : `Subtotal ${row.budgetCode}`}
            </div>
          ) : index % 2 === 0 ? (
            <div className="budget-monitoring__item budget-monitoring__item--merged">
              {row.isTemplateRow ? "" : value || ""}
            </div>
          ) : "",
        props: { rowSpan: row.isSummaryRow ? 1 : index % 2 === 0 ? 2 : 0 },
      }),
    },

    {
      title: "PO Time",
      dataIndex: "poTime",
      key: "poTime",
      width: 92,
      fixed: "left",
      align: "center",
      render: (value, row, index) => mergeTopOnly(row.isTemplateRow ? "" : formatPoTime(value), row, index, "budget-monitoring__cell-text--nowrap"),
    },
    {
      title: "Alokasi",
      dataIndex: "allocation",
      key: "allocation",
      width: 90,
      fixed: "left",
      align: "center",
      render: (value, row, index) => mergeTopOnly(row.isTemplateRow ? "" : value, row, index, "budget-monitoring__cell-text--nowrap"),
    },
    {
      title: "Status",
      key: "status",
      width: 140,
      fixed: "left",
      align: "center",
      render: (_, record, index) => ({
        children:
          record.isSummaryRow
            ? ""
            : index % 2 === 0 && !record.isTemplateRow
              ? <span className="budget-monitoring__status">{getAutomaticStatus(record)}</span>
              : "",
        props: { rowSpan: record.isSummaryRow ? 1 : index % 2 === 0 ? 2 : 0 },
      }),
    },
    {
      title: "Budget Year",
      dataIndex: "budgetYear",
      key: "budgetYear",
      width: 100,
      fixed: "left",
      align: "center",
      render: (value, record) =>
        mergeBudgetGroupCell(record, record.isTemplateRow || record.isSummaryRow ? "" : value, "budget-monitoring__cell-text--nowrap"),
    },
    {
      title: "Type",
      dataIndex: "rowType",
      key: "rowType",
      width: 80,
      fixed: "left",
      align: "center",
      render: (value, record) =>
        record.isTemplateRow ? "" : <span className={`budget-monitoring__type budget-monitoring__type--${value}`}>{record.isSummaryRow ? "TOTAL" : value.toUpperCase()}</span>,
    },
        {
      title: "Budget",
      dataIndex: "budgetPlanAmount",
      key: "budgetAmount",
      width: 130,
      fixed: "left",
      align: "right",
      onHeaderCell: () => ({ style: { textAlign: "center" } }),
      render: (_, record) => {
        if (record.isTemplateRow) return "";
        if (record.isSummaryRow) {
          return (
            <div className="budget-monitoring__summary-stack">
              {renderSummaryAmount("Plan", record.budgetPlanAmount)}
              {renderSummaryAmount("Actual", record.actualBudgetAmount)}
            </div>
          );
        }
        const amount =
          record.rowType === "plan"
            ? getBudgetPlanAmountByCode(record.budgetCode, record.budgetPlanAmount)
            : getEffectiveActualAmount(record);
        return (
          <span className="budget-monitoring__money">
            {formatCurrency(amount)}
            {record.rowType === "actual" ? renderTransferBudgetInfo(record) : null}
          </span>
        );
      },
    },
    {
      title: "Balance",
      key: "balanceAmount",
      width: 130,
      fixed: "left",
      align: "right",
      onHeaderCell: () => ({ style: { textAlign: "center" } }),
      render: (_, record) => ({
        children:
          record.isSummaryRow ? (
            <div className="budget-monitoring__summary-stack">
              {renderSummaryAmount("Balance", record.balanceAmount)}
            </div>
          ) : budgetGroupMeta[record.rowKey] && !record.isTemplateRow ? (
            <span className="budget-monitoring__money budget-monitoring__money--merged">
              {formatCurrency(getBudgetBalanceByCode(record.budgetCode, record.budgetPlanAmount))}
              {renderSourceTransferInfo(record.budgetCode)}
            </span>
          ) : "",
        props: { rowSpan: record.isSummaryRow ? 1 : budgetGroupMeta[record.rowKey]?.rowSpan || 0 },
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
          render: (_, record) => (record.isTemplateRow || record.isSummaryRow) ? <div className="budget-monitoring__week-cell" /> : renderTimelineCell(record, cellKey),
        };
      }),
    })),
    {
      title: "Action",
      key: "action",
      fixed: "right",
      width: 120,
      align: "center",
      className: "budget-monitoring__action-col",
      render: (_, record, index) => ({
        children:
          record.isSummaryRow ? (
            ""
          ) : index % 2 === 0 ? (
            <Space size={4} className="budget-monitoring__action-space">
              {record.isTemplateRow ? (
                <Button size="small" type="primary" icon={<PlusOutlined />} onClick={() => openItemModal("add", record)}>
                  Add
                </Button>
              ) : (
                <>
                  <Button size="small" icon={<EditOutlined />} onClick={() => openItemModal("edit", record)} />
                  <Popconfirm
                    title="Hapus item ini?"
                    okText="Hapus"
                    cancelText="Batal"
                    onConfirm={() => handleDeleteItem(record.key)}
                  >
                    <Button size="small" danger icon={<DeleteOutlined />} />
                  </Popconfirm>
                </>
              )}
            </Space>
          ) : (
            ""
          ),
        props: { rowSpan: record.isSummaryRow ? 1 : index % 2 === 0 ? 2 : 0 },
      }),
    },
  ];

  return (
    <div className="budget-schedule-page">
      <div className="schedule-header">
        <div className="schedule-header__title">
          <div className="schedule-header__icon">
            <CalendarOutlined />
          </div>
          <div>
            <Title level={3} className="schedule-title"
            style={{ fontWeight: 700 }}>Monitoring Progress Budget Operational</Title>
          </div>
        </div>

        <Space size="middle" wrap>
          <Input
            placeholder="Cari budget / item..."
            prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 260 }}
          />
          <Select value={year} onChange={setYear} style={{ width: 110 }}>
            <Option value="2025">2025</Option>
            <Option value="2026">2026</Option>
            <Option value="2027">2027</Option>
            <Option value="2028">2028</Option>
            <Option value="2029">2029</Option>
            <Option value="2030">2030</Option>
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
          scroll={{ x: "max-content", y: 800 }}
          bordered
          size="small"
          className="timeline-table timeline-table--excel"
          rowClassName={(record) => `budget-monitoring__row budget-monitoring__row--${record.rowType}`}
        />
      </div>

      <Modal
        open={isItemModalOpen}
        title={itemModalMode === "edit" ? "Edit Budget Item" : "Add Budget Item"}
        onCancel={closeItemModal}
        onOk={handleItemSave}
        okText="Simpan"
        cancelText="Batal"
        destroyOnHidden
        width={760}
      >
        <Form form={itemForm} layout="vertical">
          <div className="budget-monitoring__form-grid">
            <Form.Item name="budgetCode" label="No Budget" rules={[{ required: true, message: "Wajib isi no budget" }]}>
              <Select
                showSearch
                placeholder="Pilih budget code dari operational budget"
                optionFilterProp="label"
                options={budgetCodeOptions}
              />
            </Form.Item>
            <Form.Item name="budgetYear" label="Budget Year" rules={[{ required: true, message: "Wajib isi budget year" }]}>
              <Select
                options={["2025", "2026", "2027", "2028", "2029", "2030"].map((option) => ({ label: option, value: option }))}
              />
            </Form.Item>
            <Form.Item name="subject" label="Subject" rules={[{ required: true, message: "Wajib isi subject" }]}>
              <Input disabled />
            </Form.Item>
            <Form.Item name="itemName" label="Items" rules={[{ required: true, message: "Wajib isi items" }]}>
              <Input
                placeholder={
                  selectedBudgetCatalog?.items?.length
                    ? `Contoh item budget operasional: ${selectedBudgetCatalog.items.slice(0, 2).map((entry) => entry.itemName).join(", ")}`
                    : ""
                }
              />
            </Form.Item>
            <Form.Item name="budgetPlanAmount" label="Budget Plan (IDR)" rules={[{ required: true, message: "Wajib isi budget plan" }]}>
              <InputNumber style={{ width: "100%" }} min={0} disabled />
            </Form.Item>
            <Form.Item name="poTime" label="PO Time" rules={[{ required: true, message: "Wajib isi PO time" }]}>
              <DatePicker
                picker="month"
                format={MONTH_PICKER_FORMAT}
                style={{ width: "100%" }}
                allowClear={false}
              />
            </Form.Item>
            <Form.Item name="allocation" label="Alokasi" rules={[{ required: true, message: "Wajib isi alokasi" }]}>
              <Select
                options={[
                  { label: "Normal", value: "Normal" },
                  { label: "Urgent", value: "Urgent" },
                ]}
              />
            </Form.Item>
            <Form.Item name="currentStage" label="Stage Default" rules={[{ required: true, message: "Pilih stage" }]}>
              <Select disabled options={[{ label: "All", value: "All" }]} />
            </Form.Item>
          </div>
        </Form>
      </Modal>

      <Modal
        open={isModalOpen}
        title={`Update Tanggal Stage ${editingRowType.toUpperCase()}`}
        onCancel={closeUpdateModal}
        onOk={handleUpdateSave}
        okText="Simpan"
        cancelText="Batal"
        destroyOnHidden
        width={760}
        footer={(
          <>
            <Button danger onClick={handleDeleteStageBlock}>
              Delete {editingRowType.toUpperCase()}
            </Button>
            <Button onClick={closeUpdateModal}>Batal</Button>
            <Button type="primary" onClick={handleUpdateSave}>Simpan</Button>
          </>
        )}
      >
        <Form form={form} layout="vertical">
          <div className="budget-monitoring__form-grid">
            <Form.Item name="budgetYear" label="Budget Year" rules={[{ required: true, message: "Wajib isi tahun budget" }]}>
              <Select options={["2025", "2026", "2027", "2028", "2029", "2030"].map((option) => ({ label: option, value: option }))} />
            </Form.Item>
            {editingRowType === "actual" ? (
              <Form.Item name="actualBudgetAmount" label="Budget Actual (IDR)" rules={[{ required: true, message: "Wajib isi budget actual" }]}>
                <InputNumber style={{ width: "100%" }} min={0} />
              </Form.Item>
            ) : (
              <Form.Item name="planBudgetAmount" label="Budget Plan (IDR)">
                <InputNumber style={{ width: "100%" }} min={0} disabled />
              </Form.Item>
            )}
            <Form.Item name="currentStage" label="Stage Yang Ditampilkan" rules={[{ required: true, message: "Pilih stage" }]}>
              <Select options={STAGE_OPTIONS.map((stage) => ({ label: stage, value: stage }))} />
            </Form.Item>
            <Form.Item name="stageToEdit" label="Stage Yang Diupdate" rules={[{ required: true, message: "Pilih stage update" }]}>
              <Select options={EDIT_STAGE_OPTIONS.map((stage) => ({ label: stage, value: stage }))} />
            </Form.Item>
          </div>

          {editingRowType !== "actual" && (
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
          )}

          {editingRowType !== "plan" && (
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
                <Form.Item
                  name="borrowedFromBudgetCode"
                  label="Minta Dari Budget"
                  rules={[
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        const borrowedAmount = Number(getFieldValue("borrowedAmount") || 0);
                        if (borrowedAmount > 0 && !value) {
                          return Promise.reject(new Error("Pilih budget sumber"));
                        }
                        return Promise.resolve();
                      },
                    }),
                  ]}
                >
                  <Select
                    allowClear
                    showSearch
                    placeholder="Opsional jika actual minta dari budget lain"
                    optionFilterProp="label"
                    options={borrowSourceOptions}
                  />
                </Form.Item>
                <Form.Item name="borrowedAmount" label="Nominal Minta Budget (IDR)">
                  <InputNumber style={{ width: "100%" }} min={0} />
                </Form.Item>
                <Form.Item
                  name="borrowPurpose"
                  label="Dipakai Untuk"
                  rules={[
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        const borrowedAmount = Number(getFieldValue("borrowedAmount") || 0);
                        if (borrowedAmount > 0 && !String(value || "").trim()) {
                          return Promise.reject(new Error("Isi tujuan penggunaan budget"));
                        }
                        return Promise.resolve();
                      },
                    }),
                  ]}
                >
                  <Input placeholder="Contoh: kekurangan budget item operational" />
                </Form.Item>
                <Form.Item name="borrowRemark" label="Remark Permintaan Budget">
                  <Input.TextArea rows={2} placeholder="Catatan tambahan permintaan budget" />
                </Form.Item>
              </div>
            </div>
          )}
        </Form>
      </Modal>
    </div>
  );
}

// fe\src\modules\itam\assets\hooks\useAssetExcel.js
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { groupAssetsByWorkbookTabs, getAssetWorkbookTabs } from "../utils/assetWorkbookTabs";

const SHEET_TYPE_CODE_MAP = {
  PC: "PC",
  CCTV: "CCTV",
  GATHERING: "GATHERING",
  SCANNER: "SCANNER",
  ACCESSDOOR: "ACCESSDOOR",
  LAINNYA: "",
};

const EXCEL_HEADERS = [
  "NO ASSET",
  "NAMA ASET",
  "TYPE CODE",
  "TYPE",
  "DIVISI",
  "DEPT",
  "NAMA PIC",
  "NIK",
  "PEMBELIAN",
  "DEPRESIASI (5+1 Th)",
  "HOSTNAME",
  "IP ADDRESS MAIN",
  "IP ADDRESS BACKUP",
  "STATUS",
];

const TEMPLATE_HEADERS = [
  "NO",
  "NO ASSET",
  "TYPE",
  "DIVISI",
  "DEPT",
  "NAMA",
  "NIK",
  "PEMBELIAN",
  "DEPRESIASI (5+1 Th)",
  "HOSTNAME",
  "IP ADDRESS MAIN",
  "IP ADDRESS BACKUP",
  "STATUS",
];

const SOFTWARE_TEMPLATE_HEADERS = [
  "NO",
  "LICENSE NO",
  "DESCRIPTION",
  "FUNCTION",
  "QTY",
  "DEPT",
  "TYPE",
  "VENDOR",
  "PEMBELIAN",
  "LAST RENEW",
  "Next Renewal (MM/YYYY)",
  "Status",
];

const TAB_TEMPLATE_HEADERS = {
  cctv: [
    "NO",
    "HOSTNAME",
    "NO.ASSET",
    "TYPE",
    "DIVISI",
    "DEPT",
    "NAMA",
    "NIK",
    "Pembelian",
    "Depresiasi (5+1 Tahun)",
    "IP ADDRESS MAIN",
    "IP ADDRESS BACKUP",
    "Status",
  ],
  gathering: [
    "NO",
    "NO.ASSET",
    "TYPE",
    "DIVISI",
    "DEPT",
    "NAMA",
    "NIK",
    "Pembelian",
    "Depresiasi (5+1 Tahun)",
    "HOSTNAME",
    "IP ADDRESS MAIN",
    "IP ADDRESS BACKUP",
    "Status",
  ],
};

const STRUCTURED_TEMPLATE_TABS = new Set(["gathering"]);

function getTemplateHeadersForTab(tab = {}) {
  const tabKey = String(tab?.key || "").trim().toLowerCase();
  return TAB_TEMPLATE_HEADERS[tabKey] || TEMPLATE_HEADERS;
}

function isStructuredTemplateTab(tab = {}) {
  const tabKey = String(tab?.key || "").trim().toLowerCase();
  return STRUCTURED_TEMPLATE_TABS.has(tabKey);
}

function mapRowToExcel(item, fallbackType = "", fallbackTypeCode = "") {
  return {
    "NO ASSET": item.asset_code || "",
    "NAMA ASET": item.asset_name || "",
    "TYPE CODE": item.type_code || fallbackTypeCode || "",
    TYPE: item.category?.category_name || item.type || fallbackType || "",
    DIVISI: item.division || "",
    DEPT: item.department || "",
    "NAMA PIC": item.owner_name || "",
    NIK: item.nik || "",
    PEMBELIAN: item.purchase_date || "",
    "DEPRESIASI (5+1 Th)": item.depreciation_date || "",
    HOSTNAME: item.hostname || "",
    "IP ADDRESS MAIN": item.ip_main || "",
    "IP ADDRESS BACKUP": item.ip_backup || "",
    STATUS: item.status || "ACTIVE",
  };
}

function mapRowToTemplate(item, fallbackType = "", fallbackTypeCode = "") {
  return {
    NO: item.no || "",
    "NO ASSET": item.asset_code || "",
    TYPE: item.type || fallbackType || "",
    DIVISI: item.division || "",
    DEPT: item.department || "",
    NAMA: item.owner_name || "",
    NIK: item.nik || "",
    PEMBELIAN: item.purchase_date || "",
    "DEPRESIASI (5+1 Th)": item.depreciation_date || "",
    HOSTNAME: item.hostname || "",
    "IP ADDRESS MAIN": item.ip_main || "",
    "IP ADDRESS BACKUP": item.ip_backup || "",
    STATUS: item.status || "ACTIVE",
  };
}

function mapRowToSoftwareTemplate(item, fallbackType = "") {
  return {
    NO: item.no || "",
    "LICENSE NO": item.serial_number || item.asset_code || "",
    DESCRIPTION: item.asset_name || "",
    FUNCTION: item.division || "",
    QTY: item.qty || "",
    DEPT: item.department || "",
    TYPE: item.type || fallbackType || "",
    VENDOR: item.owner_name || "",
    PEMBELIAN: item.purchase_date || "",
    "LAST RENEW": item.last_renew || "",
    "Next Renewal (MM/YYYY)": item.depreciation_date || "",
    Status: item.status || "ACTIVE",
  };
}

function mapRowToTabTemplate(item, tab = {}) {
  const tabKey = String(tab?.key || "").trim().toLowerCase();

  if (tabKey === "pc") {
    return {
      NO: item.no || "",
      "NO ASSET": item.asset_code || "",
      TYPE: item.type || "",
      DIVISI: item.division || "",
      DEPT: item.department || "",
      NAMA: item.owner_name || "",
      NIK: item.nik || "",
      PEMBELIAN: item.purchase_date || "",
      "DEPRESIASI (5+1 Th)": item.depreciation_date || "",
      HOSTNAME: item.hostname || "",
      "IP ADDRESS MAIN": item.ip_main || "",
      "IP ADDRESS BACKUP": item.ip_backup || "",
      STATUS: item.status || "ACTIVE",
    };
  }

  if (tabKey === "scanner") {
    return {
      NO: item.no || "",
      "NO ASSET": item.asset_code || "",
      TYPE: item.type || "SCANNER",
      DIVISI: item.division || "",
      DEPT: item.department || "",
      NAMA: item.owner_name || "",
      NIK: item.nik || "",
      PEMBELIAN: item.purchase_date || "",
      "DEPRESIASI (5+1 Th)": item.depreciation_date || "",
      HOSTNAME: item.hostname || "",
      "IP ADDRESS MAIN": item.ip_main || "",
      "IP ADDRESS BACKUP": item.ip_backup || "",
      STATUS: item.status || "ACTIVE",
    };
  }

  if (tabKey === "accessdoor") {
    return {
      NO: item.no || "",
      "NO ASSET": item.asset_code || "",
      TYPE: item.type || "ACCESSDOOR",
      DIVISI: item.division || "",
      DEPT: item.department || "",
      NAMA: item.owner_name || "",
      NIK: item.nik || "",
      PEMBELIAN: item.purchase_date || "",
      "DEPRESIASI (5+1 Th)": item.depreciation_date || "",
      HOSTNAME: item.hostname || "",
      "IP ADDRESS MAIN": item.ip_main || "",
      "IP ADDRESS BACKUP": item.ip_backup || "",
      STATUS: item.status || "ACTIVE",
    };
  }

  if (tabKey === "lainnya") {
    return {
      NO: item.no || "",
      "NO ASSET": item.asset_code || "",
      TYPE: item.type || "LAINNYA",
      DIVISI: item.division || "",
      DEPT: item.department || "",
      NAMA: item.owner_name || "",
      NIK: item.nik || "",
      PEMBELIAN: item.purchase_date || "",
      "DEPRESIASI (5+1 Th)": item.depreciation_date || "",
      HOSTNAME: item.hostname || "",
      "IP ADDRESS MAIN": item.ip_main || "",
      "IP ADDRESS BACKUP": item.ip_backup || "",
      STATUS: item.status || "ACTIVE",
    };
  }

  if (tabKey === "cctv") {
    return {
      NO: item.no || "",
      HOSTNAME: item.hostname || "",
      "NO.ASSET": item.asset_code || "",
      TYPE: item.type || "CCTV",
      DIVISI: item.division || "",
      DEPT: item.department || "",
      NAMA: item.owner_name || "",
      NIK: item.nik || "",
      Pembelian: item.purchase_date || "",
      "Depresiasi (5+1 Tahun)": item.depreciation_date || "",
      "IP ADDRESS MAIN": item.ip_main || "",
      "IP ADDRESS BACKUP": item.ip_backup || "",
      Status: item.status || "ACTIVE",
    };
  }

  if (tabKey === "gathering") {
    return {
      NO: item.no || "",
      "NO.ASSET": item.asset_code || "",
      TYPE: item.type || "GATHERING",
      DIVISI: item.division || "",
      DEPT: item.department || "",
      NAMA: item.owner_name || "",
      NIK: item.nik || "",
      Pembelian: item.purchase_date || "",
      "Depresiasi (5+1 Tahun)": item.depreciation_date || "",
      HOSTNAME: item.hostname || "",
      "IP ADDRESS MAIN": item.ip_main || "",
      "IP ADDRESS BACKUP": item.ip_backup || "",
      Status: item.status || "ACTIVE",
    };
  }

  return mapRowToTemplate(
    item,
    tab.exportType || tab.label || "",
    tab.typeCode || ""
  );
}

function buildStructuredTemplateSheet(tab = {}, item = {}) {
  const tabKey = String(tab?.key || "").trim().toLowerCase();

  if (tabKey === "gathering") {
    const rows = [
      [
        "NO",
        "NO.ASSET",
        "TYPE",
        "user",
        "",
        "",
        "",
        "Pembelian",
        "Depresiasi (5+1 Tahun)",
        "HOSTNAME",
        "IP ADDRESS MAIN",
        "IP ADDRESS BACKUP",
        "Status",
      ],
      [
        "",
        "",
        "",
        "DIVISI",
        "DEPT",
        "NAMA",
        "NIK",
        "",
        "",
        "",
        "",
        "",
        "",
      ],
      [
        item.no || "",
        item.asset_code || "",
        item.type || "GATHERING",
        item.division || "",
        item.department || "",
        item.owner_name || "",
        item.nik || "",
        item.purchase_date || "",
        item.depreciation_date || "",
        item.hostname || "",
        item.ip_main || "",
        item.ip_backup || "",
        item.status || "ACTIVE",
      ],
    ];

    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 1, c: 0 } },
      { s: { r: 0, c: 1 }, e: { r: 1, c: 1 } },
      { s: { r: 0, c: 2 }, e: { r: 1, c: 2 } },
      { s: { r: 0, c: 3 }, e: { r: 0, c: 6 } },
      { s: { r: 0, c: 7 }, e: { r: 1, c: 7 } },
      { s: { r: 0, c: 8 }, e: { r: 1, c: 8 } },
      { s: { r: 0, c: 9 }, e: { r: 1, c: 9 } },
      { s: { r: 0, c: 10 }, e: { r: 1, c: 10 } },
      { s: { r: 0, c: 11 }, e: { r: 1, c: 11 } },
      { s: { r: 0, c: 12 }, e: { r: 1, c: 12 } },
    ];
    ws["!cols"] = [
      { wch: 8 },
      { wch: 14 },
      { wch: 18 },
      { wch: 16 },
      { wch: 16 },
      { wch: 20 },
      { wch: 12 },
      { wch: 14 },
      { wch: 20 },
      { wch: 16 },
      { wch: 18 },
      { wch: 18 },
      { wch: 12 },
    ];

    return ws;
  }

  return null;
}

function readStructuredTemplateRows(ws, sheetName) {
  const matrix = XLSX.utils.sheet_to_json(ws, {
    header: 1,
    raw: false,
    dateNF: "yyyy-mm-dd",
    defval: "",
  });

  const firstRow = matrix[0] || [];
  const secondRow = matrix[1] || [];
  const normalizedFirstRow = firstRow.map((cell) => String(cell || "").trim().toLowerCase());
  const normalizedSecondRow = secondRow.map((cell) => String(cell || "").trim().toLowerCase());
  const isGatheringTemplate =
    normalizedFirstRow[0] === "no" &&
    normalizedFirstRow[1] === "no.asset" &&
    normalizedFirstRow[2] === "type" &&
    normalizedFirstRow[3] === "user" &&
    normalizedSecondRow[3] === "divisi" &&
    normalizedSecondRow[4] === "dept";

  if (!isGatheringTemplate) return null;

  return matrix
    .slice(2)
    .filter((row) => row.some((cell) => String(cell || "").trim() !== ""))
    .map((row) => ({
      NO: row[0] || "",
      "NO.ASSET": row[1] || "",
      TYPE: row[2] || "",
      DIVISI: row[3] || "",
      DEPT: row[4] || "",
      NAMA: row[5] || "",
      NIK: row[6] || "",
      Pembelian: row[7] || "",
      "Depresiasi (5+1 Tahun)": row[8] || "",
      HOSTNAME: row[9] || "",
      "IP ADDRESS MAIN": row[10] || "",
      "IP ADDRESS BACKUP": row[11] || "",
      Status: row[12] || "",
      __sheet_name: sheetName,
    }));
}

const IMPORT_TYPE_ALIASES = [
  {
    aliases: ["all in one", "aio", "desktop", "workstation", "pc", "personal computer"],
    resolvedType: "Personal Computer",
  },
  {
    aliases: ["pc industrial", "industrial pc", "pc industri"],
    resolvedType: "PC INDUSTRIAL",
  },
  {
    aliases: ["cctv", "camera", "ip camera"],
    resolvedType: "CCTV",
  },
  {
    aliases: ["nvr", "nvr cctv"],
    resolvedType: "NVR",
  },
  {
    aliases: ["scanner", "scanners"],
    resolvedType: "SCANNER",
  },
  {
    aliases: ["access door", "acces door", "fingerprint", "suprema", "reader"],
    resolvedType: "ACCESSDOOR",
  },
  {
    aliases: ["face attendance", "attendance", "absensi"],
    resolvedType: "Face Attendance",
  },
  {
    aliases: ["gathering", "teleconference"],
    resolvedType: "GATHERING",
  },
  {
    aliases: ["podcast"],
    resolvedType: "PODCAST",
  },
  {
    aliases: ["wireless display transmiter"],
    resolvedType: "WIRELESS DISPLAY TRANSMITER",
  },
  {
    aliases: ["camera pocket"],
    resolvedType: "CAMERA POCKET",
  },
];

function normalizeValue(value = "") {
  return String(value || "").trim().toLowerCase();
}

function resolveImportType(typeValue = "", sheetName = "") {
  const candidates = [typeValue, sheetName]
    .map(normalizeValue)
    .filter(Boolean);

  for (const candidate of candidates) {
    const matchedAlias = IMPORT_TYPE_ALIASES.find((aliasGroup) =>
      aliasGroup.aliases.some((alias) => {
        const normalizedAlias = normalizeValue(alias);
        return candidate.includes(normalizedAlias) || normalizedAlias.includes(candidate);
      })
    );

    if (matchedAlias) {
      return matchedAlias.resolvedType;
    }
  }

  return typeValue || sheetName || "";
}

function resolveImportTypeCode(typeCodeValue = "", sheetName = "") {
  const rawTypeCode = String(typeCodeValue || "").trim();
  if (rawTypeCode) return rawTypeCode.toUpperCase();

  const normalizedSheetName = String(sheetName || "").trim().toUpperCase();
  return SHEET_TYPE_CODE_MAP[normalizedSheetName] || "";
}

function normalizeExcelDate(value, options = {}) {
  const {
    yearOnlyAsFirstDay = false,
  } = options;

  if (value === null || value === undefined || value === "") return "";

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }

  const raw = String(value).trim();
  if (!raw) return "";

  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    return raw;
  }

  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(raw) || /^\d{4}\/\d{1,2}\/\d{1,2}$/.test(raw)) {
    const parsed = new Date(raw);
    return Number.isNaN(parsed.getTime()) ? raw : parsed.toISOString().slice(0, 10);
  }

  if (/^\d{1,2}\/\d{4}$/.test(raw)) {
    const [month, year] = raw.split("/");
    return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-01`;
  }

  if (/^\d{4}$/.test(raw)) {
    return yearOnlyAsFirstDay
      ? `${raw}-01-01`
      : raw;
  }

  if (/^\d+(\.\d+)?$/.test(raw)) {
    const excelSerial = Number(raw);
    const parsed = XLSX.SSF.parse_date_code(excelSerial);
    if (parsed) {
      const yyyy = String(parsed.y).padStart(4, "0");
      const mm = String(parsed.m).padStart(2, "0");
      const dd = String(parsed.d).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    }
  }

  return raw;
}

export default function useAssetExcel() {
  const getSheetFallbackType = (sheet = {}) =>
    Object.prototype.hasOwnProperty.call(sheet, "exportType")
      ? sheet.exportType
      : sheet.label;

  const getSheetFallbackTypeCode = (sheet = {}) =>
    Object.prototype.hasOwnProperty.call(sheet, "typeCode")
      ? sheet.typeCode
      : "";

  const buildWorkbook = (
    sheets = [],
    includeFallbackRow = false,
    options = {}
  ) => {
    const {
      headers = EXCEL_HEADERS,
      rowMapper = mapRowToExcel,
    } = options;
    const wb = XLSX.utils.book_new();

    sheets.forEach((sheet) => {
      const rows = Array.isArray(sheet.rows) ? sheet.rows : [];
      const sheetRows = rows.length > 0
        ? rows
        : includeFallbackRow
          ? [rowMapper({}, getSheetFallbackType(sheet), getSheetFallbackTypeCode(sheet))]
          : [];

      const ws = XLSX.utils.json_to_sheet(sheetRows, { header: headers });
      XLSX.utils.book_append_sheet(wb, ws, String(sheet.label || "Assets").slice(0, 31));
    });

    return wb;
  };

  const exportExcel = (
    rows = [],
    options = {}
  ) => {
    const { categories = [], routeGroup = "" } = options;
    if (routeGroup === "software-hardware") {
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(
        rows.map((item, index) =>
          mapRowToSoftwareTemplate(
            {
              ...item,
              no: index + 1,
            },
            item.type || item.category?.category_name || "SOFTWARE"
          )
        ),
        { header: SOFTWARE_TEMPLATE_HEADERS }
      );
      XLSX.utils.book_append_sheet(wb, ws, "Software");

      const buffer =
        XLSX.write(
          wb,
          {
            bookType: "xlsx",
            type: "array",
          }
        );

      saveAs(
        new Blob([
          buffer,
        ]),
        `asset-report-${Date.now()}.xlsx`
      );
      return;
    }

    const groupedSheets = groupAssetsByWorkbookTabs(rows, categories, routeGroup)
      .map((sheet) => ({
        ...sheet,
        rows: sheet.rows.map((item) =>
          mapRowToExcel(
            item,
            sheet.exportType || sheet.label,
            sheet.typeCode || ""
          )
        ),
      }));

    const wb = buildWorkbook(groupedSheets);

    const buffer =
      XLSX.write(
        wb,
        {
          bookType:
            "xlsx",
          type:
            "array",
        }
      );

    saveAs(
      new Blob([
        buffer,
      ]),
      `asset-report-${Date.now()}.xlsx`
    );
  };

  const downloadTemplate =
    (options = {}) => {
      const { routeGroup = "", activeTabKey = "" } = options;
      if (routeGroup === "software-hardware") {
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(
          [mapRowToSoftwareTemplate({ status: "ACTIVE" }, "SOFTWARE")],
          { header: SOFTWARE_TEMPLATE_HEADERS }
        );
        XLSX.utils.book_append_sheet(wb, ws, "Software");

        const buffer =
          XLSX.write(
            wb,
            {
              bookType: "xlsx",
              type: "array",
            }
          );

        saveAs(
          new Blob([
            buffer,
          ]),
          "asset-template.xlsx"
        );
        return;
      }

      const configuredTabs = getAssetWorkbookTabs(routeGroup);
      const visibleTabs = activeTabKey
        ? configuredTabs.filter((tab) => tab.key === activeTabKey)
        : configuredTabs;
      const sourceTabs = visibleTabs.length ? visibleTabs : (configuredTabs.length ? configuredTabs : [{ label: "Template", exportType: "" }]);
      const sheets = sourceTabs.map((tab) => ({
        ...tab,
        rows: [
          mapRowToTabTemplate(
            { status: "ACTIVE" },
            {
              ...tab,
              exportType: getSheetFallbackType(tab),
              typeCode: getSheetFallbackTypeCode(tab),
            }
          ),
        ],
      }));

      const wb = XLSX.utils.book_new();

      sheets.forEach((sheet) => {
        let ws = null;

        if (isStructuredTemplateTab(sheet)) {
          ws = buildStructuredTemplateSheet(sheet, (Array.isArray(sheet.rows) && sheet.rows[0]) || {});
        }

        if (!ws) {
          const headers = getTemplateHeadersForTab(sheet);
          const rows = Array.isArray(sheet.rows) && sheet.rows.length
            ? sheet.rows
            : [mapRowToTabTemplate({}, sheet)];
          ws = XLSX.utils.json_to_sheet(rows, { header: headers });
        }

        XLSX.utils.book_append_sheet(wb, ws, String(sheet.label || "Assets").slice(0, 31));
      });

      const buffer =
        XLSX.write(
          wb,
          {
            bookType:
              "xlsx",
            type:
              "array",
          }
        );

      saveAs(
        new Blob([
          buffer,
        ]),
        "asset-template.xlsx"
      );
    };

  const readExcel =
    async (file) => {
      const buffer =
        await file.arrayBuffer();

      const wb =
        XLSX.read(
          buffer,
          { cellDates: true }
        );

      return wb.SheetNames.flatMap((sheetName) => {
        const ws =
          wb.Sheets[
            sheetName
          ];

        const structuredRows = readStructuredTemplateRows(ws, sheetName);
        const rows = structuredRows || XLSX.utils.sheet_to_json(
          ws,
          { raw: false, dateNF: "yyyy-mm-dd" }
        );

        return rows.map((row) => {
          const licenseNo =
            row.license_no ||
            row["LICENSE NO"];
          const description =
            row.description ||
            row.DESCRIPTION;
          const functionName =
            row.function ||
            row.FUNCTION;
          const quantity =
            row.qty ||
            row.QTY;
          const vendor =
            row.vendor ||
            row.VENDOR;
          const lastRenew =
            row.last_renew ||
            row["LAST RENEW"];
          const nextRenewal =
            row.next_renewal ||
            row["Next Renewal (MM/YYYY)"];
          const assetCode =
            row.asset_tag ||
            row.asset_code ||
            row["NO ASSET"] ||
            row["NO.ASSET"] ||
            licenseNo;
          const ownerName =
            row.owner_name ||
            vendor ||
            row["NAMA PIC"] ||
            row.NAMA;
          const purchaseDate =
            row.purchase_date ||
            row.PEMBELIAN ||
            row.Pembelian;
          const depreciationDate =
            row.depreciation_date ||
            nextRenewal ||
            row["DEPRESIASI (5+1 Th)"] ||
            row["Depresiasi (5+1 Tahun)"];
          const hostname =
            row.hostname ||
            row.HOSTNAME;
          const status =
            row.status ||
            row.STATUS ||
            row.Status ||
            "ACTIVE";

          const rawTypeValue = String(row.TYPE || row.type || "").trim();
          const resolvedType = rawTypeValue || resolveImportType(
            "",
            sheetName
          );
          const resolvedTypeCode = resolveImportTypeCode(
            row.type_code || row["TYPE CODE"] || row.typeCode,
            sheetName
          );

          return {
            ...row,
          __sheet_name: sheetName,
          type_code: resolvedTypeCode,
          TYPE: resolvedType,
          asset_code: assetCode,
          asset_name: row.asset_name || row["NAMA ASET"] || description || resolvedType,
          type: resolvedType,
          division: row.division || row.DIVISI || functionName,
          department: row.department || row.DEPT,
          owner_name: ownerName,
          nik: row.nik || row.NIK,
          qty: quantity || "",
          serial_number: row.serial_number || licenseNo || assetCode,
          last_renew: normalizeExcelDate(lastRenew, { yearOnlyAsFirstDay: true }),
          purchase_date: normalizeExcelDate(purchaseDate, { yearOnlyAsFirstDay: true }),
          depreciation_date: normalizeExcelDate(depreciationDate),
          hostname,
          ip_main: row.ip_main || row["IP ADDRESS MAIN"],
          ip_backup: row.ip_backup || row["IP ADDRESS BACKUP"],
          status,
          };
        });
      })
        .filter((row) => row.asset_code);
    };

  return {
    exportExcel,
    downloadTemplate,
    readExcel,
  };
}

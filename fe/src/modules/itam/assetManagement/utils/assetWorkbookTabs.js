const HARDWARE_WORKBOOK_TABS = [
  {
    key: "pc",
    label: "PC",
    typeCode: "PC",
    exportType: "PC",
    aliases: ["pc", "personal computer", "desktop", "workstation", "all in one", "pc industrial", "laptop"],
  },
  {
    key: "cctv",
    label: "CCTV",
    typeCode: "CCTV",
    exportType: "CCTV",
    aliases: ["cctv", "nvr", "camera"],
  },
  {
    key: "gathering",
    label: "GATHERING",
    typeCode: "GATHERING",
    exportType: "GATHERING",
    aliases: ["gathering", "teleconference", "wireless display transmiter", "camera pocket", "podcast"],
  },
  {
    key: "scanner",
    label: "SCANNER",
    typeCode: "SCANNER",
    exportType: "SCANNER",
    aliases: ["scanner", "scanners"],
  },
  {
    key: "accessdoor",
    label: "ACCESSDOOR",
    typeCode: "ACCESSDOOR",
    exportType: "ACCES DOOR",
    aliases: ["acces door", "access door", "reader", "fingerprint", "face attendance", "suprema"],
  },
  {
    key: "lainnya",
    label: "LAINNYA",
    typeCode: "",
    exportType: "",
    aliases: [],
  },
];

const DEFAULT_WORKBOOK_FIELD_LABELS = {
  assetCode: "NO ASSET",
  type: "TYPE",
  hostname: "HOSTNAME",
  status: "STATUS",
  division: "DIVISI",
  department: "DEPT",
  ownerName: "NAMA",
  nik: "NIK",
  purchaseDate: "PEMBELIAN",
  depreciationDate: "DEPRESIASI (5+1 TH)",
  ipMain: "IP ADDRESS MAIN",
  ipBackup: "IP ADDRESS BACKUP",
};

const WORKBOOK_TAB_FIELD_LABELS = {
  cctv: {
    ...DEFAULT_WORKBOOK_FIELD_LABELS,
    assetCode: "NO.ASSET",
  },
  gathering: {
    ...DEFAULT_WORKBOOK_FIELD_LABELS,
    assetCode: "NO.ASSET",
    purchaseDate: "Pembelian",
    depreciationDate: "Depresiasi (5+1 Tahun)",
    status: "Status",
  },
};

function normalizeValue(value = "") {
  return String(value).trim().toLowerCase();
}

function buildCategoryPathNames(categoryId, categoryMap) {
  const names = [];
  let current = categoryMap.get(String(categoryId ?? ""));

  while (current) {
    names.push(normalizeValue(current.category_name));
    current = current.parent_id
      ? categoryMap.get(String(current.parent_id))
      : null;
  }

  return names;
}

export function getAssetWorkbookTabs(routeGroup = "") {
  return normalizeValue(routeGroup) === "hardware"
    ? HARDWARE_WORKBOOK_TABS
    : [];
}

export function getWorkbookTabFieldLabels(tabKey = "") {
  const normalizedTabKey = normalizeValue(tabKey);
  return WORKBOOK_TAB_FIELD_LABELS[normalizedTabKey] || DEFAULT_WORKBOOK_FIELD_LABELS;
}

export function matchAssetToWorkbookTab(row, categories = [], routeGroup = "") {
  const tabs = getAssetWorkbookTabs(routeGroup);
  if (!tabs.length) return "";
  const fallbackTab = tabs.find((tab) => tab.key === "lainnya");

  const categoryMap = new Map(
    categories.map((item) => [String(item.category_id), item])
  );

  const categoryNames = buildCategoryPathNames(
    row?.category_id || row?.category?.category_id,
    categoryMap
  );

  const valuesToCheck = [
    row?.category?.category_name,
    row?.asset_name,
    row?.hostname,
    ...categoryNames,
  ]
    .map(normalizeValue)
    .filter(Boolean);

  const matchedTab = tabs.find((tab) =>
    tab.aliases.some((alias) => {
      const normalizedAlias = normalizeValue(alias);
      return valuesToCheck.some(
        (value) =>
          value === normalizedAlias ||
          value.includes(normalizedAlias) ||
          normalizedAlias.includes(value)
      );
    })
  );

  return matchedTab?.key || fallbackTab?.key || "";
}

export function groupAssetsByWorkbookTabs(rows = [], categories = [], routeGroup = "") {
  const tabs = getAssetWorkbookTabs(routeGroup);
  if (!tabs.length) {
    return [
      {
        key: "assets",
        label: "Assets",
        rows,
      },
    ];
  }

  return tabs.map((tab) => ({
    ...tab,
    rows: rows.filter(
      (row) => matchAssetToWorkbookTab(row, categories, routeGroup) === tab.key
    ),
  }));
}

export function getWorkbookTabCategoryIds(categories = [], routeGroup = "", tabKey = "") {
  const tabs = getAssetWorkbookTabs(routeGroup);
  const targetTab = tabs.find((tab) => tab.key === tabKey);

  if (!targetTab) return [];

  const categoryMap = new Map(
    categories.map((item) => [String(item.category_id), item])
  );

  const matchedCategoryIds = categories
    .filter((item) => {
      const valuesToCheck = [
        item.category_name,
        ...buildCategoryPathNames(item.category_id, categoryMap),
      ]
        .map(normalizeValue)
        .filter(Boolean);

      return targetTab.aliases.some((alias) => {
        const normalizedAlias = normalizeValue(alias);
        return valuesToCheck.some(
          (value) =>
            value === normalizedAlias ||
            value.includes(normalizedAlias) ||
            normalizedAlias.includes(value)
        );
      });
    })
    .map((item) => String(item.category_id));

  if (targetTab.key === "lainnya") {
    const usedIds = new Set(
      tabs
        .filter((tab) => tab.key !== "lainnya")
        .flatMap((tab) => getWorkbookTabCategoryIds(categories, routeGroup, tab.key))
    );

    return categories
      .filter((item) => !usedIds.has(String(item.category_id)))
      .map((item) => String(item.category_id));
  }

  return matchedCategoryIds;
}

export function resolveImportCategory(categories = [], row = {}, routeGroup = "") {
  const normalizedType = normalizeValue(row.TYPE || row.type || "");
  const normalizedSheet = normalizeValue(row.__sheet_name || "");
  const normalizedTypeCode = normalizeValue(row.type_code || row["TYPE CODE"] || "");

  const categoryRows = Array.isArray(categories) ? categories : [];
  const routeScopedIds = new Set(
    (getWorkbookTabCategoryIds(categoryRows, routeGroup, "pc").length ||
    getWorkbookTabCategoryIds(categoryRows, routeGroup, "cctv").length ||
    getWorkbookTabCategoryIds(categoryRows, routeGroup, "gathering").length ||
    getWorkbookTabCategoryIds(categoryRows, routeGroup, "scanner").length ||
    getWorkbookTabCategoryIds(categoryRows, routeGroup, "accessdoor").length ||
    getWorkbookTabCategoryIds(categoryRows, routeGroup, "lainnya").length)
      ? categoryRows.map((item) => String(item.category_id))
      : categoryRows.map((item) => String(item.category_id))
  );

  const scopedCategories = routeGroup
    ? categoryRows.filter((item) => routeScopedIds.has(String(item.category_id)))
    : categoryRows;

  const candidates = [
    {
      when: ["pc", "personal computer", "all in one", "desktop", "workstation"].some((value) =>
        [normalizedType, normalizedSheet, normalizedTypeCode].includes(value) ||
        normalizedType.includes(value)
      ),
      keywords: ["laptop", "workstation", "desktop", "all in one", "personal computer", "pc"],
    },
    {
      when: ["laptop"].some((value) => normalizedType.includes(value)),
      keywords: ["laptop"],
    },
    {
      when: ["workstation"].some((value) => normalizedType.includes(value)),
      keywords: ["workstation", "desktop", "personal computer", "pc"],
    },
    {
      when: ["cctv", "camera", "nvr"].some((value) =>
        normalizedType.includes(value) || normalizedSheet.includes(value) || normalizedTypeCode.includes(value)
      ),
      keywords: ["nvr", "cctv", "camera"],
    },
    {
      when: ["scanner"].some((value) =>
        normalizedType.includes(value) || normalizedSheet.includes(value) || normalizedTypeCode.includes(value)
      ),
      keywords: ["scanner"],
    },
    {
      when: ["accessdoor", "access door", "acces door", "fingerprint", "reader", "suprema", "face attendance"].some((value) =>
        normalizedType.includes(value) || normalizedSheet.includes(value) || normalizedTypeCode.includes(value)
      ),
      keywords: ["acces door", "access door", "face attendance", "fingerprint", "reader", "suprema"],
    },
    {
      when: ["gathering", "teleconference", "podcast", "wireless display transmiter", "camera pocket"].some((value) =>
        normalizedType.includes(value) || normalizedSheet.includes(value) || normalizedTypeCode.includes(value)
      ),
      keywords: ["teleconference", "podcast", "wireless display transmiter", "camera pocket", "gathering"],
    },
  ];

  const directNameMatch = scopedCategories.find((item) => {
    const categoryName = normalizeValue(item.category_name);
    return categoryName === normalizedType || categoryName === normalizedTypeCode;
  });

  if (directNameMatch) {
    return {
      category_id: directNameMatch.category_id,
      category_name: directNameMatch.category_name,
    };
  }

  for (const candidate of candidates) {
    if (!candidate.when) continue;
    const matchedCategory = scopedCategories.find((item) =>
      candidate.keywords.some((keyword) =>
        normalizeValue(item.category_name).includes(normalizeValue(keyword))
      )
    );

    if (matchedCategory) {
      return {
        category_id: matchedCategory.category_id,
        category_name: matchedCategory.category_name,
      };
    }
  }

  return {
    category_id: null,
    category_name: "",
  };
}

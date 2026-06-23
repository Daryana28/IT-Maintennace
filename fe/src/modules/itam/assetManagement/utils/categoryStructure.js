const REQUIRED_ROOT_CATEGORIES = [
  { category_name: "Hardware", sort_no: 1, show_in_tabs: true },
  { category_name: "Software Hardware", sort_no: 2, show_in_tabs: true },
  { category_name: "Application", sort_no: 3, show_in_tabs: true },
  { category_name: "Network", sort_no: 4, show_in_tabs: true },
  { category_name: "Cyber Security", sort_no: 5, show_in_tabs: true },
];

const ROOT_CATEGORY_ALIASES = {
  hardware: ["hardware"],
  "software hardware": ["software hardware"],
  application: ["application", "software"],
  network: ["network", "networking"],
  "cyber security": ["cyber security", "cyber"],
};

const LEGACY_ROOT_NAMES = new Set(["software", "networking", "cyber"]);

const APPLICATION_DEFAULT_TREE = [
  {
    category_name: "Business Application",
    sort_no: 1,
    children: [
      { category_name: "HR", sort_no: 1 },
      { category_name: "Finance", sort_no: 2 },
      { category_name: "Production", sort_no: 3 },
      { category_name: "Inventory", sort_no: 4 },
      { category_name: "Attendance", sort_no: 5 },
    ],
  },
  {
    category_name: "Support Application",
    sort_no: 2,
    children: [
      { category_name: "Collaboration", sort_no: 1 },
      { category_name: "Reporting", sort_no: 2 },
      { category_name: "Utility", sort_no: 3 },
    ],
  },
  {
    category_name: "Security Application",
    sort_no: 3,
    children: [
      { category_name: "Monitoring", sort_no: 1 },
      { category_name: "Endpoint", sort_no: 2 },
      { category_name: "Identity Access", sort_no: 3 },
    ],
  },
  {
    category_name: "System Application",
    sort_no: 4,
    children: [
      { category_name: "Database", sort_no: 1 },
      { category_name: "Middleware", sort_no: 2 },
      { category_name: "Operating Support", sort_no: 3 },
    ],
  },
];

export function normalizeCategoryName(value = "") {
  return String(value).trim().toLowerCase();
}

function findByName(rows = [], parentId, categoryName) {
  return rows.find(
    (item) =>
      String(item.parent_id ?? "") === String(parentId ?? "") &&
      normalizeCategoryName(item.category_name) === normalizeCategoryName(categoryName)
  );
}

async function ensureTree(assetService, rows, parentNode, definitions = []) {
  let workingRows = rows;
  let changed = false;

  for (const definition of definitions) {
    let existingNode = findByName(
      workingRows,
      parentNode.category_id,
      definition.category_name
    );

    if (!existingNode) {
      await assetService.createCategory({
        category_name: definition.category_name,
        parent_id: Number(parentNode.category_id),
        level_no: Number(parentNode.level_no || 1) + 1,
        sort_no: Number(definition.sort_no || 0),
        is_active: true,
        show_in_tabs: false,
      });
      workingRows = await assetService.getCategories({ all: true });
      existingNode = findByName(
        workingRows,
        parentNode.category_id,
        definition.category_name
      );
      changed = true;
    } else {
      const updatePayload = {};

      if (Number(existingNode.level_no || 1) !== Number(parentNode.level_no || 1) + 1) {
        updatePayload.level_no = Number(parentNode.level_no || 1) + 1;
      }
      if (Number(existingNode.sort_no || 0) !== Number(definition.sort_no || 0)) {
        updatePayload.sort_no = Number(definition.sort_no || 0);
      }
      if (!existingNode.is_active) {
        updatePayload.is_active = true;
      }

      if (Object.keys(updatePayload).length > 0) {
        await assetService.updateCategory(existingNode.category_id, updatePayload);
        workingRows = await assetService.getCategories({ all: true });
        existingNode = findByName(
          workingRows,
          parentNode.category_id,
          definition.category_name
        );
        changed = true;
      }
    }

    if (existingNode && Array.isArray(definition.children) && definition.children.length > 0) {
      const result = await ensureTree(
        assetService,
        workingRows,
        existingNode,
        definition.children
      );
      workingRows = result.rows;
      changed = changed || result.changed;
    }
  }

  return { rows: workingRows, changed };
}

export async function syncAssetCategoryStructure(assetService, rows = []) {
  let workingRows = Array.isArray(rows) ? rows : [];
  let changed = false;

  const refreshRows = async () => {
    workingRows = await assetService.getCategories({ all: true });
    return workingRows;
  };

  for (const requiredRoot of REQUIRED_ROOT_CATEGORIES) {
    const roots = workingRows.filter((item) => !item.parent_id);
    const allowedNames =
      ROOT_CATEGORY_ALIASES[normalizeCategoryName(requiredRoot.category_name)] || [
        normalizeCategoryName(requiredRoot.category_name),
      ];

    const existingRoot = roots.find((item) =>
      allowedNames.includes(normalizeCategoryName(item.category_name))
    );

    if (!existingRoot) {
      await assetService.createCategory({
        category_name: requiredRoot.category_name,
        parent_id: null,
        level_no: 1,
        sort_no: requiredRoot.sort_no,
        is_active: true,
        show_in_tabs: requiredRoot.show_in_tabs,
      });
      await refreshRows();
      changed = true;
      continue;
    }

    const updatePayload = {};

    if (existingRoot.category_name !== requiredRoot.category_name) {
      updatePayload.category_name = requiredRoot.category_name;
    }
    if (existingRoot.parent_id !== null) {
      updatePayload.parent_id = null;
    }
    if (Number(existingRoot.level_no || 1) !== 1) {
      updatePayload.level_no = 1;
    }
    if (Number(existingRoot.sort_no || 0) !== requiredRoot.sort_no) {
      updatePayload.sort_no = requiredRoot.sort_no;
    }
    if (!existingRoot.is_active) {
      updatePayload.is_active = true;
    }
    if (existingRoot.show_in_tabs !== requiredRoot.show_in_tabs) {
      updatePayload.show_in_tabs = requiredRoot.show_in_tabs;
    }

    if (Object.keys(updatePayload).length > 0) {
      await assetService.updateCategory(existingRoot.category_id, updatePayload);
      await refreshRows();
      changed = true;
    }
  }

  const applicationRoot = workingRows.find(
    (item) =>
      !item.parent_id &&
      normalizeCategoryName(item.category_name) === "application"
  );

  if (applicationRoot) {
    const result = await ensureTree(
      assetService,
      workingRows,
      applicationRoot,
      APPLICATION_DEFAULT_TREE
    );
    workingRows = result.rows;
    changed = changed || result.changed;
  }

  const legacyRoots = workingRows.filter(
    (item) => !item.parent_id && LEGACY_ROOT_NAMES.has(normalizeCategoryName(item.category_name))
  );

  for (const [index, legacyRoot] of legacyRoots.entries()) {
    const updatePayload = {};

    if (legacyRoot.show_in_tabs) {
      updatePayload.show_in_tabs = false;
    }
    if (Number(legacyRoot.sort_no || 0) !== 90 + index) {
      updatePayload.sort_no = 90 + index;
    }

    if (Object.keys(updatePayload).length > 0) {
      await assetService.updateCategory(legacyRoot.category_id, updatePayload);
      await refreshRows();
      changed = true;
    }
  }

  return {
    changed,
    rows: workingRows,
  };
}

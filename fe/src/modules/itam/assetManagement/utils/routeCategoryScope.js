const ROUTE_GROUP_LABELS = {
  hardware: "Hardware",
  "software-hardware": "Software",
  software: "Application",
  application: "Application",
  network: "Network",
  "cyber-security": "Cyber Security",
};

const ROUTE_GROUP_CATEGORY_NAMES = {
  hardware: "Hardware",
  "software-hardware": "Software Hardware",
  software: "Application",
  application: "Application",
  network: "Network",
  "cyber-security": "Cyber Security",
};

const CANONICAL_ROOT_NAMES = new Set(
  Object.values(ROUTE_GROUP_CATEGORY_NAMES).map((value) => value.toLowerCase())
);

function findScopedRoot(categories = [], routeGroup = "") {
  const targetName = ROUTE_GROUP_CATEGORY_NAMES[routeGroup];

  if (!targetName) return null;

  const normalizedTargetName = targetName.toLowerCase();
  return (
    categories.find(
      (item) =>
        !item.parent_id &&
        (item.category_name || "").toLowerCase() === normalizedTargetName
    ) ||
    categories.find(
      (item) => (item.category_name || "").toLowerCase() === normalizedTargetName
    ) ||
    null
  );
}

const ROUTE_ACTION_LABELS = {
  list: "All",
  schedule: "Schedule",
  depreciation: "History Depresiasi",
};

export function getAssetRouteGroup(pathname = "") {
  const parts = pathname.split("/").filter(Boolean);
  const assetsIndex = parts.indexOf("assets");

  if (assetsIndex === -1) return "";

  return parts[assetsIndex + 1] || "";
}

export function getScopedCategoryIds(categories = [], routeGroup = "") {
  const root = findScopedRoot(categories, routeGroup);

  if (!root) return "";

  const ids = [];
  const visit = (node) => {
    if (!node) return;

    const nodeName = String(node.category_name || "").toLowerCase();
    if (node.category_id !== root.category_id && CANONICAL_ROOT_NAMES.has(nodeName)) {
      return;
    }

    ids.push(String(node.category_id));
    categories
      .filter((item) => String(item.parent_id || "") === String(node.category_id))
      .forEach((child) => visit(child));
  };

  visit(root);
  return ids.join(",");
}

export function getScopedRootCategoryId(categories = [], routeGroup = "") {
  const root = findScopedRoot(categories, routeGroup);

  return root ? String(root.category_id) : "";
}

export function assetBelongsToRouteGroup(row = {}, categories = [], routeGroup = "") {
  const root = findScopedRoot(categories, routeGroup);
  if (!root) return true;

  const categoryId = row?.category_id || row?.category?.category_id;
  if (!categoryId) return false;

  const categoryMap = new Map(
    categories.map((item) => [String(item.category_id), item])
  );

  let current = categoryMap.get(String(categoryId));
  while (current) {
    const currentName = String(current.category_name || "").toLowerCase();

    if (String(current.category_id) === String(root.category_id)) {
      return true;
    }

    if (CANONICAL_ROOT_NAMES.has(currentName)) {
      return false;
    }

    current = current.parent_id
      ? categoryMap.get(String(current.parent_id))
      : null;
  }

  return false;
}

export function getAssetRouteGroupLabel(routeGroup = "") {
  return ROUTE_GROUP_LABELS[routeGroup] || "";
}

export function getAssetRouteAction(pathname = "") {
  const parts = pathname.split("/").filter(Boolean);
  const assetsIndex = parts.indexOf("assets");

  if (assetsIndex === -1) return "";

  return parts[assetsIndex + 2] || "";
}

export function getAssetRouteActionLabel(pathname = "") {
  return ROUTE_ACTION_LABELS[getAssetRouteAction(pathname)] || "";
}

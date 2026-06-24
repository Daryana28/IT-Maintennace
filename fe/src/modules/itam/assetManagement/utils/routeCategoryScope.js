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
  const targetName = ROUTE_GROUP_CATEGORY_NAMES[routeGroup];

  if (!targetName) return "";

  const root = categories.find(
    (item) => (item.category_name || "").toLowerCase() === targetName.toLowerCase()
  );

  if (!root) return "";

  const ids = [];
  const visit = (parentId) => {
    ids.push(String(parentId));
    categories
      .filter((item) => String(item.parent_id || "") === String(parentId))
      .forEach((child) => visit(child.category_id));
  };

  visit(root.category_id);
  return ids.join(",");
}

export function getScopedRootCategoryId(categories = [], routeGroup = "") {
  const targetName = ROUTE_GROUP_CATEGORY_NAMES[routeGroup];

  if (!targetName) return "";

  const root = categories.find(
    (item) => (item.category_name || "").toLowerCase() === targetName.toLowerCase()
  );

  return root ? String(root.category_id) : "";
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

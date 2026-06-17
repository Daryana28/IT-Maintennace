// fe/src/modules/itam/assets/services/assetService.js
import apiClient from "@/shared/services/apiClient";

const BASE_URL = "/assets";

const DEFAULT_META = {
 total: 0,
 page: 1,
 pageSize: 20,
 totalPages: 0,
};

const unwrap = (res, fallback = null) => {
 const data = res?.data;
 return data?.data ?? data ?? fallback;
};

const unwrapMeta = (res) =>
 res?.data?.meta ?? DEFAULT_META;

const cleanParams = (params = {}) =>
 Object.fromEntries(
  Object.entries(params).filter(
   ([, value]) =>
    value !== "" &&
    value !== null &&
    value !== undefined
  )
 );

const toId = (id) =>
 encodeURIComponent(String(id));

async function getAll(params = {}) {
 const query = cleanParams({
  page: 1,
  pageSize: 20,
  ...params,
 });

 const res = await apiClient.get(BASE_URL, {
  params: query,
 });

 return {
  data: unwrap(res, []),
  meta: unwrapMeta(res),
 };
}

async function getById(id) {
 try {
  const res = await apiClient.get(
   `${BASE_URL}/${toId(id)}`
  );
  return unwrap(res, null);
 } catch (err) {
  console.warn("API failed, using mock data for getById", err.message);
  return {
   asset_id: id,
   asset_name: "Mock Asset " + id,
   asset_code: "AST-MOCK-001",
   status: "ACTIVE",
   category: { category_name: "Hardware" },
   location: { location_name: "HQ Data Center" },
   owner_name: "IT Dept",
   purchase_cost: 15000000,
   book_value: 12500000,
   vendor: "Mock Vendor",
   warranty_start: "2023-01-01",
   warranty_end: "2026-01-01",
   contract_number: "CTR-2023-01",
   sla_level: "Gold"
  };
 }
}

async function getCategories(params = {}) {
 const res = await apiClient.get("/asset-categories", { params });
 return unwrap(res, []);
}

async function createCategory(payload) {
 const res = await apiClient.post("/asset-categories", payload);
 return res.data;
}

async function updateCategory(id, payload) {
 const res = await apiClient.put(`/asset-categories/${toId(id)}`, payload);
 return res.data;
}

async function removeCategory(id) {
 const res = await apiClient.delete(`/asset-categories/${toId(id)}`);
 return res.data;
}

async function create(payload) {
  const res = await apiClient.post(BASE_URL, payload);
  return res.data;
}

async function update(id, payload) {
  const res = await apiClient.patch(
    `${BASE_URL}/${toId(id)}`,
    payload
  );
  return res.data;
}

async function remove(id) {
  const res = await apiClient.delete(
    `${BASE_URL}/${toId(id)}`
  );
  return res.data;
}

async function getNextCode() {
  const res = await apiClient.get(
    `${BASE_URL}/next-code`
  );

  return unwrap(res, {})?.asset_code || "";
}

async function bulkImport(rows) {
  const res = await apiClient.post(
    `${BASE_URL}/bulk-import`,
    { rows }
  );

  return res.data;
}

async function getHistory(id) {
  const res = await apiClient.get(
    `${BASE_URL}/${toId(id)}/history`
  );

  return unwrap(res, []);
}

async function getLifecycle(id) {
  try {
    const res = await apiClient.get(
      `${BASE_URL}/${toId(id)}/lifecycle`
    );
    return unwrap(res, []);
  } catch (err) {
    console.warn("API failed, using mock data for getLifecycle", err.message);
    return [
      { action_name: "Purchased", notes: "Bought from Mock Vendor", created_at: "2023-01-01 10:00:00" },
      { action_name: "Deployed", notes: "Assigned to HQ Data Center", created_at: "2023-01-15 14:30:00" },
      { action_name: "Maintenance", notes: "Routine checkup", created_at: "2024-05-10 09:15:00" }
    ];
  }
}

/**
 * ACTION APIs (ITAM WORKFLOW)
 */
async function transferOwner(id, payload) {
  const res = await apiClient.post(
    `${BASE_URL}/${toId(id)}/transfer-owner`,
    payload
  );
  return res.data;
}

async function moveLocation(id, payload) {
  const res = await apiClient.post(
    `${BASE_URL}/${toId(id)}/move-location`,
    payload
  );
  return res.data;
}

async function generateQr(id) {
  const res = await apiClient.get(
    `${BASE_URL}/${toId(id)}/qr`
  );

  return unwrap(res, null);
}


export default {
  getAll,
  getById,
  getCategories,
  createCategory,
  updateCategory,
  removeCategory,
  getNextCode,
  getHistory,
  getLifecycle,
  create,
  update,
  remove,
  bulkImport,

  // ACTIONS
  transferOwner,
  moveLocation,
  generateQr,
};
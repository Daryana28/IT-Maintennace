import apiClient from "@/shared/services/apiClient";

const BASE_URL = "/standard-maintenance";

const unwrap = (res, fallback = null) => {
  const data = res?.data;
  return data?.data ?? data ?? fallback;
};

async function getAll(yearly_standard_id) {
  const params = yearly_standard_id ? { yearly_standard_id } : {};
  const res = await apiClient.get(BASE_URL, { params });
  return unwrap(res, []);
}

async function getYears() {
  const res = await apiClient.get(`${BASE_URL}/years`);
  return unwrap(res, []);
}

async function getYearlyById(id) {
  const res = await apiClient.get(`${BASE_URL}/years/${id}`);
  return unwrap(res, null);
}

async function create(payload) {
  const res = await apiClient.post(BASE_URL, payload);
  return res.data;
}

async function createYearly(payload) {
  const res = await apiClient.post(`${BASE_URL}/years`, payload);
  return res.data;
}

async function updateYearly(id, payload) {
  const res = await apiClient.put(`${BASE_URL}/years/${id}`, payload);
  return res.data;
}

async function deleteYearly(id) {
  const res = await apiClient.delete(`${BASE_URL}/years/${id}`);
  return res.data;
}

async function saveFlat(payload) {
  const res = await apiClient.post(`${BASE_URL}/flat`, payload);
  return res.data;
}

async function deleteFlat(checkId) {
  const res = await apiClient.delete(`${BASE_URL}/flat/${checkId}`);
  return res.data;
}

async function requestDeleteYearly(id, alasan_hapus) {
  const res = await apiClient.post(`${BASE_URL}/years/${id}/request-delete`, { alasan_hapus });
  return res.data;
}

async function updateParent(id, payload) {
  const res = await apiClient.put(`${BASE_URL}/${id}`, payload);
  return res.data;
}

async function deleteParent(id, level) {
  const res = await apiClient.delete(`${BASE_URL}/${id}`, { params: { level } });
  return res.data;
}

async function deleteDetail(id) {
  const res = await apiClient.delete(`${BASE_URL}/detail/${id}`);
  return res.data;
}

export default {
  getAll,
  getYears,
  getYearlyById,
  create,
  createYearly,
  updateYearly,
  deleteYearly,
  requestDeleteYearly,
  saveFlat,
  deleteFlat,
  updateParent,
  deleteParent,
  deleteDetail,
};

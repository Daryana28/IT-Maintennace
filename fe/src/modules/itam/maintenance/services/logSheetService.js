import apiClient from "@/shared/services/apiClient";

const BASE_URL = "/maintenance-log-sheets";

const unwrap = (res, fallback = null) => {
  const data = res?.data;
  return data?.data ?? data ?? fallback;
};

async function getLogSheets(schedule_id) {
  const params = schedule_id ? { schedule_id } : {};
  const res = await apiClient.get(BASE_URL, { params });
  return unwrap(res, []);
}

async function createLogSheet(data) {
  const res = await apiClient.post(BASE_URL, data);
  return res.data;
}

async function updateLogSheet(id, data) {
  const res = await apiClient.put(`${BASE_URL}/${id}`, data);
  return res.data;
}

async function deleteLogSheet(id) {
  const res = await apiClient.delete(`${BASE_URL}/${id}`);
  return res.data;
}

export default {
  getLogSheets,
  createLogSheet,
  updateLogSheet,
  deleteLogSheet,
};

import apiClient from "@/shared/services/apiClient";

const BASE_URL = "/maintenance-schedule";

const unwrap = (res, fallback = null) => {
  const data = res?.data;
  return data?.data ?? data ?? fallback;
};

async function generateSchedule(yearly_standard_id) {
  const res = await apiClient.post(`${BASE_URL}/generate`, { yearly_standard_id });
  return res.data;
}

async function getSchedules(yearly_standard_id) {
  const params = yearly_standard_id ? { yearly_standard_id } : {};
  const res = await apiClient.get(BASE_URL, { params });
  return unwrap(res, []);
}

async function createSchedule(data) {
  const res = await apiClient.post(BASE_URL, data);
  return res.data;
}

async function updateSchedule(id, data) {
  const res = await apiClient.put(`${BASE_URL}/${id}`, data);
  return res.data;
}

async function cancelSchedule(id, reason = "") {
  const res = await apiClient.patch(`${BASE_URL}/${id}/cancel`, { reason });
  return res.data;
}


async function getMonthlyView(year, month, category) {
  const params = { year, month };
  if (category) params.category = category;
  const res = await apiClient.get(`${BASE_URL}/monthly-view`, { params });
  return unwrap(res, []);
}

export default {
  generateSchedule,
  getSchedules,
  createSchedule,
  updateSchedule,
  cancelSchedule,
  getMonthlyView,
};


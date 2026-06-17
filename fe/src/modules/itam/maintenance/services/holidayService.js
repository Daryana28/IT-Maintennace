import apiClient from "@/shared/services/apiClient";

const holidayService = {
  getAll: async () => {
    const response = await apiClient.get('/holidays');
    return response.data;
  },

  create: async (data) => {
    const response = await apiClient.post('/holidays', data);
    return response.data;
  },

  delete: async (id) => {
    const response = await apiClient.delete(`/holidays/${id}`);
    return response.data;
  }
};

export default holidayService;

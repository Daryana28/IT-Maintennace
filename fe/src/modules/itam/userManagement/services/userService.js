import http from "@/shared/services/apiClient";

const userService = {
    getAll: (params = {}) =>
        http.get("/users", { params }).then((res) => res.data),

    getById: (id) =>
        http.get(`/users/${id}`).then((res) => res.data),

    create: (data) =>
        http.post("/users", data).then((res) => res.data),

    update: (id, data) =>
        http.put(`/users/${id}`, data).then((res) => res.data),

    remove: (id) =>
        http.delete(`/users/${id}`).then((res) => res.data),

    getRoles: () =>
        http.get("/users/roles").then((res) => res.data),
};

export default userService;

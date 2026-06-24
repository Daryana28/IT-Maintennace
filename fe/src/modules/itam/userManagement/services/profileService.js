import http from "@/shared/services/apiClient";

const profileService = {
  getProfile: () => 
    http.get("/users/profile").then((res) => res.data),

  updateProfile: (data) => 
    http.put("/users/profile", data).then((res) => res.data),

  updatePassword: (data) => 
    http.put("/users/profile/password", data).then((res) => res.data),

  updatePicture: (formData) => 
    http.put("/users/profile/picture", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }).then((res) => res.data),
};

export default profileService;

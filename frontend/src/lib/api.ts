import axios from "axios";

// Base instance
const api = axios.create({
baseURL: "http://13.49.73.5:3001",
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("mc_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle responses (FIXED HERE)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("mc_token");
      window.location.href = "/login";
    }
    return Promise.reject(error); // ✅ FIX
  }
);

// ---- AUTH ----
export const authApi = {
  login: (email: string, password: string) =>
    api.post("/auth/login", { email, password }).then((r) => r.data),

  register: (email: string, password: string, name: string) =>
    api.post("/auth/register", { email, password, name }).then((r) => r.data),
};

// ---- PROJECTS ----
export const projectsApi = {
  list: () =>
    api.get("/api/projects").then((r) => r.data.projects),

  get: (id: string) =>
    api.get(`/api/projects/${id}`).then((r) => r.data),

  create: (data: any) =>
    api.post("/api/projects", data).then((r) => r.data.project),

  update: (id: string, data: any) =>
    api.patch(`/api/projects/${id}`, data).then((r) => r.data.project),

  delete: (id: string) =>
    api.delete(`/api/projects/${id}`),

  deploy: (id: string, data?: any) =>
    api.post(`/api/projects/${id}/deploy`, data).then((r) => r.data),
};

// ---- DEPLOYMENTS ----
export const deploymentsApi = {
  list: (projectId?: string) =>
    api
      .get("/api/deployments", { params: { projectId } })
      .then((r) => r.data.deployments),

  get: (id: string) =>
    api.get(`/api/deployments/${id}`).then((r) => r.data.deployment),

  rollback: (id: string) =>
    api.post(`/api/deployments/${id}/rollback`).then((r) => r.data),

  stop: (id: string) =>
    api.post(`/api/deployments/${id}/stop`).then((r) => r.data),
};

// ---- METRICS ----
export const metricsApi = {
  get: (id: string, range = "1h") =>
    api
      .get(`/api/metrics/${id}`, { params: { range } })
      .then((r) => r.data.metrics),
};

// ---- LOGS ----
export const logsApi = {
  get: (id: string) =>
    api.get(`/api/logs/${id}`).then((r) => r.data.logs),

  getRuntime: (id: string) =>
    api.get(`/api/logs/${id}/runtime`).then((r) => r.data.logs),
};

export default api;

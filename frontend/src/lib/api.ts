import axios from "axios";
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || "http://localhost:3001" });
api.interceptors.request.use(c => { const t = localStorage.getItem("mc_token"); if (t) c.headers.Authorization = `Bearer ${t}`; return c; });
api.interceptors.response.use(r => r, e => { if (e.response?.status === 401) { localStorage.removeItem("mc_token"); window.location.href = "/login"; } return Promise.reject(e); });

export const authApi = {
  login: (email: string, password: string) => api.post("/auth/login", { email, password }).then(r => r.data),
  register: (email: string, password: string, name: string) => api.post("/auth/register", { email, password, name }).then(r => r.data),
};
export const projectsApi = {
  list: () => api.get("/api/projects").then(r => r.data.projects),
  get: (id: string) => api.get(`/api/projects/${id}`).then(r => r.data),
  create: (d: any) => api.post("/api/projects", d).then(r => r.data.project),
  update: (id: string, d: any) => api.patch(`/api/projects/${id}`, d).then(r => r.data.project),
  delete: (id: string) => api.delete(`/api/projects/${id}`),
  deploy: (id: string, d?: any) => api.post(`/api/projects/${id}/deploy`, d).then(r => r.data),
};
export const deploymentsApi = {
  list: (projectId?: string) => api.get("/api/deployments", { params: { projectId } }).then(r => r.data.deployments),
  get: (id: string) => api.get(`/api/deployments/${id}`).then(r => r.data.deployment),
  rollback: (id: string) => api.post(`/api/deployments/${id}/rollback`).then(r => r.data),
  stop: (id: string) => api.post(`/api/deployments/${id}/stop`).then(r => r.data),
};
export const metricsApi = { get: (id: string, range = "1h") => api.get(`/api/metrics/${id}`, { params: { range } }).then(r => r.data.metrics) };
export const logsApi = {
  get: (id: string) => api.get(`/api/logs/${id}`).then(r => r.data.logs),
  getRuntime: (id: string) => api.get(`/api/logs/${id}/runtime`).then(r => r.data.logs),
};
export default api;

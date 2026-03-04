import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Layout } from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import DeploymentDetail from "./pages/DeploymentDetail";
import NewProject from "./pages/NewProject";
import Login from "./pages/Login";

const qc = new QueryClient({ defaultOptions: { queries: { staleTime: 30000, refetchInterval: 15000 } } });
const Protected = ({ children }: { children: React.ReactNode }) => localStorage.getItem("mc_token") ? <>{children}</> : <Navigate to="/login" replace />;

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={<Protected><Layout><Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/new" element={<NewProject />} />
            <Route path="/projects/:id" element={<ProjectDetail />} />
            <Route path="/deployments/:id" element={<DeploymentDetail />} />
          </Routes></Layout></Protected>} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

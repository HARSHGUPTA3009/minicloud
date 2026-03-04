import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { projectsApi, metricsApi } from "../lib/api";
import { StatusBadge } from "../components/StatusBadge";
import { CpuMemChart, NetworkChart } from "../components/MetricsChart";
import {
  GitBranch,
  Rocket,
  ExternalLink,
  RefreshCw,
  ChevronRight,
  Wifi,
} from "lucide-react";

interface Deployment {
  id: string;
  commitMessage: string;
  commitSha: string;
  commitAuthor: string;
  startedAt: string;
  duration?: number;
  status: string;
  isActive: boolean;
  deploymentUrl?: string;
  localUrl?: string;
  deploymentPort?: number;
}

interface ProjectResponse {
  project: any;
  deployments: Deployment[];
}

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();

  const [tab, setTab] = useState<"deployments" | "metrics" | "env" | "settings">("deployments");
  const [range, setRange] = useState("1h");

  const { data, isLoading } = useQuery<ProjectResponse>({
    queryKey: ["project", id],
    queryFn: () => projectsApi.get(id!),
    enabled: !!id,
  });

  const { data: metrics = [] } = useQuery({
    queryKey: ["metrics", id, range],
    queryFn: () => metricsApi.get(id!, range),
    enabled: tab === "metrics" && !!id,
  });

  const deploy = useMutation({
    mutationFn: () => projectsApi.deploy(id!),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["project", id] }),
  });

  if (isLoading) {
    return <div className="p-7 text-white/30 text-[13px]">Loading…</div>;
  }

  const project = data?.project;
  const deps = data?.deployments || [];
  const active = deps.find((d) => d.isActive);

  return (
    <div className="p-7">
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 text-white/30 text-[12px] mb-2">
            <Link to="/projects" className="hover:text-white/55">
              Projects
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white/55">{project?.name}</span>
          </div>

          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-white">{project?.name}</h1>
            <StatusBadge status={project?.status} />
          </div>

          <div className="flex items-center gap-2 mt-1.5 text-[12px] text-white/35">
            <GitBranch className="w-3 h-3" />
            <span>{project?.githubRepo}</span>
            <span className="text-white/15">·</span>
            <span>{project?.githubBranch}</span>
          </div>

          {active && (
            <div className="flex items-center gap-2 mt-2.5 flex-wrap">
              {active.localUrl && (
                <a
                  href={active.localUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 px-2.5 py-1 bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.08] rounded-lg text-[11px] text-white/50 font-mono transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  localhost:{active.deploymentPort}
                </a>
              )}
              {active.deploymentUrl && (
                <a
                  href={active.deploymentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 px-2.5 py-1 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/25 rounded-lg text-[11px] text-orange-400 transition-colors"
                >
                  <Wifi className="w-3 h-3" />
                  {active.deploymentUrl.replace("http://", "")}
                </a>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-2">
          {active?.localUrl && (
            <a
              href={active.localUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.08] rounded-xl text-[12px] text-white/60 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              :{active.deploymentPort}
            </a>
          )}

          {active?.deploymentUrl && (
            <a
              href={active.deploymentUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3.5 py-2 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/25 rounded-xl text-[12px] text-orange-400 font-medium transition-colors"
            >
              <Wifi className="w-3.5 h-3.5" />
              Tunnel
            </a>
          )}

          <button
            onClick={() => deploy.mutate()}
            disabled={deploy.isPending || project?.status === "building"}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 rounded-xl text-[12px] text-white font-medium transition-colors"
          >
            {deploy.isPending ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Rocket className="w-3.5 h-3.5" />
            )}
            Deploy
          </button>
        </div>
      </div>

      {tab === "metrics" && (
        <div>
          <div className="flex gap-1.5 mb-4">
            {["1h", "6h", "24h", "7d"].map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium ${
                  range === r
                    ? "bg-violet-600 text-white"
                    : "bg-white/[0.04] text-white/35"
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <CpuMemChart data={metrics} />
            <NetworkChart data={metrics} />
          </div>
        </div>
      )}
    </div>
  );
}
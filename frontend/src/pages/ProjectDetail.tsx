import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { projectsApi, metricsApi } from "../lib/api";
import { StatusBadge } from "../components/StatusBadge";
import { CpuMemChart, NetworkChart } from "../components/MetricsChart";
import { GitBranch, Rocket, ExternalLink, RefreshCw, ChevronRight, Wifi } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
const TABS = ["deployments", "metrics", "env", "settings"] as const;
type Tab = typeof TABS[number];

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>("deployments");
  const [range, setRange] = useState("1h");

  const { data, isLoading } = useQuery({
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

  if (isLoading) return <div className="p-8 text-[13px] text-neutral-400 font-mono">Loading…</div>;

  const project = data?.project;
  const deps = data?.deployments || [];
  const active = deps.find((d: any) => d.isActive);

  return (
    <div className="p-8 font-mono">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[11px] text-neutral-400 mb-5">
        <Link to="/projects" className="hover:text-neutral-700 transition-colors">Projects</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-neutral-700">{project?.name}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-7">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="font-serif italic text-[22px] text-neutral-900">{project?.name}</h1>
            <StatusBadge status={project?.status} />
          </div>
          <div className="flex items-center gap-2 text-[11px] text-neutral-400">
            <GitBranch className="w-3 h-3" strokeWidth={1.5} />
            <span>{project?.githubRepo}</span>
            <span className="text-neutral-300">·</span>
            <span>{project?.githubBranch}</span>
          </div>
          {active && (
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              {active.localUrl && (
                <a href={active.localUrl} target="_blank" rel="noreferrer"
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-neutral-200 rounded-sm text-[11px] text-neutral-500 hover:text-neutral-900 hover:border-neutral-400 transition-colors">
                  <ExternalLink className="w-3 h-3" strokeWidth={1.5} />
                  localhost:{active.deploymentPort}
                </a>
              )}
              {active.deploymentUrl && (
                <a href={active.deploymentUrl} target="_blank" rel="noreferrer"
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-neutral-200 rounded-sm text-[11px] text-neutral-500 hover:text-neutral-900 hover:border-neutral-400 transition-colors">
                  <Wifi className="w-3 h-3" strokeWidth={1.5} />
                  {active.deploymentUrl.replace("http://", "")}
                </a>
              )}
            </div>
          )}
        </div>
        <button
          onClick={() => deploy.mutate()}
          disabled={deploy.isPending || project?.status === "building"}
          className="flex items-center gap-2 bg-neutral-900 text-white text-[10px] tracking-[0.6px] uppercase font-medium px-3.5 py-2 rounded-sm hover:bg-neutral-700 disabled:opacity-40 transition-colors"
        >
          {deploy.isPending
            ? <RefreshCw className="w-3 h-3 animate-spin" />
            : <Rocket className="w-3 h-3" strokeWidth={1.5} />}
          Deploy
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-neutral-200 mb-6 gap-0">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-[10px] tracking-[0.6px] uppercase font-medium transition-colors border-b-2 -mb-px ${
              tab === t
                ? "border-neutral-900 text-neutral-900"
                : "border-transparent text-neutral-400 hover:text-neutral-700"
            }`}>
            {t}
          </button>
        ))}
      </div>

      {/* Deployments tab */}
      {tab === "deployments" && (
        <div className="bg-white border border-neutral-200 rounded-sm overflow-hidden divide-y divide-neutral-100">
          {deps.length === 0 && (
            <div className="px-5 py-10 text-center text-[13px] text-neutral-400">No deployments yet.</div>
          )}
          {deps.map((d: any) => (
            <Link key={d.id} to={`/deployments/${d.id}`}
              className="flex items-center justify-between px-5 py-3.5 hover:bg-neutral-50 transition-colors group">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="text-[13px] font-medium text-neutral-900 group-hover:text-neutral-600 transition-colors font-mono">
                    {d.commitSha.substring(0, 8)}
                  </span>
                  {d.isActive && <span className="text-[10px] bg-neutral-900 text-white px-1.5 py-0.5 rounded-sm uppercase tracking-wide">active</span>}
                  <StatusBadge status={d.status} />
                </div>
                <p className="text-[11px] text-neutral-400 mt-0.5">{d.commitMessage}</p>
              </div>
              <span className="text-[11px] text-neutral-400">
                {formatDistanceToNow(new Date(d.startedAt), { addSuffix: true })}
              </span>
            </Link>
          ))}
        </div>
      )}

      {/* Metrics tab */}
      {tab === "metrics" && (
        <div>
          <div className="flex gap-1.5 mb-5">
            {["1h", "6h", "24h", "7d"].map(r => (
              <button key={r} onClick={() => setRange(r)}
                className={`px-3 py-1.5 text-[10px] tracking-[0.5px] uppercase rounded-sm transition-colors ${
                  range === r ? "bg-neutral-900 text-white" : "bg-white border border-neutral-200 text-neutral-500 hover:border-neutral-400 hover:text-neutral-900"
                }`}>
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
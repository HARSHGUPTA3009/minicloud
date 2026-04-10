import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { deploymentsApi, logsApi } from "../lib/api";
import { StatusBadge } from "../components/StatusBadge";
import { Terminal } from "../components/Terminal";
import { ChevronRight, Clock, GitCommit, User, ExternalLink, Wifi } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const STEPS = ["clone", "build", "deploy", "health_check", "done"] as const;

export default function DeploymentDetail() {
  const { id } = useParams<{ id: string }>();

  const { data: dep, isLoading } = useQuery({
    queryKey: ["deployment", id],
    queryFn: () => deploymentsApi.get(id!),
    enabled: !!id,
    refetchInterval: (d) =>
      ["running", "failed"].includes((d.state.data as any)?.status) ? false : 3000,
  });

  const { data: rtLogs = [] } = useQuery({
    queryKey: ["rtlogs", id],
    queryFn: () => logsApi.getRuntime(id!),
    enabled: dep?.status === "running",
    refetchInterval: 10000,
  });

  if (isLoading || !dep)
    return <div className="p-8 text-[13px] text-neutral-400 font-mono">Loading…</div>;

  const logs = (dep.logs || []) as any[];
  const stepIdx = STEPS.indexOf(dep.buildStep as any);

  return (
    <div className="p-8 font-mono">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[11px] text-neutral-400 mb-5">
        <Link to="/projects" className="hover:text-neutral-700 transition-colors">Projects</Link>
        <ChevronRight className="w-3 h-3" />
        <Link to={`/projects/${dep.projectId}`} className="hover:text-neutral-700 transition-colors">Project</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-neutral-700">{dep.commitSha.substring(0, 8)}</span>
      </div>

      {/* Header */}
      <div className="mb-7">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="font-serif italic text-[22px] text-neutral-900">{dep.commitSha.substring(0, 12)}</h1>
          <StatusBadge status={dep.status} />
        </div>
        <p className="text-[13px] text-neutral-500 mb-3">{dep.commitMessage}</p>
        <div className="flex items-center gap-5 text-[11px] text-neutral-400">
          <span className="flex items-center gap-1.5"><User className="w-3 h-3" strokeWidth={1.5} />{dep.commitAuthor}</span>
          <span className="flex items-center gap-1.5"><GitCommit className="w-3 h-3" strokeWidth={1.5} />{dep.branch}</span>
          <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" strokeWidth={1.5} />
            {formatDistanceToNow(new Date(dep.startedAt), { addSuffix: true })}
          </span>
          {dep.duration && <span>{dep.duration}s</span>}
        </div>

        {dep.status === "running" && (
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            {dep.localUrl && (
              <a href={dep.localUrl} target="_blank" rel="noreferrer"
                className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-neutral-200 rounded-sm text-[11px] text-neutral-500 hover:text-neutral-900 hover:border-neutral-400 transition-colors">
                <ExternalLink className="w-3 h-3" strokeWidth={1.5} />:{dep.deploymentPort}
              </a>
            )}
            {dep.deploymentUrl && (
              <a href={dep.deploymentUrl} target="_blank" rel="noreferrer"
                className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-neutral-200 rounded-sm text-[11px] text-neutral-500 hover:text-neutral-900 hover:border-neutral-400 transition-colors">
                <Wifi className="w-3 h-3" strokeWidth={1.5} />Tunnel
              </a>
            )}
          </div>
        )}
      </div>

      {/* Build pipeline */}
      <div className="bg-white border border-neutral-200 rounded-sm p-6 mb-5">
        <p className="text-[10px] text-neutral-400 tracking-widest uppercase mb-6">Build pipeline</p>
        <div className="flex items-start gap-0">
          {STEPS.map((step, i) => {
            const done = stepIdx > i || dep.status === "running";
            const active = stepIdx === i && !["failed", "running"].includes(dep.status);
            return (
              <div key={step} className="flex items-center flex-1">
                <div className="flex flex-col items-center gap-2">
                  <div className={`w-7 h-7 rounded-sm flex items-center justify-center text-[11px] font-medium border ${
                    done
                      ? "bg-neutral-900 border-neutral-900 text-white"
                      : active
                      ? "bg-white border-neutral-900 text-neutral-900 animate-pulse"
                      : "bg-white border-neutral-200 text-neutral-400"
                  }`}>
                    {done ? "✓" : i + 1}
                  </div>
                  <span className="text-[10px] text-neutral-400 capitalize tracking-wide">
                    {step.replace("_", " ")}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-px mb-6 mx-1 ${done ? "bg-neutral-900" : "bg-neutral-200"}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <Terminal logs={logs} title={`Build · ${dep.id.substring(0, 8)}`} />

      {dep.status === "running" && rtLogs.length > 0 && (
        <div className="mt-5">
          <p className="text-[10px] text-neutral-400 tracking-widest uppercase mb-3">Runtime logs</p>
          <div className="bg-neutral-950 border border-neutral-800 rounded-sm overflow-hidden">
            <div className="p-4 font-mono text-[11px] space-y-0.5 max-h-60 overflow-y-auto">
              {rtLogs.map((l: string, i: number) => (
                <p key={i} className="text-neutral-300">{l}</p>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
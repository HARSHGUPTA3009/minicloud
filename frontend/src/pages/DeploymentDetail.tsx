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
      ["running", "failed"].includes((d.state.data as any)?.status)
        ? false
        : 3000,
  });

  const { data: rtLogs = [] } = useQuery({
    queryKey: ["rtlogs", id],
    queryFn: () => logsApi.getRuntime(id!),
    enabled: dep?.status === "running",
    refetchInterval: 10000,
  });

  if (isLoading || !dep)
    return <div className="p-7 text-white/30 text-[13px]">Loading…</div>;

  const logs = (dep.logs || []) as any[];
  const stepIdx = STEPS.indexOf(dep.buildStep as any);

  return (
    <div className="p-7">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-white/30 text-[12px] mb-5">
        <Link to="/projects" className="hover:text-white/55">Projects</Link>
        <ChevronRight className="w-3 h-3" />
        <Link to={`/projects/${dep.projectId}`} className="hover:text-white/55">Project</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-white/55 font-mono">
          {dep.commitSha.substring(0, 8)}
        </span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <h1 className="font-bold text-lg text-white font-mono">
              {dep.commitSha.substring(0, 12)}
            </h1>
            <StatusBadge status={dep.status} />
          </div>

          <p className="text-white/55 text-[13px] mb-2">
            {dep.commitMessage}
          </p>

          <div className="flex items-center gap-4 text-[11px] text-white/30">
            <span className="flex items-center gap-1">
              <User className="w-3 h-3" />{dep.commitAuthor}
            </span>
            <span className="flex items-center gap-1">
              <GitCommit className="w-3 h-3" />{dep.branch}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDistanceToNow(new Date(dep.startedAt), { addSuffix: true })}
            </span>
            {dep.duration && <span>{dep.duration}s</span>}
          </div>

          {/* URLs */}
          {dep.status === "running" && (
            <div className="mt-3 flex items-center gap-2 flex-wrap">
              {dep.localUrl && (
                <a
                  href={dep.localUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.08] rounded-lg text-[11px] text-white/50 font-mono transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  :{dep.deploymentPort}
                </a>
              )}
              {dep.deploymentUrl && (
                <a
                  href={dep.deploymentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/25 rounded-lg text-[11px] text-orange-400 transition-colors"
                >
                  <Wifi className="w-3 h-3" />
                  Tunnel
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Build Steps */}
      <div className="bg-[#0c0c18] border border-white/[0.06] rounded-xl p-5 mb-4">
        <p className="text-[13px] font-semibold text-white mb-4">
          Build Pipeline
        </p>

        <div className="flex items-start gap-0">
          {STEPS.map((step, i) => {
            const done = stepIdx > i || dep.status === "running";
            const active =
              stepIdx === i && !["failed", "running"].includes(dep.status);

            return (
              <div key={step} className="flex items-center flex-1">
                <div className="flex flex-col items-center gap-1.5">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold border-2 ${
                    done
                      ? "bg-emerald-500 border-emerald-500 text-white"
                      : active
                      ? "bg-violet-500/15 border-violet-500 text-violet-400 animate-pulse"
                      : "bg-white/[0.04] border-white/[0.08] text-white/25"
                  }`}>
                    {done ? "✓" : i + 1}
                  </div>

                  <span className="text-[10px] text-white/35 capitalize">
                    {step.replace("_", " ")}
                  </span>
                </div>

                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-px mb-5 mx-1 ${
                    done ? "bg-emerald-500/40" : "bg-white/[0.08]"
                  }`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <Terminal logs={logs} title={`Build · ${dep.id.substring(0, 8)}`} />

      {dep.status === "running" && rtLogs.length > 0 && (
        <div className="mt-4">
          <p className="text-[13px] font-semibold text-white mb-2.5">
            Runtime Logs
          </p>

          <div className="bg-[#06060f] border border-white/[0.06] rounded-xl overflow-hidden">
            <div className="p-4 font-mono text-[11px] space-y-0.5 max-h-60 overflow-y-auto">
              {rtLogs.map((l: string, i: number) => (
                <p key={i} className="text-slate-300">{l}</p>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
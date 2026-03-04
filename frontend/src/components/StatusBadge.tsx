const cfg: Record<string, { label: string; cls: string; dot: string }> = {
  running:    { label: "Running",     cls: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", dot: "bg-emerald-400 animate-pulse" },
  active:     { label: "Active",      cls: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", dot: "bg-emerald-400 animate-pulse" },
  building:   { label: "Building",    cls: "bg-amber-500/10 text-amber-400 border-amber-500/20",       dot: "bg-amber-400 animate-ping" },
  deploying:  { label: "Deploying",   cls: "bg-blue-500/10 text-blue-400 border-blue-500/20",          dot: "bg-blue-400 animate-pulse" },
  queued:     { label: "Queued",      cls: "bg-slate-500/10 text-slate-400 border-slate-500/20",       dot: "bg-slate-400" },
  failed:     { label: "Failed",      cls: "bg-red-500/10 text-red-400 border-red-500/20",             dot: "bg-red-400" },
  stopped:    { label: "Stopped",     cls: "bg-slate-500/10 text-slate-400 border-slate-500/20",       dot: "bg-slate-600" },
  rolled_back:{ label: "Rolled Back", cls: "bg-purple-500/10 text-purple-400 border-purple-500/20",    dot: "bg-purple-400" },
  healthy:    { label: "Healthy",     cls: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", dot: "bg-emerald-400 animate-pulse" },
  unhealthy:  { label: "Unhealthy",   cls: "bg-red-500/10 text-red-400 border-red-500/20",             dot: "bg-red-400" },
};

export function StatusBadge({ status }: { status: string }) {
  const s = cfg[status] || { label: status, cls: "bg-slate-500/10 text-slate-400 border-slate-500/20", dot: "bg-slate-400" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border ${s.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

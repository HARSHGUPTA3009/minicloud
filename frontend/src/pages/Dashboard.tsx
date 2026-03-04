import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { projectsApi } from "../lib/api";
import { StatusBadge } from "../components/StatusBadge";
import { Layers, Activity, Zap, TrendingUp, GitBranch, Clock, Plus } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function Dashboard() {
  const { data: projects = [] } = useQuery({ queryKey: ["projects"], queryFn: projectsApi.list });
  const stats = [
    { label: "Total", value: projects.length, icon: Layers, color: "text-violet-400", bg: "bg-violet-500/10" },
    { label: "Active", value: projects.filter((p: any)=>p.status==="active").length, icon: Activity, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { label: "Building", value: projects.filter((p: any)=>p.status==="building").length, icon: Zap, color: "text-amber-400", bg: "bg-amber-500/10" },
    { label: "Failed", value: projects.filter((p: any)=>p.status==="failed").length, icon: TrendingUp, color: "text-red-400", bg: "bg-red-500/10" },
  ];
  return (
    <div className="p-7">
      <div className="mb-7">
        <h1 className="text-xl font-bold text-white mb-0.5">Dashboard</h1>
        <p className="text-white/35 text-[13px]">Platform overview</p>
      </div>
      <div className="grid grid-cols-4 gap-3 mb-7">
        {stats.map(s => (
          <div key={s.label} className="bg-[#0c0c18] border border-white/[0.06] rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-white/40 text-[12px]">{s.label}</span>
              <div className={`w-7 h-7 ${s.bg} rounded-lg flex items-center justify-center`}><s.icon className={`w-3.5 h-3.5 ${s.color}`} /></div>
            </div>
            <p className="text-2xl font-bold text-white">{s.value}</p>
          </div>
        ))}
      </div>
      <div className="bg-[#0c0c18] border border-white/[0.06] rounded-xl">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.06]">
          <h2 className="text-[14px] font-semibold text-white">Projects</h2>
          <Link to="/projects/new" className="flex items-center gap-1.5 text-[11px] bg-violet-600 hover:bg-violet-500 text-white px-2.5 py-1.5 rounded-lg transition-colors">
            <Plus className="w-3 h-3" /> New
          </Link>
        </div>
        <div className="divide-y divide-white/[0.05]">
          {projects.slice(0, 8).map((p: any) => (
            <Link key={p.id} to={`/projects/${p.id}`} className="flex items-center justify-between px-5 py-3.5 hover:bg-white/[0.02] transition-colors group">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-violet-500/15 to-indigo-600/15 border border-violet-500/15 rounded-lg flex items-center justify-center">
                  <GitBranch className="w-3.5 h-3.5 text-violet-400" />
                </div>
                <div>
                  <p className="text-[13px] font-medium text-white group-hover:text-violet-300 transition-colors">{p.name}</p>
                  <p className="text-[11px] text-white/25">{p.subdomain}.localhost</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={p.status} />
                <span className="flex items-center gap-1 text-[11px] text-white/25"><Clock className="w-3 h-3" />{formatDistanceToNow(new Date(p.updatedAt), { addSuffix: true })}</span>
              </div>
            </Link>
          ))}
          {projects.length === 0 && (
            <div className="px-5 py-10 text-center">
              <p className="text-white/25 text-[13px]">No projects yet.</p>
              <Link to="/projects/new" className="text-violet-400 text-[13px] hover:text-violet-300 mt-1 inline-block">Create your first →</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

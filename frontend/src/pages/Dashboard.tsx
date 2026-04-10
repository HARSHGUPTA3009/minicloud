import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { projectsApi } from "../lib/api";
import { StatusBadge } from "../components/StatusBadge";
import { Layers, Activity, Zap, AlertCircle, ArrowRight, Plus, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const STATS = [
  { label: "Total",    filter: () => true,                     icon: Layers,      sub: "projects"  },
  { label: "Active",   filter: (p: any) => p.status==="active",   icon: Activity,    sub: "running now" },
  { label: "Building", filter: (p: any) => p.status==="building", icon: Zap,         sub: "in progress" },
  { label: "Failed",   filter: (p: any) => p.status==="failed",   icon: AlertCircle, sub: "needs attention" },
];

export default function Dashboard() {
  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: projectsApi.list,
  });

  return (
    <div className="p-8 bg-neutral-50 min-h-screen font-mono">

      {/* Header */}
      <div className="flex items-end justify-between mb-7">
        <div>
          <h1 className="font-serif italic text-[22px] text-neutral-900">Dashboard</h1>
          <p className="text-[10px] text-neutral-400 tracking-widest uppercase mt-1">Platform overview</p>
        </div>
        <Link
          to="/projects/new"
          className="flex items-center gap-2 bg-neutral-900 text-white text-[10px] tracking-[0.6px] uppercase font-medium px-3.5 py-2 rounded-sm hover:bg-neutral-700 transition-colors"
        >
          <Plus className="w-3 h-3" />
          New project
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-2.5 mb-7">
        {STATS.map(({ label, filter, icon: Icon, sub }) => (
          <div key={label} className="bg-white border border-neutral-200 rounded-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] text-neutral-400 tracking-[0.8px] uppercase">{label}</span>
              <Icon className="w-3.5 h-3.5 text-neutral-300" strokeWidth={1.5} />
            </div>
            <p className="text-[28px] font-medium text-neutral-900 leading-none tracking-tight">
              {label === "Total" ? projects.length : projects.filter(filter).length}
            </p>
            <p className="text-[11px] text-neutral-400 mt-1">{sub}</p>
          </div>
        ))}
      </div>

      {/* Projects table */}
      <div className="bg-white border border-neutral-200 rounded-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-100">
          <span className="text-[10px] text-neutral-500 tracking-[0.6px] uppercase font-medium">Projects</span>
          <span className="text-[11px] text-neutral-400">{projects.length} total</span>
        </div>

        <div className="divide-y divide-neutral-100">
          {projects.slice(0, 8).map((p: any) => (
            <Link
              key={p.id}
              to={`/projects/${p.id}`}
              className="flex items-center justify-between px-5 py-3.5 hover:bg-neutral-50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 bg-neutral-100 border border-neutral-200 rounded-sm flex items-center justify-center">
                  <ArrowRight className="w-3 h-3 text-neutral-400" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-[13px] font-medium text-neutral-900 group-hover:text-neutral-600 transition-colors">
                    {p.name}
                  </p>
                  <p className="text-[11px] text-neutral-400 mt-0.5">{p.subdomain}.localhost</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <StatusBadge status={p.status} />
                <span className="flex items-center gap-1.5 text-[11px] text-neutral-400">
                  <Clock className="w-3 h-3" strokeWidth={1.5} />
                  {formatDistanceToNow(new Date(p.updatedAt), { addSuffix: true })}
                </span>
              </div>
            </Link>
          ))}

          {projects.length === 0 && (
            <div className="px-5 py-12 text-center">
              <p className="text-[13px] text-neutral-400 mb-2">No projects yet.</p>
              <Link
                to="/projects/new"
                className="text-[12px] text-neutral-900 underline underline-offset-2 hover:text-neutral-500 transition-colors"
              >
                Create your first →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
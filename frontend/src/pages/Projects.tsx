import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { projectsApi } from "../lib/api";
import { StatusBadge } from "../components/StatusBadge";
import { Plus, Trash2, ExternalLink, Rocket, ArrowRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function Projects() {
  const qc = useQueryClient();
  const { data: projects = [], isLoading } = useQuery({ queryKey: ["projects"], queryFn: projectsApi.list });
  const del = useMutation({ mutationFn: (id: string) => projectsApi.delete(id), onSuccess: () => qc.invalidateQueries({ queryKey: ["projects"] }) });
  const deploy = useMutation({ mutationFn: (id: string) => projectsApi.deploy(id), onSuccess: () => qc.invalidateQueries({ queryKey: ["projects"] }) });

  return (
    <div className="p-8 font-mono">
      <div className="flex items-end justify-between mb-7">
        <div>
          <h1 className="font-serif italic text-[22px] text-neutral-900">Projects</h1>
          <p className="text-[10px] text-neutral-400 tracking-widest uppercase mt-1">{projects.length} total</p>
        </div>
        <Link to="/projects/new" className="flex items-center gap-2 bg-neutral-900 text-white text-[10px] tracking-[0.6px] uppercase font-medium px-3.5 py-2 rounded-sm hover:bg-neutral-700 transition-colors">
          <Plus className="w-3 h-3" /> New project
        </Link>
      </div>

      {isLoading ? (
        <p className="text-[13px] text-neutral-400">Loading…</p>
      ) : (
        <div className="bg-white border border-neutral-200 rounded-sm overflow-hidden divide-y divide-neutral-100">
          {projects.map((p: any) => {
            const activeDep = p.activeDeployment;
            return (
              <div key={p.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-neutral-50 transition-colors">
                <Link to={`/projects/${p.id}`} className="flex items-center gap-3 flex-1 min-w-0 group">
                  <div className="w-7 h-7 bg-neutral-100 border border-neutral-200 rounded-sm flex items-center justify-center flex-shrink-0">
                    <ArrowRight className="w-3 h-3 text-neutral-400" strokeWidth={1.5} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2.5">
                      <span className="text-[13px] font-medium text-neutral-900 truncate group-hover:text-neutral-600 transition-colors">{p.name}</span>
                      <StatusBadge status={p.status} />
                    </div>
                    <p className="text-[11px] text-neutral-400 mt-0.5 truncate">
                      {p.githubRepo} · {formatDistanceToNow(new Date(p.updatedAt), { addSuffix: true })}
                    </p>
                  </div>
                </Link>

                <div className="flex items-center gap-1 ml-3">
                  {activeDep?.localUrl && (
                    <a href={activeDep.localUrl} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
                      className="px-2 py-1 rounded-sm text-[11px] text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors">
                      :{activeDep.deploymentPort}
                    </a>
                  )}
                  {activeDep?.deploymentUrl && (
                    <a href={activeDep.deploymentUrl} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
                      className="p-1.5 rounded-sm text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors">
                      <ExternalLink className="w-3.5 h-3.5" strokeWidth={1.5} />
                    </a>
                  )}
                  <button onClick={() => deploy.mutate(p.id)} disabled={p.status === "building"}
                    className="p-1.5 rounded-sm text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 disabled:opacity-30 transition-colors">
                    <Rocket className="w-3.5 h-3.5" strokeWidth={1.5} />
                  </button>
                  <button onClick={() => confirm(`Delete ${p.name}?`) && del.mutate(p.id)}
                    className="p-1.5 rounded-sm text-neutral-300 hover:text-red-600 hover:bg-red-50 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
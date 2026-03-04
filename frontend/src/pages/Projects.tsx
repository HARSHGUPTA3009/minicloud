import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { projectsApi } from "../lib/api";
import { StatusBadge } from "../components/StatusBadge";
import { GitBranch, Plus, Trash2, ExternalLink, Rocket } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function Projects() {
  const qc = useQueryClient();

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: projectsApi.list,
  });

  const del = useMutation({
    mutationFn: (id: string) => projectsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects"] }),
  });

  const deploy = useMutation({
    mutationFn: (id: string) => projectsApi.deploy(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects"] }),
  });

  return (
    <div className="p-7">
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-xl font-bold text-white">Projects</h1>
          <p className="text-white/35 text-[13px] mt-0.5">
            {projects.length} projects
          </p>
        </div>

        <Link
          to="/projects/new"
          className="flex items-center gap-1.5 px-3.5 py-2 bg-violet-600 hover:bg-violet-500 rounded-xl text-[13px] text-white font-medium"
        >
          <Plus className="w-3.5 h-3.5" /> New Project
        </Link>
      </div>

      {isLoading ? (
        <p className="text-white/30 text-[13px]">Loading…</p>
      ) : (
        <div className="space-y-2.5">
          {projects.map((p: any) => {
            const activeDep = p.activeDeployment;

            return (
              <div
                key={p.id}
                className="bg-[#0c0c18] border border-white/[0.06] rounded-xl p-4 flex items-center justify-between"
              >
                <Link
                  to={`/projects/${p.id}`}
                  className="flex items-center gap-3.5 flex-1 min-w-0"
                >
                  <GitBranch className="w-4 h-4 text-violet-400" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2.5">
                      <h3 className="text-[13px] font-semibold text-white truncate">
                        {p.name}
                      </h3>
                      <StatusBadge status={p.status} />
                    </div>

                    <div className="flex items-center gap-2.5 text-[11px] text-white/25 mt-0.5">
                      <span className="truncate">{p.githubRepo}</span>
                      <span>·</span>
                      <span>
                        {formatDistanceToNow(new Date(p.updatedAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  </div>
                </Link>

                <div className="flex items-center gap-1 ml-3">
                  {activeDep?.localUrl && (
                    <a
                      href={activeDep.localUrl}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1 px-2 py-1 rounded-lg text-white/40 hover:text-white text-[11px] font-mono transition-colors"
                    >
                      :{activeDep.deploymentPort}
                    </a>
                  )}

                  {activeDep?.deploymentUrl && (
                    <a
                      href={activeDep.deploymentUrl}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="p-1.5 rounded-lg text-white/40 hover:text-white transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}

                  <button
                    onClick={() => deploy.mutate(p.id)}
                    disabled={p.status === "building"}
                    className="p-1.5 rounded-lg text-white/25 hover:text-violet-400 transition-colors"
                  >
                    <Rocket className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() =>
                      confirm(`Delete ${p.name}?`) && del.mutate(p.id)
                    }
                    className="p-1.5 rounded-lg text-white/20 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
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
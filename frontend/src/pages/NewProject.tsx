import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { projectsApi } from "../lib/api";
import { GitBranch, Zap } from "lucide-react";

const inp = "w-full bg-white border border-neutral-200 rounded-sm px-3.5 py-2.5 text-neutral-900 text-[13px] font-mono focus:outline-none focus:border-neutral-900 placeholder:text-neutral-300 transition-colors";

export default function NewProject() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [form, setForm] = useState({
    name: "", githubRepo: "", githubBranch: "main", autoRedeploy: true,
    resourceLimits: { cpuShares: 512, memoryMb: 512, storageGb: 5 },
  });

  const mut = useMutation({
    mutationFn: () => projectsApi.create(form),
    onSuccess: (p) => { qc.invalidateQueries({ queryKey: ["projects"] }); navigate(`/projects/${p.id}`); },
  });

  const RESOURCES = [
    { k: "cpuShares", l: "CPU shares", min: 64,  max: 1024, step: 64  },
    { k: "memoryMb",  l: "Memory MB",  min: 128, max: 4096, step: 128 },
    { k: "storageGb", l: "Storage GB", min: 1,   max: 50,   step: 1   },
  ];

  return (
    <div className="p-8 max-w-xl font-mono">
      <h1 className="font-serif italic text-[22px] text-neutral-900 mb-1">New project</h1>
      <p className="text-[10px] text-neutral-400 tracking-widest uppercase mb-7">Connect a GitHub repository</p>

      <div className="space-y-4">
        {/* Repository */}
        <section className="bg-white border border-neutral-200 rounded-sm p-5 space-y-4">
          <p className="text-[10px] text-neutral-400 tracking-widest uppercase">Repository</p>
          <div>
            <label className="text-[10px] text-neutral-400 tracking-widest uppercase block mb-2">Project name</label>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="my-app" className={inp} />
          </div>
          <div>
            <label className="text-[10px] text-neutral-400 tracking-widest uppercase block mb-2">GitHub URL</label>
            <div className="flex items-center gap-2 bg-white border border-neutral-200 rounded-sm px-3.5 py-2.5 focus-within:border-neutral-900 transition-colors">
              <GitBranch className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" strokeWidth={1.5} />
              <input value={form.githubRepo} onChange={e => setForm({ ...form, githubRepo: e.target.value })}
                placeholder="https://github.com/user/repo"
                className="flex-1 bg-transparent text-neutral-900 text-[13px] font-mono focus:outline-none placeholder:text-neutral-300" />
            </div>
          </div>
          <div>
            <label className="text-[10px] text-neutral-400 tracking-widest uppercase block mb-2">Branch</label>
            <input value={form.githubBranch} onChange={e => setForm({ ...form, githubBranch: e.target.value })} className={inp} />
          </div>
        </section>

        {/* Resources */}
        <section className="bg-white border border-neutral-200 rounded-sm p-5">
          <p className="text-[10px] text-neutral-400 tracking-widest uppercase mb-4">Resources</p>
          <div className="grid grid-cols-3 gap-3">
            {RESOURCES.map(({ k, l, min, max, step }) => (
              <div key={k}>
                <label className="text-[10px] text-neutral-400 tracking-widest uppercase block mb-2">{l}</label>
                <input type="number" min={min} max={max} step={step}
                  value={(form.resourceLimits as any)[k]}
                  onChange={e => setForm({ ...form, resourceLimits: { ...form.resourceLimits, [k]: parseInt(e.target.value) } })}
                  className={inp} />
              </div>
            ))}
          </div>
        </section>

        {/* Auto-redeploy toggle */}
        <section className="bg-white border border-neutral-200 rounded-sm p-5">
          <label className="flex items-center gap-4 cursor-pointer" onClick={() => setForm({ ...form, autoRedeploy: !form.autoRedeploy })}>
            <div className={`w-9 h-5 rounded-sm transition-colors relative flex-shrink-0 ${form.autoRedeploy ? "bg-neutral-900" : "bg-neutral-200"}`}>
              <div className={`w-3.5 h-3.5 bg-white rounded-sm absolute top-[3px] transition-all ${form.autoRedeploy ? "left-[18px]" : "left-[3px]"}`} />
            </div>
            <div>
              <p className="text-[13px] font-medium text-neutral-900">Auto-redeploy on push</p>
              <p className="text-[11px] text-neutral-400 mt-0.5">Deploy automatically when you push to this branch</p>
            </div>
          </label>
        </section>

        <button
          onClick={() => mut.mutate()}
          disabled={mut.isPending || !form.name || !form.githubRepo}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-neutral-900 hover:bg-neutral-700 disabled:opacity-40 rounded-sm text-white text-[10px] tracking-[0.6px] uppercase font-medium transition-colors"
        >
          <Zap className="w-3.5 h-3.5" strokeWidth={1.5} />
          {mut.isPending ? "Creating…" : "Create project"}
        </button>

        {mut.error && (
          <p className="text-[11px] text-red-700 text-center bg-red-50 border border-red-200 rounded-sm px-3 py-2">
            {(mut.error as any).response?.data?.error || "Something went wrong"}
          </p>
        )}
      </div>
    </div>
  );
}
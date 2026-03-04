import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { projectsApi } from "../lib/api";
import { GitBranch, Zap, Cpu } from "lucide-react";

export default function NewProject() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [form, setForm] = useState({ name: "", githubRepo: "", githubBranch: "main", autoRedeploy: true, resourceLimits: { cpuShares: 512, memoryMb: 512, storageGb: 5 } });
  const mut = useMutation({ mutationFn: () => projectsApi.create(form), onSuccess: p => { qc.invalidateQueries({ queryKey: ["projects"] }); navigate(`/projects/${p.id}`); } });

  const inp = "w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-white text-[13px] focus:outline-none focus:border-violet-500/40 placeholder:text-white/20";

  return (
    <div className="p-7 max-w-xl">
      <h1 className="text-xl font-bold text-white mb-0.5">New Project</h1>
      <p className="text-white/35 text-[13px] mb-6">Connect a GitHub repository to deploy</p>
      <div className="space-y-4">
        <div className="bg-[#0c0c18] border border-white/[0.06] rounded-xl p-5 space-y-4">
          <h3 className="text-[13px] font-semibold text-white">Repository</h3>
          <div><label className="text-[12px] text-white/40 block mb-1.5">Project Name</label><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="my-app" className={inp} /></div>
          <div><label className="text-[12px] text-white/40 block mb-1.5">GitHub URL</label>
            <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 py-2.5 focus-within:border-violet-500/40">
              <GitBranch className="w-3.5 h-3.5 text-white/30" />
              <input value={form.githubRepo} onChange={e=>setForm({...form,githubRepo:e.target.value})} placeholder="https://github.com/user/repo" className="flex-1 bg-transparent text-white text-[13px] focus:outline-none placeholder:text-white/20" />
            </div>
          </div>
          <div><label className="text-[12px] text-white/40 block mb-1.5">Branch</label><input value={form.githubBranch} onChange={e=>setForm({...form,githubBranch:e.target.value})} className={inp} /></div>
        </div>
        <div className="bg-[#0c0c18] border border-white/[0.06] rounded-xl p-5">
          <h3 className="text-[13px] font-semibold text-white mb-4">Resources</h3>
          <div className="grid grid-cols-3 gap-3">
            {[{k:"cpuShares",l:"CPU Shares",min:64,max:1024,step:64},{k:"memoryMb",l:"Memory MB",min:128,max:4096,step:128},{k:"storageGb",l:"Storage GB",min:1,max:50,step:1}].map(({k,l,min,max,step})=>(
              <div key={k}><label className="text-[11px] text-white/40 block mb-1.5">{l}</label>
                <input type="number" min={min} max={max} step={step} value={(form.resourceLimits as any)[k]} onChange={e=>setForm({...form,resourceLimits:{...form.resourceLimits,[k]:parseInt(e.target.value)}})} className={inp} />
              </div>
            ))}
          </div>
        </div>
        <div className="bg-[#0c0c18] border border-white/[0.06] rounded-xl p-4">
          <label className="flex items-center gap-3 cursor-pointer" onClick={()=>setForm({...form,autoRedeploy:!form.autoRedeploy})}>
            <div className={`w-9 h-5 rounded-full transition-colors relative ${form.autoRedeploy?"bg-violet-600":"bg-white/10"}`}>
              <div className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.75 transition-all ${form.autoRedeploy?"left-4.5":"left-0.75"}`} />
            </div>
            <div><p className="text-[13px] font-medium text-white">Auto-redeploy on push</p><p className="text-[11px] text-white/35">Deploy automatically when you push to this branch</p></div>
          </label>
        </div>
        <button onClick={()=>mut.mutate()} disabled={mut.isPending||!form.name||!form.githubRepo} className="w-full flex items-center justify-center gap-2 py-2.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 rounded-xl text-white text-[13px] font-semibold transition-colors">
          <Zap className="w-3.5 h-3.5" />{mut.isPending?"Creating…":"Create Project"}
        </button>
        {mut.error && <p className="text-red-400 text-[12px] text-center">{(mut.error as any).response?.data?.error||"Failed"}</p>}
      </div>
    </div>
  );
}

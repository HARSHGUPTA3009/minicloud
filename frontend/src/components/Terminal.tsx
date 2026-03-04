import { useEffect, useRef } from "react";

interface LogEntry { timestamp: string; level: string; message: string; source: string; }
const lc: Record<string, string> = { info: "text-slate-300", warn: "text-amber-400", error: "text-red-400", debug: "text-slate-500" };
const sc: Record<string, string> = { build: "text-violet-400", deploy: "text-blue-400", runtime: "text-emerald-400", system: "text-slate-500" };

export function Terminal({ logs, title = "Logs" }: { logs: LogEntry[]; title?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { ref.current?.scrollIntoView({ behavior: "smooth" }); }, [logs]);
  return (
    <div className="bg-[#06060f] border border-white/[0.06] rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-white/[0.02] border-b border-white/[0.06]">
        <div className="flex gap-1.5">
          {["bg-red-500/50","bg-amber-500/50","bg-emerald-500/50"].map((c,i)=><div key={i} className={`w-2.5 h-2.5 rounded-full ${c}`}/>)}
        </div>
        <span className="text-white/30 text-[11px] ml-1 font-mono">{title}</span>
      </div>
      <div className="p-4 font-mono text-[11px] space-y-0.5 max-h-80 overflow-y-auto">
        {logs.length === 0 ? <p className="text-white/20 italic">Waiting for logs...</p> : logs.map((l, i) => (
          <div key={i} className="flex gap-3 leading-5">
            <span className="text-white/20 flex-shrink-0 tabular-nums">{new Date(l.timestamp).toLocaleTimeString()}</span>
            <span className={`flex-shrink-0 w-14 ${sc[l.source] || "text-slate-500"}`}>[{l.source}]</span>
            <span className={lc[l.level] || "text-slate-300"}>{l.message}</span>
          </div>
        ))}
        <div ref={ref} />
      </div>
    </div>
  );
}

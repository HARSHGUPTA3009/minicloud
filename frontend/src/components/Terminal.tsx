import { useEffect, useRef } from "react";

interface LogEntry { timestamp: string; level: string; message: string; source: string; }

const LEVEL_COLOR: Record<string, string> = {
  info:  "text-neutral-700",
  warn:  "text-amber-700",
  error: "text-red-700",
  debug: "text-neutral-400",
};

const SOURCE_COLOR: Record<string, string> = {
  build:   "text-neutral-500",
  deploy:  "text-neutral-500",
  runtime: "text-neutral-500",
  system:  "text-neutral-400",
};

export function Terminal({ logs, title = "Logs" }: { logs: LogEntry[]; title?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { ref.current?.scrollIntoView({ behavior: "smooth" }); }, [logs]);

  return (
    <div className="bg-neutral-950 border border-neutral-800 rounded-sm overflow-hidden">
      {/* Bar */}
      <div className="flex items-center gap-3 px-4 py-2.5 bg-neutral-900 border-b border-neutral-800">
        <div className="flex gap-1.5">
          {["bg-neutral-600", "bg-neutral-600", "bg-neutral-600"].map((c, i) => (
            <div key={i} className={`w-2.5 h-2.5 rounded-full ${c}`} />
          ))}
        </div>
        <span className="text-neutral-500 text-[11px] font-mono">{title}</span>
      </div>

      {/* Log lines */}
      <div className="p-4 font-mono text-[11px] space-y-0.5 max-h-80 overflow-y-auto">
        {logs.length === 0 ? (
          <p className="text-neutral-600 italic">Waiting for logs...</p>
        ) : (
          logs.map((l, i) => (
            <div key={i} className="flex gap-3 leading-5">
              <span className="text-neutral-600 flex-shrink-0 tabular-nums">
                {new Date(l.timestamp).toLocaleTimeString()}
              </span>
              <span className={`flex-shrink-0 w-14 ${SOURCE_COLOR[l.source] ?? "text-neutral-500"}`}>
                [{l.source}]
              </span>
              <span className={LEVEL_COLOR[l.level] ?? "text-neutral-300"}>{l.message}</span>
            </div>
          ))
        )}
        <div ref={ref} />
      </div>
    </div>
  );
}
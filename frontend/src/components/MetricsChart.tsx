import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { format } from "date-fns";

interface Metric { timestamp: string; cpu: number; memory: number; networkIn: number; networkOut: number; }
const tt = { contentStyle: { background: "#0c0c18", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, fontSize: 11 }, labelStyle: { color: "rgba(255,255,255,0.4)" } };
const ax = { tick: { fill: "rgba(255,255,255,0.25)", fontSize: 10 }, axisLine: false, tickLine: false };

export function CpuMemChart({ data }: { data: Metric[] }) {
  const d = data.map(m => ({ time: format(new Date(m.timestamp), "HH:mm"), cpu: Math.round(m.cpu), mem: Math.round(m.memory) }));
  return (
    <div className="bg-[#0c0c18] border border-white/[0.06] rounded-xl p-5">
      <p className="text-[12px] font-medium text-white/50 mb-4">CPU & Memory</p>
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={d}>
          <defs>
            <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.25}/><stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/></linearGradient>
            <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis dataKey="time" {...ax} />
          <YAxis {...ax} unit="%" />
          <Tooltip {...tt} />
          <Area type="monotone" dataKey="cpu" stroke="#8b5cf6" fill="url(#g1)" strokeWidth={1.5} name="CPU %" />
          <Area type="monotone" dataKey="mem" stroke="#3b82f6" fill="url(#g2)" strokeWidth={1.5} name="Mem MB" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function NetworkChart({ data }: { data: Metric[] }) {
  const d = data.map(m => ({ time: format(new Date(m.timestamp), "HH:mm"), in: Math.round(m.networkIn/1024), out: Math.round(m.networkOut/1024) }));
  return (
    <div className="bg-[#0c0c18] border border-white/[0.06] rounded-xl p-5">
      <p className="text-[12px] font-medium text-white/50 mb-4">Network I/O (KB)</p>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={d}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis dataKey="time" {...ax} />
          <YAxis {...ax} />
          <Tooltip {...tt} />
          <Line type="monotone" dataKey="in" stroke="#10b981" strokeWidth={1.5} dot={false} name="In KB" />
          <Line type="monotone" dataKey="out" stroke="#f59e0b" strokeWidth={1.5} dot={false} name="Out KB" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

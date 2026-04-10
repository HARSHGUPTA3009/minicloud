import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LineChart, Line,
} from "recharts";
import { format } from "date-fns";

interface Metric { timestamp: string; cpu: number; memory: number; networkIn: number; networkOut: number; }

const TOOLTIP = {
  contentStyle: {
    background: "#fff",
    border: "1px solid #e5e5e5",
    borderRadius: 2,
    fontSize: 11,
    fontFamily: "monospace",
    color: "#111",
  },
  labelStyle: { color: "#888" },
};

const AXIS = {
  tick: { fill: "#aaa", fontSize: 10, fontFamily: "monospace" },
  axisLine: false,
  tickLine: false,
};

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-neutral-200 rounded-sm p-5">
      <p className="text-[10px] text-neutral-400 tracking-widest uppercase mb-4 font-mono">{title}</p>
      {children}
    </div>
  );
}

export function CpuMemChart({ data }: { data: Metric[] }) {
  const d = data.map(m => ({
    time: format(new Date(m.timestamp), "HH:mm"),
    cpu: Math.round(m.cpu),
    mem: Math.round(m.memory),
  }));
  return (
    <ChartCard title="CPU & Memory">
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={d}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="time" {...AXIS} />
          <YAxis {...AXIS} unit="%" />
          <Tooltip {...TOOLTIP} />
          <Area type="monotone" dataKey="cpu" stroke="#111" fill="#f1f1f1" strokeWidth={1.5} name="CPU %" />
          <Area type="monotone" dataKey="mem" stroke="#888" fill="#f8f8f8" strokeWidth={1.5} name="Mem MB" />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function NetworkChart({ data }: { data: Metric[] }) {
  const d = data.map(m => ({
    time: format(new Date(m.timestamp), "HH:mm"),
    in: Math.round(m.networkIn / 1024),
    out: Math.round(m.networkOut / 1024),
  }));
  return (
    <ChartCard title="Network I/O (KB)">
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={d}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="time" {...AXIS} />
          <YAxis {...AXIS} />
          <Tooltip {...TOOLTIP} />
          <Line type="monotone" dataKey="in" stroke="#111" strokeWidth={1.5} dot={false} name="In KB" />
          <Line type="monotone" dataKey="out" stroke="#aaa" strokeWidth={1.5} dot={false} strokeDasharray="4 2" name="Out KB" />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
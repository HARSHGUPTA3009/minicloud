const cfg: Record<string, { label: string; cls: string }> = {
  running:     { label: "Running",     cls: "bg-green-50  text-green-800  border-green-200"  },
  active:      { label: "Active",      cls: "bg-green-50  text-green-800  border-green-200"  },
  healthy:     { label: "Healthy",     cls: "bg-green-50  text-green-800  border-green-200"  },
  building:    { label: "Building",    cls: "bg-amber-50  text-amber-800  border-amber-200"  },
  deploying:   { label: "Deploying",   cls: "bg-amber-50  text-amber-800  border-amber-200"  },
  failed:      { label: "Failed",      cls: "bg-red-50    text-red-800    border-red-200"    },
  unhealthy:   { label: "Unhealthy",   cls: "bg-red-50    text-red-800    border-red-200"    },
  stopped:     { label: "Stopped",     cls: "bg-neutral-100 text-neutral-500 border-neutral-200" },
  queued:      { label: "Queued",      cls: "bg-neutral-100 text-neutral-500 border-neutral-200" },
  rolled_back: { label: "Rolled back", cls: "bg-neutral-100 text-neutral-600 border-neutral-300" },
};

export function StatusBadge({ status }: { status: string }) {
  const s = cfg[status] ?? { label: status, cls: "bg-neutral-100 text-neutral-500 border-neutral-200" };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-sm text-[10px] tracking-[0.4px] uppercase font-medium border font-mono ${s.cls}`}>
      {s.label}
    </span>
  );
}
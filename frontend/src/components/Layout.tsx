import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, FolderGit2, Settings, Zap, LogOut, ChevronRight } from "lucide-react";

const nav = [
  { href: "/", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/projects", icon: FolderGit2, label: "Projects" },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  return (
    <div className="flex h-screen bg-[#080810] text-white overflow-hidden">
      <aside className="w-60 flex-shrink-0 bg-[#0c0c18] border-r border-white/[0.06] flex flex-col">
        <div className="h-14 flex items-center px-5 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-violet-500/20">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-semibold text-[15px] tracking-tight">MiniCloud</span>
          </div>
        </div>
        <nav className="flex-1 px-2.5 py-3 space-y-0.5">
          {nav.map(({ href, icon: Icon, label }) => {
            const active = pathname === href || (href !== "/" && pathname.startsWith(href));
            return (
              <Link key={href} to={href} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all ${active ? "bg-violet-500/10 text-violet-300 border border-violet-500/15" : "text-white/40 hover:text-white/75 hover:bg-white/[0.04]"}`}>
                <Icon className="w-4 h-4 flex-shrink-0" />
                {label}
                {active && <ChevronRight className="w-3 h-3 ml-auto opacity-50" />}
              </Link>
            );
          })}
        </nav>
        <div className="p-2.5 border-t border-white/[0.06]">
          <button onClick={() => { localStorage.removeItem("mc_token"); window.location.href = "/login"; }} className="flex items-center gap-2.5 px-3 py-2 w-full rounded-lg text-[13px] text-white/30 hover:text-white/60 hover:bg-white/[0.04] transition-all">
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}

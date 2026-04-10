import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, FolderGit2, LogOut, Zap } from "lucide-react";

const nav = [
  { href: "/", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/projects", icon: FolderGit2, label: "Projects" },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  return (
    <div className="flex h-screen bg-neutral-100 overflow-hidden font-mono">
      <aside className="w-56 flex-shrink-0 bg-white border-r border-neutral-200 flex flex-col">

        {/* Brand */}
        <div className="h-14 flex items-center px-5 border-b border-neutral-200">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-neutral-900 rounded-sm flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" strokeWidth={2} />
            </div>
            <span className="text-[15px] font-medium text-neutral-900 tracking-tight">MiniCloud</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-3 space-y-0.5">
          {nav.map(({ href, icon: Icon, label }) => {
            const active = pathname === href || (href !== "/" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                to={href}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-sm text-[11px] tracking-[0.5px] uppercase font-medium transition-all ${
                  active
                    ? "bg-neutral-900 text-white"
                    : "text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100"
                }`}
              >
                <Icon className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={1.5} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Sign out */}
        <div className="p-3 border-t border-neutral-200">
          <button
            onClick={() => { localStorage.removeItem("mc_token"); window.location.href = "/login"; }}
            className="flex items-center gap-2.5 px-3 py-2 w-full rounded-sm text-[11px] tracking-[0.5px] uppercase text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-all"
          >
            <LogOut className="w-3.5 h-3.5" strokeWidth={1.5} />
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto bg-neutral-50">{children}</main>
    </div>
  );
}
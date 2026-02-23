import { useEffect, useState } from "react";
import { Outlet, useNavigate, Link, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  LayoutDashboard, Bot, GitBranch, Play, FileText, KeyRound, Settings, LogOut, Zap, Menu, X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { title: "Overview", path: "/console", icon: LayoutDashboard },
  { title: "Agents", path: "/console/agents", icon: Bot },
  { title: "Workflows", path: "/console/workflows", icon: GitBranch },
  { title: "Runs", path: "/console/runs", icon: Play },
  { title: "Logs", path: "/console/logs", icon: FileText },
  { title: "Secrets", path: "/console/secrets", icon: KeyRound },
  { title: "Settings", path: "/console/settings", icon: Settings },
];

const ConsoleLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (!session) navigate("/auth");
      else setUser(session.user);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate("/auth");
      else setUser(session.user);
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background flex">
      <div className="fixed inset-0 grain-overlay animate-grain z-50 pointer-events-none" />

      {/* Mobile menu button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-40 md:hidden w-9 h-9 rounded-lg bg-card flex items-center justify-center claw-border"
      >
        {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
      </button>

      {/* Sidebar */}
      <AnimatePresence>
        {(sidebarOpen || true) && (
          <motion.aside
            className={`fixed md:sticky top-0 left-0 h-screen w-56 bg-card/95 backdrop-blur-xl border-r border-border/50 flex flex-col z-30
              ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
              transition-transform duration-200`}
          >
            {/* Logo */}
            <div className="flex items-center gap-2 px-5 py-5 border-b border-border/30">
              <div className="w-7 h-7 rounded-md bg-primary/20 flex items-center justify-center claw-border">
                <Zap className="w-3.5 h-3.5 text-claw-ember" />
              </div>
              <span className="text-sm font-bold gradient-text-claw">NANO CLAW</span>
            </div>

            {/* Status */}
            <div className="px-5 py-3 border-b border-border/30">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Core Online
              </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 py-3 px-3 space-y-0.5 overflow-y-auto">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path ||
                  (item.path !== "/console" && location.pathname.startsWith(item.path));
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                      isActive
                        ? "bg-primary/10 text-primary font-medium claw-border"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.title}
                  </Link>
                );
              })}
            </nav>

            {/* User */}
            <div className="px-3 py-3 border-t border-border/30">
              <div className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground truncate">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-claw-ember text-[10px] font-bold">
                  {user.email?.[0]?.toUpperCase()}
                </div>
                <span className="truncate flex-1">{user.email}</span>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-3 py-2 w-full rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main */}
      <main className="flex-1 min-h-screen overflow-x-hidden">
        <div className="p-6 md:p-8 max-w-6xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default ConsoleLayout;

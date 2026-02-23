import { useEffect, useState } from "react";
import { Outlet, useNavigate, Link, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  LayoutDashboard, Bot, GitBranch, Play, FileText, KeyRound, Settings, LogOut, Menu, X,
  Building2, ChevronDown, Plus
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { OrgProvider, useOrg } from "@/contexts/OrgContext";
import logoImage from "@/assets/nano-claw-logo.jpeg";

const navItems = [
  { title: "Overview", path: "/console", icon: LayoutDashboard },
  { title: "Agents", path: "/console/agents", icon: Bot },
  { title: "Workflows", path: "/console/workflows", icon: GitBranch },
  { title: "Runs", path: "/console/runs", icon: Play },
  { title: "Logs", path: "/console/logs", icon: FileText },
  { title: "Secrets", path: "/console/secrets", icon: KeyRound },
  { title: "Settings", path: "/console/settings", icon: Settings },
];

const OrgSwitcher = () => {
  const { orgs, currentOrg, setCurrentOrg, createOrg } = useOrg();
  const [open, setOpen] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");

  const handleCreate = async () => {
    if (!newName.trim()) return;
    await createOrg(newName.trim());
    setNewName("");
    setShowCreate(false);
    setOpen(false);
  };

  return (
    <div className="relative px-5 py-3 border-b border-border/30">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 w-full text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <Building2 className="w-3.5 h-3.5 text-claw-ember" />
        <span className="truncate flex-1 text-left font-medium text-foreground">
          {currentOrg?.name || "Select org"}
        </span>
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute left-3 right-3 top-full mt-1 z-50 bg-card border border-border/50 rounded-lg shadow-lg overflow-hidden"
          >
            {orgs.map((org) => (
              <button
                key={org.id}
                onClick={() => { setCurrentOrg(org); setOpen(false); }}
                className={`w-full px-3 py-2 text-left text-xs hover:bg-muted/50 transition-colors ${
                  currentOrg?.id === org.id ? "text-claw-ember font-medium" : "text-foreground"
                }`}
              >
                {org.name}
              </button>
            ))}
            {showCreate ? (
              <div className="p-2 border-t border-border/30">
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Org name"
                  autoFocus
                  onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                  className="w-full px-2 py-1.5 rounded bg-input border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring mb-1"
                />
                <div className="flex gap-1">
                  <button onClick={handleCreate} className="flex-1 px-2 py-1 rounded text-xs font-medium text-foreground bg-primary/20 hover:bg-primary/30">Create</button>
                  <button onClick={() => { setShowCreate(false); setNewName(""); }} className="px-2 py-1 rounded text-xs text-muted-foreground hover:text-foreground">Cancel</button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowCreate(true)}
                className="w-full px-3 py-2 text-left text-xs text-claw-ember hover:bg-muted/50 transition-colors border-t border-border/30 flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                New Organization
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const SidebarContent = ({ user, onSignOut, sidebarOpen, setSidebarOpen }: any) => {
  const location = useLocation();
  const { currentRole } = useOrg();

  return (
    <motion.aside
      className={`fixed md:sticky top-0 left-0 h-screen w-56 bg-card/95 backdrop-blur-xl border-r border-border/50 flex flex-col z-30
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        transition-transform duration-200`}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 px-5 py-5 border-b border-border/30">
        <img src={logoImage} alt="Nano Claw" className="w-7 h-7 rounded-md object-cover claw-border" />
        <span className="text-sm font-bold gradient-text-claw">NANO CLAW</span>
      </div>

      {/* Org switcher */}
      <OrgSwitcher />

      {/* Status */}
      <div className="px-5 py-3 border-b border-border/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Core Online
          </div>
          {currentRole && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-claw-ember capitalize">{currentRole}</span>
          )}
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
          onClick={onSignOut}
          className="flex items-center gap-2 px-3 py-2 w-full rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign Out
        </button>
      </div>
    </motion.aside>
  );
};

const ConsoleLayout = () => {
  const navigate = useNavigate();
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
    <OrgProvider userId={user.id}>
      <div className="min-h-screen bg-background flex">
        <div className="fixed inset-0 grain-overlay animate-grain z-50 pointer-events-none" />

        {/* Mobile menu button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="fixed top-4 left-4 z-40 md:hidden w-9 h-9 rounded-lg bg-card flex items-center justify-center claw-border"
        >
          {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>

        <SidebarContent user={user} onSignOut={handleSignOut} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        {/* Main */}
        <main className="flex-1 min-h-screen overflow-x-hidden">
          <div className="p-6 md:p-8 max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </OrgProvider>
  );
};

export default ConsoleLayout;

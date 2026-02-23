import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Search, Loader2 } from "lucide-react";

interface LogEntry {
  id: string;
  level: string;
  message: string;
  agent_name: string | null;
  workflow_name: string | null;
  run_id: string | null;
  created_at: string;
}

const levelColors: Record<string, string> = {
  info: "text-blue-400",
  warn: "text-claw-gold",
  error: "text-destructive",
  debug: "text-muted-foreground",
};

const Logs = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchLogs = async () => {
    let query = supabase.from("logs").select("*").order("created_at", { ascending: false }).limit(100);
    if (search) query = query.ilike("message", `%${search}%`);
    const { data } = await query;
    setLogs(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchLogs(); }, [search]);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-1">Logs</h1>
          <p className="text-sm text-muted-foreground">System and run logs</p>
        </div>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search logs..."
          className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-input border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-claw-ember" /></div>
      ) : logs.length === 0 ? (
        <div className="glass-panel p-12 text-center">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-40" />
          <p className="text-muted-foreground">No logs yet.</p>
        </div>
      ) : (
        <div className="glass-panel overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border/30">
                  <th className="text-left px-4 py-2.5 text-muted-foreground font-medium">Time</th>
                  <th className="text-left px-4 py-2.5 text-muted-foreground font-medium">Level</th>
                  <th className="text-left px-4 py-2.5 text-muted-foreground font-medium">Message</th>
                  <th className="text-left px-4 py-2.5 text-muted-foreground font-medium">Source</th>
                </tr>
              </thead>
              <tbody className="font-mono">
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-border/10 hover:bg-muted/20">
                    <td className="px-4 py-2 text-muted-foreground whitespace-nowrap">{new Date(log.created_at).toLocaleTimeString()}</td>
                    <td className={`px-4 py-2 uppercase font-semibold ${levelColors[log.level] || "text-muted-foreground"}`}>{log.level}</td>
                    <td className="px-4 py-2 text-foreground max-w-md truncate">{log.message}</td>
                    <td className="px-4 py-2 text-muted-foreground">{log.agent_name || log.workflow_name || "system"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Logs;

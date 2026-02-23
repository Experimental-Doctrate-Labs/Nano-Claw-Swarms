import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Play, Loader2, GitBranch, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Run {
  id: string;
  workflow_id: string | null;
  workflow_name: string | null;
  status: string;
  input: string;
  output: string | null;
  error: string | null;
  created_at: string;
  completed_at: string | null;
  events: any;
}

interface Workflow {
  id: string;
  name: string;
}

const statusIcons: Record<string, any> = {
  queued: Clock,
  running: Loader2,
  succeeded: CheckCircle,
  failed: XCircle,
};

const statusColors: Record<string, string> = {
  queued: "text-claw-gold",
  running: "text-claw-ember",
  succeeded: "text-green-400",
  failed: "text-destructive",
};

const Runs = () => {
  const [runs, setRuns] = useState<Run[]>([]);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState("");
  const [input, setInput] = useState("");
  const [expandedRun, setExpandedRun] = useState<string | null>(null);
  const [streamingOutput, setStreamingOutput] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const fetchData = async () => {
    const [rRes, wRes] = await Promise.all([
      supabase.from("runs").select("*").order("created_at", { ascending: false }).limit(50),
      supabase.from("workflows").select("id, name"),
    ]);
    if (!rRes.error) setRuns(rRes.data || []);
    if (!wRes.error) {
      setWorkflows(wRes.data || []);
      if (wRes.data?.length && !selectedWorkflow) setSelectedWorkflow(wRes.data[0].id);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  // Subscribe to run updates
  useEffect(() => {
    const channel = supabase.channel("runs-updates")
      .on("postgres_changes", { event: "*", schema: "public", table: "runs" }, () => fetchData())
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "run_events" }, (payload) => {
        const ev = payload.new as any;
        if (ev.event_type === "chunk") {
          setStreamingOutput(prev => ({
            ...prev,
            [ev.run_id]: (prev[ev.run_id] || "") + (ev.data?.content || ""),
          }));
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const startRun = async () => {
    if (!selectedWorkflow || !input.trim()) return;
    setStarting(true);
    try {
      const res = await supabase.functions.invoke("run-workflow", {
        body: { workflow_id: selectedWorkflow, input: input.trim() },
      });
      if (res.error) throw new Error(res.error.message);
      toast({ title: "Run started" });
      setInput("");
      setExpandedRun(res.data?.run_id);
      fetchData();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setStarting(false);
    }
  };

  const getWorkflowName = (id: string | null) => workflows.find(w => w.id === id)?.name || "Unknown";

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-1">Runs</h1>
        <p className="text-sm text-muted-foreground">Execute and monitor workflow runs</p>
      </div>

      {/* Start run */}
      <div className="glass-panel p-5 mb-6">
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <Play className="w-4 h-4 text-claw-ember" />
          Start New Run
        </h3>
        {workflows.length === 0 ? (
          <p className="text-sm text-muted-foreground">Create a workflow first to start runs.</p>
        ) : (
          <div className="flex flex-col sm:flex-row gap-3">
            <select value={selectedWorkflow} onChange={(e) => setSelectedWorkflow(e.target.value)}
              className="px-3 py-2 rounded-lg bg-input border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring sm:w-48">
              {workflows.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
            <input value={input} onChange={(e) => setInput(e.target.value)}
              placeholder="Enter your prompt..."
              className="flex-1 px-3 py-2 rounded-lg bg-input border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
            <button onClick={startRun} disabled={starting || !input.trim()}
              className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium text-foreground glow-claw transition-all hover:scale-[1.02] disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, hsl(8 100% 56%), hsl(20 100% 58%))" }}>
              {starting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              Run
            </button>
          </div>
        )}
      </div>

      {/* Runs list */}
      {loading ? (
        <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-claw-ember" /></div>
      ) : runs.length === 0 ? (
        <div className="glass-panel p-12 text-center">
          <Play className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-40" />
          <p className="text-muted-foreground">No runs yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {runs.map((run) => {
            const StatusIcon = statusIcons[run.status] || AlertCircle;
            const isExpanded = expandedRun === run.id;
            return (
              <motion.div key={run.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="glass-panel overflow-hidden cursor-pointer" onClick={() => setExpandedRun(isExpanded ? null : run.id)}>
                <div className="p-4 flex items-center gap-4">
                  <StatusIcon className={`w-4 h-4 ${statusColors[run.status] || "text-muted-foreground"} ${run.status === "running" ? "animate-spin" : ""}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground truncate">{run.input}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                      <span className="flex items-center gap-1"><GitBranch className="w-3 h-3" />{run.workflow_name || getWorkflowName(run.workflow_id)}</span>
                      <span>{new Date(run.created_at).toLocaleString()}</span>
                      <span className="capitalize">{run.status}</span>
                    </div>
                  </div>
                </div>
                {isExpanded && (
                  <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} className="border-t border-border/30 p-4">
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Input</label>
                        <pre className="text-xs text-foreground bg-muted/30 p-3 rounded-lg font-mono whitespace-pre-wrap">{run.input}</pre>
                      </div>
                      {(run.output || streamingOutput[run.id]) && (
                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">Output</label>
                          <pre className="text-xs text-foreground bg-muted/30 p-3 rounded-lg font-mono whitespace-pre-wrap max-h-96 overflow-y-auto">
                            {run.output || streamingOutput[run.id]}
                            {run.status === "running" && <span className="animate-pulse">▊</span>}
                          </pre>
                        </div>
                      )}
                      {run.error && (
                        <div>
                          <label className="text-xs text-destructive mb-1 block">Error</label>
                          <pre className="text-xs text-destructive bg-destructive/5 p-3 rounded-lg font-mono whitespace-pre-wrap">{run.error}</pre>
                        </div>
                      )}
                      {(run.events as any[])?.length > 0 && (
                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">Trace</label>
                          <div className="space-y-1">
                            {(run.events as any[]).map((ev: any, i: number) => (
                              <div key={i} className="text-xs bg-muted/20 p-2 rounded font-mono flex items-center gap-2">
                                <span className="text-claw-ember">[{ev.agent_name || `Step ${i + 1}`}]</span>
                                <span className="text-muted-foreground truncate">{ev.content?.substring(0, 200)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Runs;

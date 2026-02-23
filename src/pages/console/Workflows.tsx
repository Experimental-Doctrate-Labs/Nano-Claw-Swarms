import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { GitBranch, Plus, Trash2, X, Loader2, Bot } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Agent {
  id: string;
  name: string;
}

interface WorkflowStep {
  agent_id: string;
  order: number;
}

interface Workflow {
  id: string;
  name: string;
  description: string | null;
  workflow_type: string;
  steps: any;
  created_at: string;
}

const Workflows = () => {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", workflow_type: "sequential", steps: [] as WorkflowStep[] });
  const { toast } = useToast();

  const fetchData = async () => {
    const [wRes, aRes] = await Promise.all([
      supabase.from("workflows").select("*").order("created_at", { ascending: false }),
      supabase.from("agents").select("id, name"),
    ]);
    if (!wRes.error) setWorkflows(wRes.data || []);
    if (!aRes.error) setAgents(aRes.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const addStep = () => {
    if (agents.length === 0) return;
    setForm({ ...form, steps: [...form.steps, { agent_id: agents[0].id, order: form.steps.length }] });
  };

  const removeStep = (idx: number) => {
    setForm({ ...form, steps: form.steps.filter((_, i) => i !== idx).map((s, i) => ({ ...s, order: i })) });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");
      const { error } = await supabase.from("workflows").insert([{
        name: form.name,
        description: form.description || null,
        workflow_type: form.workflow_type,
        steps: form.steps as any,
        user_id: session.user.id,
      }]);
      if (error) throw error;
      toast({ title: "Workflow created" });
      setShowForm(false);
      setForm({ name: "", description: "", workflow_type: "sequential", steps: [] });
      fetchData();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    await supabase.from("workflows").delete().eq("id", id);
    fetchData();
  };

  const getAgentName = (id: string) => agents.find(a => a.id === id)?.name || "Unknown";

  const typeLabels: Record<string, string> = {
    sequential: "Sequential",
    concurrent: "Concurrent",
    hierarchical: "Hierarchical",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-1">Workflows</h1>
          <p className="text-sm text-muted-foreground">Multi-agent orchestration patterns</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-foreground glow-claw transition-all hover:scale-[1.02]"
          style={{ background: "linear-gradient(135deg, hsl(8 100% 56%), hsl(20 100% 58%))" }}
        >
          <Plus className="w-4 h-4" />
          New Workflow
        </button>
      </div>

      {/* Form drawer */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-card/95 backdrop-blur-xl border-l border-border/50 z-40 overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-foreground">New Workflow</h2>
                <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Name</label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-input border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Description</label>
                  <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-input border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Type</label>
                  <select value={form.workflow_type} onChange={(e) => setForm({ ...form, workflow_type: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-input border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                    <option value="sequential">Sequential</option>
                    <option value="concurrent">Concurrent</option>
                    <option value="hierarchical">Hierarchical</option>
                  </select>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs text-muted-foreground">Steps</label>
                    <button onClick={addStep} disabled={agents.length === 0}
                      className="text-xs text-claw-ember hover:underline disabled:opacity-50">
                      + Add Step
                    </button>
                  </div>
                  {agents.length === 0 && (
                    <p className="text-xs text-muted-foreground">Create agents first to add steps.</p>
                  )}
                  <div className="space-y-2">
                    {form.steps.map((step, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground w-6">{idx + 1}.</span>
                        <select value={step.agent_id} onChange={(e) => {
                          const newSteps = [...form.steps];
                          newSteps[idx] = { ...step, agent_id: e.target.value };
                          setForm({ ...form, steps: newSteps });
                        }}
                          className="flex-1 px-3 py-1.5 rounded-lg bg-input border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                          {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                        </select>
                        <button onClick={() => removeStep(idx)} className="text-muted-foreground hover:text-destructive">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                <button onClick={handleSave} disabled={saving || !form.name || form.steps.length === 0}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold text-foreground text-sm glow-claw transition-all hover:scale-[1.02] disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg, hsl(8 100% 56%), hsl(20 100% 58%))" }}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Workflow"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-claw-ember" /></div>
      ) : workflows.length === 0 ? (
        <div className="glass-panel p-12 text-center">
          <GitBranch className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-40" />
          <p className="text-muted-foreground">No workflows yet. Create agents first, then build workflows.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {workflows.map((wf) => (
            <motion.div key={wf.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="glass-panel p-5 group">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center claw-border">
                    <GitBranch className="w-4 h-4 text-claw-ember" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{wf.name}</h3>
                    <p className="text-xs text-muted-foreground">{typeLabels[wf.workflow_type] || wf.workflow_type}</p>
                  </div>
                </div>
                <button onClick={() => handleDelete(wf.id)} className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              {wf.description && <p className="text-xs text-muted-foreground mb-2">{wf.description}</p>}
              <div className="flex items-center gap-1 flex-wrap">
                {(wf.steps as any[])?.map((step: any, idx: number) => (
                  <span key={idx} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-muted text-xs text-muted-foreground">
                    <Bot className="w-3 h-3" />
                    {getAgentName(step.agent_id)}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Workflows;

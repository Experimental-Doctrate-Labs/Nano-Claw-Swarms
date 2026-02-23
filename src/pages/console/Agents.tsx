import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Plus, Pencil, Trash2, Play, Loader2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Agent {
  id: string;
  name: string;
  description: string | null;
  system_prompt: string;
  model_provider: string;
  model_name: string;
  temperature: number;
  max_loops: number;
  created_at: string;
}

const defaultAgent = {
  name: "",
  description: "",
  system_prompt: "You are a helpful AI assistant.",
  model_provider: "openai",
  model_name: "gpt-4o-mini",
  temperature: 0.7,
  max_loops: 1,
};

const Agents = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Agent | null>(null);
  const [form, setForm] = useState(defaultAgent);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchAgents = async () => {
    const { data, error } = await supabase
      .from("agents")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Error loading agents", description: error.message, variant: "destructive" });
    } else {
      setAgents(data || []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchAgents(); }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      if (editing) {
        const { error } = await supabase.from("agents").update({
          name: form.name,
          description: form.description || null,
          system_prompt: form.system_prompt,
          model_provider: form.model_provider,
          model_name: form.model_name,
          temperature: form.temperature,
          max_loops: form.max_loops,
        }).eq("id", editing.id);
        if (error) throw error;
        toast({ title: "Agent updated" });
      } else {
        const { error } = await supabase.from("agents").insert({
          name: form.name,
          description: form.description || null,
          system_prompt: form.system_prompt,
          model_provider: form.model_provider,
          model_name: form.model_name,
          temperature: form.temperature,
          max_loops: form.max_loops,
          user_id: session.user.id,
        });
        if (error) throw error;
        toast({ title: "Agent created" });
      }
      setShowForm(false);
      setEditing(null);
      setForm(defaultAgent);
      fetchAgents();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("agents").delete().eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else fetchAgents();
  };

  const openEdit = (agent: Agent) => {
    setEditing(agent);
    setForm({
      name: agent.name,
      description: agent.description || "",
      system_prompt: agent.system_prompt,
      model_provider: agent.model_provider,
      model_name: agent.model_name,
      temperature: agent.temperature,
      max_loops: agent.max_loops,
    });
    setShowForm(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-1">Agents</h1>
          <p className="text-sm text-muted-foreground">Configure LLM-powered agents</p>
        </div>
        <button
          onClick={() => { setEditing(null); setForm(defaultAgent); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-foreground glow-claw transition-all hover:scale-[1.02]"
          style={{ background: "linear-gradient(135deg, hsl(8 100% 56%), hsl(20 100% 58%))" }}
        >
          <Plus className="w-4 h-4" />
          New Agent
        </button>
      </div>

      {/* Agent form drawer */}
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
                <h2 className="text-lg font-semibold text-foreground">
                  {editing ? "Edit Agent" : "New Agent"}
                </h2>
                <button onClick={() => { setShowForm(false); setEditing(null); }} className="text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
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
                  <label className="text-xs text-muted-foreground mb-1 block">System Prompt</label>
                  <textarea value={form.system_prompt} onChange={(e) => setForm({ ...form, system_prompt: e.target.value })} rows={4}
                    className="w-full px-3 py-2 rounded-lg bg-input border border-border text-sm text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Provider</label>
                    <select value={form.model_provider} onChange={(e) => setForm({ ...form, model_provider: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-input border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                      <option value="openai">OpenAI</option>
                      <option value="anthropic">Anthropic</option>
                      <option value="groq">Groq</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Model</label>
                    <input value={form.model_name} onChange={(e) => setForm({ ...form, model_name: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-input border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Temperature ({form.temperature})</label>
                    <input type="range" min="0" max="2" step="0.1" value={form.temperature}
                      onChange={(e) => setForm({ ...form, temperature: parseFloat(e.target.value) })}
                      className="w-full accent-claw-ember" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Max Loops</label>
                    <input type="number" min="1" max="100" value={form.max_loops}
                      onChange={(e) => setForm({ ...form, max_loops: parseInt(e.target.value) || 1 })}
                      className="w-full px-3 py-2 rounded-lg bg-input border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                  </div>
                </div>
                <button
                  onClick={handleSave}
                  disabled={saving || !form.name}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold text-foreground text-sm glow-claw transition-all hover:scale-[1.02] disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg, hsl(8 100% 56%), hsl(20 100% 58%))" }}
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : (editing ? "Update Agent" : "Create Agent")}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Agent list */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-claw-ember" />
        </div>
      ) : agents.length === 0 ? (
        <div className="glass-panel p-12 text-center">
          <Bot className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-40" />
          <p className="text-muted-foreground">No agents yet. Create one to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {agents.map((agent) => (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel p-5 group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center claw-border">
                    <Bot className="w-4 h-4 text-claw-ember" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{agent.name}</h3>
                    <p className="text-xs text-muted-foreground">{agent.model_provider}/{agent.model_name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(agent)} className="p-1.5 rounded-md hover:bg-muted/50 text-muted-foreground hover:text-foreground">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDelete(agent.id)} className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              {agent.description && (
                <p className="text-xs text-muted-foreground mb-2">{agent.description}</p>
              )}
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>Temp: {agent.temperature}</span>
                <span>Loops: {agent.max_loops}</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Agents;

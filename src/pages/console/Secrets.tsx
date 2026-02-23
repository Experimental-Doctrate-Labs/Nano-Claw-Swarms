import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { KeyRound, Plus, Trash2, Loader2, X, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useOrg } from "@/contexts/OrgContext";

interface SecretEntry { id: string; name: string; provider: string; created_at: string; }

const Secrets = () => {
  const [secrets, setSecrets] = useState<SecretEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", provider: "openai", value: "" });
  const { toast } = useToast();
  const { currentOrg, currentRole } = useOrg();
  const canManage = currentRole === "owner" || currentRole === "admin";

  const fetchSecrets = async () => {
    if (!currentOrg) { setLoading(false); return; }
    const { data } = await supabase.from("provider_keys").select("id, name, provider, created_at").eq("org_id", currentOrg.id).order("created_at", { ascending: false });
    setSecrets(data || []);
    setLoading(false);
  };

  useEffect(() => { setLoading(true); fetchSecrets(); }, [currentOrg?.id]);

  const handleSave = async () => {
    if (!currentOrg) return;
    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");
      const { error } = await supabase.from("provider_keys").insert({
        name: form.name || `${form.provider}-key`,
        provider: form.provider,
        encrypted_key: form.value,
        user_id: session.user.id,
        org_id: currentOrg.id,
      });
      if (error) throw error;
      toast({ title: "Key saved" });
      setShowForm(false);
      setForm({ name: "", provider: "openai", value: "" });
      fetchSecrets();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    await supabase.from("provider_keys").delete().eq("id", id);
    fetchSecrets();
  };

  if (!currentOrg) {
    return <div className="glass-panel p-12 text-center"><KeyRound className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-40" /><p className="text-muted-foreground">Create an organization first.</p></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-2xl font-bold text-foreground mb-1">Secrets</h1><p className="text-sm text-muted-foreground">Manage model provider API keys</p></div>
        {canManage && (
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-foreground glow-claw transition-all hover:scale-[1.02]"
            style={{ background: "linear-gradient(135deg, hsl(8 100% 56%), hsl(20 100% 58%))" }}>
            <Plus className="w-4 h-4" /> Add Key
          </button>
        )}
      </div>

      <div className="glass-panel p-4 mb-6 flex items-start gap-3">
        <AlertTriangle className="w-4 h-4 text-claw-gold mt-0.5 shrink-0" />
        <p className="text-xs text-muted-foreground">API keys are stored securely and only used server-side when executing agent runs.</p>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, x: 300 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-card/95 backdrop-blur-xl border-l border-border/50 z-40 overflow-y-auto">
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">Add API Key</h2>
                <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Provider</label>
                <select value={form.provider} onChange={(e) => setForm({ ...form, provider: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-input border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value="openai">OpenAI</option><option value="anthropic">Anthropic</option><option value="groq">Groq</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Name (optional)</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. production-key"
                  className="w-full px-3 py-2 rounded-lg bg-input border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">API Key</label>
                <input type="password" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} placeholder="sk-..."
                  className="w-full px-3 py-2 rounded-lg bg-input border border-border text-sm text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <button onClick={handleSave} disabled={saving || !form.value}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold text-foreground text-sm glow-claw transition-all hover:scale-[1.02] disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, hsl(8 100% 56%), hsl(20 100% 58%))" }}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Key"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-claw-ember" /></div>
      ) : secrets.length === 0 ? (
        <div className="glass-panel p-12 text-center"><KeyRound className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-40" /><p className="text-muted-foreground">No API keys configured.</p></div>
      ) : (
        <div className="space-y-2">
          {secrets.map((secret) => (
            <div key={secret.id} className="glass-panel p-4 flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <KeyRound className="w-4 h-4 text-claw-ember" />
                <div><p className="text-sm font-medium text-foreground">{secret.name}</p><p className="text-xs text-muted-foreground capitalize">{secret.provider}</p></div>
              </div>
              {canManage && (
                <button onClick={() => handleDelete(secret.id)} className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-3.5 h-3.5" /></button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Secrets;

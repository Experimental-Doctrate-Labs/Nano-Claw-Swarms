import { motion } from "framer-motion";
import { Activity, Bot, GitBranch, Play, TrendingUp } from "lucide-react";

const StatCard = ({ icon: Icon, label, value, sub }: { icon: any; label: string; value: string; sub?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="glass-panel p-5"
  >
    <div className="flex items-center gap-3 mb-3">
      <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center claw-border">
        <Icon className="w-4 h-4 text-claw-ember" />
      </div>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
    <p className="text-2xl font-bold text-foreground">{value}</p>
    {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
  </motion.div>
);

const ConsoleOverview = () => {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-1">Command Bridge</h1>
        <p className="text-sm text-muted-foreground">Overview of your swarm operations</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Bot} label="Active Agents" value="0" sub="Create your first agent" />
        <StatCard icon={GitBranch} label="Workflows" value="0" sub="Build a pipeline" />
        <StatCard icon={Play} label="Total Runs" value="0" sub="No runs yet" />
        <StatCard icon={TrendingUp} label="Tokens Used" value="0" sub="Across all runs" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <Play className="w-4 h-4 text-claw-ember" />
            Recent Runs
          </h3>
          <div className="text-sm text-muted-foreground py-8 text-center">
            No runs yet. Create an agent and workflow to get started.
          </div>
        </div>

        <div className="glass-panel p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-claw-ember" />
            System Health
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">API Status</span>
              <span className="flex items-center gap-2 text-green-400">
                <div className="w-2 h-2 rounded-full bg-green-400" />
                Operational
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Database</span>
              <span className="flex items-center gap-2 text-green-400">
                <div className="w-2 h-2 rounded-full bg-green-400" />
                Connected
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Model Providers</span>
              <span className="flex items-center gap-2 text-claw-ember">
                <div className="w-2 h-2 rounded-full bg-claw-ember" />
                Add API Keys
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsoleOverview;

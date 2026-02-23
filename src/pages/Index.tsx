import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Zap, Bot, Activity, Terminal, Layers } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-lobster.jpg";

const FeatureCard = ({ icon: Icon, title, description, delay, className = "" }: { icon: any; title: string; description: string; delay: number; className?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ delay, duration: 0.7 }}
    whileHover={{ scale: 1.03, y: -4 }}
    className={`glass-panel p-6 group cursor-pointer relative overflow-hidden ${className}`}
  >
    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
      style={{ background: "radial-gradient(circle at 50% 50%, hsl(18 85% 36% / 0.12), transparent 70%)" }}
    />
    <div className="relative z-10">
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 claw-border">
        <Icon className="w-5 h-5 text-claw-ember" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  </motion.div>
);

const StatBlock = ({ value, label, delay }: { value: string; label: string; delay: number }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.5 }}
    className="text-center"
  >
    <div className="text-3xl md:text-4xl font-bold gradient-text-claw">{value}</div>
    <div className="text-xs text-muted-foreground mt-1 uppercase tracking-widest">{label}</div>
  </motion.div>
);

const Index = () => {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Grain overlay */}
      <div className="fixed inset-0 grain-overlay animate-grain z-50 pointer-events-none" />

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 md:px-12 py-5 bg-background/60 backdrop-blur-lg border-b border-border/20">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center claw-border">
            <Zap className="w-4 h-4 text-claw-ember" />
          </div>
          <span className="text-lg font-bold gradient-text-claw">NANO CLAW</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/auth" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Sign In
          </Link>
          <Link
            to="/auth"
            className="text-sm px-4 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors claw-border"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero section — split asymmetric */}
      <section className="relative min-h-screen grid grid-cols-1 lg:grid-cols-[1fr_0.8fr] pt-20">
        {/* Left: Text content */}
        <div className="relative z-10 flex flex-col justify-center px-8 md:px-16 lg:px-20 py-20 lg:py-0">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 claw-border text-xs text-claw-ember mb-8">
              <Activity className="w-3 h-3" />
              Multi-Agent Orchestration Framework
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-foreground mb-6 leading-[0.95] tracking-tight">
              Orchestrate
              <br />
              <span className="gradient-text-claw">Nano-Scale</span>
              <br />
              Agent Swarms.
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-lg mb-10 leading-relaxed">
              Build, deploy, and observe multi-agent workflows with sequential, concurrent, and hierarchical patterns. Real-time streaming. Full observability.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="flex flex-col sm:flex-row items-start gap-4"
          >
            <Link
              to="/console"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg font-semibold text-foreground glow-claw transition-all hover:scale-105"
              style={{ background: "linear-gradient(135deg, hsl(4 80% 40%), hsl(18 85% 36%))" }}
            >
              Launch Console
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="https://github.com/Experimental-Doctrate-Labs/Nano-Claw-Swarms"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg font-semibold text-muted-foreground glass-panel hover:text-foreground transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              View Docs
            </a>
          </motion.div>

          {/* Stats bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="flex items-center gap-10 mt-16 pt-8 border-t border-border/30"
          >
            <StatBlock value="3" label="Workflow Types" delay={0.8} />
            <StatBlock value="∞" label="Agent Scale" delay={0.9} />
            <StatBlock value="<50ms" label="Latency" delay={1.0} />
          </motion.div>
        </div>

        {/* Right: Hero image — cropped dramatic angle */}
        <div className="relative hidden lg:block">
          <motion.div
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="absolute inset-0"
          >
            <img
              src={heroImage}
              alt="Nano Claw Swarms"
              className="w-full h-full object-cover"
              style={{ clipPath: "polygon(12% 0, 100% 0, 100% 100%, 0% 100%)" }}
            />
            <div className="absolute inset-0"
              style={{
                background: "linear-gradient(to right, hsl(240 20% 2%) 0%, transparent 40%), linear-gradient(to top, hsl(240 20% 2%) 0%, transparent 30%)",
                clipPath: "polygon(12% 0, 100% 0, 100% 100%, 0% 100%)",
              }}
            />
          </motion.div>

          {/* Floating glow */}
          <div className="absolute top-1/3 left-1/4 w-[500px] h-[400px] rounded-full animate-pulse-glow pointer-events-none"
            style={{ background: "radial-gradient(ellipse, hsl(18 85% 36% / 0.2), transparent 70%)" }}
          />

          {/* Terminal snippet floating card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.7 }}
            className="absolute bottom-20 left-0 -translate-x-8 glass-panel p-4 max-w-xs z-10"
          >
            <div className="flex items-center gap-2 mb-2">
              <Terminal className="w-3.5 h-3.5 text-claw-ember" />
              <span className="text-xs text-muted-foreground font-mono">run-workflow</span>
            </div>
            <pre className="text-xs font-mono text-foreground/70 leading-relaxed">
{`{
  "workflow": "analysis-v2",
  "agents": 4,
  "status": "streaming..."
}`}
            </pre>
          </motion.div>
        </div>

        {/* Mobile hero image */}
        <div className="relative lg:hidden h-64 -mt-8">
          <img
            src={heroImage}
            alt="Nano Claw Swarms"
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        </div>
      </section>

      {/* Feature cards — staggered bento grid */}
      <section className="relative z-10 py-24 px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="max-w-6xl mx-auto"
        >
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-foreground mb-4"
          >
            Built for <span className="gradient-text-claw">ruthless</span> efficiency.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground mb-12 max-w-lg"
          >
            Every layer of the stack is designed for multi-agent orchestration at nano-scale precision.
          </motion.p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <FeatureCard
              icon={Zap}
              title="Workflows"
              description="Sequential, concurrent, and hierarchical patterns. Build complex multi-agent pipelines with a visual builder."
              delay={0.1}
              className="lg:row-span-1"
            />
            <FeatureCard
              icon={Bot}
              title="Agents"
              description="Configure LLM-powered agents with custom system prompts, tools, memory, and temperature controls."
              delay={0.2}
              className="lg:row-span-1"
            />
            <FeatureCard
              icon={Activity}
              title="Observability"
              description="Real-time streaming output, per-step timing, token usage tracking, and searchable run logs."
              delay={0.3}
              className="md:col-span-2 lg:col-span-1"
            />
          </div>

          {/* Second row — wider cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <FeatureCard
              icon={Layers}
              title="Multi-Org RBAC"
              description="Fine-grained role-based access with owner, admin, member, and viewer tiers. Isolate data per organization."
              delay={0.4}
            />
            <FeatureCard
              icon={Terminal}
              title="Edge Runtime"
              description="Server-side workflow execution on Deno edge functions. Sub-50ms cold starts. Zero infrastructure to manage."
              delay={0.5}
            />
          </div>
        </motion.div>
      </section>

      {/* CTA band */}
      <section className="relative z-10 py-20 px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
            Ready to deploy your swarm?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Spin up your first multi-agent workflow in under five minutes.
          </p>
          <Link
            to="/console"
            className="inline-flex items-center gap-2 px-10 py-4 rounded-lg font-semibold text-foreground glow-claw transition-all hover:scale-105 text-lg"
            style={{ background: "linear-gradient(135deg, hsl(4 80% 40%), hsl(18 85% 36%))" }}
          >
            Open Console
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </section>

      {/* Attribution */}
      <footer className="relative z-10 border-t border-border/30 py-8 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>Nano Claw Swarms — Built on the Swarms framework (Apache-2.0)</p>
          <div className="flex items-center gap-4">
            <Link to="/about" className="hover:text-foreground transition-colors">About &amp; Attribution</Link>
            <a href="https://github.com/Experimental-Doctrate-Labs/Nano-Claw-Swarms" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Upstream Repo</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;

import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Zap, Bot, Activity } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-lobster.jpg";

const FeatureCard = ({ icon: Icon, title, description, delay }: { icon: any; title: string; description: string; delay: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.6 }}
    whileHover={{ scale: 1.03, y: -4 }}
    className="glass-panel p-6 group cursor-pointer relative overflow-hidden"
  >
    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
      style={{ background: "radial-gradient(circle at 50% 50%, hsl(20 100% 58% / 0.08), transparent 70%)" }}
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

const Index = () => {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Grain overlay */}
      <div className="fixed inset-0 grain-overlay animate-grain z-50 pointer-events-none" />

      {/* Hero section */}
      <section className="relative min-h-screen flex items-center justify-center">
        {/* Hero background */}
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Nano Claw Swarms"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
          {/* Orange radial glow */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] rounded-full animate-pulse-glow pointer-events-none"
            style={{ background: "radial-gradient(ellipse, hsl(20 100% 58% / 0.12), transparent 70%)" }}
          />
        </div>

        {/* Nav */}
        <nav className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 md:px-12 py-5">
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

        {/* Hero content */}
        <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 claw-border text-xs text-claw-ember mb-8">
              <Activity className="w-3 h-3" />
              Multi-Agent Orchestration Framework
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight">
              Orchestrate{" "}
              <span className="gradient-text-claw">Nano-Scale</span>
              <br />Agent Swarms.
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Build, deploy, and observe multi-agent workflows with sequential, concurrent, and hierarchical patterns. Real-time streaming. Full observability.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              to="/console"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg font-semibold text-foreground glow-claw transition-all hover:scale-105"
              style={{ background: "linear-gradient(135deg, hsl(8 100% 56%), hsl(20 100% 58%))" }}
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
        </div>
      </section>

      {/* Feature cards */}
      <section className="relative z-10 -mt-32 pb-24 px-6 md:px-12">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard
            icon={Zap}
            title="Workflows"
            description="Sequential, concurrent, and hierarchical patterns. Build complex multi-agent pipelines with a visual builder."
            delay={0.5}
          />
          <FeatureCard
            icon={Bot}
            title="Agents"
            description="Configure LLM-powered agents with custom system prompts, tools, memory, and temperature controls."
            delay={0.65}
          />
          <FeatureCard
            icon={Activity}
            title="Observability"
            description="Real-time streaming output, per-step timing, token usage tracking, and searchable run logs."
            delay={0.8}
          />
        </div>
      </section>

      {/* Attribution */}
      <footer className="relative z-10 border-t border-border/30 py-8 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>Nano Claw Swarms — Built on the Swarms framework (Apache-2.0)</p>
          <div className="flex items-center gap-4">
            <Link to="/about" className="hover:text-foreground transition-colors">About &amp; Attribution</Link>
            <a href="https://github.com/kyegomez/swarms" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Upstream Repo</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;

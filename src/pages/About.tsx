import { BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import logoImage from "@/assets/nano-claw-logo.jpeg";

const About = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="fixed inset-0 grain-overlay animate-grain z-50 pointer-events-none" />
      <div className="max-w-2xl relative z-10">
        <div className="flex items-center gap-2 mb-8">
          <img src={logoImage} alt="Nano Claw" className="w-8 h-8 rounded-lg object-cover claw-border" />
          <span className="text-lg font-bold gradient-text-claw">NANO CLAW SWARMS</span>
        </div>

        <div className="glass-panel p-8 space-y-6">
          <div>
            <h1 className="text-xl font-bold text-foreground mb-2">About &amp; Attribution</h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Nano Claw Swarms is a multi-agent orchestration platform that implements sequential, concurrent, and hierarchical agent patterns for real-world LLM workflows.
            </p>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-foreground mb-2">Open Source Attribution</h2>
            <div className="bg-muted/20 rounded-lg p-4 text-xs text-muted-foreground font-mono leading-relaxed">
              <p className="mb-2">This project builds upon concepts from the Swarms framework.</p>
              <p className="mb-2">
                <strong className="text-foreground">Upstream:</strong>{" "}
                <a href="https://github.com/kyegomez/swarms" target="_blank" rel="noopener noreferrer" className="text-claw-ember hover:underline">
                  github.com/kyegomez/swarms
                </a>
              </p>
              <p className="mb-2"><strong className="text-foreground">License:</strong> Apache License 2.0</p>
              <p>
                Copyright (c) Kye Gomez / Swarms contributors. Licensed under the Apache License, Version 2.0.
                You may obtain a copy of the License at{" "}
                <a href="http://www.apache.org/licenses/LICENSE-2.0" target="_blank" rel="noopener noreferrer" className="text-claw-ember hover:underline">
                  apache.org/licenses/LICENSE-2.0
                </a>
              </p>
            </div>
          </div>

          <Link to="/" className="inline-flex items-center gap-2 text-sm text-claw-ember hover:underline">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default About;

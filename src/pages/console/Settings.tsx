import { Settings as SettingsIcon } from "lucide-react";

const ConsoleSettings = () => {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-1">Settings</h1>
        <p className="text-sm text-muted-foreground">Project configuration</p>
      </div>

      <div className="glass-panel p-6 max-w-lg">
        <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <SettingsIcon className="w-4 h-4 text-claw-ember" />
          General
        </h3>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Project Name</label>
            <input value="Nano Claw Swarms" readOnly
              className="w-full px-3 py-2 rounded-lg bg-input border border-border text-sm text-foreground focus:outline-none" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Theme</label>
            <div className="flex gap-2">
              <div className="px-3 py-1.5 rounded-lg text-xs font-medium claw-border bg-primary/10 text-claw-ember">Ember (Default)</div>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-panel p-6 max-w-lg mt-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">Attribution</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Nano Claw Swarms is built on the{" "}
          <a href="https://github.com/kyegomez/swarms" target="_blank" rel="noopener noreferrer" className="text-claw-ember hover:underline">
            Swarms multi-agent orchestration framework
          </a>{" "}
          by Kye Gomez, licensed under Apache License 2.0. This project implements similar orchestration patterns in TypeScript for web deployment.
        </p>
      </div>
    </div>
  );
};

export default ConsoleSettings;
